import React, { useState } from 'react';
import { Activity, Check, X } from 'lucide-react';
import Spinner from '../common/Spinner';

export default function AvailabilityToggle({
  isAvailable = true,
  onToggle,
  disabled = false,
  className = '',
}) {
  const [loading, setLoading] = useState(false);

  const handleSwitch = async () => {
    if (disabled || loading) return;
    setLoading(true);
    try {
      await onToggle(!isAvailable);
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={handleSwitch}
      className={`inline-flex items-center gap-3 p-2.5 sm:px-4 sm:py-2.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
        isAvailable
          ? 'bg-emerald-50/80 border-emerald-200 hover:bg-emerald-100/70 text-emerald-900'
          : 'bg-slate-100 border-slate-200 hover:bg-slate-200/70 text-slate-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${className}`}
    >
      {/* Live Pulsing Dot / Icon */}
      <div className="relative flex items-center justify-center">
        {loading ? (
          <Spinner size="xs" color={isAvailable ? 'emerald' : 'dark'} />
        ) : (
          <span
            className={`w-3 h-3 rounded-full ${
              isAvailable ? 'bg-emerald-500 shadow-sm animate-pulse' : 'bg-slate-400'
            }`}
          />
        )}
      </div>

      <div className="flex flex-col text-left">
        <span className="text-xs font-bold font-['Outfit']">
          {isAvailable ? '🟢 Available for Matching' : '🔴 Currently Unavailable'}
        </span>
        <span className="text-[10px] text-slate-500 hidden sm:inline">
          {isAvailable
            ? 'You will receive match alerts for urgent blood needs'
            : 'Matching algorithm will pause alerts'}
        </span>
      </div>

      {/* Switch Track */}
      <div
        className={`w-10 h-6 rounded-full p-0.5 ml-auto transition-colors duration-200 ease-in-out ${
          isAvailable ? 'bg-emerald-600' : 'bg-slate-300'
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out flex items-center justify-center text-[10px] ${
            isAvailable ? 'translate-x-4 text-emerald-700' : 'translate-x-0 text-slate-400'
          }`}
        >
          {isAvailable ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
        </div>
      </div>
    </div>
  );
}
