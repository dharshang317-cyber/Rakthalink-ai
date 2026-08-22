import React from 'react';

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon: Icon,
  className = '',
}) {
  const variants = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const dots = {
    neutral: 'bg-slate-500',
    red: 'bg-red-600',
    emerald: 'bg-emerald-500 animate-pulse',
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dots[variant] || dots.neutral}`} />}
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  );
}
