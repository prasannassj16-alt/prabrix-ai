import React, { useState } from 'react';
import { LocationPicker } from './LocationPicker';
import { ListingsMap } from './ListingsMap';
import { formatCoordinates, isWithinTamilNadu } from './coordinateValidator';
import { Map, MapPin, Search, Layers, ShieldAlert, CheckCircle2, Info } from 'lucide-react';

export const MapDemoPage = () => {
  const [activeTab, setActiveTab] = useState('picker'); // 'picker' | 'listings' | 'docs'
  const [selectedCoords, setSelectedCoords] = useState({ lat: 11.025, lng: 77.125 }); // Sulur, Coimbatore default
  const [selectedListing, setSelectedListing] = useState(null);

  // Fictional Tamil Nadu sample listings matching seed.sql
  const demoListings = [
    {
      id: '11111111-1111-1111-1111-111111111101',
      title: '[DEMO] Fertile Red Soil Farmland - 1 Acre (100 Cents)',
      property_type: 'agricultural',
      price: 4500000,
      area_sqft: 43560,
      area_cents: 100,
      district: 'Coimbatore',
      taluk: 'Sulur',
      address: 'Kannampalayam Village, Sulur Road',
      latitude: 11.025,
      longitude: 77.125,
    },
    {
      id: '11111111-1111-1111-1111-111111111102',
      title: '[DEMO] DTCP Approved Villa Plot - 2,400 Sq.Ft.',
      property_type: 'residential',
      price: 6800000,
      area_sqft: 2400,
      area_cents: 5.51,
      district: 'Chengalpattu',
      taluk: 'Tambaram',
      address: 'Sri Krishna Nagar, Mudichur Main Road',
      latitude: 12.92,
      longitude: 80.08,
    },
    {
      id: '11111111-1111-1111-1111-111111111103',
      title: '[DEMO] National Highway Commercial Land - 25 Cents',
      property_type: 'commercial',
      price: 12500000,
      area_sqft: 10890,
      area_cents: 25,
      district: 'Madurai',
      taluk: 'Madurai East',
      address: 'NH 38 Bypass, Othakadai Junction',
      latitude: 9.95,
      longitude: 78.165,
    },
    {
      id: '11111111-1111-1111-1111-111111111104',
      title: '[DEMO] Industrial Hub Corridor - 2 Acres',
      property_type: 'industrial',
      price: 21000000,
      area_sqft: 87120,
      area_cents: 200,
      district: 'Kanchipuram',
      taluk: 'Sriperumbudur',
      address: 'Mambakkam Industrial Corridor',
      latitude: 12.97,
      longitude: 79.94,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto my-8 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Phase 2C Reusable Module
            </span>
            <span className="text-xs text-slate-500 font-medium">OpenStreetMap + Leaflet</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Map & Geocoding Component Suite</h1>
          <p className="text-sm text-slate-500">
            Interactive location picker, Nominatim geocoding, multi-listing map, and coordinate verification.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('picker')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'picker'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Location Picker
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'listings'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Listings Map ({demoListings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('docs')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'docs'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Guidelines & Usage
          </button>
        </div>
      </div>

      {/* Mandatory Legal Disclaimer Banner */}
      <div className="mb-6 p-3 bg-amber-50 border-l-4 border-amber-500 text-amber-900 rounded-r-md text-xs flex items-start space-x-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Important Legal & Cartographic Constraint:</span> Map markers represent approximate coordinate anchor points for property identification. A marker pin must <span className="font-bold underline">NEVER</span> be described as or mistaken for a certified legal parcel boundary, Patta FMB field demarcation, or revenue survey line.
        </div>
      </div>

      {/* TAB 1: Location Picker */}
      {activeTab === 'picker' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LocationPicker
              initialLat={selectedCoords.lat}
              initialLng={selectedCoords.lng}
              onChange={(coords) => setSelectedCoords(coords)}
              height="460px"
              allowSearch={true}
              allowManualEntry={true}
            />
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5 mb-3">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Selected Point Inspector</span>
              </h3>

              {selectedCoords ? (
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-500 block">Formatted Location:</span>
                    <span className="font-bold font-mono text-slate-800">
                      {formatCoordinates(selectedCoords.lat, selectedCoords.lng, 6)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Decimal Degrees:</span>
                    <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      lat: {selectedCoords.lat.toFixed(6)}, lng: {selectedCoords.lng.toFixed(6)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-500 block mb-1">Regional Boundary Check:</span>
                    {isWithinTamilNadu(selectedCoords.lat, selectedCoords.lng) ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Inside Tamil Nadu Region</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                        <Info className="w-3.5 h-3.5" />
                        <span>Outside Tamil Nadu State</span>
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Click anywhere on the map or type in search to place a pin.
                </p>
              )}
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-2">
              <h4 className="font-bold text-slate-800">Location Picker Capabilities:</h4>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li>Click on map to drop or move marker pin</li>
                <li>Drag the marker directly to fine-tune GPS coordinates</li>
                <li>Search landmarks via debounced Nominatim OSM geocoder</li>
                <li>Manual latitude/longitude entry works even if geocoding fails</li>
                <li>Reset/Clear button restores default Tamil Nadu view</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Listings Map */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <ListingsMap
            listings={demoListings}
            height="500px"
            selectedListingId={selectedListing?.id}
            onListingClick={(listing) => setSelectedListing(listing)}
          />

          {selectedListing && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
              <div>
                <span className="font-bold">Interacted Listing:</span> {selectedListing.title} ({selectedListing.district})
              </div>
              <button
                onClick={() => setSelectedListing(null)}
                className="text-emerald-700 font-bold hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Component Documentation */}
      {activeTab === 'docs' && (
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm text-xs space-y-4 text-slate-700 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900">Map Component Architecture & Usage</h2>
          <p>
            The PRABRIX AI map module is designed for zero-API-key OpenStreetMap compatibility using Leaflet. Default marker assets are explicitly bundled to resolve Vite image bundling anomalies.
          </p>

          <h3 className="text-sm font-semibold text-slate-800 pt-2">Usage Policies & Debouncing</h3>
          <ul className="list-disc pl-4 space-y-1">
            <li><span className="font-semibold">Nominatim Geocoding Rate Limit:</span> Restricted to maximum 1 request per second enforced via a 1000ms debounce timer.</li>
            <li><span className="font-semibold">Timeout Defense:</span> Geocoding requests abort after 5000ms with error state.</li>
            <li><span className="font-semibold">Resilience:</span> If Nominatim is offline or throttles (HTTP 429), manual latitude/longitude entry remains fully operational.</li>
          </ul>

          <h3 className="text-sm font-semibold text-slate-800 pt-2">Importing in Other Pages</h3>
          <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg overflow-x-auto font-mono text-[11px]">
{`import { LocationPicker, ListingsMap, MapView, PlaceSearch } from '../components/map';

// Inside a form:
<LocationPicker onChange={(coords) => setFieldValue('coordinates', coords)} />

// Inside a property search feed:
<ListingsMap listings={publishedProperties} />`}
          </pre>
        </div>
      )}
    </div>
  );
};
