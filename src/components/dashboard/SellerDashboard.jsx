import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  listingService,
  STATUS_LABELS,
  STATUS_COLORS,
  LISTING_STATUSES,
} from '../../services/listingService';
import {
  PlusCircle,
  Eye,
  MessageSquare,
  Tag,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  Archive,
  History,
  X,
  MapPin,
  ExternalLink,
  Edit,
  Trash2,
  Filter,
  Inbox,
} from 'lucide-react';

export const SellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [metrics, setMetrics] = useState(null);
  const [selectedHistoryListing, setSelectedHistoryListing] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [actionMessage, setActionMessage] = useState('');

  const loadData = () => {
    const ownerId = user?.id || '00000000-0000-0000-0000-000000000002';
    const fetchedListings = listingService.getListingsByOwner(ownerId);
    setListings(fetchedListings);
    setMetrics(listingService.getSellerMetrics(ownerId));
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleStatusChange = (listingId, newStatus, reason) => {
    try {
      listingService.updateListingStatus(listingId, newStatus, reason);
      loadData();
      setActionMessage(`Listing status successfully updated to "${STATUS_LABELS[newStatus]}".`);
      setTimeout(() => setActionMessage(''), 4000);
    } catch (e) {
      alert(e.message || 'Error updating listing status.');
    }
  };

  const handleDelete = (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      listingService.deleteListing(listingId);
      loadData();
      setActionMessage('Listing deleted successfully.');
      setTimeout(() => setActionMessage(''), 4000);
    }
  };

  const handleOpenHistory = (listing) => {
    const hist = listingService.getStatusHistory(listing.id);
    setSelectedHistoryListing(listing);
    setHistoryList(hist);
  };

  const handleCloseHistory = () => {
    setSelectedHistoryListing(null);
    setHistoryList([]);
  };

  const filteredListings = listings.filter((l) => {
    if (filterStatus === 'all') return true;
    return l.status === filterStatus;
  });

  return (
    <div className="max-w-6xl mx-auto my-8 px-4 sm:px-6 space-y-6">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Land Owner & Seller Portal
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Mobile Verified: {user?.phone || '+91 98765 43210'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Welcome, {user?.full_name || 'Land Owner'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your land listings, upload confidential revenue documents, and inspect real-time performance.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/seller/inbox"
            className="inline-flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-sm transition-colors"
          >
            <Inbox className="w-4 h-4 text-emerald-700" />
            <span>Inquiry & Offers Inbox</span>
          </Link>
          <Link
            to="/sell"
            className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List New Land</span>
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs text-emerald-800 font-medium animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Strict Zero-Fabrication Analytics Disclaimer */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start space-x-2.5 text-xs text-blue-900">
        <ShieldCheck className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold">Zero-Fabrication Data Policy (PROJECT_SPEC §16):</span>
          <p className="text-[11px] text-blue-800">
            PRABRIX AI never simulates or inflates visitor statistics. All view counts, buyer inquiries, and status transitions reflect verified system events.
          </p>
        </div>
      </div>

      {/* Real Performance Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Parcels</span>
            <span className="text-xl font-extrabold text-slate-900">{metrics.totalListings}</span>
          </div>

          <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block">Published</span>
            <span className="text-xl font-extrabold text-emerald-700">{metrics.publishedCount}</span>
          </div>

          <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
            <span className="text-[10px] uppercase font-bold text-blue-600 block">In Review</span>
            <span className="text-xl font-extrabold text-blue-700">{metrics.pendingCount}</span>
          </div>

          <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Drafts</span>
            <span className="text-xl font-extrabold text-slate-700">{metrics.draftCount}</span>
          </div>

          <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
            <span className="text-[10px] uppercase font-bold text-purple-600 block">Sold</span>
            <span className="text-xl font-extrabold text-purple-700">{metrics.soldCount}</span>
          </div>

          <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-amber-600">Real Views</span>
              <Eye className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <span className="text-xl font-extrabold text-amber-700">{metrics.totalViews}</span>
          </div>
        </div>
      )}

      {/* Listings Section Header & Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Land Listings</h2>
            <p className="text-xs text-slate-500">
              Showing {filteredListings.length} of {listings.length} listings
            </p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterStatus === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({listings.length})
            </button>
            {LISTING_STATUSES.map((st) => {
              const count = listings.filter((l) => l.status === st).length;
              if (count === 0 && filterStatus !== st) return null;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    filterStatus === st
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {STATUS_LABELS[st]} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Listings Cards List */}
        {filteredListings.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Listings Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {filterStatus === 'all'
                ? "You haven't listed any land parcels yet. Launch the 6-step wizard to sell your land."
                : `No listings currently have status "${STATUS_LABELS[filterStatus]}".`}
            </p>
            <Link
              to="/sell"
              className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Land Now</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredListings.map((listing) => {
              const coverPhoto =
                listing.photos?.find((p) => p.is_cover)?.url ||
                listing.photos?.[0]?.url ||
                null;
              const areaCents = listing.area_cents || (listing.area_sqft / 435.6).toFixed(2);
              const price = Number(listing.price || 0);
              const statusColor = STATUS_COLORS[listing.status] || 'bg-slate-100 text-slate-700';

              return (
                <div
                  key={listing.id}
                  className="p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-all bg-white flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Thumbnail + Metadata */}
                  <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                    <div className="w-20 h-16 sm:w-24 sm:h-20 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                      {coverPhoto ? (
                        <img
                          src={coverPhoto}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-slate-400 p-1 text-center">
                          <MapPin className="w-5 h-5 text-slate-300 mb-0.5" />
                          <span>No Photo</span>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusColor}`}
                        >
                          {STATUS_LABELS[listing.status] || listing.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {listing.id.substring(0, 8)}...
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded capitalize font-medium">
                          {listing.property_type || 'Land'}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 mt-1 truncate">
                        {listing.title}
                      </h3>

                      <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>
                          {listing.district}, {listing.taluk} &bull; Survey #{listing.survey_number || 'Pending'}
                        </span>
                      </p>

                      <div className="flex items-center space-x-3 mt-2 text-xs">
                        <span className="font-bold text-emerald-700">
                          ₹{price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-slate-300">&bull;</span>
                        <span className="text-slate-600 font-medium">
                          {areaCents} Cents ({Number(listing.area_sqft || 0).toLocaleString()} sq.ft.)
                        </span>
                        <span className="text-slate-300">&bull;</span>
                        <span className="text-slate-500 font-medium flex items-center space-x-1">
                          <Eye className="w-3 h-3 text-slate-400" />
                          <span>{listing.views_count || 0} real views</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center flex-wrap gap-1.5 md:flex-col md:items-end justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                    <div className="flex items-center space-x-1.5">
                      {/* View Status History */}
                      <button
                        type="button"
                        onClick={() => handleOpenHistory(listing)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        title="View Status Transition History"
                      >
                        <History className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden sm:inline">History</span>
                      </button>

                      {/* Edit / Resume Listing */}
                      <button
                        type="button"
                        onClick={() => navigate('/sell', { state: { editListing: listing } })}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      {/* Delete (if draft or rejected) */}
                      {(listing.status === 'draft' || listing.status === 'rejected') && (
                        <button
                          type="button"
                          onClick={() => handleDelete(listing.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Status Transition Action Buttons */}
                    <div className="flex items-center space-x-1.5 mt-1">
                      {listing.status === 'published' && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(
                                listing.id,
                                'paused',
                                'Temporarily paused by land owner.'
                              )
                            }
                            className="px-2 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded hover:bg-amber-100 transition-colors flex items-center space-x-1"
                          >
                            <PauseCircle className="w-3 h-3" />
                            <span>Pause</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(
                                listing.id,
                                'sold',
                                'Parcel marked as successfully sold by owner.'
                              )
                            }
                            className="px-2 py-1 text-[11px] font-semibold text-purple-800 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100 transition-colors flex items-center space-x-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Mark Sold</span>
                          </button>
                        </>
                      )}

                      {listing.status === 'paused' && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(
                                listing.id,
                                'published',
                                'Resumed live publication by owner.'
                              )
                            }
                            className="px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors flex items-center space-x-1"
                          >
                            <PlayCircle className="w-3 h-3" />
                            <span>Resume</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(
                                listing.id,
                                'archived',
                                'Archived by land owner.'
                              )
                            }
                            className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-300 rounded hover:bg-slate-200 transition-colors flex items-center space-x-1"
                          >
                            <Archive className="w-3 h-3" />
                            <span>Archive</span>
                          </button>
                        </>
                      )}

                      {listing.status === 'draft' && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(
                              listing.id,
                              'pending_review',
                              'Submitted draft for administrative verification.'
                            )
                          }
                          className="px-2.5 py-1 text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                        >
                          Submit for Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Status History Modal */}
      {selectedHistoryListing && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-xl border border-slate-200 animate-scale-in max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <History className="w-4 h-4 text-emerald-600" />
                  <span>Audit Trail & Status History</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-sm">
                  {selectedHistoryListing.title}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseHistory}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {historyList.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No status transitions logged yet for this listing.
                </p>
              ) : (
                <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                  {historyList.map((entry, index) => (
                    <div key={entry.id || index} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-800">
                          {entry.previous_status
                            ? `${STATUS_LABELS[entry.previous_status] || entry.previous_status} → ${STATUS_LABELS[entry.new_status] || entry.new_status}`
                            : `Initial: ${STATUS_LABELS[entry.new_status] || entry.new_status}`}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase border ${
                            STATUS_COLORS[entry.new_status] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {entry.new_status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {entry.reason || 'No description provided.'}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">
                        {new Date(entry.created_at).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Section 16 Audit Compliance</span>
              <button
                type="button"
                onClick={handleCloseHistory}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
