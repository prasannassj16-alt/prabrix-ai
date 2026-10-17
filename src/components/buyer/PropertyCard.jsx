import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  MapPin,
  Heart,
  Scale,
  ShieldCheck,
  Droplets,
  Zap,
  Ruler,
  Eye,
  Check,
  Building2,
  Trees,
  Home,
  Factory,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { savedPropertiesService } from '../../services/savedPropertiesService';
import { compareService } from '../../services/compareService';
import { useToast } from '../../context/ToastContext';

const DEFAULT_FALLBACK_LAND_IMAGE =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80';

export const PropertyCard = ({
  listing,
  userId = 'anonymous',
  onSaveToggle = null,
  isSavedInitial = false,
  isInCompareInitial = false,
}) => {
  const toast = useToast();
  const shouldReduceMotion = useReducedMotion();

  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [isInCompare, setIsInCompare] = useState(isInCompareInitial);
  const [imgSrc, setImgSrc] = useState(() => {
    return (
      listing?.photos?.find((p) => p.is_cover)?.url ||
      listing?.photos?.[0]?.url ||
      DEFAULT_FALLBACK_LAND_IMAGE
    );
  });

  const handleSaveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = savedPropertiesService.toggleSave(listing.id, userId);
    setIsSaved(nowSaved);
    if (onSaveToggle) onSaveToggle(listing.id, nowSaved);
    toast.success(nowSaved ? 'Property saved to your Shortlist' : 'Property removed from Shortlist');
  };

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const result = compareService.toggleCompare(listing);
    if (result.error) {
      toast.error(result.error);
    } else {
      setIsInCompare(result.inCompare);
      toast.info(result.inCompare ? 'Added to Comparison Bar' : 'Removed from Comparison');
    }
  };

  const areaCents = listing.area_cents || (listing.area_sqft / 435.6).toFixed(2);
  const price = Number(listing.price || 0);

  const formatPriceLakhs = (val) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakhs`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <motion.article
      whileHover={shouldReduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/80 rounded-2xl overflow-hidden shadow-soft hover:shadow-card-hover dark:hover:shadow-card-dark transition-all duration-200 flex flex-col group relative"
    >
      {/* Thumbnail & Quick Action Overlays */}
      <div className="relative aspect-[16/10] bg-slate-100 dark:bg-navy-850 overflow-hidden">
        <img
          src={imgSrc}
          alt={listing.title}
          onError={() => setImgSrc(DEFAULT_FALLBACK_LAND_IMAGE)}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Category & Verified Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-slate-900/85 backdrop-blur-sm text-white tracking-wider">
            {listing.property_type || 'Land'}
          </span>
          {listing.is_verified && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-600/95 backdrop-blur-sm text-white shadow-sm">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified</span>
            </span>
          )}
        </div>

        {/* Action Buttons (Save & Compare) */}
        <div className="absolute top-2.5 right-2.5 flex items-center space-x-1.5 z-10">
          {/* Compare Button */}
          <motion.button
            type="button"
            whileTap={shouldReduceMotion ? undefined : { scale: 0.85 }}
            onClick={handleCompareClick}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
              isInCompare
                ? 'bg-purple-600 text-white'
                : 'bg-white/90 dark:bg-navy-900/90 hover:bg-white text-slate-600 dark:text-slate-200 hover:text-purple-600'
            }`}
            title={isInCompare ? 'Remove from Compare' : 'Add to Compare'}
            aria-label="Compare property"
          >
            <Scale className="w-3.5 h-3.5" />
          </motion.button>

          {/* Bookmark Button */}
          <motion.button
            type="button"
            whileTap={shouldReduceMotion ? undefined : { scale: 0.82 }}
            onClick={handleSaveClick}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
              isSaved
                ? 'bg-rose-500 text-white shadow-rose-500/20 shadow-md'
                : 'bg-white/90 dark:bg-navy-900/90 hover:bg-white text-slate-600 dark:text-slate-200 hover:text-rose-500'
            }`}
            title={isSaved ? 'Remove from Shortlist' : 'Save to Shortlist'}
            aria-label="Save property to shortlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </motion.button>
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-2 left-2.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-white">
          <span className="text-sm font-extrabold text-teal-400">
            {formatPriceLakhs(price)}
          </span>
          <span className="text-[10px] text-slate-300 ml-1.5 font-mono">
            (₹{Number(listing.price_per_sqft || (price / (listing.area_sqft || 1))).toFixed(0)}/sq.ft.)
          </span>
        </div>
      </div>

      {/* Details Container */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 space-x-1 mb-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
            <span className="truncate">
              {listing.district}, {listing.taluk}
            </span>
            {listing.village_panchayat && (
              <>
                <span>&bull;</span>
                <span className="truncate">{listing.village_panchayat}</span>
              </>
            )}
          </div>

          <Link to={`/property/${listing.id}`}>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug hover:text-teal-600 dark:hover:text-teal-400 transition-colors line-clamp-2">
              {listing.title}
            </h3>
          </Link>
        </div>

        {/* Area Metrics */}
        <div className="p-2.5 bg-slate-50 dark:bg-navy-850 rounded-xl grid grid-cols-2 gap-2 text-center text-xs border border-slate-100 dark:border-navy-800">
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-medium">Area in Cents</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 font-mono">{areaCents} Cents</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-medium">Area in Sq.Ft.</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 font-mono">
              {Number(listing.area_sqft || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Site Utility Badges */}
        <div className="flex items-center flex-wrap gap-1.5 text-[10px] text-slate-600 dark:text-slate-300">
          {listing.road_width_ft && (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700">
              {listing.road_width_ft}ft {listing.road_type || 'Road'}
            </span>
          )}
          {listing.water_source && (
            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 capitalize flex items-center space-x-1">
              <Droplets className="w-2.5 h-2.5" />
              <span>{listing.water_source}</span>
            </span>
          )}
          {listing.electricity_connected && (
            <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center space-x-1">
              <Zap className="w-2.5 h-2.5" />
              <span>EB Power</span>
            </span>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            Survey #{listing.survey_number || 'Available on request'}
          </span>

          <Link
            to={`/property/${listing.id}`}
            className="inline-flex items-center space-x-1 text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 group-hover:translate-x-0.5 transition-transform"
          >
            <span>View Details</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </motion.article>
  );
};
