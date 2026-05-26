import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw, BookMarked, Volume2, VolumeX, CheckCircle2, Flame, Target, Coffee } from 'lucide-react';
import { db, collection, addDoc, isFirestoreUnavailableError } from '../lib/firebase';
import { useAuth } from '../components/auth/AuthGuard';
import FocusGrowthVisual from '../components/FocusGrowthVisual';
import { modules } from '../data/baccllb';
import { LOCAL_TIMER_SESSIONS_KEY, readLocalJson, writeLocalJson } from '../lib/localData';
import { upsertMistake, type MistakeSourceType } from '../lib/mistakeBank';

type TimerMode = 'micro' | 'pomodoro' | 'deep' | 'break';

const modeConfig = {
  micro: { label: 'Micro-start', minutes: 15, description: 'For low-energy starts and anxiety-friendly activation.' },
  pomodoro: { label: 'Pomodoro', minutes: 25, description: 'For standard focused revision.' },
  deep: { label: 'Deep work', minutes: 50, description: 'For A2 practice, MegaNotes and memo marking.' },
  break: { label: 'Recovery break', minutes: 5, description: 'Reset before the next round.' },
};

const sessionTypes = ['MegaNote build', 'Timed practice', 'Memo marking', 'Teach aloud', 'Mistake correction', 'Admin / submission'] as const;
const ACTIVE_TIMER_STORAGE_KEY = 'baccllb-active-timer';

interface StudySessionLog {
  id: string;
  userId?: string;
  moduleId: string;
  moduleName: string;
  durationMinutes: number;
  mode: TimerMode;
  sessionType: typeof sessionTypes[number];
  reflection: string;
  autoCompleted: boolean;
  createdAt: string;
}

interface PersistedActiveTimer {
  id: string;
  mode: TimerMode;
  moduleId: string;
  sessionType: typeof sessionTypes[number];
  reflection: string;
  durationSeconds: number;
  remainingSeconds: number;
  startedAt: number;
  targetEndAt: number | null;
  isRunning: boolean;
  customMinutesOverride: number | null;
}

interface GardenTheme {
  label: string;
  cardClass: string;
  badgeClass: string;
  stemClass: string;
  leafClass: string;
  bloomClass: string;
}

interface QuickCaptureState {
  promptId: string;
  moduleId: string;
  moduleName: string;
  note: string;
  sessionType: typeof sessionTypes[number];
  status: 'idle' | 'logged';
}

const loadSessions = () => readLocalJson<StudySessionLog[]>(LOCAL_TIMER_SESSIONS_KEY, []);

const readActiveTimer = (): PersistedActiveTimer | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(ACTIVE_TIMER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedActiveTimer;
  } catch {
    return null;
  }
};

const getRemainingSeconds = (timer: PersistedActiveTimer, now = Date.now()) => {
  if (!timer.isRunning || timer.targetEndAt === null) return timer.remainingSeconds;
  return Math.max(0, Math.ceil((timer.targetEndAt - now) / 1000));
};

const persistActiveTimer = (timer: PersistedActiveTimer | null) => {
  if (typeof window === 'undefined') return;

  if (!timer) {
    window.localStorage.removeItem(ACTIVE_TIMER_STORAGE_KEY);
    return;
  }

  const snapshot: PersistedActiveTimer = {
    ...timer,
    remainingSeconds: getRemainingSeconds(timer),
  };

  window.localStorage.setItem(ACTIVE_TIMER_STORAGE_KEY, JSON.stringify(snapshot));
};

const sameLocalDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const startOfLocalWeek = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayIndex = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - dayIndex);
  start.setHours(0, 0, 0, 0);
  return start;
};

const formatCompletionTime = (value: string) =>
  new Intl.DateTimeFormat('en-ZA', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const deriveMistakeTitle = (note: string) => {
  const firstLine = note
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstLine) return 'Timer reflection follow-up';
  return firstLine.length <= 80 ? firstLine : `${firstLine.slice(0, 77).trimEnd()}...`;
};

const mapSessionTypeToSourceType = (sessionType: typeof sessionTypes[number]): MistakeSourceType => {
  switch (sessionType) {
    case 'Timed practice':
      return 'past-paper';
    case 'Memo marking':
      return 'test';
    case 'Admin / submission':
      return 'other';
    default:
      return 'self-study';
  }
};

