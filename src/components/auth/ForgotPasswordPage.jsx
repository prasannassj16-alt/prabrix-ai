import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../services/validationService';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const err = validateEmail(email);
    if (err) {
      setError(err);
      return;
    }

    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Unable to process password reset.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 sm:p-8 bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full mb-3">
          <Mail className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Reset your Password</h1>
        <p className="text-sm text-slate-500 mt-1">
          Enter your registered email address to receive password recovery instructions.
        </p>
      </div>

      {success ? (
        <div className="text-center space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-sm flex items-start space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="font-semibold">Reset instructions sent</p>
              <p className="text-xs text-emerald-700 mt-1">
                If an account exists for {email}, a recovery link has been prepared. In demo mode, check local simulation.
              </p>
            </div>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center space-x-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Login</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="resetEmail">
              Registered Email
            </label>
            <input
              id="resetEmail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-md text-sm transition-colors shadow-sm disabled:opacity-60"
          >
            {submitting ? 'Sending Request...' : 'Send Recovery Instructions'}
          </button>

          <div className="text-center pt-3">
            <Link
              to="/login"
              className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
