import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import * as AuthContextModule from '../context/AuthContext';
import { adminService } from '../services/adminService';

describe('Phase 9: Admin Dashboard & Governance UI Suite', () => {
  const mockAdminUser = {
    id: '00000000-0000-0000-0000-000000000001',
    full_name: 'Platform Administrator',
    email: 'admin@prabrix.local',
    role: 'admin',
  };

  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: mockAdminUser,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Dashboard Layout & Navigation Tabs', () => {
    it('renders the administrator console with all 6 governance tabs', () => {
      render(<AdminDashboard />);

      expect(screen.getByText(/Administrator Governance Console/i)).toBeInTheDocument();
      expect(screen.getByText(/Admin: admin@prabrix.local/i)).toBeInTheDocument();

      // Navigation tabs
      expect(screen.getByRole('button', { name: /Listing Review Queue/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reported Listings/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /User Governance/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Listing Statuses/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Audit History/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Platform Config/i })).toBeInTheDocument();
    });
  });

  describe('2. User Governance Tab', () => {
    it('displays registered users and allows role modifications and suspension toggle', () => {
      render(<AdminDashboard />);

      const usersTab = screen.getByRole('button', { name: /User Governance/i });
      fireEvent.click(usersTab);

      expect(screen.getByText(/Registered Accounts & Role Enforcement/i)).toBeInTheDocument();
      expect(screen.getByText(/Ramesh Sundaram/i)).toBeInTheDocument();
      expect(screen.getByText(/Karthik Raja/i)).toBeInTheDocument();

      // Find role selectors
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);

      // Toggle suspension
      const suspendButtons = screen.getAllByRole('button', { name: /Suspend/i });
      expect(suspendButtons.length).toBeGreaterThan(0);
      fireEvent.click(suspendButtons[0]);

      // Success feedback appears
      expect(screen.getAllByText(/suspended/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('3. Reported Listings Tab', () => {
    it('displays user-flagged listings and allows dismissing report', () => {
      render(<AdminDashboard />);

      const reportedTab = screen.getByRole('button', { name: /Reported Listings/i });
      fireEvent.click(reportedTab);

      expect(screen.getByText(/User Discrepancy & Fraud Reports/i)).toBeInTheDocument();
      expect(screen.getByText(/Price Discrepancy/i)).toBeInTheDocument();

      const dismissBtn = screen.getByRole('button', { name: /Dismiss Report/i });
      fireEvent.click(dismissBtn);

      expect(screen.getByText(/marked as dismiss/i)).toBeInTheDocument();
    });
  });

  describe('4. Platform Configuration Tab', () => {
    it('renders land types and units with interactive toggles and save action', () => {
      render(<AdminDashboard />);

      const configTab = screen.getByRole('button', { name: /Platform Config/i });
      fireEvent.click(configTab);

      expect(screen.getByText(/Platform Land Types & Units Configuration/i)).toBeInTheDocument();
      expect(screen.getByText(/Agricultural Farmland/i)).toBeInTheDocument();
      expect(screen.getByText(/Square Feet/i)).toBeInTheDocument();
      expect(screen.getByText(/Cents \(Tamil Nadu standard\)/i)).toBeInTheDocument();

      const saveBtn = screen.getByRole('button', { name: /Save Configuration/i });
      fireEvent.click(saveBtn);

      expect(screen.getByText(/Platform configuration saved successfully/i)).toBeInTheDocument();
    });
  });

  describe('5. Audit History Tab', () => {
    it('renders platform audit logs with actions and timestamps', () => {
      render(<AdminDashboard />);

      const auditTab = screen.getByRole('button', { name: /Audit History/i });
      fireEvent.click(auditTab);

      expect(screen.getByText(/Immutable Platform Security & Status Audit Trail/i)).toBeInTheDocument();
      expect(screen.getAllByText(/admin@prabrix.local/i).length).toBeGreaterThan(0);
    });
  });
});
