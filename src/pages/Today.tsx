import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { format, parseISO, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, CalendarClock } from 'lucide-react';
import {
  bootstrapSemester2,
  isBootstrapped,
  modulesRepo,
  buildDayFeed,
  buildDaySummary,
  logAttendance,
  clearAttendance,
  startSession,
  stopSession,
  completeSession,
  discardPendingSession,
  getActiveSession,
  getPendingSession,
  elapsedSeconds,
  logUnplannedActivity,
  dailyCompletion,
  SessionConflictError,
  type Module,
  type SessionCompletion,
  type UnplannedActivityInput,
} from '../studySystem';
import { ClassCard, DailyHeader, StudyCard } from '../components/today/cards';
import { LogActivitySheet, PostSessionSheet } from '../components/today/sheets';
import { ModuleProgressList } from '../components/today/moduleProgress';

function localTodayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const Today: React.FC = () => {
  const [date, setDate] = useState(localTodayISO);
  const [refresh, setRefresh] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [showLog, setShowLog] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [pendingOpen, setPendingOpen] = useState(false);

  // One-time bootstrap so the reference layer exists (idempotent).
  useEffect(() => {
    if (!isBootstrapped()) bootstrapSemester2();
    if (getPendingSession()) setPendingOpen(true);
    setRefresh((n) => n + 1);
  }, []);

  // Tick only while a session is running (persisted timer; time derived from timestamps).
  const active = getActiveSession();
  const runningRef = useRef(false);
  runningRef.current = !!active;
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    const onVis = () => setNow(Date.now());
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onVis);
    };
  }, [active?.id]);

  const modules = useMemo(() => modulesRepo.read(), [refresh]);
  const moduleName = useCallback(
    (id: string) => modules.find((m: Module) => m.id === id)?.shortName ?? id,
    [modules],
  );

  const feed = useMemo(() => buildDayFeed(date), [date, refresh, now]);
  const summary = useMemo(() => buildDaySummary(date), [date, refresh]);
  const completion = useMemo(() => dailyCompletion(date), [date, refresh]);
  const pending = getPendingSession();

  const doneCount = feed.filter((i) => i.state === 'COMPLETED' || i.state === 'PARTIALLY_COMPLETED').length;

  const bump = () => setRefresh((n) => n + 1);
  const flash = (msg: string) => {
    setBanner(msg);
    window.setTimeout(() => setBanner(null), 2400);
  };

  const handleStart = (blockId: string, moduleId: string) => {
    try {
      startSession({ moduleId, studyBlockId: blockId });
      setNow(Date.now());
      bump();
    } catch (e) {
      flash(e instanceof SessionConflictError ? e.message : 'Could not start session.');
    }
  };

  const handleStop = () => {
    if (stopSession()) {
      setPendingOpen(true);
      bump();
    }
  };

  const handleComplete = (c: SessionCompletion) => {
    completeSession(c);
    setPendingOpen(false);
    bump();
    flash('Session logged.');
  };

  const handleDiscard = () => {
    discardPendingSession();
    setPendingOpen(false);
    bump();
  };

  const handleLog = (input: UnplannedActivityInput) => {
    logUnplannedActivity(input);
    setShowLog(false);
    bump();
    flash('Activity logged.');
  };

  const dateLabel = format(parseISO(date), 'EEEE d MMMM');

  return (
    <div className="page-shell">
      {banner && (
        <div className="fixed top-4 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {banner}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => setDate(format(addDays(parseISO(date), -1), 'yyyy-MM-dd'))} className="rounded-full border border-slate-200 p-2 text-slate-500 active:scale-95"><ChevronLeft size={18} /></button>
        <button onClick={() => setDate(localTodayISO())} className="text-xs font-bold uppercase tracking-wide text-slate-400 hover:text-stellenbosch-maroon">Today</button>
        <button onClick={() => setDate(format(addDays(parseISO(date), 1), 'yyyy-MM-dd'))} className="rounded-full border border-slate-200 p-2 text-slate-500 active:scale-95"><ChevronRight size={18} /></button>
      </div>

      <DailyHeader
        dateLabel={dateLabel}
        dailyPercent={completion.percent}
        bonusWork={completion.bonusWork}
        actualMinutes={summary.actualStudyMinutes}
        plannedMinutes={summary.plannedStudyMinutes}
        doneCount={doneCount}
        totalCount={feed.length}
      />

      <div className="space-y-3">
        {feed.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-8 text-center">
            <CalendarClock className="mx-auto mb-2 text-slate-300" size={28} />
            <p className="font-display text-xl text-slate-600">Nothing scheduled for this day.</p>
            <p className="text-sm text-slate-400">Use “+ Log activity” to record any study you did.</p>
          </div>
        )}

        {feed.map((item) =>
          item.kind === 'class' ? (
            <ClassCard
              key={item.activity.id}
              item={item}
              moduleName={moduleName(item.activity.moduleId)}
              onAttend={(state) => { logAttendance(item.activity, state); bump(); }}
              onClear={() => { clearAttendance(item.activity.id); bump(); }}
            />
          ) : (
            <StudyCard
              key={item.block.id}
              item={item}
              moduleName={moduleName(item.block.moduleId)}
              runningSeconds={item.isRunning && active ? elapsedSeconds(active, now) : 0}
              canStart={!active && !pending}
              onStart={() => handleStart(item.block.id, item.block.moduleId)}
              onStop={handleStop}
            />
          ),
        )}
      </div>

      <button
        onClick={() => setShowLog(true)}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stellenbosch-maroon/25 py-3.5 text-sm font-bold text-stellenbosch-maroon active:scale-95 transition-transform"
      >
        <Plus size={17} /> Log activity
      </button>

      <ModuleProgressList today={date} refreshKey={refresh} />

      {pendingOpen && pending && (
        <PostSessionSheet
          moduleName={moduleName(pending.moduleId)}
          exactMinutes={pending.exactMinutes}
          onSave={handleComplete}
          onDiscard={handleDiscard}
        />
      )}
      {showLog && <LogActivitySheet modules={modules} onSave={handleLog} onClose={() => setShowLog(false)} />}
    </div>
  );
};

export default Today;
