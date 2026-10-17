/**
 * PRABRIX AI - Leaflet Configuration & Vite Icon Fix
 * Resolves the infamous Leaflet default marker icon 404 issue in Vite bundlers.
 */
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import image assets directly so Vite bundles them with correct hashed URLs
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's internal icon resolver
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

/**
 * Creates custom colored SVG pin markers for different property categories
 */
export const createCategoryIcon = (category = 'default', isSelected = false) => {
  const colors = {
    agricultural: '#16a34a', // Emerald green
    residential: '#2563eb',  // Royal blue
    commercial: '#9333ea',   // Purple
    industrial: '#ea580c',   // Orange
    picker: '#dc2626',       // Red for location picker
    default: '#059669',
  };

  const color = colors[category] || colors.default;
  const strokeColor = isSelected ? '#ffffff' : '#ffffff';
  const strokeWidth = isSelected ? '2.5' : '1.5';
  const size = isSelected ? 38 : 32;

  const svgHtml = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="${size}" height="${size * 1.5}">
      <defs>
        <filter id="shadow-${category}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.35"/>
        </filter>
      </defs>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12z" 
            fill="${color}" 
            stroke="${strokeColor}" 
            stroke-width="${strokeWidth}"
            filter="url(#shadow-${category})"/>
      <circle cx="12" cy="12" r="4.5" fill="#ffffff" />
    </svg>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'prabrix-custom-pin',
    iconSize: [size, size * 1.5],
    iconAnchor: [size / 2, size * 1.5],
    popupAnchor: [0, -(size * 1.5)],
  });
};

export { L };
