/**
 * PRABRIX AI - Input Validation Service
 * Enforces strong password rules, mobile formats (+91 default), and email hygiene.
 */

export const validateName = (name) => {
  if (!name || name.trim().length < 2) {
    return 'Full name must be at least 2 characters.';
  }
  return '';
};

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email address is required.';
  }
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address (e.g. name@example.com).';
  }
  return '';
};

export const validateMobile = (phone, countryCode = '+91') => {
  if (!phone || !phone.trim()) {
    return 'Mobile number is required.';
  }
  const digitsOnly = phone.replace(/[^0-9]/g, '');

  if (countryCode === '+91') {
    if (digitsOnly.length !== 10) {
      return 'Indian mobile number must be exactly 10 digits.';
    }
    if (!/^[6-9]/.test(digitsOnly)) {
      return 'Indian mobile number must begin with 6, 7, 8, or 9.';
    }
  } else {
    if (digitsOnly.length < 7 || digitsOnly.length > 14) {
      return 'Mobile number must be between 7 and 14 digits.';
    }
  }
  return '';
};

export const getPasswordStrength = (password) => {
  const checks = {
    length: (password || '').length >= 8,
    lowercase: /[a-z]/.test(password || ''),
    uppercase: /[A-Z]/.test(password || ''),
    number: /[0-9]/.test(password || ''),
    special: /[^A-Za-z0-9]/.test(password || ''),
  };

  const score = Object.values(checks).filter(Boolean).length;
  let label = 'Weak';
  let color = 'text-red-500';

  if (score >= 5) {
    label = 'Strong';
    color = 'text-emerald-600';
  } else if (score >= 3) {
    label = 'Medium';
    color = 'text-amber-500';
  }

  return { checks, score, label, color, isValid: score === 5 };
};

export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required.';
  }
  const strength = getPasswordStrength(password);
  if (!strength.isValid) {
    return 'Password must satisfy all 5 security requirements.';
  }
  return '';
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password.';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }
  return '';
};

export const formatFullPhone = (countryCode, phoneDigits) => {
  const cleanDigits = (phoneDigits || '').replace(/[^0-9]/g, '');
  const cleanCode = (countryCode || '+91').trim();
  return `${cleanCode}${cleanDigits}`;
};

export const maskPhoneNumber = (fullPhone) => {
  if (!fullPhone || fullPhone.length < 8) return fullPhone || '';
  const lastThree = fullPhone.slice(-3);
  const prefix = fullPhone.slice(0, 4);
  return `${prefix} ***** ${lastThree}`;
};
