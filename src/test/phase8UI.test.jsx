import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PrivateDocumentVault } from '../components/documents/PrivateDocumentVault';
import { DevelopmentSuggestionsPanel } from '../components/development/DevelopmentSuggestionsPanel';
import * as AuthContextModule from '../context/AuthContext';

describe('Phase 8: Documents and Development Suggestions UI Integration Suite', () => {
  const sampleOwner = {
    id: 'user-owner-01',
    full_name: 'Ramesh Sundaram',
    email: 'seller@example.com',
    role: 'seller',
  };

  const sampleBuyer = {
    id: 'user-buyer-02',
    full_name: 'Karthik Raja',
    email: 'buyer@example.com',
    role: 'buyer',
  };

  const sampleListing = {
    id: 'listing-sulur-01',
    owner_id: 'user-owner-01',
    title: '[DEMO] Fertile Red Soil Farmland - 1 Acre (100 Cents)',
    property_type: 'agricultural',
    area_sqft: 43560,
    area_cents: 100,
    price: 4500000,
    road_width_ft: 30,
    road_type: 'tar',
    water_source: 'borewell',
    electricity_connected: true,
    soil_type: 'red',
    survey_number: '204/1B',
    patta_number: 'PT-8942',
    village_panchayat: 'Kannampalayam',
    taluk: 'Sulur',
    district: 'Coimbatore',
    documents: [
      {
        id: 'doc-seed-1',
        type: 'patta_chitta',
        title: 'Tamil Nilam Patta Extract 8942',
        fileName: 'patta_8942.pdf',
        fileSize: '240 KB',
        status: 'verified',
      },
    ],
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. PrivateDocumentVault Access Control & Uploads', () => {
    it('renders restricted view and access request form when user is an unauthorized buyer', () => {
      vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
        user: sampleBuyer,
      });

      render(<PrivateDocumentVault listing={sampleListing} />);

      // Restricted badge & banner
      expect(screen.getByText(/Restricted Access/i)).toBeInTheDocument();
      expect(screen.getByText(/Confidential Landowner Vault Protection/i)).toBeInTheDocument();

      // Access Request Form
      expect(screen.getByText(/Request Authorized Access for Legal Diligence/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Send Access Request to Owner/i })).toBeInTheDocument();
    });

    it('submits document access request and shows confirmation notice', () => {
      vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
        user: sampleBuyer,
      });

      render(<PrivateDocumentVault listing={sampleListing} />);

      const submitBtn = screen.getByRole('button', { name: /Send Access Request to Owner/i });
      fireEvent.click(submitBtn);

      expect(
        screen.getByText(/Your confidential document access request has been transmitted/i)
      ).toBeInTheDocument();
    });

    it('renders full access vault with upload form when logged in as listing owner', () => {
      vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
        user: sampleOwner,
      });

      render(<PrivateDocumentVault listing={sampleListing} />);

      // Authorized badge
      expect(screen.getByText(/Full Access Authorized/i)).toBeInTheDocument();

      // Upload section
      expect(screen.getByText(/Upload Private Document to Protected Vault/i)).toBeInTheDocument();
      expect(screen.getByText(/Choose Document File/i)).toBeInTheDocument();

      // Document list with OCR trigger
      expect(screen.getByText(/Tamil Nilam Patta Extract 8942/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Run OCR & Cadastral Audit/i })).toBeInTheDocument();
    });
  });

  describe('2. OCR / Document AI Analysis Flow (Section 13)', () => {
    it('opens analysis audit and strictly shows unavailable state when OCR API is unconfigured', async () => {
      vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
        user: sampleOwner,
      });

      render(<PrivateDocumentVault listing={sampleListing} />);

      const ocrBtn = screen.getByRole('button', { name: /Run OCR & Cadastral Audit/i });
      fireEvent.click(ocrBtn);

      // Verify modal opens
      expect(screen.getByText(/Document AI Extraction & Ground-Truth Verification/i)).toBeInTheDocument();

      // Wait for analysis execution
      await waitFor(() => {
        expect(screen.getByText(/OCR \/ Document AI Service Unavailable/i)).toBeInTheDocument();
      });

      // Strict Rule: Message clearly explains lack of API key and manual protocol
      expect(
        screen.getByText(/Automated text extraction and legal instrument parsing are currently unavailable/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Manual Verification Protocol:/i)).toBeInTheDocument();
    });
  });

  describe('3. DevelopmentSuggestionsPanel Component (Section 14)', () => {
    it('renders future-use development suggestions with category filters and feasibility pills', () => {
      render(<DevelopmentSuggestionsPanel listing={sampleListing} />);

      // Header
      expect(screen.getByText(/Future-Use & Development Potential Analysis/i)).toBeInTheDocument();

      // Category filters
      expect(screen.getByText(/All Viable Uses/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Agriculture & Horticulture/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Eco-Tourism & Farmstay/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Logistics & Warehousing/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Renewable Solar/i).length).toBeGreaterThanOrEqual(1);

      // Suggestions
      expect(screen.getByText(/Precision Agro-Cultivation/i)).toBeInTheDocument();
      expect(screen.getAllByText(/High Feasibility/i).length).toBeGreaterThan(0);
    });

    it('displays the three required pillars: Supporting Evidence, Key Unknowns, and Required TN Permissions', () => {
      render(<DevelopmentSuggestionsPanel listing={sampleListing} />);

      // 1. Supporting evidence
      const evidenceHeadings = screen.getAllByText(/Supporting Evidence/i);
      expect(evidenceHeadings.length).toBeGreaterThan(0);

      // 2. Unknowns
      const unknownHeadings = screen.getAllByText(/Key Unknowns & Diligence/i);
      expect(unknownHeadings.length).toBeGreaterThan(0);

      // 3. Required permissions
      const permissionHeadings = screen.getAllByText(/Required TN Permissions/i);
      expect(permissionHeadings.length).toBeGreaterThan(0);

      // Verify specific statutory TN checks
      expect(screen.getAllByText(/TANGEDCO/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/DTCP/i).length).toBeGreaterThan(0);
    });

    it('renders the statutory planning non-warranty disclaimer', () => {
      render(<DevelopmentSuggestionsPanel listing={sampleListing} />);

      expect(screen.getAllByText(/STATUTORY PLANNING & DEVELOPMENT DISCLAIMER/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/PRABRIX AI does NOT provide guaranteed planning permissions/i)).toBeInTheDocument();
    });
  });
});
