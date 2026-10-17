import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  validateName,
  validateEmail,
  validateMobile,
  validatePassword,
  validateConfirmPassword,
  formatFullPhone,
} from '../../services/validationService';
import { PasswordStrength } from '../common/PasswordStrength';
import { DemoBanner } from '../common/DemoBanner';
import { UserCheck, Shield, Phone, Mail, Lock, User, Briefcase } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    countryCode: '+91',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const countryCodes = [
    { code: '+91', label: 'India (+91)' },
    { code: '+1', label: 'USA / Canada (+1)' },
    { code: '+44', label: 'UK (+44)' },
    { code: '+971', label: 'UAE (+971)' },
    { code: '+65', label: 'Singapore (+65)' },
  ];

  const validateField = (field, value) => {
    switch (field) {
      case 'fullName':
        return validateName(value);
      case 'email':
        return validateEmail(value);
      case 'phone':
        return validateMobile(value, formData.countryCode);
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        return validateConfirmPassword(formData.password, value);
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const newErrors = {
      fullName: validateName(formData.fullName),
      email: validateEmail(formData.email),
      phone: validateMobile(formData.phone, formData.countryCode),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword),
    };

    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((err) => Boolean(err));
    if (hasErrors) {
      return;
    }

    setSubmitting(true);
    try {
      const fullPhone = formatFullPhone(formData.countryCode, formData.phone);
      await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: fullPhone,
        password: formData.password,
        role: formData.role,
      });

      // Navigate to OTP verification screen
      navigate('/verify-otp');
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-8 p-6 sm:p-8 bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full mb-3">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Create your PRABRIX AI Account</h1>
        <p className="text-sm text-slate-500 mt-1">
          Join the Tamil Nadu Land Intelligence & Location Platform
        </p>
      </div>

      <DemoBanner />

      {serverError && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-start">
          <span className="font-semibold mr-1">Error:</span> {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="fullName">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Ramesh Sundaram"
              className={`w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                errors.fullName && touched.fullName
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-100'
              }`}
            />
          </div>
          {errors.fullName && touched.fullName && (
            <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="name@example.com"
              className={`w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                errors.email && touched.email
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-100'
              }`}
            />
          </div>
          {errors.email && touched.email && (
            <p className="text-xs text-red-600 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Mobile Number with Country Code */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="phone">
            Mobile Number (for SMS OTP) <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-2">
            <select
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              className="w-36 px-2.5 py-2 border border-slate-300 bg-slate-50 rounded-md text-sm font-mono text-slate-700 focus:outline-none focus:border-emerald-500"
            >
              {countryCodes.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="10-digit mobile (e.g. 9840112233)"
                className={`w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                  errors.phone && touched.phone
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-100'
                }`}
              />
            </div>
          </div>
          {errors.phone && touched.phone && (
            <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
          )}
          <p className="text-xs text-slate-400 mt-1">
            Standard 6-digit OTP will be verified before account activation.
          </p>
        </div>

        {/* Account Type Choice */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            I am joining PRABRIX AI primarily as: <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'buyer', label: 'Buyer', desc: 'Looking for land' },
              { id: 'seller', label: 'Seller', desc: 'Own property' },
              { id: 'agent', label: 'Agent', desc: 'Real estate pro' },
              { id: 'both', label: 'Both', desc: 'Buyer & Seller' },
            ].map((option) => (
              <label
                key={option.id}
                className={`flex flex-col p-2.5 border rounded-lg cursor-pointer text-center transition-all ${
                  formData.role === option.id
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={option.id}
                  checked={formData.role === option.id}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="font-semibold text-xs sm:text-sm">{option.label}</span>
                <span className="text-[10px] text-slate-500 mt-0.5">{option.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="••••••••"
              className={`w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                errors.password && touched.password
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-100'
              }`}
            />
          </div>
          {/* Password strength real-time indicator */}
          <PasswordStrength password={formData.password} />
          {errors.password && touched.password && (
            <p className="text-xs text-red-600 mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="confirmPassword">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="••••••••"
              className={`w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                errors.confirmPassword && touched.confirmPassword
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-100'
              }`}
            />
          </div>
          {errors.confirmPassword && touched.confirmPassword && (
            <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-md text-sm transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center space-x-2"
        >
          {submitting ? (
            <span>Creating account...</span>
          ) : (
            <>
              <UserCheck className="w-4 h-4" />
              <span>Register & Proceed to OTP Verification</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="text-emerald-700 font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};
