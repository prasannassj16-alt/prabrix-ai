import React, { useState, useEffect, useCallback } from 'react';
import { fetchNearbyAmenities } from '../../services/overpassService';
import { OVERPASS_CONFIG } from '../../config/overpassConfig';
import {
  MapPin,
  Compass,
  RefreshCw,
  Clock,
  ExternalLink,
  AlertTriangle,
  Layers,
  Car,
  Train,
  Bus,
  Hospital,
  GraduationCap,
  Building,
  Fuel,
  ShoppingBag,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const NearbyAmenitiesView = ({
  latitude,
  longitude,
  propertyName = 'Land Parcel',
  district = 'Tamil Nadu',
}) => {
  const [radiusMeters, setRadiusMeters] = useState(5000); // 5km default
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const lat = Number(latitude);
  const lng = Number(longitude);
  const hasValidCoordinates = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

  const loadAmenities = useCallback(
    async (force = false) => {
      if (!hasValidCoordinates) {
        setIsLoading(false);
        setError('Valid geographic coordinates are required to query nearby amenities.');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchNearbyAmenities(lat, lng, {
          radiusMeters,
          category: selectedCategory,
          forceRefresh: force,
          allowFallback: true,
        });
        setData(result);
      } catch (err) {
        setError(err.message || 'Failed to retrieve nearby amenities from OpenStreetMap.');
      } finally {
        setIsLoading(false);
      }
    },
    [lat, lng, radiusMeters, selectedCategory, hasValidCoordinates]
  );

  useEffect(() => {
    // Debounced query execution
    const timer = setTimeout(() => {
      loadAmenities();
    }, OVERPASS_CONFIG.DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [loadAmenities]);

  // Amenity icon mapping
  const getAmenityIcon = (type) => {
    switch (type) {
      case 'road':
        return <Car className="w-4 h-4 text-blue-600" />;
      case 'railway':
        return <Train className="w-4 h-4 text-purple-600" />;
      case 'transit':
        return <Bus className="w-4 h-4 text-amber-600" />;
      case 'healthcare':
        return <Hospital className="w-4 h-4 text-red-600" />;
      case 'education':
        return <GraduationCap className="w-4 h-4 text-emerald-600" />;
      case 'civic':
        return <Building className="w-4 h-4 text-slate-600" />;
      case 'fuel':
        return <Fuel className="w-4 h-4 text-orange-600" />;
      case 'market':
        return <ShoppingBag className="w-4 h-4 text-pink-600" />;
      default:
        return <Compass className="w-4 h-4 text-slate-500" />;
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'transport':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'civic':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'commercial':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (!hasValidCoordinates) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center space-y-2">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
        <h4 className="text-sm font-bold text-slate-800">Geospatial Coordinates Missing</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Precise GPS coordinates are required to query nearby roads and infrastructure from OpenStreetMap.
        </p>
      </div>
    );
  }

  const items = data?.items || [];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-emerald-700" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Nearby Roads & Infrastructure Lookup
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time geospatial inquiry around coordinates ({lat.toFixed(4)}° N, {lng.toFixed(4)}° E)
          </p>
        </div>

        {/* Refresh & Cache Controls */}
        <div className="flex items-center space-x-2">
          {data?.retrievedAtFormatted && (
            <div className="flex items-center space-x-1 text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 font-mono">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Retrieved: {data.retrievedAtFormatted}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => loadAmenities(true)}
            disabled={isLoading}
            className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            title="Refresh lookup directly from Overpass"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Radius Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
        {/* Category Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto">
          {[
            { id: 'all', label: 'All Amenities' },
            { id: 'transport', label: 'Roads & Transit' },
            { id: 'civic', label: 'Civic & Health' },
            { id: 'commercial', label: 'Commercial' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Radius Buttons */}
        <div className="flex items-center space-x-1 self-end sm:self-auto">
          <span className="text-[11px] font-semibold text-slate-500 mr-1">Search Radius:</span>
          {OVERPASS_CONFIG.ALLOWED_RADII_METERS.map((r) => {
            const km = r / 1000;
            const isSelected = radiusMeters === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRadiusMeters(r)}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-colors ${
                  isSelected
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {km} km
              </button>
            );
          })}
        </div>
      </div>

      {/* Fallback Notice when network mirror is offline */}
      {data?.isFallbackDemo && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start space-x-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Offline / Fallback Mode:</span> {data.notice}
          </div>
        </div>
      )}

      {/* Main Content Area: Loading, Error, No-Results, or Item List */}
      {isLoading ? (
        <div className="py-12 text-center space-y-3">
          <RefreshCw className="w-7 h-7 text-emerald-700 animate-spin mx-auto" />
          <div className="text-xs font-bold text-slate-700">
            Querying OpenStreetMap Overpass Interpreter...
          </div>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
            Extracting highways, stations, healthcare, and educational nodes within a {radiusMeters / 1000} km aerial radius.
          </p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2">
          <AlertTriangle className="w-6 h-6 text-rose-600 mx-auto" />
          <div className="text-xs font-bold text-rose-900">{error}</div>
          <button
            type="button"
            onClick={() => loadAmenities(true)}
            className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-700 rounded-lg hover:bg-rose-800 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Query</span>
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="py-10 text-center space-y-2 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
          <Compass className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="text-xs font-bold text-slate-700">
            No nearby amenities found within {radiusMeters / 1000} km
          </div>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            Try expanding the search radius to 5 km or 10 km to identify regional transport links and civic nodes.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* List of nearby elements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-sm flex items-start space-x-3 text-xs"
              >
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex-shrink-0 mt-0.5">
                  {getAmenityIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-slate-900 truncate" title={item.name}>
                      {item.name}
                    </span>
                    {/* Explicit Straight-line Distance Labeling */}
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-200 flex-shrink-0 whitespace-nowrap">
                      {item.distanceKm} km (straight-line)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="capitalize">{item.detail}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border ${getCategoryBadgeClass(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mandatory Attribution & Distance Labeling Footer */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
        <div className="flex items-center space-x-1.5">
          <span className="font-semibold text-slate-700">Source:</span>
          <span>{data?.source || OVERPASS_CONFIG.ATTRIBUTION.source}</span>
          <a
            href={OVERPASS_CONFIG.ATTRIBUTION.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 hover:underline inline-flex items-center space-x-0.5"
          >
            <span>&copy; OSM Contributors</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>

        <div className="font-semibold text-slate-600 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200">
          Metric: {OVERPASS_CONFIG.ATTRIBUTION.distanceType}
        </div>
      </div>
    </div>
  );
};

export default NearbyAmenitiesView;
