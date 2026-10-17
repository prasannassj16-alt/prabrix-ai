import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '../ui';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 bg-slate-50 dark:bg-navy-950 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full text-center p-8 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl shadow-soft"
      >
        <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 flex items-center justify-center mx-auto mb-4">
          <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '20s' }} />
        </div>

        <span className="font-mono text-3xl sm:text-4xl font-extrabold text-teal-600 dark:text-teal-400">
          404
        </span>

        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1 mb-2">
          Coordinates Not Found
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          The property, survey reference, or page you are navigating to does not exist in our cadastral registry or may have been delisted.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link to="/buy" className="w-full sm:w-auto">
            <Button variant="primary" size="sm" icon={Search} className="w-full">
              Explore Marketplace
            </Button>
          </Link>
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" icon={Home} className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
