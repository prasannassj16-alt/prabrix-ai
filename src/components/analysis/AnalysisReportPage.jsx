import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { listingService } from '../../services/listingService';
import {
  analyzeLandParcel,
  PILLAR_DEFINITIONS,
  STATUTORY_LEGAL_DISCLAIMER,
} from '../../services/landAnalysisEngine';
import { MapView } from '../map/MapView';
import { L, createCategoryIcon } from '../map/leafletConfig';
import { NearbyAmenitiesView } from '../geospatial/NearbyAmenitiesView';
import { ValuationBreakdown } from '../valuation/ValuationBreakdown';
import { DevelopmentSuggestionsPanel } from '../development/DevelopmentSuggestionsPanel';
import {
  ShieldCheck,
  MapPin,
  FileText,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Printer,
  Sparkles,
  Layers,
  Compass,
  Zap,
  Droplets,
  Ruler,
  TrendingUp,
  Landmark,
  Building2,
  Sprout,
  Truck,
  Factory,
  ChevronRight,
  Info,
} from 'lucide-react';

export const AnalysisReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [availableListings, setAvailableListings] = useState([]);
  const [selectedListingId, setSelectedListingId] = useState(id || '');
  const [listing, setListing] = useState(null);
  const [report, setReport] = useState(null);
  const [activePillarTab, setActivePillarTab] = useState('legal');

  // Load all available published listings for quick switching
  useEffect(() => {
    const all = listingService.getListings();
    setAvailableListings(all);

    // If no ID is specified in URL, pick the first published listing
    if (!id && all.length > 0) {
      setSelectedListingId(all[0].id);
    }
  }, [id]);

  // Load selected listing and run pure analysis engine
  useEffect(() => {
    const targetId = id || selectedListingId;
    if (!targetId) return;

    const data = listingService.getListingById(targetId);
    if (data) {
      setListing(data);
      // Run the pure mathematical scoring engine
      const analysisResult = analyzeLandParcel(data, data.documents || []);
      setReport(analysisResult);
    } else {
      setListing(null);
      // Check invalid input handling
      const analysisResult = analyzeLandParcel({ id: targetId });
      setReport(analysisResult);
    }
  }, [id, selectedListingId]);

  if (!listing || !report) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Land Dossier Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          The requested parcel could not be located or contains insufficient identifier data for analysis.
        </p>
        <div className="mt-6 flex items-center justify-center space-x-3">
          <Link
            to="/buy"
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Marketplace</span>
          </Link>
          {availableListings.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedListingId(availableListings[0].id)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Load Demo Parcel
            </button>
          )}
        </div>
      </div>
    );
  }

  const {
    status,
    isProvisional,
    isUnavailable,
    totalScore,
    riskLevel,
    confidence,
    summary,
    pillarScores,
    locationOverview,
    advantages,
    limitations,
    missingInformation,
    riskChecklist,
    useCases,
    nextSteps,
    sources,
    valuationContext,
    legalDisclaimer,
  } = report;

  // Grade color styling
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const getRiskBadge = (level) => {
    switch (level) {
      case 'low':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Low Risk</span>;
      case 'moderate':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">Moderate Risk</span>;
      case 'high':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-300">High Risk</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">Critical Diligence Required</span>;
    }
  };

  const getConfidenceBadge = (conf) => {
    switch (conf) {
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">Confidence: High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">Confidence: Moderate</span>;
      case 'provisional':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-300">Confidence: Provisional</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-300">Confidence: Low</span>;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 w-full min-w-0">
      {/* Top Navigation & Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2">
          <Link
            to={`/property/${listing.id}`}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Property Details</span>
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-mono text-slate-400">Ref: {listing.id.substring(0, 8)}</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Quick Parcel Switcher */}
          {availableListings.length > 1 && (
            <select
              aria-label="Switch Sample Land Parcel"
              value={listing.id}
              onChange={(e) => {
                setSelectedListingId(e.target.value);
                navigate(`/property/${e.target.value}/analysis`);
              }}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              {availableListings.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.district}: {l.title.substring(0, 32)}...
                </option>
              ))}
            </select>
          )}

          {/* Print / Export Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* Provisional Evaluation Warning Banner */}
      {isProvisional && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start space-x-3 text-xs text-amber-900 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm">Preliminary Provisional Assessment</div>
            <p className="leading-relaxed">
              This land intelligence dossier is marked as <strong>Provisional</strong> because several critical government records, physical access road measurements, or high-precision spatial boundary coordinates are pending verification. The score reflects available empirical inputs and will be revised upon document submission.
            </p>
          </div>
        </div>
      )}

      {/* Hero Dossier Header & Overall Score Metric */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Details */}
          <div className="md:col-span-8 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-full bg-slate-900 text-white tracking-wider">
                {listing.property_type || 'Land'} Intelligence Dossier
              </span>
              {getRiskBadge(riskLevel)}
              {getConfidenceBadge(confidence)}
              {isProvisional ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  Provisional Status
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Ready Assessment
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {listing.title}
            </h1>

            <div className="flex items-center text-xs text-slate-500 space-x-1.5">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                {locationOverview.address} &bull; {locationOverview.taluk} Taluk, {locationOverview.district} District, {locationOverview.state}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              {summary}
            </p>
          </div>

          {/* Right Composite Score Display (0 to 100) with Animated Ring */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-navy-850 dark:to-navy-900 rounded-2xl border border-slate-200 dark:border-navy-700 text-center">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Composite Feasibility Score
            </span>
            <div className="relative w-28 h-28 flex items-center justify-center my-1">
              {/* Animated SVG Progress Ring */}
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-200 dark:stroke-navy-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-teal-500 dark:stroke-teal-400"
                  strokeWidth="8"
                  strokeDasharray={263.89}
                  initial={{ strokeDashoffset: 263.89 }}
                  animate={{ strokeDashoffset: 263.89 - (263.89 * (totalScore || 0)) / 100 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {totalScore}
                </span>
                <span className="text-slate-400 text-[10px] font-bold">/ 100</span>
              </div>
            </div>

            {/* Sum equality verification indicator */}
            <div className="mt-2 text-[10px] font-mono text-emerald-700 dark:text-teal-300 bg-emerald-50 dark:bg-teal-950/60 border border-emerald-200 dark:border-teal-800 px-2 py-0.5 rounded-full">
              &Sigma; 4 Pillars = {pillarScores.legal.score} + {pillarScores.physical.score} + {pillarScores.location.score} + {pillarScores.viability.score} = {totalScore}
            </div>

            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Deterministic Retrospective Rating
            </span>
          </div>
        </div>
      </div>

      {/* 4 Pillars Summary Cards (0 to 25 points each) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(pillarScores).map(([key, pillar]) => {
          const isSelected = activePillarTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActivePillarTab(key)}
              className={`text-left p-4 rounded-2xl border transition-all shadow-sm ${
                isSelected
                  ? 'border-emerald-600 dark:border-teal-500 ring-2 ring-emerald-500/20 bg-emerald-50/40 dark:bg-teal-950/40'
                  : 'border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 hover:border-slate-300 dark:hover:border-navy-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight">
                  {pillar.label}
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {pillar.score} <span className="text-xs text-slate-400 font-normal">/ 25</span>
                </span>
              </div>

              {/* Progress bar with smooth motion fill */}
              <div className="w-full bg-slate-200 dark:bg-navy-800 h-2 rounded-full overflow-hidden mb-2">
                <motion.div
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${pillar.percentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Weight: 25 pts</span>
                <span className="font-semibold text-emerald-700 dark:text-teal-400">{pillar.percentage}%</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Pillar Detailed Breakdown with Granular Evidence */}
      {pillarScores[activePillarTab] && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {pillarScores[activePillarTab].label} Breakdown
                </h3>
                <p className="text-xs text-slate-500">
                  {PILLAR_DEFINITIONS[activePillarTab]?.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-emerald-700">
                {pillarScores[activePillarTab].score}
              </span>
              <span className="text-xs text-slate-400 font-normal"> / 25 pts</span>
            </div>
          </div>

          {/* Factor Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pillarScores[activePillarTab].factors.map((f, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-800">{f.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {f.note || f.value || 'Evaluated metric'}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <span className="font-mono font-bold text-slate-900">
                    +{f.score}
                  </span>
                  <span className="text-[10px] text-slate-400 block">max {f.max}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Verifiable Evidence Citations */}
          {pillarScores[activePillarTab].evidence.length > 0 && (
            <div className="pt-2 space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Evidence Citations</span>
              </div>
              <ul className="space-y-1.5 pl-5 list-disc text-xs text-slate-600">
                {pillarScores[activePillarTab].evidence.map((ev, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {ev}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Advantages vs Limitations Double Column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Advantages */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Key Advantages & Positive Indicators</span>
          </h3>

          {advantages.length > 0 ? (
            <ul className="space-y-2">
              {advantages.map((adv, idx) => (
                <li
                  key={idx}
                  className="p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs text-emerald-950 flex items-start space-x-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{adv}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400 italic">No standout positive advantages identified in preliminary data.</p>
          )}
        </div>

        {/* Technical Limitations & Constraints */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Site Limitations & Technical Constraints</span>
          </h3>

          {limitations.length > 0 ? (
            <ul className="space-y-2">
              {limitations.map((lim, idx) => (
                <li
                  key={idx}
                  className="p-2.5 bg-amber-50/50 border border-amber-100 rounded-xl text-xs text-amber-950 flex items-start space-x-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{lim}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400 italic">No critical technical bottlenecks noted for standard usage.</p>
          )}
        </div>
      </div>

      {/* Missing Information & Diligence Gap Checklist */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Missing Information & Diligence Gaps Checklist</span>
          </h3>
          <span className="text-[11px] font-semibold text-slate-500">
            {missingInformation.length} {missingInformation.length === 1 ? 'item' : 'items'} pending
          </span>
        </div>

        {missingInformation.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {missingInformation.map((info, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-2.5 text-xs text-slate-700"
              >
                <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold text-slate-500">
                  {idx + 1}
                </div>
                <div className="leading-relaxed">{info}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
            All core primary documentation, coordinates, and site infrastructure measurements are present.
          </div>
        )}
      </div>

      {/* Structured Risk Checklist (6 Standard Categories) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>Statutory & Physical Hazard Risk Audit</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {riskChecklist.map((r) => {
            const isPass = r.status === 'pass';
            const isWarning = r.status === 'warning';
            return (
              <div
                key={r.id}
                className={`p-3.5 rounded-xl border space-y-2 text-xs transition-colors ${
                  isPass
                    ? 'bg-slate-50 border-slate-200'
                    : isWarning
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-rose-50/50 border-rose-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {r.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      isPass
                        ? 'bg-emerald-100 text-emerald-800'
                        : isWarning
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                <div className="font-bold text-slate-900">{r.label}</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {r.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Viable Use Cases & Suitability Matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Viable Development Use Cases & Suitability Matrix</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {useCases.map((uc, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                      uc.suitability === 'High'
                        ? 'bg-emerald-100 text-emerald-800'
                        : uc.suitability === 'Moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {uc.suitability} Suitability
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-sm mb-1">{uc.name}</div>
                <p className="text-slate-600 leading-relaxed text-[11px]">{uc.rationale}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comprehensive Development Suggestions Panel (Section 14) */}
      <DevelopmentSuggestionsPanel listing={listing} />

      {/* Location Overview & Spatial Cartography */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Compass className="w-4 h-4 text-emerald-600" />
          <span>Location & Cadastral Geospatial Alignment</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Spatial Metadata */}
          <div className="lg:col-span-5 space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Revenue Taluk:</span>
                <span className="font-bold text-slate-800">{locationOverview.taluk}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Administrative District:</span>
                <span className="font-bold text-slate-800">{locationOverview.district}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Gram Panchayat:</span>
                <span className="font-bold text-slate-800">{locationOverview.villagePanchayat}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Survey Subdivision:</span>
                <span className="font-mono font-bold text-slate-800">{listing.survey_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Patta Number:</span>
                <span className="font-mono font-bold text-slate-800">{listing.patta_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">GPS Coordinates:</span>
                <span className="font-mono font-bold text-slate-800">
                  {locationOverview.coordinatesFormatted}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-800 block">Guideline Valuation Benchmark</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {valuationContext.comparisonText}
              </p>
              <div className="text-[10px] text-slate-400 pt-1">
                Indicative TN Guideline benchmark: ₹{valuationContext.guidelineRatePerSqft}/sq.ft. (Retrospective baseline only, not a guaranteed resale valuation).
              </div>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="lg:col-span-7 rounded-xl overflow-hidden border border-slate-200 h-64 shadow-inner">
            {locationOverview.coordinates ? (
              <MapView
                center={[locationOverview.coordinates.latitude, locationOverview.coordinates.longitude]}
                zoom={14}
                onMapReady={(map) => {
                  const icon = createCategoryIcon(listing.property_type || 'agricultural', true);
                  L.marker(
                    [locationOverview.coordinates.latitude, locationOverview.coordinates.longitude],
                    { icon }
                  )
                    .addTo(map)
                    .bindPopup(`<b>${listing.title}</b><br/>${locationOverview.taluk}`);
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-slate-100 text-xs text-slate-400">
                Coordinates awaiting on-site surveyor confirmation.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparative Valuation & 4-Metric Appraisal Breakdown */}
      <ValuationBreakdown listing={listing} />

      {/* Real-time OpenStreetMap Overpass Nearby Infrastructure & Roads Lookup */}
      <NearbyAmenitiesView
        latitude={listing.latitude}
        longitude={listing.longitude}
        propertyName={listing.title}
        district={listing.district}
      />

      {/* Recommended Diligence Next Steps */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Recommended Acquisition Diligence Next Steps</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {nextSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-3 text-xs text-slate-700"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <div className="leading-relaxed font-medium">{step}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Sources, Provenance & Confidence Level */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Landmark className="w-4 h-4 text-slate-700" />
            <span>Data Sources & Registry Provenance</span>
          </h3>
          {getConfidenceBadge(confidence)}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Information Source</th>
                <th className="py-2.5 px-3">Governing Authority</th>
                <th className="py-2.5 px-3">Data Class</th>
                <th className="py-2.5 px-3 text-right">Reliability Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sources.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{s.name}</td>
                  <td className="py-2.5 px-3 text-slate-600">{s.authority}</td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{s.type}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                      {s.reliability}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory Statutory Legal Disclaimer (Strict Rule & Spec Requirement) */}
      <div className="p-5 bg-slate-900 text-slate-200 rounded-2xl space-y-2 border border-slate-800 shadow-md">
        <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4" />
          <span>Statutory Disclaimer & Non-Warranty Statement</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-normal">
          {legalDisclaimer}
        </p>
        <div className="pt-1 text-[11px] text-slate-400 font-mono border-t border-slate-800 mt-2">
          &bull; STRICT PROHIBITION: NO GUARANTEED FUTURE VALUES OR SPECULATIVE RETURN PROMISES &bull;
        </div>
      </div>
    </div>
  );
};

export default AnalysisReportPage;
