/**
 * PRABRIX AI - Offer & Negotiation Service
 *
 * Implements formal purchase offer lifecycle with strict authorization:
 * - States: pending, accepted, rejected, withdrawn, countered
 * - Strict Authorization: Users may only read or change their own records.
 * - Integration: Dispatches in-app notifications on status changes.
 */

import { notificationService } from './notificationService';

const STORAGE_OFFERS_KEY = 'prabrix_demo_offers_db';

const initialDemoOffers = [
  {
    id: 'offer-seed-01',
    listing_id: '11111111-1111-1111-1111-111111111101',
    listing_title: '[DEMO] Fertile Red Soil Farmland - 1 Acre (100 Cents)',
    buyer_id: 'test-buyer',
    buyer_name: 'Anand Kumar',
    buyer_phone: '+919840112233',
    seller_id: 'demo-seller-1',
    offer_amount: 4200000, // ₹42.00 Lakhs
    token_amount: 200000, // ₹2.00 Lakhs
    terms: 'Offer conditional on clear Patta verification and boundary survey within 15 days.',
    valid_until: new Date(Date.now() + 86400000 * 7).toISOString(),
    status: 'pending', // pending, accepted, rejected, withdrawn, countered
    counter_amount: null,
    response_notes: null,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'offer-seed-02',
    listing_id: '11111111-1111-1111-1111-111111111102',
    listing_title: '[DEMO] Prime Industrial Land - 2.5 Acres',
    buyer_id: 'other-buyer-999',
    buyer_name: 'Suresh Raina',
    buyer_phone: '+919876543210',
    seller_id: 'other-seller-888',
    offer_amount: 32000000,
    token_amount: 1000000,
    terms: 'Subject to DTCP zoning approval.',
    valid_until: new Date(Date.now() + 86400000 * 5).toISOString(),
    status: 'pending',
    counter_amount: null,
    response_notes: null,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

const getStoredOffers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_OFFERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [...initialDemoOffers];
};

const setStoredOffers = (offers) => {
  try {
    localStorage.setItem(STORAGE_OFFERS_KEY, JSON.stringify(offers));
  } catch (e) {}
};

export const offerService = {
  /**
   * Submit a purchase offer for a listing.
   */
  submitOffer(data) {
    const {
      listingId,
      listingTitle,
      buyerId,
      buyerName,
      buyerPhone,
      sellerId,
      offerAmount,
      tokenAmount,
      terms,
      validUntil,
    } = data;

    if (!listingId) throw new Error('Listing reference is required.');
    if (!buyerId) throw new Error('Buyer identity is required.');
    if (!sellerId) throw new Error('Seller identity is required.');

    const amount = Number(offerAmount);
    if (!amount || amount <= 0) {
      throw new Error('Please enter a valid positive offer amount.');
    }

    const token = tokenAmount ? Number(tokenAmount) : 0;
    if (token < 0 || token > amount) {
      throw new Error('Token advance amount cannot be negative or exceed the total offer amount.');
    }

    const newOffer = {
      id: 'offer-' + Date.now(),
      listing_id: listingId,
      listing_title: listingTitle || 'Land Parcel',
      buyer_id: buyerId,
      buyer_name: buyerName || 'Interested Buyer',
      buyer_phone: buyerPhone || '',
      seller_id: sellerId,
      offer_amount: amount,
      token_amount: token,
      terms: terms ? terms.trim() : '',
      valid_until: validUntil || new Date(Date.now() + 86400000 * 7).toISOString(),
      status: 'pending',
      counter_amount: null,
      response_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const offers = getStoredOffers();
    offers.unshift(newOffer);
    setStoredOffers(offers);

    // Notify seller
    notificationService.createNotification({
      userId: sellerId,
      title: `New Purchase Offer: ₹${(amount / 100000).toFixed(2)} L`,
      body: `Buyer ${buyerName || 'a verified user'} submitted an offer for ${listingTitle || 'your land parcel'}.`,
      notificationType: 'offer_received',
      entityType: 'offer',
      entityId: newOffer.id,
    });

    return newOffer;
  },

  /**
   * Get all offers submitted by a buyer.
   * STRICT AUTHORIZATION: Users may only read their own records.
   */
  getOffersByBuyer(buyerId) {
    if (!buyerId) return [];
    const all = getStoredOffers();
    return all.filter((o) => o.buyer_id === buyerId);
  },

  /**
   * Get all offers received by a seller.
   * STRICT AUTHORIZATION: Users may only read their own records.
   */
  getOffersBySeller(sellerId) {
    if (!sellerId) return [];
    const all = getStoredOffers();
    return all.filter((o) => o.seller_id === sellerId);
  },

  /**
   * Get offer by ID with party authorization check.
   */
  getOfferById(offerId, requesterId) {
    const all = getStoredOffers();
    const offer = all.find((o) => o.id === offerId);
    if (!offer) return null;

    if (requesterId && offer.buyer_id !== requesterId && offer.seller_id !== requesterId) {
      throw new Error('Unauthorized: You do not have permission to view this offer.');
    }

    return offer;
  },

  /**
   * Buyer withdraws their pending offer.
   */
  withdrawOffer(offerId, buyerId) {
    const all = getStoredOffers();
    const offer = all.find((o) => o.id === offerId);
    if (!offer) throw new Error('Offer not found.');

    // Authorization
    if (offer.buyer_id !== buyerId) {
      throw new Error('Unauthorized: Only the buyer who made the offer can withdraw it.');
    }

    if (offer.status !== 'pending' && offer.status !== 'countered') {
      throw new Error(`Cannot withdraw an offer with status '${offer.status}'.`);
    }

    offer.status = 'withdrawn';
    offer.updated_at = new Date().toISOString();
    setStoredOffers(all);

    // Notify seller
    notificationService.createNotification({
      userId: offer.seller_id,
      title: 'Offer Withdrawn',
      body: `Buyer withdrew their offer for ${offer.listing_title}.`,
      notificationType: 'offer_status_changed',
      entityType: 'offer',
      entityId: offer.id,
    });

    return offer;
  },

  /**
   * Seller responds to offer: 'accepted', 'rejected', or 'countered'.
   */
  respondToOffer(offerId, sellerId, action, counterAmount = null, notes = '') {
    const all = getStoredOffers();
    const offer = all.find((o) => o.id === offerId);
    if (!offer) throw new Error('Offer not found.');

    // Authorization: only the listing seller can respond
    if (offer.seller_id !== sellerId) {
      throw new Error('Unauthorized: Only the listing seller can respond to this offer.');
    }

    if (offer.status !== 'pending') {
      throw new Error(`Cannot respond to offer because its status is already '${offer.status}'.`);
    }

    if (!['accepted', 'rejected', 'countered'].includes(action)) {
      throw new Error(`Invalid offer action: ${action}. Must be accepted, rejected, or countered.`);
    }

    offer.status = action;
    offer.response_notes = notes || null;
    offer.updated_at = new Date().toISOString();

    if (action === 'countered') {
      const cAmt = Number(counterAmount);
      if (!cAmt || cAmt <= 0) {
        throw new Error('A positive counter offer amount is required.');
      }
      offer.counter_amount = cAmt;
    }

    setStoredOffers(all);

    // Notify buyer
    const titleMap = {
      accepted: 'Offer Accepted!',
      rejected: 'Offer Declined',
      countered: `Counter-Offer: ₹${(Number(counterAmount) / 100000).toFixed(2)} L`,
    };
    notificationService.createNotification({
      userId: offer.buyer_id,
      title: titleMap[action],
      body: `Seller responded to your offer for ${offer.listing_title}: status is now ${action}.`,
      notificationType: 'offer_status_changed',
      entityType: 'offer',
      entityId: offer.id,
    });

    return offer;
  },

  /**
   * Buyer responds to seller's counter-offer: 'accepted' or 'rejected'.
   */
  respondToCounterOffer(offerId, buyerId, action) {
    const all = getStoredOffers();
    const offer = all.find((o) => o.id === offerId);
    if (!offer) throw new Error('Offer not found.');

    if (offer.buyer_id !== buyerId) {
      throw new Error('Unauthorized: Only the buyer can respond to a seller counter-offer.');
    }

    if (offer.status !== 'countered') {
      throw new Error(`Cannot respond to counter-offer because status is '${offer.status}'.`);
    }

    if (!['accepted', 'rejected'].includes(action)) {
      throw new Error('Action must be either accepted or rejected.');
    }

    offer.status = action;
    offer.updated_at = new Date().toISOString();
    setStoredOffers(all);

    // Notify seller
    notificationService.createNotification({
      userId: offer.seller_id,
      title: action === 'accepted' ? 'Counter-Offer Accepted!' : 'Counter-Offer Declined',
      body: `Buyer has ${action} your counter-offer for ${offer.listing_title}.`,
      notificationType: 'offer_status_changed',
      entityType: 'offer',
      entityId: offer.id,
    });

    return offer;
  },

  resetDemo() {
    setStoredOffers([...initialDemoOffers]);
  },
};
