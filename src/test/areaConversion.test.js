import { describe, it, expect } from 'vitest';
import {
  convertArea,
  getAllUnitConversions,
  formatTamilNaduArea,
  SQFT_FACTORS,
} from '../services/areaConverter';

describe('Area Unit Conversion Pure Module Tests', () => {
  describe('Tamil Nadu Land Measure Relationships', () => {
    it('verifies 1 cent equals exactly 435.6 sq.ft.', () => {
      expect(convertArea(1, 'cent', 'sq_ft')).toBe(435.6);
      expect(convertArea(435.6, 'sq_ft', 'cent')).toBe(1);
    });

    it('verifies 1 acre equals exactly 100 cents and 43,560 sq.ft.', () => {
      expect(convertArea(1, 'acre', 'cent')).toBe(100);
      expect(convertArea(1, 'acre', 'sq_ft')).toBe(43560);
      expect(convertArea(100, 'cent', 'acre')).toBe(1);
      expect(convertArea(43560, 'sq_ft', 'acre')).toBe(1);
    });

    it('verifies 1 ground (Chennai urban) equals 2,400 sq.ft.', () => {
      expect(convertArea(1, 'ground', 'sq_ft')).toBe(2400);
      expect(convertArea(2400, 'sq_ft', 'ground')).toBe(1);
      // 1 ground is approx 5.51 cents
      expect(convertArea(1, 'ground', 'cent', 2)).toBe(5.51);
    });
  });

  describe('Metric Conversions (Square Meters & Hectares)', () => {
    it('verifies 1 square meter to square feet (10.7639 sq.ft.)', () => {
      expect(convertArea(1, 'sq_m', 'sq_ft', 4)).toBe(10.7639);
      expect(convertArea(10.7639104, 'sq_ft', 'sq_m', 2)).toBe(1);
    });

    it('verifies 1 hectare equals 10,000 sq.m and approx 2.471 acres', () => {
      expect(convertArea(1, 'hectare', 'sq_m', 2)).toBe(10000);
      expect(convertArea(1, 'hectare', 'acre', 3)).toBe(2.471);
      expect(convertArea(1, 'hectare', 'cent', 2)).toBe(247.11);
    });
  });

  describe('Roundtrip and Consistency Tests', () => {
    it('converts back and forth with high numerical precision', () => {
      const units = ['sq_ft', 'cent', 'acre', 'sq_m', 'hectare', 'ground'];
      const initialValue = 50; // 50 cents

      for (const targetUnit of units) {
        const converted = convertArea(initialValue, 'cent', targetUnit, 6);
        const roundtrip = convertArea(converted, targetUnit, 'cent', 4);
        expect(roundtrip).toBeCloseTo(initialValue, 2);
      }
    });

    it('returns exact same number when converting between identical units', () => {
      expect(convertArea(1234.56, 'sq_ft', 'sq_ft')).toBe(1234.56);
      expect(convertArea(75, 'cent', 'cent')).toBe(75);
    });
  });

  describe('Edge Cases & Validation', () => {
    it('handles zero gracefully', () => {
      expect(convertArea(0, 'sq_ft', 'acre')).toBe(0);
      expect(convertArea(0, 'cent', 'sq_m')).toBe(0);
    });

    it('returns null for negative or non-numeric inputs', () => {
      expect(convertArea(-10, 'cent', 'sq_ft')).toBeNull();
      expect(convertArea('invalid', 'cent', 'sq_ft')).toBeNull();
      expect(convertArea(null, 'cent', 'sq_ft')).toBeNull();
    });

    it('throws error for unsupported units', () => {
      expect(() => convertArea(10, 'miles', 'sq_ft')).toThrow(/unsupported area unit/i);
      expect(() => convertArea(10, 'sq_ft', 'yards')).toThrow(/unsupported area unit/i);
    });
  });

  describe('Batch Conversions & UI Formatters', () => {
    it('generates all unit conversions simultaneously via getAllUnitConversions', () => {
      const all = getAllUnitConversions(43560, 'sq_ft', 2);
      expect(all).toBeDefined();
      expect(all.sq_ft).toBe(43560);
      expect(all.cent).toBe(100);
      expect(all.acre).toBe(1);
      expect(all.sq_m).toBe(4046.86);
      expect(all.hectare).toBe(0.4);
    });

    it('formats display according to Tamil Nadu real estate conventions', () => {
      // 1 acre (43,560 sqft) -> displays Acres
      expect(formatTamilNaduArea(43560)).toBe('1 Acres (43,560 sq.ft.)');
      // 25 cents (10,890 sqft) -> displays Cents
      expect(formatTamilNaduArea(10890)).toBe('25 Cents (10,890 sq.ft.)');
      // Invalid input
      expect(formatTamilNaduArea(-50)).toBe('N/A');
    });
  });
});
