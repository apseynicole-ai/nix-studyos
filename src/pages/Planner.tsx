import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CalendarDays, CheckCircle2, Clock, Coffee, Flame, ListChecks, Moon, PlusCircle, Sun, Target, TimerReset } from 'lucide-react';
import { modules, nightlyChecklist, taskTemplates, weeklyRhythm } from '../data/baccllb';
import { LOCAL_TASKS_KEY, readLocalJson } from '../lib/localData';
import ProgressBar from '../components/ui/ProgressBar';
import ProgressBadge from '../components/ui/ProgressBadge';
import { calculatePlannerProgress, clampProgress } from '../lib/progressMetrics';

const timeBlocks = [
  { label: 'Morning activation', time: '10–20 min', icon: Sun, style: 'bg-yellow-50 text-yellow-700 border-yellow-100', tasks: ['Open dashboard', 'Pick first tiny task', 'No perfection editing'] },
  { label: 'Early-day low-friction block', time: '25–35 min', icon: Coffee, style: 'bg-orange-50 text-orange-700 border-orange-100', tasks: ['Flashcards', 'Read one case', 'Fix one mistake'] },
  { label: 'Main deep work', time: '16:00–18:00', icon: Flame, style: 'bg-red-50 text-red-700 border-red-100', tasks: ['Timed question', 'MegaNote build', 'Memo marking'] },
  { label: 'Light evening block', time: '19:00–20:30', icon: Moon, style: 'bg-indigo-50 text-indigo-700 border-indigo-100', tasks: ['Teach aloud', 'Review weak list', 'Plan tomorrow'] },
];

