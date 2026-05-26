import React from 'react';
import { motion } from 'motion/react';
import { clampProgress } from '../../lib/progressMetrics';

type ProgressTone = 'maroon' | 'emerald' | 'amber' | 'slate';

const ringTone: Record<ProgressTone, { stroke: string; text: string }> = {
  maroon: { stroke: '#7a0019', text: 'text-stellenbosch-maroon' },
  emerald: { stroke: '#10b981', text: 'text-emerald-600' },
  amber: { stroke: '#f59e0b', text: 'text-amber-600' },
  slate: { stroke: '#64748b', text: 'text-slate-600' },
};

interface ProgressRingProps {
  value: number | null | undefined;
  label: string;
  helper?: string;
  size?: number;
  strokeWidth?: number;
  tone?: ProgressTone;
  className?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  label,
  helper,
  size = 112,
  strokeWidth = 10,
  tone = 'maroon',
  className = '',
}) => {
  const safeValue = clampProgress(value);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (safeValue / 100) * circumference;
  const toneStyles = ringTone[tone];

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <div
        className="relative shrink-0"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safeValue}
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#ebe4de"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={toneStyles.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-display text-3xl ${toneStyles.text}`}>{safeValue}%</span>
        </div>
      </div>
      <p className="mt-3 text-sm font-bold text-slate-800">{label}</p>
      {helper && <p className="mt-1 text-xs text-slate-500 max-w-[12rem]">{helper}</p>}
    </div>
  );
};

export default ProgressRing;