const getGardenTheme = (moduleId: string): GardenTheme => {
  if (moduleId === 'finacc178') {
    return {
      label: 'Money-tree focus',
      cardClass: 'border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-lime-50',
      badgeClass: 'bg-emerald-100 text-emerald-700',
      stemClass: 'from-emerald-700 via-emerald-500 to-lime-400',
      leafClass: 'from-lime-100 via-emerald-300 to-emerald-500',
      bloomClass: 'from-lime-100 via-emerald-200 to-amber-200',
    };
  }

  if (moduleId === 'conlaw178') {
    return {
      label: 'Justice-tree focus',
      cardClass: 'border-violet-100 bg-gradient-to-br from-white via-violet-50 to-fuchsia-50',
      badgeClass: 'bg-violet-100 text-violet-700',
      stemClass: 'from-violet-800 via-violet-500 to-fuchsia-300',
      leafClass: 'from-fuchsia-100 via-violet-300 to-violet-500',
      bloomClass: 'from-violet-100 via-fuchsia-200 to-amber-100',
    };
  }

  if (moduleId === 'foundations178') {
    return {
      label: 'Ancient-tree focus',
      cardClass: 'border-lime-100 bg-gradient-to-br from-white via-lime-50 to-stone-100',
      badgeClass: 'bg-lime-100 text-lime-800',
      stemClass: 'from-stone-700 via-lime-700 to-lime-400',
      leafClass: 'from-lime-100 via-lime-300 to-stone-500',
      bloomClass: 'from-lime-100 via-stone-200 to-amber-100',
    };
  }

  if (moduleId === 'econ114') {
    return {
      label: 'Market-growth focus',
      cardClass: 'border-sky-100 bg-gradient-to-br from-white via-sky-50 to-cyan-50',
      badgeClass: 'bg-sky-100 text-sky-700',
      stemClass: 'from-sky-800 via-sky-500 to-cyan-300',
      leafClass: 'from-cyan-100 via-sky-300 to-sky-500',
      bloomClass: 'from-sky-100 via-cyan-200 to-amber-100',
    };
  }

  if (moduleId === 'sds188') {
    return {
      label: 'Data-star growth',
      cardClass: 'border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-cyan-50',
      badgeClass: 'bg-indigo-100 text-indigo-700',
      stemClass: 'from-indigo-800 via-indigo-500 to-cyan-300',
      leafClass: 'from-cyan-100 via-indigo-300 to-indigo-500',
      bloomClass: 'from-indigo-100 via-cyan-200 to-yellow-100',
    };
  }

  return {
    label: 'Garden focus',
    cardClass: 'border-slate-100 bg-gradient-to-br from-white via-slate-50 to-emerald-50/60',
    badgeClass: 'bg-slate-100 text-slate-700',
    stemClass: 'from-slate-700 via-emerald-500 to-emerald-300',
    leafClass: 'from-emerald-100 via-emerald-300 to-emerald-500',
    bloomClass: 'from-amber-100 via-rose-100 to-emerald-100',
  };
};

