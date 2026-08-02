import React, { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { AlertTriangle, CalendarClock, ArrowRight, BookOpen, Check, Save, X, RefreshCw } from 'lucide-react';
import {
  modulesRepo,
  studyBlocksRepo,
  verificationItemsRepo,
  tasksRepo,
  resolveWeekPlan,
  weekNumber,
  weekIdFor,
  ensureWeek,
  weeklyPlansRepo,
  detectWeekConflicts,
  canRunWeeklyReset,
  runWeeklyReset,
  isPlaceholderStudyTask,
  updateStudyBlockTaskText,
  suggestSlot,
  acceptCarryOverSlot,
  leaveUnscheduled,
  localTodayISO,
  type Module,
  type StudyBlock,
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
  const [instructionDrafts, setInstructionDrafts] = useState<Record<string, string>>({});
  const [instructionError, setInstructionError] = useState<string | null>(null);
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
  const currentStudyBlocks = useMemo(() => {
    if (!currentPlan) return [];
    return studyBlocksRepo
      .read()
      .filter((block) => block.date >= currentPlan.weekStart && block.date <= currentPlan.weekEnd)
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  }, [refresh, currentPlan]);
  const placeholderCount = currentStudyBlocks.filter((block) => isPlaceholderStudyTask(block.taskText)).length;
  const resetAllowed = currentPlan ? canRunWeeklyReset(today, currentPlan) : false;

  const saveInstruction = (block: StudyBlock) => {
    const submitted = instructionDrafts[block.id] ?? block.taskText;
    if (!submitted.trim()) {
      setInstructionError(block.id);
      return;
    }
    const updated = updateStudyBlockTaskText(block.id, submitted);
    if (!updated) {
      setInstructionError(block.id);
      return;
    }
    setInstructionDrafts((drafts) => ({ ...drafts, [block.id]: updated.taskText }));
    setInstructionError(null);
    bump();
  };

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
    if (!currentPlan || !currentWeekId || !nextWeekId || !canRunWeeklyReset(today, currentPlan)) return;
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
        <button
          onClick={doReset}
          disabled={!resetAllowed}
          className={`mt-4 w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition ${resetAllowed ? 'maroon-gradient text-white active:scale-95' : 'cursor-not-allowed bg-slate-200 text-slate-400'}`}
        >
          <RefreshCw size={16} /> Run weekly reset → {nextWeekId}
        </button>
        <p className="mt-2 text-xs text-slate-400 text-center">
          {!currentPlan
            ? 'Weekly reset is unavailable because there is no current weekly plan.'
            : currentPlan.frozen || currentPlan.archivedAt
              ? 'This weekly plan is frozen or has already been archived.'
              : today < currentPlan.weekEnd
                ? `Weekly reset becomes available on ${format(parseISO(currentPlan.weekEnd), 'EEEE, d MMMM')}.`
                : 'Archives the completed week (logs preserved), carries unfinished required work forward, advances the current week.'}
        </p>
      </div>

      <section className="mb-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start gap-3">
          <BookOpen size={18} className="mt-0.5 text-stellenbosch-maroon" />
          <div>
            <h2 className="font-display text-xl text-stellenbosch-maroon">Plan this week’s study blocks</h2>
            <p className={`mt-1 text-xs font-bold ${placeholderCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {placeholderCount > 0
                ? `${placeholderCount} study block${placeholderCount === 1 ? '' : 's'} still need instructions`
                : 'All study blocks have instructions'}
            </p>
          </div>
        </div>

        {currentStudyBlocks.length === 0 ? (
          <p className="text-sm text-slate-400">No study blocks are scheduled inside the current weekly plan.</p>
        ) : (
          <div className="space-y-3">
            {currentStudyBlocks.map((block) => (
              <div key={block.id} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className="font-bold text-slate-700">{format(parseISO(block.date), 'EEE d MMM')}</span>
                  <span className="text-slate-500">{block.startTime}–{block.endTime}</span>
                  <span className="font-bold uppercase text-stellenbosch-maroon/70">{moduleName(block.moduleId)}</span>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={instructionDrafts[block.id] ?? block.taskText}
                    onChange={(event) => {
                      setInstructionDrafts((drafts) => ({ ...drafts, [block.id]: event.target.value }));
                      if (instructionError === block.id) setInstructionError(null);
                    }}
                    aria-label={`Study instruction for ${moduleName(block.moduleId)} on ${block.date}`}
                    className={`min-w-0 flex-1 rounded-xl border bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-stellenbosch-maroon/15 ${instructionError === block.id ? 'border-red-300' : 'border-slate-200'}`}
                  />
                  <button
                    onClick={() => saveInstruction(block)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-stellenbosch-maroon px-4 py-2 text-xs font-bold text-white active:scale-95"
                  >
                    <Save size={13} /> Save
                  </button>
                </div>
                {instructionError === block.id && <p className="mt-1.5 text-xs font-medium text-red-600">Enter a non-empty instruction before saving.</p>}
              </div>
            ))}
          </div>
        )}
      </section>

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
