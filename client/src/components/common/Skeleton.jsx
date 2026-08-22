import React from 'react';

export default function Skeleton({ className = '', variant = 'rect' }) {
  const variants = {
    circle: 'rounded-full',
    rect: 'rounded-xl',
    text: 'rounded-md h-4',
  };

  return <div className={`animate-pulse bg-slate-200/80 ${variants[variant] || variants.rect} ${className}`} />;
}
