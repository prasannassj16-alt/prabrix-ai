import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Sliders,
  Sparkles,
  MapPin,
  IndianRupee,
  Maximize2,
  Trash2,
  CheckCircle2,
  X,
  ExternalLink,
  Info,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { buyerRequirementService } from '../../services/buyerRequirementService';
import { listingService } from '../../services/listingService';
import { findMatchingListings } from '../../services/matchingService';
import { MatchScoreCard } from '../matching/MatchScoreCard';
import { getDistrictNames } from '../../data/tnLocations';

const TAMIL_NADU_DISTRICTS = getDistrictNames();

export const BuyerRequirementsPage = () => {
  const { user } = useAuth();
  const userId = user?.id || 'test-buyer';

  const [requirements, setRequirements] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [matchedResults, setMatchedResults] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState('agricultural');
  const [selectedDistricts, setSelectedDistricts] = useState(['Coimbatore']);
  const [targetTaluk, setTargetTaluk] = useState('');
  const [minPriceLakhs, setMinPriceLakhs] = useState('30');
  const [maxPriceLakhs, setMaxPriceLakhs] = useState('60');
  const [minAreaCents, setMinAreaCents] = useState('50');
  const [maxAreaCents, setMaxAreaCents] = useState('150');
  const [preferredRoadWidth, setPreferredRoadWidth] = useState('20');
  const [waterRequired, setWaterRequired] = useState(true);
  const [electricityRequired, setElectricityRequired] = useState(true);

  const loadRequirements = () => {
    try {
      const list = buyerRequirementService.getRequirementsByBuyer(userId);
      setRequirements(list);
      if (list.length > 0 && !selectedReq) {
        handleSelectRequirement(list[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadRequirements();
  }, [userId]);

  const handleSelectRequirement = (req) => {
    setSelectedReq(req);
    const publicListings = listingService.getPublicListings();
    const matches = findMatchingListings(req, publicListings, 30);
    setMatchedResults(matches);
  };

  const handleDistrictToggle = (d) => {
    if (selectedDistricts.includes(d)) {
      if (selectedDistricts.length > 1) {
        setSelectedDistricts(selectedDistricts.filter((item) => item !== d));
      }
    } else {
      setSelectedDistricts([...selectedDistricts, d]);
    }
  };

  const handleCreateRequirement = (e) => {
    e.preventDefault();
    try {
      const minPrice = (Number(minPriceLakhs) || 0) * 100000;
      const maxPrice = (Number(maxPriceLakhs) || 0) * 100000;
      const minAreaSqft = (Number(minAreaCents) || 0) * 435.6;
      const maxAreaSqft = (Number(maxAreaCents) || 0) * 435.6;

      const newReq = buyerRequirementService.createRequirement(userId, {
        title,
        preferred_property_type: propertyType,
        target_districts: selectedDistricts,
        target_taluks: targetTaluk ? [targetTaluk.trim()] : [],
        min_price: minPrice,
        max_price: maxPrice,
        min_area_sqft: minAreaSqft,
        max_area_sqft: maxAreaSqft,
        preferred_road_width_ft: Number(preferredRoadWidth) || 0,
        water_required: waterRequired,
        electricity_required: electricityRequired,
      });

      setIsModalOpen(false);
      resetForm();
      loadRequirements();
      handleSelectRequirement(newReq);
      setStatusMessage('Acquisition criteria saved successfully!');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteRequirement = (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this acquisition requirement?')) return;
    try {
      buyerRequirementService.deleteRequirement(id, userId);
      loadRequirements();
      if (selectedReq?.id === id) {
        setSelectedReq(null);
        setMatchedResults([]);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setTitle('');
    setPropertyType('agricultural');
    setSelectedDistricts(['Coimbatore']);
    setTargetTaluk('');
    setMinPriceLakhs('30');
    setMaxPriceLakhs('60');
    setMinAreaCents('50');
    setMaxAreaCents('150');
    setPreferredRoadWidth('20');
    setWaterRequired(true);
    setElectricityRequired(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <Target className="w-6 h-6 text-emerald-700" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Buyer Land Requirements
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Define your acquisition preferences. The PRABRIX Deterministic Matching Engine evaluates and ranks available parcels with full explainability.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Acquisition Criteria</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Grid: Left column list of requirements, Right column matched parcels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Requirements List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Your Requirements ({requirements.length})
            </h2>
          </div>

          {requirements.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-center space-y-3">
              <Sliders className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No acquisition requirements created yet.</p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                + Define your first requirement
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {requirements.map((req) => {
                const isSelected = selectedReq?.id === req.id;
                return (
                  <div
                    key={req.id}
                    onClick={() => handleSelectRequirement(req)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 pr-6">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-white">
                          {req.preferred_property_type}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                          {req.title}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteRequirement(req.id, e)}
                        className="text-slate-300 hover:text-rose-600 p-1"
                        title="Delete requirement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-2.5 mt-2.5 border-t border-slate-200/60">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Districts</span>
                        <span className="font-semibold text-slate-800">
                          {req.target_districts?.join(', ') || 'Any'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Budget</span>
                        <span className="font-semibold text-slate-800">
                          ₹{(req.min_price / 100000).toFixed(0)} - ₹{(req.max_price / 100000).toFixed(0)} L
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Matched Listings for Selected Requirement (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedReq ? (
            <>
              {/* Active Requirement Header */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <h2 className="text-base font-bold text-slate-900">
                      Matched Land Opportunities
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing parcels ranked by compatibility against "{selectedReq.title}"
                  </p>
                </div>

                <div className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-lg">
                  {matchedResults.length} matching parcels found
                </div>
              </div>

              {/* Matched Listings Stream */}
              {matchedResults.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
                  <Info className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">No properties matched this threshold</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Try broadening your target districts, budget limits, or area constraints to surface additional opportunities.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matchedResults.map(({ listing, match }) => (
                    <div
                      key={listing.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all p-4 sm:p-5 space-y-4"
                    >
                      {/* Listing summary row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {listing.property_type}
                            </span>
                            {listing.is_verified && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                                Verified
                              </span>
                            )}
                          </div>
                          <Link
                            to={`/property/${listing.id}`}
                            className="text-base font-extrabold text-slate-900 hover:text-emerald-700 transition-colors line-clamp-1 inline-flex items-center space-x-1"
                          >
                            <span>{listing.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          </Link>
                          <div className="flex items-center space-x-3 text-xs text-slate-500">
                            <span className="inline-flex items-center space-x-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{listing.taluk}, {listing.district}</span>
                            </span>
                            <span>•</span>
                            <span className="font-bold text-slate-800">
                              ₹{(listing.price / 100000).toFixed(2)} Lakhs
                            </span>
                            <span>•</span>
                            <span>{(listing.area_sqft / 435.6).toFixed(1)} Cents</span>
                          </div>
                        </div>

                        <Link
                          to={`/property/${listing.id}`}
                          className="px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors text-center"
                        >
                          View Property & Make Offer →
                        </Link>
                      </div>

                      {/* Deterministic Match Score Card */}
                      <MatchScoreCard matchResult={match} requirementTitle={selectedReq.title} />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              Select an acquisition requirement on the left to see matching parcels.
            </div>
          )}
        </div>
      </div>

      {/* New Requirement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">
                  New Land Acquisition Criteria
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequirement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Requirement Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1-2 Acres Farmland around Coimbatore"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Property Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                  >
                    <option value="agricultural">Agricultural / Farmland</option>
                    <option value="residential">Residential Land</option>
                    <option value="commercial">Commercial Plot</option>
                    <option value="industrial">Industrial Land</option>
                    <option value="mixed_use">Mixed Use</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Specific Taluk (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sulur, Pollachi"
                    value={targetTaluk}
                    onChange={(e) => setTargetTaluk(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Districts Pills */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Target Districts (Select one or more)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {TAMIL_NADU_DISTRICTS.map((d) => {
                    const isSelected = selectedDistricts.includes(d);
                    return (
                      <button
                        type="button"
                        key={d}
                        onClick={() => handleDistrictToggle(d)}
                        className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                          isSelected
                            ? 'bg-emerald-700 text-white shadow-2xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Budget Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Min Budget (₹ Lakhs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minPriceLakhs}
                    onChange={(e) => setMinPriceLakhs(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Max Budget (₹ Lakhs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={maxPriceLakhs}
                    onChange={(e) => setMaxPriceLakhs(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Area Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Min Area (Cents)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minAreaCents}
                    onChange={(e) => setMinAreaCents(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Max Area (Cents)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={maxAreaCents}
                    onChange={(e) => setMaxAreaCents(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Road & Utilities */}
              <div className="grid grid-cols-3 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Min Road Width (ft)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={preferredRoadWidth}
                    onChange={(e) => setPreferredRoadWidth(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-4">
                  <input
                    type="checkbox"
                    id="waterReq"
                    checked={waterRequired}
                    onChange={(e) => setWaterRequired(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                  />
                  <label htmlFor="waterReq" className="text-xs font-semibold text-slate-700">
                    Water Required
                  </label>
                </div>

                <div className="flex items-center space-x-2 pt-4">
                  <input
                    type="checkbox"
                    id="elecReq"
                    checked={electricityRequired}
                    onChange={(e) => setElectricityRequired(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                  />
                  <label htmlFor="elecReq" className="text-xs font-semibold text-slate-700">
                    EB Required
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                >
                  Save Acquisition Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
