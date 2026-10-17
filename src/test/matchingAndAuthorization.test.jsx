import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import {
  calculateMatchScore,
  findMatchingListings,
  findMatchingRequirements,
  MATCHING_WEIGHTS,
} from '../services/matchingService';
import { buyerRequirementService } from '../services/buyerRequirementService';
import { offerService } from '../services/offerService';
import { inquiryService } from '../services/inquiryService';
import { notificationService } from '../services/notificationService';
import { MatchScoreCard } from '../components/matching/MatchScoreCard';
import { NotificationBell } from '../components/common/NotificationBell';
import { AuthContext } from '../context/AuthContext';

// Import backend Express route creators for authorization tests
import { createAuthMiddleware } from '../../server/middleware/authMiddleware';
import { createBuyerRoutes } from '../../server/routes/buyerRoutes';
import { createSellerRoutes } from '../../server/routes/sellerRoutes';
import { createNotificationRoutes } from '../../server/routes/notificationRoutes';

describe('Phase 5: Matching Engine, Offers, Inquiries & Authorization Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    buyerRequirementService.resetDemo();
    offerService.resetDemo();
    inquiryService.resetDemo();
    notificationService.resetDemo();
  });

  // =========================================================================
  // 1. DETERMINISTIC MATCHING LOGIC & SPECIFICATION
  // =========================================================================
  describe('1. Deterministic Match Score Calculation', () => {
    const perfectListing = {
      id: 'l-perfect',
      title: 'Ideal Agricultural Land',
      district: 'Coimbatore',
      taluk: 'Sulur',
      property_type: 'agricultural',
      price: 4500000, // ₹45 L (within 30-60 L)
      area_sqft: 43560, // 100 Cents (within 40k - 90k)
      road_width_ft: 25, // >= 20 ft
      water_source: 'borewell',
      electricity_connected: true,
      status: 'published',
    };

    const requirement = {
      id: 'req-01',
      buyer_id: 'test-buyer',
      title: 'Farmland in Sulur',
      preferred_property_type: 'agricultural',
      target_districts: ['Coimbatore'],
      target_taluks: ['Sulur'],
      min_price: 3000000,
      max_price: 6000000,
      min_area_sqft: 40000,
      max_area_sqft: 90000,
      preferred_road_width_ft: 20,
      water_required: true,
      electricity_required: true,
    };

    it('calculates a 100/100 perfect match when all 5 criteria are fully satisfied', () => {
      const result = calculateMatchScore(requirement, perfectListing);

      expect(result.score).toBe(100);
      expect(result.tier).toBe('high');
      expect(result.label).toBe('Excellent Match');

      // Check breakdown points
      expect(result.breakdown.location.score).toBe(MATCHING_WEIGHTS.LOCATION); // 25
      expect(result.breakdown.propertyType.score).toBe(MATCHING_WEIGHTS.PROPERTY_TYPE); // 20
      expect(result.breakdown.price.score).toBe(MATCHING_WEIGHTS.PRICE); // 25
      expect(result.breakdown.area.score).toBe(MATCHING_WEIGHTS.AREA); // 15
      expect(result.breakdown.utilities.score).toBe(MATCHING_WEIGHTS.UTILITIES); // 15

      // Check reasons array
      expect(result.whyItMatches.length).toBeGreaterThanOrEqual(4);
      expect(result.whatItDoesntSatisfy.length).toBe(0);
    });

    it('is strictly deterministic: identical inputs produce identical scores every time', () => {
      const run1 = calculateMatchScore(requirement, perfectListing);
      const run2 = calculateMatchScore(requirement, perfectListing);
      const run3 = calculateMatchScore(requirement, perfectListing);

      expect(run1.score).toBe(run2.score);
      expect(run2.score).toBe(run3.score);
      expect(run1.breakdown).toEqual(run2.breakdown);
      expect(run1.whyItMatches).toEqual(run3.whyItMatches);
    });

    it('NEVER uses probability terminology in result labels or output structure', () => {
      const result = calculateMatchScore(requirement, perfectListing);
      const serialized = JSON.stringify(result).toLowerCase();

      // Rule: Do not call the score a probability
      expect(serialized).not.toContain('probability');
      expect(serialized).not.toContain('chance');
      expect(serialized).not.toContain('likelihood');
    });

    it('penalizes price above maximum budget according to documented formula', () => {
      // 10% over budget: 6.6M > 6.0M max (between 5% and 15% over)
      const overBudgetListing = {
        ...perfectListing,
        price: 6600000,
      };

      const result = calculateMatchScore(requirement, overBudgetListing);
      expect(result.breakdown.price.score).toBe(7); // 7 pts for 5-15% over
      expect(result.score).toBe(100 - 25 + 7); // 82 pts
      expect(result.whatItDoesntSatisfy.some((item) => item.includes('exceeds max budget'))).toBe(true);
    });

    it('penalizes location when district is outside target area', () => {
      const wrongDistrictListing = {
        ...perfectListing,
        district: 'Madurai',
        taluk: 'Melur',
      };

      const result = calculateMatchScore(requirement, wrongDistrictListing);
      expect(result.breakdown.location.score).toBe(0);
      expect(result.whatItDoesntSatisfy.some((item) => item.includes('Located in Madurai'))).toBe(true);
    });

    it('handles district match with non-matching taluk with partial credit', () => {
      const otherTalukListing = {
        ...perfectListing,
        district: 'Coimbatore',
        taluk: 'Pollachi', // Not Sulur
      };

      const result = calculateMatchScore(requirement, otherTalukListing);
      expect(result.breakdown.location.score).toBe(18); // Partial credit
      expect(result.whatItDoesntSatisfy.some((item) => item.includes('Taluk is Pollachi'))).toBe(true);
      expect(result.whyItMatches.some((item) => item.includes('Coimbatore'))).toBe(true);
    });

    it('penalizes utilities when required water or electricity is missing', () => {
      const dryLandListing = {
        ...perfectListing,
        water_source: 'none',
        electricity_connected: false,
      };

      const result = calculateMatchScore(requirement, dryLandListing);
      // Utilities score: 5 (road) + 0 (water) + 0 (elec) = 5/15
      expect(result.breakdown.utilities.score).toBe(5);
      expect(result.whatItDoesntSatisfy.some((item) => item.includes('No active water source'))).toBe(true);
      expect(result.whatItDoesntSatisfy.some((item) => item.includes('No electricity connection'))).toBe(true);
    });
  });

  // =========================================================================
  // 2. MATCHING FILTER & REVERSE MATCHING
  // =========================================================================
  describe('2. findMatchingListings & findMatchingRequirements', () => {
    const requirement = {
      id: 'req-01',
      buyer_id: 'test-buyer',
      title: 'Farmland in Sulur',
      preferred_property_type: 'agricultural',
      target_districts: ['Coimbatore'],
      min_price: 3000000,
      max_price: 6000000,
      min_area_sqft: 40000,
      max_area_sqft: 90000,
    };

    const listings = [
      {
        id: 'l-pub-1',
        title: 'Matching Sulur Farmland',
        district: 'Coimbatore',
        property_type: 'agricultural',
        price: 4500000,
        area_sqft: 43560,
        status: 'published',
      },
      {
        id: 'l-pub-2',
        title: 'Costlier Land in Coimbatore',
        district: 'Coimbatore',
        property_type: 'agricultural',
        price: 9000000, // Exceeds budget
        area_sqft: 43560,
        status: 'published',
      },
      {
        id: 'l-paused',
        title: 'Paused Farmland in Sulur',
        district: 'Coimbatore',
        property_type: 'agricultural',
        price: 4500000,
        area_sqft: 43560,
        status: 'paused', // Should be strictly excluded
      },
      {
        id: 'l-sold',
        title: 'Sold Farmland in Sulur',
        district: 'Coimbatore',
        property_type: 'agricultural',
        price: 4500000,
        area_sqft: 43560,
        status: 'sold', // Should be strictly excluded
      },
    ];

    it('strictly excludes paused and sold listings from match results', () => {
      const matches = findMatchingListings(requirement, listings, 0);

      const returnedIds = matches.map((m) => m.listing.id);
      expect(returnedIds).toContain('l-pub-1');
      expect(returnedIds).toContain('l-pub-2');
      expect(returnedIds).not.toContain('l-paused');
      expect(returnedIds).not.toContain('l-sold');
    });

    it('ranks listings in descending order of deterministic match score', () => {
      const matches = findMatchingListings(requirement, listings, 0);
      expect(matches.length).toBeGreaterThanOrEqual(2);
      expect(matches[0].score).toBeGreaterThan(matches[1].score);
    });

    it('reverse matches requirements for a seller listing', () => {
      const sellerListing = listings[0]; // Sulur farmland
      const reqList = [
        requirement,
        {
          id: 'req-unrelated',
          buyer_id: 'buyer-2',
          preferred_property_type: 'industrial',
          target_districts: ['Madurai'],
          min_price: 10000000,
          max_price: 20000000,
          status: 'active',
        },
      ];

      const matches = findMatchingRequirements(sellerListing, reqList, 40);
      expect(matches.length).toBe(1);
      expect(matches[0].requirement.id).toBe('req-01');
    });
  });

  // =========================================================================
  // 3. AUTHORIZATION & OWNERSHIP ENFORCEMENT (SERVICES & BACKEND)
  // =========================================================================
  describe('3. Security & Ownership Enforcement (Service Level)', () => {
    it('blocks Buyer A from reading Buyer B requirements', () => {
      // Create requirement owned by other buyer
      const req = buyerRequirementService.createRequirement('buyer-alice', {
        title: "Alice's Private Farm Criteria",
        preferred_property_type: 'agricultural',
        target_districts: ['Coimbatore'],
      });

      // Alice can read
      expect(buyerRequirementService.getRequirementById(req.id, 'buyer-alice')).toBeDefined();

      // Bob receives unauthorized error
      expect(() => {
        buyerRequirementService.getRequirementById(req.id, 'buyer-bob');
      }).toThrow(/Unauthorized/i);
    });

    it('blocks Buyer A from modifying or deleting Buyer B requirements', () => {
      const req = buyerRequirementService.createRequirement('buyer-alice', {
        title: "Alice's Land Criteria",
        preferred_property_type: 'agricultural',
        target_districts: ['Coimbatore'],
      });

      // Bob tries to update
      expect(() => {
        buyerRequirementService.updateRequirement(req.id, 'buyer-bob', { title: 'Hacked Title' });
      }).toThrow(/Unauthorized/i);

      // Bob tries to delete
      expect(() => {
        buyerRequirementService.deleteRequirement(req.id, 'buyer-bob');
      }).toThrow(/Unauthorized/i);
    });

    it('blocks unauthorized users from withdrawing or responding to offers', () => {
      const offer = offerService.submitOffer({
        listingId: 'l-01',
        buyerId: 'buyer-alice',
        sellerId: 'seller-sam',
        offerAmount: 5000000,
      });

      // Intruder tries to withdraw Alice's offer
      expect(() => {
        offerService.withdrawOffer(offer.id, 'intruder-charlie');
      }).toThrow(/Unauthorized/i);

      // Intruder tries to accept Alice's offer (not the seller)
      expect(() => {
        offerService.respondToOffer(offer.id, 'intruder-charlie', 'accepted');
      }).toThrow(/Unauthorized/i);

      // Valid seller can accept
      const accepted = offerService.respondToOffer(offer.id, 'seller-sam', 'accepted');
      expect(accepted.status).toBe('accepted');

      // Cannot withdraw once accepted
      expect(() => {
        offerService.withdrawOffer(offer.id, 'buyer-alice');
      }).toThrow(/Cannot withdraw/i);
    });

    it('blocks unauthorized users from accessing or modifying notifications', () => {
      const notif = notificationService.createNotification({
        userId: 'buyer-alice',
        title: 'Private Offer Alert',
        body: 'Confidential alert',
      });

      // Bob tries to mark Alice's notification as read
      expect(() => {
        notificationService.markAsRead(notif.id, 'buyer-bob');
      }).toThrow(/Unauthorized/i);

      // Bob tries to delete Alice's notification
      expect(() => {
        notificationService.deleteNotification(notif.id, 'buyer-bob');
      }).toThrow(/Unauthorized/i);
    });
  });

  // =========================================================================
  // 4. BACKEND EXPRESS ROUTE AUTHORIZATION (HTTP MOCKS)
  // =========================================================================
  describe('4. Backend Express Route Ownership & 403 Forbidden Tests', () => {
    const authMiddleware = {
      requireAuth: (req, res, next) => next(),
      requirePhoneVerified: (req, res, next) => next(),
      requireRole: () => (req, res, next) => next(),
    };

    it('returns 403 Forbidden when user modifies requirement owned by another user', async () => {
      const sharedDb = {
        requirements: [
          { id: 'req-victim', buyer_id: 'user-victim', title: 'Victim Req' },
        ],
      };
      const router = createBuyerRoutes(authMiddleware, sharedDb);

      const putRoute = router.stack.find(
        (layer) => layer.route && layer.route.path === '/requirements/:id' && layer.route.methods.put
      );
      expect(putRoute).toBeDefined();

      const req = {
        params: { id: 'req-victim' },
        user: { id: 'user-attacker' },
        body: { title: 'Attacked Title' },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      // Execute route handler
      putRoute.route.stack[0].handle(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Forbidden' })
      );
    });

    it('returns 403 Forbidden when attacker tries to respond to seller offer', async () => {
      const sharedDb = {
        offers: [
          { id: 'off-victim', seller_id: 'real-seller', buyer_id: 'real-buyer', status: 'pending' },
        ],
      };
      const router = createSellerRoutes(authMiddleware, sharedDb);

      const respondRoute = router.stack.find(
        (layer) => layer.route && layer.route.path === '/offers/:id/respond' && layer.route.methods.put
      );

      const req = {
        params: { id: 'off-victim' },
        user: { id: 'attacker-user' },
        body: { action: 'accepted' },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      respondRoute.route.stack[0].handle(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Forbidden' })
      );
    });

    it('returns 403 Forbidden when attacker modifies notification owned by another user', async () => {
      const sharedDb = {
        notifications: [
          { id: 'notif-victim', user_id: 'victim-user', is_read: false },
        ],
      };
      const router = createNotificationRoutes(authMiddleware, sharedDb);

      const readRoute = router.stack.find(
        (layer) => layer.route && layer.route.path === '/:id/read' && layer.route.methods.put
      );

      const req = {
        params: { id: 'notif-victim' },
        user: { id: 'attacker-user' },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      readRoute.route.stack[0].handle(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Forbidden' })
      );
    });
  });

  // =========================================================================
  // 5. OFFER STATE MACHINE WORKFLOW
  // =========================================================================
  describe('5. Offer State Machine & Counter-Offer Negotiation', () => {
    it('supports full negotiation workflow: submitted -> countered -> accepted', () => {
      // 1. Buyer submits offer
      const offer = offerService.submitOffer({
        listingId: 'l-01',
        listingTitle: 'Sulur Farmland',
        buyerId: 'buyer-1',
        buyerName: 'Anand',
        sellerId: 'seller-1',
        offerAmount: 4000000,
        tokenAmount: 200000,
        terms: 'Within 30 days',
      });
      expect(offer.status).toBe('pending');

      // 2. Seller counters with higher price
      const countered = offerService.respondToOffer(
        offer.id,
        'seller-1',
        'countered',
        4300000,
        'Will close at 43L'
      );
      expect(countered.status).toBe('countered');
      expect(countered.counter_amount).toBe(4300000);

      // 3. Buyer accepts seller counter
      const accepted = offerService.respondToCounterOffer(offer.id, 'buyer-1', 'accepted');
      expect(accepted.status).toBe('accepted');
    });

    it('allows buyer to withdraw a pending offer', () => {
      const offer = offerService.submitOffer({
        listingId: 'l-01',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        offerAmount: 4000000,
      });

      const withdrawn = offerService.withdrawOffer(offer.id, 'buyer-1');
      expect(withdrawn.status).toBe('withdrawn');
    });
  });

  // =========================================================================
  // 6. UI COMPONENT INTEGRATION
  // =========================================================================
  describe('6. UI Component Integration Tests', () => {
    it('renders MatchScoreCard with deterministic score and why/what explainability', () => {
      const matchResult = {
        score: 88,
        tier: 'high',
        label: 'Excellent Match',
        whyItMatches: ['Price is within budget', 'Target district matches: Coimbatore'],
        whatItDoesntSatisfy: ['Road width is 15 ft (preferred 20 ft)'],
        breakdown: {
          location: { score: 25, maxScore: 25, label: 'Location', status: 'pass' },
          price: { score: 25, maxScore: 25, label: 'Price', status: 'pass' },
        },
      };

      render(<MatchScoreCard matchResult={matchResult} requirementTitle="1-Acre Farmland" />);

      // Verify score display
      expect(screen.getByText('88')).toBeDefined();
      expect(screen.getByText('Excellent Match')).toBeDefined();

      // Verify explainability sections
      expect(screen.getByText(/Why it matches/i)).toBeDefined();
      expect(screen.getByText(/Price is within budget/i)).toBeDefined();
      expect(screen.getByText(/What it doesn't satisfy/i)).toBeDefined();
      expect(screen.getByText(/Road width is 15 ft/i)).toBeDefined();

      // Verify explicit probability prohibition notice
      expect(screen.getByText(/not a probability/i)).toBeDefined();
    });

    it('renders NotificationBell with unread badge count', () => {
      const mockAuth = {
        user: { id: 'test-buyer', email: 'test@prabrix.local' },
      };

      render(
        <AuthContext.Provider value={mockAuth}>
          <MemoryRouter>
            <NotificationBell />
          </MemoryRouter>
        </AuthContext.Provider>
      );

      // Verify notification button exists
      const bellButton = screen.getByTitle('Notifications');
      expect(bellButton).toBeDefined();

      // Open dropdown
      fireEvent.click(bellButton);
      expect(screen.getByText(/Notifications/i)).toBeDefined();
    });
  });
});
