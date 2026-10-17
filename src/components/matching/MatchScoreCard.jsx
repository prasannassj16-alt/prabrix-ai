import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sliders,
  ShieldCheck,
  Info,
} from 'lucide-react';

/**
 * MatchScoreCard Component
 * Displays deterministic match score with "Why it matches" and "What it doesn't satisfy".
 *
 * SPECIFICATION COMPLIANCE:
 * - Deterministic Compatibility Score out of 100.
 * - NEVER calls the score a probability.
 * - Explicit explainability with positive and negative criterion lists.
 */
export const MatchScoreCard = ({ matchResult, requirementTitle, compact = false }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (!matchResult) return null;

  const { score, tier, label, whyItMatches = [], whatItDoesntSatisfy = [], breakdown = {} } = matchResult;

  const getTierColor = (s) => {
    if (s >= 85) return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', badge: 'bg-emerald-600 text-white', ring: 'ring-emerald-500' };
    if (s >= 70) return { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-800', badge: 'bg-teal-600 text-white', ring: 'ring-teal-500' };
    if (s >= 50) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', badge: 'bg-amber-600 text-white', ring: 'ring-amber-500' };
    return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800', badge: 'bg-slate-600 text-white', ring: 'ring-slate-400' };
  };

  const style = getTierColor(score);

  if (compact) {
    return (
      <div className={`p-2.5 rounded-lg border ${style.bg} ${style.border} flex items-center justify-between`}>
        <div className="flex items-center space-x-2">
          <div className="flex items-baseline space-x-1">
            <span className="text-base font-black text-slate-900">{score}</span>
            <span className="text-xs text-slate-500 font-semibold">/100</span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
            {label}
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">Deterministic Match</span>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} p-4 sm:p-5 shadow-sm space-y-4`}>
      {/* Header with Deterministic Score Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-emerald-700" />
            <h4 className="text-sm font-bold text-slate-900">
              Deterministic Compatibility Evaluation
            </h4>
          </div>
          {requirementTitle && (
            <p className="text-xs text-slate-600 mt-0.5">
              Evaluated against: <span className="font-semibold text-slate-800">"{requirementTitle}"</span>
            </p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {score}
            </span>
            <span className="text-xs text-slate-500 font-bold">/100</span>
          </div>
          <div className="flex flex-col">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${style.badge} text-center`}>
              {label}
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5 text-right">
              Match Index
            </span>
          </div>
        </div>
      </div>

      {/* Probability Prohibition Notice */}
      <div className="bg-white/80 rounded-lg p-2.5 border border-slate-200 flex items-start space-x-2 text-[11px] text-slate-600 leading-relaxed">
        <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
        <div>
          <strong className="text-slate-800">Deterministic Score:</strong> This index measures factual criteria alignment (location, price, area, road, utilities). It is calculated deterministically and is <em>not a probability</em> or guarantee of transaction completion.
        </div>
      </div>

      {/* Two Column Explainability Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Why it Matches */}
        <div className="bg-white rounded-lg p-3.5 border border-emerald-100 shadow-2xs space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Why it matches ({whyItMatches.length})</span>
          </div>
          {whyItMatches.length > 0 ? (
            <ul className="space-y-1.5 text-xs text-slate-700">
              {whyItMatches.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-1.5 leading-snug">
                  <span className="text-emerald-600 font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400 italic">No strong matching points found.</p>
          )}
        </div>

        {/* What it Doesn't Satisfy */}
        <div className="bg-white rounded-lg p-3.5 border border-amber-200/70 shadow-2xs space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>What it doesn't satisfy ({whatItDoesntSatisfy.length})</span>
          </div>
          {whatItDoesntSatisfy.length > 0 ? (
            <ul className="space-y-1.5 text-xs text-slate-700">
              {whatItDoesntSatisfy.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-1.5 leading-snug">
                  <span className="text-amber-600 font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-medium py-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>All requested criteria fully satisfied!</span>
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Criteria Points Breakdown */}
      {breakdown && Object.keys(breakdown).length > 0 && (
        <div className="pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors py-1"
          >
            <span>View 5-Point Factor Breakdown</span>
            {showBreakdown ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {showBreakdown && (
            <div className="mt-2.5 space-y-2 bg-white rounded-lg p-3 border border-slate-200">
              {Object.entries(breakdown).map(([key, item]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">{item.label}</span>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-1.5 py-0.2 text-[10px] font-bold rounded ${
                        item.status === 'pass'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'partial'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                    <span className="font-bold text-slate-800 w-12 text-right">
                      {item.score} / {item.maxScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
