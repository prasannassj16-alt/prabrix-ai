import { describe, it, expect, vi } from 'vitest';
import { createAuthMiddleware } from '../../server/middleware/authMiddleware';

describe('Backend Auth & Role Middleware Unit Tests', () => {
  const middleware = createAuthMiddleware(null); // Demo mode middleware

  describe('requireAuth', () => {
    it('returns 401 if Authorization header is missing', async () => {
      const req = { headers: {} };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await middleware.requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Unauthorized' })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('attaches verified user identity when valid bearer token is supplied', async () => {
      const req = {
        headers: {
          authorization: 'Bearer demo_access_token_123',
        },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await middleware.requireAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe('demo-verified-user');
    });
  });

  describe('requirePhoneVerified', () => {
    it('returns 403 PHONE_NOT_VERIFIED if user phone is not verified', () => {
      const req = {
        user: { id: 'u1', isPhoneVerified: false },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      middleware.requirePhoneVerified(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'PHONE_NOT_VERIFIED' })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('calls next() if phone is verified', () => {
      const req = {
        user: { id: 'u1', isPhoneVerified: true },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      middleware.requirePhoneVerified(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('blocks buyer from seller-only endpoint', () => {
      const req = {
        user: { id: 'u1', role: 'buyer' },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      middleware.requireRole(['seller'])(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('allows "both" role user on seller endpoint', () => {
      const req = {
        user: { id: 'u1', role: 'both' },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      middleware.requireRole(['seller'])(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('allows admin role on any role-guarded endpoint', () => {
      const req = {
        user: { id: 'u1', role: 'admin' },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      middleware.requireRole(['seller'])(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
