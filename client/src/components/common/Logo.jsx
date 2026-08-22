import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ size = 'default', showTagline = false, className = '' }) {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Brand Icon: Blood Drop with Connection Link Knot */}
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-md transition-transform duration-200 group-hover:scale-105 ${
          isSmall ? 'w-8 h-8 rounded-lg' : isLarge ? 'w-12 h-12 rounded-2xl' : 'w-10 h-10'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isSmall ? 'w-5 h-5' : isLarge ? 'w-7 h-7' : 'w-6 h-6'}
        >
          {/* Stylized Blood Drop */}
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" />
          {/* Link Connection Crossbar */}
          <path d="M10 13a2 2 0 1 0 4 0" stroke="white" strokeWidth="2.5" />
          <path d="M12 10v6" stroke="white" strokeWidth="2.5" />
        </svg>
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span
            className={`font-bold tracking-tight text-slate-900 font-['Outfit'] ${
              isSmall ? 'text-lg' : isLarge ? 'text-2xl' : 'text-xl'
            }`}
          >
            Raktha<span className="text-red-600">Link</span>
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-red-100 text-red-700 rounded-md">
            AI
          </span>
        </div>
        {showTagline && (
          <span className="text-xs text-slate-500 font-medium tracking-tight">
            Connecting Blood. Connecting Lives.
          </span>
        )}
      </div>
    </Link>
  );
}
