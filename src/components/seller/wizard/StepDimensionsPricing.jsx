import React, { useState } from 'react';
import {
  convertArea,
  getAllUnitConversions,
  UNIT_LABELS,
  UNIT_SHORT_LABELS,
} from '../../../services/areaConverter';
import { IndianRupee, Ruler, Droplets, Zap, Compass, Calculator } from 'lucide-react';

export const StepDimensionsPricing = ({ formData, updateFormData, errors }) => {
  const [selectedUnit, setSelectedUnit] = useState('cent'); // Tamil Nadu default
  const [rawAreaInput, setRawAreaInput] = useState(() => {
    // If area_sqft exists, compute initial representation in selected unit
    if (formData.area_sqft) {
      return String(convertArea(formData.area_sqft, 'sq_ft', 'cent', 2));
    }
    return '';
  });

  const handleAreaChange = (val, unit) => {
    setRawAreaInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      // Convert to square feet (base storage unit)
      const sqft = convertArea(num, unit, 'sq_ft', 2);
      updateFormData({ area_sqft: sqft });
    } else {
      updateFormData({ area_sqft: '' });
    }
  };

  const handleUnitSwitch = (newUnit) => {
    setSelectedUnit(newUnit);
    if (formData.area_sqft) {
      const converted = convertArea(formData.area_sqft, 'sq_ft', newUnit, 2);
      setRawAreaInput(String(converted));
    }
  };

  // Conversions summary if valid area entered
  const conversions = formData.area_sqft
    ? getAllUnitConversions(formData.area_sqft, 'sq_ft', 2)
    : null;

  // Real-time rates
  const price = Number(formData.price) || 0;
  const areaSqft = Number(formData.area_sqft) || 0;
  const ratePerSqft = areaSqft > 0 ? (price / areaSqft).toFixed(2) : 0;
  const areaCents = conversions ? conversions.cent : 0;
  const ratePerCent = areaCents > 0 ? (price / areaCents).toFixed(0) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Step 3: Dimensions, Pricing & Infrastructure</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Specify exact area with live multi-unit conversion, asking price, and site utility factors.
        </p>
      </div>

      {/* Land Area Input & Unit Selector */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <label className="block text-sm font-semibold text-slate-800">
          Land Extent / Total Area <span className="text-red-500">*</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Ruler className="w-4 h-4" />
            </div>
            <input
              type="number"
              step="any"
              min="0"
              value={rawAreaInput}
              onChange={(e) => handleAreaChange(e.target.value, selectedUnit)}
              placeholder="e.g. 100"
              className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white font-mono font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <select
              value={selectedUnit}
              onChange={(e) => handleUnitSwitch(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
            >
              {Object.keys(UNIT_LABELS).map((u) => (
                <option key={u} value={u}>
                  {UNIT_LABELS[u]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {errors.area_sqft && <p className="text-xs text-red-600">{errors.area_sqft}</p>}

        {/* Real-time Multi-Unit Conversion Ribbon */}
        {conversions && (
          <div className="pt-2 border-t border-slate-200">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              <span>Automatic Area Unit Equivalents:</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div className="bg-white p-2 rounded border border-slate-200 text-center">
                <span className="text-slate-400 block text-[10px]">Cents (TN)</span>
                <span className="font-bold text-emerald-700 font-mono">{conversions.cent}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200 text-center">
                <span className="text-slate-400 block text-[10px]">Acres</span>
                <span className="font-bold text-emerald-700 font-mono">{conversions.acre}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200 text-center">
                <span className="text-slate-400 block text-[10px]">Square Feet</span>
                <span className="font-bold text-slate-800 font-mono">{Number(conversions.sq_ft).toLocaleString()}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200 text-center">
                <span className="text-slate-400 block text-[10px]">Square Meters</span>
                <span className="font-bold text-slate-800 font-mono">{conversions.sq_m}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200 text-center">
                <span className="text-slate-400 block text-[10px]">Grounds</span>
                <span className="font-bold text-slate-800 font-mono">{conversions.ground}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pricing & Rate Auto-Calculation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="askingPrice">
            Total Asking Price (INR) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <IndianRupee className="w-4 h-4" />
            </div>
            <input
              id="askingPrice"
              type="number"
              min="0"
              step="1000"
              value={formData.price || ''}
              onChange={(e) => updateFormData({ price: e.target.value })}
              placeholder="e.g. 4500000"
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>
          {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price}</p>}
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center flex flex-col justify-center">
          <span className="text-[11px] text-slate-500">Rate per Sq.Ft.</span>
          <span className="text-sm font-bold font-mono text-slate-800">
            {ratePerSqft > 0 ? `₹${Number(ratePerSqft).toLocaleString('en-IN')}` : '—'}
          </span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center flex flex-col justify-center">
          <span className="text-[11px] text-slate-500">Rate per Cent</span>
          <span className="text-sm font-bold font-mono text-emerald-700">
            {ratePerCent > 0 ? `₹${Number(ratePerCent).toLocaleString('en-IN')}` : '—'}
          </span>
        </div>
      </div>

      {/* Access Road & Utilities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="roadWidth">
            Access Road Width (Feet)
          </label>
          <input
            id="roadWidth"
            type="number"
            min="0"
            value={formData.road_width_ft || ''}
            onChange={(e) => updateFormData({ road_width_ft: e.target.value })}
            placeholder="e.g. 30"
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="roadType">
            Road Surface Type
          </label>
          <select
            id="roadType"
            value={formData.road_type || 'tar'}
            onChange={(e) => updateFormData({ road_type: e.target.value })}
            className="w-full px-2.5 py-2 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:border-emerald-500"
          >
            <option value="tar">Tar / Bitumen Road</option>
            <option value="concrete">Cement Concrete Road</option>
            <option value="gravel">Gravel / WBM Road</option>
            <option value="mud">Mud / Cart Track</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="waterSource">
            Primary Water Source
          </label>
          <select
            id="waterSource"
            value={formData.water_source || 'borewell'}
            onChange={(e) => updateFormData({ water_source: e.target.value })}
            className="w-full px-2.5 py-2 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:border-emerald-500"
          >
            <option value="borewell">Operational Borewell</option>
            <option value="open_well">Open Well</option>
            <option value="river_canal">Canal / River Irrigation</option>
            <option value="pipeline">Piped Panchayat / Municipal</option>
            <option value="none">No Existing Water Source</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="soilType">
            Dominant Soil Type
          </label>
          <select
            id="soilType"
            value={formData.soil_type || 'red'}
            onChange={(e) => updateFormData({ soil_type: e.target.value })}
            className="w-full px-2.5 py-2 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:border-emerald-500"
          >
            <option value="red">Red Soil (Semman)</option>
            <option value="black">Black Cotton Soil (Karisal)</option>
            <option value="alluvial">Alluvial (Vandals)</option>
            <option value="clay">Clay Soil</option>
            <option value="sandy">Sandy Loam</option>
            <option value="laterite">Laterite</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
      </div>

      {/* Electricity Connection */}
      <div className="pt-2">
        <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(formData.electricity_connected)}
            onChange={(e) => updateFormData({ electricity_connected: e.target.checked })}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
          />
          <span>Electricity Service Connection Active (TNEB Free Agricultural or Commercial EB line)</span>
        </label>
      </div>
    </div>
  );
};
