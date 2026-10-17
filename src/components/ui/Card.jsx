import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({
  children,
  variant = 'default',
  hoverLift = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-200';

  const variants = {
    default: 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/80 shadow-soft',
    glass: 'glass-panel',
    flat: 'bg-slate-50 dark:bg-navy-900/50 border border-slate-200 dark:border-navy-800',
    elevated: 'bg-white dark:bg-navy-900 shadow-card hover:shadow-card-hover border border-slate-200 dark:border-navy-700',
  };

  const Component = hoverLift ? motion.div : 'div';
  const motionProps = hoverLift
    ? {
        whileHover: { y: -3, transition: { duration: 0.2 } },
      }
    : {};

  return (
    <Component
      className={`${baseStyles} ${variants[variant] || variants.default} ${className}`}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
};
