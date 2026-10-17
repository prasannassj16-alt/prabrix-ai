import React from 'react';
import {
  computePropertyValuation,
  INSUFFICIENT_DATA_MESSAGE,
  STATUTORY_VALUATION_DISCLAIMER,
} from '../../services/valuationService';
import {
  Calculator,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Landmark,
  Scale,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const ValuationBreakdown = ({ listing, customComparables = null }) => {
  if (!listing) return null;

  const valuation = computePropertyValuation(listing, customComparables);
  if (valuation.status === 'unavailable') {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center space-y-2">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
        <h4 className="text-sm font-bold text-slate-800">Valuation Unavailable</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {valuation.message || 'Pricing and dimensional area in square feet are required to evaluate comparative valuations.'}
        </p>
      </div>
    );
  }

  const { metrics, hasAdequateEvidence, comparables, disclaimer } = valuation;
  const { askingPrice, guidelineValue, observedValue, aiIndicativeEstimate } = metrics;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-emerald-700" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Comparative Valuation & Pricing Intelligence
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Independent multi-source appraisal keeping asking, guideline, and observed values strictly separated
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {hasAdequateEvidence ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Adequate Evidence ({comparables.length} Comps)
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              Insufficient Comps ({comparables.length} Available)
            </span>
          )}
        </div>
      </div>

      {/* 4 STRICTLY SEPARATED VALUATION METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. ASKING PRICE */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                1. Asking Price
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                Seller Listed
              </span>
            </div>

            <div className="text-xl font-black text-slate-900">
              ₹{(askingPrice.amount / 100000).toFixed(2)} Lakhs
            </div>

            <div className="text-xs font-bold text-emerald-700">
              ₹{askingPrice.ratePerSqft} <span className="text-[11px] text-slate-400 font-normal">/ sq.ft.</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 leading-tight">
            Source: {askingPrice.source}
          </div>
        </div>

        {/* 2. GOVERNMENT GUIDELINE VALUE */}
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                2. Guideline Value
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                Govt Benchmark
              </span>
            </div>

            <div className="text-xl font-black text-blue-950">
              ₹{(guidelineValue.amount / 100000).toFixed(2)} Lakhs
            </div>

            <div className="text-xs font-bold text-blue-800">
              ₹{guidelineValue.ratePerSqft} <span className="text-[11px] text-slate-400 font-normal">/ sq.ft.</span>
            </div>
          </div>

          <div className="pt-2 border-t border-blue-100 text-[10px] text-blue-900 leading-tight space-y-1">
            <div className="font-semibold">{guidelineValue.comparisonText}</div>
            <div className="text-slate-400">Source: TNREGINET / Sub-Registrar Office</div>
          </div>
        </div>

        {/* 3. OBSERVED VALUE (COMPARABLE TRANSACTIONS) */}
        <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/30 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">
                3. Observed Value
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                Sales Records
              </span>
            </div>

            {observedValue.amount ? (
              <>
                <div className="text-xl font-black text-purple-950">
                  ₹{(observedValue.amount / 100000).toFixed(2)} Lakhs
                </div>

                <div className="text-xs font-bold text-purple-800">
                  ₹{observedValue.ratePerSqft} <span className="text-[11px] text-slate-400 font-normal">/ sq.ft.</span>
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-400 italic py-2">
                No local transaction deeds on file.
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-purple-100 text-[10px] text-purple-900 leading-tight space-y-1">
            <div className="font-semibold">{observedValue.compsSummary}</div>
            <div className="text-slate-400">Source: Sub-Registrar Office Registered Deeds</div>
          </div>
        </div>

        {/* 4. AI INDICATIVE VALUATION RANGE (ONLY WHEN ADEQUATE EVIDENCE EXISTS) */}
        <div
          className={`p-4 rounded-xl border space-y-2 flex flex-col justify-between ${
            hasAdequateEvidence
              ? 'border-emerald-300 bg-emerald-50/40 ring-1 ring-emerald-500/20'
              : 'border-amber-200 bg-amber-50/40'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                4. AI Indicative Range
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  hasAdequateEvidence
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {hasAdequateEvidence ? 'Empirical Range' : 'Unavailable'}
              </span>
            </div>

            {hasAdequateEvidence ? (
              <div className="space-y-1">
                <div className="text-lg font-black text-emerald-950 leading-tight">
                  ₹{(aiIndicativeEstimate.lowTotal / 100000).toFixed(1)}L - ₹{(aiIndicativeEstimate.highTotal / 100000).toFixed(1)}L
                </div>

                <div className="text-xs font-bold text-emerald-800">
                  ₹{aiIndicativeEstimate.lowRatePerSqft} - ₹{aiIndicativeEstimate.highRatePerSqft}{' '}
                  <span className="text-[11px] text-slate-400 font-normal">/ sq.ft.</span>
                </div>
              </div>
            ) : (
              /* STRICT REQUIREMENT: When adequate comps do not exist */
              <div className="py-1 space-y-1">
                <div className="text-xs font-bold text-amber-900 leading-snug">
                  {INSUFFICIENT_DATA_MESSAGE}
                </div>
                <p className="text-[10px] text-amber-800">
                  Requires at least 2 verified local deed records to compute an indicative valuation range.
                </p>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-emerald-200/50 text-[10px] text-slate-500 leading-tight">
            {hasAdequateEvidence ? (
              <span className="text-emerald-900 font-medium">
                Adjusted for road access, water & soil grade
              </span>
            ) : (
              <span className="text-amber-800 font-mono">
                [INSUFFICIENT_VERIFIED_DATA]
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Empirical Adjustment Chips (Only when range is calculated) */}
      {hasAdequateEvidence && aiIndicativeEstimate.adjustments?.length > 0 && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Empirical Model Adjustments Applied:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {aiIndicativeEstimate.adjustments.map((adj, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs"
              >
                {adj}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Inadequate Evidence Warning Box (When < 2 Comps) */}
      {!hasAdequateEvidence && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start space-x-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm">
              {INSUFFICIENT_DATA_MESSAGE}
            </div>
            <p className="leading-relaxed">
              PRABRIX AI adheres to zero-fabrication integrity standards. Because this micro-market contains fewer than 2 verified registered deed records of the same property classification, an algorithmic valuation range will NOT be fabricated. Prospective buyers should consult registered local Sub-Registrar records or order an independent physical appraisal.
            </p>
          </div>
        </div>
      )}

      {/* COMPARABLE SALES EVIDENCE TABLE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Recorded Micro-Market Comparable Sales Evidence</span>
          </h4>
          <span className="text-[11px] text-slate-500 font-mono">
            {comparables.length} verified records found
          </span>
        </div>

        {comparables.length > 0 ? (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Location / Village</th>
                  <th className="py-2.5 px-3">Distance (Straight-Line)</th>
                  <th className="py-2.5 px-3">Transaction Date</th>
                  <th className="py-2.5 px-3">Sale Price & Area</th>
                  <th className="py-2.5 px-3 text-right">Price / Sq.Ft.</th>
                  <th className="py-2.5 px-3 text-right">Evidence Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparables.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {comp.village}, {comp.taluk}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono">
                      {comp.distance_km != null ? `${comp.distance_km} km (aerial)` : 'Local taluk'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {comp.transaction_date}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800">
                      ₹{(comp.sale_price / 100000).toFixed(2)}L &bull; {comp.area_cents || (comp.area_sqft / 435.6).toFixed(1)} Cents
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{comp.price_per_sqft}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                        {comp.source.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 italic">
            Zero registered comparable deed records found in this immediate radius.
          </div>
        )}
      </div>

      {/* STATUTORY VALUATION DISCLAIMER */}
      <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-1 text-xs border border-slate-800">
        <div className="flex items-center space-x-1.5 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Statutory Valuation & Non-Speculation Notice</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
          {disclaimer}
        </p>
        <div className="text-[10px] text-slate-500 font-mono pt-1">
          &bull; NO GUARANTEED FUTURE VALUES &bull; NO SPECULATIVE ESCALATION PROMISES &bull;
        </div>
      </div>
    </div>
  );
};

export default ValuationBreakdown;
