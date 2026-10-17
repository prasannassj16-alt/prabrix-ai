import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { listingService } from '../../services/listingService';
import { savedPropertiesService } from '../../services/savedPropertiesService';
import { PropertyCard } from './PropertyCard';
import { FloatingCompareBar } from './FloatingCompareBar';
import { Heart, Search, ArrowRight, Trash2, ArrowLeft } from 'lucide-react';

export const SavedPropertiesPage = () => {
  const { user } = useAuth();
  const userId = user?.id || 'anonymous';

  const [savedListings, setSavedListings] = useState([]);

  const loadSaved = () => {
    const savedIds = savedPropertiesService.getSavedListingIds(userId);
    const all = listingService.getPublicListings();
    const matching = all.filter((l) => savedIds.includes(l.id));
    setSavedListings(matching);
  };

  useEffect(() => {
    loadSaved();
  }, [user]);

  const handleSaveToggle = (listingId, nowSaved) => {
    if (!nowSaved) {
      setSavedListings((prev) => prev.filter((l) => l.id !== listingId));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              Buyer Shortlist
            </span>
            <span className="text-xs text-slate-500">
              {savedListings.length} {savedListings.length === 1 ? 'Property' : 'Properties'} Saved
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Saved Land Parcels
          </h1>
          <p className="text-xs text-slate-500">
            Track and compare your shortlisted land parcels across Tamil Nadu.
          </p>
        </div>

        <Link
          to="/buy"
          className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Browse More Land</span>
        </Link>
      </div>

      {savedListings.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white p-6 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Your Shortlist is Empty</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            You haven't bookmarked any land parcels yet. Click the heart icon on any property in the marketplace to save it here.
          </p>
          <Link
            to="/buy"
            className="mt-5 inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors"
          >
            <span>Explore Land Marketplace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedListings.map((listing) => (
            <PropertyCard
              key={listing.id}
              listing={listing}
              userId={userId}
              isSavedInitial={true}
              onSaveToggle={handleSaveToggle}
            />
          ))}
        </div>
      )}

      {/* Floating Compare Tray */}
      <FloatingCompareBar />
    </div>
  );
};
