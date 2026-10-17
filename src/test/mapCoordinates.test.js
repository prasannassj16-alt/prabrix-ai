import { describe, it, expect } from 'vitest';
import {
  isValidCoordinate,
  isWithinTamilNadu,
  parseCoordinates,
  formatCoordinates,
  assertNonLegalMarker,
  TN_BOUNDS,
} from '../components/map/coordinateValidator';

describe('Map Coordinate & Spatial Validation Tests', () => {
  describe('WGS84 Coordinate Range Validation', () => {
    it('accepts valid coordinates within standard limits', () => {
      expect(isValidCoordinate(11.025, 77.125)).toBe(true);
      expect(isValidCoordinate(0, 0)).toBe(true);
      expect(isValidCoordinate(90, 180)).toBe(true);
      expect(isValidCoordinate(-90, -180)).toBe(true);
      expect(isValidCoordinate('11.025', '77.125')).toBe(true);
    });

    it('rejects latitudes outside -90 to +90 degrees', () => {
      expect(isValidCoordinate(90.1, 77.125)).toBe(false);
      expect(isValidCoordinate(-90.001, 77.125)).toBe(false);
      expect(isValidCoordinate(150, 0)).toBe(false);
    });

    it('rejects longitudes outside -180 to +180 degrees', () => {
      expect(isValidCoordinate(11.025, 180.1)).toBe(false);
      expect(isValidCoordinate(11.025, -180.001)).toBe(false);
      expect(isValidCoordinate(0, 250)).toBe(false);
    });

    it('rejects non-numeric, null, or undefined coordinates', () => {
      expect(isValidCoordinate(null, 77.125)).toBe(false);
      expect(isValidCoordinate(11.025, undefined)).toBe(false);
      expect(isValidCoordinate('abc', 'def')).toBe(false);
      expect(isValidCoordinate(NaN, 77.125)).toBe(false);
    });
  });

  describe('Tamil Nadu Regional Bounds Checking', () => {
    it('correctly identifies prominent Tamil Nadu district centers', () => {
      // Coimbatore (Sulur / Peelamedu)
      expect(isWithinTamilNadu(11.0168, 76.9558)).toBe(true);
      // Chennai (Tambaram / Guindy)
      expect(isWithinTamilNadu(13.0827, 80.2707)).toBe(true);
      // Madurai (Melur / Othakadai)
      expect(isWithinTamilNadu(9.9252, 78.1198)).toBe(true);
      // Tiruchirappalli (Srirangam)
      expect(isWithinTamilNadu(10.7905, 78.7047)).toBe(true);
      // Kanyakumari (Southern tip)
      expect(isWithinTamilNadu(8.0883, 77.5385)).toBe(true);
    });

    it('correctly rejects locations outside Tamil Nadu boundaries', () => {
      // New Delhi
      expect(isWithinTamilNadu(28.6139, 77.209)).toBe(false);
      // London, UK
      expect(isWithinTamilNadu(51.5074, -0.1278)).toBe(false);
      // Mumbai, Maharashtra
      expect(isWithinTamilNadu(19.076, 72.8777)).toBe(false);
      // Kolkata, West Bengal
      expect(isWithinTamilNadu(22.5726, 88.3639)).toBe(false);
    });
  });

  describe('Coordinate String Parsing & Formatting', () => {
    it('parses comma-separated and space-separated coordinate pairs', () => {
      expect(parseCoordinates('11.0250, 77.1250')).toEqual({ lat: 11.025, lng: 77.125 });
      expect(parseCoordinates('11.0250 77.1250')).toEqual({ lat: 11.025, lng: 77.125 });
      expect(parseCoordinates('  11.0250 ,   77.1250  ')).toEqual({ lat: 11.025, lng: 77.125 });
    });

    it('returns null for malformed or incomplete coordinate strings', () => {
      expect(parseCoordinates('invalid')).toBeNull();
      expect(parseCoordinates('11.0250')).toBeNull();
      expect(parseCoordinates('')).toBeNull();
      expect(parseCoordinates(null)).toBeNull();
    });

    it('formats coordinates with cardinal directions (N/S, E/W)', () => {
      expect(formatCoordinates(11.025, 77.125, 4)).toBe('11.0250° N, 77.1250° E');
      expect(formatCoordinates(-12.5, -45.2, 2)).toBe('12.50° S, 45.20° W');
      expect(formatCoordinates(null, null)).toBe('N/A');
    });
  });

  describe('Legal Boundary Cartographic Policy Enforcement', () => {
    it('strictly prohibits describing a map pin as a legal parcel boundary', () => {
      expect(assertNonLegalMarker('This is a legal parcel boundary.')).toBe(false);
      expect(assertNonLegalMarker('Official boundary demarcation established.')).toBe(false);
      expect(assertNonLegalMarker('Certified revenue boundary for SF 204/1B.')).toBe(false);
    });

    it('accepts compliant cartographic descriptions', () => {
      expect(assertNonLegalMarker('Approximate center coordinates for agricultural parcel.')).toBe(true);
      expect(assertNonLegalMarker('Location pin placed on access road frontage.')).toBe(true);
      expect(assertNonLegalMarker('')).toBe(true);
    });
  });
});
