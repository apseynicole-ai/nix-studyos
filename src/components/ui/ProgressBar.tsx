import React from 'react';
import { motion } from 'motion/react';
import { clampProgress } from '../../lib/progressMetrics';

type ProgressTone = 'maroon' | 'emerald' | 'amber' | 'slate';
type ProgressSize = 'sm' | 'md' | 'lg';

const trackHeight: Record<ProgressSize, string> = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

const fillTone: Record<ProgressTone, string> = {
  maroon: 'from-stellenbosch-maroon to-rose-500',
  emerald: 'from-emerald-500 to-teal-400',
  amber: 'from-amber-500 to-orange-400',
  slate: 'from-slate-500 to-slate-400',
};

interface ProgressBarProps {
  value: number | null | undefined;
  label: string;
  helper?: string;
  tone?: ProgressTone;
  size?: ProgressSize;
  showValue?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  helper,
  tone = 'maroon',
  size = 'md',
  showValue = true,
  className = '',
}) => {
  const safeValue = clampProgress(value);

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="text-sm font-bold text-slate-800">{label}</p>
        {showValue && <span className="text-xs font-bold text-slate-500">{safeValue}%</span>}
      </div>
      <div
        className={`w-full rounded-full bg-slate-100 overflow-hidden ${trackHeight[size]}`}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safeValue}
      >
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${fillTone[tone]}`}
          initial={{ width: 0 }}
          animate={{ width: `${safeValue}%` }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
      </div>
      {helper && <p className="text-xs text-slate-500 mt-2">{helper}</p>}
    </div>
  );
};

export default ProgressBar;
