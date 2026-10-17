import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { listingService } from '../services/listingService';
import { savedPropertiesService } from '../services/savedPropertiesService';
import { compareService } from '../services/compareService';
import { inquiryService } from '../services/inquiryService';
import { FieldProvenanceBadge } from '../components/buyer/FieldProvenanceBadge';
import { PropertyCard } from '../components/buyer/PropertyCard';
import { PropertySearchPage } from '../components/buyer/PropertySearchPage';
import { PropertyDetailPage } from '../components/buyer/PropertyDetailPage';

const mockUser = {
  id: '00000000-0000-0000-0000-000000000003',
  email: 'buyer@example.com',
  full_name: 'Ananya Krishnan',
  phone: '+919840223344',
  role: 'buyer',
};

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isPhoneVerified: true,
    canAccessBuyer: () => true,
    canAccessSeller: () => false,
    canAccessAdmin: () => false,
  }),
}));

describe('Phase 4: Buy Land & Buyer Marketplace Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. Search & Filtering Engine', () => {
    it('returns only published listings by default and excludes draft, paused, and sold', () => {
      const publicListings = listingService.getPublicListings();
      expect(publicListings.length).toBeGreaterThanOrEqual(1);

      // Verify all returned listings have status 'published'
      publicListings.forEach((l) => {
        expect(l.status).toBe('published');
      });

      // Explicitly check that draft, paused, and sold listings are not returned
      const draftExists = publicListings.some((l) => l.status === 'draft');
      const pausedExists = publicListings.some((l) => l.status === 'paused');
      const soldExists = publicListings.some((l) => l.status === 'sold');

      expect(draftExists).toBe(false);
      expect(pausedExists).toBe(false);
      expect(soldExists).toBe(false);
    });

    it('filters listings by keyword (title, taluk, survey number)', () => {
      // Keyword matching 'Sulur'
      const sulurResults = listingService.searchListings({ q: 'Sulur' });
      expect(sulurResults.length).toBeGreaterThanOrEqual(1);
      sulurResults.forEach((item) => {
        const matches =
          item.title.toLowerCase().includes('sulur') ||
          item.taluk.toLowerCase().includes('sulur') ||
          item.description.toLowerCase().includes('sulur') ||
          item.address.toLowerCase().includes('sulur');
        expect(matches).toBe(true);
      });

      // Keyword matching survey number '77/2'
      const surveyResults = listingService.searchListings({ q: '77/2' });
      expect(surveyResults.length).toBeGreaterThanOrEqual(1);
      expect(surveyResults[0].survey_number).toBe('77/2');
    });

    it('filters listings by Tamil Nadu district', () => {
      const coimbatoreResults = listingService.searchListings({ district: 'Coimbatore' });
      expect(coimbatoreResults.length).toBeGreaterThanOrEqual(1);
      coimbatoreResults.forEach((l) => {
        expect(l.district.toLowerCase()).toBe('coimbatore');
      });

      const maduraiResults = listingService.searchListings({ district: 'Madurai' });
      expect(maduraiResults.length).toBeGreaterThanOrEqual(1);
      maduraiResults.forEach((l) => {
        expect(l.district.toLowerCase()).toBe('madurai');
      });
    });

    it('filters listings by property classification type', () => {
      const agListings = listingService.searchListings({ property_type: 'agricultural' });
      expect(agListings.length).toBeGreaterThanOrEqual(1);
      agListings.forEach((l) => {
        expect(l.property_type).toBe('agricultural');
      });

      const commListings = listingService.searchListings({ property_type: 'commercial' });
      expect(commListings.length).toBeGreaterThanOrEqual(1);
      commListings.forEach((l) => {
        expect(l.property_type).toBe('commercial');
      });
    });

    it('filters listings by price range (min_price and max_price)', () => {
      const budgetListings = listingService.searchListings({
        min_price: 4000000,
        max_price: 7000000,
      });

      expect(budgetListings.length).toBeGreaterThanOrEqual(1);
      budgetListings.forEach((l) => {
        expect(Number(l.price)).toBeGreaterThanOrEqual(4000000);
        expect(Number(l.price)).toBeLessThanOrEqual(7000000);
      });
    });

    it('filters listings by area range in square feet', () => {
      const smallPlots = listingService.searchListings({
        max_area_sqft: 5000,
      });

      expect(smallPlots.length).toBeGreaterThanOrEqual(1);
      smallPlots.forEach((l) => {
        expect(Number(l.area_sqft)).toBeLessThanOrEqual(5000);
      });
    });

    it('filters listings by utilities (water source, electricity, road width)', () => {
      const borewellEBListings = listingService.searchListings({
        water_source: 'borewell',
        electricity_connected: true,
      });

      expect(borewellEBListings.length).toBeGreaterThanOrEqual(1);
      borewellEBListings.forEach((l) => {
        expect(l.water_source).toBe('borewell');
        expect(l.electricity_connected).toBe(true);
      });
    });
  });

  describe('2. Sorting Engine', () => {
    it('sorts listings by price ascending (low to high)', () => {
      const sorted = listingService.searchListings({}, 'price_asc');
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(Number(sorted[i].price)).toBeLessThanOrEqual(Number(sorted[i + 1].price));
      }
    });

    it('sorts listings by price descending (high to low)', () => {
      const sorted = listingService.searchListings({}, 'price_desc');
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(Number(sorted[i].price)).toBeGreaterThanOrEqual(Number(sorted[i + 1].price));
      }
    });

    it('sorts listings by area ascending (small to large)', () => {
      const sorted = listingService.searchListings({}, 'area_asc');
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(Number(sorted[i].area_sqft)).toBeLessThanOrEqual(Number(sorted[i + 1].area_sqft));
      }
    });

    it('sorts listings by rate per sq.ft. ascending', () => {
      const sorted = listingService.searchListings({}, 'rate_asc');
      for (let i = 0; i < sorted.length - 1; i++) {
        const rateA = Number(sorted[i].price_per_sqft || sorted[i].price / sorted[i].area_sqft);
        const rateB = Number(sorted[i + 1].price_per_sqft || sorted[i + 1].price / sorted[i + 1].area_sqft);
        expect(rateA).toBeLessThanOrEqual(rateB);
      }
    });
  });

  describe('3. Seller Contact Privacy Protection (STRICT RULE)', () => {
    it('masks seller phone and email when show_seller_contact is false', () => {
      // 11111111-1111-1111-1111-111111111101 has show_seller_contact: false
      const listing = listingService.getListingWithPrivacy('11111111-1111-1111-1111-111111111101');
      expect(listing).toBeDefined();
      expect(listing.owner_phone).toBeNull();
      expect(listing.owner_email).toBeNull();
      expect(listing.is_contact_masked).toBe(true);
    });

    it('exposes seller phone and email only when seller explicitly chose to publish it', () => {
      // 11111111-1111-1111-1111-111111111102 has show_seller_contact: true
      const listing = listingService.getListingWithPrivacy('11111111-1111-1111-1111-111111111102');
      expect(listing).toBeDefined();
      expect(listing.owner_phone).toBe('+91 98401 12233');
      expect(listing.owner_email).toBe('demo.seller@prabrix.local');
      expect(listing.is_contact_masked).toBe(false);
    });
  });

  describe('4. Field Provenance Badges', () => {
    it('renders correct labels for verified, seller-provided, calculated, and missing fields', () => {
      const { unmount, rerender } = render(<FieldProvenanceBadge type="verified" />);
      expect(screen.getByText('Verified')).toBeDefined();

      rerender(<FieldProvenanceBadge type="seller_provided" />);
      expect(screen.getByText('Seller-Provided')).toBeDefined();

      rerender(<FieldProvenanceBadge type="calculated" />);
      expect(screen.getByText('Calculated')).toBeDefined();

      rerender(<FieldProvenanceBadge type="missing" />);
      expect(screen.getByText('Missing')).toBeDefined();
      unmount();
    });
  });

  describe('5. Saved Properties (Shortlist) Service', () => {
    it('toggles save/unsave state and stores in local storage', () => {
      const listingId = '11111111-1111-1111-1111-111111111101';
      expect(savedPropertiesService.isSaved(listingId, 'test-buyer')).toBe(false);

      // Save
      const saved = savedPropertiesService.toggleSave(listingId, 'test-buyer');
      expect(saved).toBe(true);
      expect(savedPropertiesService.isSaved(listingId, 'test-buyer')).toBe(true);
      expect(savedPropertiesService.getSavedListingIds('test-buyer')).toContain(listingId);

      // Unsave
      const unsaved = savedPropertiesService.toggleSave(listingId, 'test-buyer');
      expect(unsaved).toBe(false);
      expect(savedPropertiesService.isSaved(listingId, 'test-buyer')).toBe(false);
    });
  });

  describe('6. Property Comparison Service', () => {
    it('adds and removes properties up to maximum 4 limit', () => {
      compareService.clearCompare();
      expect(compareService.getCompareList().length).toBe(0);

      const p1 = { id: 'p1', title: 'Plot 1' };
      const p2 = { id: 'p2', title: 'Plot 2' };
      const p3 = { id: 'p3', title: 'Plot 3' };
      const p4 = { id: 'p4', title: 'Plot 4' };
      const p5 = { id: 'p5', title: 'Plot 5' };

      expect(compareService.addToCompare(p1).success).toBe(true);
      expect(compareService.addToCompare(p2).success).toBe(true);
      expect(compareService.addToCompare(p3).success).toBe(true);
      expect(compareService.addToCompare(p4).success).toBe(true);

      // Attempt to exceed max 4
      const res5 = compareService.addToCompare(p5);
      expect(res5.success).toBe(false);
      expect(res5.reason).toMatch(/maximum of 4/);

      // Remove 1
      compareService.removeFromCompare('p1');
      expect(compareService.getCompareList().length).toBe(3);
    });
  });

  describe('7. Inquiry & Site Visit Booking Service', () => {
    it('submits a general buyer inquiry with valid 10-digit Indian mobile and email', () => {
      const inquiry = inquiryService.submitInquiry({
        listingId: '11111111-1111-1111-1111-111111111101',
        buyerId: 'test-buyer',
        buyerName: 'Ananya Krishnan',
        buyerPhone: '9840223344',
        buyerEmail: 'ananya@example.com',
        message: 'Interested in soil water test reports.',
        proposedOffer: 4200000,
      });

      expect(inquiry.id).toBeDefined();
      expect(inquiry.reference_number).toMatch(/^INQ-\d{4}$/);
      expect(inquiry.proposed_offer).toBe(4200000);
      expect(inquiry.status).toBe('pending');
    });

    it('rejects invalid mobile numbers and invalid email addresses', () => {
      expect(() => {
        inquiryService.submitInquiry({
          listingId: '11111111-1111-1111-1111-111111111101',
          buyerName: 'Ananya',
          buyerPhone: '123', // Invalid phone
          buyerEmail: 'ananya@example.com',
        });
      }).toThrow(/valid 10-digit/);

      expect(() => {
        inquiryService.submitInquiry({
          listingId: '11111111-1111-1111-1111-111111111101',
          buyerName: 'Ananya',
          buyerPhone: '9840223344',
          buyerEmail: 'not-an-email', // Invalid email
        });
      }).toThrow(/valid email/);
    });

    it('submits a site visit appointment request with slot and date', () => {
      const visit = inquiryService.submitSiteVisitRequest({
        listingId: '11111111-1111-1111-1111-111111111101',
        buyerId: 'test-buyer',
        buyerName: 'Ananya Krishnan',
        buyerPhone: '9840223344',
        buyerEmail: 'ananya@example.com',
        visitDate: '2026-10-25',
        timeSlot: 'morning',
        visitType: 'in_person',
        notes: 'Will arrive by car from Coimbatore city.',
      });

      expect(visit.id).toBeDefined();
      expect(visit.reference_number).toMatch(/^VISIT-\d{4}$/);
      expect(visit.visit_date).toBe('2026-10-25');
      expect(visit.time_slot).toBe('morning');
      expect(visit.status).toBe('pending_confirmation');
    });
  });

  describe('8. UI Components Integration', () => {
    it('renders PropertyCard with verified badge, price in lakhs, and save action', () => {
      const listing = listingService.getListingById('11111111-1111-1111-1111-111111111101');
      render(
        <MemoryRouter>
          <PropertyCard listing={listing} userId="test-buyer" />
        </MemoryRouter>
      );

      expect(screen.getByText(listing.title)).toBeDefined();
      expect(screen.getByText(/₹45.00 Lakhs/i)).toBeDefined();
      expect(screen.getAllByText(/100 Cents/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Verified/i)).toBeDefined();
    });

    it('renders PropertyDetailPage with provenance badges, map, and privacy protected notice', () => {
      render(
        <MemoryRouter initialEntries={['/property/11111111-1111-1111-1111-111111111101']}>
          <Routes>
            <Route path="/property/:id" element={<PropertyDetailPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Verify title & location
      expect(screen.getAllByText(/Fertile Red Soil Farmland/i).length).toBeGreaterThanOrEqual(1);

      // Verify provenance badges are rendered
      expect(screen.getAllByText('Seller-Provided').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Calculated').length).toBeGreaterThanOrEqual(1);

      // Verify cartographic disclaimer
      expect(
        screen.getByText(/The map marker indicates an approximate reference point/i)
      ).toBeDefined();

      // Verify seller contact privacy notice
      expect(
        screen.getByText(/PRABRIX Privacy Protection Active/i)
      ).toBeDefined();
      expect(
        screen.getByText(/The property seller's direct phone number and email are kept strictly confidential/i)
      ).toBeDefined();

      // Verify inquiry tabs
      expect(screen.getByText(/Send Inquiry \/ Offer/i)).toBeDefined();
      expect(screen.getByText(/Book Site Visit/i)).toBeDefined();
    });
  });
});
