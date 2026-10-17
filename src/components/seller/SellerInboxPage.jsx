import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Calendar,
  IndianRupee,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Reply,
  ShieldCheck,
  Phone,
  Mail,
  User,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { inquiryService } from '../../services/inquiryService';
import { offerService } from '../../services/offerService';

export const SellerInboxPage = () => {
  const { user } = useAuth();
  const sellerId = user?.id || 'demo-seller-1';

  const [activeTab, setActiveTab] = useState('inquiries'); // inquiries, visits, offers
  const [inquiries, setInquiries] = useState([]);
  const [offers, setOffers] = useState([]);
  const [replyModalInquiry, setReplyModalInquiry] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [counterModalOffer, setCounterModalOffer] = useState(null);
  const [counterAmountLakhs, setCounterAmountLakhs] = useState('');
  const [counterNotes, setCounterNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  const loadData = () => {
    try {
      const allInquiries = inquiryService.getInquiriesBySeller(sellerId);
      setInquiries(allInquiries);

      const allOffers = offerService.getOffersBySeller(sellerId);
      setOffers(allOffers);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [sellerId]);

  const generalInquiries = inquiries.filter((i) => i.type !== 'site_visit_request');
  const siteVisits = inquiries.filter((i) => i.type === 'site_visit_request');

  const showToast = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Inquiry Status Actions
  const handleMarkInquiryRead = (id) => {
    try {
      inquiryService.updateInquiryStatus(id, sellerId, 'read');
      loadData();
      showToast('Inquiry marked as read.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyModalInquiry || !replyText.trim()) return;

    try {
      inquiryService.updateInquiryStatus(replyModalInquiry.id, sellerId, 'responded', replyText);
      setReplyModalInquiry(null);
      setReplyText('');
      loadData();
      showToast('Reply dispatched to buyer successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  // Site Visit Actions
  const handleUpdateVisitStatus = (id, newStatus) => {
    try {
      inquiryService.updateInquiryStatus(id, sellerId, newStatus);
      loadData();
      showToast(`Site visit status updated to ${newStatus}.`);
    } catch (err) {
      alert(err.message);
    }
  };

  // Offer Actions
  const handleOfferAction = (offerId, action) => {
    try {
      offerService.respondToOffer(offerId, sellerId, action);
      loadData();
      showToast(`Offer ${action} successfully.`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSendCounterOffer = (e) => {
    e.preventDefault();
    if (!counterModalOffer) return;
    const amount = Number(counterAmountLakhs) * 100000;
    if (!amount || amount <= 0) {
      alert('Please enter a valid counter amount.');
      return;
    }

    try {
      offerService.respondToOffer(
        counterModalOffer.id,
        sellerId,
        'countered',
        amount,
        counterNotes
      );
      setCounterModalOffer(null);
      setCounterAmountLakhs('');
      setCounterNotes('');
      loadData();
      showToast('Counter-offer submitted to buyer.');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Inbox className="w-6 h-6 text-emerald-700" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Seller Communications & Inquiry Inbox
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Manage buyer leads, coordinate site visits, and negotiate purchase offers for your listed lands.
          </p>
        </div>

        {/* Real Metrics Badge */}
        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Real inquiries only (Zero fabrication)</span>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 sm:space-x-4">
        <button
          type="button"
          onClick={() => setActiveTab('inquiries')}
          className={`pb-3 px-2 sm:px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'inquiries'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>General Inquiries ({generalInquiries.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('visits')}
          className={`pb-3 px-2 sm:px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'visits'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Site Visit Requests ({siteVisits.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('offers')}
          className={`pb-3 px-2 sm:px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'offers'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <IndianRupee className="w-4 h-4" />
          <span>Purchase Offers ({offers.length})</span>
        </button>
      </div>

      {/* Tab 1: General Inquiries */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {generalInquiries.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              No buyer inquiries received yet.
            </div>
          ) : (
            generalInquiries.map((inq) => (
              <div
                key={inq.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        #{inq.reference_number}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          inq.status === 'unread'
                            ? 'bg-rose-100 text-rose-800'
                            : inq.status === 'read'
                            ? 'bg-amber-100 text-amber-800'
                            : inq.status === 'responded'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {inq.status.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">
                      {inq.listing_title}
                    </h3>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium">
                    {new Date(inq.created_at).toLocaleString()}
                  </span>
                </div>

                {/* Buyer Message */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs text-slate-700 space-y-2">
                  <p className="font-medium italic leading-relaxed">
                    "{inq.message}"
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span className="inline-flex items-center space-x-1 font-semibold text-slate-700">
                      <User className="w-3.5 h-3.5" />
                      <span>{inq.buyer_name}</span>
                    </span>
                    <span className="inline-flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{inq.buyer_phone}</span>
                    </span>
                    <span className="inline-flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{inq.buyer_email}</span>
                    </span>
                  </div>
                </div>

                {/* Seller Reply Display */}
                {inq.seller_reply && (
                  <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Your Response:
                    </span>
                    <p className="leading-relaxed">{inq.seller_reply}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 pt-2">
                  {inq.status === 'unread' && (
                    <button
                      type="button"
                      onClick={() => handleMarkInquiryRead(inq.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setReplyModalInquiry(inq);
                      setReplyText(inq.seller_reply || '');
                    }}
                    className="inline-flex items-center space-x-1 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>{inq.seller_reply ? 'Edit Reply' : 'Send Reply'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Site Visits */}
      {activeTab === 'visits' && (
        <div className="space-y-4">
          {siteVisits.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              No site visit appointments requested.
            </div>
          ) : (
            siteVisits.map((visit) => (
              <div
                key={visit.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        #{visit.reference_number}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          visit.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : visit.status === 'declined'
                            ? 'bg-rose-100 text-rose-800'
                            : visit.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {visit.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">
                      {visit.listing_title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>{visit.visit_date}</span>
                    <span className="text-slate-400">|</span>
                    <span className="capitalize">{visit.time_slot}</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs text-slate-700 space-y-2">
                  <p className="font-medium leading-relaxed">
                    Buyer Notes: <span className="italic">{visit.notes || 'None provided'}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span className="inline-flex items-center space-x-1 font-semibold text-slate-700">
                      <User className="w-3.5 h-3.5" />
                      <span>{visit.buyer_name}</span>
                    </span>
                    <span className="inline-flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{visit.buyer_phone}</span>
                    </span>
                    <span className="inline-flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{visit.buyer_email}</span>
                    </span>
                  </div>
                </div>

                {/* Visit Workflow Actions */}
                <div className="flex items-center justify-end space-x-2 pt-2">
                  {visit.status === 'pending_confirmation' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpdateVisitStatus(visit.id, 'declined')}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                      >
                        Decline Visit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateVisitStatus(visit.id, 'confirmed')}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
                      >
                        Confirm Appointment
                      </button>
                    </>
                  )}
                  {visit.status === 'confirmed' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateVisitStatus(visit.id, 'completed')}
                      className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Purchase Offers */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          {offers.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              No formal purchase offers received yet.
            </div>
          ) : (
            offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        Formal Offer
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          offer.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : offer.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : offer.status === 'countered'
                            ? 'bg-purple-100 text-purple-800'
                            : offer.status === 'withdrawn'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {offer.status.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 mt-1">
                      {offer.listing_title}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Proposed Price</span>
                    <span className="text-xl font-black text-slate-900">
                      ₹{(offer.offer_amount / 100000).toFixed(2)} Lakhs
                    </span>
                  </div>
                </div>

                {/* Offer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-medium">Token Advance</span>
                    <span className="font-bold text-slate-800">
                      {offer.token_amount ? `₹${(offer.token_amount / 100000).toFixed(2)} Lakhs` : 'None proposed'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-medium">Buyer Identity</span>
                    <span className="font-bold text-slate-800">{offer.buyer_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-medium">Valid Until</span>
                    <span className="font-bold text-slate-800">
                      {new Date(offer.valid_until).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {offer.terms && (
                  <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                    <span className="font-bold text-slate-800">Conditions & Terms:</span> {offer.terms}
                  </div>
                )}

                {offer.status === 'countered' && offer.counter_amount && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900">
                    <span className="font-bold">You countered with: </span>
                    <span className="font-black text-sm">₹{(offer.counter_amount / 100000).toFixed(2)} Lakhs</span>
                    {offer.response_notes && <p className="mt-1 text-slate-600">{offer.response_notes}</p>}
                  </div>
                )}

                {/* Offer Action Buttons */}
                {offer.status === 'pending' && (
                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleOfferAction(offer.id, 'rejected')}
                      className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                    >
                      Decline Offer
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCounterModalOffer(offer);
                        setCounterAmountLakhs(((offer.offer_amount * 1.05) / 100000).toFixed(2));
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
                    >
                      Propose Counter-Offer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOfferAction(offer.id, 'accepted')}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
                    >
                      Accept Offer
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Reply Modal */}
      {replyModalInquiry && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Reply to #{replyModalInquiry.reference_number} ({replyModalInquiry.buyer_name})
            </h3>
            <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
              "{replyModalInquiry.message}"
            </p>

            <form onSubmit={handleSendReply} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Your Response Message *
                </label>
                <textarea
                  required
                  rows="4"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Provide clarifying answers regarding water, EB, documentation, or price..."
                  className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setReplyModalInquiry(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Send Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Counter Offer Modal */}
      {counterModalOffer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Propose Counter-Offer to {counterModalOffer.buyer_name}
            </h3>
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between">
              <span>Original Buyer Offer:</span>
              <span className="font-bold text-slate-900">
                ₹{(counterModalOffer.offer_amount / 100000).toFixed(2)} Lakhs
              </span>
            </div>

            <form onSubmit={handleSendCounterOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Counter-Offer Amount (₹ Lakhs) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={counterAmountLakhs}
                  onChange={(e) => setCounterAmountLakhs(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Counter-Offer Notes / Conditions
                </label>
                <textarea
                  rows="3"
                  value={counterNotes}
                  onChange={(e) => setCounterNotes(e.target.value)}
                  placeholder="e.g. Willing to close at this price if registration is completed within 30 days..."
                  className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCounterModalOffer(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-xs"
                >
                  Submit Counter-Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
