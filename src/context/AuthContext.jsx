import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpPending, setOtpPending] = useState(false);
  const [otpPhone, setOtpPhone] = useState('');
  const [error, setError] = useState(null);

  // Initialize session on mount
  useEffect(() => {
    const init = () => {
      try {
        const current = authService.getCurrentSession();
        if (current && current.user) {
          setSession(current);
          setUser(current.user);
          // If user registered but hasn't verified phone, set OTP pending
          if (current.user.is_phone_verified === false) {
            setOtpPending(true);
            setOtpPhone(current.user.phone || '');
          }
        }
      } catch (err) {
        console.error('Session load error:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const register = async (formData) => {
    setError(null);
    try {
      const res = await authService.register(formData);
      setSession(res.session);
      setUser(res.user);
      setOtpPending(true);
      setOtpPhone(res.phone);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const verifyOtp = async (token) => {
    setError(null);
    try {
      const updatedSession = await authService.verifyMobileOtp(otpPhone, token);
      setSession(updatedSession);
      setUser(updatedSession.user);
      setOtpPending(false);
      return updatedSession;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const resendOtp = async () => {
    setError(null);
    try {
      return await authService.resendMobileOtp(otpPhone);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await authService.login(email, password);
      setSession(res);
      setUser(res.user);
      if (res.user && res.user.is_phone_verified === false) {
        setOtpPending(true);
        setOtpPhone(res.user.phone || '');
      } else {
        setOtpPending(false);
      }
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    await authService.logout();
    setSession(null);
    setUser(null);
    setOtpPending(false);
    setOtpPhone('');
  };

  const updateProfile = async (updates) => {
    setError(null);
    try {
      const updated = await authService.updateProfile(updates);
      setUser(updated);
      setSession((prev) => (prev ? { ...prev, user: updated } : null));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const requestPasswordReset = async (email) => {
    setError(null);
    return await authService.requestPasswordReset(email);
  };

  const resetPassword = async (newPassword) => {
    setError(null);
    return await authService.resetPassword(newPassword);
  };

  // Role Checks
  const userRole = user?.role || 'buyer';
  const isPhoneVerified = Boolean(user?.is_phone_verified);
  const isEmailVerified = Boolean(user?.email_verified);

  const canAccessBuyer = () => {
    return userRole === 'buyer' || userRole === 'both' || userRole === 'admin';
  };

  const canAccessSeller = () => {
    return userRole === 'seller' || userRole === 'both' || userRole === 'admin';
  };

  const canAccessAdmin = () => {
    return userRole === 'admin';
  };

  const value = {
    session,
    user,
    loading,
    error,
    otpPending,
    otpPhone,
    isPhoneVerified,
    isEmailVerified,
    userRole,
    register,
    verifyOtp,
    resendOtp,
    login,
    logout,
    updateProfile,
    requestPasswordReset,
    resetPassword,
    canAccessBuyer,
    canAccessSeller,
    canAccessAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
