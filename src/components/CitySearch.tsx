import React, { useState, useEffect, useRef } from 'react';
import { GeocodingResult } from '../types';
import * as Icons from 'lucide-react';

interface CitySearchProps {
  onSelectCity: (city: { name: string; country: string; lat: number; lon: number }) => void;
  isLoading: boolean;
}

const QUICK_CITIES = [
  { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060, code: 'US' },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278, code: 'GB' },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, code: 'JP' },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, code: 'AU' },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, code: 'FR' },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777, code: 'IN' },
];

export default function CitySearch({ onSelectCity, isLoading }: CitySearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch geocoding search results with simple debounce
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`
        );
        const data = await response.json();
        if (data && data.results) {
          setResults(data.results);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error('Geocoding search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (item: GeocodingResult) => {
    onSelectCity({
      name: item.name,
      country: item.country,
      lat: item.latitude,
      lon: item.longitude,
    });
    setQuery('');
    setShowDropdown(false);
  };

  const handleQuickCityClick = (city: typeof QUICK_CITIES[0]) => {
    onSelectCity({
      name: city.name,
      country: city.country,
      lat: city.lat,
      lon: city.lon,
    });
  };

  return (
    <div className="space-y-4 relative z-50">
      {/* Search Bar Input Container */}
      <div ref={dropdownRef} className="relative w-full">
        <div className="relative">
          <input
            type="text"
            className="w-full glass-input rounded-2xl py-3.5 pl-12 pr-10 text-sm font-sans text-white placeholder-zinc-500 focus:outline-none"
            placeholder="Search city code, region, or global metropolis..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
          <Icons.Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500" />
          
          {/* Status icon inside search bar */}
          <div className="absolute right-4 top-4">
            {isSearching || isLoading ? (
              <Icons.Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
            ) : query ? (
              <button onClick={() => setQuery('')} className="hover:text-white text-zinc-500">
                <Icons.X className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Floating Dropdown Autocomplete results */}
        {showDropdown && (query.trim().length >= 2 || results.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
            {results.length > 0 ? (
              <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
                {results.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="w-full text-left px-5 py-3.5 hover:bg-white/5 flex items-center justify-between transition-colors duration-150"
                  >
                    <div className="flex items-center gap-3">
                      <Icons.MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
                      <div>
                        <span className="text-sm font-medium text-white">{item.name}</span>
                        {item.admin1 && (
                          <span className="text-xs text-zinc-500 ml-1.5">
                            {item.admin1}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-medium text-zinc-400 uppercase bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                      {item.country_code || item.country}
                    </span>
                  </button>
                ))}
              </div>
            ) : !isSearching ? (
              <div className="px-5 py-4 text-sm text-zinc-500 flex items-center gap-2">
                <Icons.Info className="w-4 h-4 text-zinc-600" />
                No matching cities found. Try spelling code or exact name.
              </div>
            ) : (
              <div className="px-5 py-4 text-sm text-zinc-500 flex items-center gap-2">
                <Icons.Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
                Locating geo-coordinates...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Cities Presets Grid */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-xs font-mono text-zinc-500 mr-2 uppercase tracking-wider">Metros:</span>
        {QUICK_CITIES.map((city) => (
          <button
            key={city.name}
            onClick={() => handleQuickCityClick(city)}
            className="text-xs font-medium text-zinc-400 bg-white/[0.03] border border-white/[0.05] hover:border-white/20 hover:text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all duration-200"
          >
            <Icons.MapPin className="w-3 h-3 opacity-60" />
            {city.name}
          </button>
        ))}
      </div>
    </div>
  );
}
