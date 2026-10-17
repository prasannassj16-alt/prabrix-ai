import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { OtpVerificationPage } from '../components/auth/OtpVerificationPage';
import { AuthProvider } from '../context/AuthContext';

describe('OTP Verification Screen Component Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderOtpPage = () => {
    return render(
      <AuthProvider>
        <BrowserRouter>
          <OtpVerificationPage />
        </BrowserRouter>
      </AuthProvider>
    );
  };

  it('renders the 6-digit input boxes and Demo Mode Banner', () => {
    renderOtpPage();

    // Check for demo banner
    expect(screen.getByText(/Demo mode: no real SMS is sent/i)).toBeInTheDocument();
    expect(screen.getByText(/123456/i)).toBeInTheDocument();

    // Check for all 6 inputs
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByLabelText(`OTP Digit ${i}`)).toBeInTheDocument();
    }

    // Check for 30s resend cooldown button
    expect(screen.getByText(/Resend/i)).toBeInTheDocument();
  });

  it('shows error when wrong verification code is submitted and decrements attempts', async () => {
    renderOtpPage();

    // Fill in incorrect 6-digit code
    const wrongDigits = ['9', '9', '9', '9', '9', '9'];
    for (let i = 0; i < 6; i++) {
      const input = screen.getByLabelText(`OTP Digit ${i + 1}`);
      fireEvent.change(input, { target: { value: wrongDigits[i] } });
    }

    const submitBtn = screen.getByRole('button', { name: /Verify Mobile & Continue/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Invalid verification code/i)).toBeInTheDocument();
      expect(screen.getByText(/Remaining attempts/i)).toHaveTextContent('4 / 5');
    });
  });

  it('cooldown button prevents rapid resending while timer is active', () => {
    renderOtpPage();
    const resendBtn = screen.getByRole('button', { name: /Resend Code in/i });
    expect(resendBtn).toBeDisabled();
  });
});
