import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { compareService } from '../../services/compareService';
import {
  Scale,
  X,
  ArrowLeft,
  Search,
  ShieldCheck,
  Droplets,
  Zap,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const PropertyComparePage = () => {
  const [compareList, setCompareList] = useState(() => compareService.getCompareList());

  useEffect(() => {
    const unsubscribe = compareService.subscribe((list) => {
      setCompareList([...list]);
    });
    return () => unsubscribe();
  }, []);

  const handleRemove = (id) => {
    compareService.removeFromCompare(id);
  };

  const handleClearAll = () => {
    compareService.clearCompare();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Land Comparison Tool
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Comparing {compareList.length} of 4 Parcels
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Side-by-Side Property Comparison
          </h1>
          <p className="text-xs text-slate-500">
            Compare rates per square foot, road width, water availability, and government verification status.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {compareList.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-1.5 transition-colors"
            >
              Clear Comparison
            </button>
          )}

          <Link
            to="/buy"
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Add More Land</span>
          </Link>
        </div>
      </div>

      {compareList.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white p-6 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
            <Scale className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Properties to Compare</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Select the scale icon on any property card in the marketplace to add up to 4 parcels to this comparison table.
          </p>
          <Link
            to="/buy"
            className="mt-5 inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm transition-colors"
          >
            <span>Browse Properties</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-4 px-4 w-44 font-bold text-slate-700 uppercase tracking-wider text-[11px] bg-slate-50 sticky left-0 z-10">
                    Feature
                  </th>
                  {compareList.map((item) => (
                    <th key={item.id} className="py-4 px-4 min-w-[220px] max-w-[260px] align-top">
                      <div className="space-y-2">
                        <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                          <img
                            src={
                              item.photos?.find((p) => p.is_cover)?.url ||
                              item.photos?.[0]?.url ||
                              'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80'
                            }
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemove(item.id)}
                            className="absolute top-1.5 right-1.5 p-1 bg-slate-900/80 text-white rounded-full hover:bg-red-600 transition-colors shadow"
                            title="Remove from comparison"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                          {item.title}
                        </h4>
                        <Link
                          to={`/property/${item.id}`}
                          className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 hover:underline"
                        >
                          <span>View Listing</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Asking Price */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-800 bg-slate-50 sticky left-0">
                    Total Asking Price
                  </td>
                  {compareList.map((item) => (
                    <td key={item.id} className="py-3 px-4 font-extrabold text-sm text-emerald-700">
                      ₹{Number(item.price || 0).toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>

                {/* Rate per Sq.Ft. */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50 sticky left-0">
                    Rate / Sq.Ft.
                  </td>
                  {compareList.map((item) => (
                    <td key={item.id} className="py-3 px-4 font-mono font-bold text-slate-800">
                      ₹{item.price_per_sqft || (item.price / item.area_sqft).toFixed(2)}
                    </td>
                  ))}
                </tr>

                {/* Rate per Cent */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50 sticky left-0">
                    Rate / Cent
                  </td>
                  {compareList.map((item) => {
                    const cents = item.area_cents || (item.area_sqft / 435.6).toFixed(2);
                    const ratePerCent = cents > 0 ? (item.price / cents).toFixed(0) : 0;
                    return (
                      <td key={item.id} className="py-3 px-4 font-mono font-semibold text-slate-800">
                        ₹{Number(ratePerCent).toLocaleString('en-IN')}
                      </td>
                    );
                  })}
                </tr>

                {/* Total Area */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50 sticky left-0">
                    Area in Cents & Sq.Ft.
                  </td>
                  {compareList.map((item) => (
                    <td key={item.id} className="py-3 px-4 font-medium text-slate-800">
                      <span className="font-bold text-slate-900 block">
                        {item.area_cents || (item.area_sqft / 435.6).toFixed(2)} Cents
                      </span>
                      <span className="text-[10px] text-slate-500">
                        ({Number(item.area_sqft || 0).toLocaleString('en-IN')} sq.ft.)
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Property Type */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50 sticky left-0">
                    Classification
                  </td>
                  {compareList.map((item) => (
                    <td key={item.id} className="py-3 px-4 capitalize font-semibold text-slate-700">
                      {item.property_type || 'Land'}
                    </td>
                  ))}
                </tr>

                {/* Location */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50 sticky left-0">
                    District & Taluk
                  </td>
                  {compareList.map((item) => (
                    <td key={item.id} className="py-3 px-4 text-slate-800">
                      <div className="font-semibold">{item.district}</div>
                      <div className="text-[10px] text-slate-500">{item.taluk}</div>
                    </td>
                  ))}
                </tr>

                {/* Road Width & Surface */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50 sticky left-0">
                    Road Access
                  </td>
                  {compareList.map((item) => (
                    <td key={item.id} className="py-3 px-4 text-slate-700">
                      {item.road_width_ft ? `${item.road_width_ft} ft (${item.road_type || 'unpaved'})` : 'Not specified'}
                    </td>
                  ))}
                </tr>

                {/* Water Source */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50 sticky left-0">
                    Water Availability
                  </td>
                  {compareList.map((item) => (
                    <td key={item.id} className="py-3 px-4 capitalize text-slate-700">
                      {item.water_source || 'None'}
                    </td>
                  ))}
                </tr>

                {/* Electricity */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50 sticky left-0">
                    EB Electricity
                  </td>
                  {compareList.map((item) => (
                    <td key={item.id} className="py-3 px-4">
                      {item.electricity_connected ? (
                        <span className="text-emerald-700 font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Connected</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Not connected</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Soil Classification */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50 sticky left-0">
                    Soil Type
                  </td>
                  {compareList.map((item) => (
                    <td key={item.id} className="py-3 px-4 capitalize text-slate-700">
                      {item.soil_type || 'Unspecified'}
                    </td>
                  ))}
                </tr>

                {/* Boundary Demarcation */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50 sticky left-0">
                    Boundary Status
                  </td>
                  {compareList.map((item) => (
                    <td key={item.id} className="py-3 px-4 capitalize text-slate-700">
                      {item.boundary_wall ? item.boundary_wall.replace('_', ' ') : 'Unfenced'}
                    </td>
                  ))}
                </tr>

                {/* Revenue Survey Status */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50 sticky left-0">
                    Government Verification
                  </td>
                  {compareList.map((item) => (
                    <td key={item.id} className="py-3 px-4">
                      {item.is_verified ? (
                        <span className="px-2 py-0.5 rounded font-bold uppercase text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block">
                          Verified Records
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded font-medium text-[9px] bg-slate-100 text-slate-600 inline-block">
                          Self-Declared
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
