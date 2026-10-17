import React from 'react';

export const Skeleton = ({
  className = '',
  variant = 'rectangular', // 'text', 'circular', 'rectangular'
  width,
  height,
}) => {
  const baseStyles = 'animate-pulse bg-slate-200 dark:bg-navy-800';

  const variants = {
    text: 'rounded-md h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  const style = {
    width: width,
    height: height,
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant] || variants.rectangular} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};
