import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { searchLocation, LocationData } from '../services/geolocation';

interface LocationSearchProps {
  onLocationSelect: (location: LocationData) => void;
}

export default function LocationSearch({ onLocationSelect }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const locations = await searchLocation(query);
      setResults(locations);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectLocation = (location: LocationData) => {
    onLocationSelect(location);
    setShowResults(false);
    setQuery('');
    setResults([]);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search city, state, zip code..."
            className="w-full px-3 py-2 md:px-4 md:py-3 pl-9 md:pl-10 bg-slate-800 text-white text-sm md:text-base rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
          <Search className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="px-4 py-2 md:px-6 md:py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm md:text-base font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl max-h-64 md:max-h-96 overflow-y-auto">
          {results.map((location, index) => (
            <button
              key={index}
              onClick={() => handleSelectLocation(location)}
              className="w-full px-3 py-2 md:px-4 md:py-3 text-left hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0"
            >
              <div className="flex items-start gap-2 md:gap-3">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-emerald-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm md:text-base font-semibold">
                    {location.city && `${location.city}, `}
                    {location.state_province && `${location.state_province}, `}
                    {location.country}
                  </p>
                  <p className="text-xs md:text-sm text-slate-400">
                    {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && !isSearching && (
        <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-3 md:p-4">
          <p className="text-slate-400 text-center text-sm md:text-base">No locations found</p>
        </div>
      )}
    </div>
  );
}
