import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  FileText,
  Clock,
  ShieldCheck,
  Eye,
  MapPin,
} from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS } from '../../../services/listingService';

export const ListingSuccessPage = ({ listing, onResetWizard }) => {
  const navigate = useNavigate();

  const isDraft = listing.status === 'draft';
  const isPending = listing.status === 'pending_review';
  const isPublished = listing.status === 'published';

  const statusBadgeClass = STATUS_COLORS[listing.status] || 'bg-slate-100 text-slate-700';

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm text-center">
        {/* Animated Check Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full mb-4 shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900">
          {isDraft && 'Listing Draft Saved'}
          {isPending && 'Listing Submitted for Verification'}
          {isPublished && 'Listing Successfully Published!'}
        </h1>

        <p className="text-sm text-slate-600 mt-2 max-w-lg mx-auto">
          {isDraft &&
            'Your property details are securely stored as a draft. You can continue editing or publish it at any time from your Seller Dashboard.'}
          {isPending &&
            'Your land parcel details and private revenue documents have been placed in the verification queue. Our land analysts verify revenue records within 24 business hours.'}
          {isPublished &&
            'Your parcel is now live on PRABRIX AI marketplace. Verified buyers across Tamil Nadu can discover your property via map coordinates and search.'}
        </p>

        {/* Property Reference Card */}
        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Reference ID</span>
            <span className="font-mono text-xs font-bold text-slate-700">{listing.id}</span>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">{listing.title}</h3>
            <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {listing.district}, {listing.taluk} &bull; Survey #{listing.survey_number || 'N/A'}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Asking Price</span>
              <span className="font-bold text-emerald-700">
                ₹{Number(listing.price || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Area</span>
              <span className="font-bold text-slate-800">
                {listing.area_cents || (listing.area_sqft / 435.6).toFixed(2)} Cents
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Current Status</span>
              <span
                className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusBadgeClass}`}
              >
                {STATUS_LABELS[listing.status] || listing.status}
              </span>
            </div>
          </div>
        </div>

        {/* Zero Fabrication & RLS Security Notice */}
        <div className="mt-6 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-left flex items-start space-x-2.5 text-xs text-blue-900">
          <ShieldCheck className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Integrity Guarantee:</span>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Uploaded revenue documents (Patta, Chitta, EC) are restricted via Row Level Security (RLS). Real view counts and genuine buyer inquiries are recorded in real-time. Zero fake leads.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/seller')}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors"
          >
            <span>Go to Seller Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onResetWizard}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-slate-500" />
            <span>List Another Parcel</span>
          </button>
        </div>
      </div>
    </div>
  );
};
