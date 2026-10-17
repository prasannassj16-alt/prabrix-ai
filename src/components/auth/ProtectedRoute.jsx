import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, PhoneCall } from 'lucide-react';

export const ProtectedRoute = ({
  children,
  allowedRoles = [], // e.g. ['buyer', 'seller', 'admin']
  requirePhoneVerified = true,
}) => {
  const { user, session, loading, isPhoneVerified } = useAuth();
  const location = useLocation();

  // Documented setting check: can be enabled/disabled via environment variable
  const enforcePhoneVerification =
    requirePhoneVerified &&
    import.meta.env.VITE_REQUIRE_PHONE_VERIFIED !== 'false';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // 1. Authentication Check
  if (!user || !session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 2. Phone Verification Guard (Block access until mobile OTP is verified)
  if (enforcePhoneVerification && !isPhoneVerified) {
    return <Navigate to="/verify-otp" state={{ from: location.pathname }} replace />;
  }

  // 3. Role-Based Guard (Separating buyer, seller, admin)
  if (allowedRoles.length > 0) {
    const userRole = user.role || 'buyer';

    // Role hierarchy / multi-role resolution:
    // - 'admin' has access to all portals
    // - 'both' has access to 'buyer' and 'seller' portals
    const hasAccess =
      userRole === 'admin' ||
      allowedRoles.includes(userRole) ||
      (userRole === 'both' && (allowedRoles.includes('buyer') || allowedRoles.includes('seller')));

    if (!hasAccess) {
      return (
        <div className="max-w-lg mx-auto my-12 p-8 bg-white border border-red-200 rounded-xl shadow-sm text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 text-red-700 rounded-full mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-sm text-slate-600 mt-2">
            Your current account role (<span className="font-semibold text-slate-800">{userRole}</span>) does not have authorization to view this section.
          </p>
          <div className="mt-6 flex justify-center space-x-3">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 border border-slate-300 rounded-md text-sm text-slate-700 hover:bg-slate-50 font-medium"
            >
              Go Back
            </button>
            <a
              href="/profile"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium"
            >
              Update Role in Profile
            </a>
          </div>
        </div>
      );
    }
  }

  return children;
};
