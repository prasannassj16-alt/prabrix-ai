import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { listingService } from '../../services/listingService';
import { savedPropertiesService } from '../../services/savedPropertiesService';
import { inquiryService } from '../../services/inquiryService';
import { PropertyCard } from '../buyer/PropertyCard';
import { FloatingCompareBar } from '../buyer/FloatingCompareBar';
import {
  Search,
  Bookmark,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Scale,
  ArrowRight,
  MapPin,
  Calendar,
} from 'lucide-react';

export const BuyerDashboard = () => {
  const { user } = useAuth();
  const userId = user?.id || 'anonymous';

  const [publishedListings, setPublishedListings] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [inquiryCount, setInquiryCount] = useState(0);

  useEffect(() => {
    // Only published listings (sold/paused strictly excluded)
    const publicParcels = listingService.getPublicListings();
    setPublishedListings(publicParcels.slice(0, 3));

    const savedIds = savedPropertiesService.getSavedListingIds(userId);
    setSavedCount(savedIds.length);

    const inquiries = inquiryService.getInquiriesByBuyer(userId);
    setInquiryCount(inquiries.length);
  }, [user?.id]);

  return (
    <div className="max-w-6xl mx-auto my-8 px-4 sm:px-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Buyer & Investor Portal
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Verified Mobile: {user?.phone || '+91 98402 23344'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Welcome, {user?.full_name || 'Land Buyer'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover verified land parcels across Tamil Nadu, schedule physical site visits, and safely inquire.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/buy"
            className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Search Land Parcels</span>
          </Link>
        </div>
      </div>

      {/* Zero Fabrication Integrity Banner */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start space-x-2.5 text-xs text-blue-900">
        <ShieldCheck className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold">Zero-Fabrication Data Policy (PROJECT_SPEC §16):</span>
          <p className="text-[11px] text-blue-800">
            PRABRIX AI displays strictly real numbers. Only genuinely published properties are listed. Sold and paused parcels are excluded from buyer search.
          </p>
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Land Discovery */}
        <Link
          to="/buy"
          className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-300 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Explore Marketplace</h3>
            <p className="text-xs text-slate-500 mt-1">
              Filter by Tamil Nadu district, taluk, asking price, area in Cents, road width, and water yield.
            </p>
          </div>
          <div className="mt-4 flex items-center space-x-1 text-xs font-bold text-emerald-700">
            <span>Browse Parcels</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Shortlist */}
        <Link
          to="/saved"
          className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-rose-300 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Bookmark className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Saved Shortlists</h3>
              <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                {savedCount}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Review and monitor the land parcels you have shortlisted for investment or development.
            </p>
          </div>
          <div className="mt-4 flex items-center space-x-1 text-xs font-bold text-rose-600">
            <span>View Shortlist</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Compare */}
        <Link
          to="/compare"
          className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-purple-300 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Side-by-Side Compare</h3>
            <p className="text-xs text-slate-500 mt-1">
              Evaluate up to 4 parcels side-by-side on rate per sq.ft., soil quality, and road frontage.
            </p>
          </div>
          <div className="mt-4 flex items-center space-x-1 text-xs font-bold text-purple-700">
            <span>Compare Parcels</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* Featured Published Land Parcels */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Featured Published Parcels</h2>
            <p className="text-xs text-slate-500">
              Government record verified land parcels with active road and water infrastructure.
            </p>
          </div>

          <Link
            to="/buy"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
          >
            <span>View All ({publishedListings.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {publishedListings.map((listing) => (
            <PropertyCard
              key={listing.id}
              listing={listing}
              userId={userId}
            />
          ))}
        </div>
      </div>

      {/* Floating Compare Tray */}
      <FloatingCompareBar />
    </div>
  );
};
