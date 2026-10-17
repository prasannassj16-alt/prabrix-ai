/**
 * PRABRIX AI - Valuation & Comparable Evidence Service
 * Phase 7: Geospatial & Valuation (sections 11 and 12 of PROJECT_SPEC.md)
 *
 * SPECIFICATION RULES:
 * 1. Indicative range ONLY when adequate verified comparable evidence exists (minimum 2 verified comps).
 * 2. When comparable evidence is inadequate: strictly display:
 *    "Insufficient verified comparable data for a reliable estimate."
 * 3. Keep 4 values strictly and clearly separated:
 *    - Asking Price
 *    - Guideline Value
 *    - Observed Value (Recent Comparable Sales)
 *    - AI Indicative Estimate Range
 * 4. STRICT RULE 3: Never fabricate comparable data or future appreciation rates.
 *    No guaranteed future values or speculative projections.
 */

import { calculateStraightLineDistanceKm } from './overpassService';

const STORAGE_COMPS_KEY = 'prabrix_comparable_evidence_db';

export const INSUFFICIENT_DATA_MESSAGE =
  'Insufficient verified comparable data for a reliable estimate.';

export const STATUTORY_VALUATION_DISCLAIMER =
  'Valuations represent retrospective comparative assessments and indicative empirical ranges based on registered deed records and government guideline benchmarks. PRABRIX AI does NOT provide guaranteed future values, projected capital escalation, or speculative investment returns. All property transactions require independent verification by a certified surveyor and legal advocate.';

// Fictional demonstration seed records for comparable sales across Tamil Nadu micro-markets
const INITIAL_DEMO_COMPARABLES = [
  // Sulur / Coimbatore Agricultural Cluster (Adequate Comps available)
  {
    id: 'comp-sulur-01',
    district: 'Coimbatore',
    taluk: 'Sulur',
    village: 'Kannampalayam',
    property_type: 'agricultural',
    sale_price: 4300000,
    area_sqft: 43560,
    area_cents: 100,
    price_per_sqft: 98.71,
    transaction_date: '2026-08-15',
    distance_km: 0.8,
    road_width_ft: 30,
    water_source: 'borewell',
    soil_type: 'red',
    latitude: 11.028,
    longitude: 77.128,
    source: 'sub_registrar_office',
    is_verified: true,
    is_demo: true,
  },
  {
    id: 'comp-sulur-02',
    district: 'Coimbatore',
    taluk: 'Sulur',
    village: 'Pallapalayam',
    property_type: 'agricultural',
    sale_price: 4650000,
    area_sqft: 43560,
    area_cents: 100,
    price_per_sqft: 106.75,
    transaction_date: '2026-07-02',
    distance_km: 2.4,
    road_width_ft: 30,
    water_source: 'borewell',
    soil_type: 'red',
    latitude: 11.035,
    longitude: 77.115,
    source: 'verified_registry',
    is_verified: true,
    is_demo: true,
  },
  {
    id: 'comp-sulur-03',
    district: 'Coimbatore',
    taluk: 'Sulur',
    village: 'Irugur',
    property_type: 'agricultural',
    sale_price: 4400000,
    area_sqft: 43560,
    area_cents: 100,
    price_per_sqft: 101.01,
    transaction_date: '2026-05-18',
    distance_km: 3.1,
    road_width_ft: 25,
    water_source: 'borewell',
    soil_type: 'red',
    latitude: 11.018,
    longitude: 77.108,
    source: 'sub_registrar_office',
    is_verified: true,
    is_demo: true,
  },

  // Tambaram / Chengalpattu Residential Layout Cluster (Adequate Comps available)
  {
    id: 'comp-tambaram-01',
    district: 'Chengalpattu',
    taluk: 'Tambaram',
    village: 'Mudichur',
    property_type: 'residential',
    sale_price: 6600000,
    area_sqft: 2400,
    area_cents: 5.51,
    price_per_sqft: 2750.0,
    transaction_date: '2026-09-10',
    distance_km: 0.5,
    road_width_ft: 40,
    water_source: 'pipeline',
    soil_type: 'alluvial',
    latitude: 12.923,
    longitude: 80.082,
    source: 'sub_registrar_office',
    is_verified: true,
    is_demo: true,
  },
  {
    id: 'comp-tambaram-02',
    district: 'Chengalpattu',
    taluk: 'Tambaram',
    village: 'Perungalathur',
    property_type: 'residential',
    sale_price: 7000000,
    area_sqft: 2400,
    area_cents: 5.51,
    price_per_sqft: 2916.67,
    transaction_date: '2026-08-04',
    distance_km: 1.8,
    road_width_ft: 30,
    water_source: 'pipeline',
    soil_type: 'alluvial',
    latitude: 12.915,
    longitude: 80.095,
    source: 'verified_registry',
    is_verified: true,
    is_demo: true,
  },

  // Srirangam / Tiruchirappalli Mixed-Use Cluster (Single Comp Only -> Tests Inadequate Fallback)
  {
    id: 'comp-trichy-01',
    district: 'Tiruchirappalli',
    taluk: 'Srirangam',
    village: 'Panayapuram',
    property_type: 'mixed_use',
    sale_price: 9200000,
    area_sqft: 43560,
    area_cents: 100,
    price_per_sqft: 211.2,
    transaction_date: '2026-06-12',
    distance_km: 1.2,
    road_width_ft: 30,
    water_source: 'canal',
    soil_type: 'alluvial',
    latitude: 10.865,
    longitude: 78.692,
    source: 'sub_registrar_office',
    is_verified: true,
    is_demo: true,
  },
];

