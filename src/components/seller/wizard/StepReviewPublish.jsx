import React, { useState } from 'react';
import {
  Building2,
  Trees,
  Home,
  Factory,
  Layers,
  MapPin,
  IndianRupee,
  Ruler,
  Image,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { convertArea, formatAreaWithUnit } from '../../../services/areaConverter';

export const StepReviewPublish = ({
  formData,
  onSaveDraft,
  onSubmitListing,
  isSubmitting,
  errors,
}) => {
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [publishDirectly, setPublishDirectly] = useState(false);
  const [localError, setLocalError] = useState('');

  const areaSqft = Number(formData.area_sqft) || 0;
  const areaCents = areaSqft > 0 ? (areaSqft / 435.6).toFixed(2) : 0;
  const areaAcres = areaSqft > 0 ? (areaSqft / 43560).toFixed(3) : 0;
  const price = Number(formData.price) || 0;
  const pricePerSqft = areaSqft > 0 ? (price / areaSqft).toFixed(2) : 0;
  const pricePerCent = areaCents > 0 ? (price / areaCents).toFixed(0) : 0;

  const propertyTypeLabels = {
    agricultural: 'Agricultural Farmland',
    residential: 'Residential Plot / Layout',
    commercial: 'Commercial Land',
    industrial: 'Industrial Parcel',
    mixed_use: 'Mixed Use Land',
  };

  const handleFinalSubmit = (asDraft = false) => {
    setLocalError('');
    if (asDraft) {
      onSaveDraft();
      return;
    }

    if (!declarationChecked) {
      setLocalError('Please confirm the legal ownership declaration before publishing.');
      return;
    }

    onSubmitListing(publishDirectly ? 'published' : 'pending_review');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Step 6: Review & Finalize Listing</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Carefully verify all property parameters before submitting or saving as a draft.
        </p>
      </div>

      {localError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{localError}</span>
        </div>
      )}

      {/* 1. Basic Info Section */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>1. Basic Property Details</span>
          </h3>
          <span className="text-xs px-2.5 py-0.5 font-semibold bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
            {propertyTypeLabels[formData.property_type] || formData.property_type}
          </span>
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-900">{formData.title || 'Untitled Listing'}</h4>
          <p className="text-xs text-slate-600 mt-1 whitespace-pre-line">
            {formData.description || 'No description provided.'}
          </p>
        </div>
      </div>

      {/* 2. Location & Coordinate Section */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>2. Location & Geospatial Coordinates</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {formData.latitude?.toFixed(4)}, {formData.longitude?.toFixed(4)}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">District & Taluk</span>
            <span className="font-semibold text-slate-800">
              {formData.district}, {formData.taluk}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Village / Panchayat</span>
            <span className="font-semibold text-slate-800">
              {formData.village_panchayat || 'Not specified'}
            </span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-slate-400 block font-medium">Street Address / Landmark</span>
            <span className="font-semibold text-slate-800">{formData.address || 'Not specified'}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Survey Number</span>
            <span className="font-mono font-semibold text-slate-800">
              {formData.survey_number || 'Pending'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Patta Number</span>
            <span className="font-mono font-semibold text-slate-800">
              {formData.patta_number || 'Pending'}
            </span>
          </div>
        </div>

        {/* Cartographic Boundary Disclaimer */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Geospatial Disclaimer:</span> The map marker coordinates represent an approximate reference point for discovery only. Markers do not constitute a legal parcel boundary or government survey delineation.
          </div>
        </div>
      </div>

      {/* 3. Dimensions, Price & Infrastructure */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
            <span>3. Dimensions, Pricing & Infrastructure</span>
          </h3>
          <span className="text-sm font-extrabold text-emerald-700">
            ₹{price.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-50 rounded-lg text-center">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Area</span>
            <span className="text-sm font-bold text-slate-800">{areaCents} Cents</span>
            <span className="text-[10px] text-slate-500 block">({areaSqft.toLocaleString()} sq.ft.)</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Rate / Sq.Ft.</span>
            <span className="text-sm font-bold text-slate-800">₹{pricePerSqft}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Rate / Cent</span>
            <span className="text-sm font-bold text-slate-800">₹{Number(pricePerCent).toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">In Acres</span>
            <span className="text-sm font-bold text-slate-800">{areaAcres} Acres</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
          <div>
            <span className="text-slate-400">Road Width & Type:</span>{' '}
            <span className="font-semibold text-slate-700">
              {formData.road_width_ft || 0} ft ({formData.road_type || 'unpaved'})
            </span>
          </div>
          <div>
            <span className="text-slate-400">Water Source:</span>{' '}
            <span className="font-semibold text-slate-700 capitalize">
              {formData.water_source || 'none'}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Electricity:</span>{' '}
            <span className="font-semibold text-slate-700">
              {formData.electricity_connected ? 'Connected' : 'Not Connected'}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Soil Type:</span>{' '}
            <span className="font-semibold text-slate-700 capitalize">
              {formData.soil_type || 'unclassified'}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Boundary:</span>{' '}
            <span className="font-semibold text-slate-700 capitalize">
              {formData.boundary_wall ? formData.boundary_wall.replace('_', ' ') : 'unfenced'}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Direction Facing:</span>{' '}
            <span className="font-semibold text-slate-700 capitalize">
              {formData.facing_direction || 'unspecified'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Photos Summary */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>4. Photos ({formData.photos?.length || 0})</span>
          </h3>
          <span className="text-xs text-slate-500">Max 10 images</span>
        </div>
        {formData.photos && formData.photos.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {formData.photos.map((p, idx) => (
              <div
                key={p.id || idx}
                className="relative w-20 h-16 rounded-lg overflow-hidden border border-slate-200"
              >
                <img
                  src={p.url}
                  alt={p.caption || `Photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {p.is_cover && (
                  <span className="absolute bottom-0 inset-x-0 bg-emerald-700 text-white text-[8px] font-bold py-0.5 text-center">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No photos uploaded yet.</p>
        )}
      </div>

      {/* 5. Documents Summary */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-teal-600"></span>
            <span>5. Confidential Documents ({formData.documents?.length || 0})</span>
          </h3>
          <span className="text-xs text-emerald-700 flex items-center space-x-1">
            <Lock className="w-3 h-3" />
            <span>Encrypted Vault</span>
          </span>
        </div>
        {formData.documents && formData.documents.length > 0 ? (
          <div className="space-y-1.5">
            {formData.documents.map((d, idx) => (
              <div
                key={d.id || idx}
                className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs"
              >
                <div className="flex items-center space-x-2 truncate">
                  <FileText className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span className="font-semibold text-slate-800 truncate">{d.title}</span>
                  <span className="text-slate-400 text-[10px]">({d.fileName})</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-medium flex-shrink-0">
                  Private RLS Protected
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No legal documents attached yet.</p>
        )}
      </div>

      {/* Legal Declaration Checkbox */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={declarationChecked}
            onChange={(e) => setDeclarationChecked(e.target.checked)}
            className="mt-1 h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
          />
          <span className="text-xs text-slate-700 leading-relaxed">
            <strong className="text-slate-900">Legal Declaration & Warranty:</strong> I hereby declare that I am the legal owner or duly authorized power-of-attorney holder for this land parcel. The information provided is accurate to the best of my knowledge, and all private documents uploaded are genuine government records.
          </span>
        </label>

        {/* Direct Publish or Submit for Verification Choice */}
        <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={publishDirectly}
              onChange={(e) => setPublishDirectly(e.target.checked)}
              className="h-3.5 w-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <span className="text-slate-700">
              Publish directly to marketplace (bypasses pending review)
            </span>
          </label>
          <span className="text-[11px] text-slate-500">
            {publishDirectly
              ? 'Status will be "Published" immediately.'
              : 'Status will be "Pending Review" until approved.'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => handleFinalSubmit(true)}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          Save as Draft
        </button>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleFinalSubmit(false)}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isSubmitting
                ? 'Processing...'
                : publishDirectly
                ? 'Publish Listing Live'
                : 'Submit for Review'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
