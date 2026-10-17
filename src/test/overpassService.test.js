import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  calculateStraightLineDistanceKm,
  buildOverpassQuery,
  getCacheKey,
  getCachedResult,
  setCachedResult,
  clearCache,
  getBenchmarkFallbackAmenities,
  fetchNearbyAmenities,
} from '../services/overpassService';
import { OVERPASS_CONFIG } from '../config/overpassConfig';

describe('Phase 7: OSM Overpass Geospatial & Amenities Service', () => {
  beforeEach(() => {
    clearCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Centralized Configuration & Attributions', () => {
    it('provides centralized configuration with multiple mirror endpoints, timeouts, and attribution', () => {
      expect(OVERPASS_CONFIG.ENDPOINTS).toBeDefined();
      expect(OVERPASS_CONFIG.ENDPOINTS.length).toBeGreaterThanOrEqual(2);
      expect(OVERPASS_CONFIG.TIMEOUT_MS).toBeGreaterThan(0);
      expect(OVERPASS_CONFIG.CACHE_TTL_MS).toBe(30 * 60 * 1000);
      expect(OVERPASS_CONFIG.ATTRIBUTION.source).toContain('OpenStreetMap');
      expect(OVERPASS_CONFIG.ATTRIBUTION.distanceType).toBe('Straight-line distance (aerial)');
    });
  });

  describe('2. Straight-line (Aerial) Distance Calculation (Haversine)', () => {
    it('calculates accurate straight-line distances between coordinates', () => {
      // Sulur (11.025, 77.125) to Coimbatore Junction (10.998, 76.963) ~ 18 km
      const distance = calculateStraightLineDistanceKm(11.025, 77.125, 10.998, 76.963);
      expect(distance).toBeGreaterThan(17);
      expect(distance).toBeLessThan(19);
    });

    it('returns 0 for identical coordinates', () => {
      const distance = calculateStraightLineDistanceKm(11.025, 77.125, 11.025, 77.125);
      expect(distance).toBe(0);
    });

    it('handles invalid coordinate inputs gracefully without throwing', () => {
      expect(calculateStraightLineDistanceKm(null, undefined, 10.0, 77.0)).toBe(0);
      expect(calculateStraightLineDistanceKm('invalid', 'bad', 10.0, 77.0)).toBe(0);
    });
  });

  describe('3. Overpass QL Query Builder', () => {
    it('generates valid Overpass QL query including radius and category filters', () => {
      const query = buildOverpassQuery(11.025, 77.125, 5000, 'transport');

      expect(query).toContain('[out:json]');
      expect(query).toContain('(around:5000,11.025,77.125)');
      expect(query).toContain('highway');
      expect(query).toContain('railway');
      expect(query).toContain('out center');
    });

    it('builds comprehensive query when category is "all"', () => {
      const queryAll = buildOverpassQuery(11.025, 77.125, 3000, 'all');

      expect(queryAll).toContain('highway');
      expect(queryAll).toContain('hospital');
      expect(queryAll).toContain('school');
      expect(queryAll).toContain('marketplace');
    });
  });

  describe('4. In-Memory & LocalStorage Caching Mechanism', () => {
    it('stores and retrieves cached results within TTL', () => {
      const key = getCacheKey(11.999, 77.999, 5000, 'all');
      const mockData = {
        status: 'success',
        source: OVERPASS_CONFIG.ATTRIBUTION.source,
        distanceLabel: OVERPASS_CONFIG.ATTRIBUTION.distanceType,
        items: [{ id: '1', name: 'Test Road', distanceKm: 1.2 }],
        totalCount: 1,
      };

      setCachedResult(key, mockData);

      const cached = getCachedResult(key);
      expect(cached).toBeDefined();
      expect(cached.fromCache).toBe(true);
      expect(cached.items.length).toBe(1);
      expect(cached.items[0].name).toBe('Test Road');
    });

    it('returns null when cache entry does not exist', () => {
      const nonExistent = getCachedResult('random_key_not_stored');
      expect(nonExistent).toBeNull();
    });
  });

  describe('5. Fetching with Timeout, Mirror Fallback, and Retrieval Metadata', () => {
    const mockOsmElements = [
      {
        type: 'way',
        id: 101,
        center: { lat: 11.028, lon: 77.128 },
        tags: { highway: 'primary', name: 'NH-544 Salem-CBE Highway' },
      },
      {
        type: 'node',
        id: 102,
        lat: 11.035,
        lon: 77.135,
        tags: { amenity: 'hospital', name: 'Sulur Taluk Hospital' },
      },
      {
        type: 'node',
        id: 103,
        lat: 11.045,
        lon: 77.145,
        tags: { amenity: 'school', name: 'Sulur Model School' },
      },
    ];

    it('attaches source attribution, retrieval timestamp, and straight-line metric label', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ elements: mockOsmElements }),
      });

      const result = await fetchNearbyAmenities(11.025, 77.125, {
        radiusMeters: 5000,
        category: 'all',
        allowFallback: true,
      });

      expect(result.status).toBe('success');
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.source).toContain('OpenStreetMap');
      expect(result.distanceLabel).toBe('Straight-line distance (aerial)');
      expect(result.retrievedAt).toBeDefined();
      expect(result.retrievedAtFormatted).toBeDefined();

      // Assert all items have straight-line distances
      result.items.forEach((item) => {
        expect(typeof item.distanceKm).toBe('number');
        expect(item.distanceKm).toBeGreaterThanOrEqual(0);
        expect(item.name).toBeDefined();
        expect(item.category).toBeDefined();
      });
    });

    it('sorts amenities in ascending order by straight-line distance', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ elements: mockOsmElements }),
      });

      const result = await fetchNearbyAmenities(11.025, 77.125, {
        radiusMeters: 10000,
        allowFallback: true,
      });

      for (let i = 0; i < result.items.length - 1; i++) {
        expect(result.items[i].distanceKm).toBeLessThanOrEqual(result.items[i + 1].distanceKm);
      }
    });

    it('activates fallback benchmarks when network endpoints fail', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network offline'));
      const result = await fetchNearbyAmenities(11.025, 77.125, {
        radiusMeters: 5000,
        allowFallback: true,
        forceRefresh: true,
      });

      expect(result.status).toBe('fallback');
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.source).toContain('OpenStreetMap');
      expect(result.distanceLabel).toBe('Straight-line distance (aerial)');
    });

    it('throws error for non-numerical coordinates', async () => {
      await expect(fetchNearbyAmenities('invalid', 'bad')).rejects.toThrow(
        /Invalid coordinates/i
      );
    });
  });
});
