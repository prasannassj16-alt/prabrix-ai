import React from 'react';
import { Link } from 'react-router-dom';
import { analyzeLandParcel } from '../../services/landAnalysisEngine';
import {
  ShieldCheck,
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Layers,
  HelpCircle,
} from 'lucide-react';

export const AnalysisPreviewCard = ({ listing }) => {
  if (!listing) return null;

  const report = analyzeLandParcel(listing, listing.documents || []);
  if (report.isUnavailable) return null;

  const { totalScore, status, isProvisional, riskLevel, pillarScores, missingInformation } = report;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              PRABRIX Land Intelligence Score
            </h3>
            <span className="text-[11px] text-slate-500">
              4-Pillar Retrospective Diligence Engine
            </span>
          </div>
        </div>

        {isProvisional ? (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            Provisional
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Evaluated
          </span>
        )}
      </div>

      {/* Main Score & 4-Pillars Mini Meter */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-1">
        {/* Composite Score Circle */}
        <div className="sm:col-span-4 flex flex-col items-center justify-center p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Score</span>
          <div className="text-3xl font-black text-slate-900 my-0.5">
            {totalScore}
            <span className="text-xs text-slate-400 font-normal"> / 100</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-600 capitalize">
            {riskLevel} Risk Profile
          </span>
        </div>

        {/* 4 Pillars Mini Progress Grid */}
        <div className="sm:col-span-8 grid grid-cols-2 gap-2 text-xs">
          {/* Legal */}
          <div className="p-2.5 bg-white rounded-xl border border-slate-200">
            <div className="flex justify-between items-center text-[11px] mb-1">
              <span className="text-slate-500 font-medium">Legal Diligence</span>
              <span className="font-bold text-slate-800">{pillarScores.legal.score}/25</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full"
                style={{ width: `${pillarScores.legal.percentage}%` }}
              />
            </div>
          </div>

          {/* Physical */}
          <div className="p-2.5 bg-white rounded-xl border border-slate-200">
            <div className="flex justify-between items-center text-[11px] mb-1">
              <span className="text-slate-500 font-medium">Physical Site</span>
              <span className="font-bold text-slate-800">{pillarScores.physical.score}/25</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full"
                style={{ width: `${pillarScores.physical.percentage}%` }}
              />
            </div>
          </div>

          {/* Location */}
          <div className="p-2.5 bg-white rounded-xl border border-slate-200">
            <div className="flex justify-between items-center text-[11px] mb-1">
              <span className="text-slate-500 font-medium">Location Intel</span>
              <span className="font-bold text-slate-800">{pillarScores.location.score}/25</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full"
                style={{ width: `${pillarScores.location.percentage}%` }}
              />
            </div>
          </div>

          {/* Viability */}
          <div className="p-2.5 bg-white rounded-xl border border-slate-200">
            <div className="flex justify-between items-center text-[11px] mb-1">
              <span className="text-slate-500 font-medium">Agronomic Viability</span>
              <span className="font-bold text-slate-800">{pillarScores.viability.score}/25</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full"
                style={{ width: `${pillarScores.viability.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Provisional Warning Notice if applicable */}
      {isProvisional && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            {missingInformation.length} technical parameter{missingInformation.length === 1 ? '' : 's'} pending verification.
          </span>
        </div>
      )}

      {/* Action CTA Link */}
      <Link
        to={`/property/${listing.id}/analysis`}
        className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors shadow-sm"
      >
        <span>View Full Land Intelligence & Risk Dossier</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};

export default AnalysisPreviewCard;
