/**
 * PRABRIX AI - Centralized Overpass API & Geospatial Configuration
 * Phase 7: Geospatial & Valuation (sections 11 and 12 of PROJECT_SPEC.md)
 *
 * OSM / OVERPASS USAGE POLICY COMPLIANCE:
 * - Direct queries through public Overpass instances with polite request timeouts.
 * - Centralized endpoint list with automatic secondary fallback.
 * - In-memory and local storage caching (30-minute default TTL) to eliminate redundant calls.
 * - Debounced execution to prevent burst query spam.
 * - Straight-line (aerial) distance labeling on all calculated geographic outputs.
 */

export const OVERPASS_CONFIG = {
  // Primary and secondary Overpass interpreter mirrors
  ENDPOINTS: [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ],

  // Request timeout in milliseconds (abort query if taking too long)
  TIMEOUT_MS: 9000,

  // Debounce duration before triggering request
  DEBOUNCE_MS: 500,

  // Cache duration: 30 minutes in milliseconds
  CACHE_TTL_MS: 30 * 60 * 1000,

  // LocalStorage cache key prefix
  CACHE_STORAGE_KEY: 'prabrix_overpass_cache_v1',

  // Default and allowable search radii in meters
  DEFAULT_RADIUS_METERS: 5000, // 5 km
  ALLOWED_RADII_METERS: [1000, 3000, 5000, 10000],

  // Attribution & Provenance
  ATTRIBUTION: {
    source: 'OpenStreetMap via Overpass API',
    license: 'ODbL (Open Database License)',
    url: 'https://www.openstreetmap.org/copyright',
    distanceType: 'Straight-line distance (aerial)',
  },

  // Category tags for Overpass QL extraction
  CATEGORIES: {
    transport: {
      id: 'transport',
      label: 'Highways & Transport Nodes',
      osmTags: [
        'highway~"^(motorway|trunk|primary|secondary)$"',
        'railway~"^(station|halt)$"',
        'amenity="bus_station"',
      ],
    },
    civic: {
      id: 'civic',
      label: 'Civic, Health & Education',
      osmTags: [
        'amenity~"^(hospital|clinic|pharmacy)$"',
        'amenity~"^(school|college|university)$"',
        'amenity~"^(police|townhall|courthouse|bank|post_office)$"',
      ],
    },
    commercial: {
      id: 'commercial',
      label: 'Commercial & Industrial Hubs',
      osmTags: [
        'amenity~"^(marketplace|fuel)$"',
        'landuse~"^(industrial|commercial)$"',
        'industrial~"^(factory|warehouse)$"',
      ],
    },
  },
};
