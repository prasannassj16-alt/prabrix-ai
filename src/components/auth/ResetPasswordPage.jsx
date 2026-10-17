import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  validatePassword,
  validateConfirmPassword,
} from '../../services/validationService';
import { PasswordStrength } from '../common/PasswordStrength';
import { KeyRound, CheckCircle2 } from 'lucide-react';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const passErr = validatePassword(password);
    if (passErr) {
      setError(passErr);
      return;
    }

    const confErr = validateConfirmPassword(password, confirmPassword);
    if (confErr) {
      setError(confErr);
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Unable to update password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 sm:p-8 bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full mb-3">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Set New Password</h1>
        <p className="text-sm text-slate-500 mt-1">
          Choose a secure, strong password for your PRABRIX AI account.
        </p>
      </div>

      {success ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-center space-y-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
          <p className="font-semibold text-sm">Password updated successfully!</p>
          <p className="text-xs text-emerald-700">Redirecting to login...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="newPassword">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <PasswordStrength password={password} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="confirmNewPassword">
              Confirm New Password
            </label>
            <input
              id="confirmNewPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-md text-sm transition-colors shadow-sm disabled:opacity-60"
          >
            {submitting ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>
      )}
    </div>
  );
};
