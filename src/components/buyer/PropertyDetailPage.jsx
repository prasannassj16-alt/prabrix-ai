import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { listingService } from '../../services/listingService';
import { savedPropertiesService } from '../../services/savedPropertiesService';
import { compareService } from '../../services/compareService';
import { inquiryService } from '../../services/inquiryService';
import { offerService } from '../../services/offerService';
import { buyerRequirementService } from '../../services/buyerRequirementService';
import { calculateMatchScore } from '../../services/matchingService';
import { MatchScoreCard } from '../matching/MatchScoreCard';
import { AnalysisPreviewCard } from '../analysis/AnalysisPreviewCard';
import { NearbyAmenitiesView } from '../geospatial/NearbyAmenitiesView';
import { ValuationBreakdown } from '../valuation/ValuationBreakdown';
import { PrivateDocumentVault } from '../documents/PrivateDocumentVault';
import { DevelopmentSuggestionsPanel } from '../development/DevelopmentSuggestionsPanel';
import { getAllUnitConversions } from '../../services/areaConverter';
import { FieldProvenanceBadge } from './FieldProvenanceBadge';
import { MapView } from '../map/MapView';
import { LocationPicker } from '../map/LocationPicker';
import { L, createCategoryIcon } from '../map/leafletConfig';
import { useToast } from '../../context/ToastContext';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import {
  Activity,
  MapPin,
  Heart,
  Scale,
  ShieldCheck,
  Droplets,
  Zap,
  Ruler,
  Eye,
  IndianRupee,
  Calendar,
  Clock,
  Phone,
  Mail,
  Lock,
  FileText,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Compass,
  Check,
} from 'lucide-react';

