import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AnalysisReportPage } from '../components/analysis/AnalysisReportPage';
import { AnalysisPreviewCard } from '../components/analysis/AnalysisPreviewCard';
import { listingService } from '../services/listingService';

// Mock sample listings
const sampleVerifiedListing = {
  id: '11111111-1111-1111-1111-111111111101',
  owner_id: '00000000-0000-0000-0000-000000000002',
  title: '[DEMO] Fertile Red Soil Farmland - 1 Acre (100 Cents)',
  description: 'Fictional demo agricultural parcel featuring road frontage, active borewell, free agricultural EB line in Sulur taluk.',
  property_type: 'agricultural',
  status: 'published',
  price: 4500000,
  area_sqft: 43560,
  area_cents: 100,
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
    { id: 'd1', type: 'patta_chitta', title: 'Patta Extract 8942', status: 'verified' },
    { id: 'd2', type: 'encumbrance_certificate', title: 'Nil EC 30 Years', status: 'verified' },
    { id: 'd3', type: 'sale_deed', title: 'Parent Sale Deed', status: 'verified' },
    { id: 'd4', type: 'fmb_sketch', title: 'FMB Field Map', status: 'verified' },
  ],
};

const sampleProvisionalListing = {
  id: '22222222-2222-2222-2222-222222222202',
  title: '[DEMO] Unsurveyed Dry Land',
  property_type: 'agricultural',
  status: 'published',
  price: 2000000,
  area_sqft: 20000,
  address: 'Rural tract',
  taluk: 'Rural Taluk',
  district: 'Madurai',
  state: 'Tamil Nadu',
  // Missing coordinates, missing survey, missing road width, missing water source
  documents: [],
};

