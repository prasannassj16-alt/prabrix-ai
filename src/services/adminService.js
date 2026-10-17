/**
 * PRABRIX AI - Administrator & Platform Governance Service
 * Phase 9: Admin and finishing (section 15 of PROJECT_SPEC.md)
 *
 * FEATURES:
 * - Listing review & moderation queue (approve, reject with notes, pause).
 * - Reported listings queue (discrepancies, spam, fraud flags).
 * - User governance (role management, account suspension, phone verification toggle).
 * - Listing lifecycle status transitions with mandatory audit trail.
 * - Platform configuration for land types, measurement units, and feature flags.
 * - Strict verification that only administrators can perform governance operations.
 */

import { listingService } from './listingService';

const STORAGE_USERS_KEY = 'prabrix_demo_users_db';
const STORAGE_REPORTS_KEY = 'prabrix_demo_reports_db';
const STORAGE_AUDIT_KEY = 'prabrix_demo_audit_events_db';
const STORAGE_CONFIG_KEY = 'prabrix_demo_platform_config';

const DEFAULT_USERS = [
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
  {
    id: '00000000-0000-0000-0000-000000000004',
    full_name: 'Venkatesh Rao (Certified Agent)',
    email: 'agent.demo@prabrix.local',
    phone: '+91 98403 44556',
    role: 'both',
    is_phone_verified: true,
    is_suspended: false,
    created_at: '2026-03-10T00:00:00Z',
  },
];

const DEFAULT_CONFIG = {
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
    strictOverpassRateLimiting: true,
  },
};

