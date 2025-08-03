import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Search, XCircle, Loader2, Globe, MapPin, Plus } from 'lucide-react';

function SearchBar({ onLocationSelect }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [allCountries, setAllCountries] = useState([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [countryFetchError, setCountryFetchError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [customLocationMode, setCustomLocationMode] = useState(false);

  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Sample popular cities for quick suggestions
  const popularCities = [
    'Paris', 'London', 'New York', 'Tokyo', 'Rome', 'Barcelona', 'Amsterdam', 'Dubai',
    'Istanbul', 'Bangkok', 'Sydney', 'Los Angeles', 'Berlin', 'Vienna', 'Prague',
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Goa',
    'Shanghai', 'Beijing', 'Hong Kong', 'Singapore', 'Seoul', 'Osaka', 'Kyoto',
    'Cairo', 'Cape Town', 'Marrakech', 'Casablanca', 'Lagos', 'Nairobi', 'Johannesburg',
    'São Paulo', 'Rio de Janeiro', 'Buenos Aires', 'Lima', 'Bogotá', 'Santiago',
    'Toronto', 'Vancouver', 'Montreal', 'Mexico City', 'Cancún', 'Guadalajara',
    'Moscow', 'St. Petersburg', 'Warsaw', 'Budapest', 'Athens', 'Lisbon', 'Madrid',
    'Stockholm', 'Oslo', 'Copenhagen', 'Helsinki', 'Zurich', 'Geneva', 'Brussels'
  ];

  // Effect to fetch all countries once on component mount
  useEffect(() => {
    const fetchCountries = async () => {
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
      } catch (err) {
        console.error('Error fetching countries:', err);
        setCountryFetchError('Failed to load countries. You can still search for any location.');
      } finally {
        setIsLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  // Dynamic search that combines countries, capitals, and popular cities
  const handleInputChange = useCallback((e) => {
    const input = e.target.value;
    setQuery(input);
    setSelectedCountry(null);
    setFocusedIndex(-1);
    setCustomLocationMode(false);

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
      const searchTerm = input.toLowerCase();
      const filtered = [];

      // Add matching countries
      allCountries.forEach(country => {
        if (country.name.toLowerCase().includes(searchTerm)) {
          filtered.push({
            type: 'country',
            name: country.name,
            display: country.name,
            imageRef: country.name,
            capital: country.capital
          });
        }
        // Add matching capitals
        if (country.capital !== 'N/A' && country.capital.toLowerCase().includes(searchTerm)) {
          filtered.push({
            type: 'capital',
            name: country.capital,
            display: country.capital,
            imageRef: country.name, // Use country name for images
            country: country.name
          });
        }
      });

      // Add matching popular cities
      popularCities.forEach(city => {
        if (city.toLowerCase().includes(searchTerm)) {
          filtered.push({
            type: 'city',
            name: city,
            display: city,
            imageRef: city, // Use city name for images
            category: 'Popular City'
          });
        }
      });

      // Remove duplicates and sort
      const uniqueFiltered = filtered.filter((item, index, self) => 
        index === self.findIndex(t => t.name === item.name && t.type === item.type)
      ).sort((a, b) => {
        // Prioritize exact matches
        const aExact = a.name.toLowerCase() === searchTerm;
        const bExact = b.name.toLowerCase() === searchTerm;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // Then prioritize starts with
        const aStarts = a.name.toLowerCase().startsWith(searchTerm);
        const bStarts = b.name.toLowerCase().startsWith(searchTerm);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        return a.name.localeCompare(b.name);
      });

      // Limit to 15 suggestions for performance
      setSuggestions(uniqueFiltered.slice(0, 15));
      setShowSuggestions(true);
      setIsLoadingSuggestions(false);
    }, 300);
  }, [allCountries, popularCities]);

  const handleSelectLocation = (selectedItem) => {
    console.log('Selected location:', selectedItem);
    setQuery(selectedItem.display);
    setSuggestions([]);
    setShowSuggestions(false);
    setCustomLocationMode(false);
    inputRef.current.focus();

    // For countries, show additional options
    if (selectedItem.type === 'country') {
      const countryObj = allCountries.find(c => c.name === selectedItem.name);
      if (countryObj) {
        setSelectedCountry({
          ...countryObj,
          cities: [] // No predefined cities, but we can still search
        });
      }
    } else {
      setSelectedCountry(null);
    }

    onLocationSelect({
      displayLocation: selectedItem.display,
      imageLocation: selectedItem.imageRef
    });
  };

  const handleCustomSearch = () => {
    if (query.trim()) {
      console.log('Custom search for:', query.trim());
      const customLocation = {
        type: 'custom',
        name: query.trim(),
        display: query.trim(),
        imageRef: query.trim()
      };
      handleSelectLocation(customLocation);
    }
  };

  const handleLocationClick = (locationName) => {
    setQuery(locationName);
    const locationObj = {
      display: locationName,
      imageRef: locationName,
      type: 'custom',
      name: locationName
    };
    handleSelectLocation(locationObj);
  };

  const handleClearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setSelectedCountry(null);
    setShowSuggestions(false);
    setFocusedIndex(-1);
    setCustomLocationMode(false);
    onLocationSelect({ displayLocation: '', imageLocation: '' });
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
          handleCustomSearch();
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        inputRef.current.blur();
      }
    } else if (e.key === 'Enter' && query.trim() !== '') {
      e.preventDefault();
      handleCustomSearch();
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
          placeholder={isLoadingCountries ? "Loading destinations..." : "Search for any city, country, or destination..."}
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.length > 0) {
              handleInputChange({ target: { value: query } });
            }
          }}
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
        {query.trim() && !showSuggestions && (
          <button
            onClick={handleCustomSearch}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors ml-2 bg-blue-50"
            aria-label="Search for this location"
            title="Search for this location"
          >
            <Plus size={20} className="text-blue-600" />
          </button>
        )}
      </div>

      {countryFetchError && (
        <p className="text-orange-500 text-sm mt-2 text-center">{countryFetchError}</p>
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
            <li className="p-4 text-center text-gray-500">
              <div>No matching destinations found.</div>
              <button
                onClick={handleCustomSearch}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors mx-auto"
              >
                <Plus size={16} />
                Search for "{query}" anyway
              </button>
            </li>
          )}
          {!isLoadingSuggestions && suggestions.length > 0 && suggestions.map((loc, index) => (
            <li
              key={`${loc.type}-${loc.name}`}
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
              ) : loc.type === 'capital' ? (
                <MapPin size={18} className="text-purple-500 mr-2" />
              ) : (
                <MapPin size={18} className="text-green-500 mr-2" />
              )}
              <div className="flex-grow">
                <span className="text-gray-800 font-medium">{loc.display}</span>
                {loc.type === 'capital' && (
                  <span className="text-gray-500 text-sm ml-2">(Capital of {loc.country})</span>
                )}
                {loc.type === 'country' && loc.capital !== 'N/A' && (
                  <span className="text-gray-500 text-sm ml-2">(Capital: {loc.capital})</span>
                )}
                {loc.type === 'city' && loc.category && (
                  <span className="text-gray-500 text-sm ml-2">({loc.category})</span>
                )}
              </div>
            </li>
          ))}
          {!isLoadingSuggestions && suggestions.length > 0 && query.trim() && (
            <li className="border-t border-gray-100">
              <button
                onClick={handleCustomSearch}
                className="w-full flex items-center gap-2 p-3 text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Plus size={18} />
                <span>Search for "{query}" exactly</span>
              </button>
            </li>
          )}
        </ul>
      )}

      {selectedCountry && (
        <div className="w-full mx-auto mt-4 p-4 bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 text-white">
          <h3 className="text-xl font-semibold mb-3 text-center">Explore {selectedCountry.name}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <button
              className="flex-1 bg-blue-500/20 border border-blue-400/30 text-white p-3 rounded-lg font-bold hover:bg-blue-500/30 transition-all duration-200"
              onClick={() => handleLocationClick(selectedCountry.name)}
            >
              {selectedCountry.name}
            </button>
            {selectedCountry.capital !== 'N/A' && (
              <button
                className="flex-1 bg-purple-500/20 border border-purple-400/30 text-white p-3 rounded-lg font-bold hover:bg-purple-500/30 transition-all duration-200"
                onClick={() => handleLocationClick(selectedCountry.capital)}
              >
                {selectedCountry.capital}
              </button>
            )}
          </div>

          {/* Map View */}
          {query && (
            <div className="w-full h-[300px] border-2 border-white/30 rounded-xl overflow-hidden shadow-inner">
              <iframe
                title="map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
                allowFullScreen
                loading="lazy"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;