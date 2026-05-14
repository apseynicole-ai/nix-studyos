import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../components/auth/AuthGuard';
import { db, collection, query, where, getDocs, isFirestoreUnavailableError } from '../lib/firebase';
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CalendarClock,
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
} from 'lucide-react';
import { modules, nightlyChecklist, quickStats, taskTemplates, USER_ACADEMIC_PROFILE, weeklyRhythm } from '../data/baccllb';
import { averageConfidence, priorityScore, readinessLabel, riskTone, upcomingAssessments } from '../lib/studyMetrics';
import { LOCAL_SUMMARIES_KEY, LOCAL_TASKS_KEY, LOCAL_TIMER_SESSIONS_KEY, readLocalJson } from '../lib/localData';
import { averageTopicConfidence, readTopicMastery, topicsDueThisWeek, urgentTopicsCount } from '../lib/topicMastery';
import { mistakeRetestsDueThisWeek, moduleWithMostUnresolvedMistakes, readMistakeBank, unresolvedMistakes } from '../lib/mistakeBank';

const Dashboard: React.FC = () => {
  const { user, localFirstMode, profile } = useAuth();
  const [stats, setStats] = useState({ tasks: 0, sessions: 0, summaries: 0, completedTasks: 0 });

  useEffect(() => {
    if (!user) return;
    const loadLocalStats = () => {
      const tasks = readLocalJson<any[]>(LOCAL_TASKS_KEY, []).filter((task) => task.userId === user.uid);
      const sessions = readLocalJson<any[]>(LOCAL_TIMER_SESSIONS_KEY, []).filter((session) => session.userId === user.uid);
      const summaries = readLocalJson<any[]>(LOCAL_SUMMARIES_KEY, []).filter((summary) => summary.userId === user.uid);
      setStats({
        tasks: tasks.length,
        completedTasks: tasks.filter((task) => task.done).length,
        sessions: sessions.length,
        summaries: summaries.length,
      });
    };

    if (localFirstMode) {
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
  const weakestModules = [...modules].sort((a, b) => a.confidence - b.confidence).slice(0, 4);
  const nextBestTasks = taskTemplates.slice(0, 5);
  const today = new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' });
  const topicRecords = readTopicMastery();
  const urgentTopics = urgentTopicsCount(topicRecords);
  const topicConfidence = averageTopicConfidence(topicRecords);
  const retestsThisWeek = topicsDueThisWeek(topicRecords).length;
  const mistakeRecords = readMistakeBank();
  const unresolvedMistakeCount = unresolvedMistakes(mistakeRecords).length;
  const mistakeRetests = mistakeRetestsDueThisWeek(mistakeRecords).length;
  const topMistakeModule = moduleWithMostUnresolvedMistakes(mistakeRecords);

  return (
    <div className="max-w-7xl mx-auto pt-8 pb-36 px-5 md:px-8">
      <header className="mb-10 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 items-stretch">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] maroon-gradient text-white p-8 md:p-10 shadow-2xl shadow-stellenbosch-maroon/20"
        >
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_30%)]" />
          <div className="relative z-10">
            <p className="uppercase tracking-[0.35em] text-xs text-white/70 font-bold mb-4">{USER_ACADEMIC_PROFILE.institution}</p>
            <h1 className="font-display text-4xl md:text-6xl mb-3">Goeiedag, {profile?.displayName || USER_ACADEMIC_PROFILE.preferredName}</h1>
            <p className="text-white/80 text-lg max-w-2xl">
              Your personalised {USER_ACADEMIC_PROFILE.programme} command centre: modules, marks, tasks, A2 pressure prep, mistake loops and AI study systems in one place.
            </p>
            {localFirstMode && <p className="mt-4 text-sm font-medium text-white/85">Local-first mode active while Firestore cloud sync is unavailable.</p>}
            <div className="flex flex-wrap gap-3 mt-8">
              <HeroPill icon={<Target size={16} />} text={USER_ACADEMIC_PROFILE.academicGoal} />
              <HeroPill icon={<Mic2 size={16} />} text="Teach-aloud revision" />
              <HeroPill icon={<TimerReset size={16} />} text="Small-dose pressure simulation" />
            </div>
          </div>
        </motion.section>

        <section className="glass rounded-[2.5rem] p-7 border-slate-200/50 shadow-sm">
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

      <section className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-10">
        <MetricCard icon={<BookOpen />} label="Active modules" value={modules.length} note="S1 + S2 shells" />
        <MetricCard icon={<LineChart />} label="Avg confidence" value={`${avgConfidence}%`} note={readinessLabel(avgConfidence)} tone={riskTone(avgConfidence)} />
        <MetricCard icon={<CalendarClock />} label="Upcoming checks" value={quickStats.semesterOneAssessments} note="Assessments + evidence" />
        <MetricCard icon={<BrainCircuit />} label="AI outputs saved" value={stats.summaries} note={`${stats.sessions * 25} study mins logged`} />
        <MetricCard icon={<Target />} label="Topic tracker" value={urgentTopics} note={`${topicConfidence}% avg • ${retestsThisWeek} due`} tone={urgentTopics > 0 ? 'bg-amber-50 text-amber-800 border-amber-100' : undefined} />
        <MetricCard icon={<ListChecks />} label="Mistake bank" value={unresolvedMistakeCount} note={`${mistakeRetests} due • ${topMistakeModule?.moduleName || 'No hotspot'}`} tone={unresolvedMistakeCount > 0 ? 'bg-red-50 text-red-800 border-red-100' : undefined} />
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
              const score = priorityScore(module.confidence, module.target);
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
                        <span className={`text-[10px] font-bold uppercase tracking-wider border rounded-full px-2 py-1 ${riskTone(module.confidence)}`}>{readinessLabel(module.confidence)}</span>
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
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full bg-white text-stellenbosch-maroon border border-stellenbosch-maroon/10">{assessment.status}</span>
                </div>
                {assessment.notes && <p className="text-xs text-slate-500 mt-2">{assessment.notes}</p>}
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
    </div>
  );
};

const HeroPill: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 text-sm text-white/90">
    {icon}
    {text}
  </span>
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

export default Dashboard;
