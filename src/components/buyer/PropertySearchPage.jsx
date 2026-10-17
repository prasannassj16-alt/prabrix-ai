import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { listingService } from '../../services/listingService';
import { convertArea } from '../../services/areaConverter';
import { getDistrictNames, getTaluksByDistrict } from '../../data/tnLocations';
import { PropertyCard } from './PropertyCard';
import { ListingsMap } from '../map/ListingsMap';
import { FloatingCompareBar } from './FloatingCompareBar';
import {
  Search,
  Filter,
  MapPin,
  SlidersHorizontal,
  LayoutGrid,
  Map as MapIcon,
  Columns,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  X,
  Droplets,
  Zap,
} from 'lucide-react';

export const PropertySearchPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Layout View Mode: 'split' | 'grid' | 'map'
  const [viewMode, setViewMode] = useState('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [district, setDistrict] = useState('all');
  const [taluk, setTaluk] = useState('all');
  const [propertyType, setPropertyType] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');
  const [areaUnit, setAreaUnit] = useState('cent'); // Tamil Nadu cent default
  const [roadType, setRoadType] = useState('any');
  const [minRoadWidth, setMinRoadWidth] = useState('');
  const [waterSource, setWaterSource] = useState('any');
  const [electricityConnected, setElectricityConnected] = useState(false);
  const [soilType, setSoilType] = useState('any');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const districts = getDistrictNames();
  const taluks = district !== 'all' ? getTaluksByDistrict(district) : [];

  // Reset taluk if district changes
  const handleDistrictChange = (e) => {
    setDistrict(e.target.value);
    setTaluk('all');
  };

  // Convert area range to square feet for backend filtering
  const convertedMinAreaSqft = useMemo(() => {
    if (!minArea || isNaN(Number(minArea))) return '';
    return convertArea(Number(minArea), areaUnit, 'sq_ft', 0);
  }, [minArea, areaUnit]);

  const convertedMaxAreaSqft = useMemo(() => {
    if (!maxArea || isNaN(Number(maxArea))) return '';
    return convertArea(Number(maxArea), areaUnit, 'sq_ft', 0);
  }, [maxArea, areaUnit]);

  // Execute Search with All Active Filters
  const filteredListings = useMemo(() => {
    const filters = {
      q: searchTerm,
      district,
      taluk,
      property_type: propertyType,
      min_price: minPrice,
      max_price: maxPrice,
      min_area_sqft: convertedMinAreaSqft,
      max_area_sqft: convertedMaxAreaSqft,
      road_type: roadType,
      min_road_width: minRoadWidth,
      water_source: waterSource,
      electricity_connected: electricityConnected ? true : undefined,
      soil_type: soilType,
      is_verified: verifiedOnly ? true : undefined,
    };

    return listingService.searchListings(filters, sortBy);
  }, [
    searchTerm,
    district,
    taluk,
    propertyType,
    minPrice,
    maxPrice,
    convertedMinAreaSqft,
    convertedMaxAreaSqft,
    roadType,
    minRoadWidth,
    waterSource,
    electricityConnected,
    soilType,
    verifiedOnly,
    sortBy,
  ]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (district !== 'all') count++;
    if (taluk !== 'all') count++;
    if (propertyType !== 'all') count++;
    if (minPrice || maxPrice) count++;
    if (minArea || maxArea) count++;
    if (roadType !== 'any') count++;
    if (minRoadWidth) count++;
    if (waterSource !== 'any') count++;
    if (electricityConnected) count++;
    if (soilType !== 'any') count++;
    if (verifiedOnly) count++;
    return count;
  }, [
    district,
    taluk,
    propertyType,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    roadType,
    minRoadWidth,
    waterSource,
    electricityConnected,
    soilType,
    verifiedOnly,
  ]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setDistrict('all');
    setTaluk('all');
    setPropertyType('all');
    setMinPrice('');
    setMaxPrice('');
    setMinArea('');
    setMaxArea('');
    setRoadType('any');
    setMinRoadWidth('');
    setWaterSource('any');
    setElectricityConnected(false);
    setSoilType('any');
    setVerifiedOnly(false);
    setSortBy('newest');
  };

  const propertyTypes = [
    { id: 'all', label: 'All Land' },
    { id: 'agricultural', label: 'Agricultural' },
    { id: 'residential', label: 'Residential Plots' },
    { id: 'commercial', label: 'Commercial' },
    { id: 'industrial', label: 'Industrial' },
    { id: 'mixed_use', label: 'Mixed Use' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 w-full min-w-0">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Tamil Nadu Land Marketplace
            </span>
            <span className="text-xs text-slate-500">
              {filteredListings.length} {filteredListings.length === 1 ? 'Parcel' : 'Parcels'} Available
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Discover Verified Land Parcels
          </h1>
        </div>

        {/* Layout View Toggles */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Grid Cards View"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              viewMode === 'split'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Split Map + List View"
          >
            <Columns className="w-4 h-4" />
            <span className="hidden sm:inline">Split</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              viewMode === 'map'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Full Map View"
          >
            <MapIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Map</span>
          </button>
        </div>
      </div>

      {/* Primary Search & Fast Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Keyword Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by village, taluk, survey number, title, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick District Select */}
          <div className="w-full sm:w-48">
            <select
              value={district}
              onChange={handleDistrictChange}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:border-emerald-600"
            >
              <option value="all">All TN Districts</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl border transition-colors ${
              activeFiltersCount > 0
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[10px] flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="w-full sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:border-emerald-600 font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="area_asc">Area: Small to Large</option>
              <option value="area_desc">Area: Large to Small</option>
              <option value="rate_asc">Rate / Sq.Ft: Low to High</option>
            </select>
          </div>
        </div>

        {/* Property Type Category Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 text-xs">
          {propertyTypes.map((pt) => {
            const isSelected = propertyType === pt.id;
            return (
              <button
                key={pt.id}
                type="button"
                onClick={() => setPropertyType(pt.id)}
                className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {pt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded Advanced Filters Panel */}
      {isFilterOpen && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>Advanced Property Filters</span>
            </h3>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* Taluk Selection */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Taluk (Jurisdiction)</label>
              <select
                value={taluk}
                onChange={(e) => setTaluk(e.target.value)}
                disabled={district === 'all'}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="all">All Taluks in District</option>
                {taluks.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Price Range (INR)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>
            </div>

            {/* Area Range + Unit */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-600 font-semibold">Area Range</label>
                <select
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value)}
                  className="text-[10px] bg-slate-100 rounded px-1.5 py-0.5 border border-slate-200"
                >
                  <option value="cent">Cents (TN)</option>
                  <option value="acre">Acres</option>
                  <option value="sq_ft">Sq. Ft.</option>
                  <option value="ground">Grounds</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minArea}
                  onChange={(e) => setMinArea(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxArea}
                  onChange={(e) => setMaxArea(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>
            </div>

            {/* Min Road Width */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Min Road Width (ft)</label>
              <input
                type="number"
                placeholder="e.g. 30"
                value={minRoadWidth}
                onChange={(e) => setMinRoadWidth(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>

            {/* Water Source */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Water Source</label>
              <select
                value={waterSource}
                onChange={(e) => setWaterSource(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="any">Any Water Source</option>
                <option value="borewell">Borewell</option>
                <option value="open_well">Open Well</option>
                <option value="pipeline">Municipal / Pipeline</option>
                <option value="canal">Canal / River</option>
              </select>
            </div>

            {/* Soil Type */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Soil Classification</label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white capitalize"
              >
                <option value="any">Any Soil</option>
                <option value="red">Red Soil (செம்மண்)</option>
                <option value="black">Black Soil (கரிசல் மண்)</option>
                <option value="alluvial">Alluvial (வண்டல் மண்)</option>
                <option value="clay">Clay (களிமண்)</option>
                <option value="sandy">Sandy (மணல் மண்)</option>
              </select>
            </div>

            {/* Road Surface */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Road Surface</label>
              <select
                value={roadType}
                onChange={(e) => setRoadType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white capitalize"
              >
                <option value="any">Any Surface</option>
                <option value="tar">Tar / Bitumen</option>
                <option value="concrete">Concrete Paved</option>
                <option value="gravel">Gravel / Metal</option>
                <option value="mud">Mud / Unpaved</option>
              </select>
            </div>

            {/* Checkbox Amenities */}
            <div className="flex flex-col justify-center space-y-2 pt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={electricityConnected}
                  onChange={(e) => setElectricityConnected(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-700 font-medium">EB Electricity Connected</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-700 font-medium">Verified Records Only</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Main Results View Area */}
      {viewMode === 'grid' && (
        <div>
          {filteredListings.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white p-6">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Published Land Parcels Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                No active properties match your current filter combination. Try clearing some criteria or expanding your area and price ranges.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredListings.map((listing) => (
                <PropertyCard
                  key={listing.id}
                  listing={listing}
                  userId={user?.id || 'anonymous'}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Full Map View Mode */}
      {viewMode === 'map' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <ListingsMap
            listings={filteredListings}
            height="650px"
            onListingClick={(id) => navigate(`/property/${id}`)}
          />
        </div>
      )}

      {/* Split View Mode (Cards on Left, Map on Right) */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Cards List */}
          <div className="lg:col-span-6 space-y-4 overflow-y-auto max-h-[750px] pr-1">
            {filteredListings.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl bg-white p-4">
                <p className="text-xs text-slate-500">No properties matching filters.</p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-2 text-xs font-bold text-emerald-700"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {filteredListings.map((listing) => (
                  <PropertyCard
                    key={listing.id}
                    listing={listing}
                    userId={user?.id || 'anonymous'}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Sticky Map */}
          <div className="lg:col-span-6 sticky top-20 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <ListingsMap
              listings={filteredListings}
              height="750px"
              onListingClick={(id) => navigate(`/property/${id}`)}
            />
          </div>
        </div>
      )}

      {/* Floating Compare Tray */}
      <FloatingCompareBar />
    </div>
  );
};
