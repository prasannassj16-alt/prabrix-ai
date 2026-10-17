import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { STATUS_LABELS, STATUS_COLORS } from '../../services/listingService';
import {
  Shield,
  Users,
  CheckSquare,
  AlertTriangle,
  History,
  Settings,
  CheckCircle2,
  XCircle,
  Eye,
  Lock,
  PauseCircle,
  Search,
  Filter,
  RefreshCw,
  Sliders,
  Check,
  X,
  FileText,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('review_queue'); // 'review_queue' | 'reported' | 'users' | 'listings' | 'audit' | 'config'
  const [pendingListings, setPendingListings] = useState([]);
  const [reports, setReports] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [auditLogs, setAuditLogs] = useState([]);
  const [config, setConfig] = useState(null);

  // Rejection modal
  const [rejectModalListing, setRejectModalListing] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Status edit modal
  const [statusEditListing, setStatusEditListing] = useState(null);
  const [newStatusChoice, setNewStatusChoice] = useState('published');
  const [statusChangeReason, setStatusChangeReason] = useState('');

  // Feedback notifications
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Load active tab data
  const loadData = () => {
    setActionError('');
    if (!user || user.role !== 'admin') return;

    try {
      if (activeTab === 'review_queue') {
        const pending = adminService.getPendingReviewListings(user);
        setPendingListings(pending);
      } else if (activeTab === 'reported') {
        const reps = adminService.getReportedListings(user);
        setReports(reps);
      } else if (activeTab === 'users') {
        const uList = adminService.getRegisteredUsers(user);
        setUsersList(uList);
      } else if (activeTab === 'listings') {
        const listings = adminService.getAllListings(statusFilter, user);
        setAllListings(listings);
      } else if (activeTab === 'audit') {
        const logs = adminService.getAuditHistory({}, user);
        setAuditLogs(logs);
      } else if (activeTab === 'config') {
        const cfg = adminService.getPlatformConfig(user);
        setConfig(cfg);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to load administration data.');
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, statusFilter, user]);

  const showSuccess = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  // Review handlers
  const handleApprove = (listingId) => {
    try {
      adminService.reviewListing(listingId, 'approve', 'Approved by administrator.', user);
      showSuccess(`Listing ${listingId.slice(0, 8)} approved and published.`);
      loadData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleRejectConfirm = (e) => {
    e.preventDefault();
    if (!rejectModalListing) return;
    try {
      adminService.reviewListing(
        rejectModalListing.id,
        'reject',
        rejectionReason || 'Does not meet listing standards',
        user
      );
      showSuccess(`Listing ${rejectModalListing.id.slice(0, 8)} rejected.`);
      setRejectModalListing(null);
      setRejectionReason('');
      loadData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  // Report resolution handler
  const handleResolveReport = (reportId, action) => {
    try {
      adminService.resolveReport(reportId, action, `Resolved via admin console: ${action}`, user);
      showSuccess(`Report ${reportId} marked as ${action}.`);
      loadData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  // User governance handlers
  const handleRoleChange = (userId, newRole) => {
    try {
      adminService.updateUserGovernance(userId, { role: newRole }, user);
      showSuccess(`User role updated to ${newRole}.`);
      loadData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleToggleSuspension = (targetUser) => {
    try {
      const isSuspended = !targetUser.is_suspended;
      adminService.updateUserGovernance(targetUser.id, { is_suspended: isSuspended }, user);
      showSuccess(`User ${targetUser.email} ${isSuspended ? 'suspended' : 'activated'}.`);
      loadData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleTogglePhoneVerified = (targetUser) => {
    try {
      const isVerified = !targetUser.is_phone_verified;
      adminService.updateUserGovernance(targetUser.id, { is_phone_verified: isVerified }, user);
      showSuccess(`Phone verification status updated for ${targetUser.email}.`);
      loadData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  // Listing status change handler
  const handleStatusChangeSubmit = (e) => {
    e.preventDefault();
    if (!statusEditListing) return;
    try {
      adminService.setListingStatus(
        statusEditListing.id,
        newStatusChoice,
        statusChangeReason || 'Administrative update',
        user
      );
      showSuccess(`Listing status changed to ${newStatusChoice}.`);
      setStatusEditListing(null);
      setStatusChangeReason('');
      loadData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  // Config handlers
  const handleToggleLandType = (id) => {
    if (!config) return;
    const updated = {
      ...config,
      landTypes: config.landTypes.map((t) => (t.id === id ? { ...t, active: !t.active } : t)),
    };
    setConfig(updated);
  };

  const handleToggleUnit = (id) => {
    if (!config) return;
    const updated = {
      ...config,
      units: config.units.map((u) => (u.id === id ? { ...u, active: !u.active } : u)),
    };
    setConfig(updated);
  };

  const handleToggleFeatureFlag = (key) => {
    if (!config) return;
    const updated = {
      ...config,
      featureFlags: {
        ...config.featureFlags,
        [key]: !config.featureFlags[key],
      },
    };
    setConfig(updated);
  };

  const handleSaveConfig = () => {
    try {
      adminService.updatePlatformConfig(config, user);
      showSuccess('Platform configuration saved successfully.');
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-8 px-4 sm:px-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-purple-700" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Administrator Governance Console
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Centralized platform oversight for listings review, dispute reports, user roles, and audit compliance
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
            Admin: {user?.email || 'admin@prabrix.local'}
          </span>
          <button
            type="button"
            onClick={loadData}
            className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh active view"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-800 flex items-center space-x-2">
          <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('review_queue')}
          className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'review_queue'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Listing Review Queue</span>
          {pendingListings.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white text-purple-900 font-extrabold">
              {pendingListings.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reported')}
          className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'reported'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Reported Listings</span>
          {reports.filter((r) => r.status === 'pending').length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-900 font-extrabold">
              {reports.filter((r) => r.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Governance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('listings')}
          className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'listings'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Listing Statuses</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'audit'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit History</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('config')}
          className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'config'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Platform Config</span>
        </button>
      </div>

      {/* TAB 1: LISTING REVIEW QUEUE */}
      {activeTab === 'review_queue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Pending Listings Awaiting Legal & Cadastral Verification
            </h2>
            <span className="text-xs text-slate-500">{pendingListings.length} pending in queue</span>
          </div>

          {pendingListings.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {pendingListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Ref: {listing.id.slice(0, 8)} • Submitted by {listing.owner_name}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{listing.title}</h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 self-start sm:self-auto">
                      Pending Review
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Price</span>
                      <span className="font-bold text-slate-800">₹{(listing.price / 100000).toFixed(2)} Lakhs</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Extent</span>
                      <span className="font-bold text-slate-800">{listing.area_sqft} sq.ft. ({listing.area_cents} cents)</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Cadastral Survey</span>
                      <span className="font-mono font-bold text-slate-800">{listing.survey_number || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Location</span>
                      <span className="font-bold text-slate-800">{listing.taluk}, {listing.district}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{listing.description}</p>

                  <div className="pt-2 flex items-center justify-end space-x-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setRejectModalListing(listing);
                        setRejectionReason('');
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                    >
                      Reject with Notes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(listing.id)}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-sm"
                    >
                      Approve & Publish Listing
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">Review Queue Cleared</h3>
              <p className="text-xs text-slate-500">
                All submitted land listings have been processed. Zero listings currently pending review.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REPORTED LISTINGS */}
      {activeTab === 'reported' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">User Discrepancy & Fraud Reports</h2>
            <span className="text-xs text-slate-500">{reports.length} total reports</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      Report: {report.reason_label}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">
                      Against: {report.listing_title}
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold self-start sm:self-auto ${
                      report.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : report.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {report.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <span className="text-slate-400 font-medium">Reported Details:</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    {report.details}
                  </p>
                </div>

                <div className="text-[11px] text-slate-400">
                  Reported by <span className="font-semibold text-slate-700">{report.reporter_name}</span> on{' '}
                  {new Date(report.created_at).toLocaleDateString()}
                </div>

                {report.status === 'pending' && (
                  <div className="pt-2 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => handleResolveReport(report.id, 'dismiss')}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
                    >
                      Dismiss Report (Keep Listing)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolveReport(report.id, 'takedown')}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors shadow-sm"
                    >
                      Take Down Listing
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: USER GOVERNANCE */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Registered Accounts & Role Enforcement</h2>
            <span className="text-xs text-slate-500">{usersList.length} registered profiles</span>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Platform Role</th>
                    <th className="py-3 px-4">Phone Verified</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{u.full_name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{u.phone || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="px-2 py-1 border border-slate-300 rounded text-xs bg-white font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-600"
                        >
                          <option value="buyer">Buyer</option>
                          <option value="seller">Seller</option>
                          <option value="both">Both (Buyer & Seller)</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleTogglePhoneVerified(u)}
                          className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] border transition-colors ${
                            u.is_phone_verified
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {u.is_phone_verified ? 'Verified' : 'Unverified'}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                            u.is_suspended
                              ? 'bg-red-100 text-red-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.is_suspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleSuspension(u)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                            u.is_suspended
                              ? 'text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                              : 'text-red-700 border-red-300 hover:bg-red-50'
                          }`}
                        >
                          {u.is_suspended ? 'Reactivate' : 'Suspend'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LISTING STATUSES MANAGEMENT */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900">
              Listing Lifecycle Management Across Tamil Nadu
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-600"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="pending_review">Pending Review</option>
                <option value="draft">Draft</option>
                <option value="paused">Paused</option>
                <option value="sold">Sold</option>
                <option value="rejected">Rejected</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Title / ID</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allListings.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 line-clamp-1">{l.title}</div>
                        <div className="text-[11px] font-mono text-slate-400">{l.id.slice(0, 8)}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{l.taluk}, {l.district}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        ₹{(l.price / 100000).toFixed(2)} L
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] border ${
                            STATUS_COLORS[l.status] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {STATUS_LABELS[l.status] || l.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setStatusEditListing(l);
                            setNewStatusChoice(l.status);
                            setStatusChangeReason('');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-purple-700 border border-purple-200 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          Edit Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Immutable Platform Security & Status Audit Trail
            </h2>
            <span className="text-xs text-slate-500">{auditLogs.length} events logged</span>
          </div>

          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 text-xs space-y-1.5 hover:border-slate-300 transition-colors shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {log.action}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Entity: <span className="font-semibold text-slate-700">{log.entity_type}</span> ({log.entity_id ? log.entity_id.slice(0, 8) : 'N/A'})
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] font-normal leading-relaxed">
                  {log.details}
                </p>
                <div className="text-[10px] text-slate-400 pt-0.5">
                  Actor: <span className="font-semibold text-slate-600">{log.actor_email}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: PLATFORM CONFIG */}
      {activeTab === 'config' && config && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Platform Land Types & Units Configuration</h2>
              <p className="text-xs text-slate-500">Configure allowable land classifications, units, and system feature flags</p>
            </div>
            <button
              type="button"
              onClick={handleSaveConfig}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              Save Configuration
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Land Types */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Allowable Land Types
              </h3>
              <div className="space-y-2">
                {config.landTypes.map((type) => (
                  <label
                    key={type.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs cursor-pointer"
                  >
                    <span className="font-semibold text-slate-800">{type.name}</span>
                    <input
                      type="checkbox"
                      checked={type.active}
                      onChange={() => handleToggleLandType(type.id)}
                      className="rounded text-purple-700 focus:ring-purple-600 w-4 h-4 cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Units */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Allowable Area Measurement Units
              </h3>
              <div className="space-y-2">
                {config.units.map((unit) => (
                  <label
                    key={unit.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs cursor-pointer"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">{unit.name}</span>
                      <span className="text-slate-400 ml-2 font-mono text-[11px]">({unit.symbol})</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={unit.active}
                      onChange={() => handleToggleUnit(unit.id)}
                      className="rounded text-purple-700 focus:ring-purple-600 w-4 h-4 cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Feature Flags */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Platform Governance Feature Flags
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-800 block">AI Valuation & Indicative Range</span>
                  <span className="text-[11px] text-slate-400">Strictly requires $\ge 2$ comparable verified deeds</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.featureFlags.enableAiValuation}
                  onChange={() => handleToggleFeatureFlag('enableAiValuation')}
                  className="rounded text-purple-700 focus:ring-purple-600 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-800 block">Require Phone Verification To Publish</span>
                  <span className="text-[11px] text-slate-400">Sellers must verify mobile OTP prior to listing live</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.featureFlags.requirePhoneVerifiedToPublish}
                  onChange={() => handleToggleFeatureFlag('requirePhoneVerifiedToPublish')}
                  className="rounded text-purple-700 focus:ring-purple-600 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-800 block">Display Demo OTP Mode Banner</span>
                  <span className="text-[11px] text-slate-400">Never claim real SMS was sent when mock is active</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.featureFlags.enableDemoOtpBanner}
                  onChange={() => handleToggleFeatureFlag('enableDemoOtpBanner')}
                  className="rounded text-purple-700 focus:ring-purple-600 w-4 h-4"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {rejectModalListing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Reject Listing with Reason</h3>
              <button
                type="button"
                onClick={() => setRejectModalListing(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRejectConfirm} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="rejectionReason">
                  Moderation Rejection Reason
                </label>
                <textarea
                  id="rejectionReason"
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Incomplete survey number or mismatched title document..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-red-600"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalListing(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STATUS EDIT MODAL */}
      {statusEditListing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Change Listing Status</h3>
              <button
                type="button"
                onClick={() => setStatusEditListing(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStatusChangeSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="newStatus">
                  Target Status
                </label>
                <select
                  id="newStatus"
                  value={newStatusChoice}
                  onChange={(e) => setNewStatusChoice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-600"
                >
                  <option value="draft">Draft</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="published">Published</option>
                  <option value="paused">Paused</option>
                  <option value="sold">Sold</option>
                  <option value="rejected">Rejected</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="statusReason">
                  Mandatory Audit Reason
                </label>
                <input
                  id="statusReason"
                  type="text"
                  value={statusChangeReason}
                  onChange={(e) => setStatusChangeReason(e.target.value)}
                  placeholder="e.g. Owner requested pause / verified SRO deed"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-purple-600"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusEditListing(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm"
                >
                  Save Status & Log Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
