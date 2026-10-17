import { Router } from 'express';

export const createBuyerRoutes = (authMiddleware, sharedDb = null) => {
  const router = Router();
  const { requireAuth, requirePhoneVerified, requireRole } = authMiddleware;

  // Protect all buyer endpoints with authentication, verified phone, and buyer role
  router.use(requireAuth);
  router.use(requirePhoneVerified);
  router.use(requireRole(['buyer']));

  // In-memory requirements store for backend demonstration & unit tests
  let requirements = sharedDb?.requirements || [
    {
      id: '55555555-5555-5555-5555-555555555501',
      buyer_id: 'demo-verified-user',
      title: '[DEMO] 1-2 Acres Farmland around Coimbatore',
      preferred_property_type: 'agricultural',
      target_districts: ['Coimbatore', 'Tiruppur'],
      min_price: 3000000,
      max_price: 6000000,
      min_area_sqft: 40000,
      max_area_sqft: 90000,
      status: 'active',
      is_demo: true,
      created_at: new Date().toISOString(),
    },
    {
      id: '55555555-5555-5555-5555-555555555502',
      buyer_id: 'other-buyer-999',
      title: '[DEMO] Private Requirement for Another Buyer',
      preferred_property_type: 'industrial',
      target_districts: ['Kanchipuram'],
      min_price: 20000000,
      max_price: 50000000,
      status: 'active',
      is_demo: true,
      created_at: new Date().toISOString(),
    },
  ];

  // In-memory offers store
  let offers = sharedDb?.offers || [
    {
      id: 'offer-back-01',
      buyer_id: 'demo-verified-user',
      seller_id: 'demo-seller-1',
      listing_id: '11111111-1111-1111-1111-111111111101',
      listing_title: '[DEMO] Fertile Red Soil Farmland - 1 Acre',
      offer_amount: 4200000,
      status: 'pending',
      created_at: new Date().toISOString(),
    },
    {
      id: 'offer-back-02',
      buyer_id: 'other-buyer-999',
      seller_id: 'other-seller-888',
      listing_id: '11111111-1111-1111-1111-111111111102',
      listing_title: '[DEMO] Prime Industrial Land - 2.5 Acres',
      offer_amount: 32000000,
      status: 'pending',
      created_at: new Date().toISOString(),
    },
  ];

  // In-memory inquiries store
  let inquiries = sharedDb?.inquiries || [
    {
      id: 'inq-back-01',
      buyer_id: 'demo-verified-user',
      seller_id: 'demo-seller-1',
      listing_id: '11111111-1111-1111-1111-111111111101',
      message: '[DEMO] Inquiring on borewell yield',
      status: 'unread',
      created_at: new Date().toISOString(),
    },
  ];

  // GET /api/buyer/saved-properties
  router.get('/saved-properties', (req, res) => {
    res.json({
      success: true,
      user: req.user.email,
      role: req.user.role,
      savedProperties: [
        { id: '11111111-1111-1111-1111-111111111101', title: '[DEMO] Sulur Farmland - 1 Acre', is_demo: true },
      ],
    });
  });

  // GET /api/buyer/requirements - Strictly returns requirements belonging to authenticated user
  router.get('/requirements', (req, res) => {
    const userReqs = requirements.filter((r) => r.buyer_id === req.user.id);
    res.json({
      success: true,
      requirements: userReqs,
    });
  });

  // POST /api/buyer/requirements - Creates requirement assigned to authenticated user
  router.post('/requirements', (req, res) => {
    const { title, preferred_property_type, target_districts, min_price, max_price, min_area_sqft, max_area_sqft } = req.body;
    if (!title || title.trim().length < 3) {
      return res.status(400).json({ error: 'ValidationError', message: 'Title must be at least 3 characters.' });
    }

    const newReq = {
      id: 'req-' + Date.now(),
      buyer_id: req.user.id, // Strictly server-assigned
      title: title.trim(),
      preferred_property_type: preferred_property_type || 'agricultural',
      target_districts: target_districts || ['Coimbatore'],
      min_price: Number(min_price) || 0,
      max_price: Number(max_price) || 0,
      min_area_sqft: Number(min_area_sqft) || 0,
      max_area_sqft: Number(max_area_sqft) || 0,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    requirements.unshift(newReq);
    res.status(201).json({ success: true, requirement: newReq });
  });

  // PUT /api/buyer/requirements/:id - Updates requirement with ownership verification
  router.put('/requirements/:id', (req, res) => {
    const reqItem = requirements.find((r) => r.id === req.params.id);
    if (!reqItem) {
      return res.status(404).json({ error: 'NotFound', message: 'Requirement not found.' });
    }

    // Strict Authorization: User may only modify their own requirement
    if (reqItem.buyer_id !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied. You may only modify requirements that you own.',
      });
    }

    Object.assign(reqItem, req.body, {
      buyer_id: req.user.id, // Immutable owner
      id: reqItem.id, // Immutable ID
      updated_at: new Date().toISOString(),
    });

    res.json({ success: true, requirement: reqItem });
  });

  // DELETE /api/buyer/requirements/:id - Deletes requirement with ownership verification
  router.delete('/requirements/:id', (req, res) => {
    const reqItem = requirements.find((r) => r.id === req.params.id);
    if (!reqItem) {
      return res.status(404).json({ error: 'NotFound', message: 'Requirement not found.' });
    }

    if (reqItem.buyer_id !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied. You may only delete requirements that you own.',
      });
    }

    requirements = requirements.filter((r) => r.id !== req.params.id);
    res.json({ success: true, message: 'Requirement deleted successfully.' });
  });

  // GET /api/buyer/offers - Returns offers submitted by this buyer
  router.get('/offers', (req, res) => {
    const userOffers = offers.filter((o) => o.buyer_id === req.user.id);
    res.json({ success: true, offers: userOffers });
  });

  // POST /api/buyer/offers - Submits purchase offer
  router.post('/offers', (req, res) => {
    const { listing_id, listing_title, seller_id, offer_amount, token_amount, terms } = req.body;
    if (!listing_id || !offer_amount || Number(offer_amount) <= 0) {
      return res.status(400).json({ error: 'ValidationError', message: 'Valid listing and offer amount required.' });
    }

    const newOffer = {
      id: 'offer-' + Date.now(),
      listing_id,
      listing_title: listing_title || 'Land Parcel',
      buyer_id: req.user.id, // Strictly server-assigned
      seller_id: seller_id || 'demo-seller-1',
      offer_amount: Number(offer_amount),
      token_amount: Number(token_amount) || 0,
      terms: terms || '',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    offers.unshift(newOffer);
    res.status(201).json({ success: true, offer: newOffer });
  });

  // POST /api/buyer/offers/:id/withdraw - Withdraws offer with ownership verification
  router.post('/offers/:id/withdraw', (req, res) => {
    const offer = offers.find((o) => o.id === req.params.id);
    if (!offer) {
      return res.status(404).json({ error: 'NotFound', message: 'Offer not found.' });
    }

    // Strict Authorization check
    if (offer.buyer_id !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied. You may only withdraw offers that you created.',
      });
    }

    if (offer.status !== 'pending' && offer.status !== 'countered') {
      return res.status(400).json({
        error: 'BadRequest',
        message: `Cannot withdraw an offer with status '${offer.status}'.`,
      });
    }

    offer.status = 'withdrawn';
    offer.updated_at = new Date().toISOString();
    res.json({ success: true, offer });
  });

  // GET /api/buyer/inquiries - Returns inquiries sent by this buyer
  router.get('/inquiries', (req, res) => {
    const userInquiries = inquiries.filter((i) => i.buyer_id === req.user.id);
    res.json({ success: true, inquiries: userInquiries });
  });

  return router;
};
