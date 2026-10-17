import { describe, it, expect } from 'vitest';
import {
  analyzeLandParcel,
  calculateLegalScore,
  calculatePhysicalScore,
  calculateLocationScore,
  calculateViabilityScore,
  evaluateRiskChecklist,
  determineUseCases,
  identifyMissingInformation,
  computeValuationContext,
  STATUTORY_LEGAL_DISCLAIMER,
  PILLAR_DEFINITIONS,
} from '../services/landAnalysisEngine';

describe('Phase 6: Pure Land Intelligence & Feasibility Scoring Engine', () => {
  // Sample fully-specified listing (Coimbatore Farmland)
  const completeListing = {
    id: 'demo-listing-001',
    title: '[DEMO] Fertile Red Soil Farmland - 1 Acre',
    description: 'Elevated agricultural parcel with 30ft road frontage, active borewell, and fenced boundary in Sulur.',
    property_type: 'agricultural',
    status: 'published',
    price: 4500000,
    area_sqft: 43560,
    address: 'SF 204/1B, Kannampalayam Village, Sulur Road',
    village_panchayat: 'Kannampalayam',
    taluk: 'Sulur',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641402',
    survey_number: '204/1B',
    patta_number: 'PT-8942',
    road_width_ft: 30,
    road_type: 'tar',
    water_source: 'borewell',
    electricity_connected: true,
    soil_type: 'red',
    boundary_wall: 'fenced',
    latitude: 11.025,
    longitude: 77.125,
    is_verified: true,
    documents: [
      { id: 'd1', type: 'patta_chitta', status: 'verified', title: 'Patta Extract' },
      { id: 'd2', type: 'sale_deed', status: 'verified', title: 'Parent Sale Deed' },
      { id: 'd3', type: 'encumbrance_certificate', status: 'verified', title: 'Nil EC 30 Years' },
      { id: 'd4', type: 'fmb_sketch', status: 'verified', title: 'FMB Subdivision Sketch' },
    ],
  };

  // Sample listing with missing data (bare minimal)
  const partialListing = {
    id: 'demo-listing-002',
    title: 'Bare Rural Plot',
    price: 1500000,
    area_sqft: 10000,
    address: 'Near Old Temple, Rural Taluk',
    taluk: 'Rural',
    district: 'Madurai',
    // Missing coordinates, patta, survey, road_width, water, soil
  };

  // -------------------------------------------------------------
  // 1. Pillar Score Bounds Tests (0 to 25 points each, 0 to 100 total)
  // -------------------------------------------------------------
  describe('1. Score Bounds (Pillars 0-25, Total 0-100)', () => {
    it('guarantees each pillar score is strictly between 0 and 25 on complete listing', () => {
      const result = analyzeLandParcel(completeListing, completeListing.documents);

      expect(result.status).toBe('ready');
      expect(result.isUnavailable).toBe(false);

      const { legal, physical, location, viability } = result.pillarScores;

      expect(legal.score).toBeGreaterThanOrEqual(0);
      expect(legal.score).toBeLessThanOrEqual(25);

      expect(physical.score).toBeGreaterThanOrEqual(0);
      expect(physical.score).toBeLessThanOrEqual(25);

      expect(location.score).toBeGreaterThanOrEqual(0);
      expect(location.score).toBeLessThanOrEqual(25);

      expect(viability.score).toBeGreaterThanOrEqual(0);
      expect(viability.score).toBeLessThanOrEqual(25);

      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.totalScore).toBeLessThanOrEqual(100);
    });

    it('guarantees each pillar score is strictly bounded even with extreme/over-specified values', () => {
      const extremeListing = {
        id: 'extreme-01',
        title: 'Super Maxed Land',
        price: 999999999,
        area_sqft: 1000000,
        road_width_ft: 200, // Very high road width
        road_type: 'concrete',
        water_source: 'borewell',
        electricity_connected: true,
        soil_type: 'red',
        boundary_wall: 'compound_wall',
        latitude: 11.0,
        longitude: 77.0,
        taluk: 'Coimbatore',
        village_panchayat: 'Panchayat',
        district: 'Coimbatore',
        survey_number: '100/1',
        patta_number: 'PT-9999',
        is_verified: true,
        documents: [
          { type: 'patta_chitta', status: 'verified' },
          { type: 'sale_deed', status: 'verified' },
          { type: 'encumbrance_certificate', status: 'verified' },
          { type: 'fmb_sketch', status: 'verified' },
          { type: 'layout_plan', status: 'verified' },
          { type: 'noc', status: 'verified' },
        ],
      };

      const result = analyzeLandParcel(extremeListing, extremeListing.documents);
      const { legal, physical, location, viability } = result.pillarScores;

      expect(legal.score).toBeLessThanOrEqual(25);
      expect(physical.score).toBeLessThanOrEqual(25);
      expect(location.score).toBeLessThanOrEqual(25);
      expect(viability.score).toBeLessThanOrEqual(25);
      expect(result.totalScore).toBeLessThanOrEqual(100);
    });

    it('guarantees scores are non-negative when all fields are empty or worst-case', () => {
      const worstCaseListing = {
        id: 'worst-01',
        title: 'Empty Land Plot',
        price: 1000,
        area_sqft: 500,
        road_width_ft: 0,
        road_type: 'dirt',
        water_source: 'none',
        electricity_connected: false,
        soil_type: 'clay',
        boundary_wall: 'unfenced',
        latitude: null,
        longitude: null,
      };

      const result = analyzeLandParcel(worstCaseListing, []);
      expect(result.totalScore).toBeGreaterThanOrEqual(0);

      const { legal, physical, location, viability } = result.pillarScores;
      expect(legal.score).toBeGreaterThanOrEqual(0);
      expect(physical.score).toBeGreaterThanOrEqual(0);
      expect(location.score).toBeGreaterThanOrEqual(0);
      expect(viability.score).toBeGreaterThanOrEqual(0);
    });
  });

  // -------------------------------------------------------------
  // 2. Strict Sum Equality Tests (Total === Sum of 4 Pillars)
  // -------------------------------------------------------------
  describe('2. Sum Equality (Total === Sum of 4 Pillars)', () => {
    it('strictly satisfies totalScore === legal + physical + location + viability', () => {
      const testCases = [
        completeListing,
        partialListing,
        {
          id: 'case-3',
          title: 'Mixed Commercial Plot',
          price: 5000000,
          area_sqft: 5000,
          road_width_ft: 40,
          road_type: 'concrete',
          water_source: 'pipeline',
          electricity_connected: true,
          soil_type: 'alluvial',
          boundary_wall: 'compound_wall',
          latitude: 12.92,
          longitude: 80.08,
          taluk: 'Tambaram',
          district: 'Chengalpattu',
          survey_number: '118/4A',
          patta_number: 'PT-1033',
        },
        {
          id: 'case-4',
          title: 'Remote Dry Land',
          price: 900000,
          area_sqft: 20000,
          road_width_ft: 12,
          road_type: 'gravel',
          water_source: 'none',
          soil_type: 'sandy',
          taluk: 'Aruppukottai',
          district: 'Virudhunagar',
        },
      ];

      for (const listing of testCases) {
        const result = analyzeLandParcel(listing, listing.documents || []);
        const { legal, physical, location, viability } = result.pillarScores;
        const expectedSum = Number(
          (legal.score + physical.score + location.score + viability.score).toFixed(1)
        );

        expect(result.totalScore).toBe(expectedSum);
        // Also assert difference is essentially 0
        expect(Math.abs(result.totalScore - (legal.score + physical.score + location.score + viability.score))).toBeLessThan(0.0001);
      }
    });
  });

  // -------------------------------------------------------------
  // 3. Missing Data & Provisional States
  // -------------------------------------------------------------
  describe('3. Missing Data & Provisional Results', () => {
    it('sets status to "provisional" and isProvisional to true when critical parameters are missing', () => {
      const result = analyzeLandParcel(partialListing);

      expect(result.status).toBe('provisional');
      expect(result.isProvisional).toBe(true);
      expect(result.isUnavailable).toBe(false);
      expect(result.confidence).toBe('provisional');
      expect(result.missingInformation.length).toBeGreaterThan(0);

      // Total score should still be computed deterministically for available attributes
      expect(typeof result.totalScore).toBe('number');
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
    });

    it('identifies specific missing documents and technical measurements in missingInformation', () => {
      const missingList = identifyMissingInformation(partialListing, []);

      expect(missingList).toContain('Revenue Patta Passbook number is not registered.');
      expect(missingList).toContain('Certified copy of Patta/Chitta extract from e-Services TN is missing.');
      expect(missingList).toContain('Encumbrance Certificate (EC) for the preceding 30-year search period is missing.');
      expect(missingList).toContain('Certified physical access road width measurement is missing.');
      expect(missingList).toContain('High-precision GPS coordinates verified via on-site DGPS survey are missing.');
    });

    it('sets status to "ready" when all key data points and verified documents are provided', () => {
      const result = analyzeLandParcel(completeListing, completeListing.documents);

      expect(result.status).toBe('ready');
      expect(result.isProvisional).toBe(false);
      expect(result.isUnavailable).toBe(false);
      expect(result.confidence).toBe('high');
      expect(result.totalScore).toBeGreaterThanOrEqual(70);
    });
  });

  // -------------------------------------------------------------
  // 4. Invalid, Corrupt, or Malformed Inputs (Unavailable State)
  // -------------------------------------------------------------
  describe('4. Invalid & Corrupt Inputs Handling', () => {
    it('returns status "unavailable" for null or undefined input without throwing', () => {
      const resNull = analyzeLandParcel(null);
      expect(resNull.status).toBe('unavailable');
      expect(resNull.isUnavailable).toBe(true);
      expect(resNull.totalScore).toBeNull();
      expect(resNull.pillarScores).toBeNull();

      const resUndef = analyzeLandParcel(undefined);
      expect(resUndef.status).toBe('unavailable');
      expect(resUndef.isUnavailable).toBe(true);
      expect(resUndef.totalScore).toBeNull();
    });

    it('returns status "unavailable" for non-object types (string, array, number)', () => {
      expect(analyzeLandParcel('bad input').status).toBe('unavailable');
      expect(analyzeLandParcel(12345).status).toBe('unavailable');
      expect(analyzeLandParcel(['array']).status).toBe('unavailable');
    });

    it('returns status "unavailable" for empty object without id or title', () => {
      const result = analyzeLandParcel({});
      expect(result.status).toBe('unavailable');
      expect(result.isUnavailable).toBe(true);
      expect(result.totalScore).toBeNull();
    });

    it('returns status "unavailable" when price is negative or NaN', () => {
      const badPriceListing = {
        id: 'bad-01',
        title: 'Negative Price Land',
        price: -50000,
        area_sqft: 4000,
      };
      const result = analyzeLandParcel(badPriceListing);
      expect(result.status).toBe('unavailable');
      expect(result.isUnavailable).toBe(true);
    });

    it('returns status "unavailable" when area_sqft is zero or negative', () => {
      const badAreaListing = {
        id: 'bad-02',
        title: 'Zero Area Land',
        price: 500000,
        area_sqft: 0,
      };
      const result = analyzeLandParcel(badAreaListing);
      expect(result.status).toBe('unavailable');
      expect(result.isUnavailable).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // 5. Numerical Stability & Determinism
  // -------------------------------------------------------------
  describe('5. Numerical Stability & Determinism', () => {
    it('yields strictly identical scores when invoked repeatedly with the same input', () => {
      const firstRun = analyzeLandParcel(completeListing, completeListing.documents);

      for (let i = 0; i < 50; i++) {
        const nextRun = analyzeLandParcel(completeListing, completeListing.documents);
        expect(nextRun.totalScore).toBe(firstRun.totalScore);
        expect(nextRun.pillarScores.legal.score).toBe(firstRun.pillarScores.legal.score);
        expect(nextRun.pillarScores.physical.score).toBe(firstRun.pillarScores.physical.score);
        expect(nextRun.pillarScores.location.score).toBe(firstRun.pillarScores.location.score);
        expect(nextRun.pillarScores.viability.score).toBe(firstRun.pillarScores.viability.score);
      }
    });
  });

  // -------------------------------------------------------------
  // 6. Comprehensive Report Structure Verification
  // -------------------------------------------------------------
  describe('6. Report Artifacts Structure & Completeness', () => {
    it('contains all required dossier sections: locationOverview, advantages, limitations, risks, useCases, nextSteps, sources', () => {
      const report = analyzeLandParcel(completeListing, completeListing.documents);

      // Location overview
      expect(report.locationOverview).toBeDefined();
      expect(report.locationOverview.district).toBe('Coimbatore');
      expect(report.locationOverview.taluk).toBe('Sulur');
      expect(report.locationOverview.coordinates).toEqual({ latitude: 11.025, longitude: 77.125 });

      // Advantages & Limitations
      expect(Array.isArray(report.advantages)).toBe(true);
      expect(report.advantages.length).toBeGreaterThan(0);
      expect(Array.isArray(report.limitations)).toBe(true);

      // Risk checklist (6 structured items)
      expect(Array.isArray(report.riskChecklist)).toBe(true);
      expect(report.riskChecklist.length).toBe(6);
      report.riskChecklist.forEach((risk) => {
        expect(['pass', 'warning', 'fail', 'unverified']).toContain(risk.status);
        expect(['low', 'medium', 'high']).toContain(risk.severity);
        expect(risk.label).toBeDefined();
        expect(risk.description).toBeDefined();
      });

      // Use cases (4 viable options)
      expect(Array.isArray(report.useCases)).toBe(true);
      expect(report.useCases.length).toBe(4);
      report.useCases.forEach((uc) => {
        expect(['High', 'Moderate', 'Low']).toContain(uc.suitability);
        expect(uc.name).toBeDefined();
        expect(uc.rationale).toBeDefined();
      });

      // Next steps
      expect(Array.isArray(report.nextSteps)).toBe(true);
      expect(report.nextSteps.length).toBeGreaterThanOrEqual(3);

      // Sources & Confidence
      expect(Array.isArray(report.sources)).toBe(true);
      expect(report.sources.length).toBeGreaterThanOrEqual(4);
      expect(['high', 'medium', 'low', 'provisional']).toContain(report.confidence);
    });

    it('contains the mandatory statutory legal disclaimer prohibiting guaranteed future values', () => {
      const report = analyzeLandParcel(completeListing, completeListing.documents);

      expect(report.legalDisclaimer).toBe(STATUTORY_LEGAL_DISCLAIMER);
      expect(report.legalDisclaimer).toContain('PRABRIX AI DOES NOT provide guaranteed future values');
      expect(report.legalDisclaimer).toContain('speculative financial returns');
    });

    it('provides empirical valuation comparison without speculative projection', () => {
      const valCtx = computeValuationContext(completeListing);

      expect(valCtx.status).toBe('ready');
      expect(valCtx.askingPrice).toBe(4500000);
      expect(valCtx.areaSqft).toBe(43560);
      expect(valCtx.askingRatePerSqft).toBeCloseTo(103.3, 1);
      expect(valCtx.isGuidelineBenchmarkOnly).toBe(true);
      // Ensure no speculative appreciation rate or future projection is generated
      expect(valCtx.projectedValue).toBeUndefined();
      expect(valCtx.projectedRoi).toBeUndefined();
    });
  });
});
