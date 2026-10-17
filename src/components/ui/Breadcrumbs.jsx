import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs = ({ items = [], className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-full overflow-hidden ${className}`}>
      <ol className="flex items-center space-x-1.5 flex-wrap max-w-full">
        <li>
          <Link
            to="/"
            className="flex items-center hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center space-x-1.5 min-w-0">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              {isLast || !item.to ? (
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[130px] sm:max-w-xs">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors truncate max-w-[90px] sm:max-w-[150px]"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
