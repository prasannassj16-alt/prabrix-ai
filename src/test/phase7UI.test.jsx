import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NearbyAmenitiesView } from '../components/geospatial/NearbyAmenitiesView';
import { ValuationBreakdown } from '../components/valuation/ValuationBreakdown';
import * as overpassService from '../services/overpassService';

describe('Phase 7: Geospatial & Valuation UI Integration Suite', () => {
  const sampleSulurListing = {
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

  const sampleInadequateListing = {
    id: 'demo-trichy-01',
    title: '[DEMO] Riverfront Mixed-Use Acre',
    property_type: 'mixed_use',
    price: 9500000,
    area_sqft: 43560,
    district: 'Tiruchirappalli',
    taluk: 'Srirangam',
    village_panchayat: 'Panayapuram',
    latitude: 10.86,
    longitude: 78.69,
  };

  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Test network offline'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. NearbyAmenitiesView Component', () => {
    it('renders nearby amenities with straight-line distance badges, attribution, and retrieval time', async () => {
      render(
        <NearbyAmenitiesView
          latitude={11.025}
          longitude={77.125}
          propertyName={sampleSulurListing.title}
          district={sampleSulurListing.district}
        />
      );

      // Header
      expect(screen.getByText(/Nearby Roads & Infrastructure Lookup/i)).toBeInTheDocument();

      // Wait for debounced load
      await waitFor(() => {
        expect(screen.getByText(/SH-165 Arterial Highway Corridor/i)).toBeInTheDocument();
      });

      // Straight-line distance label on item
      const straightLineBadges = screen.getAllByText(/straight-line/i);
      expect(straightLineBadges.length).toBeGreaterThan(0);

      // Attribution & distance type
      expect(screen.getByText(/OpenStreetMap via Overpass API/i)).toBeInTheDocument();
      expect(screen.getByText(/Straight-line distance \(aerial\)/i)).toBeInTheDocument();
    });

    it('renders category filter tabs and search radius selectors', async () => {
      render(
        <NearbyAmenitiesView
          latitude={11.025}
          longitude={77.125}
          propertyName={sampleSulurListing.title}
        />
      );

      // Category tabs
      expect(screen.getByText('All Amenities')).toBeInTheDocument();
      expect(screen.getByText('Roads & Transit')).toBeInTheDocument();
      expect(screen.getByText('Civic & Health')).toBeInTheDocument();
      expect(screen.getByText('Commercial')).toBeInTheDocument();

      // Radius buttons
      expect(screen.getByText('1 km')).toBeInTheDocument();
      expect(screen.getByText('3 km')).toBeInTheDocument();
      expect(screen.getByText('5 km')).toBeInTheDocument();
      expect(screen.getByText('10 km')).toBeInTheDocument();
    });

    it('renders coordinates missing alert when coordinates are invalid', () => {
      render(<NearbyAmenitiesView latitude={null} longitude={null} />);
      expect(screen.getByText(/Geospatial Coordinates Missing/i)).toBeInTheDocument();
    });
  });

  describe('2. ValuationBreakdown Component', () => {
    it('renders the 4 strictly separated metrics with indicative range when adequate comps exist', () => {
      render(<ValuationBreakdown listing={sampleSulurListing} />);

      // Title
      expect(screen.getByText(/Comparative Valuation & Pricing Intelligence/i)).toBeInTheDocument();

      // 1. Asking price
      expect(screen.getByText(/1\. Asking Price/i)).toBeInTheDocument();
      expect(screen.getByText(/₹45\.00 Lakhs/i)).toBeInTheDocument();
      expect(screen.getByText(/₹103\.31/i)).toBeInTheDocument();

      // 2. Guideline value
      expect(screen.getByText(/2\. Guideline Value/i)).toBeInTheDocument();
      expect(screen.getByText(/Govt Benchmark/i)).toBeInTheDocument();

      // 3. Observed value
      expect(screen.getByText(/3\. Observed Value/i)).toBeInTheDocument();
      expect(screen.getByText(/Sales Records/i)).toBeInTheDocument();

      // 4. AI Indicative range
      expect(screen.getByText(/4\. AI Indicative Range/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Empirical Range/i).length).toBeGreaterThanOrEqual(1);

      // Comparable table
      expect(screen.getByText(/Recorded Micro-Market Comparable Sales Evidence/i)).toBeInTheDocument();

      // Statutory disclaimer
      expect(screen.getByText(/NO GUARANTEED FUTURE VALUES/i)).toBeInTheDocument();
    });

    it('strictly renders "Insufficient verified comparable data for a reliable estimate." when comps < 2', () => {
      render(<ValuationBreakdown listing={sampleInadequateListing} />);

      // Must show the exact specification fallback message
      const fallbackAlerts = screen.getAllByText(
        /Insufficient verified comparable data for a reliable estimate\./i
      );
      expect(fallbackAlerts.length).toBeGreaterThan(0);

      // Should indicate unavailable / insufficient status
      expect(screen.getByText(/Unavailable/i)).toBeInTheDocument();
    });
  });
});
