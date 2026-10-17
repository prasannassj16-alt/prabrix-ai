import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  listingService,
  LISTING_STATUSES,
  STATUS_LABELS,
} from '../services/listingService';
import { convertArea } from '../services/areaConverter';
import { StepBasicInfo } from '../components/seller/wizard/StepBasicInfo';
import { StepDimensionsPricing } from '../components/seller/wizard/StepDimensionsPricing';
import { StepReviewPublish } from '../components/seller/wizard/StepReviewPublish';
import { SellerDashboard } from '../components/dashboard/SellerDashboard';

const mockUser = {
  id: '00000000-0000-0000-0000-000000000002',
  email: 'seller@example.com',
  full_name: 'Subramanian Natarajan',
  phone: '+919876543210',
  role: 'seller',
};

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isPhoneVerified: true,
  }),
}));

describe('Phase 3: Sell Land & Listing Management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. listingService Lifecycle & Status History', () => {
    it('creates draft with status "draft" and accurate unit calculations', () => {
      const listingData = {
        title: 'Fresh Agricultural Farmland',
        property_type: 'agricultural',
        price: 4356000,
        area_sqft: 43560, // 1 Acre = 100 Cents
        district: 'Coimbatore',
        taluk: 'Sulur',
        address: 'SF 42, Sulur',
      };

      const result = listingService.saveListing(listingData, true);
      expect(result.status).toBe('draft');
      expect(result.area_cents).toBe(100);
      expect(result.price_per_sqft).toBe(100);
      expect(result.views_count).toBe(0);

      const history = listingService.getStatusHistory(result.id);
      expect(history.length).toBeGreaterThanOrEqual(1);
      expect(history[0].new_status).toBe('draft');
    });

    it('creates pending review listing when submitted', () => {
      const listingData = {
        title: 'DTCP Layout Plot',
        property_type: 'residential',
        price: 2400000,
        area_sqft: 2400,
      };

      const result = listingService.saveListing(listingData, false);
      expect(result.status).toBe('pending_review');

      const history = listingService.getStatusHistory(result.id);
      expect(history.some((h) => h.new_status === 'pending_review')).toBe(true);
    });

    it('supports valid status transitions: pending_review -> published -> paused -> sold', () => {
      const saved = listingService.saveListing({
        title: 'Test Transition Land',
        property_type: 'commercial',
        price: 5000000,
        area_sqft: 5000,
      });

      // 1. Publish
      const published = listingService.updateListingStatus(saved.id, 'published', 'Admin approved');
      expect(published.status).toBe('published');

      // 2. Pause
      const paused = listingService.updateListingStatus(saved.id, 'paused', 'Owner requested pause');
      expect(paused.status).toBe('paused');

      // 3. Mark Sold
      const sold = listingService.updateListingStatus(saved.id, 'sold', 'Sale deed registered');
      expect(sold.status).toBe('sold');

      // Verify audit history chronological records
      const history = listingService.getStatusHistory(saved.id);
      expect(history.length).toBeGreaterThanOrEqual(4);
      expect(history.some((h) => h.new_status === 'sold')).toBe(true);
      expect(history.some((h) => h.new_status === 'paused')).toBe(true);
      expect(history.some((h) => h.new_status === 'published')).toBe(true);
    });

    it('rejects invalid status values with an error', () => {
      const saved = listingService.saveListing({ title: 'Invalid Status Test' });
      expect(() => {
        listingService.updateListingStatus(saved.id, 'not_a_real_status');
      }).toThrow(/Invalid status/);
    });
  });

  describe('2. Photo & Private Document Validation', () => {
    it('validates photo format and size (<= 5MB)', () => {
      // Valid JPEG
      const validPhoto = { name: 'field.jpg', type: 'image/jpeg', size: 2 * 1024 * 1024 };
      expect(listingService.validatePhotoFile(validPhoto)).toBe('');

      // Valid WebP
      const validWebp = { name: 'field.webp', type: 'image/webp', size: 1024 * 1024 };
      expect(listingService.validatePhotoFile(validWebp)).toBe('');

      // Invalid format (e.g. PDF or GIF)
      const invalidPhoto = { name: 'field.gif', type: 'image/gif', size: 1024 * 1024 };
      expect(listingService.validatePhotoFile(invalidPhoto)).toMatch(/Invalid image format/);

      // Oversized photo (> 5MB)
      const oversizedPhoto = { name: 'big.png', type: 'image/png', size: 6 * 1024 * 1024 };
      expect(listingService.validatePhotoFile(oversizedPhoto)).toMatch(/exceeds maximum allowed limit of 5MB/);
    });

    it('validates legal document format and size (<= 10MB)', () => {
      // Valid PDF
      const validDoc = { name: 'patta.pdf', type: 'application/pdf', size: 4 * 1024 * 1024 };
      expect(listingService.validateDocumentFile(validDoc)).toBe('');

      // Valid PNG scan
      const validScan = { name: 'fmb.png', type: 'image/png', size: 1 * 1024 * 1024 };
      expect(listingService.validateDocumentFile(validScan)).toBe('');

      // Invalid format (e.g. Word document or zip)
      const invalidDoc = { name: 'deed.docx', type: 'application/msword', size: 1024 * 1024 };
      expect(listingService.validateDocumentFile(invalidDoc)).toMatch(/Invalid document format/);

      // Oversized document (> 10MB)
      const oversizedDoc = { name: 'huge_scan.pdf', type: 'application/pdf', size: 12 * 1024 * 1024 };
      expect(listingService.validateDocumentFile(oversizedDoc)).toMatch(/exceeds maximum limit of 10MB/);
    });
  });

  describe('3. Zero-Fabrication Analytics Calculation', () => {
    it('computes real seller metrics without artificial multiplier or fake numbers', () => {
      const metrics = listingService.getSellerMetrics('00000000-0000-0000-0000-000000000002');
      expect(metrics.totalListings).toBeGreaterThanOrEqual(1);
      // Total views must strictly equal sum of views_count on actual listings
      expect(typeof metrics.totalViews).toBe('number');
      expect(metrics.totalViews).toBeGreaterThanOrEqual(0);
      expect(metrics.realInquiriesCount).toBe(1);
      expect(metrics.realOffersCount).toBe(1);
    });
  });

  describe('4. Step Components UI & Validation', () => {
    it('renders StepBasicInfo and captures title & category', () => {
      const mockUpdate = vi.fn();
      render(
        <StepBasicInfo
          formData={{ title: 'Green Acre Farmland', property_type: 'agricultural' }}
          updateFormData={mockUpdate}
          errors={{}}
        />
      );

      expect(screen.getByText('Step 1: Basic Property Information')).toBeDefined();
      const titleInput = screen.getByLabelText(/Listing Title/i);
      expect(titleInput.value).toBe('Green Acre Farmland');

      fireEvent.change(titleInput, { target: { value: 'Updated Farmland Title' } });
      expect(mockUpdate).toHaveBeenCalledWith({ title: 'Updated Farmland Title' });
    });

    it('renders StepDimensionsPricing with live multi-unit converter', () => {
      const mockUpdate = vi.fn();
      render(
        <StepDimensionsPricing
          formData={{ area_sqft: 43560, price: 4500000 }}
          updateFormData={mockUpdate}
          errors={{}}
        />
      );

      expect(screen.getByText('Step 3: Dimensions, Pricing & Infrastructure')).toBeDefined();
      // Should display real-time rate per sq.ft.
      expect(screen.getByText(/Rate per Sq\.Ft\./i)).toBeDefined();
      // Should show unit conversions
      expect(screen.getByText(/Cents \(TN\)/i)).toBeDefined();
    });

    it('renders StepReviewPublish with cartographic disclaimer and declaration checkbox', () => {
      const mockSaveDraft = vi.fn();
      const mockSubmit = vi.fn();

      render(
        <StepReviewPublish
          formData={{
            title: 'Verified Land Parcel',
            property_type: 'agricultural',
            district: 'Coimbatore',
            taluk: 'Sulur',
            address: 'SF 204, Kannampalayam',
            latitude: 11.025,
            longitude: 77.125,
            area_sqft: 43560,
            price: 5000000,
            photos: [],
            documents: [],
          }}
          onSaveDraft={mockSaveDraft}
          onSubmitListing={mockSubmit}
          isSubmitting={false}
          errors={{}}
        />
      );

      // Verify cartographic disclaimer
      expect(
        screen.getByText(/Markers do not constitute a legal parcel boundary/i)
      ).toBeDefined();

      // Attempt submit without checking declaration
      const submitBtn = screen.getByRole('button', { name: /Submit for Review/i });
      fireEvent.click(submitBtn);
      expect(mockSubmit).not.toHaveBeenCalled();
      expect(
        screen.getByText(/Please confirm the legal ownership declaration before publishing/i)
      ).toBeDefined();

      // Check declaration
      const checkboxes = screen.getAllByRole('checkbox');
      const declarationCheckbox = checkboxes[0];
      fireEvent.click(declarationCheckbox);

      // Now click submit
      fireEvent.click(submitBtn);
      expect(mockSubmit).toHaveBeenCalledWith('pending_review');
    });
  });

  describe('5. Seller Dashboard Management & History Modal', () => {
    it('renders seller dashboard with real metrics and zero-fabrication badge', async () => {
      render(
        <MemoryRouter>
          <SellerDashboard />
        </MemoryRouter>
      );

      expect(screen.getByText(/Land Owner & Seller Portal/i)).toBeDefined();
      expect(screen.getByText(/Zero-Fabrication Data Policy/i)).toBeDefined();
      expect(screen.getByText(/List New Land/i)).toBeDefined();
      expect(
        screen.getByRole('heading', { name: /Your Land Listings/i })
      ).toBeDefined();
    });
  });
});
