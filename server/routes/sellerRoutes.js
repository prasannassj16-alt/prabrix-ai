import { Router } from 'express';

export const createSellerRoutes = (authMiddleware, sharedDb = null) => {
  const router = Router();
  const { requireAuth, requirePhoneVerified, requireRole } = authMiddleware;

  // Protect all seller endpoints with authentication, verified phone, and seller role
  router.use(requireAuth);
  router.use(requirePhoneVerified);
  router.use(requireRole(['seller']));

  // In-memory listings store
  let listings = sharedDb?.listings || [
    {
      id: '11111111-1111-1111-1111-111111111101',
      owner_id: 'demo-verified-user',
      title: '[DEMO] Sulur Farmland - 1 Acre',
      status: 'published',
      is_demo: true,
    },
    {
      id: '11111111-1111-1111-1111-111111111102',
      owner_id: 'other-seller-888',
      title: '[DEMO] Private Industrial Land for Other Seller',
      status: 'published',
      is_demo: true,
    },
  ];

  // In-memory inquiries store
  let inquiries = sharedDb?.inquiries || [
    {
      id: '66666666-6666-6666-6666-666666666601',
      seller_id: 'demo-verified-user',
      buyer_id: 'test-buyer',
      listing_id: '11111111-1111-1111-1111-111111111101',
      message: '[DEMO] Inquiring on borewell yield',
      status: 'unread',
      is_demo: true,
      created_at: new Date().toISOString(),
    },
    {
      id: '66666666-6666-6666-6666-666666666602',
      seller_id: 'other-seller-888',
      buyer_id: 'test-buyer-2',
      listing_id: '11111111-1111-1111-1111-111111111102',
      message: '[DEMO] Private inquiry intended for another seller',
      status: 'unread',
      is_demo: true,
      created_at: new Date().toISOString(),
    },
  ];

  // In-memory offers store
  let offers = sharedDb?.offers || [
    {
      id: 'offer-seller-01',
      seller_id: 'demo-verified-user',
      buyer_id: 'test-buyer',
      listing_id: '11111111-1111-1111-1111-111111111101',
      listing_title: '[DEMO] Sulur Farmland - 1 Acre',
      offer_amount: 4200000,
      token_amount: 200000,
      status: 'pending',
      created_at: new Date().toISOString(),
    },
    {
      id: 'offer-seller-02',
      seller_id: 'other-seller-888',
      buyer_id: 'test-buyer-2',
      listing_id: '11111111-1111-1111-1111-111111111102',
      listing_title: '[DEMO] Private Industrial Land',
      offer_amount: 32000000,
      token_amount: 1000000,
      status: 'pending',
      created_at: new Date().toISOString(),
    },
  ];

  // GET /api/seller/my-listings - Returns listings strictly belonging to authenticated seller
  router.get('/my-listings', (req, res) => {
    const userListings = listings.filter((l) => l.owner_id === req.user.id);
    res.json({
      success: true,
      user: req.user.email,
      role: req.user.role,
      listings: userListings,
    });
  });

  // GET /api/seller/inquiries - Returns inquiries strictly belonging to authenticated seller
  router.get('/inquiries', (req, res) => {
    const userInquiries = inquiries.filter((i) => i.seller_id === req.user.id);
    res.json({
      success: true,
      inquiries: userInquiries,
    });
  });

  // PUT /api/seller/inquiries/:id/status - Updates inquiry status with ownership check
  router.put('/inquiries/:id/status', (req, res) => {
    const inquiry = inquiries.find((i) => i.id === req.params.id);
    if (!inquiry) {
      return res.status(404).json({ error: 'NotFound', message: 'Inquiry not found.' });
    }

    // Strict Authorization: User may only update inquiries addressed to them
    if (inquiry.seller_id !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied. You may only manage inquiries sent for your own properties.',
      });
    }

    const { status, seller_reply } = req.body;
    if (status) inquiry.status = status;
    if (seller_reply) inquiry.seller_reply = seller_reply;
    inquiry.updated_at = new Date().toISOString();

    res.json({ success: true, inquiry });
  });

  // GET /api/seller/offers - Returns purchase offers strictly received by this seller
  router.get('/offers', (req, res) => {
    const userOffers = offers.filter((o) => o.seller_id === req.user.id);
    res.json({
      success: true,
      offers: userOffers,
    });
  });

  // PUT /api/seller/offers/:id/respond - Responds to offer with ownership check
  router.put('/offers/:id/respond', (req, res) => {
    const offer = offers.find((o) => o.id === req.params.id);
    if (!offer) {
      return res.status(404).json({ error: 'NotFound', message: 'Offer not found.' });
    }

    // Strict Authorization: User may only respond to offers for their properties
    if (offer.seller_id !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied. You may only respond to offers sent for your properties.',
      });
    }

    const { action, counter_amount, notes } = req.body;
    if (!['accepted', 'rejected', 'countered'].includes(action)) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Invalid action. Must be accepted, rejected, or countered.',
      });
    }

    offer.status = action;
    if (action === 'countered') {
      offer.counter_amount = Number(counter_amount) || null;
    }
    if (notes) offer.response_notes = notes;
    offer.updated_at = new Date().toISOString();

    res.json({ success: true, offer });
  });

  return router;
};
