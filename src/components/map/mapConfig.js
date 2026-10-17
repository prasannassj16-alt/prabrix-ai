/**
 * PRABRIX AI - Map & Geocoding Configuration
 * Consolidates all map provider URLs, attribution, and geocoding policies.
 *
 * USAGE POLICY COMPLIANCE (OpenStreetMap & Nominatim):
 * - OpenStreetMap requires clear attribution to "OpenStreetMap contributors".
 * - Nominatim requires maximum 1 request per second (enforced via 1000ms debounce).
 * - Nominatim requires an explicit, identifiable HTTP User-Agent.
 * - Never cache or scrape mass data contrary to OSM acceptable use.
 */

export const MAP_CONFIG = {
  // Tile Provider
  TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}.png',
  ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
  
  // Tamil Nadu Geographic Center & Default View
  DEFAULT_CENTER: [11.0598, 78.3874], // Central Tamil Nadu (near Namakkal/Trichy)
  DEFAULT_ZOOM: 7,
  MIN_ZOOM: 5,
  MAX_ZOOM: 18,
  
  // Tamil Nadu Bounding Box [southwest, northeast]
  TAMIL_NADU_BOUNDS: [
    [8.08, 76.23], // Kanyakumari / SW border
    [13.55, 80.35], // Chennai / Thiruvallur / NE border
  ],
  
  // Geocoding Service (Nominatim OSM)
  GEOCODING: {
    SEARCH_URL: 'https://nominatim.openstreetmap.org/search',
    REVERSE_URL: 'https://nominatim.openstreetmap.org/reverse',
    COUNTRY_CODES: 'in', // Limit geocoding to India
    VIEWBOX: '76.23,13.55,80.35,8.08', // Bias search toward Tamil Nadu
    DEBOUNCE_MS: 1000, // Strictly respect 1 request / second limit
    TIMEOUT_MS: 5000,
    USER_AGENT: 'PRABRIX-AI-Land-Intelligence/1.0 (contact@prabrix.ai)',
  },

  // Mandatory Legal Disclaimer
  LEGAL_DISCLAIMER: 'DISCLAIMER: Map markers indicate approximate location coordinates only and do NOT constitute legal land survey numbers, Patta FMB sketches, or official parcel boundaries.',
};
