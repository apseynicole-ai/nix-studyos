import React from 'react';
import { clampProgress } from '../../lib/progressMetrics';

type ProgressTone = 'maroon' | 'emerald' | 'amber' | 'slate';

const badgeTone: Record<ProgressTone, string> = {
  maroon: 'bg-stellenbosch-maroon/6 text-stellenbosch-maroon border-stellenbosch-maroon/12 shadow-sm',
  emerald: 'bg-emerald-50/90 text-emerald-700 border-emerald-100 shadow-sm',
  amber: 'bg-amber-50/90 text-amber-700 border-amber-100 shadow-sm',
  slate: 'bg-white/80 text-slate-600 border-slate-200 shadow-sm',
};

interface ProgressBadgeProps {
  value: number | null | undefined;
  label: string;
  tone?: ProgressTone;
  className?: string;
}

const ProgressBadge: React.FC<ProgressBadgeProps> = ({
  value,
  label,
  tone = 'slate',
  className = '',
}) => {
  const safeValue = clampProgress(value);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] ${badgeTone[tone]} ${className}`}
      aria-label={`${label}: ${safeValue}%`}
    >
      <span>{label}</span>
      <span>{safeValue}%</span>
    </span>
  );
};

export default ProgressBadge;
