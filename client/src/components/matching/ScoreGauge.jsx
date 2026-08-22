import React from 'react';

export default function ScoreGauge({ score = 0, size = 'md', showLabel = true, className = '' }) {
  // Determine color tier
  let color = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  let badgeText = 'Excellent Match';

  if (score < 60) {
    color = 'text-amber-700 bg-amber-50 border-amber-200';
    badgeText = 'Moderate Proximity';
  } else if (score < 80) {
    color = 'text-blue-700 bg-blue-50 border-blue-200';
    badgeText = 'Strong Match';
  }

  const sizes = {
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3.5 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-2xl border ${color} ${sizes[size] || sizes.md} ${className}`}>
      <div className="flex items-baseline gap-0.5">
        <span className="font-extrabold text-base sm:text-lg font-['Outfit']">{score}</span>
        <span className="text-[10px] font-semibold opacity-70">/100</span>
      </div>
      {showLabel && (
        <span className="text-[11px] font-semibold border-l border-current/20 pl-2">
          {badgeText}
        </span>
      )}
    </div>
  );
}
