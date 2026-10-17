import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  MessageSquare,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { offerService } from '../../services/offerService';
import { inquiryService } from '../../services/inquiryService';

export const BuyerOffersPage = () => {
  const { user } = useAuth();
  const buyerId = user?.id || 'test-buyer';

  const [activeTab, setActiveTab] = useState('offers'); // offers, inquiries
  const [offers, setOffers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);

  const loadData = () => {
    try {
      const myOffers = offerService.getOffersByBuyer(buyerId);
      setOffers(myOffers);

      const myInquiries = inquiryService.getInquiriesByBuyer(buyerId);
      setInquiries(myInquiries);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [buyerId]);

  const showToast = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleWithdrawOffer = (offerId) => {
    if (!confirm('Are you sure you want to withdraw this purchase offer?')) return;
    try {
      offerService.withdrawOffer(offerId, buyerId);
      loadData();
      showToast('Offer withdrawn successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRespondCounter = (offerId, action) => {
    try {
      offerService.respondToCounterOffer(offerId, buyerId, action);
      loadData();
      showToast(`Counter-offer ${action} successfully.`);
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
            <IndianRupee className="w-6 h-6 text-emerald-700" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              My Purchase Offers & Communications
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Track submitted purchase offers, negotiate counter-offers, and view seller responses.
          </p>
        </div>

        <Link
          to="/buy"
          className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
        >
          <span>Explore Land Marketplace</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
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
          onClick={() => setActiveTab('offers')}
          className={`pb-3 px-2 sm:px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'offers'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <IndianRupee className="w-4 h-4" />
          <span>My Purchase Offers ({offers.length})</span>
        </button>

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
          <span>Inquiries & Site Visits ({inquiries.length})</span>
        </button>
      </div>

      {/* Tab: Offers */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          {offers.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
              <p className="text-xs text-slate-400">You haven't submitted any purchase offers yet.</p>
              <Link
                to="/buy"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                Find land parcels on the marketplace →
              </Link>
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
                        Formal Purchase Offer
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
                    <Link
                      to={`/property/${offer.listing_id}`}
                      className="text-base font-extrabold text-slate-900 hover:text-emerald-700 transition-colors mt-1 inline-flex items-center space-x-1"
                    >
                      <span>{offer.listing_title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Your Offer Amount</span>
                    <span className="text-xl font-black text-slate-900">
                      ₹{(offer.offer_amount / 100000).toFixed(2)} Lakhs
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-medium">Token Advance</span>
                    <span className="font-bold text-slate-800">
                      {offer.token_amount ? `₹${(offer.token_amount / 100000).toFixed(2)} Lakhs` : 'None proposed'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-medium">Valid Until</span>
                    <span className="font-bold text-slate-800">
                      {new Date(offer.valid_until).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-medium">Submitted On</span>
                    <span className="font-bold text-slate-800">
                      {new Date(offer.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {offer.terms && (
                  <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                    <span className="font-bold">Conditions:</span> {offer.terms}
                  </div>
                )}

                {/* Seller Counter-Offer Banner */}
                {offer.status === 'countered' && offer.counter_amount && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                          Seller Counter-Offer Received
                        </span>
                        <div className="text-lg font-black text-purple-950">
                          ₹{(offer.counter_amount / 100000).toFixed(2)} Lakhs
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleRespondCounter(offer.id, 'rejected')}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                        >
                          Decline Counter
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRespondCounter(offer.id, 'accepted')}
                          className="px-4 py-1.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg transition-colors shadow-2xs"
                        >
                          Accept Counter-Offer
                        </button>
                      </div>
                    </div>
                    {offer.response_notes && (
                      <p className="text-xs text-slate-600 italic">
                        Seller message: "{offer.response_notes}"
                      </p>
                    )}
                  </div>
                )}

                {/* Actions: Withdraw */}
                {(offer.status === 'pending' || offer.status === 'countered') && (
                  <div className="flex items-center justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => handleWithdrawOffer(offer.id)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Withdraw Offer</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Inquiries */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {inquiries.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              No inquiries submitted yet.
            </div>
          ) : (
            inquiries.map((inq) => (
              <div
                key={inq.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        #{inq.reference_number}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          inq.status === 'responded' || inq.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inq.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <Link
                      to={`/property/${inq.listing_id}`}
                      className="text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors mt-1 inline-flex items-center space-x-1"
                    >
                      <span>{inq.listing_title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {new Date(inq.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700">
                  <p className="font-medium italic">"{inq.message || inq.notes || 'Site visit request'}"</p>
                </div>

                {inq.seller_reply && (
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Seller Response:
                    </span>
                    <p className="leading-relaxed">{inq.seller_reply}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