const Planner: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState(weeklyRhythm[0].day);
  const plannerData = useMemo(() => readLocalJson<unknown>('baccllb-planner', null), []);
  const storedTasks = useMemo(
    () => readLocalJson<Array<{ text?: string; moduleId?: string; done?: boolean; completedAt?: string | null }>>(LOCAL_TASKS_KEY, []),
    [],
  );
  const selectedRhythm = weeklyRhythm.find((day) => day.day === selectedDay) || weeklyRhythm[0];

  const dayTasks = useMemo(() => {
    const pools = {
      Monday: ['legal-footnotes', 'stats-formula', 'nightly-reset'],
      Tuesday: ['fa-adjustments', 'econ-unit8', 'nightly-reset'],
      Wednesday: ['conlaw-s36', 'foundations-roman', 'nightly-reset'],
      Thursday: ['fa-inventory', 'stats-formula', 'nightly-reset'],
      Friday: ['dla-final', 'legal-footnotes', 'nightly-reset'],
      Saturday: ['fa-adjustments', 'econ-unit8', 'conlaw-s36', 'nightly-reset'],
      Sunday: ['foundations-roman', 'stats-formula', 'nightly-reset'],
    } as Record<string, string[]>;
    return (pools[selectedDay] || []).map((id) => taskTemplates.find((task) => task.id === id)).filter(Boolean);
  }, [selectedDay]);
  const plannerProgress = calculatePlannerProgress(plannerData);
  const todayPlanCompleted = dayTasks.filter((task) => task && storedTasks.some((stored) => stored.text === task.title && stored.moduleId === task.moduleId && (stored.done || stored.completedAt))).length;
  const todayPlanProgress = dayTasks.length ? clampProgress((todayPlanCompleted / dayTasks.length) * 100) : 0;
  const allWeeklyTaskIds = ['legal-footnotes', 'stats-formula', 'nightly-reset', 'fa-adjustments', 'econ-unit8', 'conlaw-s36', 'foundations-roman', 'fa-inventory', 'dla-final'];
  const weekTemplateTasks = useMemo(
    () => Array.from(new Map(allWeeklyTaskIds.map((id) => {
      const task = taskTemplates.find((item) => item.id === id);
      return task ? [id, task] : [id, null];
    })).values()).filter(Boolean),
    [],
  );
  const weekCompleted = weekTemplateTasks.filter((task) => task && storedTasks.some((stored) => stored.text === task.title && stored.moduleId === task.moduleId && (stored.done || stored.completedAt))).length;
  const weekProgress = weekTemplateTasks.length ? clampProgress((weekCompleted / weekTemplateTasks.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto pt-8 pb-36 px-5 md:px-8">
      <header className="mb-8">
        <p className="uppercase tracking-[0.35em] text-xs text-slate-400 font-bold mb-3">A2 study operating system</p>
        <h1 className="font-display text-5xl text-stellenbosch-maroon mb-3">Planner + Nightly Checklist</h1>
        <p className="text-slate-500 max-w-3xl">A weekly rhythm that matches your preference for short early-day tasks, stronger late-afternoon blocks, detailed to-dos and nightly reset loops.</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        {timeBlocks.map((block) => {
          const Icon = block.icon;
          return (
            <motion.div whileHover={{ y: -4 }} key={block.label} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-4 ${block.style}`}><Icon size={22} /></div>
              <h3 className="font-bold text-slate-800">{block.label}</h3>
              <p className="text-xs font-bold text-stellenbosch-maroon mt-1 mb-4">{block.time}</p>
              <div className="space-y-2">
                {block.tasks.map((task) => <p key={task} className="text-sm text-slate-500 flex gap-2"><CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />{task}</p>)}
              </div>
            </motion.div>
          );
        })}
      </section>

      <section className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm mb-8">
        <div className="flex flex-wrap gap-2 mb-5">
          <ProgressBadge value={todayPlanProgress} label="Today plan" tone="maroon" />
          <ProgressBadge value={weekProgress} label="Week progress" tone="amber" />
          <ProgressBadge value={plannerProgress} label="Planner state" tone="slate" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ProgressBar value={todayPlanProgress} label="Today's plan progress" helper={dayTasks.length ? `${todayPlanCompleted} of ${dayTasks.length} visible plan tasks matched to completed local tasks` : 'No plan tasks for this day'} tone="maroon" />
          <ProgressBar value={weekProgress} label="Week progress" helper={weekTemplateTasks.length ? `${weekCompleted} of ${weekTemplateTasks.length} weekly template tasks matched to completed local tasks` : 'No weekly progress data yet'} tone="amber" />
          <ProgressBar value={plannerProgress} label="Saved planner progress" helper={plannerProgress > 0 ? 'Derived from local planner data where available' : 'No saved planner progress data found yet'} tone="slate" />
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-8">
        <section className="glass rounded-[2.5rem] p-7 border-slate-200/50">
          <div className="flex items-center gap-3 mb-6">
            <CalendarDays className="text-stellenbosch-maroon" />
            <h2 className="font-display text-3xl text-stellenbosch-maroon">Week-by-week rhythm</h2>
          </div>
          <div className="space-y-3">
            {weeklyRhythm.map((day) => (
              <button
                key={day.day}
                onClick={() => setSelectedDay(day.day)}
                className={`w-full text-left rounded-3xl p-4 border transition-all ${selectedDay === day.day ? 'bg-stellenbosch-maroon text-white border-stellenbosch-maroon shadow-lg shadow-stellenbosch-maroon/20' : 'bg-white/80 text-slate-600 border-slate-100 hover:border-stellenbosch-maroon/20'}`}
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <p className="font-bold">{day.day}</p>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${selectedDay === day.day ? 'text-white/70' : 'text-slate-400'}`}>{day.focus}</span>
                </div>
                <p className={`text-sm ${selectedDay === day.day ? 'text-white/75' : 'text-slate-500'}`}>{day.detail}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] font-bold text-slate-400">Selected day</p>
              <h2 className="font-display text-4xl text-stellenbosch-maroon">{selectedRhythm.day}</h2>
              <p className="text-slate-500">{selectedRhythm.detail}</p>
            </div>
            <div className="rounded-2xl bg-stellenbosch-maroon/5 text-stellenbosch-maroon px-4 py-3 font-bold text-sm flex items-center gap-2"><Target size={18} /> {selectedRhythm.focus}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {dayTasks.map((task) => {
              if (!task) return null;
              const module = modules.find((item) => item.id === task.moduleId);
              const Icon = module?.icon || ListChecks;
              return (
                <div key={task.id} className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${module?.colour || 'from-slate-600 to-slate-400'} text-white flex items-center justify-center`}><Icon size={21} /></div>
                    <div>
                      <p className="font-bold text-slate-800">{module?.shortName || 'Personal'}</p>
                      <p className="text-xs text-slate-400">{task.type} • {task.priority}</p>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">{task.title}</h3>
                  <p className="text-sm text-slate-500 mb-4">{task.why}</p>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1"><Clock size={14} /> {task.minutes} min</span>
                    <span>{task.points} points</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-[2rem] bg-slate-950 text-white p-6">
            <div className="flex items-center gap-3 mb-5">
              <TimerReset className="text-stellenbosch-gold" />
              <h3 className="font-display text-2xl">Nightly reset</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {nightlyChecklist.map((item) => (
                <div key={item} className="flex items-start gap-3 bg-white/5 rounded-2xl p-3 border border-white/10">
                  <CheckCircle2 size={16} className="text-stellenbosch-gold mt-0.5 shrink-0" />
                  <p className="text-sm text-white/75">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PlannerCard icon={<PlusCircle />} title="10-task day rule" text="Each day should have up to 10 concrete tasks, not vague goals. Use points and minutes so the day feels finite." />
        <PlannerCard icon={<Flame />} title="Pressure before polish" text="For A2 season, practice and marking beats endless note perfecting. Build notes only when they directly unlock questions." />
        <PlannerCard icon={<ListChecks />} title="Weekly Uni Reset" text="Every Sunday: update marks, deadlines, mistake log, weak topics, and the first Monday task." />
      </section>
    </div>
  );
};

const PlannerCard: React.FC<{ icon: React.ReactNode; title: string; text: string }> = ({ icon, title, text }) => (
  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
    <div className="w-11 h-11 rounded-2xl bg-stellenbosch-maroon/5 text-stellenbosch-maroon flex items-center justify-center mb-4">{icon}</div>
    <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-sm text-slate-500">{text}</p>
  </div>
);

export default Planner;
