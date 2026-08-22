import React from 'react';
import Spinner from './Spinner';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  className = '',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] select-none';

  const variants = {
    primary: 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow focus:ring-red-500',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow focus:ring-slate-700',
    outline: 'border border-slate-300 hover:border-slate-400 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-400 shadow-xs',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-sm',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-sm',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-300',
    glass: 'bg-white/80 hover:bg-white text-slate-800 border border-slate-200/80 backdrop-blur shadow-xs focus:ring-slate-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="sm" color={variant === 'outline' || variant === 'ghost' || variant === 'glass' ? 'dark' : 'light'} />
          <span>Please wait...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />}
          {children}
        </>
      )}
    </button>
  );
}
