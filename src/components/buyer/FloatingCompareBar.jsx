import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { compareService } from '../../services/compareService';
import { Scale, X, ArrowRight } from 'lucide-react';

export const FloatingCompareBar = () => {
  const [compareList, setCompareList] = useState(() => compareService.getCompareList());

  useEffect(() => {
    const unsubscribe = compareService.subscribe((list) => {
      setCompareList([...list]);
    });
    return () => unsubscribe();
  }, []);

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-4 inset-x-0 z-40 max-w-2xl mx-auto px-4">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3.5 shadow-2xl border border-slate-700 flex items-center justify-between gap-3 animate-fade-in">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow">
            <Scale className="w-4 h-4" />
          </div>

          {/* Selected thumbnails */}
          <div className="flex items-center space-x-2 overflow-x-auto py-0.5">
            {compareList.map((item) => (
              <div
                key={item.id}
                className="relative group w-10 h-10 rounded-lg overflow-hidden border border-slate-600 flex-shrink-0"
              >
                <img
                  src={
                    item.photos?.find((p) => p.is_cover)?.url ||
                    item.photos?.[0]?.url ||
                    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=200&q=80'
                  }
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => compareService.removeFromCompare(item.id)}
                  className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  title="Remove from compare"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => compareService.clearCompare()}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 transition-colors"
          >
            Clear
          </button>

          <Link
            to="/compare"
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            <span>Compare ({compareList.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
