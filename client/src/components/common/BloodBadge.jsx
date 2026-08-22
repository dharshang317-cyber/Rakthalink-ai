import React from 'react';

export default function BloodBadge({ bloodGroup, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-7 h-7 text-xs font-bold',
    md: 'w-10 h-10 text-sm font-extrabold',
    lg: 'w-14 h-14 text-lg font-black',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl bg-red-50 text-red-700 border border-red-200 shadow-xs font-['Outfit'] select-none ${sizes[size] || sizes.md} ${className}`}
      title={`Blood Group: ${bloodGroup}`}
    >
      <span className="tracking-tighter">{bloodGroup || '--'}</span>
    </div>
  );
}
