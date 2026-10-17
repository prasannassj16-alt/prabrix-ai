import React from 'react';
import { ShieldCheck, UserCheck, Calculator, AlertCircle } from 'lucide-react';

export const PROVENANCE_TYPES = {
  VERIFIED: 'verified',
  SELLER_PROVIDED: 'seller_provided',
  CALCULATED: 'calculated',
  MISSING: 'missing',
};

export const FieldProvenanceBadge = ({ type = 'seller_provided', label = null, className = '' }) => {
  switch (type) {
    case 'verified':
      return (
        <span
          className={`inline-flex items-center space-x-1 px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-800 border border-emerald-200 tracking-wide ${className}`}
          title="Verified against government revenue records or site inspection"
        >
          <ShieldCheck className="w-3 h-3 text-emerald-600 flex-shrink-0" />
          <span>{label || 'Verified'}</span>
        </span>
      );

    case 'calculated':
      return (
        <span
          className={`inline-flex items-center space-x-1 px-1.5 py-0.5 text-[10px] font-bold rounded bg-purple-50 text-purple-800 border border-purple-200 tracking-wide ${className}`}
          title="System computed formula or unit conversion"
        >
          <Calculator className="w-3 h-3 text-purple-600 flex-shrink-0" />
          <span>{label || 'Calculated'}</span>
        </span>
      );

    case 'missing':
      return (
        <span
          className={`inline-flex items-center space-x-1 px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-500 border border-slate-200 tracking-wide ${className}`}
          title="Field not provided or unavailable in records"
        >
          <AlertCircle className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <span>{label || 'Missing'}</span>
        </span>
      );

    case 'seller_provided':
    default:
      return (
        <span
          className={`inline-flex items-center space-x-1 px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-800 border border-blue-200 tracking-wide ${className}`}
          title="Self-declared by property seller"
        >
          <UserCheck className="w-3 h-3 text-blue-600 flex-shrink-0" />
          <span>{label || 'Seller-Provided'}</span>
        </span>
      );
  }
};
