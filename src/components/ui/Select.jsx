import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = React.forwardRef(
  (
    {
      label,
      error,
      helperText,
      required = false,
      id,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`w-full appearance-none pl-3.5 pr-9 py-2.5 rounded-xl text-sm transition-all duration-150 bg-white dark:bg-navy-900 border text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer ${
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-900/50'
                : 'border-slate-300 dark:border-navy-700 focus:border-teal-500 focus:ring-teal-100 dark:focus:ring-teal-950/60'
            } ${className}`}
            {...props}
          >
            {children}
          </select>

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
