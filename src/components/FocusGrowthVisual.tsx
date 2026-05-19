import React from 'react';
import { motion } from 'motion/react';

interface FocusGrowthVisualProps {
  progressPercent: number;
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
  moduleName?: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const FocusGrowthVisual: React.FC<FocusGrowthVisualProps> = ({
  progressPercent,
  isRunning,
  isPaused,
  isComplete,
  moduleName,
}) => {
  const progress = clamp(progressPercent, 0, 100);
  const stemHeight = `${clamp((progress - 18) * 1.1, 0, 48)}%`;
  const leftLeafScale = clamp((progress - 50) / 18, 0, 1);
  const rightLeafScale = clamp((progress - 58) / 18, 0, 1);
  const bloomScale = clamp((progress - 82) / 16, 0, 1);
  const glowOpacity = isComplete ? 1 : clamp((progress - 92) / 10, 0, 0.5);
  const showSeed = progress < 12;
  const showSprout = progress >= 10;
  const showLeaves = progress >= 58;
  const showBloom = progress >= 85;
  const stageLabel =
    progress >= 100
      ? 'Full bloom'
      : progress >= 85
        ? 'Almost there'
        : progress >= 60
          ? 'Leaves opening'
          : progress >= 30
            ? 'Deepening focus'
            : progress >= 10
              ? 'Sprout stage'
              : 'Seed stage';

  const pulseAnimation = isRunning ? { scale: [1, 1.03, 1] } : { scale: 1 };
  const petalAnimation = isRunning && !isPaused ? { rotate: [0, 2, -2, 0] } : { rotate: 0 };

  return (
    <div className="relative overflow-hidden rounded-[2.2rem] border border-white/70 bg-gradient-to-br from-amber-50 via-white to-emerald-50 px-6 py-6 shadow-inner shadow-amber-100/50">
      <div className="absolute inset-x-6 top-4 h-24 rounded-full bg-gradient-to-r from-amber-100/30 via-white to-emerald-100/30 blur-2xl" />

      <div className="relative z-10 mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Focus growth</p>
          <h3 className="font-display text-2xl text-slate-800">{stageLabel}</h3>
          <p className="text-sm text-slate-500">
            {moduleName ? `${moduleName} is taking root.` : 'A calm session still counts.'}
          </p>
        </div>
        <div className="rounded-full bg-white/80 px-3 py-2 text-right shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Progress</p>
          <p className="tabular-nums text-lg font-bold text-stellenbosch-maroon">{Math.round(progress)}%</p>
        </div>
      </div>

      <div className="relative h-72 rounded-[2rem] bg-gradient-to-b from-sky-50 via-white to-amber-50/80">
        <motion.div
          animate={pulseAnimation}
          transition={isRunning ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}
          className="absolute inset-x-0 top-5 flex justify-center"
        >
          <div
            className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-200/40 to-emerald-200/40 blur-xl"
            style={{ opacity: glowOpacity }}
          />
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 h-20 rounded-b-[2rem] bg-gradient-to-t from-amber-900/90 via-amber-800/85 to-amber-700/70" />
        <div className="absolute inset-x-10 bottom-16 h-px bg-white/40" />
        <div className="absolute bottom-9 left-1/2 h-8 w-28 -translate-x-1/2 rounded-[999px] bg-amber-950/90 shadow-lg shadow-amber-900/25" />

        {showSeed && (
          <motion.div
            animate={isRunning ? { y: [0, -1, 0] } : { y: 0 }}
            transition={isRunning ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
            className="absolute bottom-12 left-1/2 h-4 w-6 -translate-x-1/2 rounded-full bg-gradient-to-br from-amber-200 to-amber-500 shadow-sm"
          />
        )}

        {showSprout && (
          <>
            <motion.div
              animate={{ height: stemHeight }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute bottom-16 left-1/2 w-2 -translate-x-1/2 origin-bottom rounded-full bg-gradient-to-t from-emerald-700 via-emerald-500 to-emerald-300"
              style={{ height: stemHeight }}
            />

            <motion.div
              animate={isRunning && !isPaused ? { rotate: [-8, 0, -8] } : { rotate: -8 }}
              transition={isRunning && !isPaused ? { duration: 3.6, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}
              className="absolute bottom-[5.2rem] left-1/2 h-4 w-9 -translate-x-[92%] origin-bottom-right rounded-br-[999px] rounded-tl-[999px] bg-gradient-to-br from-emerald-200 to-emerald-500 shadow-sm"
              style={{ opacity: clamp(progress / 20, 0.2, 1) }}
            />
          </>
        )}

        {showLeaves && (
          <>
            <motion.div
              animate={isRunning && !isPaused ? { rotate: [-10, -4, -10] } : { rotate: -10 }}
              transition={isRunning && !isPaused ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}
              className="absolute bottom-28 left-1/2 h-10 w-16 -translate-x-[98%] origin-bottom-right rounded-br-[999px] rounded-tl-[999px] bg-gradient-to-br from-emerald-200 via-emerald-400 to-emerald-600 shadow-md shadow-emerald-300/30"
              style={{ scale: leftLeafScale }}
            />
            <motion.div
              animate={isRunning && !isPaused ? { rotate: [10, 4, 10] } : { rotate: 10 }}
              transition={isRunning && !isPaused ? { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 } : { duration: 0.4 }}
              className="absolute bottom-32 left-1/2 h-11 w-16 translate-x-[-2%] origin-bottom-left rounded-bl-[999px] rounded-tr-[999px] bg-gradient-to-br from-emerald-200 via-emerald-400 to-emerald-600 shadow-md shadow-emerald-300/30"
              style={{ scale: rightLeafScale }}
            />
          </>
        )}

        {showBloom && (
          <motion.div
            animate={petalAnimation}
            transition={isRunning && !isPaused ? { duration: 5, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}
            className="absolute bottom-[9.5rem] left-1/2 -translate-x-1/2"
            style={{ scale: bloomScale }}
          >
            <div className="relative h-24 w-24">
              {[
                'top-0 left-1/2 -translate-x-1/2',
                'top-4 right-0',
                'top-4 left-0',
                'bottom-4 left-0',
                'bottom-4 right-0',
                'bottom-0 left-1/2 -translate-x-1/2',
              ].map((position) => (
                <div
                  key={position}
                  className={`absolute ${position} h-9 w-9 rounded-full bg-gradient-to-br from-rose-100 via-rose-300 to-amber-300 shadow-sm`}
                />
              ))}
              <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 shadow-md" />
            </div>
          </motion.div>
        )}

        <div className="absolute bottom-4 left-6 right-6">
          <div className="h-3 rounded-full bg-white/75 p-0.5 shadow-inner">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-stellenbosch-maroon via-rose-500 to-emerald-500"
            />
          </div>
          <p className="mt-3 text-xs font-medium text-slate-500">
            {isComplete
              ? 'Session banked — your study garden grew.'
              : isPaused
                ? 'Paused gently. Your progress is waiting right here.'
                : isRunning
                  ? 'Keep going. Small focused minutes still grow something real.'
                  : 'Start when ready. Even a partial session still counts.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FocusGrowthVisual;
