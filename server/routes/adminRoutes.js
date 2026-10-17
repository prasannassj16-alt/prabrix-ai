import { Router } from 'express';

export const createAdminRoutes = (authMiddleware) => {
  const router = Router();
  const { requireAuth, requireRole } = authMiddleware;

  // Protect all admin endpoints: strictly requires valid JWT and role === 'admin'
  router.use(requireAuth);
  router.use(requireRole(['admin']));

  // In-memory demo store for backend operations
  let platformConfig = {
    landTypes: [
      { id: 'agricultural', name: 'Agricultural Farmland', active: true },
      { id: 'residential', name: 'Residential / Villa Plot', active: true },
      { id: 'commercial', name: 'Commercial Land', active: true },
      { id: 'industrial', name: 'Industrial / Logistics Plot', active: true },
      { id: 'mixed_use', name: 'Mixed-Use Development Land', active: true },
    ],
    units: [
      { id: 'sqft', name: 'Square Feet', symbol: 'sq.ft.', active: true },
      { id: 'sqm', name: 'Square Meters', symbol: 'sq.m.', active: true },
      { id: 'acre', name: 'Acres', symbol: 'ac', active: true },
      { id: 'hectare', name: 'Hectares', symbol: 'ha', active: true },
      { id: 'cent', name: 'Cents (Tamil Nadu standard)', symbol: 'cents', active: true },
    ],
    featureFlags: {
      enableAiValuation: true,
      requirePhoneVerifiedToPublish: true,
      enableDemoOtpBanner: true,
      overpassMirrorFailover: true,
    },
  };

  let reportsStore = [
    {
      id: 'rep-001',
      listing_id: '11111111-1111-1111-1111-111111111102',
      listing_title: '[DEMO] DTCP Approved Villa Plot - 2,400 Sq.Ft.',
      reported_by: '00000000-0000-0000-0000-000000000003',
      reporter_name: 'Karthik Raja',
      reason: 'wrong_price',
      reason_label: 'Price Discrepancy with Local SRO Guideline',
      details: 'Seller listed at ₹2,833/sq.ft. but adjacent plots are registered at ₹2,200/sq.ft. Please verify guideline match.',
      status: 'pending',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ];

  let auditEvents = [
    {
      id: 'aud-001',
      actor_id: '00000000-0000-0000-0000-000000000001',
      actor_email: 'admin@prabrix.local',
      action: 'ADMIN_LOGIN',
      entity_type: 'auth',
      entity_id: '00000000-0000-0000-0000-000000000001',
      details: 'Administrator logged into governance portal',
      created_at: new Date().toISOString(),
    },
    {
      id: 'aud-002',
      actor_id: '00000000-0000-0000-0000-000000000002',
      actor_email: 'demo.seller@prabrix.local',
      action: 'LISTING_SUBMITTED',
      entity_type: 'listings',
      entity_id: '11111111-1111-1111-1111-111111111101',
      details: 'Listing submitted for moderation review',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ];

  // 1. GET /api/admin/users
  router.get('/users', (req, res) => {
    res.json({
      success: true,
      admin: req.user.email,
      users: [
        {
          id: '00000000-0000-0000-0000-000000000001',
          full_name: 'Platform Administrator',
          email: 'admin@prabrix.local',
          phone: '+91 99999 00000',
          role: 'admin',
          is_phone_verified: true,
          is_suspended: false,
          created_at: '2026-01-01T00:00:00Z',
        },
        {
          id: '00000000-0000-0000-0000-000000000002',
          full_name: 'Ramesh Sundaram (Demo Seller)',
          email: 'demo.seller@prabrix.local',
          phone: '+91 98401 12233',
          role: 'seller',
          is_phone_verified: true,
          is_suspended: false,
          created_at: '2026-02-15T00:00:00Z',
        },
        {
          id: '00000000-0000-0000-0000-000000000003',
          full_name: 'Karthik Raja (Demo Buyer)',
          email: 'demo.buyer@prabrix.local',
          phone: '+91 98402 33445',
          role: 'buyer',
          is_phone_verified: true,
          is_suspended: false,
          created_at: '2026-03-01T00:00:00Z',
        },
      ],
    });
  });

  // 2. PATCH /api/admin/users/:id
  router.patch('/users/:id', (req, res) => {
    const { id } = req.params;
    const { role, is_suspended, is_phone_verified } = req.body;

    auditEvents.unshift({
      id: `aud-${Date.now()}`,
      actor_id: req.user.id,
      actor_email: req.user.email,
      action: 'USER_PROFILE_UPDATED',
      entity_type: 'profiles',
      entity_id: id,
      details: `Updated user flags: role=${role}, suspended=${is_suspended}`,
      created_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: `User ${id} updated successfully by administrator ${req.user.email}.`,
      updatedFields: { role, is_suspended, is_phone_verified },
    });
  });

  // 3. GET /api/admin/reports
  router.get('/reports', (req, res) => {
    res.json({
      success: true,
      reports: reportsStore,
    });
  });

  // 4. POST /api/admin/reports/:id/resolve
  router.post('/reports/:id/resolve', (req, res) => {
    const { id } = req.params;
    const { action, resolutionNotes } = req.body; // 'dismiss' | 'takedown' | 'warn_seller'

    const report = reportsStore.find((r) => r.id === id);
    if (report) {
      report.status = action === 'dismiss' ? 'dismissed' : 'resolved';
      report.resolved_by = req.user.email;
      report.resolved_at = new Date().toISOString();
      report.resolution_notes = resolutionNotes || 'Resolved by administrator.';
    }

    auditEvents.unshift({
      id: `aud-${Date.now()}`,
      actor_id: req.user.id,
      actor_email: req.user.email,
      action: 'REPORT_RESOLVED',
      entity_type: 'reports',
      entity_id: id,
      details: `Report action: ${action}. Notes: ${resolutionNotes}`,
      created_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: `Report ${id} marked as ${action}.`,
    });
  });

  // 5. GET /api/admin/audit-logs
  router.get('/audit-logs', (req, res) => {
    res.json({
      success: true,
      logs: auditEvents,
      totalCount: auditEvents.length,
    });
  });

  // 6. GET /api/admin/config
  router.get('/config', (req, res) => {
    res.json({
      success: true,
      config: platformConfig,
    });
  });

  // 7. PUT /api/admin/config
  router.put('/config', (req, res) => {
    const { landTypes, units, featureFlags } = req.body;
    if (landTypes) platformConfig.landTypes = landTypes;
    if (units) platformConfig.units = units;
    if (featureFlags) platformConfig.featureFlags = featureFlags;

    auditEvents.unshift({
      id: `aud-${Date.now()}`,
      actor_id: req.user.id,
      actor_email: req.user.email,
      action: 'PLATFORM_CONFIG_UPDATED',
      entity_type: 'config',
      entity_id: 'system',
      details: 'Platform land types, units, and feature flags updated',
      created_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Platform configuration updated successfully.',
      config: platformConfig,
    });
  });

  return router;
};
