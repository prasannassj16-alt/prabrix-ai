/**
 * PRABRIX AI - Pure Area Unit Conversion Module
 *
 * Supported Units:
 * - 'sq_ft'  : Square Feet (base unit for calculations)
 * - 'cent'   : Tamil Nadu Cent (1 cent = 435.6 sq.ft.)
 * - 'acre'   : Acre (1 acre = 100 cents = 43,560 sq.ft.)
 * - 'sq_m'   : Square Meters (1 sq.m = 10.763910416709722 sq.ft. / 1 sq.ft = 0.09290304 sq.m)
 * - 'hectare': Hectare (1 hectare = 10,000 sq.m = 107,639.104 sq.ft. = 2.47105 acres)
 * - 'ground' : Ground (Tamil Nadu urban unit: 1 ground = 2,400 sq.ft.)
 */

// Factors to convert 1 unit of X into Square Feet
export const SQFT_FACTORS = {
  sq_ft: 1.0,
  cent: 435.6,
  acre: 43560.0,
  sq_m: 10.763910416709722, // 1 / 0.09290304
  hectare: 107639.10416709722, // 10,000 * 10.763910416709722
  ground: 2400.0,
};

export const UNIT_LABELS = {
  sq_ft: 'Sq. Ft. (Square Feet)',
  cent: 'Cents (Tamil Nadu)',
  acre: 'Acres',
  sq_m: 'Sq. M. (Square Meters)',
  hectare: 'Hectares',
  ground: 'Grounds (Chennai/Urban)',
};

export const UNIT_SHORT_LABELS = {
  sq_ft: 'sq.ft.',
  cent: 'cents',
  acre: 'acres',
  sq_m: 'sq.m.',
  hectare: 'ha',
  ground: 'grounds',
};

/**
 * Converts area from one unit to another
 * @param {number|string} value - The numerical area value
 * @param {string} fromUnit - 'sq_ft' | 'cent' | 'acre' | 'sq_m' | 'hectare' | 'ground'
 * @param {string} toUnit - 'sq_ft' | 'cent' | 'acre' | 'sq_m' | 'hectare' | 'ground'
 * @param {number} precision - Decimal places to round to (default 4)
 * @returns {number|null} - Converted value or null if invalid
 */
export const convertArea = (value, fromUnit = 'sq_ft', toUnit = 'sq_ft', precision = 4) => {
  const num = parseFloat(value);
  if (isNaN(num) || num < 0) {
    return null;
  }

  const factorFrom = SQFT_FACTORS[fromUnit];
  const factorTo = SQFT_FACTORS[toUnit];

  if (!factorFrom || !factorTo) {
    throw new Error(`Unsupported area unit. Supported units: ${Object.keys(SQFT_FACTORS).join(', ')}`);
  }

  if (fromUnit === toUnit) {
    return Number(num.toFixed(precision));
  }

  // Convert to square feet first, then to target unit
  const sqft = num * factorFrom;
  const result = sqft / factorTo;

  return Number(result.toFixed(precision));
};

/**
 * Returns all unit conversions for a given area value
 */
export const getAllUnitConversions = (value, fromUnit = 'sq_ft', precision = 2) => {
  const num = parseFloat(value);
  if (isNaN(num) || num < 0) {
    return null;
  }

  const conversions = {};
  for (const unit of Object.keys(SQFT_FACTORS)) {
    conversions[unit] = convertArea(num, fromUnit, unit, precision);
  }

  return conversions;
};

/**
 * Formats area for display in standard Tamil Nadu real estate format (sq.ft + cents/acres)
 */
export const formatTamilNaduArea = (sqft) => {
  const num = parseFloat(sqft);
  if (isNaN(num) || num <= 0) return 'N/A';

  const cents = convertArea(num, 'sq_ft', 'cent', 2);
  const acres = convertArea(num, 'sq_ft', 'acre', 2);

  if (cents >= 100) {
    return `${acres.toLocaleString('en-IN')} Acres (${num.toLocaleString('en-IN')} sq.ft.)`;
  }
  return `${cents.toLocaleString('en-IN')} Cents (${num.toLocaleString('en-IN')} sq.ft.)`;
};

/**
 * Formats a given area value with its short unit label
 */
export const formatAreaWithUnit = (value, unit = 'sq_ft') => {
  const num = parseFloat(value);
  if (isNaN(num)) return '0';
  const label = UNIT_SHORT_LABELS[unit] || unit;
  return `${num.toLocaleString('en-IN')} ${label}`;
};

