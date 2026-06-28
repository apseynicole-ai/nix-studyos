import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../components/auth/AuthGuard';
import { db, collection, query, where, getDocs, isFirestoreUnavailableError } from '../lib/firebase';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Flame,
  GraduationCap,
  LineChart,
  ListChecks,
  Mic2,
  ShieldAlert,
  Sparkles,
  Target,
  TimerReset,
  Zap,
} from 'lucide-react';
import { modules, nightlyChecklist, taskTemplates, USER_ACADEMIC_PROFILE, weeklyRhythm } from '../data/baccllb';
import { finalAssessmentCalendarEntries, type AssessmentCalendarEntry } from '../data/assessmentCalendar';
import {
  averageConfidence,
  getDashboardMarksPressureSummary,
  highRiskModules,
  moduleFlags,
  modulesMissingCurrentMarks,
  modulesWithSourceWarnings,
  priorityScore,
  readinessLabel,
  riskTone,
  upcomingAssessments,
} from '../lib/studyMetrics';
import { LOCAL_SUMMARIES_KEY, LOCAL_TASKS_KEY, LOCAL_TIMER_SESSIONS_KEY, getBackupAgeDays, readLocalJson } from '../lib/localData';
import { readDashboardViewMode, writeDashboardViewMode } from '../lib/dashboardViewMode';
import { getEffectiveModuleConfidence } from '../lib/moduleConfidence';
import { getStudyMomentumSummary } from '../lib/studyMomentum';
import { averageTopicConfidence, readTopicMastery, topicsDueThisWeek, urgentTopicsCount } from '../lib/topicMastery';
import { mistakeRetestsDueThisWeek, mistakesNeedingCorrectionRule, moduleWithMostUnresolvedMistakes, readMistakeBank, unresolvedMistakes } from '../lib/mistakeBank';
import { getNextBestActions, type NextBestAction } from '../lib/nextBestAction';
import { getLatestAcademicSnapshot, summarizeAcademicSnapshot } from '../lib/academicSnapshots';
import { buildWeeklyReviewActions, weeklyReviewTone, weeklyReviewDotTone, type WeeklyReviewAction, type WeeklyReviewTone } from '../lib/weeklyReview';
import { getNextAssessment } from '../lib/assessmentCountdown';
import { addManualAssessment, deleteManualAssessment, isValidIsoDateString, readManualAssessments, saveManualAssessments, toAssessmentCalendarEntry } from '../lib/manualAssessments';
import { parseManualAssessmentImport, type ParsedImportRow } from '../lib/manualAssessmentImport';
import { buildAssessmentPrepTasks, buildPrepTasksForAssessments, getAssessmentPrepProgress, savePrepTasksToLocal } from '../lib/assessmentPrepTasks';
import { isPastDate, isRelevantAssessmentDate, isWithinNextDays, todayIsoLocal } from '../lib/dateUtils';
import { buildStudyQueue, type StudyQueueTask } from '../lib/studyQueue';
import ProgressBar from '../components/ui/ProgressBar';
import ProgressBadge from '../components/ui/ProgressBadge';
import ProgressRing from '../components/ui/ProgressRing';
import {
  calculateMistakeResolutionProgress,
  calculateModuleReadiness,
  calculatePlannerProgress,
  calculateTaskProgress,
  calculateTopicProgress,
  clampProgress,
} from '../lib/progressMetrics';

type ActionFilter = 'All' | 'Urgent' | 'Today' | 'This week' | 'Marks risk' | 'Mistakes' | 'Source gaps' | 'Final Boss';

interface TimerSessionRecord {
  id: string;
  userId?: string;
  moduleId: string;
  moduleName: string;
  durationMinutes: number;
  mode: 'micro' | 'pomodoro' | 'deep' | 'break';
  sessionType: string;
  reflection: string;
  autoCompleted: boolean;
  createdAt: string;
}

interface DashboardTaskRecord {
  id?: string;
  userId?: string;
  done?: boolean;
  completedAt?: string | null;
  moduleId?: string;
  text?: string;
  title?: string;
  dueDate?: string | null;
  category?: string;
  priority?: string;
  type?: string;
}


