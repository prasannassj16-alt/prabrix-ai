import React from 'react';
import { Building2, Trees, Home, Factory, Layers } from 'lucide-react';

export const StepBasicInfo = ({ formData, updateFormData, errors }) => {
  const propertyTypes = [
    { id: 'agricultural', label: 'Agricultural', icon: Trees, desc: 'Farmland, grove, plantation' },
    { id: 'residential', label: 'Residential', icon: Home, desc: 'Villa plot, layout, house site' },
    { id: 'commercial', label: 'Commercial', icon: Building2, desc: 'Showroom, office, highway land' },
    { id: 'industrial', label: 'Industrial', icon: Factory, desc: 'Factory, warehouse, logistics' },
    { id: 'mixed_use', label: 'Mixed Use', icon: Layers, desc: 'Multi-purpose land parcel' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Step 1: Basic Property Information</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Provide the headline title, land category, and detailed narrative for your parcel.
        </p>
      </div>

      {/* Property Title */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="listingTitle">
          Listing Title <span className="text-red-500">*</span>
        </label>
        <input
          id="listingTitle"
          type="text"
          value={formData.title}
          onChange={(e) => updateFormData({ title: e.target.value })}
          placeholder="e.g. Fertile Red Soil Farmland - 1 Acre with Borewell"
          className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
            errors.title
              ? 'border-red-400 focus:ring-red-100'
              : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-100'
          }`}
        />
        {errors.title ? (
          <p className="text-xs text-red-600 mt-1">{errors.title}</p>
        ) : (
          <p className="text-xs text-slate-400 mt-1">Between 5 and 200 characters.</p>
        )}
      </div>

      {/* Property Category Selection */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Land Classification / Property Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {propertyTypes.map((t) => {
            const Icon = t.icon;
            const isSelected = formData.property_type === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => updateFormData({ property_type: t.id })}
                className={`p-3 border rounded-xl flex flex-col items-center text-center transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`} />
                <span className="font-bold text-xs">{t.label}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">{t.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Description */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="listingDesc">
          Property Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="listingDesc"
          rows={4}
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Describe the land characteristics, soil fertility, road frontage, surrounding landmarks, water yield, and legal accessibility..."
          className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
            errors.description
              ? 'border-red-400 focus:ring-red-100'
              : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-100'
          }`}
        />
        <div className="flex justify-between items-center mt-1 text-xs">
          {errors.description ? (
            <span className="text-red-600">{errors.description}</span>
          ) : (
            <span className="text-slate-400">Minimum 20 characters.</span>
          )}
          <span className="text-slate-400 font-mono">{(formData.description || '').length} chars</span>
        </div>
      </div>
    </div>
  );
};
