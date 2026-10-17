import React, { useEffect, useRef } from 'react';
import { L, createCategoryIcon } from './leafletConfig';
import { MapView } from './MapView';
import { MAP_CONFIG } from './mapConfig';
import { isValidCoordinate } from './coordinateValidator';
import { MapPin, ExternalLink, AlertCircle } from 'lucide-react';

export const ListingsMap = ({
  listings = [],
  height = '500px',
  onListingClick = null,
  selectedListingId = null,
}) => {
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);

  const handleMapReady = (map) => {
    mapInstanceRef.current = map;
    markersGroupRef.current = L.featureGroup().addTo(map);
    renderMarkers();
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Price on Request';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderMarkers = () => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    const validListings = listings.filter((item) => {
      const lat = item.latitude || (item.coordinates && item.coordinates.lat);
      const lng = item.longitude || (item.coordinates && item.coordinates.lng);
      return isValidCoordinate(lat, lng);
    });

    if (validListings.length === 0) return;

    validListings.forEach((listing) => {
      const lat = Number(listing.latitude || listing.coordinates.lat);
      const lng = Number(listing.longitude || listing.coordinates.lng);
      const isSelected = listing.id === selectedListingId;

      const icon = createCategoryIcon(listing.property_type || 'default', isSelected);
      const marker = L.marker([lat, lng], { icon });

      // Compute Tamil Nadu cents (1 cent = 435.6 sqft)
      const cents = listing.area_cents || (listing.area_sqft ? (listing.area_sqft / 435.6).toFixed(1) : null);

      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 text-slate-800 text-xs max-w-xs';
      popupContent.innerHTML = `
        <div class="space-y-1">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
              ${listing.property_type || 'Property'}
            </span>
            <span class="text-[10px] text-slate-500 font-medium">
              ${listing.district || 'Tamil Nadu'}
            </span>
          </div>
          <h4 class="font-bold text-slate-900 text-sm leading-tight mt-1">
            ${listing.title || 'Land Parcel'}
          </h4>
          <p class="font-bold text-emerald-700 text-sm">
            ${formatPrice(listing.price)}
          </p>
          <div class="text-[11px] text-slate-600 flex items-center space-x-2 pt-0.5">
            <span>${listing.area_sqft ? Number(listing.area_sqft).toLocaleString('en-IN') + ' sq.ft.' : ''}</span>
            ${cents ? `<span>• <b>${cents} Cents</b></span>` : ''}
          </div>
          <p class="text-[10px] text-slate-500 truncate">
            ${listing.address || listing.taluk || ''}
          </p>
          <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span class="text-[9px] text-amber-800 italic">Approximate point</span>
            <button
              id="view-btn-${listing.id}"
              class="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
            >
              <span>View Property</span>
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>
          </div>
        </div>
      `;

      // Bind click on "View Property" inside popup
      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-btn-${listing.id}`);
        if (btn) {
          btn.onclick = (e) => {
            e.preventDefault();
            if (onListingClick && typeof onListingClick === 'function') {
              onListingClick(listing);
            }
          };
        }
      });

      markersGroupRef.current.addLayer(marker);
    });

    // Automatically fit bounds to all visible listing markers
    try {
      const bounds = markersGroupRef.current.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [40, 40],
          maxZoom: 15,
        });
      }
    } catch (e) {}
  };

  useEffect(() => {
    renderMarkers();
  }, [listings, selectedListingId]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <MapView height={height} onMapReady={handleMapReady} />

        {listings.length === 0 && (
          <div className="absolute inset-0 z-[400] bg-slate-900/10 backdrop-blur-[1px] flex items-center justify-center p-4">
            <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 text-center max-w-sm">
              <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No properties to display</p>
              <p className="text-xs text-slate-500 mt-1">
                There are no published listings currently available matching this map area.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Category Legend */}
      <div className="p-3 bg-white border border-slate-200 rounded-lg flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center space-x-4 flex-wrap gap-y-1">
          <span className="font-semibold text-slate-800">Pin Legend:</span>
          <span className="inline-flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>Agricultural</span>
          </span>
          <span className="inline-flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>Residential</span>
          </span>
          <span className="inline-flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
            <span>Commercial</span>
          </span>
          <span className="inline-flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
            <span>Industrial</span>
          </span>
        </div>
        <span className="text-[11px] text-amber-800 font-medium">
          Points only • Not legal boundaries
        </span>
      </div>
    </div>
  );
};
