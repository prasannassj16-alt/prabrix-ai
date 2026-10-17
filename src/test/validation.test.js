import { describe, it, expect } from 'vitest';
import {
  validateName,
  validateEmail,
  validateMobile,
  getPasswordStrength,
  validatePassword,
  validateConfirmPassword,
  formatFullPhone,
  maskPhoneNumber,
} from '../services/validationService';

describe('Registration Form Validation Unit Tests', () => {
  describe('Full Name Validation', () => {
    it('rejects empty or whitespace-only names', () => {
      expect(validateName('')).toMatch(/at least 2 characters/i);
      expect(validateName('   ')).toMatch(/at least 2 characters/i);
    });

    it('rejects single-character names', () => {
      expect(validateName('A')).toMatch(/at least 2 characters/i);
    });

    it('accepts valid full names', () => {
      expect(validateName('Ramesh Sundaram')).toBe('');
      expect(validateName('Prasanna S')).toBe('');
    });
  });

  describe('Email Address Validation', () => {
    it('rejects empty email', () => {
      expect(validateEmail('')).toMatch(/required/i);
    });

    it('rejects invalid email formats', () => {
      expect(validateEmail('invalid-email')).toMatch(/valid email/i);
      expect(validateEmail('user@')).toMatch(/valid email/i);
      expect(validateEmail('@domain.com')).toMatch(/valid email/i);
      expect(validateEmail('user@domain')).toMatch(/valid email/i);
    });

    it('accepts standard email addresses', () => {
      expect(validateEmail('ramesh@prabrix.ai')).toBe('');
      expect(validateEmail('buyer.user+test@domain.co.in')).toBe('');
    });
  });

  describe('Mobile Number & Country Code Validation', () => {
    it('rejects empty mobile number', () => {
      expect(validateMobile('', '+91')).toMatch(/required/i);
    });

    it('rejects non-10 digit numbers for India (+91)', () => {
      expect(validateMobile('98401122', '+91')).toMatch(/exactly 10 digits/i);
      expect(validateMobile('984011223344', '+91')).toMatch(/exactly 10 digits/i);
    });

    it('rejects Indian mobile numbers that do not start with 6, 7, 8, or 9', () => {
      expect(validateMobile('1234567890', '+91')).toMatch(/begin with 6, 7, 8, or 9/i);
      expect(validateMobile('5540112233', '+91')).toMatch(/begin with 6, 7, 8, or 9/i);
    });

    it('accepts valid 10-digit Indian mobile numbers starting with 6, 7, 8, or 9', () => {
      expect(validateMobile('9840112233', '+91')).toBe('');
      expect(validateMobile('8765432109', '+91')).toBe('');
      expect(validateMobile('7012345678', '+91')).toBe('');
      expect(validateMobile('6381234567', '+91')).toBe('');
    });

    it('correctly formats and masks phone numbers', () => {
      expect(formatFullPhone('+91', '9840112233')).toBe('+919840112233');
      expect(maskPhoneNumber('+919840112233')).toBe('+919 ***** 233');
    });
  });

  describe('Password Strength & Complexity Rules', () => {
    it('detects missing requirements individually', () => {
      // Missing uppercase
      const s1 = getPasswordStrength('password123#');
      expect(s1.checks.uppercase).toBe(false);
      expect(s1.isValid).toBe(false);

      // Missing lowercase
      const s2 = getPasswordStrength('PASSWORD123#');
      expect(s2.checks.lowercase).toBe(false);
      expect(s2.isValid).toBe(false);

      // Missing number
      const s3 = getPasswordStrength('PasswordSpecial#');
      expect(s3.checks.number).toBe(false);
      expect(s3.isValid).toBe(false);

      // Missing special symbol
      const s4 = getPasswordStrength('Password123');
      expect(s4.checks.special).toBe(false);
      expect(s4.isValid).toBe(false);

      // Shorter than 8 chars
      const s5 = getPasswordStrength('Pass1#');
      expect(s5.checks.length).toBe(false);
      expect(s5.isValid).toBe(false);
    });

    it('validates a strong password meeting all 5 requirements', () => {
      const strong = getPasswordStrength('Prabrix2026#Secure');
      expect(strong.isValid).toBe(true);
      expect(strong.score).toBe(5);
      expect(strong.label).toBe('Strong');
      expect(validatePassword('Prabrix2026#Secure')).toBe('');
    });

    it('validates password confirmation matching', () => {
      expect(validateConfirmPassword('Secret123#', '')).toMatch(/confirm your password/i);
      expect(validateConfirmPassword('Secret123#', 'Mismatch123#')).toMatch(/do not match/i);
      expect(validateConfirmPassword('Secret123#', 'Secret123#')).toBe('');
    });
  });
});
