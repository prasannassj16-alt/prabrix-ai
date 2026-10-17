import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon: Icon,
      iconPosition = 'left',
      className = '',
      type = 'button',
      onClick,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
      primary:
        'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-sm hover:shadow focus:ring-teal-500/30 dark:bg-teal-600 dark:hover:bg-teal-500',
      secondary:
        'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-navy-800 dark:hover:bg-navy-700 dark:text-slate-100 focus:ring-slate-400',
      outline:
        'bg-transparent border border-slate-300 dark:border-navy-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-800 focus:ring-teal-500/20',
      ghost:
        'bg-transparent hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300 focus:ring-slate-400',
      danger:
        'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm focus:ring-rose-500/30',
      cyan:
        'bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white shadow-sm hover:shadow-glow-cyan focus:ring-cyan-500/30',
      navy:
        'bg-navy-900 hover:bg-navy-850 text-white shadow-sm focus:ring-navy-700 dark:bg-navy-800 dark:hover:bg-navy-700',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-xs sm:text-sm px-4 py-2 gap-2',
      lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5',
    };

    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={onClick}
        whileTap={isDisabled ? undefined : { scale: 0.98 }}
        className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />}
        {!loading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4 flex-shrink-0" />}
        <span>{children}</span>
        {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 flex-shrink-0" />}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