const DEFAULT_REPORTS = [
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

const DEFAULT_AUDIT_LOGS = [
  {
    id: 'aud-001',
    actor_id: '00000000-0000-0000-0000-000000000001',
    actor_email: 'admin@prabrix.local',
    action: 'ADMIN_PORTAL_ACCESS',
    entity_type: 'auth',
    entity_id: '00000000-0000-0000-0000-000000000001',
    details: 'Administrator logged into platform governance console',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'aud-002',
    actor_id: '00000000-0000-0000-0000-000000000002',
    actor_email: 'demo.seller@prabrix.local',
    action: 'LISTING_PUBLISHED',
    entity_type: 'listings',
    entity_id: '11111111-1111-1111-1111-111111111101',
    details: 'Listing 11111111 published after automated cadastral verification',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export const adminService = {
  /**
   * Helper: enforce admin authorization
   */
  assertAdmin(user) {
    if (!user || user.role !== 'admin') {
      throw new Error('Forbidden: Platform administrator privileges required.');
    }
  },

  /**
   * Records an immutable audit log entry
   */
  recordAuditEvent(actorUser, action, entityType, entityId, details) {
    try {
      const raw = localStorage.getItem(STORAGE_AUDIT_KEY);
      const logs = raw ? JSON.parse(raw) : DEFAULT_AUDIT_LOGS;

      const newLog = {
        id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        actor_id: actorUser?.id || 'system',
        actor_email: actorUser?.email || 'system@prabrix.local',
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
        created_at: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_AUDIT_KEY, JSON.stringify([newLog, ...logs]));
      return newLog;
    } catch (e) {
      console.error('Audit logging error:', e);
    }
  },

  /**
   * Retrieves pending review listings queue
   */
  getPendingReviewListings(adminUser) {
    adminService.assertAdmin(adminUser);
    const all = listingService.getListings();
    return all.filter((l) => l.status === 'pending_review');
  },

  /**
   * Moderates a pending listing (Approve / Reject)
   */
  reviewListing(listingId, decision, moderationNotes, adminUser) {
    adminService.assertAdmin(adminUser);

    const newStatus = decision === 'approve' ? 'published' : 'rejected';
    const updated = listingService.updateListingStatus(listingId, newStatus, moderationNotes);

    adminService.recordAuditEvent(
      adminUser,
      `LISTING_REVIEW_${decision.toUpperCase()}`,
      'listings',
      listingId,
      `Moderator decision: ${decision}. Notes: ${moderationNotes || 'None'}`
    );

    return updated;
  },

  /**
   * Retrieves reported listings queue
   */
  getReportedListings(adminUser) {
    adminService.assertAdmin(adminUser);
    try {
      const raw = localStorage.getItem(STORAGE_REPORTS_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_REPORTS;
    } catch (e) {
      return DEFAULT_REPORTS;
    }
  },

  /**
   * Submits a report against a listing (user-facing)
   */
  submitListingReport(listingId, listingTitle, reportingUser, reason, details) {
    try {
      const raw = localStorage.getItem(STORAGE_REPORTS_KEY);
      const reports = raw ? JSON.parse(raw) : DEFAULT_REPORTS;

      const newReport = {
        id: `rep-${Date.now()}`,
        listing_id: listingId,
        listing_title: listingTitle || 'Land Listing',
        reported_by: reportingUser?.id || 'anonymous',
        reporter_name: reportingUser?.full_name || 'Anonymous User',
        reason,
        reason_label: reason.replace('_', ' ').toUpperCase(),
        details,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify([newReport, ...reports]));
      return newReport;
    } catch (e) {
      console.error('Report submission error:', e);
    }
  },

  /**
   * Resolves a reported listing
   */
  resolveReport(reportId, action, resolutionNotes, adminUser) {
    adminService.assertAdmin(adminUser);

    const raw = localStorage.getItem(STORAGE_REPORTS_KEY);
    let reports = raw ? JSON.parse(raw) : DEFAULT_REPORTS;

    const report = reports.find((r) => r.id === reportId);
    if (!report) {
      throw new Error(`Report ${reportId} not found.`);
    }

    report.status = action === 'dismiss' ? 'dismissed' : 'resolved';
    report.resolution_action = action;
    report.resolved_by = adminUser.email;
    report.resolved_at = new Date().toISOString();
    report.resolution_notes = resolutionNotes || 'Resolved by administrator.';

    localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(reports));

    // If action is takedown, pause or reject the listing
    if (action === 'takedown' && report.listing_id) {
      listingService.updateListingStatus(
        report.listing_id,
        'rejected',
        `Taken down due to report ${reportId}: ${resolutionNotes}`
      );
    }

    adminService.recordAuditEvent(
      adminUser,
      'REPORT_RESOLVED',
      'reports',
      reportId,
      `Action: ${action}. Notes: ${resolutionNotes}`
    );

    return report;
  },

  /**
   * Retrieves all registered user profiles
   */
  getRegisteredUsers(adminUser) {
    adminService.assertAdmin(adminUser);
    try {
      const raw = localStorage.getItem(STORAGE_USERS_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_USERS;
    } catch (e) {
      return DEFAULT_USERS;
    }
  },

  /**
   * Updates user profile governance fields (role, suspension, phone verification)
   */
  updateUserGovernance(userId, updates, adminUser) {
    adminService.assertAdmin(adminUser);

    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    let users = raw ? JSON.parse(raw) : DEFAULT_USERS;

    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex < 0) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    // Safety guard: prevent administrator from demoting themselves if only admin
    if (userId === adminUser.id && updates.role && updates.role !== 'admin') {
      const adminCount = users.filter((u) => u.role === 'admin').length;
      if (adminCount <= 1) {
        throw new Error('Action blocked: Cannot demote the sole platform administrator.');
      }
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));

    adminService.recordAuditEvent(
      adminUser,
      'USER_GOVERNANCE_UPDATED',
      'profiles',
      userId,
      `Updated user ${users[userIndex].email}: ${JSON.stringify(updates)}`
    );

    return users[userIndex];
  },

  /**
   * Retrieves all listings across any status for management
   */
  getAllListings(statusFilter = 'all', adminUser) {
    adminService.assertAdmin(adminUser);
    const all = listingService.getListings();
    if (statusFilter === 'all') return all;
    return all.filter((l) => l.status === statusFilter);
  },

  /**
   * Updates listing status with mandatory admin audit entry
   */
  setListingStatus(listingId, newStatus, reason, adminUser) {
    adminService.assertAdmin(adminUser);
    const updated = listingService.updateListingStatus(listingId, newStatus, reason);

    adminService.recordAuditEvent(
      adminUser,
      'ADMIN_LISTING_STATUS_CHANGE',
      'listings',
      listingId,
      `Status changed to ${newStatus}. Reason: ${reason || 'Administrative update'}`
    );

    return updated;
  },

  /**
   * Retrieves platform audit history
   */
  getAuditHistory(filters = {}, adminUser) {
    adminService.assertAdmin(adminUser);
    try {
      const raw = localStorage.getItem(STORAGE_AUDIT_KEY);
      let logs = raw ? JSON.parse(raw) : DEFAULT_AUDIT_LOGS;

      if (filters.action) {
        logs = logs.filter((l) => l.action.toLowerCase().includes(filters.action.toLowerCase()));
      }
      if (filters.entityType) {
        logs = logs.filter((l) => l.entity_type === filters.entityType);
      }

      return logs;
    } catch (e) {
      return DEFAULT_AUDIT_LOGS;
    }
  },

  /**
   * Retrieves platform configuration
   */
  getPlatformConfig(adminUser) {
    adminService.assertAdmin(adminUser);
    try {
      const raw = localStorage.getItem(STORAGE_CONFIG_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_CONFIG;
    } catch (e) {
      return DEFAULT_CONFIG;
    }
  },

  /**
   * Updates platform configuration
   */
  updatePlatformConfig(newConfig, adminUser) {
    adminService.assertAdmin(adminUser);
    try {
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(newConfig));

      adminService.recordAuditEvent(
        adminUser,
        'PLATFORM_CONFIG_UPDATED',
        'config',
        'system',
        'Updated allowable land types, measurement units, and system feature flags'
      );

      return newConfig;
    } catch (e) {
      console.error('Config update error:', e);
      return DEFAULT_CONFIG;
    }
  },
};
