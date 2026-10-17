import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-navy-950 border-t border-slate-200 dark:border-navy-800 transition-colors mt-auto py-10 pb-20 lg:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-sm">
                P
              </div>
              <span className="font-heading font-extrabold text-slate-900 dark:text-white text-base tracking-tight">
                PRABRIX <span className="text-teal-600 dark:text-teal-400">AI</span>
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Tamil Nadu Land Intelligence & Geospatial Marketplace. Eliminating information asymmetry through deterministic 4-pillar suitability scoring and strictly separated 4-metric valuation boundaries.
            </p>
            <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
              <span>Headquartered in Coimbatore &bull; Tamil Nadu Cadastral Coverage</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
              Marketplace
            </h4>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/buy" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Explore Verified Land
                </Link>
              </li>
              <li>
                <Link to="/sell" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  List Your Property (Wizard)
                </Link>
              </li>
              <li>
                <Link to="/analysis" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  4-Pillar AI Intelligence
                </Link>
              </li>
              <li>
                <Link to="/map-demo" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Leaflet Map Showcase
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Compliance */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
              Trust & Legal
            </h4>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400">
              <li className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                <span>Zero Fake Data Policy</span>
              </li>
              <li>
                <span className="text-slate-400">PostgreSQL RLS Protected</span>
              </li>
              <li>
                <span className="text-slate-400">WGS84 GPS Coordinate Verified</span>
              </li>
              <li>
                <span className="text-slate-400">DTCP / CMDA Reference Checks</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-100 dark:border-navy-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
          <div>
            &copy; 2026 <strong className="text-slate-700 dark:text-slate-300">PRABRIX AI</strong> &bull; Understand the Land. Decide with Confidence.
          </div>
          <div className="flex items-center space-x-1">
            <span>Built by Team CYBER X</span>
            <span>&bull;</span>
            <span>Lead: PRASANNA S</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
