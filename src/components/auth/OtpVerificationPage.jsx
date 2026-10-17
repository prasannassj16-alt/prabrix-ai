import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { maskPhoneNumber } from '../../services/validationService';
import { DemoBanner } from '../common/DemoBanner';
import { ShieldCheck, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';

export const OtpVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { otpPhone, verifyOtp, resendOtp, user, userRole } = useAuth();

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(30);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef([]);

  const targetPhone = otpPhone || user?.phone || '+91 9840112233';

  // 30-second cooldown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleDigitChange = (index, value) => {
    setError('');
    // Accept only numeric digit
    const char = value.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    // Auto-advance focus to next box
    if (char && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);

    const nextFocus = Math.min(pasted.length, 5);
    if (inputRefs.current[nextFocus]) {
      inputRefs.current[nextFocus].focus();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');

    const token = digits.join('');
    if (token.length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    if (attemptsLeft <= 0) {
      setError('Maximum verification attempts exceeded. Please request a new code.');
      return;
    }

    setSubmitting(true);
    try {
      await verifyOtp(token);
      setSuccess('Mobile number verified successfully! Redirecting...');
      setTimeout(() => {
        // Redirect to intended route or dashboard based on role
        const destination = location.state?.from || (
          userRole === 'seller' ? '/seller' : userRole === 'admin' ? '/admin' : '/buyer'
        );
        navigate(destination, { replace: true });
      }, 1200);
    } catch (err) {
      setAttemptsLeft((prev) => Math.max(0, prev - 1));
      setError(err.message || 'Incorrect verification code. Please check and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setError('');
    setSuccess('');
    setResending(true);

    try {
      await resendOtp();
      setCooldown(30);
      setAttemptsLeft(5);
      setDigits(['', '', '', '', '', '']);
      setSuccess('A new verification code has been simulated for your number.');
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 sm:p-8 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full mb-4">
        <ShieldCheck className="w-8 h-8" />
      </div>

      <h1 className="text-xl font-bold text-slate-900">Verify Mobile Number</h1>
      <p className="text-sm text-slate-500 mt-1 mb-4">
        We have issued a 6-digit verification code to{' '}
        <span className="font-semibold text-slate-800 font-mono">
          {maskPhoneNumber(targetPhone)}
        </span>
      </p>

      {/* Prominent Demo Mode Banner */}
      <DemoBanner testOtp="123456" />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs sm:text-sm flex items-center justify-center space-x-1.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-700 text-xs sm:text-sm flex items-center justify-center space-x-1.5">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 6-Digit OTP Inputs */}
        <div className="flex justify-center space-x-2 sm:space-x-3" onPaste={handlePaste}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              autoFocus={index === 0}
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono border-2 border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all bg-slate-50"
              aria-label={`OTP Digit ${index + 1}`}
            />
          ))}
        </div>

        {/* Attempts indicator */}
        <div className="text-xs text-slate-500">
          Remaining attempts:{' '}
          <span className={`font-semibold ${attemptsLeft <= 2 ? 'text-red-500' : 'text-slate-700'}`}>
            {attemptsLeft} / 5
          </span>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={submitting || digits.join('').length !== 6 || attemptsLeft <= 0}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-md text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Verifying Code...' : 'Verify Mobile & Continue'}
        </button>

        {/* Resend Cooldown Button */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500 mb-2">Didn't receive the code?</p>
          <button
            type="button"
            disabled={cooldown > 0 || resending}
            onClick={handleResend}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>
              {cooldown > 0 ? `Resend Code in ${cooldown}s` : 'Resend Verification Code'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