const Timer: React.FC = () => {
  const { user, localFirstMode } = useAuth();
  const restoredTimer = readActiveTimer();
  const restoredMinutes = restoredTimer ? Math.max(1, Math.round(restoredTimer.durationSeconds / 60)) : modeConfig.pomodoro.minutes;

  const [mode, setMode] = useState<TimerMode>(restoredTimer?.mode ?? 'pomodoro');
  const [isMuted, setIsMuted] = useState(false);
  const [moduleId, setModuleId] = useState(restoredTimer?.moduleId ?? modules[0].id);
  const [sessionType, setSessionType] = useState<typeof sessionTypes[number]>(restoredTimer?.sessionType ?? 'Timed practice');
  const [reflection, setReflection] = useState(restoredTimer?.reflection ?? '');
  const [saved, setSaved] = useState(false);
  const [customMinutesOverride, setCustomMinutesOverride] = useState<number | null>(restoredTimer?.customMinutesOverride ?? null);
  const [customDurationInput, setCustomDurationInput] = useState(String(restoredTimer?.customMinutesOverride ?? restoredMinutes));
  const [lastCompletedSession, setLastCompletedSession] = useState(false);
  const [sessionLogs, setSessionLogs] = useState<StudySessionLog[]>(loadSessions);
  const [activeTimer, setActiveTimer] = useState<PersistedActiveTimer | null>(restoredTimer);
  const [clockNow, setClockNow] = useState(Date.now());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [quickCapture, setQuickCapture] = useState<QuickCaptureState | null>(null);
  const [isLoggingMistake, setIsLoggingMistake] = useState(false);

  const activeTimerRef = useRef<PersistedActiveTimer | null>(restoredTimer);
  const completedTimerIdRef = useRef<string | null>(null);

  const selectedModule = modules.find((module) => module.id === moduleId) || modules[0];
  const selectedMode = activeTimer?.mode ?? mode;
  const currentDurationMinutes = activeTimer ? Math.round(activeTimer.durationSeconds / 60) : (customMinutesOverride ?? modeConfig[mode].minutes);
  const defaultDurationSeconds = currentDurationMinutes * 60;
  const timeLeft = activeTimer ? getRemainingSeconds(activeTimer, clockNow) : defaultDurationSeconds;
  const durationSeconds = activeTimer?.durationSeconds ?? defaultDurationSeconds;
  const elapsedSeconds = activeTimer ? Math.max(0, activeTimer.durationSeconds - timeLeft) : 0;
  const progress = durationSeconds > 0 ? Math.min(100, (elapsedSeconds / durationSeconds) * 100) : 0;
  const isActive = Boolean(activeTimer?.isRunning);
  const isPaused = Boolean(activeTimer && !activeTimer.isRunning && activeTimer.remainingSeconds > 0 && activeTimer.remainingSeconds < activeTimer.durationSeconds);

  const now = new Date();
  const weekStart = startOfLocalWeek(now);
  const completedFocusSessions = sessionLogs.filter((session) => session.autoCompleted && session.mode !== 'break');
  const todaysGardenSessions = completedFocusSessions.filter((session) => sameLocalDay(new Date(session.createdAt), now));
  const weeklyGardenSessions = completedFocusSessions.filter((session) => new Date(session.createdAt) >= weekStart);
  const weeklyMinutes = weeklyGardenSessions.reduce((sum, session) => sum + session.durationMinutes, 0);
  const moduleMinutesMap = weeklyGardenSessions.reduce<Record<string, number>>((accumulator, session) => {
    accumulator[session.moduleName] = (accumulator[session.moduleName] ?? 0) + session.durationMinutes;
    return accumulator;
  }, {});
  const mostStudiedModule = Object.entries(moduleMinutesMap).reduce<{ moduleName: string; minutes: number } | null>((best, [moduleName, minutes]) => {
    if (!best || minutes > best.minutes) {
      return { moduleName, minutes };
    }
    return best;
  }, null);

  useEffect(() => {
    activeTimerRef.current = activeTimer;
    persistActiveTimer(activeTimer);
  }, [activeTimer]);

  useEffect(() => {
    if (!activeTimer) return;
    if (activeTimer.moduleId === moduleId && activeTimer.sessionType === sessionType && activeTimer.reflection === reflection) return;

    setActiveTimer((current) => {
      if (!current) return current;
      return {
        ...current,
        moduleId,
        sessionType,
        reflection,
      };
    });
  }, [activeTimer, moduleId, reflection, sessionType]);

  useEffect(() => {
    if (!activeTimer?.isRunning) return;

    const interval = window.setInterval(() => {
      setClockNow(Date.now());
    }, 250);

    return () => window.clearInterval(interval);
  }, [activeTimer?.isRunning]);

  useEffect(() => {
    if (!activeTimer || !activeTimer.isRunning || timeLeft > 0) return;
    void completeTimer(activeTimer, 'elapsed');
  }, [activeTimer, timeLeft]);

  useEffect(() => {
    const syncFromClock = (reason: 'focus' | 'visible' | 'pageshow' | 'restore') => {
      const current = activeTimerRef.current;
      const nowMs = Date.now();
      setClockNow(nowMs);

      if (!current?.isRunning || current.targetEndAt === null) return;

      if (current.targetEndAt <= nowMs) {
        setStatusMessage('Timer caught up after your device slept.');
        if (reason === 'restore') {
          void completeTimer(current, 'restore');
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncFromClock('visible');
      }
    };

    const handleFocus = () => syncFromClock('focus');
    const handlePageShow = () => syncFromClock('pageshow');
    const handleBeforeUnload = () => persistActiveTimer(activeTimerRef.current);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    syncFromClock('restore');

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!statusMessage) return;
    const timeout = window.setTimeout(() => setStatusMessage(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [statusMessage]);

  const appendLocalSession = (session: StudySessionLog) => {
    const nextSessions = [session, ...loadSessions()];
    writeLocalJson(LOCAL_TIMER_SESSIONS_KEY, nextSessions);
    setSessionLogs(nextSessions);
  };

  const maybePromptMistakeCapture = (session: StudySessionLog) => {
    const note = session.reflection.trim();
    if (!note || session.mode === 'break') return;

    setQuickCapture({
      promptId: session.id,
      moduleId: session.moduleId,
      moduleName: session.moduleName,
      note,
      sessionType: session.sessionType,
      status: 'idle',
    });
  };

  const finishSaveFeedback = () => {
    setSaved(true);
    setReflection('');
    window.setTimeout(() => setSaved(false), 1400);
  };

  const saveSessionRecord = async (session: StudySessionLog) => {
    appendLocalSession(session);

    if (!user || localFirstMode) {
      finishSaveFeedback();
      return;
    }

    try {
      await addDoc(collection(db, 'sessions'), session);
      finishSaveFeedback();
    } catch (error) {
      if (isFirestoreUnavailableError(error)) {
        finishSaveFeedback();
        return;
      }
      console.error('Session save failed:', error instanceof Error ? error.message : String(error));
    }
  };

  const buildSessionRecord = (timerSnapshot: PersistedActiveTimer, autoCompleted: boolean): StudySessionLog => {
    const moduleInfo = modules.find((module) => module.id === timerSnapshot.moduleId);

    return {
      id: crypto.randomUUID(),
      userId: user?.uid,
      moduleId: timerSnapshot.moduleId,
      moduleName: moduleInfo?.shortName ?? timerSnapshot.moduleId,
      durationMinutes: Math.max(1, Math.round(timerSnapshot.durationSeconds / 60)),
      mode: timerSnapshot.mode,
      sessionType: timerSnapshot.sessionType,
      reflection: timerSnapshot.reflection,
      autoCompleted,
      createdAt: new Date().toISOString(),
    };
  };

  const completeTimer = async (timerSnapshot: PersistedActiveTimer, reason: 'elapsed' | 'restore') => {
    if (completedTimerIdRef.current === timerSnapshot.id) return;

    completedTimerIdRef.current = timerSnapshot.id;
    setActiveTimer(null);
    setLastCompletedSession(true);
    setCustomMinutesOverride(null);

    const sessionRecord = buildSessionRecord({ ...timerSnapshot, remainingSeconds: 0, isRunning: false, targetEndAt: null }, true);
    maybePromptMistakeCapture(sessionRecord);
    await saveSessionRecord(sessionRecord);

    if (reason === 'restore') {
      setStatusMessage('Timer caught up after your device slept.');
    }

    if (timerSnapshot.mode !== 'break') {
      setMode('break');
      setCustomDurationInput(String(modeConfig.break.minutes));
    }
  };

  const saveSession = async (autoCompleted = false) => {
    const snapshot: PersistedActiveTimer = activeTimer ?? {
      id: crypto.randomUUID(),
      mode,
      moduleId,
      sessionType,
      reflection,
      durationSeconds: defaultDurationSeconds,
      remainingSeconds: timeLeft,
      startedAt: Date.now(),
      targetEndAt: null,
      isRunning: false,
      customMinutesOverride,
    };

    const sessionRecord = buildSessionRecord({ ...snapshot, remainingSeconds: timeLeft }, autoCompleted);
    maybePromptMistakeCapture(sessionRecord);
    await saveSessionRecord(sessionRecord);
  };

  const logQuickCaptureMistake = () => {
    if (!quickCapture || quickCapture.status === 'logged' || isLoggingMistake) return;

    setIsLoggingMistake(true);

    try {
      const moduleInfo = modules.find((module) => module.id === quickCapture.moduleId);
      const today = new Date();

      upsertMistake({
        id: '',
        moduleId: quickCapture.moduleId,
        mistakeCategory: moduleInfo?.mistakeBankCategories?.[0] || '',
        topicId: '',
        topicName: '',
        mistakeTitle: deriveMistakeTitle(quickCapture.note),
        mistakeDescription: quickCapture.note,
        whyItHappened: 'Captured from a timer reflection for quick follow-up.',
        correctionRule: 'Turn this note into a clear correction rule, then retest it with a fresh question.',
        sourceType: mapSessionTypeToSourceType(quickCapture.sessionType),
        sourceReference: `Timer session: ${quickCapture.sessionType}`,
        markLost: undefined,
        retestDate: toDateInputValue(addDays(today, 3)),
        resolved: false,
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
      });

      setQuickCapture((current) => (current ? { ...current, status: 'logged' } : current));
      setStatusMessage('Mistake logged to MistakeBank.');
    } finally {
      setIsLoggingMistake(false);
    }
  };

  const startTimer = (durationSecondsOverride = defaultDurationSeconds, modeOverride = mode, customOverride = customMinutesOverride) => {
    completedTimerIdRef.current = null;
    setLastCompletedSession(false);
    setStatusMessage(null);
    setClockNow(Date.now());
    setActiveTimer({
      id: crypto.randomUUID(),
      mode: modeOverride,
      moduleId,
      sessionType,
      reflection,
      durationSeconds: durationSecondsOverride,
      remainingSeconds: durationSecondsOverride,
      startedAt: Date.now(),
      targetEndAt: Date.now() + durationSecondsOverride * 1000,
      isRunning: true,
      customMinutesOverride: customOverride,
    });
  };

  const pauseTimer = () => {
    setActiveTimer((current) => {
      if (!current) return current;

      return {
        ...current,
        isRunning: false,
        targetEndAt: null,
        remainingSeconds: getRemainingSeconds(current),
      };
    });
  };

  const resumeTimer = () => {
    setActiveTimer((current) => {
      if (!current) return current;

      return {
        ...current,
        isRunning: true,
        targetEndAt: Date.now() + current.remainingSeconds * 1000,
      };
    });
    setClockNow(Date.now());
  };

  const applyCustomDuration = () => {
    const nextMinutes = Number(customDurationInput);
    if (!Number.isFinite(nextMinutes) || nextMinutes <= 0) return;

    setCustomMinutesOverride(Math.round(nextMinutes));
    setLastCompletedSession(false);
    setStatusMessage(`Custom timer set for ${Math.round(nextMinutes)} minutes.`);
  };

  const setTimerMode = (nextMode: TimerMode) => {
    setActiveTimer(null);
    setLastCompletedSession(false);
    setStatusMessage(null);
    setMode(nextMode);
    setCustomMinutesOverride(null);
    setCustomDurationInput(String(modeConfig[nextMode].minutes));
  };

  const resetTimer = () => {
    setActiveTimer(null);
    setLastCompletedSession(false);
    completedTimerIdRef.current = null;
    setStatusMessage(null);
  };

  const handleToggleTimer = () => {
    if (activeTimer) {
      if (activeTimer.isRunning) {
        pauseTimer();
      } else {
        resumeTimer();
      }
      return;
    }

    startTimer();
  };

  const startTinySession = () => {
    setMode('micro');
    setCustomMinutesOverride(5);
    setCustomDurationInput('5');
    startTimer(5 * 60, 'micro', 5);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="page-shell">
      <header className="text-center mb-10">
        <p className="page-kicker">focus + logging</p>
        <h1 className="page-title">Pressure-Safe Study Timer</h1>
        <p className="page-subtitle mx-auto">Log module, session type and reflection so timer sessions become useful evidence, not just minutes.</p>
        {localFirstMode && <p className="mt-3 text-sm font-medium text-amber-800">Local-first mode active: session logs are being stored on this device.</p>}
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-8 items-start">
        <section className="editorial-muted-panel p-7 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {(Object.keys(modeConfig) as TimerMode[]).map((item) => (
              <button key={item} onClick={() => setTimerMode(item)} className={`rounded-2xl border p-4 text-left transition-all ${selectedMode === item ? 'bg-stellenbosch-maroon text-white border-stellenbosch-maroon shadow-lg shadow-stellenbosch-maroon/20' : 'bg-white text-slate-600 border-slate-100 hover:border-stellenbosch-maroon/20'}`}>
                <p className="text-xs uppercase font-bold tracking-wider opacity-70">{modeConfig[item].minutes} min</p>
                <p className="font-bold">{modeConfig[item].label}</p>
              </button>
            ))}
          </div>

          <div className="mb-6 rounded-[2rem] border border-slate-100 bg-white/80 p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex-1">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Custom duration</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="number"
                    min={1}
                    max={240}
                    step={1}
                    value={customDurationInput}
                    onChange={(event) => setCustomDurationInput(event.target.value)}
                    disabled={Boolean(activeTimer)}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20 disabled:cursor-not-allowed disabled:opacity-60 sm:max-w-[10rem]"
                  />
                  <button
                    onClick={applyCustomDuration}
                    disabled={Boolean(activeTimer)}
                    className="rounded-2xl border border-stellenbosch-maroon/15 bg-white px-5 py-3 font-bold text-stellenbosch-maroon transition-all hover:-translate-y-0.5 hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Use custom length
                  </button>
                </div>
                <p className="mt-3 text-sm text-slate-500">Set any session length from 1 to 240 minutes. Preset buttons still work and reset this field.</p>
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-[2rem] border border-amber-100 bg-gradient-to-r from-white via-amber-50/70 to-emerald-50/80 p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-slate-400 mb-2">Panic-friendly option</p>
                <h3 className="font-display text-2xl text-slate-800">Just 5 minutes. Start with one tiny step.</h3>
                <p className="text-sm text-slate-500">Use a short runway when starting feels heavier than the actual work.</p>
              </div>
              <button
                onClick={startTinySession}
                className="shrink-0 rounded-2xl border border-emerald-200 bg-white px-5 py-3 font-bold text-emerald-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow"
              >
                Start Tiny
              </button>
            </div>
          </div>

          <div className="mb-8">
            <FocusGrowthVisual
              progressPercent={progress}
              isRunning={isActive}
              isPaused={isPaused}
              isComplete={lastCompletedSession}
              moduleName={selectedModule.shortName}
            />
          </div>

          <div className="relative mx-auto w-80 h-80 mb-10">
            <motion.div
              animate={isActive ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-80 h-80 rounded-full bg-white border-4 border-white shadow-2xl flex flex-col items-center justify-center z-10 relative overflow-hidden"
            >
              <motion.div
                animate={{ height: `${progress}%` }}
                className={`absolute bottom-0 left-0 right-0 w-full transition-all duration-1000 ${selectedMode === 'break' ? 'bg-emerald-500 opacity-10' : 'bg-stellenbosch-maroon opacity-5'}`}
              />
              <div className="z-20 text-center px-8">
                <span className="text-xs uppercase font-bold tracking-[0.2em] text-slate-400 mb-2 block">{modeConfig[selectedMode].label}</span>
                <div className="text-7xl font-display text-slate-800 tracking-tighter tabular-nums">{formatTime(timeLeft)}</div>
                <p className="text-sm text-slate-500 mt-3">{customMinutesOverride ? `${modeConfig[selectedMode].description} Custom length: ${currentDurationMinutes} minutes.` : modeConfig[selectedMode].description}</p>
              </div>
            </motion.div>
            <FloatingIcon icon={<Target size={20} />} top="-7%" left="8%" delay={0} />
            <FloatingIcon icon={<Flame size={20} />} top="18%" right="-8%" delay={1} />
            <FloatingIcon icon={<BookMarked size={20} />} bottom="-7%" left="18%" delay={2} />
          </div>

          <div className="flex justify-center gap-6">
            <button onClick={resetTimer} className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-stellenbosch-maroon transition-all hover:scale-110 active:scale-90 shadow-sm"><RotateCcw size={24} /></button>
            <button onClick={handleToggleTimer} className="w-24 h-24 rounded-full maroon-gradient text-white flex items-center justify-center shadow-xl shadow-stellenbosch-maroon/20 hover:scale-110 active:scale-95 transition-all">
              {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
            </button>
            <button onClick={() => setIsMuted(!isMuted)} className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all hover:scale-110 active:scale-90 shadow-sm">
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
          </div>

          {statusMessage && (
            <div className="mt-6 rounded-[1.8rem] border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-amber-50 p-4 text-sm font-medium text-slate-600">
              {statusMessage}
            </div>
          )}

          {lastCompletedSession && (
            <div className="mt-4 rounded-[1.8rem] border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-amber-50 p-4 text-sm font-medium text-slate-600">
              <span className="text-emerald-700 font-bold">Session banked</span> — one more plant in your Study Garden.
            </div>
          )}
        </section>

        <section className="bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-sm">
          <h2 className="font-display text-3xl text-stellenbosch-maroon mb-6">Session setup</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1 block">Module</span>
              <select value={moduleId} onChange={(event) => setModuleId(event.target.value)} className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20">
                {modules.map((module) => <option key={module.id} value={module.id}>{module.shortName} ({module.code})</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1 block">Session type</span>
              <select value={sessionType} onChange={(event) => setSessionType(event.target.value as typeof sessionTypes[number])} className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20">
                {sessionTypes.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>

          <div className={`rounded-[2rem] bg-gradient-to-br ${selectedModule.colour} text-white p-6 mb-6`}>
            <p className="uppercase tracking-[0.25em] text-xs font-bold text-white/70 mb-2">Current module</p>
            <h3 className="font-display text-3xl mb-3">{selectedModule.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedModule.nextActions.slice(0, 4).map((action) => <p key={action} className="text-sm text-white/80 flex gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0" />{action}</p>)}
            </div>
          </div>

          <label className="block mb-5">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1 block">Reflection / mistake captured</span>
            <textarea value={reflection} onChange={(event) => setReflection(event.target.value)} rows={5} placeholder="What did I complete? What mistake must I retest? What is the next tiny step?" className="w-full rounded-3xl bg-slate-50 border border-slate-100 px-5 py-4 resize-none focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20" />
          </label>

          <button onClick={() => { void saveSession(false); }} className="w-full maroon-gradient text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform">
            <CheckCircle2 size={20} /> {saved ? 'Session saved' : 'Save session log'}
          </button>

          {quickCapture && (
            <div className="mt-5 rounded-[2rem] border border-amber-100 bg-gradient-to-r from-white via-amber-50/70 to-emerald-50/60 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-slate-400 mb-2">Quick capture</p>
                  <h3 className="font-display text-2xl text-slate-800">Log this as a mistake?</h3>
                  <p className="text-sm text-slate-500 mt-2">
                    {quickCapture.moduleName} • {quickCapture.sessionType}
                  </p>
                  <p className="text-sm text-slate-600 mt-3 line-clamp-3">{quickCapture.note}</p>
                  {quickCapture.status === 'logged' && (
                    <p className="mt-3 text-sm font-semibold text-emerald-700">Logged to MistakeBank. You can refine the details later.</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={logQuickCaptureMistake}
                    disabled={quickCapture.status === 'logged' || isLoggingMistake}
                    className="rounded-2xl bg-stellenbosch-maroon px-4 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {quickCapture.status === 'logged' ? 'Logged' : isLoggingMistake ? 'Logging...' : 'Log mistake'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickCapture(null)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition-all hover:-translate-y-0.5 hover:border-stellenbosch-maroon/20"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 rounded-[2rem] bg-slate-950 text-white p-6">
            <h3 className="font-display text-2xl mb-3 flex items-center gap-2"><Coffee className="text-stellenbosch-gold" /> After-session rule</h3>
            <p className="text-sm text-white/70">Never end with only “done”. End with a correction, a retest date, or tomorrow’s first 15-minute step. That is what turns effort into exam improvement.</p>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-8 mt-8">
        <section className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-2 mb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-slate-400 mb-2">Today&apos;s Study Garden</p>
              <h2 className="font-display text-3xl text-stellenbosch-maroon">Visible proof of today&apos;s focus</h2>
            </div>
            <p className="text-sm text-slate-500">Completed sessions grow into small plants for this device-local study day.</p>
          </div>

          {todaysGardenSessions.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 text-center">
              <p className="font-display text-2xl text-slate-700 mb-2">No plants yet today — start one tiny session.</p>
              <p className="text-sm text-slate-500">Completed focus blocks will bloom here and stay part of your local study trail.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todaysGardenSessions.map((session) => {
                const moduleInfo = modules.find((module) => module.id === session.moduleId);
                const theme = getGardenTheme(session.moduleId);
                return (
                  <GardenPlantCard
                    key={session.id}
                    moduleName={moduleInfo?.name ?? session.moduleName}
                    shortModuleName={moduleInfo?.shortName ?? session.moduleName}
                    durationMinutes={session.durationMinutes}
                    sessionType={session.sessionType}
                    completedAt={session.createdAt}
                    theme={theme}
                  />
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-slate-400 mb-2">Weekly Garden Summary</p>
          <h2 className="font-display text-3xl text-stellenbosch-maroon mb-6">This week&apos;s growth</h2>

          {weeklyGardenSessions.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 text-center">
              <p className="font-display text-2xl text-slate-700 mb-2">Your weekly garden will grow as you complete sessions.</p>
              <p className="text-sm text-slate-500">A few finished focus blocks are enough to make the pattern visible.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <SummaryCard label="Total focus minutes" value={`${weeklyMinutes}`} detail="Completed study sessions only" />
              <SummaryCard label="Sessions this week" value={`${weeklyGardenSessions.length}`} detail="Banked timer completions" />
              <SummaryCard
                label="Most studied module"
                value={mostStudiedModule?.moduleName ?? 'General study'}
                detail={mostStudiedModule ? `${mostStudiedModule.minutes} focused minutes` : 'No module pattern yet'}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const SummaryCard: React.FC<{ label: string; value: string; detail: string }> = ({ label, value, detail }) => (
  <div className="rounded-[2rem] border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-emerald-50/50 p-5">
    <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-slate-400 mb-2">{label}</p>
    <h3 className="font-display text-3xl text-slate-800 mb-1">{value}</h3>
    <p className="text-sm text-slate-500">{detail}</p>
  </div>
);

const GardenPlantCard: React.FC<{
  moduleName: string;
  shortModuleName: string;
  durationMinutes: number;
  sessionType: string;
  completedAt: string;
  theme: GardenTheme;
}> = ({ moduleName, shortModuleName, durationMinutes, sessionType, completedAt, theme }) => {
  const growthLevel = durationMinutes >= 45 ? 'tree' : durationMinutes >= 25 ? 'flower' : 'sprout';
  const stemHeight = growthLevel === 'tree' ? 'h-20' : growthLevel === 'flower' ? 'h-16' : 'h-12';
  const bloomSize = growthLevel === 'tree' ? 'h-14 w-14' : growthLevel === 'flower' ? 'h-11 w-11' : 'h-8 w-8';

  return (
    <div className={`rounded-[2rem] border p-5 shadow-sm ${theme.cardClass}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className={`inline-flex rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.22em] font-bold ${theme.badgeClass}`}>
            {theme.label}
          </p>
          <h3 className="font-display text-2xl text-slate-800 mt-3">{shortModuleName}</h3>
          <p className="text-sm text-slate-500">{moduleName}</p>
        </div>
        <div className="rounded-full bg-white/80 px-3 py-2 text-right shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-slate-400">Completed</p>
          <p className="text-sm font-bold text-slate-700">{formatCompletionTime(completedAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-[7rem_1fr] gap-4 items-center">
        <div className="relative h-36 rounded-[1.6rem] bg-gradient-to-b from-sky-50 via-white to-amber-50 overflow-hidden">
          <div className="absolute inset-x-4 bottom-3 h-8 rounded-full bg-amber-950/90" />
          <div className={`absolute left-1/2 bottom-9 w-2 -translate-x-1/2 rounded-full bg-gradient-to-t ${theme.stemClass} ${stemHeight}`} />
          <div className={`absolute left-1/2 bottom-14 h-7 w-10 -translate-x-[95%] rounded-tl-[999px] rounded-br-[999px] bg-gradient-to-br ${theme.leafClass}`} />
          <div className={`absolute left-1/2 bottom-18 h-8 w-10 translate-x-[-5%] rounded-tr-[999px] rounded-bl-[999px] bg-gradient-to-br ${theme.leafClass}`} />
          <div className={`absolute left-1/2 bottom-24 -translate-x-1/2 rounded-full bg-gradient-to-br ${theme.bloomClass} ${bloomSize} shadow-sm`} />
          {growthLevel !== 'sprout' && <div className="absolute left-1/2 bottom-28 h-3 w-3 -translate-x-1/2 rounded-full bg-white/70" />}
        </div>

        <div className="space-y-2">
          <p className="text-sm text-slate-600">
            <span className="font-bold text-slate-800">{durationMinutes} min</span> banked
          </p>
          <p className="text-sm text-slate-500">{sessionType}</p>
          <p className="text-xs uppercase tracking-[0.18em] font-bold text-slate-400">
            {growthLevel === 'tree' ? 'Deep-rooted session' : growthLevel === 'flower' ? 'Bloom session' : 'Sprout session'}
          </p>
        </div>
      </div>
    </div>
  );
};

const FloatingIcon: React.FC<{ icon: React.ReactNode; top?: string; left?: string; right?: string; bottom?: string; delay: number }> = (props) => (
  <motion.div
    animate={{ y: [0, -15, 0] }}
    transition={{ duration: 6, repeat: Infinity, delay: props.delay, ease: 'easeInOut' }}
    style={{ position: 'absolute', top: props.top, left: props.left, right: props.right, bottom: props.bottom }}
    className="w-12 h-12 rounded-2xl glass flex items-center justify-center shadow-sm text-slate-300"
  >
    {props.icon}
  </motion.div>
);

export default Timer;