describe('Phase 6: Land Analysis Engine Report UI Suite', () => {
  beforeEach(() => {
    vi.spyOn(listingService, 'getListings').mockReturnValue([
      sampleVerifiedListing,
      sampleProvisionalListing,
    ]);
    vi.spyOn(listingService, 'getListingById').mockImplementation((id) => {
      if (id === sampleVerifiedListing.id) return sampleVerifiedListing;
      if (id === sampleProvisionalListing.id) return sampleProvisionalListing;
      return null;
    });
  });

  it('1. renders executive intelligence score, status, and summary for verified parcel', () => {
    render(
      <MemoryRouter initialEntries={[`/property/${sampleVerifiedListing.id}/analysis`]}>
        <Routes>
          <Route path="/property/:id/analysis" element={<AnalysisReportPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Headline and listing title
    expect(screen.getAllByText(/Fertile Red Soil Farmland/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Composite Feasibility Score/i)).toBeInTheDocument();

    // Risk badge
    expect(screen.getByText(/Low Risk/i)).toBeInTheDocument();

    // Summary narrative
    expect(screen.getByText(/Verified Land Intelligence Score/i)).toBeInTheDocument();
  });

  it('2. renders all 4 analysis pillars with sum equality verification', () => {
    render(
      <MemoryRouter initialEntries={[`/property/${sampleVerifiedListing.id}/analysis`]}>
        <Routes>
          <Route path="/property/:id/analysis" element={<AnalysisReportPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Pillar labels
    expect(screen.getByText(/Legal & Document Diligence Breakdown/i)).toBeInTheDocument();
    expect(screen.getByText(/Physical & Site Feasibility/i)).toBeInTheDocument();
    expect(screen.getByText(/Location & Connectivity/i)).toBeInTheDocument();
    expect(screen.getByText(/Agronomic & Development/i)).toBeInTheDocument();

    // Mathematical sum verification indicator
    expect(screen.getByText(/Σ 4 Pillars/i)).toBeInTheDocument();
  });

  it('3. allows switching between pillar tabs and displays granular factors and evidence', () => {
    render(
      <MemoryRouter initialEntries={[`/property/${sampleVerifiedListing.id}/analysis`]}>
        <Routes>
          <Route path="/property/:id/analysis" element={<AnalysisReportPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Switch to Physical Site pillar
    const physicalTab = screen.getAllByText(/Physical & Site Feasibility/i)[0].closest('button');
    fireEvent.click(physicalTab);

    // Checks factors inside Physical tab
    expect(screen.getByText(/Physical & Site Feasibility Breakdown/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Access Road Width/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Water Infrastructure/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Electrical Grid Connectivity/i)).toBeInTheDocument();
  });

  it('4. renders Key Advantages and Site Limitations', () => {
    render(
      <MemoryRouter initialEntries={[`/property/${sampleVerifiedListing.id}/analysis`]}>
        <Routes>
          <Route path="/property/:id/analysis" element={<AnalysisReportPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Key Advantages & Positive Indicators/i)).toBeInTheDocument();
    expect(screen.getByText(/Site Limitations & Technical Constraints/i)).toBeInTheDocument();
  });

  it('5. renders the 6-item Statutory Hazard & Risk Audit Checklist', () => {
    render(
      <MemoryRouter initialEntries={[`/property/${sampleVerifiedListing.id}/analysis`]}>
        <Routes>
          <Route path="/property/:id/analysis" element={<AnalysisReportPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Statutory & Physical Hazard Risk Audit/i)).toBeInTheDocument();
    expect(screen.getByText(/Encumbrance & Mortgage Clearance/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Revenue Patta Passbook Record/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Vehicular Access & Right of Way/i)).toBeInTheDocument();
    expect(screen.getByText(/Water Resource Security/i)).toBeInTheDocument();
    expect(screen.getByText(/Stormwater Runoff & Flood Inundation/i)).toBeInTheDocument();
    expect(screen.getByText(/Boundary Demarcation & Perimeter Security/i)).toBeInTheDocument();
  });

  it('6. renders the Viable Development Use Cases suitability matrix', () => {
    render(
      <MemoryRouter initialEntries={[`/property/${sampleVerifiedListing.id}/analysis`]}>
        <Routes>
          <Route path="/property/:id/analysis" element={<AnalysisReportPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Viable Development Use Cases & Suitability Matrix/i)).toBeInTheDocument();
    expect(screen.getByText(/Organic Agriculture & Agro-Forestry/i)).toBeInTheDocument();
    expect(screen.getByText(/Residential Plotted Layout \/ Gated Farmhouse/i)).toBeInTheDocument();
    expect(screen.getByText(/Logistics Facility & Bulk Warehousing/i)).toBeInTheDocument();
    expect(screen.getByText(/Industrial Setup \/ Light Manufacturing/i)).toBeInTheDocument();
  });

  it('7. displays cadastral location coordinates and guideline valuation context', () => {
    render(
      <MemoryRouter initialEntries={[`/property/${sampleVerifiedListing.id}/analysis`]}>
        <Routes>
          <Route path="/property/:id/analysis" element={<AnalysisReportPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Location & Cadastral Geospatial Alignment/i)).toBeInTheDocument();
    expect(screen.getAllByText(/11.0250° N, 77.1250° E/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Kannampalayam/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Guideline Valuation Benchmark/i)).toBeInTheDocument();
  });

  it('8. displays authoritative data sources and registry provenance', () => {
    render(
      <MemoryRouter initialEntries={[`/property/${sampleVerifiedListing.id}/analysis`]}>
        <Routes>
          <Route path="/property/:id/analysis" element={<AnalysisReportPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Data Sources & Registry Provenance/i)).toBeInTheDocument();
    expect(screen.getByText(/Tamil Nadu Revenue Department/i)).toBeInTheDocument();
    expect(screen.getByText(/Sub-Registrar Office \(Registration Dept\)/i)).toBeInTheDocument();
    expect(screen.getByText(/OpenStreetMap Cartographic Engine/i)).toBeInTheDocument();
  });

  it('9. strictly renders the mandatory statutory legal disclaimer prohibiting guaranteed future values', () => {
    render(
      <MemoryRouter initialEntries={[`/property/${sampleVerifiedListing.id}/analysis`]}>
        <Routes>
          <Route path="/property/:id/analysis" element={<AnalysisReportPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Statutory Disclaimer & Non-Warranty Statement/i)).toBeInTheDocument();
    expect(
      screen.getByText(/PRABRIX AI DOES NOT provide guaranteed future values, projected capital appreciation/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/NO GUARANTEED FUTURE VALUES OR SPECULATIVE RETURN PROMISES/i)
    ).toBeInTheDocument();
  });

  it('10. renders prominent provisional warning banner when reviewing provisional parcel', () => {
    render(
      <MemoryRouter initialEntries={[`/property/${sampleProvisionalListing.id}/analysis`]}>
        <Routes>
          <Route path="/property/:id/analysis" element={<AnalysisReportPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Preliminary Provisional Assessment/i)).toBeInTheDocument();
    expect(screen.getByText(/Missing Information & Diligence Gaps Checklist/i)).toBeInTheDocument();
    expect(screen.getByText(/Revenue Patta Passbook number is not registered/i)).toBeInTheDocument();
  });

  it('11. renders AnalysisPreviewCard with 4-pillar progress and navigation link', () => {
    render(
      <MemoryRouter>
        <AnalysisPreviewCard listing={sampleVerifiedListing} />
      </MemoryRouter>
    );

    expect(screen.getByText(/PRABRIX Land Intelligence Score/i)).toBeInTheDocument();
    expect(screen.getByText(/Legal Diligence/i)).toBeInTheDocument();
    expect(screen.getByText(/Physical Site/i)).toBeInTheDocument();
    expect(screen.getByText(/Location Intel/i)).toBeInTheDocument();
    expect(screen.getByText(/Agronomic Viability/i)).toBeInTheDocument();
    expect(screen.getByText(/View Full Land Intelligence & Risk Dossier/i)).toBeInTheDocument();
  });
});
