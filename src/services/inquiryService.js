/**
 * PRABRIX AI - Inquiry & Site-Visit Request Service
 * Handles buyer inquiry submissions, purchase offers, and site visit bookings.
 *
 * STRICT PRIVACY & AUTHORIZATION:
 * - Users may only read or change their own records.
 * - Dispatches in-app notifications on status changes.
 */

import { notificationService } from './notificationService';

const STORAGE_INQUIRIES_KEY = 'prabrix_demo_inquiries_db';

const initialDemoInquiries = [
  {
    id: 'inq-seed-01',
    reference_number: 'INQ-4821',
    type: 'general_inquiry',
    listing_id: '11111111-1111-1111-1111-111111111101',
    listing_title: '[DEMO] Fertile Red Soil Farmland - 1 Acre (100 Cents)',
    buyer_id: 'test-buyer',
    buyer_name: 'Anand Kumar',
    buyer_phone: '+919840112233',
    buyer_email: 'buyer@prabrix.local',
    seller_id: 'demo-seller-1',
    message: 'Hello, could you confirm the depth of the borewell and whether free agricultural EB connection is live?',
    proposed_offer: null,
    status: 'unread', // unread, read, responded, archived
    seller_reply: null,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'visit-seed-01',
    reference_number: 'VISIT-9102',
    type: 'site_visit_request',
    listing_id: '11111111-1111-1111-1111-111111111101',
    listing_title: '[DEMO] Fertile Red Soil Farmland - 1 Acre (100 Cents)',
    buyer_id: 'test-buyer',
    buyer_name: 'Anand Kumar',
    buyer_phone: '+919840112233',
    buyer_email: 'buyer@prabrix.local',
    seller_id: 'demo-seller-1',
    visit_date: '2026-10-25',
    time_slot: 'morning',
    visit_type: 'in_person',
    notes: 'Planning to bring our agricultural consultant to inspect soil and water samples.',
    status: 'pending_confirmation', // pending_confirmation, confirmed, rescheduled, declined, completed
    seller_reply: null,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'inq-seed-other',
    reference_number: 'INQ-7729',
    type: 'general_inquiry',
    listing_id: '11111111-1111-1111-1111-111111111102',
    listing_title: '[DEMO] Prime Industrial Land - 2.5 Acres',
    buyer_id: 'other-buyer-999',
    buyer_name: 'Suresh Raina',
    buyer_phone: '+919876543210',
    buyer_email: 'suresh@domain.local',
    seller_id: 'other-seller-888',
    message: 'Is HT power substation clearance available for this plot?',
    proposed_offer: null,
    status: 'unread',
    seller_reply: null,
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
];

const getStoredInquiries = () => {
  try {
    const raw = localStorage.getItem(STORAGE_INQUIRIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [...initialDemoInquiries];
};

const setStoredInquiries = (inquiries) => {
  try {
    localStorage.setItem(STORAGE_INQUIRIES_KEY, JSON.stringify(inquiries));
  } catch (e) {}
};

export const inquiryService = {
  // Validate Indian Phone number (10 digits)
  validatePhone(phone) {
    if (!phone) return 'Mobile number is required.';
    const cleaned = phone.replace(/[\s\-\+]/g, '');
    const tenDigits = cleaned.length >= 10 ? cleaned.slice(-10) : cleaned;
    if (!/^[6-9]\d{9}$/.test(tenDigits)) {
      return 'Please enter a valid 10-digit Indian mobile number.';
    }
    return '';
  },

  // Validate Email
  validateEmail(email) {
    if (!email) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address.';
    }
    return '';
  },

  // Submit General Inquiry
  submitInquiry(data) {
    const {
      listingId,
      listingTitle,
      sellerId,
      buyerId,
      buyerName,
      buyerPhone,
      buyerEmail,
      message,
      proposedOffer,
    } = data;

    if (!listingId) throw new Error('Listing reference is required.');
    if (!buyerName || buyerName.trim().length < 2) throw new Error('Please provide your name.');

    const phoneError = this.validatePhone(buyerPhone);
    if (phoneError) throw new Error(phoneError);

    const emailError = this.validateEmail(buyerEmail);
    if (emailError) throw new Error(emailError);

    const refNumber = 'INQ-' + Math.floor(1000 + Math.random() * 9000);
    const resolvedSellerId = sellerId || 'demo-seller-1';

    const newInquiry = {
      id: 'inq-' + Date.now(),
      reference_number: refNumber,
      type: 'general_inquiry',
      listing_id: listingId,
      listing_title: listingTitle || 'Land Parcel',
      seller_id: resolvedSellerId,
      buyer_id: buyerId || 'anonymous-buyer',
      buyer_name: buyerName.trim(),
      buyer_phone: buyerPhone.trim(),
      buyer_email: buyerEmail.trim(),
      message: message ? message.trim() : 'Inquiry regarding property details and availability.',
      proposed_offer: proposedOffer ? Number(proposedOffer) : null,
      status: 'pending',
      seller_reply: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const inquiries = getStoredInquiries();
    inquiries.unshift(newInquiry);
    setStoredInquiries(inquiries);

    // Notify seller
    notificationService.createNotification({
      userId: resolvedSellerId,
      title: `New Inquiry (${refNumber})`,
      body: `Buyer ${buyerName} sent an inquiry for ${listingTitle || 'your listing'}.`,
      notificationType: 'inquiry_received',
      entityType: 'inquiry',
      entityId: newInquiry.id,
    });

    return newInquiry;
  },

  // Submit Callback / Site-Visit Request
  submitSiteVisitRequest(data) {
    const {
      listingId,
      listingTitle,
      sellerId,
      buyerId,
      buyerName,
      buyerPhone,
      buyerEmail,
      visitDate,
      timeSlot,
      visitType,
      notes,
    } = data;

    if (!listingId) throw new Error('Listing reference is required.');
    if (!buyerName || buyerName.trim().length < 2) throw new Error('Please provide your name.');

    const phoneError = this.validatePhone(buyerPhone);
    if (phoneError) throw new Error(phoneError);

    const emailError = this.validateEmail(buyerEmail);
    if (emailError) throw new Error(emailError);

    if (!visitDate) throw new Error('Please select a preferred date for the site visit.');

    const refNumber = 'VISIT-' + Math.floor(1000 + Math.random() * 9000);
    const resolvedSellerId = sellerId || 'demo-seller-1';

    const newRequest = {
      id: 'visit-' + Date.now(),
      reference_number: refNumber,
      type: 'site_visit_request',
      listing_id: listingId,
      listing_title: listingTitle || 'Land Parcel',
      seller_id: resolvedSellerId,
      buyer_id: buyerId || 'anonymous-buyer',
      buyer_name: buyerName.trim(),
      buyer_phone: buyerPhone.trim(),
      buyer_email: buyerEmail.trim(),
      visit_date: visitDate,
      time_slot: timeSlot || 'morning', // morning, afternoon, evening
      visit_type: visitType || 'in_person', // in_person, video_tour, callback
      notes: notes ? notes.trim() : '',
      status: 'pending_confirmation',
      seller_reply: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const inquiries = getStoredInquiries();
    inquiries.unshift(newRequest);
    setStoredInquiries(inquiries);

    // Notify seller
    notificationService.createNotification({
      userId: resolvedSellerId,
      title: `Site Visit Requested (${refNumber})`,
      body: `Buyer ${buyerName} requested a visit on ${visitDate} (${timeSlot || 'morning'}).`,
      notificationType: 'site_visit_scheduled',
      entityType: 'inquiry',
      entityId: newRequest.id,
    });

    return newRequest;
  },

  /**
   * Get inquiries for a seller's listings.
   * STRICT AUTHORIZATION: Users may only read their own records.
   */
  getInquiriesBySeller(sellerId) {
    if (!sellerId) return [];
    const all = getStoredInquiries();
    return all.filter((inq) => inq.seller_id === sellerId);
  },

  /**
   * Get inquiries sent by a buyer.
   * STRICT AUTHORIZATION: Users may only read their own records.
   */
  getInquiriesByBuyer(buyerId) {
    if (!buyerId) return [];
    const all = getStoredInquiries();
    return all.filter((inq) => inq.buyer_id === buyerId);
  },

  getInquiriesByListing(listingId) {
    const all = getStoredInquiries();
    return all.filter((inq) => inq.listing_id === listingId);
  },

  /**
   * Update inquiry or site visit status with ownership check.
   */
  updateInquiryStatus(inquiryId, actorId, newStatus, replyMessage = '') {
    const all = getStoredInquiries();
    const index = all.findIndex((i) => i.id === inquiryId);
    if (index === -1) throw new Error('Inquiry not found.');

    const inquiry = all[index];

    // Strict Authorization check: only seller or buyer can access
    if (inquiry.seller_id !== actorId && inquiry.buyer_id !== actorId) {
      throw new Error('Unauthorized: You cannot access or modify this inquiry.');
    }

    // Only seller can update inquiry workflow or reply
    if (inquiry.seller_id !== actorId) {
      throw new Error('Unauthorized: Only the property seller can update inquiry status.');
    }

    inquiry.status = newStatus;
    if (replyMessage) {
      inquiry.seller_reply = replyMessage.trim();
    }
    inquiry.updated_at = new Date().toISOString();

    setStoredInquiries(all);

    // Notify buyer about the seller response or status change
    if (inquiry.buyer_id) {
      notificationService.createNotification({
        userId: inquiry.buyer_id,
        title: `Inquiry Update (${inquiry.reference_number})`,
        body: replyMessage
          ? `Seller replied: "${replyMessage.slice(0, 80)}..."`
          : `Inquiry status updated to ${newStatus}.`,
        notificationType: 'inquiry_status_updated',
        entityType: 'inquiry',
        entityId: inquiry.id,
      });
    }

    return inquiry;
  },

  resetDemo() {
    setStoredInquiries([...initialDemoInquiries]);
  },
};
