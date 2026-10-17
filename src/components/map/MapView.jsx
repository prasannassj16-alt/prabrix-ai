import React, { useEffect, useRef } from 'react';
import { L } from './leafletConfig';
import { MAP_CONFIG } from './mapConfig';

export const MapView = ({
  center = MAP_CONFIG.DEFAULT_CENTER,
  zoom = MAP_CONFIG.DEFAULT_ZOOM,
  minZoom = MAP_CONFIG.MIN_ZOOM,
  maxZoom = MAP_CONFIG.MAX_ZOOM,
  bounds = null,
  height = '450px',
  className = '',
  onMapReady = null,
  children = null,
  zoomControl = true,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if map container already initialized to prevent Leaflet container re-use error
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        minZoom,
        maxZoom,
        zoomControl,
        attributionControl: false, // We add explicit attribution control below
      });

      // Add OpenStreetMap base tile layer with mandatory attribution
      L.tileLayer(MAP_CONFIG.TILE_URL, {
        attribution: MAP_CONFIG.ATTRIBUTION,
        maxZoom,
      }).addTo(map);

      // Add standard attribution in bottom-right corner
      L.control
        .attribution({
          position: 'bottomright',
          prefix: false,
        })
        .addTo(map);

      mapInstanceRef.current = map;

      // Fit bounds if provided
      if (bounds && bounds.length === 2) {
        try {
          map.fitBounds(bounds, { padding: [20, 20] });
        } catch (e) {}
      }

      // Notify parent component that map is ready
      if (onMapReady && typeof onMapReady === 'function') {
        onMapReady(map);
      }

      // Invalidate size shortly after mounting to ensure full container rendering
      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center when prop changes dynamically
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      const currentCenter = mapInstanceRef.current.getCenter();
      if (
        Math.abs(currentCenter.lat - center[0]) > 0.0001 ||
        Math.abs(currentCenter.lng - center[1]) > 0.0001
      ) {
        mapInstanceRef.current.setView(center, mapInstanceRef.current.getZoom(), { animate: true });
      }
    }
  }, [center]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <div
        ref={mapContainerRef}
        style={{ height }}
        className={`w-full bg-slate-100 ${className}`}
      />
      {children}
    </div>
  );
};
