import { describe, it, expect, beforeEach } from 'vitest';
import { adminService } from '../services/adminService';

describe('Phase 9: Admin Governance & Moderation Service', () => {
  const mockAdmin = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@prabrix.local',
    role: 'admin',
  };

  const mockNonAdmin = {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'seller@example.com',
    role: 'seller',
  };

  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. Admin Rights Enforcement', () => {
    it('throws error when non-admin attempts to access governance queues', () => {
      expect(() => adminService.getPendingReviewListings(mockNonAdmin)).toThrow(/administrator privileges required/i);
      expect(() => adminService.getReportedListings(mockNonAdmin)).toThrow(/administrator privileges required/i);
      expect(() => adminService.getRegisteredUsers(mockNonAdmin)).toThrow(/administrator privileges required/i);
      expect(() => adminService.getAuditHistory({}, mockNonAdmin)).toThrow(/administrator privileges required/i);
    });

    it('allows verified administrator to access queues', () => {
      expect(() => adminService.assertAdmin(mockAdmin)).not.toThrow();
      const users = adminService.getRegisteredUsers(mockAdmin);
      expect(users.length).toBeGreaterThan(0);
    });
  });

  describe('2. Listing Review Queue & Moderation', () => {
    it('approves a pending listing, transitions status to published, and logs audit event', () => {
      // Listing in demo data is '11111111-1111-1111-1111-111111111101'
      const updated = adminService.reviewListing(
        '11111111-1111-1111-1111-111111111101',
        'approve',
        'Approved by legal officer after cadastral check',
        mockAdmin
      );

      expect(updated.status).toBe('published');

      // Verify audit event was logged
      const logs = adminService.getAuditHistory({ action: 'LISTING_REVIEW_APPROVE' }, mockAdmin);
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].actor_email).toBe(mockAdmin.email);
    });

    it('rejects a pending listing with moderation notes', () => {
      const updated = adminService.reviewListing(
        '11111111-1111-1111-1111-111111111101',
        'reject',
        'Mismatched Survey Number on Patta extract',
        mockAdmin
      );

      expect(updated.status).toBe('rejected');
    });
  });

  describe('3. Reported Listings & Resolution', () => {
    it('allows submitting and resolving listing reports', () => {
      const report = adminService.submitListingReport(
        '11111111-1111-1111-1111-111111111101',
        'Sulur Farmland',
        mockNonAdmin,
        'fraud_suspected',
        'Double registration deed suspected'
      );

      expect(report.id).toBeDefined();
      expect(report.status).toBe('pending');

      const allReports = adminService.getReportedListings(mockAdmin);
      expect(allReports.some((r) => r.id === report.id)).toBe(true);

      // Resolve report as takedown
      const resolved = adminService.resolveReport(report.id, 'takedown', 'Listing removed pending inquiry', mockAdmin);
      expect(resolved.status).toBe('resolved');
      expect(resolved.resolution_action).toBe('takedown');
    });
  });

  describe('4. User Governance & Roles', () => {
    it('updates user role and toggles account suspension', () => {
      const targetUserId = '00000000-0000-0000-0000-000000000003';
      const updated = adminService.updateUserGovernance(
        targetUserId,
        { role: 'both', is_suspended: true },
        mockAdmin
      );

      expect(updated.role).toBe('both');
      expect(updated.is_suspended).toBe(true);

      const users = adminService.getRegisteredUsers(mockAdmin);
      const found = users.find((u) => u.id === targetUserId);
      expect(found.is_suspended).toBe(true);
    });

    it('blocks sole platform administrator from demoting themselves', () => {
      expect(() => {
        adminService.updateUserGovernance(mockAdmin.id, { role: 'buyer' }, mockAdmin);
      }).toThrow(/Cannot demote the sole platform administrator/i);
    });
  });

  describe('5. Platform Configuration (Land Types & Units)', () => {
    it('retrieves and updates platform land types and units', () => {
      const currentConfig = adminService.getPlatformConfig(mockAdmin);
      expect(currentConfig.landTypes.length).toBe(5);
      expect(currentConfig.units.length).toBe(5);

      const modifiedConfig = {
        ...currentConfig,
        featureFlags: {
          ...currentConfig.featureFlags,
          enableAiValuation: false,
        },
      };

      const saved = adminService.updatePlatformConfig(modifiedConfig, mockAdmin);
      expect(saved.featureFlags.enableAiValuation).toBe(false);

      const reloaded = adminService.getPlatformConfig(mockAdmin);
      expect(reloaded.featureFlags.enableAiValuation).toBe(false);
    });
  });
});
