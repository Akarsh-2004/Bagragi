import React, { useState, useEffect } from 'react';
import axios from 'axios';

const mockCities = {
  India: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad'],
  France: ['Paris', 'Lyon', 'Marseille'],
  Japan: ['Tokyo', 'Osaka', 'Kyoto'],
  Brazil: ['Rio de Janeiro', 'São Paulo', 'Brasília'],
};

function SearchBar({ onLocationSelect }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [allCountries, setAllCountries] = useState([]);
  const [location, setLocation] = useState('');

  useEffect(() => {
    axios
      .get('https://restcountries.com/v3.1/all?fields=name,capital', {
        headers: { Accept: 'application/json' },
      })
      .then((res) => {
        const countries = res.data.map((country) => ({
          name: country.name.common,
          capital: country.capital?.[0] || 'NA',
        }));
        setAllCountries(countries);
      })
      .catch((err) => console.error('Error fetching countries', err));
  }, []);

  const handleInputChange = (e) => {
    const input = e.target.value;
    setQuery(input);
    setSelectedCountry(null);
    if (input.length > 0) {
      const data = allCountries.filter((c) =>
        c.name.toLowerCase().startsWith(input.toLowerCase())
      );
      setSuggestions(data);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (country) => {
    setSelectedCountry({
      ...country,
      cities: mockCities[country.name] || ['City A', 'City B', 'City C'],
    });
    setQuery(country.name);
    setSuggestions([]);
  };

  const handleLocationClick = (displayLoc) => {
    setLocation(displayLoc);
    onLocationSelect({
      displayLocation: displayLoc,
      imageLocation: selectedCountry.name, // <-- use country for slideshow
    });
  };

  return (
    <div className="w-full mt-20">
      <input
        type="text"
        placeholder="Enter the place you wish to tour.."
        value={query}
        onChange={handleInputChange}
        className="block mx-auto px-5 py-3 w-[350px] border-4 border-black rounded-full bg-white"
      />

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <ul className="w-[350px] mx-auto mt-2 bg-white text-black border-2 border-black rounded-md shadow-md z-10 relative">
          {suggestions.map((country) => (
            <li
              key={country.name}
              className="p-2 hover:bg-blue-100 cursor-pointer"
              onClick={() => handleSelect(country)}
            >
              {country.name}
            </li>
          ))}
        </ul>
      )}

      {/* Location Buttons */}
      {selectedCountry && (
        <>
          <div className="w-[350px] mx-auto mt-4 flex justify-between gap-2">
            <button
              className="flex-1 border border-black p-2 rounded-full font-bold bg-pink-100"
              onClick={() => handleLocationClick(selectedCountry.name)}
            >
              {selectedCountry.name}
            </button>
            <button
              className="flex-1 border border-black p-2 rounded-full font-bold bg-pink-100"
              onClick={() => handleLocationClick(selectedCountry.capital)}
            >
              {selectedCountry.capital}
            </button>
            <select
              className="flex-1 border border-black p-2 rounded-full font-bold bg-pink-100"
              onChange={(e) => handleLocationClick(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>
                Select City
              </option>
              {selectedCountry.cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Map View */}
          {location && (
            <div className="w-[550px] h-[300px] mx-auto mt-4 border-2 border-black rounded-xl overflow-hidden">
              <iframe
                title="map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                src={`https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`}
                allowFullScreen
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SearchBar;
