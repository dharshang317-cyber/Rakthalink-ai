import React from 'react';

export default function StatusBadge({ status = 'OPEN', size = 'md', className = '' }) {
  const configs = {
    OPEN: {
      label: 'Open Request',
      styles: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    MATCHED: {
      label: 'Matched with Donors',
      styles: 'bg-purple-50 text-purple-700 border-purple-200',
      dot: 'bg-purple-500 animate-pulse',
    },
    ACCEPTED: {
      label: 'Donor Accepted',
      styles: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
    },
    IN_COORDINATION: {
      label: 'In Coordination',
      styles: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
    },
    RESOLVED: {
      label: 'Fulfilled / Resolved',
      styles: 'bg-slate-100 text-slate-700 border-slate-300',
      dot: 'bg-slate-500',
    },
    CANCELLED: {
      label: 'Cancelled',
      styles: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
    },
  };

  const config = configs[status] || configs.OPEN;

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${config.styles} ${sizes[size] || sizes.md} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}