const Dashboard: React.FC = () => {
  const { user, localFirstMode, profile } = useAuth();
  const [stats, setStats] = useState({ tasks: 0, sessions: 0, summaries: 0, completedTasks: 0 });
  const [actionFilter, setActionFilter] = useState<ActionFilter>('All');
  const [manualEntries, setManualEntries] = useState(() => readManualAssessments());
  const [newTitle, setNewTitle] = useState('');
  const [newModuleId, setNewModuleId] = useState(modules[0].id);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newVenue, setNewVenue] = useState('');
  const [newConfidence, setNewConfidence] = useState<'high' | 'provisional'>('high');
  const [bulkText, setBulkText] = useState('');
  const [importRows, setImportRows] = useState<ParsedImportRow[] | null>(null);
  const [importSaved, setImportSaved] = useState(false);
  const [prepTaskStatus, setPrepTaskStatus] = useState<Record<string, { msg: string; ok: boolean }>>({});
  const [bulkPrepTaskStatus, setBulkPrepTaskStatus] = useState<{ msg: string; ok: boolean } | null>(null);
  const [localTasksVersion, setLocalTasksVersion] = useState(0);
  const [isTodayMode, setIsTodayMode] = useState(() => readDashboardViewMode() === 'today');

  useEffect(() => {
    const loadLocalStats = () => {
      const tasks = readLocalJson<any[]>(LOCAL_TASKS_KEY, []).filter((task) => !user || task.userId === user.uid || !task.userId);
      const sessions = readLocalJson<any[]>(LOCAL_TIMER_SESSIONS_KEY, []).filter((session) => !user || session.userId === user.uid || !session.userId);
      const summaries = readLocalJson<any[]>(LOCAL_SUMMARIES_KEY, []).filter((summary) => !user || summary.userId === user.uid || !summary.userId);
      setStats({
        tasks: tasks.length,
        completedTasks: tasks.filter((task) => task.done).length,
        sessions: sessions.length,
        summaries: summaries.length,
      });
    };

    if (localFirstMode || !user) {
      loadLocalStats();
      return;
    }

    const fetchStats = async () => {
      try {
        const tasksSnap = await getDocs(query(collection(db, 'tasks'), where('userId', '==', user.uid)));
        const sessionsSnap = await getDocs(query(collection(db, 'sessions'), where('userId', '==', user.uid)));
        const summarySnap = await getDocs(query(collection(db, 'summaries'), where('userId', '==', user.uid)));
        const tasks = tasksSnap.docs.map((doc) => doc.data());
        setStats({
          tasks: tasksSnap.size,
          completedTasks: tasks.filter((task) => task.done).length,
          sessions: sessionsSnap.size,
          summaries: summarySnap.size,
        });
      } catch (error) {
        if (isFirestoreUnavailableError(error)) {
          loadLocalStats();
          return;
        }
        console.error('Dashboard stats failed:', error instanceof Error ? error.message : String(error));
        loadLocalStats();
      }
    };

    fetchStats();
  }, [user, localFirstMode]);

  const avgConfidence = averageConfidence();
  const nextAssessments = upcomingAssessments().slice(0, 5);
  const weakestModules = [...modules]
    .sort((a, b) => getEffectiveModuleConfidence(a) - getEffectiveModuleConfidence(b))
    .slice(0, 4);
  const nextBestTasks = taskTemplates.slice(0, 5);
  const today = new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' });
  const topicRecords = useMemo(() => readTopicMastery(), []);
  const urgentTopics = urgentTopicsCount(topicRecords);
  const topicConfidence = averageTopicConfidence(topicRecords);
  const retestsThisWeek = topicsDueThisWeek(topicRecords).length;
  const mistakeRecords = useMemo(() => readMistakeBank(), []);
  const unresolvedMistakeCount = unresolvedMistakes(mistakeRecords).length;
  const incompleteRuleCount = mistakesNeedingCorrectionRule(mistakeRecords).length;
  const mistakeRetests = mistakeRetestsDueThisWeek(mistakeRecords).length;
  const topMistakeModule = moduleWithMostUnresolvedMistakes(mistakeRecords);
  const plannerData = useMemo(() => readLocalJson<unknown>('baccllb-planner', null), []);
  const localTasks = useMemo(
    () => readLocalJson<DashboardTaskRecord[]>(LOCAL_TASKS_KEY, [])
      .filter((task) => !user || task.userId === user.uid || !task.userId),
    [user, localTasksVersion],
  );
  const localTimerSessions = useMemo(
    () => readLocalJson<TimerSessionRecord[]>(LOCAL_TIMER_SESSIONS_KEY, [])
      .filter((session) => !user || session.userId === user.uid),
    [user],
  );
  const topicProgress = calculateTopicProgress(topicRecords);
  const mistakeResolutionProgress = calculateMistakeResolutionProgress(mistakeRecords);
  const taskProgress = calculateTaskProgress(localTasks);
  const plannerProgress = calculatePlannerProgress(plannerData);
  const highRisk = highRiskModules().slice(0, 4);
  const missingMarks = modulesMissingCurrentMarks().slice(0, 4);
  const sourceWarnings = modulesWithSourceWarnings().slice(0, 4);
  const marksPressure = useMemo(() => getDashboardMarksPressureSummary(), []);
  const backupAgeDays = useMemo(() => getBackupAgeDays(), []);
  const provisionalCalendarEntries = finalAssessmentCalendarEntries.filter((e) => e.confidence === 'provisional' && isRelevantAssessmentDate(e.date));
  const allCalendarEntries = useMemo(
    () => [...finalAssessmentCalendarEntries, ...manualEntries.map(toAssessmentCalendarEntry)],
    [manualEntries],
  );
  const nextAssessment = getNextAssessment(allCalendarEntries, todayIsoLocal());
  const prepProgressTasks = useMemo(
    () => readLocalJson<{ id: string; done: boolean; userId?: string }[]>(LOCAL_TASKS_KEY, [])
      .filter((t) => !user || t.userId === user.uid || !t.userId),
    [user, localTasksVersion],
  );
  const upcomingAssessmentsForProgress = useMemo(() => {
    const today = todayIsoLocal();
    return allCalendarEntries
      .filter((e) => isValidIsoDateString(e.date) && e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 8);
  }, [allCalendarEntries]);
  const openLocalTasks = localTasks.filter((task) => !task.done);
  const overdueTasks = openLocalTasks.filter((task) => isPastDate(task.dueDate));
  const dueSoonTasks = openLocalTasks.filter((task) => isWithinNextDays(task.dueDate || undefined, 7));
  const studyQueue = useMemo(() => buildStudyQueue(localTasks, todayIsoLocal(), 10), [localTasks]);
  const nextBestActions = useMemo(() => getNextBestActions({ limit: 12 }), [topicRecords, mistakeRecords]);
  const battlePlan = nextBestActions.slice(0, 5);
  const filteredActions = useMemo(
    () => nextBestActions.filter((action) => matchesFilter(action, actionFilter)).slice(0, 5),
    [nextBestActions, actionFilter],
  );
  const focusModule = topMistakeModule
    ? modules.find((module) => module.id === topMistakeModule.moduleId)
    : highRisk[0] || modules[0];
  const focusModuleReadiness = calculateModuleReadiness(focusModule.id, topicRecords, mistakeRecords, localTasks);
  const overallStudyProgress = clampProgress((topicProgress + mistakeResolutionProgress + taskProgress + plannerProgress) / 4);
  const nextSmallWin = useMemo(
    () => nextBestActions.find((action) => action.estimatedMinutes <= 30) || nextBestActions[0] || null,
    [nextBestActions],
  );
  const todaysFocusSessions = useMemo(() => {
    const today = new Date();
    return localTimerSessions.filter((session) => {
      if (!session.autoCompleted || session.mode === 'break') return false;
      const createdAt = new Date(session.createdAt);
      return (
        createdAt.getFullYear() === today.getFullYear() &&
        createdAt.getMonth() === today.getMonth() &&
        createdAt.getDate() === today.getDate()
      );
    });
  }, [localTimerSessions]);
  const todaysFocusMinutes = todaysFocusSessions.reduce((sum, session) => sum + session.durationMinutes, 0);
  const todaysModuleMap = todaysFocusSessions.reduce<Record<string, number>>((accumulator, session) => {
    accumulator[session.moduleName] = (accumulator[session.moduleName] ?? 0) + session.durationMinutes;
    return accumulator;
  }, {});
  const todaysTopModule = Object.entries(todaysModuleMap).reduce<{ moduleName: string; minutes: number } | null>((best, [moduleName, minutes]) => {
    if (!best || minutes > best.minutes) {
      return { moduleName, minutes };
    }
    return best;
  }, null);
  const studyMomentum = useMemo(() => getStudyMomentumSummary(localTimerSessions), [localTimerSessions]);
  const maxMomentumMinutes = Math.max(...studyMomentum.last7Days.map((day) => day.minutes), 1);
  const latestAcademicSnapshot = useMemo(() => getLatestAcademicSnapshot(), []);
  const latestAcademicSummary = useMemo(() => summarizeAcademicSnapshot(latestAcademicSnapshot), [latestAcademicSnapshot]);
  const greetingName = meaningfulProfileName(profile?.displayName) || USER_ACADEMIC_PROFILE.preferredName || 'Nix';
  const weeklyReviewActions = useMemo<WeeklyReviewAction[]>(() => buildWeeklyReviewActions({
    overdueCount: overdueTasks.length,
    dueSoonCount: dueSoonTasks.length,
    missingMarksCount: missingMarks.length,
    marksPressure,
    mistakeRetests,
    incompleteRuleCount,
    provisionalCalendarEntries,
    backupAgeDays,
  }), [backupAgeDays, dueSoonTasks.length, incompleteRuleCount, marksPressure, missingMarks.length, mistakeRetests, overdueTasks.length, provisionalCalendarEntries]);

  const handleAddManual = () => {
    if (!newTitle.trim() || !isValidIsoDateString(newDate)) return;
    const module = modules.find((m) => m.id === newModuleId);
    setManualEntries(addManualAssessment({
      moduleId: newModuleId,
      moduleCode: module?.code || '',
      title: newTitle.trim(),
      date: newDate,
      time: newTime.trim(),
      venue: newVenue.trim(),
      durationMinutes: 0,
      confidence: newConfidence,
      createdAt: new Date().toISOString(),
    }));
    setNewTitle('');
    setNewDate('');
    setNewTime('');
    setNewVenue('');
  };

  const handleDeleteManual = (id: string) => setManualEntries(deleteManualAssessment(id));

  const handlePreviewImport = () => {
    setImportSaved(false);
    setImportRows(parseManualAssessmentImport(bulkText, modules, manualEntries).rows);
  };

  const handleSaveImport = () => {
    if (!importRows) return;
    const validRows = importRows.filter((r) => r.status === 'valid');
    if (validRows.length === 0) return;
    const newEntries = validRows.map((row) => ({
      id: crypto.randomUUID(),
      moduleId: row.moduleId!,
      moduleCode: row.moduleCode!,
      title: row.title!,
      date: row.date!,
      time: row.time || '',
      venue: row.venue || '',
      durationMinutes: 0,
      confidence: row.confidence!,
      createdAt: new Date().toISOString(),
    }));
    const next = [...readManualAssessments(), ...newEntries];
    saveManualAssessments(next);
    setManualEntries(next);
    setImportRows(null);
    setBulkText('');
    setImportSaved(true);
  };

  const handleClearImport = () => {
    setBulkText('');
    setImportRows(null);
    setImportSaved(false);
  };

  const handleCreatePrepTasks = (entry: AssessmentCalendarEntry) => {
    const userId = user?.uid || profile?.uid || 'local-guest';
    const tasks = buildAssessmentPrepTasks(entry, todayIsoLocal(), userId);
    const result = savePrepTasksToLocal(tasks);
    const key = `${entry.moduleId}:${entry.assessmentId}`;
    const msg = result.added > 0
      ? `${result.added} prep task${result.added !== 1 ? 's' : ''} created`
      : 'Prep tasks already exist';
    setPrepTaskStatus((prev) => ({ ...prev, [key]: { msg, ok: result.added > 0 } }));
    setLocalTasksVersion((v) => v + 1);
  };

  const handleBulkCreatePrepTasks = () => {
    if (upcomingAssessmentsForProgress.length === 0) return;

    const userId = user?.uid || profile?.uid || 'local-guest';
    const tasks = buildPrepTasksForAssessments(upcomingAssessmentsForProgress, todayIsoLocal(), userId);
    const result = savePrepTasksToLocal(tasks);
    const msg = result.added > 0
      ? `${result.added} prep task(s) created`
      : 'All prep tasks already exist';
    setBulkPrepTaskStatus({ msg, ok: result.added > 0 });
    setLocalTasksVersion((v) => v + 1);
  };

  return (
    <div className="page-shell">
      <header className="mb-10 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 items-stretch">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] maroon-gradient text-white p-8 md:p-10 shadow-2xl shadow-stellenbosch-maroon/20"
        >
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_30%)]" />
          <div className="relative z-10">
            <p className="uppercase tracking-[0.35em] text-xs text-white/70 font-bold mb-4">{USER_ACADEMIC_PROFILE.institution}</p>
            <h1 className="font-display text-4xl md:text-6xl mb-3">Goeiedag, {greetingName}</h1>
            <p className="text-white/80 text-lg max-w-2xl">
              Your personalised {USER_ACADEMIC_PROFILE.programme} command centre: modules, marks, tasks, A2 pressure prep, mistake loops and AI study systems in one place.
            </p>
            {localFirstMode && <p className="mt-4 text-sm font-medium text-white/85">Local-first mode active on this device. Optional cloud sync can be added later.</p>}
            <div className="flex flex-wrap gap-3 mt-8">
              <HeroPill icon={<Target size={16} />} text={USER_ACADEMIC_PROFILE.academicGoal} />
              <HeroPill icon={<Mic2 size={16} />} text="Teach-aloud revision" />
              <HeroPill icon={<TimerReset size={16} />} text="Small-dose pressure simulation" />
            </div>
          </div>
        </motion.section>

        <section className="editorial-muted-panel p-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-bold tracking-[0.25em] uppercase text-slate-400">Today</p>
              <h2 className="font-display text-3xl text-stellenbosch-maroon">{today}</h2>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-stellenbosch-maroon">
              <Flame size={26} />
            </div>
          </div>
          <div className="space-y-3">
            {nightlyChecklist.slice(0, 4).map((item) => (
              <div key={item} className="flex items-start gap-3 bg-white/70 rounded-2xl p-3 border border-slate-100">
                <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-600">{item}</span>
              </div>
            ))}
          </div>
        </section>
      </header>

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex rounded-2xl border border-slate-100 bg-slate-50 p-1 gap-1">
          <button
            type="button"
            onClick={() => { writeDashboardViewMode('today'); setIsTodayMode(true); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${isTodayMode ? 'bg-stellenbosch-maroon text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Today Mode
          </button>
          <button
            type="button"
            onClick={() => { writeDashboardViewMode('full'); setIsTodayMode(false); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${!isTodayMode ? 'bg-stellenbosch-maroon text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Full Dashboard
          </button>
        </div>
        {isTodayMode && (
          <p className="text-xs text-slate-400">Today Mode shows only the sections you need for immediate study decisions.</p>
        )}
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-10">
        <MetricCard icon={<BookOpen />} label="Active modules" value={modules.length} note="S1 + S2 shells" />
        <MetricCard icon={<LineChart />} label="Avg confidence" value={`${avgConfidence}%`} note={readinessLabel(avgConfidence)} tone={riskTone(avgConfidence)} />
        <MetricCard icon={<CalendarClock />} label="Upcoming checks" value={nextAssessments.length} note="Current assessment signals" />
        <MetricCard icon={<BrainCircuit />} label="AI outputs saved" value={stats.summaries} note={`${stats.sessions * 25} study mins logged`} />
        <MetricCard icon={<Target />} label="Topic tracker" value={urgentTopics} note={`${topicConfidence}% avg • ${retestsThisWeek} due`} tone={urgentTopics > 0 ? 'bg-amber-50 text-amber-800 border-amber-100' : undefined} />
        <MetricCard icon={<ListChecks />} label="Mistake bank" value={unresolvedMistakeCount} note={`${mistakeRetests} due • ${topMistakeModule?.moduleName || 'No hotspot'}${incompleteRuleCount > 0 ? ` • ${incompleteRuleCount} need rules` : ''}`} tone={unresolvedMistakeCount > 0 ? 'bg-red-50 text-red-800 border-red-100' : undefined} />
      </section>

      {(backupAgeDays === null || backupAgeDays > 7) && (
        <div className="mb-10 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              {backupAgeDays === null ? 'No backup on record.' : `Last backup was ${backupAgeDays} day${backupAgeDays === 1 ? '' : 's'} ago.`}
            </p>
            <p className="text-sm text-amber-800 mt-1">
              Your StudyOS data is stored locally.{' '}
              <Link to="/settings" className="underline font-medium">Create a backup</Link> before clearing browser data or switching devices.
            </p>
          </div>
        </div>
      )}

      <section className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-stellenbosch-maroon/5 text-stellenbosch-maroon flex items-center justify-center shrink-0">
            <CalendarClock size={22} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">upcoming</p>
            <h2 className="font-display text-3xl text-stellenbosch-maroon">Next Assessment</h2>
          </div>
        </div>
        {nextAssessment ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-stellenbosch-maroon/5 text-stellenbosch-maroon rounded-full px-2 py-1">
                    {nextAssessment.entry.moduleCode}
                  </span>
                  {nextAssessment.entry.confidence === 'provisional' && (
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-50 text-amber-800 border border-amber-100 rounded-full px-2 py-1">
                      Provisional
                    </span>
                  )}
                </div>
                <p className="font-bold text-slate-800">{nextAssessment.entry.title}</p>
                <p className="text-sm text-slate-500 mt-1">
                  {new Date(`${nextAssessment.entry.date}T00:00:00`).toLocaleDateString('en-ZA', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })}
                  {nextAssessment.entry.time ? ` • ${nextAssessment.entry.time}` : ''}
                </p>
                {nextAssessment.entry.venue && (
                  <p className="text-xs text-slate-400 mt-1">{nextAssessment.entry.venue}</p>
                )}
                {nextAssessment.entry.confidence === 'provisional' && (
                  <p className="text-xs text-amber-700 font-medium mt-2">Provisional — verify on official timetable.</p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCreatePrepTasks(nextAssessment.entry)}
                    className="px-3 py-1.5 rounded-xl maroon-gradient text-white text-xs font-bold hover:scale-[1.01] transition-transform"
                  >
                    Create prep tasks
                  </button>
                  {prepTaskStatus[`${nextAssessment.entry.moduleId}:${nextAssessment.entry.assessmentId}`] && (
                    <span className={`text-xs font-medium ${prepTaskStatus[`${nextAssessment.entry.moduleId}:${nextAssessment.entry.assessmentId}`].ok ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {prepTaskStatus[`${nextAssessment.entry.moduleId}:${nextAssessment.entry.assessmentId}`].msg}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display text-4xl text-stellenbosch-maroon">{countdownLabel(nextAssessment.daysFromNow)}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No upcoming assessments found in the saved calendar.</p>
        )}
      </section>

      <section className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm mb-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-stellenbosch-maroon/5 text-stellenbosch-maroon flex items-center justify-center shrink-0">
              <GraduationCap size={22} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">exam readiness</p>
              <h2 className="font-display text-3xl text-stellenbosch-maroon">Assessment Prep Progress</h2>
            </div>
          </div>
          <div className="flex flex-col items-start gap-1.5 md:items-end">
            <button
              type="button"
              onClick={handleBulkCreatePrepTasks}
              disabled={upcomingAssessmentsForProgress.length === 0}
              className="rounded-xl border border-stellenbosch-maroon/15 bg-stellenbosch-maroon px-3 py-2 text-left text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              Create missing prep tasks for all upcoming assessments
            </button>
            {bulkPrepTaskStatus && (
              <span className={`text-xs font-medium ${bulkPrepTaskStatus.ok ? 'text-emerald-700' : 'text-slate-500'}`}>
                {bulkPrepTaskStatus.msg}
              </span>
            )}
          </div>
        </div>
        {upcomingAssessmentsForProgress.length === 0 ? (
          <p className="text-sm text-slate-500">No upcoming assessments found. Add assessments in the Semester Assessment Calendar below.</p>
        ) : (
          <div className="space-y-2">
            {upcomingAssessmentsForProgress.map((entry) => {
              const progress = getAssessmentPrepProgress(entry, prepProgressTasks);
              const daysFromNow = Math.round(
                (new Date(`${entry.date}T00:00:00`).getTime() - new Date(`${todayIsoLocal()}T00:00:00`).getTime()) / 86400000,
              );
              return (
                <div key={`${entry.moduleId}:${entry.assessmentId}:${entry.date}`} className="rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider bg-stellenbosch-maroon/5 text-stellenbosch-maroon rounded-full px-2 py-0.5">
                          {entry.moduleCode}
                        </span>
                        {entry.confidence === 'provisional' && (
                          <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-50 text-amber-800 border border-amber-100 rounded-full px-2 py-0.5">
                            Provisional
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-sm text-slate-800">{entry.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {entry.date}{entry.time ? ` • ${entry.time}` : ''} — {countdownLabel(daysFromNow)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-xs font-bold ${progress.allComplete ? 'text-emerald-700' : 'text-slate-600'}`}>
                        {progress.completedCount}/{progress.totalExpected} complete
                      </span>
                      {progress.allComplete ? (
                        <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full px-2 py-0.5">
                          Prepared
                        </span>
                      ) : progress.allExist ? (
                        <span className="text-[10px] text-slate-400 font-medium">Prep tasks ready</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleCreatePrepTasks(entry)}
                          className="text-xs font-bold text-stellenbosch-maroon hover:opacity-75 transition-opacity"
                        >
                          {progress.existingCount === 0 ? 'Create prep tasks' : 'Create missing'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm mb-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-stellenbosch-maroon/5 text-stellenbosch-maroon flex items-center justify-center shrink-0">
              <ListChecks size={22} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">task queue</p>
              <h2 className="font-display text-3xl text-stellenbosch-maroon">Today / This Week Study Queue</h2>
            </div>
          </div>
          <Link to="/tasks" className="inline-flex items-center gap-2 self-start rounded-2xl border border-stellenbosch-maroon/15 bg-white px-4 py-3 text-sm font-bold text-stellenbosch-maroon transition-all hover:-translate-y-0.5 hover:shadow">
            Open Tasks <ArrowRight size={16} />
          </Link>
        </div>
        {studyQueue.hasUrgentTasks ? (
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
            <StudyQueueGroup title="Overdue" tone="warning" tasks={studyQueue.overdue} />
            <StudyQueueGroup title="Due today" tone="today" tasks={studyQueue.today} />
            <StudyQueueGroup title="Due this week" tone="week" tasks={studyQueue.thisWeek} />
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-5">
            <p className="font-bold text-emerald-900">No urgent study tasks due today.</p>
            <p className="mt-1 text-sm text-emerald-700">Your due-date queue is clear for now.</p>
          </div>
        )}
      </section>

      {!isTodayMode && (
      <section className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-stellenbosch-maroon/5 text-stellenbosch-maroon flex items-center justify-center shrink-0">
            <CalendarDays size={22} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">local-first</p>
            <h2 className="font-display text-3xl text-stellenbosch-maroon">Semester Assessment Calendar</h2>
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400 mb-3">Add a Semester 2 assessment</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">Module</span>
              <select
                value={newModuleId}
                onChange={(e) => setNewModuleId(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20"
              >
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>{m.code} — {m.shortName}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">Confidence</span>
              <select
                value={newConfidence}
                onChange={(e) => setNewConfidence(e.target.value as 'high' | 'provisional')}
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20"
              >
                <option value="high">Confirmed</option>
                <option value="provisional">Provisional</option>
              </select>
            </label>
          </div>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Assessment title *"
            className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">Date *</span>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20"
              />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">Time (optional)</span>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20"
              />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">Venue (optional)</span>
              <input
                value={newVenue}
                onChange={(e) => setNewVenue(e.target.value)}
                placeholder="e.g. Edu 1003"
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={handleAddManual}
            disabled={!newTitle.trim() || !isValidIsoDateString(newDate)}
            className="px-4 py-2 rounded-xl maroon-gradient text-white text-xs font-bold disabled:opacity-40 hover:scale-[1.01] transition-transform"
          >
            Add assessment
          </button>
        </div>

        <div className="mb-5 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400 mb-1">Bulk paste import</p>
          <p className="text-[10px] text-slate-400 mb-3">
            Format: <code className="bg-white border border-slate-200 rounded px-1">MODULE | TITLE | DATE | TIME | VENUE | CONFIDENCE</code> — one per line.
            MODULE accepts code, id, or name. DATE must be YYYY-MM-DD. CONFIDENCE: confirmed / provisional (default: provisional). Lines starting with # are ignored.
          </p>
          <textarea
            value={bulkText}
            onChange={(e) => { setBulkText(e.target.value); setImportRows(null); setImportSaved(false); }}
            placeholder={`CON178 | A1S2 | 2026-10-01 | 17:00 | TBC | confirmed\nFA178 | A1S2 | 2026-09-03 | 17:30 | TBC | provisional`}
            rows={4}
            className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm font-mono mb-3 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20 resize-y"
          />
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              type="button"
              onClick={handlePreviewImport}
              disabled={!bulkText.trim()}
              className="px-4 py-2 rounded-xl maroon-gradient text-white text-xs font-bold disabled:opacity-40 hover:scale-[1.01] transition-transform"
            >
              Preview import
            </button>
            {(importRows !== null || bulkText || importSaved) && (
              <button
                type="button"
                onClick={handleClearImport}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:scale-[1.01] transition-transform"
              >
                Clear
              </button>
            )}
          </div>

          {importSaved && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
              Entries saved to your assessment calendar.
            </div>
          )}

          {importRows !== null && importRows.length === 0 && (
            <p className="text-xs text-slate-500">No data lines found — paste assessment rows in the format above.</p>
          )}

          {importRows !== null && importRows.length > 0 && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">
                  Preview — {importRows.filter((r) => r.status === 'valid').length} valid
                  {importRows.filter((r) => r.status === 'error').length > 0 && ` • ${importRows.filter((r) => r.status === 'error').length} invalid`}
                  {importRows.filter((r) => r.status === 'duplicate-existing' || r.status === 'duplicate-batch').length > 0 && ` • ${importRows.filter((r) => r.status === 'duplicate-existing' || r.status === 'duplicate-batch').length} duplicate`}
                </p>
                <button
                  type="button"
                  onClick={handleSaveImport}
                  disabled={importRows.filter((r) => r.status === 'valid').length === 0}
                  className="px-3 py-1.5 rounded-xl maroon-gradient text-white text-xs font-bold disabled:opacity-40 hover:scale-[1.01] transition-transform"
                >
                  Save valid entries
                </button>
              </div>
              <div className="space-y-1.5">
                {importRows.map((row, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border px-3 py-2 text-xs ${
                      row.status === 'valid'
                        ? 'border-emerald-100 bg-emerald-50'
                        : row.status === 'error'
                          ? 'border-red-100 bg-red-50'
                          : 'border-amber-100 bg-amber-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`shrink-0 font-bold ${row.status === 'valid' ? 'text-emerald-700' : row.status === 'error' ? 'text-red-700' : 'text-amber-700'}`}>
                        {row.status === 'valid' ? '✓' : row.status === 'error' ? '✗' : '⚠'}
                      </span>
                      <div className="flex-1 min-w-0">
                        {row.status === 'valid' ? (
                          <span className="text-emerald-800">
                            <span className="font-bold">{row.moduleCode}</span>{' '}—{' '}{row.title}{' '}—{' '}{row.date}
                            {row.time ? ` • ${row.time}` : ''}
                            {row.venue ? ` • ${row.venue}` : ''}
                            {' '}—{' '}<span className="capitalize">{row.confidence === 'high' ? 'confirmed' : 'provisional'}</span>
                          </span>
                        ) : (
                          <div>
                            <span className={row.status === 'error' ? 'text-red-700' : 'text-amber-700'}>
                              {row.errors.join(' ')}
                            </span>
                            <p className="font-mono opacity-50 truncate mt-0.5">{row.raw}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {manualEntries.length === 0 ? (
          <p className="text-sm text-slate-500">No manual assessments added yet.</p>
        ) : (
          <div className="space-y-2">
            {manualEntries.map((entry) => {
              const entryModule = modules.find((m) => m.id === entry.moduleId);
              return (
                <div key={entry.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-stellenbosch-maroon/5 text-stellenbosch-maroon rounded-full px-2 py-0.5">
                        {entry.moduleCode || entryModule?.code}
                      </span>
                      {entry.confidence === 'provisional' ? (
                        <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-50 text-amber-800 border border-amber-100 rounded-full px-2 py-0.5">
                          Provisional
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full px-2 py-0.5">
                          Confirmed
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-sm text-slate-800">{entry.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {entry.date}
                      {entry.time ? ` • ${entry.time}` : ''}
                      {entry.venue ? ` • ${entry.venue}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCreatePrepTasks(toAssessmentCalendarEntry(entry))}
                      className="text-xs font-bold text-stellenbosch-maroon hover:opacity-75 transition-opacity"
                    >
                      Create prep tasks
                    </button>
                    {prepTaskStatus[`${entry.moduleId}:${entry.id}`] && (
                      <span className={`text-[10px] font-medium ${prepTaskStatus[`${entry.moduleId}:${entry.id}`].ok ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {prepTaskStatus[`${entry.moduleId}:${entry.id}`].msg}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteManual(entry.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors text-xs font-bold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      )}

      <section className="editorial-panel mb-10 p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-slate-400">semester control room</p>
            <h2 className="font-display text-3xl text-stellenbosch-maroon">Weekly Review</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Your next recovery and setup priorities from tasks, marks, mistakes, deadlines, and backups.
            </p>
          </div>
          <Link to="/tasks" className="inline-flex items-center gap-2 self-start rounded-2xl border border-stellenbosch-maroon/15 bg-white px-4 py-3 text-sm font-bold text-stellenbosch-maroon transition-all hover:-translate-y-0.5 hover:shadow">
            Open tasks <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <WeeklyReviewMetric
            icon={<CalendarClock size={18} />}
            label="Urgent academic items"
            value={overdueTasks.length + dueSoonTasks.length + provisionalCalendarEntries.length}
            detail={`${overdueTasks.length} overdue • ${dueSoonTasks.length} due soon • ${provisionalCalendarEntries.length} provisional`}
            tone={overdueTasks.length > 0 ? 'red' : dueSoonTasks.length > 0 || provisionalCalendarEntries.length > 0 ? 'amber' : 'emerald'}
          />
          <WeeklyReviewMetric
            icon={<LineChart size={18} />}
            label="Marks pressure"
            value={missingMarks.length + (marksPressure.modulesBelowTarget || 0)}
            detail={`${missingMarks.length} missing marks • ${marksPressure.modulesBelowTarget} below target`}
            tone={marksPressure.modulesBelowTarget > 0 ? 'red' : missingMarks.length > 0 ? 'amber' : 'emerald'}
          />
          <WeeklyReviewMetric
            icon={<ListChecks size={18} />}
            label="Mistake recovery"
            value={unresolvedMistakeCount}
            detail={`${mistakeRetests} due soon • ${incompleteRuleCount} need rules`}
            tone={mistakeRetests > 0 || incompleteRuleCount > 0 ? 'amber' : unresolvedMistakeCount > 0 ? 'blue' : 'emerald'}
          />
          <WeeklyReviewMetric
            icon={<ShieldAlert size={18} />}
            label="Local-first safety"
            value={backupAgeDays === null ? 'No backup' : `${backupAgeDays}d`}
            detail={backupAgeDays === null || backupAgeDays > 7 ? 'Create a backup before clearing data' : 'Backup is recent'}
            tone={backupAgeDays === null || backupAgeDays > 7 ? 'amber' : 'emerald'}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-stellenbosch-maroon/5 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Rule-based checklist</p>
                <h3 className="font-display text-2xl text-slate-800">Suggested next actions</h3>
              </div>
              <span className="rounded-full bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 shadow-sm">
                {weeklyReviewActions.length || 'clear'}
              </span>
            </div>
            {weeklyReviewActions.length === 0 ? (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4">
                <p className="font-bold text-emerald-900">No urgent weekly setup flags right now.</p>
                <p className="mt-1 text-sm text-emerald-700">Keep the rhythm gentle: one task, one review loop, one backup habit.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {weeklyReviewActions.map((action) => (
                  <WeeklyReviewActionCard key={`${action.title}-${action.to}`} action={action} />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-slate-100 bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">What this checks</p>
            <h3 className="mt-2 font-display text-2xl text-slate-800">Local-first signals only</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />Tasks due soon and overdue from your local task bank.</p>
              <p className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />Marks pressure and verification flags from existing marks/module helpers.</p>
              <p className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />Mistake recovery from unresolved mistakes, retests, and correction-rule gaps.</p>
              <p className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />Backup age from the existing local backup metadata.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-panel mb-10 p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-slate-400">today&apos;s focus garden</p>
            <h2 className="font-display text-3xl text-stellenbosch-maroon">Today&apos;s Study Growth</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">A calm snapshot of the focus sessions you&apos;ve already banked today, pulled straight from your existing local timer history.</p>
          </div>
          <Link to="/timer" className="inline-flex items-center gap-2 self-start rounded-2xl border border-stellenbosch-maroon/15 bg-stellenbosch-maroon px-4 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow">
            Open Timer <ArrowRight size={16} />
          </Link>
        </div>

        {todaysFocusSessions.length === 0 ? (
          <div className="mt-6 rounded-[2rem] border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white px-6 py-8 text-center">
            <p className="font-display text-2xl text-slate-700">No plants yet today — start one tiny session.</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <GardenMetric label="Focus minutes today" value={`${todaysFocusMinutes}`} detail="Completed sessions only" />
              <GardenMetric label="Completed sessions" value={`${todaysFocusSessions.length}`} detail="Banked today" />
              <GardenMetric
                label="Most studied module"
                value={todaysTopModule?.moduleName ?? 'General study'}
                detail={todaysTopModule ? `${todaysTopModule.minutes} focused minutes` : 'No single module lead yet'}
              />
            </div>

            <div className="rounded-[2rem] border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Plant row</p>
                  <h3 className="font-display text-2xl text-slate-800">Today&apos;s completed sessions</h3>
                </div>
                <div className="rounded-full bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 shadow-sm">
                  {todaysFocusSessions.length} plants
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {todaysFocusSessions.slice(0, 8).map((session) => (
                  <TinyGardenPlant
                    key={session.id}
                    moduleName={session.moduleName}
                    durationMinutes={session.durationMinutes}
                    tone={modulePlantTone(session.moduleId)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {!isTodayMode && (<>
      <section className="editorial-panel mb-10 p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-slate-400">weekly momentum</p>
            <h2 className="font-display text-3xl text-stellenbosch-maroon">Study Streak</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              A calm view of your recent study consistency, built from completed focus sessions already saved in your timer history.
            </p>
          </div>
          <div className="self-start rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            {studyMomentum.label}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[0.88fr_1.12fr]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <GardenMetric
              label="Current streak"
              value={`${studyMomentum.currentStreak} day${studyMomentum.currentStreak === 1 ? '' : 's'}`}
              detail={studyMomentum.needsSessionToday ? 'Need one session today to keep it alive' : studyMomentum.todayMinutes > 0 ? 'Active today' : 'Start gently today'}
            />
            <GardenMetric
              label="Best streak"
              value={`${studyMomentum.bestStreak} day${studyMomentum.bestStreak === 1 ? '' : 's'}`}
              detail="Computed from your saved timer history"
            />
            <GardenMetric
              label="Last 7 days"
              value={`${studyMomentum.totalLast7DaysMinutes} mins`}
              detail={studyMomentum.todayMinutes > 0 ? `${studyMomentum.todayMinutes} mins today` : 'No focus minutes logged today yet'}
            />
          </div>

          <div className="rounded-[2rem] border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-stellenbosch-maroon/5 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">7-day heat strip</p>
                <h3 className="font-display text-2xl text-slate-800">Recent study rhythm</h3>
              </div>
              <div className="rounded-full bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 shadow-sm">
                {studyMomentum.totalLast7DaysMinutes} mins
              </div>
            </div>
            <div className="grid grid-cols-7 gap-3">
              {studyMomentum.last7Days.map((day) => {
                const height = day.minutes > 0 ? Math.max(16, Math.round((day.minutes / maxMomentumMinutes) * 72)) : 10;
                return (
                  <div key={day.key} className="flex flex-col items-center gap-3">
                    <div className="flex h-24 w-full items-end justify-center rounded-2xl bg-slate-100/80 px-2 py-3">
                      <div
                        className={`w-full rounded-xl transition-all ${day.hasStudy ? 'bg-gradient-to-t from-stellenbosch-maroon via-rose-500 to-amber-300 shadow-sm' : 'bg-slate-200'}`}
                        style={{ height }}
                        title={`${day.label}: ${day.minutes} minutes`}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{day.label}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-600">{day.minutes}m</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-panel mb-10 p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-slate-400">academic status overlay</p>
            <h2 className="font-display text-3xl text-stellenbosch-maroon">Latest Academic Snapshot</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">A quick local-first overlay of your latest imported SUNLearn-style academic position, kept separate from marks-engine calculations.</p>
          </div>
          <Link to="/settings#academic-snapshot" className="inline-flex items-center gap-2 self-start rounded-2xl border border-stellenbosch-maroon/15 bg-white px-4 py-3 text-sm font-bold text-stellenbosch-maroon transition-all hover:-translate-y-0.5 hover:shadow">
            Open snapshot import <ArrowRight size={16} />
          </Link>
        </div>

        {!latestAcademicSnapshot || !latestAcademicSummary ? (
          <div className="mt-6 rounded-[2rem] border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white px-6 py-8 text-center">
            <p className="font-display text-2xl text-slate-700">No academic snapshot imported yet.</p>
            <p className="mt-2 text-sm text-slate-500">Paste a structured snapshot in Settings when you want the Dashboard to reflect your current academic status overlay.</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <GardenMetric label="Modules updated" value={`${latestAcademicSummary.modulesUpdated}`} detail={latestAcademicSnapshot.sourceLabel} />
              <GardenMetric label="Urgent actions" value={`${latestAcademicSummary.urgentActionCount}`} detail="Urgent-priority items captured" />
              <GardenMetric label="Most urgent" value={latestAcademicSummary.mostUrgentModule ?? 'None'} detail={latestAcademicSummary.mostUrgentAction ?? 'No urgent action captured'} />
            </div>

            <div className="rounded-[2rem] border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-red-50/50 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Overlay notes</p>
                  <h3 className="font-display text-2xl text-slate-800">Imported snapshot highlights</h3>
                </div>
                <div className="rounded-full bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 shadow-sm">
                  {new Date(latestAcademicSnapshot.createdAt).toLocaleDateString('en-ZA')}
                </div>
              </div>
              <div className="space-y-3">
                {latestAcademicSnapshot.notes.slice(0, 2).map((note) => (
                  <div key={note} className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-600">
                    {note}
                  </div>
                ))}
                {latestAcademicSnapshot.globalActions.slice(0, 2).map((action) => (
                  <div key={`${action.title}-${action.moduleCode || 'global'}`} className="rounded-2xl border border-red-100 bg-red-50/70 px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-red-100 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-700">
                        {action.priority}
                      </span>
                      {action.moduleCode && (
                        <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {action.moduleCode}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 font-semibold text-slate-800">{action.title}</p>
                    {action.detail && <p className="mt-1 text-sm text-slate-600">{action.detail}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
      </>)}

      <section className="editorial-panel mb-10 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-stellenbosch-maroon text-white flex items-center justify-center shrink-0">
            <Zap size={20} />
          </div>
          <div>
            <p className="uppercase tracking-[0.35em] text-xs text-slate-400 font-bold">daily focus</p>
            <h2 className="font-display text-3xl text-stellenbosch-maroon">Today's Battle Plan</h2>
          </div>
        </div>
        {battlePlan.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-8">
            <p className="font-bold text-slate-800">No battle plan yet — add marks, topics, mistakes, or assessments to unlock daily priorities.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {battlePlan.map((action) => (
              <BattlePlanItem key={action.id} action={action} />
            ))}
          </div>
        )}
      </section>

      {!isTodayMode && (<>
      <section className="editorial-panel mb-10 p-7">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <p className="uppercase tracking-[0.35em] text-xs text-slate-400 font-bold mb-3">visual progress snapshot</p>
            <h2 className="font-display text-3xl text-stellenbosch-maroon">Progress at a glance</h2>
            <p className="text-slate-500 text-sm">A lightweight, ADHD-friendly view of overall study momentum, topic progress, mistake cleanup, planner flow, and your next small win.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ProgressBadge value={overallStudyProgress} label="Overall" tone="maroon" />
            <ProgressBadge value={topicProgress} label="Topics" tone="maroon" />
            <ProgressBadge value={mistakeResolutionProgress} label="Mistakes" tone="emerald" />
            <ProgressBadge value={taskProgress} label="Tasks" tone="amber" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="rounded-3xl bg-slate-50/80 border border-slate-100 p-5">
              <ProgressRing
                value={overallStudyProgress}
                label="Overall study progress"
                helper={nextSmallWin ? `Next small win: ${nextSmallWin.title}` : 'Add tracked topics, mistakes, tasks, or planner items to grow this score'}
                tone="maroon"
              />
            </div>
            <div className="rounded-3xl bg-slate-50/80 border border-slate-100 p-5">
              <ProgressRing
                value={topicProgress}
                label="Topic mastery progress"
                helper={topicRecords.length ? `${topicRecords.length} tracked topics` : 'No tracked topics yet'}
                tone="maroon"
              />
            </div>
            <div className="rounded-3xl bg-slate-50/80 border border-slate-100 p-5 sm:col-span-2">
              <ProgressRing
                value={focusModuleReadiness}
                label={`${focusModule.shortName} readiness`}
                helper={topMistakeModule ? `Focus hotspot: ${topMistakeModule.moduleName}` : 'Uses current confidence plus tracked study progress'}
                tone="amber"
              />
            </div>
          </div>

          <div className="rounded-3xl bg-slate-50/80 border border-slate-100 p-5 space-y-5">
            <ProgressBar
              value={mistakeResolutionProgress}
              label="Mistake resolution"
              helper={mistakeRecords.length ? `${unresolvedMistakeCount} unresolved mistakes still open` : 'Start logging mistakes to see this move'}
              tone="emerald"
            />
            <ProgressBar
              value={taskProgress}
              label="Task completion"
              helper={localTasks.length ? `${stats.completedTasks} of ${localTasks.length} local tasks completed` : 'Add a few concrete tasks to build momentum'}
              tone="amber"
            />
            <ProgressBar
              value={plannerProgress}
              label="Planner progress"
              helper={plannerProgress > 0 ? 'Derived from saved planner state where available' : 'No saved planner progress yet'}
              tone="slate"
            />
            <ProgressBar
              value={focusModuleReadiness}
              label={`${focusModule.shortName} readiness`}
              helper={focusModule.weakPoints[0] || 'Module-specific readiness uses existing topic, task, and mistake signals'}
              tone="maroon"
              size="lg"
            />
            <div className="rounded-2xl bg-white border border-slate-100 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Next small win</p>
              {nextSmallWin ? (
                <>
                  <p className="font-bold text-slate-800">{nextSmallWin.title}</p>
                  <p className="text-sm text-slate-500 mt-1">{nextSmallWin.reason}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <ProgressBadge value={Math.max(20, 100 - nextSmallWin.estimatedMinutes)} label={`${nextSmallWin.estimatedMinutes} min`} tone="amber" />
                    <ProgressBadge value={nextSmallWin.priority === 'urgent' ? 100 : nextSmallWin.priority === 'high' ? 80 : nextSmallWin.priority === 'medium' ? 60 : 40} label={nextSmallWin.priority} tone="slate" />
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500">No next action yet. Add more local progress data for sharper suggestions.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-8 mb-10">
        <section className="glass p-7 rounded-[2.5rem] shadow-sm border-slate-200/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-3xl text-stellenbosch-maroon">A2 Risk Radar</h2>
              <p className="text-slate-500 text-sm">Sorted by closest pressure point and known weak spots.</p>
            </div>
            <Link to="/modules" className="hidden sm:flex items-center gap-2 text-sm font-bold text-stellenbosch-maroon hover:underline">
              Open modules <ArrowRight size={16} />
            </Link>
          </div>
          <div className="space-y-4">
            {weakestModules.map((module) => {
              const Icon = module.icon;
              const effectiveConfidence = getEffectiveModuleConfidence(module);
              const score = priorityScore(effectiveConfidence, module.target);
              return (
                <div key={module.id} className="bg-white/80 rounded-3xl p-5 border border-slate-100 hover:border-stellenbosch-maroon/20 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${module.colour} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-800">{module.shortName}</h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 rounded-full px-2 py-1">{module.code}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider border rounded-full px-2 py-1 ${riskTone(effectiveConfidence)}`}>{readinessLabel(effectiveConfidence)}</span>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2">{module.weakPoints.slice(0, 3).join(' • ')}</p>
                    </div>
                    <div className="md:text-right">
                      <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Priority</p>
                      <p className="text-3xl font-display text-stellenbosch-maroon">{score}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 className="font-display text-3xl text-stellenbosch-maroon">Deadline Radar</h2>
              <p className="text-slate-500 text-sm">A2 + evidence-sensitive items.</p>
            </div>
          </div>
          <div className="space-y-3">
            {nextAssessments.map((assessment) => (
              <div key={`${assessment.module.id}-${assessment.title}`} className="rounded-2xl border border-slate-100 p-4 bg-slate-50/70">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-800">{assessment.module.shortName}: {assessment.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{assessment.date}{assessment.time ? ` • ${assessment.time}` : ''}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-wider font-bold">
                      {assessment.venue && (
                        <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-slate-600">
                          {assessment.venue}
                        </span>
                      )}
                      {assessment.confidence === 'provisional' ? (
                        <span className="rounded-full border border-amber-100 bg-amber-50 px-2 py-1 text-amber-800">
                          Venue provisional
                        </span>
                      ) : assessment.confidence === 'high' ? (
                        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-emerald-800">
                          Verified timetable
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full bg-white text-stellenbosch-maroon border border-stellenbosch-maroon/10">{assessment.status}</span>
                </div>
                {assessment.durationMinutes && (
                  <p className="text-xs text-slate-500 mt-2">
                    Duration: {Math.round(assessment.durationMinutes / 60)}h{assessment.durationMinutes % 60 ? ` ${assessment.durationMinutes % 60}m` : ''}
                  </p>
                )}
                {assessment.notes && <p className="text-xs text-slate-500 mt-2">{assessment.notes}</p>}
              </div>
            ))}
            {nextAssessments.length === 0 && (
              <p className="text-sm text-slate-500">No upcoming assessments found in module data.</p>
            )}
          </div>
          {provisionalCalendarEntries.length > 0 && (
            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 flex items-start gap-3">
              <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800">
                <span className="font-bold">Verify provisional details:</span>{' '}
                {provisionalCalendarEntries.map((e) => `${e.moduleCode} ${e.assessmentId}`).join(', ')} — venue or time was inferred from the timetable. Confirm against the official SU timetable before the assessment.
              </p>
            </div>
          )}
        </section>
      </div>
      </>)}

      <section className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm mb-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div>
            <p className="uppercase tracking-[0.35em] text-xs text-slate-400 font-bold mb-3">marks pressure</p>
            <h2 className="font-display text-3xl text-stellenbosch-maroon">Marks-at-Risk</h2>
            <p className="text-slate-500 text-sm">A compact snapshot of modules sitting below their current overall goal, using your saved Marks page data only.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ProgressBadge
              value={marksPressure.hasAnyMarkData ? Math.min(100, marksPressure.modulesBelowTarget * 20) : 0}
              label={marksPressure.hasAnyMarkData ? `${marksPressure.modulesBelowTarget} below target` : 'No mark data yet'}
              tone={marksPressure.modulesBelowTarget > 0 ? 'amber' : 'emerald'}
            />
            {marksPressure.mostAtRisk && (
              <ProgressBadge
                value={marksPressure.mostAtRisk.pressureScore}
                label={`${marksPressure.mostAtRisk.moduleCode} pressure`}
                tone={marksPressure.mostAtRisk.needsHighRecovery ? 'amber' : 'maroon'}
              />
            )}
          </div>
        </div>

        {!marksPressure.hasAnyMarkData ? (
          <div className="mt-5 rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-8">
            <p className="font-bold text-slate-800">No mark data yet — visit Marks to enter results.</p>
            <p className="text-sm text-slate-500 mt-2">The Dashboard will surface below-target pressure and recovery warnings once a live marks snapshot exists.</p>
            <Link to="/marks" className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-stellenbosch-maroon px-4 py-3 text-sm font-bold text-white hover:-translate-y-0.5 transition-transform">
              Open Marks <ArrowRight size={16} />
            </Link>
          </div>
        ) : marksPressure.mostAtRisk ? (
          <div className="mt-5 grid grid-cols-1 xl:grid-cols-[0.85fr_1.15fr] gap-5">
            <div className="rounded-3xl bg-slate-50/80 border border-slate-100 p-5">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Most at risk</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">{marksPressure.mostAtRisk.moduleName}</p>
                  <p className="text-xs text-slate-500 mt-1">{marksPressure.mostAtRisk.moduleCode}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider rounded-full px-2 py-1 bg-white text-slate-600 border border-slate-100">
                  Target {marksPressure.mostAtRisk.targetMark}%
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider rounded-full px-2 py-1 bg-white text-slate-600 border border-slate-100">
                  {marksPressure.mostAtRisk.currentFinal === null ? 'No current final yet' : `Current path ${Math.round(marksPressure.mostAtRisk.currentFinal)}%`}
                </span>
                {!marksPressure.mostAtRisk.isValidFM && (
                  <span className="text-[10px] uppercase font-bold tracking-wider rounded-full px-2 py-1 bg-amber-50 text-amber-800 border border-amber-100">
                    Final path not yet valid
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-50/80 border border-slate-100 p-5 space-y-4">
              <ProgressBar
                value={marksPressure.mostAtRisk.pressureScore}
                label="Recovery pressure"
                helper={
                  marksPressure.mostAtRisk.currentFinal === null
                    ? 'A marks snapshot exists, but there is not enough completed data yet to compare against the saved goal.'
                    : `${Math.round(marksPressure.mostAtRisk.currentFinal)}% against a ${marksPressure.mostAtRisk.targetMark}% goal on the current marks path.`
                }
                tone={marksPressure.mostAtRisk.needsHighRecovery ? 'amber' : 'maroon'}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white border border-slate-100 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Pressure summary</p>
                  <p className="font-bold text-slate-800">
                    {marksPressure.modulesBelowTarget === 0
                      ? 'No saved modules are currently below target.'
                      : `${marksPressure.modulesBelowTarget} module${marksPressure.modulesBelowTarget === 1 ? '' : 's'} currently sit below the saved overall goal.`}
                  </p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-100 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Recovery note</p>
                  <p className="font-bold text-slate-800">
                    {marksPressure.mostAtRisk.needsHighRecovery
                      ? 'This module may need a very high next or remaining mark to recover.'
                      : 'Pressure is present, but the current path still looks recoverable.'}
                  </p>
                </div>
              </div>
              {marksPressure.mostAtRisk.warnings.length > 0 && (
                <div className="rounded-2xl bg-white border border-slate-100 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Warnings from Marks</p>
                  <p className="text-sm text-slate-500">{marksPressure.mostAtRisk.warnings[0]}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-8">
            <p className="font-bold text-slate-800">No below-target pressure found in the current snapshot.</p>
            <p className="text-sm text-slate-500 mt-2">Marks data exists, but nothing is currently surfacing as the highest-risk recovery case.</p>
          </div>
        )}
      </section>

      {!isTodayMode && (<>
      <section className="bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-sm mb-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-6">
          <div>
            <p className="uppercase tracking-[0.35em] text-xs text-slate-400 font-bold mb-3">local-first action engine</p>
            <h2 className="font-display text-3xl text-stellenbosch-maroon">Next Best Action</h2>
            <p className="text-slate-500 text-sm">Ranked from marks pressure, topic confidence, mistake loops, source gaps, and upcoming assessments.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['All', 'Urgent', 'Today', 'This week', 'Marks risk', 'Mistakes', 'Source gaps', 'Final Boss'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setActionFilter(item)}
                className={`px-4 py-2 rounded-2xl text-xs uppercase tracking-wider font-bold border ${actionFilter === item ? 'bg-stellenbosch-maroon text-white border-stellenbosch-maroon' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-stellenbosch-maroon/20'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="space-y-4">
            {filteredActions.map((action) => (
              <NextBestActionCard key={action.id} action={action} />
            ))}
            {filteredActions.length === 0 && (
              <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center">
                <p className="font-display text-2xl text-stellenbosch-maroon mb-2">No actions in this filter yet</p>
                <p className="text-slate-500">Try another filter or add more topic mastery, mistake, or marks data for sharper recommendations.</p>
              </div>
            )}
          </div>

          <div className="rounded-[2rem] bg-slate-50/70 border border-slate-100 p-5">
            <h3 className="font-bold text-slate-800 mb-4">Why these rose to the top</h3>
            <div className="space-y-3">
              {filteredActions.slice(0, 3).map((action) => (
                <div key={`${action.id}-why`} className="rounded-2xl bg-white border border-slate-100 p-4">
                  <p className="font-bold text-slate-800">{action.title}</p>
                  <p className="text-sm text-slate-500 mt-1">{action.reason}</p>
                  <div className="mt-3 space-y-2">
                    {action.evidence.slice(0, 2).map((factor) => (
                      <p key={`${action.id}-${factor.kind}`} className="text-xs text-slate-500">
                        <span className="font-bold text-slate-700">{labeliseFactor(factor.kind)}:</span> {factor.evidence}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
        <section className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 className="font-display text-2xl text-stellenbosch-maroon">High-risk modules</h2>
              <p className="text-sm text-slate-500">Confidence and assessment-rule flags combined.</p>
            </div>
          </div>
          <div className="space-y-3">
            {highRisk.map((module) => (
              <div key={module.id} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <p className="font-bold text-slate-800">{module.shortName}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {moduleFlags(module).slice(0, 3).map((flag) => (
                    <span key={flag.label} className={`text-[10px] uppercase font-bold tracking-wider border rounded-full px-2 py-1 ${flag.tone}`}>
                      {flag.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <GraduationCap size={22} />
            </div>
            <div>
              <h2 className="font-display text-2xl text-stellenbosch-maroon">Missing marks</h2>
              <p className="text-sm text-slate-500">Modules that still need current-mark data.</p>
            </div>
          </div>
          <div className="space-y-3">
            {missingMarks.map((module) => (
              <div key={module.id} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <p className="font-bold text-slate-800">{module.shortName}</p>
                <p className="text-sm text-slate-500 mt-1">{module.currentMarks.note || 'Current mark still missing.'}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h2 className="font-display text-2xl text-stellenbosch-maroon">Source warnings</h2>
              <p className="text-sm text-slate-500">Frameworks or source packs still incomplete.</p>
            </div>
          </div>
          <div className="space-y-3">
            {sourceWarnings.map((module) => (
              <div key={module.id} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <p className="font-bold text-slate-800">{module.shortName}</p>
                <p className="text-sm text-slate-500 mt-1">{module.sourceStatus.summary}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 glass rounded-[2.5rem] p-7 border-slate-200/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-3xl text-stellenbosch-maroon">Next Best Actions</h2>
              <p className="text-sm text-slate-500">Designed for an ADHD-friendly start: clear, finite, marked by points.</p>
            </div>
            <Link to="/tasks" className="text-sm font-bold text-stellenbosch-maroon hover:underline">Add tasks</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nextBestTasks.map((task) => {
              const module = modules.find((m) => m.id === task.moduleId);
              return (
                <div key={task.id} className="bg-white/80 rounded-3xl border border-slate-100 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-stellenbosch-maroon/5 text-stellenbosch-maroon rounded-full px-2 py-1">{module?.shortName || 'Personal'}</span>
                    <span className="text-xs font-mono text-slate-400">{task.minutes} min • {task.points} pts</span>
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">{task.title}</h3>
                  <p className="text-sm text-slate-500">{task.why}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-slate-950 rounded-[2.5rem] p-7 text-white shadow-2xl shadow-slate-950/20">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="text-stellenbosch-gold" />
            <h2 className="font-display text-3xl">Weekly Rhythm</h2>
          </div>
          <div className="space-y-4">
            {weeklyRhythm.slice(0, 5).map((item) => (
              <div key={item.day} className="border-l-2 border-stellenbosch-gold/60 pl-4">
                <p className="text-sm font-bold text-white">{item.day}: {item.focus}</p>
                <p className="text-xs text-white/60 mt-1">{item.detail}</p>
              </div>
            ))}
          </div>
          <Link to="/planner" className="mt-6 inline-flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-2xl text-sm font-bold hover:scale-105 transition-transform">
            Open planner <ArrowRight size={16} />
          </Link>
        </section>
      </div>
      </>)}
    </div>
  );
};

const HeroPill: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 text-sm text-white/90">
    {icon}
    {text}
  </span>
);

const NextBestActionCard: React.FC<{ action: NextBestAction }> = ({ action }) => (
  <div className="rounded-[2rem] border border-slate-100 bg-slate-50/70 p-5">
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-[10px] uppercase font-bold tracking-wider bg-stellenbosch-maroon/5 text-stellenbosch-maroon rounded-full px-2 py-1">{action.moduleCode}</span>
          <span className={`text-[10px] uppercase font-bold tracking-wider rounded-full px-2 py-1 ${priorityTone(action.priority)}`}>{action.priority}</span>
          <span className="text-[10px] uppercase font-bold tracking-wider rounded-full px-2 py-1 bg-white text-slate-500 border border-slate-100">{action.actionType}</span>
          {action.needsVerification && <span className="text-[10px] uppercase font-bold tracking-wider rounded-full px-2 py-1 bg-amber-50 text-amber-800 border border-amber-100">Needs verification</span>}
        </div>
        <h3 className="font-bold text-slate-800">{action.title}</h3>
        <p className="text-sm text-slate-500 mt-2">{action.reason}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 font-bold">
          <span className="px-2 py-1 rounded-full bg-white border border-slate-100">{action.confidenceRiskLabel}</span>
          <span className="px-2 py-1 rounded-full bg-white border border-slate-100">{action.estimatedMinutes} min</span>
          {action.dueDate && <span className="px-2 py-1 rounded-full bg-white border border-slate-100">Due {action.dueDate}</span>}
          {!action.dueDate && action.suggestedDate && <span className="px-2 py-1 rounded-full bg-white border border-slate-100">Suggested {action.suggestedDate}</span>}
          {action.linkedTopic && <span className="px-2 py-1 rounded-full bg-white border border-slate-100">Topic: {action.linkedTopic}</span>}
          {action.linkedMistakeCategory && <span className="px-2 py-1 rounded-full bg-white border border-slate-100">Mistake: {action.linkedMistakeCategory}</span>}
        </div>
      </div>
      <div className="lg:max-w-xs rounded-2xl bg-white border border-slate-100 p-4">
        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Suggested method</p>
        <p className="text-sm text-slate-600">{action.suggestedStudyMethod}</p>
      </div>
    </div>
  </div>
);

const MetricCard: React.FC<{ icon: React.ReactNode; label: string; value: number | string; note: string; tone?: string }> = ({ icon, label, value, note, tone }) => (
  <motion.div whileHover={{ y: -4 }} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
    <div className="flex items-center justify-between gap-3 mb-5">
      <div className="w-12 h-12 rounded-2xl bg-stellenbosch-maroon/5 text-stellenbosch-maroon flex items-center justify-center">
        {icon}
      </div>
      <GraduationCap size={20} className="text-slate-200" />
    </div>
    <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">{label}</p>
    <p className="font-display text-4xl text-slate-900 my-1">{value}</p>
    <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${tone || 'bg-slate-50 text-slate-500 border-slate-100'}`}>{note}</span>
  </motion.div>
);

const WeeklyReviewMetric: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number | string;
  detail: string;
  tone: WeeklyReviewTone;
}> = ({ icon, label, value, detail, tone }) => (
  <div className={`rounded-[2rem] border p-5 ${weeklyReviewTone(tone)}`}>
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/75 shadow-sm">
        {icon}
      </div>
      <span className="rounded-full bg-white/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        review
      </span>
    </div>
    <p className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-70">{label}</p>
    <p className="my-1 font-display text-3xl text-slate-900">{value}</p>
    <p className="text-sm text-slate-600">{detail}</p>
  </div>
);

const WeeklyReviewActionCard: React.FC<{ action: WeeklyReviewAction }> = ({ action }) => (
  <Link
    to={action.to}
    className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-4 transition-all hover:-translate-y-0.5 hover:border-stellenbosch-maroon/20 hover:shadow-sm"
  >
    <span className={`mt-0.5 h-3 w-3 shrink-0 rounded-full ${weeklyReviewDotTone(action.tone)}`} />
    <span className="min-w-0 flex-1">
      <span className="block font-bold text-slate-800">{action.title}</span>
      <span className="mt-1 block text-sm text-slate-500">{action.detail}</span>
    </span>
    <ArrowRight size={16} className="mt-1 shrink-0 text-slate-300" />
  </Link>
);

const BattlePlanItem: React.FC<{ action: NextBestAction }> = ({ action }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 px-5 py-3.5">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${battlePlanIconTone(action.actionType)}`}>
      {battlePlanActionIcon(action.actionType)}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <span className="text-[10px] uppercase font-bold tracking-wider bg-stellenbosch-maroon/5 text-stellenbosch-maroon rounded-full px-2 py-0.5">{action.moduleCode}</span>
        <span className={`text-[10px] uppercase font-bold tracking-wider rounded-full px-2 py-0.5 border ${battlePlanReasonTone(action)}`}>{battlePlanReasonLabel(action)}</span>
        <span className={`text-[10px] uppercase font-bold tracking-wider rounded-full px-2 py-0.5 ${priorityTone(action.priority)}`}>{action.priority}</span>
      </div>
      <p className="text-sm font-bold text-slate-800 truncate">{action.title}</p>
    </div>
    {(action.dueDate || action.suggestedDate) && (
      <span className="text-xs text-slate-400 font-medium shrink-0 hidden sm:block">{action.dueDate ?? action.suggestedDate}</span>
    )}
  </div>
);

const StudyQueueGroup: React.FC<{ title: string; tone: 'warning' | 'today' | 'week'; tasks: StudyQueueTask[] }> = ({ title, tone, tasks }) => (
  <div className={`rounded-2xl border p-4 ${studyQueueGroupTone(tone)}`}>
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">{title}</p>
      <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-bold text-slate-500">{tasks.length}</span>
    </div>
    {tasks.length === 0 ? (
      <p className="text-sm text-slate-500">Nothing here.</p>
    ) : (
      <div className="space-y-2">
        {tasks.map((task) => {
          const module = modules.find((item) => item.id === task.moduleId);
          return (
            <div key={task.id || `${task.moduleId}:${task.dueDate}:${task.text || task.title}`} className="rounded-xl border border-white/70 bg-white/80 px-3 py-2">
              <p className="text-sm font-bold text-slate-800">{task.text || task.title || 'Untitled task'}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-stellenbosch-maroon/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stellenbosch-maroon">
                  {module?.shortName || task.category || 'General'}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Due {task.dueDate}
                </span>
                {task.priority && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${studyQueuePriorityTone(task.priority)}`}>
                    {task.priority}
                  </span>
                )}
                {(task.type || task.category) && (
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-100">
                    {task.type || task.category}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

function studyQueueGroupTone(tone: 'warning' | 'today' | 'week') {
  if (tone === 'warning') return 'border-amber-100 bg-amber-50/70';
  if (tone === 'today') return 'border-stellenbosch-maroon/10 bg-stellenbosch-maroon/5';
  return 'border-slate-100 bg-slate-50/70';
}

function studyQueuePriorityTone(priority: string) {
  if (priority === 'Critical') return 'bg-red-50 text-red-700';
  if (priority === 'High') return 'bg-amber-50 text-amber-700';
  if (priority === 'Medium') return 'bg-blue-50 text-blue-700';
  return 'bg-slate-100 text-slate-500';
}

function battlePlanReasonLabel(action: NextBestAction): string {
  switch (action.actionType) {
    case 'assessment-prep': return 'Assessment soon';
    case 'marks-review':
    case 'data-entry': return 'Marks pressure';
    case 'topic-revision':
    case 'practice': return action.dueDate ? 'Retest due' : 'Weak topic';
    case 'mistake-retest': return 'Unresolved mistake';
    case 'source-gap': return 'Source gap';
    case 'final-boss': return 'Final Boss prep';
    default: return 'Priority task';
  }
}

function battlePlanReasonTone(action: NextBestAction): string {
  switch (action.actionType) {
    case 'assessment-prep': return 'bg-red-50 text-red-800 border-red-100';
    case 'marks-review':
    case 'data-entry': return 'bg-amber-50 text-amber-800 border-amber-100';
    case 'mistake-retest': return 'bg-orange-50 text-orange-800 border-orange-100';
    case 'final-boss': return 'bg-purple-50 text-purple-800 border-purple-100';
    default: return 'bg-blue-50 text-blue-800 border-blue-100';
  }
}

function battlePlanActionIcon(actionType: NextBestAction['actionType']): React.ReactNode {
  switch (actionType) {
    case 'assessment-prep': return <CalendarClock size={16} />;
    case 'marks-review':
    case 'data-entry': return <LineChart size={16} />;
    case 'mistake-retest': return <ListChecks size={16} />;
    case 'source-gap': return <AlertTriangle size={16} />;
    case 'final-boss': return <ShieldAlert size={16} />;
    case 'topic-revision':
    case 'practice': return <BookOpen size={16} />;
    default: return <Target size={16} />;
  }
}

function battlePlanIconTone(actionType: NextBestAction['actionType']): string {
  switch (actionType) {
    case 'assessment-prep': return 'bg-red-50 text-red-600';
    case 'marks-review':
    case 'data-entry': return 'bg-amber-50 text-amber-600';
    case 'mistake-retest': return 'bg-orange-50 text-orange-600';
    case 'final-boss': return 'bg-purple-50 text-purple-600';
    default: return 'bg-blue-50 text-blue-600';
  }
}

function matchesFilter(action: NextBestAction, filter: ActionFilter) {
  switch (filter) {
    case 'All':
      return true;
    case 'Urgent':
      return action.priority === 'urgent';
    case 'Today':
      return action.dueDate === todayIsoLocal() || action.suggestedDate === todayIsoLocal();
    case 'This week':
      return isWithinNextDays(action.dueDate || action.suggestedDate, 7);
    case 'Marks risk':
      return action.actionType === 'assessment-prep' || action.actionType === 'data-entry' || action.actionType === 'marks-review';
    case 'Mistakes':
      return action.actionType === 'mistake-retest';
    case 'Source gaps':
      return action.actionType === 'source-gap';
    case 'Final Boss':
      return action.actionType === 'final-boss';
  }
}

function labeliseFactor(kind: NextBestAction['evidence'][number]['kind']) {
  return kind.replace(/-/g, ' ');
}

function countdownLabel(daysFromNow: number): string {
  if (daysFromNow === 0) return 'Today';
  if (daysFromNow === 1) return 'Tomorrow';
  return `${daysFromNow} days away`;
}

function meaningfulProfileName(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.toLowerCase() === 'guest') return null;
  return trimmed;
}


function priorityTone(priority: NextBestAction['priority']) {
  switch (priority) {
    case 'urgent':
      return 'bg-red-50 text-red-800 border border-red-100';
    case 'high':
      return 'bg-amber-50 text-amber-800 border border-amber-100';
    case 'medium':
      return 'bg-blue-50 text-blue-800 border border-blue-100';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
}

export default Dashboard;

const GardenMetric: React.FC<{ label: string; value: string; detail: string }> = ({ label, value, detail }) => (
  <div className="rounded-[2rem] border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-5">
    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">{label}</p>
    <h3 className="font-display text-3xl text-slate-800">{value}</h3>
    <p className="mt-1 text-sm text-slate-500">{detail}</p>
  </div>
);

const TinyGardenPlant: React.FC<{ moduleName: string; durationMinutes: number; tone: PlantTone }> = ({ moduleName, durationMinutes, tone }) => {
  const growthLevel = durationMinutes >= 45 ? 'tall' : durationMinutes >= 25 ? 'medium' : 'small';
  const stemHeight = growthLevel === 'tall' ? 'h-14' : growthLevel === 'medium' ? 'h-11' : 'h-8';
  const bloomSize = growthLevel === 'tall' ? 'h-8 w-8' : growthLevel === 'medium' ? 'h-7 w-7' : 'h-6 w-6';

  return (
    <div className={`rounded-[1.6rem] border p-3 shadow-sm ${tone.cardClass}`}>
      <p className="truncate text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{moduleName}</p>
      <div className="relative mt-3 h-24 overflow-hidden rounded-[1.2rem] bg-gradient-to-b from-sky-50 via-white to-amber-50">
        <div className="absolute inset-x-4 bottom-2 h-5 rounded-full bg-amber-950/90" />
        <div className={`absolute bottom-6 left-1/2 w-1.5 -translate-x-1/2 rounded-full bg-gradient-to-t ${tone.stemClass} ${stemHeight}`} />
        <div className={`absolute bottom-10 left-1/2 h-5 w-8 -translate-x-[95%] rounded-br-[999px] rounded-tl-[999px] bg-gradient-to-br ${tone.leafClass}`} />
        <div className={`absolute bottom-12 left-1/2 h-5 w-8 translate-x-[-5%] rounded-bl-[999px] rounded-tr-[999px] bg-gradient-to-br ${tone.leafClass}`} />
        <div className={`absolute bottom-16 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br ${tone.bloomClass} ${bloomSize}`} />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-700">{durationMinutes} min</p>
    </div>
  );
};

interface PlantTone {
  cardClass: string;
  stemClass: string;
  leafClass: string;
  bloomClass: string;
}

function modulePlantTone(moduleId: string): PlantTone {
  if (moduleId === 'finacc178') {
    return {
      cardClass: 'border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-lime-50',
      stemClass: 'from-emerald-700 via-emerald-500 to-lime-400',
      leafClass: 'from-lime-100 via-emerald-300 to-emerald-500',
      bloomClass: 'from-lime-100 via-emerald-200 to-amber-200',
    };
  }

  if (moduleId === 'conlaw178') {
    return {
      cardClass: 'border-violet-100 bg-gradient-to-br from-white via-violet-50 to-fuchsia-50',
      stemClass: 'from-violet-800 via-violet-500 to-fuchsia-300',
      leafClass: 'from-fuchsia-100 via-violet-300 to-violet-500',
      bloomClass: 'from-violet-100 via-fuchsia-200 to-amber-100',
    };
  }

  if (moduleId === 'foundations178') {
    return {
      cardClass: 'border-lime-100 bg-gradient-to-br from-white via-lime-50 to-stone-100',
      stemClass: 'from-stone-700 via-lime-700 to-lime-400',
      leafClass: 'from-lime-100 via-lime-300 to-stone-500',
      bloomClass: 'from-lime-100 via-stone-200 to-amber-100',
    };
  }

  if (moduleId === 'econ114') {
    return {
      cardClass: 'border-sky-100 bg-gradient-to-br from-white via-sky-50 to-cyan-50',
      stemClass: 'from-sky-800 via-sky-500 to-cyan-300',
      leafClass: 'from-cyan-100 via-sky-300 to-sky-500',
      bloomClass: 'from-sky-100 via-cyan-200 to-amber-100',
    };
  }

  if (moduleId === 'sds188') {
    return {
      cardClass: 'border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-cyan-50',
      stemClass: 'from-indigo-800 via-indigo-500 to-cyan-300',
      leafClass: 'from-cyan-100 via-indigo-300 to-indigo-500',
      bloomClass: 'from-indigo-100 via-cyan-200 to-yellow-100',
    };
  }

  return {
    cardClass: 'border-slate-100 bg-gradient-to-br from-white via-slate-50 to-emerald-50/60',
    stemClass: 'from-slate-700 via-emerald-500 to-emerald-300',
    leafClass: 'from-emerald-100 via-emerald-300 to-emerald-500',
    bloomClass: 'from-amber-100 via-rose-100 to-emerald-100',
  };
}