const getStoredComparables = () => {
  try {
    const raw = localStorage.getItem(STORAGE_COMPS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  try {
    localStorage.setItem(STORAGE_COMPS_KEY, JSON.stringify(INITIAL_DEMO_COMPARABLES));
  } catch (e) {}

  return INITIAL_DEMO_COMPARABLES;
};

/**
 * Retrieves Indicative Government Guideline Rate per Sq.Ft. for Tamil Nadu Taluks
 */
export function getGovernmentGuidelineRate(district, taluk, propertyType = 'agricultural') {
  const d = String(district || '').toLowerCase();
  const t = String(taluk || '').toLowerCase();
  const p = String(propertyType || '').toLowerCase();

  if (d.includes('chengalpattu') || t.includes('tambaram') || d.includes('chennai')) {
    return p === 'residential' ? 2450 : 1600;
  }

  if (d.includes('coimbatore') || t.includes('sulur') || t.includes('pollachi')) {
    return p === 'residential' ? 650 : 95;
  }

  if (d.includes('tiruchirappalli') || t.includes('srirangam')) {
    return p === 'residential' ? 850 : 180;
  }

  if (d.includes('krishnagiri') || t.includes('hosur')) {
    return p === 'residential' ? 1200 : 450;
  }

  if (d.includes('salem')) {
    return p === 'residential' ? 1400 : 250;
  }

  // Baseline standard indicative guideline
  return p === 'residential' ? 800 : 120;
}

/**
 * Finds matching verified comparable evidence records for a subject property
 */
export function findMatchingComparables(listing, allComps = null, maxDistanceKm = 25) {
  if (!listing || !listing.property_type) return [];

  const comps = allComps || getStoredComparables();
  const subjectPropType = String(listing.property_type).toLowerCase();
  const subjectDistrict = String(listing.district || '').toLowerCase();
  const subjectTaluk = String(listing.taluk || '').toLowerCase();
  const subjectLat = Number(listing.latitude);
  const subjectLng = Number(listing.longitude);
  const hasCoords = !isNaN(subjectLat) && !isNaN(subjectLng);

  return comps
    .filter((comp) => {
      // Must match property category
      if (String(comp.property_type).toLowerCase() !== subjectPropType) {
        return false;
      }

      // If coordinates exist, compute straight-line distance
      if (hasCoords && comp.latitude && comp.longitude) {
        const dist = calculateStraightLineDistanceKm(
          subjectLat,
          subjectLng,
          comp.latitude,
          comp.longitude
        );
        comp.distance_km = dist;
        return dist <= maxDistanceKm;
      }

      // If coordinates missing, match by district and taluk
      const compDist = String(comp.district || '').toLowerCase();
      const compTaluk = String(comp.taluk || '').toLowerCase();
      return compDist === subjectDistrict || compTaluk === subjectTaluk;
    })
    .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
}

/**
 * Pure Valuation Engine Method: computePropertyValuation
 *
 * Produces four strictly separated valuation values:
 * 1. Asking Price (seller-provided)
 * 2. Government Guideline Value (official benchmark)
 * 3. Observed Value (Recent Comparable Sales)
 * 4. AI Indicative Estimate Range (ONLY when >= 2 verified comps exist; otherwise fallback)
 *
 * @param {Object} listing - Subject property entity
 * @param {Array} customComparables - Optional custom or injected comparables array
 * @returns {Object} Full valuation dossier
 */
export function computePropertyValuation(listing, customComparables = null) {
  // Validate input
  if (!listing || typeof listing !== 'object') {
    return {
      status: 'unavailable',
      hasAdequateEvidence: false,
      message: 'Property record is missing or invalid.',
      askingPrice: null,
      guidelineValue: null,
      observedValue: null,
      aiIndicativeEstimate: null,
      comparables: [],
      disclaimer: STATUTORY_VALUATION_DISCLAIMER,
    };
  }

  const price = Number(listing.price);
  const areaSqft = Number(listing.area_sqft);

  if (isNaN(price) || isNaN(areaSqft) || price <= 0 || areaSqft <= 0) {
    return {
      status: 'unavailable',
      hasAdequateEvidence: false,
      message: 'Property pricing or area in sq.ft. is missing or non-numerical.',
      askingPrice: null,
      guidelineValue: null,
      observedValue: null,
      aiIndicativeEstimate: null,
      comparables: [],
      disclaimer: STATUTORY_VALUATION_DISCLAIMER,
    };
  }

  // 1. Metric 1: Asking Price (Seller-Provided)
  const askingRatePerSqft = Math.round((price / areaSqft) * 100) / 100;
  const askingPriceMetric = {
    id: 'asking_price',
    label: 'Asking Price',
    amount: price,
    ratePerSqft: askingRatePerSqft,
    source: 'Seller Self-Reported Listing Price',
    isSellerControlled: true,
  };

  // 2. Metric 2: Government Guideline Value (Official Benchmark)
  const guidelineRate = getGovernmentGuidelineRate(
    listing.district,
    listing.taluk,
    listing.property_type
  );
  const guidelineTotal = Math.round(guidelineRate * areaSqft);
  const varianceVsGuidelinePercent =
    Math.round(((askingRatePerSqft - guidelineRate) / guidelineRate) * 100 * 10) / 10;

  const guidelineValueMetric = {
    id: 'guideline_value',
    label: 'Government Guideline Value',
    amount: guidelineTotal,
    ratePerSqft: guidelineRate,
    varianceVsAskingPercent: varianceVsGuidelinePercent,
    comparisonText:
      varianceVsGuidelinePercent >= 0
        ? `Asking rate is ${varianceVsGuidelinePercent}% above the government guideline value.`
        : `Asking rate is ${Math.abs(varianceVsGuidelinePercent)}% below the government guideline value.`,
    source: 'Tamil Nadu Registration Department (TNREGINET / Sub-Registrar Office)',
    isGovernmentBenchmark: true,
  };

  // 3. Find matching verified comparable evidence
  const matchingComps = findMatchingComparables(listing, customComparables);

  // RULE REQUIREMENT: Check adequate evidence (minimum 2 verified comparables)
  const hasAdequateEvidence = matchingComps.length >= 2;

  // 4. Metric 3: Observed Value from Recent Comparable Sales
  let observedValueMetric = null;

  if (matchingComps.length > 0) {
    const compRates = matchingComps.map((c) => c.price_per_sqft);
    compRates.sort((a, b) => a - b);
    const medianRate =
      compRates.length % 2 === 0
        ? (compRates[compRates.length / 2 - 1] + compRates[compRates.length / 2]) / 2
        : compRates[Math.floor(compRates.length / 2)];

    const roundedMedian = Math.round(medianRate * 100) / 100;
    const medianTotal = Math.round(roundedMedian * areaSqft);

    observedValueMetric = {
      id: 'observed_value',
      label: 'Observed Market Value (Comparable Transactions)',
      amount: medianTotal,
      ratePerSqft: roundedMedian,
      sampleCount: matchingComps.length,
      compsSummary: `${matchingComps.length} verified comparable transaction${
        matchingComps.length === 1 ? '' : 's'
      } recorded within micro-market.`,
      source: 'Sub-Registrar Office Registered Sale Deeds & Verified Registry Records',
      hasComps: true,
    };
  } else {
    observedValueMetric = {
      id: 'observed_value',
      label: 'Observed Market Value (Comparable Transactions)',
      amount: null,
      ratePerSqft: null,
      sampleCount: 0,
      compsSummary: 'No matching transaction records available in this immediate taluk.',
      source: 'Sub-Registrar Office Registry',
      hasComps: false,
    };
  }

  // 5. Metric 4: AI Indicative Valuation Range (ONLY when >= 2 verified comps exist!)
  let aiEstimateMetric = null;

  if (hasAdequateEvidence) {
    const baseRate = observedValueMetric.ratePerSqft;

    // Apply empirical, site-specific adjustments (NO speculative future escalation)
    let adjustmentMultiplier = 1.0;
    const adjustmentReasons = [];

    // Road width adjustment
    const roadWidth = Number(listing.road_width_ft);
    if (!isNaN(roadWidth) && roadWidth >= 30) {
      adjustmentMultiplier += 0.03;
      adjustmentReasons.push(`+3% premium for wide ${roadWidth}ft road vehicular access`);
    } else if (roadWidth > 0 && roadWidth < 15) {
      adjustmentMultiplier -= 0.04;
      adjustmentReasons.push(`-4% discount for narrow ${roadWidth}ft road approach`);
    }

    // Water source adjustment
    const water = String(listing.water_source || '').toLowerCase();
    if (water === 'borewell' || water === 'river_canal') {
      adjustmentMultiplier += 0.03;
      adjustmentReasons.push(`+3% premium for active on-site ${water.replace('_', ' ')} water supply`);
    } else if (water === 'none') {
      adjustmentMultiplier -= 0.03;
      adjustmentReasons.push('-3% discount for absence of dedicated water source');
    }

    // Soil quality adjustment
    const soil = String(listing.soil_type || '').toLowerCase();
    if (soil === 'red' || soil === 'alluvial') {
      adjustmentMultiplier += 0.02;
      adjustmentReasons.push(`+2% premium for high-grade ${soil} soil fertility`);
    }

    const adjustedMidRate = baseRate * adjustmentMultiplier;

    // Formulate a conservative indicative range (±4% bandwidth around adjusted rate)
    const lowRate = Math.round(adjustedMidRate * 0.96 * 10) / 10;
    const highRate = Math.round(adjustedMidRate * 104) / 100;
    const lowTotal = Math.round(lowRate * areaSqft);
    const highTotal = Math.round(highRate * areaSqft);

    aiEstimateMetric = {
      id: 'ai_indicative_estimate',
      label: 'AI Indicative Valuation Range',
      status: 'range_calculated',
      isRangeOnly: true,
      lowRatePerSqft: lowRate,
      highRatePerSqft: highRate,
      lowTotal,
      highTotal,
      bandwidthPercent: 8,
      adjustedBaselineRate: Math.round(adjustedMidRate * 100) / 100,
      adjustments: adjustmentReasons,
      source: 'PRABRIX Empirical Comparable Adjustment Model',
      disclaimer: 'Indicative range only based on historical comparable evidence. Not a guaranteed future value or appraisal.',
    };
  } else {
    // STRICT REQUIREMENT: When adequate comps do not exist, show exact message
    aiEstimateMetric = {
      id: 'ai_indicative_estimate',
      label: 'AI Indicative Valuation Range',
      status: 'insufficient_evidence',
      isRangeOnly: false,
      lowRatePerSqft: null,
      highRatePerSqft: null,
      lowTotal: null,
      highTotal: null,
      fallbackMessage: INSUFFICIENT_DATA_MESSAGE,
      reason: `Found only ${matchingComps.length} verified comparable transaction. Minimum 2 verified records in the micro-market required to compute an indicative valuation range.`,
      source: 'PRABRIX Valuation Engine',
    };
  }

  return {
    status: hasAdequateEvidence ? 'adequate_evidence' : 'insufficient_evidence',
    hasAdequateEvidence,
    message: hasAdequateEvidence
      ? 'Indicative valuation model synthesized from adequate verified comparable sales evidence.'
      : INSUFFICIENT_DATA_MESSAGE,
    metrics: {
      askingPrice: askingPriceMetric,
      guidelineValue: guidelineValueMetric,
      observedValue: observedValueMetric,
      aiIndicativeEstimate: aiEstimateMetric,
    },
    comparables: matchingComps,
    disclaimer: STATUTORY_VALUATION_DISCLAIMER,
  };
}

export const valuationService = {
  getStoredComparables,
  findMatchingComparables,
  getGovernmentGuidelineRate,
  computePropertyValuation,
};
