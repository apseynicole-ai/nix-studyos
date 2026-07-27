import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarClock, ArrowRight, Check, X, RefreshCw } from 'lucide-react';
import {
  modulesRepo,
  verificationItemsRepo,
  tasksRepo,
  resolveWeekPlan,
  weekNumber,
  weekIdFor,
  ensureWeek,
  weeklyPlansRepo,
  detectWeekConflicts,
  runWeeklyReset,
  suggestSlot,
  acceptCarryOverSlot,
  leaveUnscheduled,
  localTodayISO,
  type Module,
  type StudyTask,
  type VerificationItem,
} from '../studySystem';

const KIND_TONE: Record<string, string> = {
  conflict: 'border-red-200 bg-red-50 text-red-700',
  tutorial_tbc: 'border-amber-200 bg-amber-50 text-amber-800',
  content_tbc: 'border-slate-200 bg-slate-50 text-slate-500',
  allocation_check: 'border-sky-200 bg-sky-50 text-sky-700',
};

const WeekReset: React.FC = () => {
  const today = localTodayISO();
  const [refresh, setRefresh] = useState(0);
  const bump = () => setRefresh((n) => n + 1);
  const modules = useMemo(() => modulesRepo.read(), [refresh]);
  const moduleName = (id: string) => modules.find((m: Module) => m.id === id)?.shortName ?? id;

  const currentPlan = useMemo(() => resolveWeekPlan(today), [refresh, today]);
  const currentWeekId = currentPlan?.id ?? null;
  const nextWeekId = currentWeekId ? weekIdFor(weekNumber(currentWeekId) + 1) : null;

  // Make sure the next week is prepared so it can be previewed.
  useEffect(() => {
    if (nextWeekId) {
      const names = new Map(modulesRepo.read().map((m) => [m.id, m.shortName] as const));
      if (ensureWeek(nextWeekId, (id) => names.get(id) ?? id)) bump();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextWeekId]);

  const nextPlan = nextWeekId ? weeklyPlansRepo.getById(nextWeekId) : undefined;

  const verification = useMemo(() => {
    const ids = [currentWeekId, nextWeekId].filter(Boolean) as string[];
    return verificationItemsRepo.read().filter((v: VerificationItem) => ids.includes(v.weekId) && v.status === 'open' && v.kind !== 'content_tbc');
    // content_tbc is noisy for all 9 modules; surface tutorial/conflict/allocation here.
  }, [refresh, currentWeekId, nextWeekId]);

  const conflicts = useMemo(() => {
    if (!nextPlan) return [];
    return detectWeekConflicts(nextPlan.id, nextPlan.weekStart, nextPlan.weekEnd, moduleName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, nextPlan?.id]);

  const carried = useMemo(() => tasksRepo.read().filter((t: StudyTask) => t.carriedOver && t.status !== 'done'), [refresh]);

  const doReset = () => {
    if (!currentWeekId || !nextWeekId) return;
    if (!confirm(`Run the weekly reset from ${currentWeekId} to ${nextWeekId}? This archives the completed week and carries unfinished required work forward.`)) return;
    runWeeklyReset(currentWeekId, nextWeekId, moduleName);
    bump();
  };

  return (
    <div className="page-shell">
      <header className="mb-5">
        <p className="page-kicker mb-1">Week lifecycle</p>
        <h1 className="font-display text-3xl md:text-4xl text-stellenbosch-maroon">Week rollover</h1>
      </header>

      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-slate-400">Current week</p>
            <p className="font-display text-2xl text-stellenbosch-maroon">{currentWeekId ?? '—'}</p>
            {currentPlan && <p className="text-xs text-slate-400">{currentPlan.weekStart} → {currentPlan.weekEnd}{currentPlan.archivedAt ? ' · archived' : ''}</p>}
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-slate-400">Next week</p>
            <p className="font-display text-2xl text-slate-700">{nextWeekId ?? '—'}</p>
            <p className="text-xs text-emerald-600 font-bold">{nextPlan ? 'Prepared' : 'Not prepared'}</p>
          </div>
        </div>
        <button onClick={doReset} className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl maroon-gradient py-3 text-sm font-bold text-white active:scale-95">
          <RefreshCw size={16} /> Run weekly reset → {nextWeekId}
        </button>
        <p className="mt-2 text-xs text-slate-400 text-center">Archives the completed week (logs preserved), carries unfinished required work forward, advances the current week.</p>
      </div>

      {conflicts.length > 0 && (
        <Section title="Conflicts — action required" icon={<AlertTriangle size={16} className="text-red-500" />}>
          {conflicts.map((c) => (
            <div key={c.id} className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="font-bold text-red-700 text-sm">{c.date}</p>
              <p className="text-sm text-slate-700 mt-1">{c.aLabel}</p>
              <p className="text-xs text-slate-400 my-0.5">vs</p>
              <p className="text-sm text-slate-700">{c.bLabel}</p>
              <p className="text-xs text-red-600 mt-2">{c.reason}</p>
            </div>
          ))}
        </Section>
      )}

      {verification.length > 0 && (
        <Section title="Verify / TBC" icon={<CalendarClock size={16} className="text-amber-500" />}>
          {verification.map((v) => (
            <div key={v.id} className={`rounded-2xl border p-4 ${KIND_TONE[v.kind] ?? 'border-slate-200 bg-slate-50'}`}>
              <p className="font-bold text-sm">{v.title}</p>
              {v.detail && <p className="text-xs mt-1 opacity-80">{v.detail}</p>}
            </div>
          ))}
        </Section>
      )}

      {carried.length > 0 && (
        <Section title="Carried-over work" icon={<ArrowRight size={16} className="text-stellenbosch-maroon" />}>
          {carried.map((t) => {
            const slot = nextWeekId ? suggestSlot(t, nextWeekId) : null;
            return (
              <div key={t.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-700">carried over</span>
                  <span className="text-[10px] font-bold uppercase text-stellenbosch-maroon/70">{moduleName(t.moduleId)}</span>
                </div>
                <p className="font-bold text-slate-800">{t.title}</p>
                {slot && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500">Suggested slot: {slot.date} {slot.startTime}</span>
                    {t.linkedStudyBlockId ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600"><Check size={12} /> scheduled</span>
                    ) : (
                      <>
                        <button onClick={() => { acceptCarryOverSlot(t.id, slot.blockId); bump(); }} className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">Accept</button>
                        <button onClick={() => { leaveUnscheduled(t.id); bump(); }} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-500 inline-flex items-center gap-1"><X size={11} /> Leave unscheduled</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </Section>
      )}

      {conflicts.length === 0 && verification.length === 0 && carried.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-8 text-center text-slate-400">Nothing needs attention for the week rollover right now.</div>
      )}
    </div>
  );
};

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <section className="mb-5">
    <h2 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{icon} {title}</h2>
    <div className="space-y-2">{children}</div>
  </section>
);

export default WeekReset;
