import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const EmailVerificationNotice = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-md mx-auto my-10 p-6 sm:p-8 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-700 rounded-full mb-3">
        <Mail className="w-6 h-6" />
      </div>

      <h1 className="text-xl font-bold text-slate-900">Verify Email Address</h1>
      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
        Optional Second Step
      </span>

      <p className="text-sm text-slate-600 mt-3 mb-6">
        A confirmation link has been prepared for{' '}
        <span className="font-semibold text-slate-800">{user?.email || 'your email'}</span>.
        Email verification is optional for basic browsing, but enhances account recovery security.
      </p>

      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs text-slate-600 space-y-1.5 mb-6">
        <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
          <CheckCircle className="w-4 h-4" />
          <span>Mobile Phone Number Verified</span>
        </div>
        <p className="text-slate-500 pl-6">
          Your account is fully activated for land discovery and inquiry creation.
        </p>
      </div>

      <Link
        to="/buyer"
        className="w-full inline-flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-md text-sm transition-colors shadow-sm"
      >
        <span>Proceed to Land Dashboard</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};
