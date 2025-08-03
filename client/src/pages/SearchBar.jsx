import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Search, XCircle, Loader2, Globe, MapPin } from 'lucide-react'; // Added MapPin icon for cities

// Mock cities data - in a real app, this would likely be fetched dynamically
const mockCities = {
  India: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'],
  France: ['Paris', 'Lyon', 'Marseille', 'Nice', 'Bordeaux', 'Toulouse'],
  Japan: ['Tokyo', 'Osaka', 'Kyoto', 'Sapporo', 'Fukuoka'],
  Brazil: ['Rio de Janeiro', 'São Paulo', 'Brasília', 'Salvador', 'Fortaleza'],
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
  Canada: ['Toronto', 'Vancouver', 'Montreal', 'Calgary'],
  Australia: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'],
  Germany: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt'],
  Italy: ['Rome', 'Milan', 'Florence', 'Venice'],
  Spain: ['Madrid', 'Barcelona', 'Valencia', 'Seville'],
};

function SearchBar({ onLocationSelect }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [allCountries, setAllCountries] = useState([]);
  const [allSearchableLocations, setAllSearchableLocations] = useState([]); // New state for combined search data
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [countryFetchError, setCountryFetchError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Effect to fetch all countries once on component mount and build combined search data
  useEffect(() => {
    const fetchAndCombineLocations = async () => {
      setIsLoadingCountries(true);
      setCountryFetchError('');
      try {
        const res = await axios.get('https://restcountries.com/v3.1/all?fields=name,capital', {
          headers: { Accept: 'application/json' },
        });
        const fetchedCountries = res.data.map((country) => ({
          name: country.name.common,
          capital: country.capital?.[0] || 'N/A',
        })).sort((a, b) => a.name.localeCompare(b.name));
        setAllCountries(fetchedCountries);

        // Build the combined list of searchable locations (countries and cities)
        const combined = [...fetchedCountries.map(c => ({
          type: 'country',
          name: c.name,
          capital: c.capital,
          display: c.name,
          imageRef: c.name // Image reference is the country name
        }))];

        Object.entries(mockCities).forEach(([countryName, cities]) => {
          cities.forEach(city => {
            combined.push({
              type: 'city',
              name: city,
              country: countryName, // Link back to parent country
              display: city,
              imageRef: countryName // Image reference is the parent country name
            });
          });
        });

        // Sort the combined list for consistent suggestions
        combined.sort((a, b) => a.display.localeCompare(b.display));
        setAllSearchableLocations(combined);

      } catch (err) {
        console.error('Error fetching countries:', err);
        setCountryFetchError('Failed to load countries. Please try again later.');
      } finally {
        setIsLoadingCountries(false);
      }
    };
    fetchAndCombineLocations();
  }, []); // Empty dependency array means this runs once on mount

  // Debounced input change handler
  const handleInputChange = useCallback((e) => {
    const input = e.target.value;
    setQuery(input);
    setSelectedCountry(null); // Clear selected country when typing
    setFocusedIndex(-1); // Reset focus when typing

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (input.length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    debounceTimeoutRef.current = setTimeout(() => {
      const filtered = allSearchableLocations.filter((loc) =>
        loc.display.toLowerCase().includes(input.toLowerCase()) // Use .includes for broader search
      );
      console.log('Search query:', input, 'Filtered results:', filtered.length);
      setSuggestions(filtered);
      setShowSuggestions(true);
      setIsLoadingSuggestions(false);
    }, 300); // 300ms debounce delay
  }, [allSearchableLocations]); // Depends on allSearchableLocations

  const handleSelectLocation = (selectedItem) => {
    console.log('Selected location:', selectedItem);
    setQuery(selectedItem.display);
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current.focus(); // Keep focus on input after selection

    let countryObjectForDisplay = null;
    if (selectedItem.type === 'country') {
      countryObjectForDisplay = selectedItem;
    } else if (selectedItem.type === 'city') {
      // Find the full country object from allCountries based on the city's country property
      countryObjectForDisplay = allCountries.find(c => c.name === selectedItem.country);
    }

    if (countryObjectForDisplay) {
      setSelectedCountry({
        ...countryObjectForDisplay,
        // Ensure cities array is from mockCities for the selected country
        cities: mockCities[countryObjectForDisplay.name] || [],
      });
      console.log('Calling onLocationSelect with:', {
        displayLocation: selectedItem.display,
        imageLocation: selectedItem.imageRef
      });
      onLocationSelect({
        displayLocation: selectedItem.display, // This is the actual text to display (country or city)
        imageLocation: selectedItem.imageRef, // This is always the country name for the slideshow
      });
    } else {
      console.error("Could not find country details for selected item:", selectedItem);
      setSelectedCountry(null);
      onLocationSelect({ displayLocation: selectedItem.display, imageLocation: '' });
    }
  };

  const handleLocationClick = (locationName, countryName) => {
    setQuery(locationName);
    
    // Create a location object similar to what handleSelectLocation expects
    const locationObj = {
      display: locationName,
      imageRef: countryName, // Use country name for image reference
      type: locationName === countryName ? 'country' : 'city',
      country: countryName
    };
    
    handleSelectLocation(locationObj);
  };

  const handleClearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setSelectedCountry(null);
    setShowSuggestions(false);
    setFocusedIndex(-1);
    onLocationSelect({ displayLocation: '', imageLocation: '' }); // Clear selected location in Home
    inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (focusedIndex !== -1 && suggestions[focusedIndex]) {
          handleSelectLocation(suggestions[focusedIndex]);
        } else if (query.trim() !== '') {
          // If Enter is pressed and no suggestion is focused, try to match current query
          const exactMatch = allSearchableLocations.find(loc =>
            loc.display.toLowerCase() === query.toLowerCase()
          );
          if (exactMatch) {
            handleSelectLocation(exactMatch);
          }
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        inputRef.current.blur(); // Remove focus from input
      }
    } else if (e.key === 'Enter' && query.trim() !== '') {
        // Allow pressing Enter on the input field directly to select an exact match
        const exactMatch = allSearchableLocations.find(loc =>
            loc.display.toLowerCase() === query.toLowerCase()
        );
        if (exactMatch) {
            handleSelectLocation(exactMatch);
        }
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
        inputRef.current && !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <div className="relative w-full">
      <div className="flex items-center bg-white rounded-full p-2 shadow-md border border-gray-200">
        <div className="px-3">
          <Search size={20} className="text-gray-500" />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder={isLoadingCountries ? "Loading destinations..." : "Search for a country or city..."}
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length > 0 && setSuggestions(
            allSearchableLocations.filter((loc) => loc.display.toLowerCase().includes(query.toLowerCase()))
          ) && setShowSuggestions(true)} // Show suggestions on focus if query exists
          onKeyDown={handleKeyDown}
          className="flex-grow p-2 outline-none text-gray-800 text-lg bg-transparent placeholder-gray-400"
          disabled={isLoadingCountries}
          aria-autocomplete="list"
          aria-controls="location-suggestions"
          aria-activedescendant={focusedIndex !== -1 ? `suggestion-${focusedIndex}` : undefined}
        />
        {query && (
          <button
            onClick={handleClearSearch}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Clear search"
          >
            <XCircle size={20} className="text-gray-500" />
          </button>
        )}
      </div>

      {countryFetchError && (
        <p className="text-red-500 text-sm mt-2 text-center">{countryFetchError}</p>
      )}

      {showSuggestions && (query.trim() !== '' || isLoadingSuggestions) && (
        <ul
          id="location-suggestions"
          role="listbox"
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-30 max-h-60 overflow-y-auto custom-scrollbar"
        >
          {isLoadingSuggestions && (
            <li className="p-4 text-center text-gray-500 flex items-center justify-center">
              <Loader2 className="animate-spin h-5 w-5 mr-2" /> Searching...
            </li>
          )}
          {!isLoadingSuggestions && suggestions.length === 0 && query.trim() !== '' && (
            <li className="p-4 text-center text-gray-500">No matching destinations found.</li>
          )}
          {!isLoadingSuggestions && suggestions.length > 0 && suggestions.map((loc, index) => (
            <li
              key={`${loc.type}-${loc.name}`} // Unique key for combined list
              id={`suggestion-${index}`}
              role="option"
              aria-selected={focusedIndex === index}
              className={`flex items-center p-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                focusedIndex === index ? 'bg-blue-100' : ''
              }`}
              onClick={() => handleSelectLocation(loc)}
            >
              {loc.type === 'country' ? (
                <Globe size={18} className="text-blue-500 mr-2" />
              ) : (
                <MapPin size={18} className="text-green-500 mr-2" />
              )}
              <span className="text-gray-800 font-medium">{loc.display}</span>
              {loc.type === 'city' && (
                <span className="text-gray-500 text-sm ml-2">({loc.country})</span>
              )}
              {loc.type === 'country' && loc.capital !== 'N/A' && (
                <span className="text-gray-500 text-sm ml-2">({loc.capital})</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {selectedCountry && (
        <div className="w-full mx-auto mt-4 p-4 bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 text-white">
          <h3 className="text-xl font-semibold mb-3 text-center">Explore {selectedCountry.name}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            <button
              className="flex-1 bg-blue-500/20 border border-blue-400/30 text-white p-3 rounded-lg font-bold hover:bg-blue-500/30 transition-all duration-200"
              onClick={() => handleLocationClick(selectedCountry.name, selectedCountry.name)}
            >
              {selectedCountry.name}
            </button>
            {selectedCountry.capital !== 'N/A' && (
              <button
                className="flex-1 bg-purple-500/20 border border-purple-400/30 text-white p-3 rounded-lg font-bold hover:bg-purple-500/30 transition-all duration-200"
                onClick={() => handleLocationClick(selectedCountry.capital, selectedCountry.name)}
              >
                {selectedCountry.capital}
              </button>
            )}
            {selectedCountry.cities && selectedCountry.cities.length > 0 && (
              <select
                className="flex-1 bg-green-500/20 border border-green-400/30 text-white p-3 rounded-lg font-bold hover:bg-green-500/30 transition-all duration-200 appearance-none cursor-pointer"
                onChange={(e) => handleLocationClick(e.target.value, selectedCountry.name)}
                defaultValue=""
              >
                <option value="" disabled className="text-gray-700 bg-white">
                  Select a City
                </option>
                {selectedCountry.cities.map((city) => (
                  <option key={city} value={city} className="text-gray-800 bg-white">
                    {city}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Map View - now uses the current query for the map */}
          {query && (
            <div className="w-full h-[300px] border-2 border-white/30 rounded-xl overflow-hidden shadow-inner">
              <iframe
                title="map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
                allowFullScreen
                loading="lazy" // Improves performance by deferring loading
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