export const PropertyDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isInCompare, setIsInCompare] = useState(false);

  // Inquiry / Site Visit / Formal Offer Form State
  const [activeTab, setActiveTab] = useState('inquiry'); // 'inquiry' | 'visit' | 'offer'
  const [buyerName, setBuyerName] = useState(user?.full_name || '');
  const [buyerPhone, setBuyerPhone] = useState(user?.phone || '');
  const [buyerEmail, setBuyerEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [proposedOffer, setProposedOffer] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('morning');
  const [visitType, setVisitType] = useState('in_person');
  const [visitNotes, setVisitNotes] = useState('');
  const [offerAmountLakhs, setOfferAmountLakhs] = useState('');
  const [tokenAmountLakhs, setTokenAmountLakhs] = useState('');
  const [offerTerms, setOfferTerms] = useState('');

  const [formError, setFormError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  useEffect(() => {
    // Fetch listing with privacy protection applied (masked seller phone/email unless opted in)
    const data = listingService.getListingWithPrivacy(id);
    if (data) {
      setListing(data);
      const userId = user?.id || 'anonymous';
      setIsSaved(savedPropertiesService.isSaved(data.id, userId));
      setIsInCompare(compareService.isInCompare(data.id));
    }
  }, [id, user]);

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Property Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          The requested land parcel may have been sold, paused, or does not exist.
        </p>
        <Link
          to="/buy"
          className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Marketplace</span>
        </Link>
      </div>
    );
  }

  const handleSaveToggle = () => {
    const userId = user?.id || 'anonymous';
    const nowSaved = savedPropertiesService.toggleSave(listing.id, userId);
    setIsSaved(nowSaved);
    toast.success(nowSaved ? 'Saved to Shortlist' : 'Removed from Shortlist');
  };

  const handleCompareToggle = () => {
    const res = compareService.toggleCompare(listing);
    if (res.error) {
      toast.error(res.error);
    } else {
      setIsInCompare(res.inCompare);
      toast.info(res.inCompare ? 'Added to Compare Bar' : 'Removed from Compare');
    }
  };

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const result = inquiryService.submitInquiry({
        listingId: listing.id,
        buyerId: user?.id || 'anonymous',
        buyerName,
        buyerPhone,
        buyerEmail,
        message,
        proposedOffer,
      });
      setSubmissionSuccess({
        type: 'inquiry',
        ref: result.reference_number,
        title: 'Inquiry Submitted Successfully',
        message: 'Your inquiry has been logged. The property representative will contact you.',
      });
      toast.success('Inquiry transmitted to landowner successfully!');
    } catch (err) {
      setFormError(err.message || 'Error submitting inquiry.');
    }
  };

  const handleSiteVisitSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const result = inquiryService.submitSiteVisitRequest({
        listingId: listing.id,
        buyerId: user?.id || 'anonymous',
        buyerName,
        buyerPhone,
        buyerEmail,
        visitDate,
        timeSlot,
        visitType,
        notes: visitNotes,
      });
      setSubmissionSuccess({
        type: 'visit',
        ref: result.reference_number,
        title: 'Site Visit Booking Requested',
        message: `Your appointment request for ${visitDate} (${timeSlot}) has been registered.`,
      });
      toast.success('Site visit appointment requested successfully!');
    } catch (err) {
      setFormError(err.message || 'Error booking site visit.');
    }
  };

  const handleOfferSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const amount = (Number(offerAmountLakhs) || 0) * 100000;
      const token = (Number(tokenAmountLakhs) || 0) * 100000;
      const result = offerService.submitOffer({
        listingId: listing.id,
        listingTitle: listing.title,
        buyerId: user?.id || 'test-buyer',
        buyerName: buyerName || user?.full_name || 'Verified Buyer',
        buyerPhone,
        sellerId: listing.owner_id || 'demo-seller-1',
        offerAmount: amount,
        tokenAmount: token,
        terms: offerTerms,
      });
      setSubmissionSuccess({
        type: 'offer',
        ref: result.id,
        title: 'Purchase Offer Submitted Successfully',
        message: `Your formal offer of ₹${Number(offerAmountLakhs).toFixed(2)} Lakhs has been recorded and dispatched to the seller.`,
      });
      toast.success('Purchase offer dispatched to seller successfully!');
    } catch (err) {
      setFormError(err.message || 'Error submitting offer.');
    }
  };

  const buyerRequirements = buyerRequirementService.getRequirementsByBuyer(user?.id || 'test-buyer');
  const activeReq = buyerRequirements.find((r) => r.status === 'active') || buyerRequirements[0];
  const matchResult = (activeReq && listing) ? calculateMatchScore(activeReq, listing) : null;

  const areaSqft = Number(listing.area_sqft || 0);
  const areaCents = listing.area_cents || (areaSqft / 435.6).toFixed(2);
  const price = Number(listing.price || 0);
  const pricePerSqft = areaSqft > 0 ? (price / areaSqft).toFixed(2) : 0;
  const pricePerCent = areaCents > 0 ? (price / areaCents).toFixed(0) : 0;
  const conversions = getAllUnitConversions(areaSqft, 'sq_ft', 2);

  const photos = listing.photos && listing.photos.length > 0
    ? listing.photos
    : [
        {
          id: 'def',
          url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
          caption: 'Overview of parcel',
        },
      ];

  const activePhoto = photos[activePhotoIndex] || photos[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 w-full min-w-0">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Marketplace', to: '/buy' }, { label: listing.title }]} />

      {/* Navigation Breadcrumb & Back CTA */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to="/buy"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Land Marketplace</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {/* Land Intelligence Dossier Button */}
          <Link
            to={`/property/${listing.id}/analysis`}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors shadow-sm"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Land Intelligence</span>
          </Link>

          {/* Compare Button */}
          <button
            type="button"
            onClick={handleCompareToggle}
            className={`inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors shadow-sm ${
              isInCompare
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isInCompare ? 'In Compare' : 'Add to Compare'}</span>
          </button>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={handleSaveToggle}
            className={`inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors shadow-sm ${
              isSaved
                ? 'bg-rose-50 border-rose-300 text-rose-700'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-rose-600' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Shortlist'}</span>
          </button>
        </div>
      </div>

      {/* Property Title & Top Highlights */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-full bg-slate-900 text-white tracking-wider">
            {listing.property_type || 'Land'}
          </span>
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            Published
          </span>
          {listing.is_verified && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-600 text-white shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Government Record Verified</span>
            </span>
          )}
          <span className="text-xs text-slate-400 font-mono ml-auto">
            Ref #{listing.id.substring(0, 8)}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
          {listing.title}
        </h1>

        <div className="flex items-center text-xs text-slate-500 space-x-1.5">
          <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span>
            {listing.address || 'Address on file'} &bull; {listing.taluk}, {listing.district}, Tamil Nadu &bull; Pincode {listing.pincode || 'N/A'}
          </span>
        </div>
      </div>

      {/* Main Grid: Left Photos & Attributes, Right Pricing & Inquiry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Photo Gallery + Provenance Attributes Table + Map */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Photo Showcase Carousel */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="relative aspect-[16/10] bg-slate-900">
              <img
                src={activePhoto.url}
                alt={activePhoto.caption || listing.title}
                className="w-full h-full object-cover"
              />
              {activePhoto.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 backdrop-blur-sm p-2 text-center text-xs text-slate-200">
                  {activePhoto.caption}
                </div>
              )}
            </div>

            {/* Thumbnail Selector */}
            {photos.length > 1 && (
              <div className="p-3 bg-slate-50 flex items-center space-x-2 overflow-x-auto border-t border-slate-200">
                {photos.map((p, idx) => (
                  <button
                    key={p.id || idx}
                    type="button"
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                      idx === activePhotoIndex ? 'border-emerald-600 scale-105 shadow' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={p.url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Deterministic Match Score Card against Buyer Acquisition Criteria */}
          {matchResult && (
            <MatchScoreCard matchResult={matchResult} requirementTitle={activeReq?.title} />
          )}

          {/* Land Intelligence & 4-Pillar Diligence Preview */}
          <AnalysisPreviewCard listing={listing} />

          {/* Description */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Property Overview & Narrative</h3>
              <FieldProvenanceBadge type="seller_provided" />
            </div>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {listing.description || 'No detailed description provided by the seller.'}
            </p>
          </div>

          {/* STRICT REQUIREMENT: Provenance-Labeled Attributes Matrix */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Verified Land Attributes & Provenance Audit
                </h3>
                <p className="text-[11px] text-slate-500">
                  Each attribute is categorized: government-verified, seller-provided, system-calculated, or missing.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Field Name</th>
                    <th className="py-2.5 px-3">Value</th>
                    <th className="py-2.5 px-3 text-right">Data Provenance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Title */}
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-600">Headline Title</td>
                    <td className="py-2 px-3 font-semibold text-slate-800">{listing.title}</td>
                    <td className="py-2 px-3 text-right">
                      <FieldProvenanceBadge type="seller_provided" />
                    </td>
                  </tr>

                  {/* Survey Number */}
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-600">Revenue Survey Number</td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">
                      {listing.survey_number || 'Not provided'}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {listing.survey_number ? (
                        <FieldProvenanceBadge type="verified" label="Govt Verified" />
                      ) : (
                        <FieldProvenanceBadge type="missing" />
                      )}
                    </td>
                  </tr>

                  {/* Patta Number */}
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-600">Tamil Nilam Patta Number</td>
                    <td className="py-2 px-3 font-mono font-semibold text-slate-800">
                      {listing.patta_number || 'Unspecified'}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {listing.patta_number ? (
                        <FieldProvenanceBadge type="verified" label="Patta Verified" />
                      ) : (
                        <FieldProvenanceBadge type="missing" />
                      )}
                    </td>
                  </tr>

                  {/* Geospatial GPS Coordinates */}
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-600">GPS Reference Point</td>
                    <td className="py-2 px-3 font-mono text-slate-800">
                      {listing.latitude?.toFixed(4)}, {listing.longitude?.toFixed(4)}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <FieldProvenanceBadge type="verified" label="GPS Point" />
                    </td>
                  </tr>

                  {/* Total Area in Base Sq.Ft. */}
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-600">Base Area (Square Feet)</td>
                    <td className="py-2 px-3 font-bold text-slate-800">
                      {Number(areaSqft).toLocaleString('en-IN')} sq.ft.
                    </td>
                    <td className="py-2 px-3 text-right">
                      <FieldProvenanceBadge type="seller_provided" />
                    </td>
                  </tr>

                  {/* Calculated Area in Cents */}
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-600">Area in Tamil Nadu Cents</td>
                    <td className="py-2 px-3 font-bold text-emerald-700">
                      {areaCents} Cents (1 Cent = 435.6 sq.ft.)
                    </td>
                    <td className="py-2 px-3 text-right">
                      <FieldProvenanceBadge type="calculated" />
                    </td>
                  </tr>

                  {/* Calculated Area in Acres */}
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-600">Area in Standard Acres</td>
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      {conversions ? conversions.acre : 0} Acres
                    </td>
                    <td className="py-2 px-3 text-right">
                      <FieldProvenanceBadge type="calculated" />
                    </td>
                  </tr>

                  {/* Asking Price */}
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-600">Total Asking Price</td>
                    <td className="py-2 px-3 font-bold text-emerald-700">
                      ₹{price.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <FieldProvenanceBadge type="seller_provided" />
                    </td>
                  </tr>

                  {/* Calculated Rate per Sq.Ft. */}
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-600">Calculated Rate / Sq.Ft.</td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-800">
                      ₹{pricePerSqft} / sq.ft.
                    </td>
                    <td className="py-2 px-3 text-right">
                      <FieldProvenanceBadge type="calculated" />
                    </td>
                  </tr>

                  {/* Calculated Rate per Cent */}
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-600">Calculated Rate / Cent</td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-800">
                      ₹{Number(pricePerCent).toLocaleString('en-IN')} / Cent
                    </td>
                    <td className="py-2 px-3 text-right">
                      <FieldProvenanceBadge type="calculated" />
                    </td>
                  </tr>

                  {/* Road Width & Type */}
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-600">Access Road Frontage</td>
                    <td className="py-2 px-3 text-slate-800">
                      {listing.road_width_ft || 0} ft width ({listing.road_type || 'unpaved'} surface)
                    </td>
                    <td className="py-2 px-3 text-right">
                      <FieldProvenanceBadge type="seller_provided" />
                    </td>
                  </tr>

                  {/* Water Source */}
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-600">Water Source</td>
                    <td className="py-2 px-3 text-slate-800 capitalize">
                      {listing.water_source || 'none'}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <FieldProvenanceBadge type="seller_provided" />
                    </td>
                  </tr>

                  {/* Electricity Connected */}
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-600">TNEB Electricity Power</td>
                    <td className="py-2 px-3 text-slate-800">
                      {listing.electricity_connected ? 'Connected' : 'Not Connected'}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <FieldProvenanceBadge type="seller_provided" />
                    </td>
                  </tr>

                  {/* Soil Classification */}
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-600">Soil Classification</td>
                    <td className="py-2 px-3 text-slate-800 capitalize">
                      {listing.soil_type || 'unclassified'}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <FieldProvenanceBadge type="seller_provided" />
                    </td>
                  </tr>

                  {/* Boundary Wall */}
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-600">Boundary Demarcation</td>
                    <td className="py-2 px-3 text-slate-800 capitalize">
                      {listing.boundary_wall ? listing.boundary_wall.replace('_', ' ') : 'Not specified'}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {listing.boundary_wall ? (
                        <FieldProvenanceBadge type="seller_provided" />
                      ) : (
                        <FieldProvenanceBadge type="missing" />
                      )}
                    </td>
                  </tr>

                  {/* Facing Direction */}
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-600">Facing Direction</td>
                    <td className="py-2 px-3 text-slate-800 capitalize">
                      {listing.facing_direction || 'Not specified'}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {listing.facing_direction ? (
                        <FieldProvenanceBadge type="seller_provided" />
                      ) : (
                        <FieldProvenanceBadge type="missing" />
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Geospatial Map View & Disclaimer */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Geospatial Location Map</span>
            </h3>

            <div className="rounded-xl overflow-hidden border border-slate-200 h-64">
              <MapView
                center={[listing.latitude || 11.0, listing.longitude || 77.0]}
                zoom={14}
                onMapReady={(map) => {
                  const icon = createCategoryIcon(listing.property_type || 'agricultural', true);
                  L.marker([listing.latitude, listing.longitude], { icon })
                    .addTo(map)
                    .bindPopup(`<b>${listing.title}</b><br/>${listing.district}`);
                }}
              />
            </div>

            {/* Cartographic boundary disclaimer */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Cartographic Disclaimer:</span> The map marker indicates an approximate reference point for discovery purposes. Markers do not constitute a legal parcel boundary, surveyed perimeter, or government revenue demarcation.
              </div>
            </div>
          </div>

          {/* Confidential Private Document Vault & OCR Ground-Truth Audit */}
          <PrivateDocumentVault listing={listing} />

          {/* Future-Use & Development Potential Analysis */}
          <DevelopmentSuggestionsPanel listing={listing} />

          {/* Comparative Valuation & 4-Metric Breakdown */}
          <ValuationBreakdown listing={listing} />

          {/* Real-time OpenStreetMap Overpass Nearby Roads & Infrastructure */}
          <NearbyAmenitiesView
            latitude={listing.latitude}
            longitude={listing.longitude}
            propertyName={listing.title}
            district={listing.district}
          />
        </div>

        {/* Right Column (4 cols / 5 cols): Pricing Card + Seller Privacy Box + Inquiry / Site Visit Form */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5 sticky top-20">
          {/* Asking Price Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Asking Price
              </span>
              <FieldProvenanceBadge type="seller_provided" />
            </div>

            <div className="text-2xl font-extrabold text-emerald-700">
              ₹{price.toLocaleString('en-IN')}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl grid grid-cols-2 gap-2 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Rate / Sq.Ft.</span>
                <span className="font-bold text-slate-800">₹{pricePerSqft}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Rate / Cent</span>
                <span className="font-bold text-slate-800">₹{Number(pricePerCent).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* STRICT REQUIREMENT: Seller Contact Privacy Protection Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>Owner & Contact Information</span>
            </h3>

            {listing.show_seller_contact ? (
              /* Seller opted to publish phone & email */
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
                <div className="font-bold text-emerald-900">{listing.owner_name || 'Land Owner'}</div>
                <div className="flex items-center space-x-2 text-slate-700 font-mono">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{listing.owner_phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{listing.owner_email}</span>
                </div>
              </div>
            ) : (
              /* STRICT RULE: Seller phone & email are masked and NEVER exposed */
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center space-x-1.5 text-slate-800 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>PRABRIX Privacy Protection Active</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  The property seller's direct phone number and email are kept strictly confidential. Submit your inquiry below to safely initiate direct communication or arrange a physical site visit.
                </p>
                <div className="pt-1 text-[10px] font-mono text-slate-400">
                  Contact: [CONFIDENTIAL_PROTECTED]
                </div>
              </div>
            )}
          </div>

          {/* Inquiry & Site Visit Request Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            {/* Tabs for switching between Inquiry, Formal Offer, and Site Visit Booking */}
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('inquiry');
                  setSubmissionSuccess(null);
                }}
                className={`flex-1 py-1.5 text-center rounded-lg transition-all ${
                  activeTab === 'inquiry'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Send Inquiry / Offer
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('offer');
                  setSubmissionSuccess(null);
                }}
                className={`flex-1 py-1.5 text-center rounded-lg transition-all ${
                  activeTab === 'offer'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Make Formal Offer
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('visit');
                  setSubmissionSuccess(null);
                }}
                className={`flex-1 py-1.5 text-center rounded-lg transition-all ${
                  activeTab === 'visit'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Book Site Visit
              </button>
            </div>

            {submissionSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">{submissionSuccess.title}</h4>
                <p className="text-xs text-slate-600">{submissionSuccess.message}</p>
                <div className="p-2 bg-white rounded-lg border border-emerald-200 text-xs font-mono font-bold text-emerald-800 inline-block">
                  Reference: #{submissionSuccess.ref}
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmissionSuccess(null)}
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    Submit Another Request
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {formError && (
                  <div className="p-2.5 mb-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {activeTab === 'inquiry' ? (
                  /* Inquiry Form */
                  <form onSubmit={handleInquirySubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1" htmlFor="inqName">
                        Your Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="inqName"
                        type="text"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        placeholder="e.g. Ananya Krishnan"
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1" htmlFor="inqPhone">
                        Mobile Number (India) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="inqPhone"
                        type="tel"
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        placeholder="e.g. 9840223344"
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1" htmlFor="inqEmail">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="inqEmail"
                        type="email"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        placeholder="e.g. buyer@example.com"
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1" htmlFor="inqOffer">
                        Proposed Offer Amount (Optional INR)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                          <IndianRupee className="w-3.5 h-3.5" />
                        </div>
                        <input
                          id="inqOffer"
                          type="number"
                          value={proposedOffer}
                          onChange={(e) => setProposedOffer(e.target.value)}
                          placeholder="e.g. 4200000"
                          className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1" htmlFor="inqMsg">
                        Message / Specific Inquiries
                      </label>
                      <textarea
                        id="inqMsg"
                        rows="3"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ask about water yield, road access, title deeds..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Send Inquiries to Seller</span>
                    </button>
                  </form>
                ) : activeTab === 'offer' ? (
                  /* Formal Purchase Offer Form */
                  <form onSubmit={handleOfferSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1" htmlFor="offName">
                        Your Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="offName"
                        type="text"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        placeholder="e.g. Anand Kumar"
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1" htmlFor="offPhone">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="offPhone"
                        type="tel"
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        placeholder="e.g. 9840112233"
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1" htmlFor="offAmount">
                          Offer Price (₹ Lakhs) <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="offAmount"
                          type="number"
                          step="0.01"
                          required
                          value={offerAmountLakhs}
                          onChange={(e) => setOfferAmountLakhs(e.target.value)}
                          placeholder="e.g. 42.00"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1" htmlFor="offToken">
                          Token Advance (₹ Lakhs)
                        </label>
                        <input
                          id="offToken"
                          type="number"
                          step="0.01"
                          value={tokenAmountLakhs}
                          onChange={(e) => setTokenAmountLakhs(e.target.value)}
                          placeholder="e.g. 2.00"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1" htmlFor="offTerms">
                        Contingencies & Terms (Optional)
                      </label>
                      <textarea
                        id="offTerms"
                        rows="2"
                        value={offerTerms}
                        onChange={(e) => setOfferTerms(e.target.value)}
                        placeholder="e.g. Subject to Patta title clearance and boundary survey within 15 days..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <IndianRupee className="w-3.5 h-3.5" />
                      <span>Submit Formal Purchase Offer</span>
                    </button>
                  </form>
                ) : (
                  /* Site Visit / Callback Request Form */
                  <form onSubmit={handleSiteVisitSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1" htmlFor="vName">
                        Your Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="vName"
                        type="text"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1" htmlFor="vPhone">
                          Mobile <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="vPhone"
                          type="tel"
                          value={buyerPhone}
                          onChange={(e) => setBuyerPhone(e.target.value)}
                          required
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1" htmlFor="vEmail">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="vEmail"
                          type="email"
                          value={buyerEmail}
                          onChange={(e) => setBuyerEmail(e.target.value)}
                          required
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1" htmlFor="vDate">
                        Preferred Inspection Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="vDate"
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Time Window</label>
                        <select
                          value={timeSlot}
                          onChange={(e) => setTimeSlot(e.target.value)}
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="morning">Morning (9 AM - 12 PM)</option>
                          <option value="afternoon">Afternoon (12 PM - 3 PM)</option>
                          <option value="evening">Evening (3 PM - 6 PM)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Visit Format</label>
                        <select
                          value={visitType}
                          onChange={(e) => setVisitType(e.target.value)}
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="in_person">Physical Site Visit</option>
                          <option value="video_tour">Virtual Video Walkthrough</option>
                          <option value="callback">Direct Phone Callback</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1" htmlFor="vNotes">
                        Notes / Location Assistance Needed
                      </label>
                      <textarea
                        id="vNotes"
                        rows="2"
                        value={visitNotes}
                        onChange={(e) => setVisitNotes(e.target.value)}
                        placeholder="e.g. Need representative at Sulur bus stop"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Request Site Visit Appointment</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
