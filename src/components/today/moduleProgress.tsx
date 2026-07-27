import React, { useMemo } from 'react';
import {
  modulesRepo,
  assessmentsRepo,
  currentWeekPlan,
  moduleStatus,
  formatDurationDisplay,
  type Assessment,
  type Module,
  type ModuleStatus,
} from '../../studySystem';

const STATUS: Record<ModuleStatus, { label: string; tone: string; dot: string }> = {
  ON_TRACK: { label: 'On track', tone: 'text-emerald-700 bg-emerald-50', dot: '🟢' },
  AT_RISK: { label: 'At risk', tone: 'text-amber-700 bg-amber-50', dot: '🟡' },
  BEHIND: { label: 'Behind', tone: 'text-red-700 bg-red-50', dot: '🔴' },
  BASELINE_UNKNOWN: { label: 'Baseline unknown', tone: 'text-slate-500 bg-slate-100', dot: '⚪' },
};

function nextAssessment(moduleId: string, today: string): Assessment | undefined {
  return assessmentsRepo
    .read()
    .filter((a) => a.moduleId === moduleId && a.date && a.date >= today)
    .sort((a, b) => (a.date! < b.date! ? -1 : 1))[0];
}

export function ModuleProgressList({ today, refreshKey = 0 }: { today: string; refreshKey?: number }) {
  const plan = useMemo(() => currentWeekPlan(), [refreshKey]);
  const rows = useMemo(() => {
    if (!plan) return [];
    return modulesRepo.read().filter((m: Module) => m.active).map((m) => ({
      module: m,
      ...moduleStatus(m.id, plan, today),
      next: nextAssessment(m.id, today),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, today, plan]);
  if (!plan) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Modules · this week</h2>
      <div className="space-y-2">
        {rows.map(({ module: m, status, weekly, next }) => {
          const s = STATUS[status];
          return (
            <div key={m.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-2">
                <h3 className="font-bold text-slate-800 truncate">{m.name}</h3>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${s.tone}`}>{s.dot} {s.label}</span>
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wide font-bold text-slate-400">Weekly completion</span>
                <span className="text-sm font-bold text-stellenbosch-maroon tabular-nums">{weekly.completion === null ? '—' : `${Math.round(weekly.completion)}%`}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden mb-3">
                <div className="h-full rounded-full maroon-gradient" style={{ width: `${weekly.completion ?? 0}%` }} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span><span className="font-bold text-slate-700">{formatDurationDisplay(weekly.actualMinutes)}</span> / {formatDurationDisplay(weekly.plannedMinutes)} study</span>
                <span><span className="font-bold text-slate-700">{weekly.tasksComplete}/{weekly.tasksTotal}</span> tasks</span>
                {next && <span className="text-slate-400">Next: {next.label}{next.date ? ` — ${next.date}` : ''}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
