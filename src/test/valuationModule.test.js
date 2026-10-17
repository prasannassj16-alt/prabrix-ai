import { describe, it, expect } from 'vitest';
import {
  computePropertyValuation,
  findMatchingComparables,
  getGovernmentGuidelineRate,
  INSUFFICIENT_DATA_MESSAGE,
  STATUTORY_VALUATION_DISCLAIMER,
} from '../services/valuationService';

describe('Phase 7: Pure Valuation & Comparable Evidence Service', () => {
  // Sample listing in Sulur with adequate comparables (3 comps available)
  const sulurListing = {
    id: 'demo-sulur-01',
    title: '[DEMO] Fertile Red Soil Farmland - 1 Acre (100 Cents)',
    property_type: 'agricultural',
    price: 4500000,
    area_sqft: 43560,
    district: 'Coimbatore',
    taluk: 'Sulur',
    village_panchayat: 'Kannampalayam',
    road_width_ft: 30,
    water_source: 'borewell',
    soil_type: 'red',
    latitude: 11.025,
    longitude: 77.125,
  };

  // Sample listing in Tiruchirappalli with inadequate comparables (only 1 comp available in seed)
  const trichyListing = {
    id: 'demo-trichy-01',
    title: '[DEMO] Riverfront Mixed-Use Parcel - 1 Acre',
    property_type: 'mixed_use',
    price: 9500000,
    area_sqft: 43560,
    district: 'Tiruchirappalli',
    taluk: 'Srirangam',
    village_panchayat: 'Panayapuram',
    latitude: 10.86,
    longitude: 78.69,
  };

  // Sample listing in a remote region with ZERO comparables
  const remoteListing = {
    id: 'demo-remote-01',
    title: 'Isolated Dry Plot in Remote Taluk',
    property_type: 'industrial',
    price: 3000000,
    area_sqft: 20000,
    district: 'Ramanathapuram',
    taluk: 'Kadaladi',
  };

  describe('1. Four Strictly Separated Valuation Metrics', () => {
    it('keeps asking price, guideline value, observed value, and AI estimate strictly separated', () => {
      const result = computePropertyValuation(sulurListing);

      expect(result.metrics).toBeDefined();
      const { askingPrice, guidelineValue, observedValue, aiIndicativeEstimate } = result.metrics;

      // 1. Asking price
      expect(askingPrice).toBeDefined();
      expect(askingPrice.amount).toBe(4500000);
      expect(askingPrice.ratePerSqft).toBeCloseTo(103.31, 2);
      expect(askingPrice.label).toBe('Asking Price');

      // 2. Guideline value
      expect(guidelineValue).toBeDefined();
      expect(guidelineValue.amount).toBe(95 * 43560);
      expect(guidelineValue.ratePerSqft).toBe(95);
      expect(guidelineValue.isGovernmentBenchmark).toBe(true);

      // 3. Observed value from comparables
      expect(observedValue).toBeDefined();
      expect(observedValue.hasComps).toBe(true);
      expect(observedValue.ratePerSqft).toBeGreaterThan(95);
      expect(observedValue.ratePerSqft).toBeLessThan(110);
      expect(observedValue.sampleCount).toBeGreaterThanOrEqual(2);

      // 4. AI Indicative Estimate Range
      expect(aiIndicativeEstimate).toBeDefined();
      expect(aiIndicativeEstimate.isRangeOnly).toBe(true);
      expect(aiIndicativeEstimate.lowRatePerSqft).toBeDefined();
      expect(aiIndicativeEstimate.highRatePerSqft).toBeDefined();
      expect(aiIndicativeEstimate.lowRatePerSqft).toBeLessThan(aiIndicativeEstimate.highRatePerSqft);
    });
  });

  describe('2. Indicative Range Only When Adequate Evidence Exists', () => {
    it('computes an indicative valuation range when at least 2 verified comps exist', () => {
      const result = computePropertyValuation(sulurListing);

      expect(result.status).toBe('adequate_evidence');
      expect(result.hasAdequateEvidence).toBe(true);
      expect(result.comparables.length).toBeGreaterThanOrEqual(2);

      const aiEstimate = result.metrics.aiIndicativeEstimate;
      expect(aiEstimate.status).toBe('range_calculated');
      expect(aiEstimate.lowTotal).toBeGreaterThan(0);
      expect(aiEstimate.highTotal).toBeGreaterThan(aiEstimate.lowTotal);
      expect(aiEstimate.lowRatePerSqft).toBeLessThan(aiEstimate.highRatePerSqft);
      expect(aiEstimate.fallbackMessage).toBeUndefined();
    });

    it('applies empirical site adjustments (road width, water, soil) to the adjusted baseline', () => {
      const result = computePropertyValuation(sulurListing);
      const aiEstimate = result.metrics.aiIndicativeEstimate;

      expect(aiEstimate.adjustments.length).toBeGreaterThan(0);
      expect(aiEstimate.adjustments.some((adj) => adj.includes('road'))).toBe(true);
      expect(aiEstimate.adjustments.some((adj) => adj.includes('water'))).toBe(true);
    });
  });

  describe('3. Inadequate Evidence Fallback ("Insufficient verified comparable data...")', () => {
    it('strictly returns "Insufficient verified comparable data for a reliable estimate." when fewer than 2 comps exist', () => {
      // Trichy listing has only 1 comparable deed in seed data
      const result = computePropertyValuation(trichyListing);

      expect(result.status).toBe('insufficient_evidence');
      expect(result.hasAdequateEvidence).toBe(false);
      expect(result.message).toBe(INSUFFICIENT_DATA_MESSAGE);

      const aiEstimate = result.metrics.aiIndicativeEstimate;
      expect(aiEstimate.status).toBe('insufficient_evidence');
      expect(aiEstimate.isRangeOnly).toBe(false);
      expect(aiEstimate.lowRatePerSqft).toBeNull();
      expect(aiEstimate.highRatePerSqft).toBeNull();
      expect(aiEstimate.fallbackMessage).toBe(INSUFFICIENT_DATA_MESSAGE);
    });

    it('strictly returns fallback message when zero comparables exist in micro-market', () => {
      const result = computePropertyValuation(remoteListing);

      expect(result.status).toBe('insufficient_evidence');
      expect(result.hasAdequateEvidence).toBe(false);
      expect(result.message).toBe(INSUFFICIENT_DATA_MESSAGE);
      expect(result.comparables.length).toBe(0);

      const aiEstimate = result.metrics.aiIndicativeEstimate;
      expect(aiEstimate.fallbackMessage).toBe(INSUFFICIENT_DATA_MESSAGE);
    });
  });

  describe('4. Invalid Inputs & Non-Warranty Rule', () => {
    it('returns status "unavailable" for null or corrupt listing', () => {
      const resNull = computePropertyValuation(null);
      expect(resNull.status).toBe('unavailable');
      expect(resNull.hasAdequateEvidence).toBe(false);

      const resZeroPrice = computePropertyValuation({ price: 0, area_sqft: 1000 });
      expect(resZeroPrice.status).toBe('unavailable');
    });

    it('strictly includes the statutory non-warranty disclaimer prohibiting guaranteed future values', () => {
      const result = computePropertyValuation(sulurListing);

      expect(result.disclaimer).toBe(STATUTORY_VALUATION_DISCLAIMER);
      expect(result.disclaimer).toContain('NOT provide guaranteed future values');
      expect(result.disclaimer).toContain('speculative investment returns');
    });
  });
});
