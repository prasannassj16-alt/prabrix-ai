import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DemoBanner } from '../common/DemoBanner';
import { LogIn, Mail, Lock, Shield, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isPhoneVerified, userRole } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(email, password);
      const user = res.user;

      // Check phone verification
      if (user && user.is_phone_verified === false) {
        navigate('/verify-otp');
        return;
      }

      // Route to destination
      const destination = location.state?.from || (
        user.role === 'seller' ? '/seller' : user.role === 'admin' ? '/admin' : '/buyer'
      );
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail, role) => {
    setEmail(demoEmail);
    setPassword('DemoPassword123#');
    setError('');
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 sm:p-8 bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full mb-3">
          <LogIn className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Sign in to PRABRIX AI</h1>
        <p className="text-sm text-slate-500 mt-1">Land & Location Intelligence Platform</p>
      </div>

      <DemoBanner />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Demo Credentials Quick-Select Pill */}
      <div className="mb-5 p-3 bg-slate-50 border border-slate-200 rounded-lg">
        <p className="text-xs font-semibold text-slate-600 mb-2">Demo Accounts (One-Click Testing):</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => fillDemoAccount('demo.buyer@prabrix.local', 'buyer')}
            className="text-xs bg-white hover:bg-slate-100 border border-slate-300 px-2.5 py-1 rounded text-slate-700 font-medium"
          >
            Buyer
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('demo.seller@prabrix.local', 'seller')}
            className="text-xs bg-white hover:bg-slate-100 border border-slate-300 px-2.5 py-1 rounded text-slate-700 font-medium"
          >
            Seller
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('demo.admin@prabrix.local', 'admin')}
            className="text-xs bg-white hover:bg-slate-100 border border-slate-300 px-2.5 py-1 rounded text-slate-700 font-medium"
          >
            Admin
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="loginEmail">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="loginEmail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-slate-700" htmlFor="loginPassword">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="loginPassword"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-md text-sm transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center space-x-2"
        >
          {submitting ? (
            <span>Signing in...</span>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        Don't have an account yet?{' '}
        <Link to="/register" className="text-emerald-700 font-semibold hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
};
