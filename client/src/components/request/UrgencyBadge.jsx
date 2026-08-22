import React from 'react';
import { AlertCircle, AlertTriangle, Clock } from 'lucide-react';

export default function UrgencyBadge({ urgency = 'normal', size = 'md', className = '' }) {
  const configs = {
    normal: {
      label: 'Normal (48-72h)',
      styles: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Clock,
      dot: 'bg-blue-500',
    },
    high: {
      label: 'High Priority (24h)',
      styles: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: AlertTriangle,
      dot: 'bg-amber-500',
    },
    urgent: {
      label: 'Critical / Urgent',
      styles: 'bg-red-50 text-red-700 border-red-200 font-bold',
      icon: AlertCircle,
      dot: 'bg-red-600 animate-ping',
    },
  };

  const config = configs[urgency] || configs.normal;
  const Icon = config.icon;

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${config.styles} ${sizes[size] || sizes.md} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
}
