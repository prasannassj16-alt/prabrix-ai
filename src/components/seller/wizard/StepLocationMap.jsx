import React from 'react';
import { LocationPicker } from '../../map/LocationPicker';
import {
  getDistrictNames,
  getTaluksByDistrict,
  getDistrictDefaultCoords,
} from '../../../data/tnLocations';
import { MapPin, Info } from 'lucide-react';

export const StepLocationMap = ({ formData, updateFormData, errors }) => {
  const districts = getDistrictNames();
  const taluks = getTaluksByDistrict(formData.district);

  const handleDistrictChange = (e) => {
    const selectedDist = e.target.value;
    const availableTaluks = getTaluksByDistrict(selectedDist);
    const defaultCoords = getDistrictDefaultCoords(selectedDist);

    updateFormData({
      district: selectedDist,
      taluk: availableTaluks[0] || '',
      latitude: defaultCoords[0],
      longitude: defaultCoords[1],
    });
  };

  const handleCoordsChange = (coords) => {
    if (coords) {
      updateFormData({
        latitude: coords.lat,
        longitude: coords.lng,
      });
    } else {
      updateFormData({
        latitude: null,
        longitude: null,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Step 2: Location Details & Map Pin</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Select administrative jurisdiction in Tamil Nadu and drop an exact GPS point on the map.
        </p>
      </div>

      {/* District & Taluk Cascade Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="selDistrict">
            Tamil Nadu District <span className="text-red-500">*</span>
          </label>
          <select
            id="selDistrict"
            value={formData.district}
            onChange={handleDistrictChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">Select District</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {errors.district && <p className="text-xs text-red-600 mt-1">{errors.district}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="selTaluk">
            Revenue Taluk <span className="text-red-500">*</span>
          </label>
          <select
            id="selTaluk"
            value={formData.taluk}
            onChange={(e) => updateFormData({ taluk: e.target.value })}
            disabled={!formData.district}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="">Select Taluk</option>
            {taluks.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.taluk && <p className="text-xs text-red-600 mt-1">{errors.taluk}</p>}
        </div>
      </div>

      {/* Village, Survey No, Patta No, PIN Code */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="villagePanchayat">
            Village / Gram Panchayat
          </label>
          <input
            id="villagePanchayat"
            type="text"
            value={formData.village_panchayat || ''}
            onChange={(e) => updateFormData({ village_panchayat: e.target.value })}
            placeholder="e.g. Kannampalayam"
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="surveyNo">
            Survey / Sub-Division No.
          </label>
          <input
            id="surveyNo"
            type="text"
            value={formData.survey_number || ''}
            onChange={(e) => updateFormData({ survey_number: e.target.value })}
            placeholder="e.g. 204/1B"
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="pattaNo">
            Patta Number
          </label>
          <input
            id="pattaNo"
            type="text"
            value={formData.patta_number || ''}
            onChange={(e) => updateFormData({ patta_number: e.target.value })}
            placeholder="e.g. PT-8942"
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="pinCode">
            PIN Code (6 Digits) <span className="text-red-500">*</span>
          </label>
          <input
            id="pinCode"
            type="text"
            maxLength={6}
            value={formData.pincode || ''}
            onChange={(e) => updateFormData({ pincode: e.target.value.replace(/[^0-9]/g, '').slice(0, 6) })}
            placeholder="641402"
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono focus:outline-none focus:border-emerald-500"
          />
          {errors.pincode && <p className="text-[11px] text-red-600 mt-0.5">{errors.pincode}</p>}
        </div>
      </div>

      {/* Street Address / Landmark */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="streetAddress">
          Street Address / Landmark <span className="text-red-500">*</span>
        </label>
        <input
          id="streetAddress"
          type="text"
          value={formData.address}
          onChange={(e) => updateFormData({ address: e.target.value })}
          placeholder="e.g. SF 204/1B, Kannampalayam Village, Sulur Main Road"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
        />
        {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
      </div>

      {/* Reusable Leaflet Location Picker */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-slate-800">
            Pinpoint Location on Map <span className="text-red-500">*</span>
          </label>
          <span className="text-xs text-slate-500">Click or drag pin to position</span>
        </div>

        <LocationPicker
          initialLat={formData.latitude}
          initialLng={formData.longitude}
          onChange={handleCoordsChange}
          height="380px"
          allowSearch={true}
          allowManualEntry={true}
        />
        {errors.coordinates && (
          <p className="text-xs text-red-600 mt-1.5 font-medium">{errors.coordinates}</p>
        )}
      </div>
    </div>
  );
};
