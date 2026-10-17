import React, { useState, useMemo } from 'react';
import {
  evaluateDevelopmentSuggestions,
  STATUTORY_PLANNING_DISCLAIMER,
} from '../../services/developmentSuggestionService';
import {
  Compass,
  Sprout,
  Building2,
  Truck,
  Sun,
  Home,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
} from 'lucide-react';

export const DevelopmentSuggestionsPanel = ({ listing }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const evaluation = useMemo(() => {
    return evaluateDevelopmentSuggestions(listing);
  }, [listing]);

  if (!evaluation || evaluation.status !== 'evaluated') {
    return null;
  }

  const { suggestions, totalCount } = evaluation;

  const categories = [
    { id: 'all', label: `All Viable Uses (${totalCount})` },
    { id: 'agriculture', label: 'Agriculture & Horticulture' },
    { id: 'hospitality', label: 'Eco-Tourism & Farmstay' },
    { id: 'industrial', label: 'Logistics & Warehousing' },
    { id: 'residential', label: 'Plotted Residential' },
    { id: 'energy', label: 'Renewable Solar' },
  ];

  const filteredSuggestions = suggestions.filter((s) => {
    if (selectedCategory === 'all') return true;
    return s.category === selectedCategory;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'agriculture':
        return <Sprout className="w-4 h-4 text-emerald-600" />;
      case 'hospitality':
        return <Compass className="w-4 h-4 text-purple-600" />;
      case 'industrial':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'residential':
        return <Home className="w-4 h-4 text-amber-600" />;
      case 'energy':
        return <Sun className="w-4 h-4 text-orange-600" />;
      default:
        return <Building2 className="w-4 h-4 text-slate-600" />;
    }
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-emerald-700" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Future-Use & Development Potential Analysis
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated spatial, physical, and regulatory screening based on reported parcel geometry and road frontage
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            {totalCount} Screened Use Cases
          </span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === c.id
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {filteredSuggestions.map((sug) => {
          const isExpanded = expandedId === sug.id || expandedId === null; // Default expanded for transparency

          return (
            <div
              key={sug.id}
              className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/40 hover:border-slate-300 transition-all space-y-4 p-4 sm:p-5"
            >
              {/* Card Top Row: Title, Category, Feasibility Pill */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs flex-shrink-0 mt-0.5">
                    {getCategoryIcon(sug.category)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {sug.categoryLabel}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {sug.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-center">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      sug.feasibility === 'high'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {sug.feasibilityLabel}
                  </span>
                </div>
              </div>

              {/* Summary */}
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {sug.summary}
              </p>

              {/* Three-Column Breakdown: Evidence, Unknowns, Permissions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
                {/* 1. Supporting Physical & Cadastral Evidence */}
                <div className="p-3.5 bg-white border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Supporting Evidence</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {sug.supportingEvidence.map((ev, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5 text-[11px] leading-relaxed">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Critical Unknowns & Missing Data */}
                <div className="p-3.5 bg-white border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Key Unknowns & Diligence</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {sug.unknowns.map((un, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5 text-[11px] leading-relaxed">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{un}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Required Statutory Permissions & Zoning Checks */}
                <div className="p-3.5 bg-white border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider">
                    <FileCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>Required TN Permissions</span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    {sug.requiredPermissions.map((perm, idx) => (
                      <div key={idx} className="p-2 bg-blue-50/50 rounded border border-blue-100">
                        <span className="font-bold text-blue-950 block text-[10px]">
                          {perm.authority}
                        </span>
                        <span className="text-slate-600 leading-tight block mt-0.5">
                          {perm.requirement}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Statutory Planning Non-Warranty Disclaimer (Rule 3 Compliance) */}
      <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-2 border border-slate-800">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold tracking-wide">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>STATUTORY PLANNING & DEVELOPMENT DISCLAIMER</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
          {evaluation.disclaimer}
        </p>
      </div>
    </div>
  );
};
