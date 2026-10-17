import { describe, it, expect } from 'vitest';
import {
  evaluateDevelopmentSuggestions,
  STATUTORY_PLANNING_DISCLAIMER,
} from '../services/developmentSuggestionService';

describe('Phase 8: Future-Use & Development Suggestions Service', () => {
  const sampleAgriListing = {
    id: 'listing-sulur-01',
    title: '[DEMO] Fertile Red Soil Farmland - 1 Acre (100 Cents)',
    property_type: 'agricultural',
    area_sqft: 43560,
    area_cents: 100,
    road_width_ft: 30,
    road_type: 'tar',
    water_source: 'borewell',
    electricity_connected: true,
    soil_type: 'red',
    district: 'Coimbatore',
    taluk: 'Sulur',
    village_panchayat: 'Kannampalayam',
  };

  const sampleResidentialPlot = {
    id: 'listing-tambaram-02',
    title: '[DEMO] Villa Plot - 2,400 Sq.Ft.',
    property_type: 'residential',
    area_sqft: 2400,
    area_cents: 5.51,
    road_width_ft: 40,
    road_type: 'concrete',
    water_source: 'pipeline',
    electricity_connected: true,
    district: 'Chengalpattu',
    taluk: 'Tambaram',
    village_panchayat: 'Mudichur',
  };

  describe('1. Pure Evaluation Across Land Typologies', () => {
    it('evaluates agricultural parcel and produces agricultural, hospitality, logistics, and solar options', () => {
      const result = evaluateDevelopmentSuggestions(sampleAgriListing);

      expect(result.status).toBe('evaluated');
      expect(result.totalCount).toBeGreaterThanOrEqual(4);
      expect(result.suggestions.some((s) => s.category === 'agriculture')).toBe(true);
      expect(result.suggestions.some((s) => s.category === 'hospitality')).toBe(true);
      expect(result.suggestions.some((s) => s.category === 'industrial')).toBe(true);
      expect(result.suggestions.some((s) => s.category === 'energy')).toBe(true);
    });

    it('evaluates residential parcel and prioritizes plotted residential layout option', () => {
      const result = evaluateDevelopmentSuggestions(sampleResidentialPlot);

      expect(result.status).toBe('evaluated');
      const resOption = result.suggestions.find((s) => s.category === 'residential');
      expect(resOption).toBeDefined();
      expect(resOption.feasibility).toBe('high');
    });
  });

  describe('2. Supporting Evidence, Unknowns, and Required Permissions Format', () => {
    it('ensures each development suggestion contains supporting evidence, unknowns, and statutory checks', () => {
      const result = evaluateDevelopmentSuggestions(sampleAgriListing);

      result.suggestions.forEach((sug) => {
        // 1. Evidence
        expect(Array.isArray(sug.supportingEvidence)).toBe(true);
        expect(sug.supportingEvidence.length).toBeGreaterThan(0);
        sug.supportingEvidence.forEach((ev) => {
          expect(typeof ev).toBe('string');
          expect(ev.length).toBeGreaterThan(5);
        });

        // 2. Unknowns
        expect(Array.isArray(sug.unknowns)).toBe(true);
        expect(sug.unknowns.length).toBeGreaterThan(0);
        sug.unknowns.forEach((un) => {
          expect(typeof un).toBe('string');
          expect(un.length).toBeGreaterThan(5);
        });

        // 3. Required Permissions
        expect(Array.isArray(sug.requiredPermissions)).toBe(true);
        expect(sug.requiredPermissions.length).toBeGreaterThan(0);
        sug.requiredPermissions.forEach((perm) => {
          expect(perm.authority).toBeDefined();
          expect(perm.requirement).toBeDefined();
        });
      });
    });

    it('identifies statutory Tamil Nadu planning authorities (DTCP, CLU Section 47-A, TNPCB, TANGEDCO)', () => {
      const result = evaluateDevelopmentSuggestions(sampleAgriListing);

      const allPerms = result.suggestions.flatMap((s) => s.requiredPermissions);
      expect(allPerms.some((p) => p.authority.includes('DTCP'))).toBe(true);
      expect(allPerms.some((p) => p.authority.includes('Collector') || p.requirement.includes('Section 47-A'))).toBe(true);
      expect(allPerms.some((p) => p.authority.includes('TANGEDCO'))).toBe(true);
    });
  });

  describe('3. Non-Warranty Planning Disclaimer & Edge Cases', () => {
    it('strictly includes the statutory planning non-warranty disclaimer on every evaluation', () => {
      const result = evaluateDevelopmentSuggestions(sampleAgriListing);

      expect(result.disclaimer).toBe(STATUTORY_PLANNING_DISCLAIMER);
      expect(result.disclaimer).toContain('NOT provide guaranteed planning permissions');
      expect(result.disclaimer).toContain('commercial yields, or investment warranties');
    });

    it('gracefully handles null or invalid listing inputs without throwing', () => {
      const resNull = evaluateDevelopmentSuggestions(null);
      expect(resNull.status).toBe('unavailable');
      expect(resNull.suggestions.length).toBe(0);

      const resEmpty = evaluateDevelopmentSuggestions({});
      expect(resEmpty.status).toBe('unavailable');
    });
  });
});
