import React from 'react';
import { clampProgress } from '../../lib/progressMetrics';

type ProgressTone = 'maroon' | 'emerald' | 'amber' | 'slate';

const badgeTone: Record<ProgressTone, string> = {
  maroon: 'bg-stellenbosch-maroon/5 text-stellenbosch-maroon border-stellenbosch-maroon/10',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
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
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${badgeTone[tone]} ${className}`}
      aria-label={`${label}: ${safeValue}%`}
    >
      <span>{label}</span>
      <span>{safeValue}%</span>
    </span>
  );
};

export default ProgressBadge;
