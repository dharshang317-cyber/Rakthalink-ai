import React from 'react';

export default function Spinner({ size = 'md', color = 'primary', className = '' }) {
  const sizes = {
    xs: 'w-3.5 h-3.5 border-2',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2.5',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  };

  const colors = {
    primary: 'border-red-600 border-t-transparent',
    light: 'border-white border-t-transparent',
    dark: 'border-slate-700 border-t-transparent',
    emerald: 'border-emerald-600 border-t-transparent',
  };

  return (
    <div
      role="status"
      aria-label="loading"
      className={`inline-block rounded-full animate-spin ${sizes[size] || sizes.md} ${colors[color] || colors.primary} ${className}`}
    />
  );
}
