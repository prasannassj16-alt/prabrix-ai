import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

describe('Role-Based Route Guards & Phone Verification Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const setupAuth = (user) => {
    if (user) {
      localStorage.setItem(
        'prabrix_demo_auth_session',
        JSON.stringify({
          user,
          access_token: 'demo-token',
        })
      );
    }
  };

  const renderGuardedApp = (initialRoute = '/buyer', allowedRoles = ['buyer']) => {
    return render(
      <AuthProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route path="/login" element={<div>LOGIN_PAGE</div>} />
            <Route path="/verify-otp" element={<div>OTP_VERIFY_PAGE</div>} />
            <Route
              path="/buyer"
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <div>BUYER_CONTENT</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller"
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <div>SELLER_CONTENT</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div>ADMIN_CONTENT</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );
  };

  it('redirects unauthenticated visitor to login page', () => {
    renderGuardedApp('/buyer');
    expect(screen.getByText('LOGIN_PAGE')).toBeInTheDocument();
  });

  it('redirects authenticated user with unverified phone to /verify-otp', () => {
    setupAuth({
      id: 'user-1',
      email: 'test@prabrix.local',
      role: 'buyer',
      is_phone_verified: false,
    });

    renderGuardedApp('/buyer');
    expect(screen.getByText('OTP_VERIFY_PAGE')).toBeInTheDocument();
  });

  it('allows verified buyer to access buyer content', () => {
    setupAuth({
      id: 'buyer-1',
      email: 'buyer@prabrix.local',
      role: 'buyer',
      is_phone_verified: true,
    });

    renderGuardedApp('/buyer');
    expect(screen.getByText('BUYER_CONTENT')).toBeInTheDocument();
  });

  it('blocks verified buyer from accessing seller portal', () => {
    setupAuth({
      id: 'buyer-1',
      email: 'buyer@prabrix.local',
      role: 'buyer',
      is_phone_verified: true,
    });

    renderGuardedApp('/seller');
    expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument();
  });

  it('allows user with "both" role to access both buyer and seller content', () => {
    setupAuth({
      id: 'dual-1',
      email: 'dual@prabrix.local',
      role: 'both',
      is_phone_verified: true,
    });

    const { unmount } = renderGuardedApp('/buyer');
    expect(screen.getByText('BUYER_CONTENT')).toBeInTheDocument();
    unmount();

    renderGuardedApp('/seller');
    expect(screen.getByText('SELLER_CONTENT')).toBeInTheDocument();
  });

  it('allows admin role to access admin portal', () => {
    setupAuth({
      id: 'admin-1',
      email: 'admin@prabrix.local',
      role: 'admin',
      is_phone_verified: true,
    });

    renderGuardedApp('/admin');
    expect(screen.getByText('ADMIN_CONTENT')).toBeInTheDocument();
  });
});
