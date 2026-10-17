import React, { useState, useEffect, useRef } from 'react';
import { MAP_CONFIG } from './mapConfig';
import { Search, Loader2, AlertCircle, MapPin, X } from 'lucide-react';

export const PlaceSearch = ({ onSelectPlace, placeholder = 'Search city, town, or landmark (e.g. Sulur, Coimbatore)...' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced geocoding search
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 3) {
      setResults([]);
      setError(null);
      setLoading(false);
      setIsOpen(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(trimmed);
    }, MAP_CONFIG.GEOCODING.DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  const performSearch = async (searchTerm) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, MAP_CONFIG.GEOCODING.TIMEOUT_MS);

    try {
      const url = new URL(MAP_CONFIG.GEOCODING.SEARCH_URL);
      url.searchParams.set('q', searchTerm);
      url.searchParams.set('format', 'json');
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('limit', '5');
      url.searchParams.set('countrycodes', MAP_CONFIG.GEOCODING.COUNTRY_CODES);
      url.searchParams.set('viewbox', MAP_CONFIG.GEOCODING.VIEWBOX);

      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'en',
          // Note: Nominatim requires identifiable user-agent when called server-side
        },
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        throw new Error('Geocoding rate limit reached. Please wait a moment or enter coordinates manually.');
      }

      if (!response.ok) {
        throw new Error(`Geocoding service unavailable (${response.status}). Please enter coordinates manually.`);
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        setError('No locations found matching your search. You can enter exact coordinates manually below.');
        setResults([]);
        setIsOpen(true);
      } else {
        setResults(data);
        setIsOpen(true);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Search request timed out. Please check your connection or enter coordinates manually.');
      } else {
        setError(err.message || 'Geocoding request failed. Manual coordinate entry is available.');
      }
      setResults([]);
      setIsOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setQuery(item.display_name.split(',')[0]);
    setIsOpen(false);

    if (onSelectPlace && typeof onSelectPlace === 'function') {
      onSelectPlace({
        lat,
        lng,
        displayName: item.display_name,
        address: item.address,
      });
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setError(null);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0 || error) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {error ? (
            <div className="p-3 text-xs text-amber-800 bg-amber-50 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{error}</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Manual latitude/longitude entry below remains fully functional.
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {results.map((item) => (
                <li
                  key={item.place_id}
                  onClick={() => handleSelect(item)}
                  className="p-3 hover:bg-emerald-50 cursor-pointer flex items-start space-x-2 text-slate-700 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-xs text-slate-900 leading-snug">
                      {item.display_name.split(',').slice(0, 3).join(', ')}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {item.display_name}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
