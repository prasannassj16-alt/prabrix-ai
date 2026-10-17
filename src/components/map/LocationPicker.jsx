import React, { useState, useEffect, useRef } from 'react';
import { L, createCategoryIcon } from './leafletConfig';
import { MapView } from './MapView';
import { PlaceSearch } from './PlaceSearch';
import { MAP_CONFIG } from './mapConfig';
import {
  isValidCoordinate,
  isWithinTamilNadu,
  formatCoordinates,
} from './coordinateValidator';
import { MapPin, RotateCcw, Check, AlertTriangle, Info, Navigation, Crosshair, Loader2 } from 'lucide-react';
import { getDeviceLocation } from '../../mobile/mobilePlatform';

export const LocationPicker = ({
  initialLat = null,
  initialLng = null,
  onChange = null,
  height = '420px',
  allowSearch = true,
  allowManualEntry = true,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(
    isValidCoordinate(initialLat, initialLng) ? { lat: Number(initialLat), lng: Number(initialLng) } : null
  );

  const [manualInput, setManualInput] = useState({
    lat: initialLat !== null && initialLat !== undefined ? String(initialLat) : '',
    lng: initialLng !== null && initialLng !== undefined ? String(initialLng) : '',
  });

  const [validationError, setValidationError] = useState('');
  const [mapInstance, setMapInstance] = useState(null);
  const markerRef = useRef(null);

  // When map is initialized, bind click handler
  const handleMapReady = (map) => {
    setMapInstance(map);

    // Click on map to place/move marker
    map.on('click', (e) => {
      const lat = Number(e.latlng.lat.toFixed(6));
      const lng = Number(e.latlng.lng.toFixed(6));
      updatePosition(lat, lng, true);
    });

    // If initial coordinates exist, place marker immediately
    if (isValidCoordinate(initialLat, initialLng)) {
      updatePosition(Number(initialLat), Number(initialLng), false);
      map.setView([initialLat, initialLng], 14);
    }
  };

  const updatePosition = (lat, lng, syncManual = true) => {
    setValidationError('');

    if (!isValidCoordinate(lat, lng)) {
      setValidationError('Invalid coordinates. Latitude must be -90 to 90, Longitude -180 to 180.');
      return;
    }

    if (!isWithinTamilNadu(lat, lng)) {
      setValidationError('Note: Selected location is outside Tamil Nadu geographic boundaries.');
    }

    const newCoords = { lat, lng };
    setSelectedCoords(newCoords);

    if (syncManual) {
      setManualInput({ lat: String(lat), lng: String(lng) });
    }

    // Update marker on map
    if (mapInstance) {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng], {
          draggable: true,
          icon: createCategoryIcon('picker', true),
        }).addTo(mapInstance);

        // Handle marker drag
        marker.on('dragend', (event) => {
          const pos = event.target.getLatLng();
          const dLat = Number(pos.lat.toFixed(6));
          const dLng = Number(pos.lng.toFixed(6));
          updatePosition(dLat, dLng, true);
        });

        marker.bindPopup(`
          <div class="text-xs p-1">
            <p class="font-bold text-slate-900">Selected Location Pin</p>
            <p class="text-[11px] text-slate-600 mt-0.5">${formatCoordinates(lat, lng)}</p>
            <p class="text-[10px] text-amber-700 italic mt-1 font-semibold">
              Approximate point only. Not a legal parcel boundary.
            </p>
          </div>
        `);

        markerRef.current = marker;
      }
    }

    if (onChange && typeof onChange === 'function') {
      onChange(newCoords);
    }
  };

  const handlePlaceSelect = (place) => {
    if (mapInstance && isValidCoordinate(place.lat, place.lng)) {
      mapInstance.setView([place.lat, place.lng], 14, { animate: true });
      updatePosition(place.lat, place.lng, true);
    }
  };

  const handleManualApply = (e) => {
    e.preventDefault();
    setValidationError('');

    const lat = parseFloat(manualInput.lat);
    const lng = parseFloat(manualInput.lng);

    if (isNaN(lat) || isNaN(lng)) {
      setValidationError('Please enter valid numeric values for both Latitude and Longitude.');
      return;
    }

    if (!isValidCoordinate(lat, lng)) {
      setValidationError('Coordinates out of range. Latitude (-90 to 90), Longitude (-180 to 180).');
      return;
    }

    if (mapInstance) {
      mapInstance.setView([lat, lng], 14, { animate: true });
    }

    updatePosition(lat, lng, false);
  };

  const handleReset = () => {
    setSelectedCoords(null);
    setManualInput({ lat: '', lng: '' });
    setValidationError('');

    if (markerRef.current && mapInstance) {
      mapInstance.removeLayer(markerRef.current);
      markerRef.current = null;
    }

    if (mapInstance) {
      mapInstance.setView(MAP_CONFIG.DEFAULT_CENTER, MAP_CONFIG.DEFAULT_ZOOM, { animate: true });
    }

    if (onChange && typeof onChange === 'function') {
      onChange(null);
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setValidationError('');
    const res = await getDeviceLocation();
    setIsLocating(false);

    if (res.success && res.coords) {
      const lat = Number(res.coords.latitude.toFixed(6));
      const lng = Number(res.coords.longitude.toFixed(6));
      updatePosition(lat, lng, true);
      if (mapInstance) {
        mapInstance.setView([lat, lng], 16, { animate: true });
      }
    } else {
      setValidationError(res.error || 'Failed to retrieve current location.');
    }
  };

  return (
    <div className="space-y-3">
      {/* Search Bar & GPS Button */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Search Location / Landmark (OpenStreetMap):
          </label>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition-colors disabled:opacity-50"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
            ) : (
              <Crosshair className="w-3.5 h-3.5 text-teal-600" />
            )}
            <span>{isLocating ? 'Locating GPS...' : 'Use My Current Location'}</span>
          </button>
        </div>
        {allowSearch && <PlaceSearch onSelectPlace={handlePlaceSelect} />}
      </div>

      {/* Map View */}
      <div className="relative">
        <MapView
          height={height}
          onMapReady={handleMapReady}
          center={
            selectedCoords
              ? [selectedCoords.lat, selectedCoords.lng]
              : MAP_CONFIG.DEFAULT_CENTER
          }
          zoom={selectedCoords ? 14 : MAP_CONFIG.DEFAULT_ZOOM}
        />

        {/* Overlay Instructions Badge */}
        <div className="absolute top-2.5 left-12 z-[400] bg-white/95 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded-md shadow-sm text-xs text-slate-700 flex items-center space-x-1.5 pointer-events-none">
          <Navigation className="w-3.5 h-3.5 text-emerald-600" />
          <span>Click on map to drop pin, drag to adjust</span>
        </div>
      </div>

      {/* Legal Boundary Disclaimer - Mandatory Requirement */}
      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-amber-900 flex items-start space-x-2">
        <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
        <p className="leading-snug">
          <span className="font-bold">Notice:</span> Markers indicate approximate geographic coordinate points. A pin marker does <span className="font-bold">NOT</span> represent official survey subdivisions, Patta FMB demarcations, or legal parcel boundaries.
        </p>
      </div>

      {/* Selected Coordinates Readout & Controls */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
            Selected Geographic Coordinates:
          </span>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="font-mono text-sm font-bold text-slate-900">
              {selectedCoords
                ? formatCoordinates(selectedCoords.lat, selectedCoords.lng, 6)
                : 'No location selected yet'}
            </span>
          </div>
          {selectedCoords && (
            <p className="text-[11px] font-mono text-slate-500">
              Decimal: {selectedCoords.lat.toFixed(6)}, {selectedCoords.lng.toFixed(6)}
            </p>
          )}
        </div>

        {selectedCoords && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-md text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Clear / Reset Pin</span>
          </button>
        )}
      </div>

      {/* Validation or Boundary Warning */}
      {validationError && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-md text-xs text-amber-800 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Manual Latitude / Longitude Fallback Entry */}
      {allowManualEntry && (
        <details className="text-xs border border-slate-200 rounded-lg p-3 bg-white">
          <summary className="font-semibold text-slate-700 cursor-pointer hover:text-emerald-700">
            Manual Coordinate Entry (Fallback if Geocoding is Offline)
          </summary>
          <form onSubmit={handleManualApply} className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
            <div>
              <label className="block text-[11px] text-slate-500 mb-0.5" htmlFor="manualLat">
                Latitude (e.g. 11.0250)
              </label>
              <input
                id="manualLat"
                type="number"
                step="any"
                value={manualInput.lat}
                onChange={(e) => setManualInput({ ...manualInput, lat: e.target.value })}
                placeholder="11.0250"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-0.5" htmlFor="manualLng">
                Longitude (e.g. 77.1250)
              </label>
              <input
                id="manualLng"
                type="number"
                step="any"
                value={manualInput.lng}
                onChange={(e) => setManualInput({ ...manualInput, lng: e.target.value })}
                placeholder="77.1250"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="bg-slate-800 hover:bg-slate-900 text-white font-medium py-1.5 px-3 rounded text-xs transition-colors flex items-center justify-center space-x-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Pin</span>
            </button>
          </form>
        </details>
      )}
    </div>
  );
};
