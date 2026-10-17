/**
 * PRABRIX AI - Coordinate Validation & Spatial Utility
 * Validates geographic coordinates for standard WGS84 bounds,
 * Tamil Nadu regional bounding limits, and legal disclaimer enforcement.
 */

// Tamil Nadu approximate geographic boundary rectangle
export const TN_BOUNDS = {
  minLat: 8.08,
  maxLat: 13.55,
  minLng: 76.23,
  maxLng: 80.35,
};

/**
 * Validates whether latitude and longitude are valid WGS84 decimal degrees
 */
export const isValidCoordinate = (lat, lng) => {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return false;
  }
  const nLat = Number(lat);
  const nLng = Number(lng);

  if (isNaN(nLat) || isNaN(nLng)) {
    return false;
  }

  return nLat >= -90 && nLat <= 90 && nLng >= -180 && nLng <= 180;
};

/**
 * Checks whether coordinates fall within the state of Tamil Nadu, India
 */
export const isWithinTamilNadu = (lat, lng) => {
  if (!isValidCoordinate(lat, lng)) {
    return false;
  }
  const nLat = Number(lat);
  const nLng = Number(lng);

  return (
    nLat >= TN_BOUNDS.minLat &&
    nLat <= TN_BOUNDS.maxLat &&
    nLng >= TN_BOUNDS.minLng &&
    nLng <= TN_BOUNDS.maxLng
  );
};

/**
 * Parses coordinate text strings such as "11.0168, 76.9558" or "11.0168 76.9558"
 */
export const parseCoordinates = (input) => {
  if (!input || typeof input !== 'string') return null;
  const parts = input.trim().split(/[\s,]+/);
  if (parts.length < 2) return null;

  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);

  if (!isValidCoordinate(lat, lng)) return null;

  return { lat, lng };
};

/**
 * Formats coordinates for clean UI presentation
 */
export const formatCoordinates = (lat, lng, precision = 5) => {
  if (!isValidCoordinate(lat, lng)) return 'N/A';
  const nLat = Number(lat);
  const nLng = Number(lng);

  const latDir = nLat >= 0 ? 'N' : 'S';
  const lngDir = nLng >= 0 ? 'E' : 'W';

  return `${Math.abs(nLat).toFixed(precision)}° ${latDir}, ${Math.abs(nLng).toFixed(precision)}° ${lngDir}`;
};

/**
 * Legal safety assertion: Ensures description never claims marker is a legal boundary
 */
export const assertNonLegalMarker = (text) => {
  if (!text) return true;
  const lower = text.toLowerCase();
  const prohibitedClaims = [
    'legal parcel boundary',
    'official boundary demarcation',
    'certified revenue boundary',
    'exact boundary survey',
  ];
  return !prohibitedClaims.some((claim) => lower.includes(claim));
};
