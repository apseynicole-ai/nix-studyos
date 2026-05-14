import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckSquare, Clock, Filter, Plus, Sparkles, Tag, Trash2, Wand2 } from 'lucide-react';
import { db, collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, OperationType, isFirestoreUnavailableError } from '../lib/firebase';
import { useAuth } from '../components/auth/AuthGuard';
import { modules, taskTemplates } from '../data/baccllb';
import { LOCAL_TASKS_KEY, readLocalJson, writeLocalJson } from '../lib/localData';
import ProgressBar from '../components/ui/ProgressBar';
import ProgressBadge from '../components/ui/ProgressBadge';
import { calculateTaskProgress, clampProgress } from '../lib/progressMetrics';

type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
type TaskType = 'Study' | 'Practice' | 'Admin' | 'Submission' | 'Revision' | 'Health';

interface StudyTask {
  id: string;
  text: string;
  done: boolean;
  moduleId: string;
  category: string;
  priority: Priority;
  type: TaskType;
  minutes: number;
  points: number;
  dueDate?: string | null;
  createdAt: string;
}

interface StoredStudyTask extends StudyTask {
  userId: string;
  why?: string;
  completedAt?: string | null;
}

const Tasks: React.FC = () => {
  const { user, localFirstMode } = useAuth();
  const [tasks, setTasks] = useState<StoredStudyTask[]>([]);
  const [input, setInput] = useState('');
  const [moduleId, setModuleId] = useState(modules[0].id);
  const [priority, setPriority] = useState<Priority>('High');
  const [type, setType] = useState<TaskType>('Study');
  const [minutes, setMinutes] = useState(45);
  const [points, setPoints] = useState(10);
  const [dueDate, setDueDate] = useState('');
  const [filter, setFilter] = useState<'All' | 'Open' | 'Done'>('Open');

  useEffect(() => {
    if (!user) return;
    const loadLocalTasks = () => {
      setTasks(readLocalJson<StoredStudyTask[]>(LOCAL_TASKS_KEY, []).filter((task) => task.userId === user.uid));
    };

    if (localFirstMode) {
      loadLocalTasks();
      return;
    }

    const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as StoredStudyTask)));
    }, (error) => {
      if (isFirestoreUnavailableError(error)) {
        loadLocalTasks();
        return;
      }
      console.error('Tasks sync failed:', error instanceof Error ? error.message : String(error));
      loadLocalTasks();
    });
    return () => unsubscribe();
  }, [user, localFirstMode]);

  const saveLocalTasks = (nextTasks: StoredStudyTask[]) => {
    writeLocalJson(LOCAL_TASKS_KEY, nextTasks);
    setTasks(nextTasks.filter((task) => task.userId === user?.uid));
  };

  const addTask = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() || !user) return;
    const module = modules.find((item) => item.id === moduleId);
    const newTask = {
      id: crypto.randomUUID(),
      userId: user.uid,
      text: input,
      done: false,
      moduleId,
      category: module?.area || 'General',
      priority,
      type,
      minutes,
      points,
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
    } satisfies StoredStudyTask;
    try {
      if (localFirstMode) {
        saveLocalTasks([...readLocalJson<StoredStudyTask[]>(LOCAL_TASKS_KEY, []), newTask]);
        setInput('');
        return;
      }
      await addDoc(collection(db, 'tasks'), {
        ...newTask,
      });
      setInput('');
    } catch (error) {
      if (isFirestoreUnavailableError(error)) {
        saveLocalTasks([...readLocalJson<StoredStudyTask[]>(LOCAL_TASKS_KEY, []), newTask]);
        setInput('');
        return;
      }
      console.error('Task create failed:', error instanceof Error ? error.message : String(error));
    }
  };

  const addTemplate = async (templateId: string) => {
    if (!user) return;
    const template = taskTemplates.find((item) => item.id === templateId);
    if (!template) return;
    const module = modules.find((item) => item.id === template.moduleId);
    const newTask = {
      id: crypto.randomUUID(),
      userId: user.uid,
      text: template.title,
      done: false,
      moduleId: template.moduleId,
      category: module?.area || 'General',
      priority: template.priority,
      type: template.type,
      minutes: template.minutes,
      points: template.points,
      dueDate: null,
      why: template.why,
      createdAt: new Date().toISOString(),
    };
    try {
      if (localFirstMode) {
        saveLocalTasks([...readLocalJson<StoredStudyTask[]>(LOCAL_TASKS_KEY, []), newTask]);
        return;
      }
      await addDoc(collection(db, 'tasks'), {
        ...newTask,
      });
    } catch (error) {
      if (isFirestoreUnavailableError(error)) {
        saveLocalTasks([...readLocalJson<StoredStudyTask[]>(LOCAL_TASKS_KEY, []), newTask]);
        return;
      }
      console.error('Template task create failed:', error instanceof Error ? error.message : String(error));
    }
  };

  const seedBossDay = async () => {
    if (!user) return;
    const seededTasks = taskTemplates.slice(0, 6).map((template) => {
      const module = modules.find((item) => item.id === template.moduleId);
      return {
        id: crypto.randomUUID(),
        userId: user.uid,
        text: template.title,
        done: false,
        moduleId: template.moduleId,
        category: module?.area || 'General',
        priority: template.priority,
        type: template.type,
        minutes: template.minutes,
        points: template.points,
        dueDate: null,
        why: template.why,
        createdAt: new Date().toISOString(),
      };
    });

    if (localFirstMode) {
      saveLocalTasks([...readLocalJson<StoredStudyTask[]>(LOCAL_TASKS_KEY, []), ...seededTasks]);
      return;
    }

    try {
      for (const task of seededTasks) {
        await addDoc(collection(db, 'tasks'), task);
      }
    } catch (error) {
      if (isFirestoreUnavailableError(error)) {
        saveLocalTasks([...readLocalJson<StoredStudyTask[]>(LOCAL_TASKS_KEY, []), ...seededTasks]);
        return;
      }
      console.error('Boss day seed failed:', error instanceof Error ? error.message : String(error));
    }
  };

  const toggleTask = async (id: string, done: boolean) => {
    try {
      if (localFirstMode) {
        const nextTasks = readLocalJson<StoredStudyTask[]>(LOCAL_TASKS_KEY, []).map((task) =>
          task.id === id ? { ...task, done: !done, completedAt: !done ? new Date().toISOString() : null } : task,
        );
        saveLocalTasks(nextTasks);
        return;
      }
      await updateDoc(doc(db, 'tasks', id), { done: !done, completedAt: !done ? new Date().toISOString() : null });
    } catch (error) {
      if (isFirestoreUnavailableError(error)) {
        const nextTasks = readLocalJson<StoredStudyTask[]>(LOCAL_TASKS_KEY, []).map((task) =>
          task.id === id ? { ...task, done: !done, completedAt: !done ? new Date().toISOString() : null } : task,
        );
        saveLocalTasks(nextTasks);
        return;
      }
      console.error('Task update failed:', error instanceof Error ? error.message : String(error));
    }
  };

  const deleteTask = async (id: string) => {
    try {
      if (localFirstMode) {
        saveLocalTasks(readLocalJson<StoredStudyTask[]>(LOCAL_TASKS_KEY, []).filter((task) => task.id !== id));
        return;
      }
      await deleteDoc(doc(db, 'tasks', id));
    } catch (error) {
      if (isFirestoreUnavailableError(error)) {
        saveLocalTasks(readLocalJson<StoredStudyTask[]>(LOCAL_TASKS_KEY, []).filter((task) => task.id !== id));
        return;
      }
      console.error('Task delete failed:', error instanceof Error ? error.message : String(error));
    }
  };

  const visibleTasks = useMemo(() => {
    return tasks
      .filter((task) => filter === 'All' || (filter === 'Open' ? !task.done : task.done))
      .sort((a, b) => Number(a.done) - Number(b.done) || priorityValue(b.priority) - priorityValue(a.priority) || b.createdAt.localeCompare(a.createdAt));
  }, [tasks, filter]);

  const openTasks = tasks.filter((task) => !task.done);
  const completedPoints = tasks.filter((task) => task.done).reduce((sum, task) => sum + (task.points || 0), 0);
  const plannedMinutes = openTasks.reduce((sum, task) => sum + (task.minutes || 0), 0);
  const completedTasks = tasks.filter((task) => task.done).length;
  const taskProgress = calculateTaskProgress(tasks);
  const dueSoonOpenTasks = openTasks.filter((task) => task.dueDate && withinDays(task.dueDate, 7)).length;
  const overdueOpenTasks = openTasks.filter((task) => task.dueDate && task.dueDate < new Date().toISOString().slice(0, 10)).length;
  const dueSoonProgress = openTasks.length ? clampProgress(((openTasks.length - dueSoonOpenTasks) / openTasks.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto pt-8 pb-36 px-5 md:px-8">
      <header className="mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div>
          <p className="uppercase tracking-[0.35em] text-xs text-slate-400 font-bold mb-3">execution layer</p>
          <h1 className="font-display text-5xl text-stellenbosch-maroon mb-3">Task Bank + Daily Sprint</h1>
          <p className="text-slate-500 max-w-3xl">Module-specific tasks with priority, points, time estimates and templates so your daily plan is concrete instead of vague.</p>
          {localFirstMode && <p className="mt-3 text-sm font-medium text-amber-800">Local-first mode active: tasks are being stored on this device.</p>}
        </div>
        <button onClick={seedBossDay} className="maroon-gradient text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-stellenbosch-maroon/20 hover:scale-105 transition-transform">
          <Wand2 size={18} /> Build Final Boss day
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <TaskKpi label="Open tasks" value={openTasks.length} icon={<CheckSquare />} />
        <TaskKpi label="Planned time" value={`${Math.round(plannedMinutes / 60)}h ${plannedMinutes % 60}m`} icon={<Clock />} />
        <TaskKpi label="Completed points" value={completedPoints} icon={<Sparkles />} />
      </section>

      <section className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm mb-8">
        <div className="flex flex-wrap gap-2 mb-5">
          <ProgressBadge value={taskProgress} label="Tasks complete" tone="emerald" />
          <ProgressBadge value={dueSoonProgress} label="Week under control" tone="amber" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ProgressBar value={taskProgress} label="Completed vs total tasks" helper={tasks.length ? `${completedTasks} of ${tasks.length} tasks completed` : 'No tasks yet'} tone="emerald" />
          <ProgressBar value={dueSoonProgress} label="This week task pressure" helper={openTasks.length ? `${dueSoonOpenTasks} due within 7 days • ${overdueOpenTasks} overdue` : 'No open due-dated tasks'} tone="amber" />
          <ProgressBar value={openTasks.length ? clampProgress((plannedMinutes / Math.max(60, plannedMinutes + completedPoints)) * 100) : 0} label="Current sprint load" helper={openTasks.length ? `${plannedMinutes} planned minutes still open` : 'No open sprint load right now'} tone="maroon" />
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-8">
        <section className="space-y-6">
          <form onSubmit={addTask} className="glass p-6 rounded-[2.5rem] border-slate-200/50 shadow-lg">
            <h2 className="font-display text-3xl text-stellenbosch-maroon mb-5">Add task</h2>
            <input 
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="e.g. Redo IAS 37 provision question and mark against memo"
              className="w-full bg-white rounded-2xl border border-slate-100 px-4 py-4 text-lg font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20 mb-4"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <Select label="Module" value={moduleId} onChange={setModuleId} options={modules.map((module) => ({ label: `${module.shortName} (${module.code})`, value: module.id }))} />
              <Select label="Type" value={type} onChange={(value) => setType(value as TaskType)} options={['Study', 'Practice', 'Admin', 'Submission', 'Revision', 'Health'].map((item) => ({ label: item, value: item }))} />
              <Select label="Priority" value={priority} onChange={(value) => setPriority(value as Priority)} options={['Low', 'Medium', 'High', 'Critical'].map((item) => ({ label: item, value: item }))} />
              <label className="block">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">Due date</span>
                <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="w-full rounded-2xl bg-white border border-slate-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20" />
              </label>
              <NumberField label="Minutes" value={minutes} onChange={setMinutes} />
              <NumberField label="Points" value={points} onChange={setPoints} />
            </div>
            <button type="submit" className="w-full maroon-gradient text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform">
              <Plus size={20} /> Add to sprint
            </button>
          </form>

          <section className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
            <h2 className="font-display text-3xl text-stellenbosch-maroon mb-5">Template task bank</h2>
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2 custom-scrollbar">
              {taskTemplates.map((template) => {
                const module = modules.find((item) => item.id === template.moduleId);
                return (
                  <button key={template.id} onClick={() => addTemplate(template.id)} className="w-full text-left rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-stellenbosch-maroon/20 p-4 transition-all">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-stellenbosch-maroon">{module?.shortName || 'Personal'}</span>
                      <span className="text-xs font-mono text-slate-400">{template.minutes}m • {template.points}pts</span>
                    </div>
                    <p className="font-bold text-slate-800">{template.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{template.why}</p>
                  </button>
                );
              })}
            </div>
          </section>
        </section>

        <section className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="font-display text-3xl text-stellenbosch-maroon">Sprint list</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={16} className="text-slate-400" />
              {(['Open', 'All', 'Done'] as const).map((item) => (
                <button key={item} onClick={() => setFilter(item)} className={`px-3 py-1.5 rounded-xl text-xs uppercase font-bold tracking-wider border ${filter === item ? 'bg-stellenbosch-maroon text-white border-stellenbosch-maroon' : 'bg-white text-slate-500 border-slate-100'}`}>{item}</button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {visibleTasks.map((task) => {
                const module = modules.find((item) => item.id === task.moduleId);
                const Icon = module?.icon || Tag;
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                    className={`rounded-3xl border p-5 group transition-all ${task.done ? 'bg-slate-50 opacity-65 border-slate-100' : 'bg-white border-slate-100 hover:border-stellenbosch-maroon/20 hover:shadow-sm'}`}
                  >
                    <div className="flex items-start gap-4">
                      <button onClick={() => toggleTask(task.id, task.done)} className={`w-8 h-8 rounded-full border-2 transition-colors flex items-center justify-center shrink-0 ${task.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200 hover:border-stellenbosch-maroon'}`}>
                        {task.done && <CheckSquare className="text-white" size={17} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider bg-stellenbosch-maroon/5 text-stellenbosch-maroon rounded-full px-2 py-1 flex items-center gap-1"><Icon size={12} /> {module?.shortName || task.category}</span>
                          <span className={`text-[10px] uppercase font-bold tracking-wider rounded-full px-2 py-1 ${priorityClass(task.priority)}`}>{task.priority}</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-500 rounded-full px-2 py-1">{task.type}</span>
                        </div>
                        <p className={`font-bold ${task.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.text}</p>
                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-400 font-bold">
                          <span className="flex items-center gap-1"><Clock size={14} /> {task.minutes || 0} min</span>
                          <span>{task.points || 0} pts</span>
                          {task.dueDate && <span>Due {task.dueDate}</span>}
                        </div>
                        {(task as any).why && <p className="text-xs text-slate-500 mt-2">{(task as any).why}</p>}
                      </div>
                      <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all p-2">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {visibleTasks.length === 0 && <div className="text-center py-16 text-slate-400 italic">No tasks in this view yet. Add one or use the template bank.</div>}
          </div>
        </section>
      </div>
    </div>
  );
};

const priorityValue = (priority?: string) => ({ Critical: 4, High: 3, Medium: 2, Low: 1 }[priority || 'Low'] || 0);
const priorityClass = (priority?: string) => {
  if (priority === 'Critical') return 'bg-red-50 text-red-700';
  if (priority === 'High') return 'bg-amber-50 text-amber-700';
  if (priority === 'Medium') return 'bg-blue-50 text-blue-700';
  return 'bg-slate-100 text-slate-500';
};

const Select: React.FC<{ label: string; value: string; onChange: (value: string) => void; options: { label: string; value: string }[] }> = ({ label, value, onChange, options }) => (
  <label className="block">
    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl bg-white border border-slate-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20">
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </label>
);

const NumberField: React.FC<{ label: string; value: number; onChange: (value: number) => void }> = ({ label, value, onChange }) => (
  <label className="block">
    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">{label}</span>
    <input type="number" min="0" value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full rounded-2xl bg-white border border-slate-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20" />
  </label>
);

const TaskKpi: React.FC<{ icon: React.ReactNode; label: string; value: number | string }> = ({ icon, label, value }) => (
  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
    <div className="w-12 h-12 rounded-2xl bg-stellenbosch-maroon/5 text-stellenbosch-maroon flex items-center justify-center mb-4">{icon}</div>
    <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">{label}</p>
    <p className="font-display text-4xl text-slate-900">{value}</p>
  </div>
);

function withinDays(dateValue: string | null | undefined, days: number) {
  if (!dateValue) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateValue}T00:00:00`);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  return diff >= 0 && diff <= days;
}

export default Tasks;
