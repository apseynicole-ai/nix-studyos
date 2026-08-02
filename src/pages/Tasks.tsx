import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Check, Archive, RotateCcw, Link2 } from 'lucide-react';
import {
  bootstrapSemester2,
  isBootstrapped,
  migrateLegacyTasks,
  modulesRepo,
  tasksRepo,
  createTask,
  updateTaskFields,
  setTaskStatus,
  deleteTask,
  listActiveTasks,
  listArchivedTasks,
  type Module,
  type StudyTask,
  type TaskCategory,
  type TaskPriority,
} from '../studySystem';

const CATEGORIES: TaskCategory[] = ['MUST_DO', 'SHOULD_DO', 'NICE_TO_HAVE'];
const PRIORITIES: TaskPriority[] = ['P1', 'P2', 'P3'];

const CAT_LABEL: Record<TaskCategory, string> = { MUST_DO: 'MUST DO', SHOULD_DO: 'SHOULD DO', NICE_TO_HAVE: 'NICE TO HAVE' };
const CAT_TONE: Record<TaskCategory, string> = {
  MUST_DO: 'bg-red-50 text-red-700',
  SHOULD_DO: 'bg-amber-50 text-amber-700',
  NICE_TO_HAVE: 'bg-slate-100 text-slate-500',
};
const PRIO_TONE: Record<TaskPriority, string> = {
  P1: 'bg-red-100 text-red-700',
  P2: 'bg-blue-50 text-blue-700',
  P3: 'bg-slate-100 text-slate-500',
};
const SOURCE_LABEL: Record<string, string> = {
  manual: 'Manual',
  study_followup: 'Study follow-up',
  weekly_reset: 'Weekly reset',
  unplanned: 'Unplanned',
  ai_chat: 'AI',
  seed: 'Seed',
  legacy_migration: 'Legacy (S1)',
};

const Tasks: React.FC = () => {
  const [tab, setTab] = useState<'active' | 'archived'>('active');
  const [refresh, setRefresh] = useState(0);
  const [fModule, setFModule] = useState('');
  const [fCategory, setFCategory] = useState<'' | TaskCategory>('');
  const [fPriority, setFPriority] = useState<'' | TaskPriority>('');
  const [fStatus, setFStatus] = useState<'open' | 'done' | 'all'>('open');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [migrated, setMigrated] = useState(0);

  useEffect(() => {
    if (!isBootstrapped()) bootstrapSemester2();
    const result = migrateLegacyTasks(); // idempotent, non-destructive
    setMigrated(result.migrated);
    setRefresh((n) => n + 1);
  }, []);

  const bump = () => setRefresh((n) => n + 1);
  const modules = useMemo(() => modulesRepo.read(), [refresh]);
  const moduleName = (id: string) => modules.find((m: Module) => m.id === id)?.shortName ?? id;

  const active = useMemo(() => listActiveTasks(), [refresh]);
  const archived = useMemo(() => listArchivedTasks(), [refresh]);

  const visible = useMemo(() => {
    return active
      .filter((t) => (fModule ? t.moduleId === fModule : true))
      .filter((t) => (fCategory ? t.category === fCategory : true))
      .filter((t) => (fPriority ? t.priority === fPriority : true))
      .filter((t) => (fStatus === 'all' ? true : fStatus === 'done' ? t.status === 'done' : t.status !== 'done'))
      .sort((a, b) =>
        Number(a.status === 'done') - Number(b.status === 'done') ||
        a.priority.localeCompare(b.priority) ||
        b.createdAt.localeCompare(a.createdAt),
      );
  }, [active, fModule, fCategory, fPriority, fStatus]);

  return (
    <div className="page-shell">
      <header className="mb-5">
        <p className="page-kicker mb-1">Execution</p>
        <h1 className="font-display text-3xl md:text-4xl text-stellenbosch-maroon">Tasks</h1>
        {migrated > 0 && <p className="mt-2 text-xs text-slate-400">Migrated {migrated} legacy Semester-1 task{migrated === 1 ? '' : 's'} to the archive.</p>}
      </header>

      <div className="mb-5 flex gap-2">
        <button onClick={() => setTab('active')} className={`rounded-xl px-4 py-2 text-sm font-bold ${tab === 'active' ? 'bg-stellenbosch-maroon text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>Active (S2)</button>
        <button onClick={() => setTab('archived')} className={`rounded-xl px-4 py-2 text-sm font-bold inline-flex items-center gap-1.5 ${tab === 'archived' ? 'bg-stellenbosch-maroon text-white' : 'bg-white text-slate-500 border border-slate-200'}`}><Archive size={14} /> S1 archive ({archived.length})</button>
      </div>

      {tab === 'active' ? (
        <>
          <NewTaskForm modules={modules} onCreate={() => bump()} />

          <div className="my-5 flex flex-wrap items-center gap-2 text-xs">
            <select value={fModule} onChange={(e) => setFModule(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-bold text-slate-600">
              <option value="">All modules</option>
              {modules.map((m: Module) => <option key={m.id} value={m.id}>{m.shortName}</option>)}
            </select>
            <select value={fCategory} onChange={(e) => setFCategory(e.target.value as '' | TaskCategory)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-bold text-slate-600">
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
            </select>
            <select value={fPriority} onChange={(e) => setFPriority(e.target.value as '' | TaskPriority)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-bold text-slate-600">
              <option value="">All priorities</option>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            {(['open', 'done', 'all'] as const).map((s) => (
              <button key={s} onClick={() => setFStatus(s)} className={`rounded-lg px-2.5 py-1.5 font-bold uppercase border ${fStatus === s ? 'bg-stellenbosch-maroon text-white border-stellenbosch-maroon' : 'bg-white text-slate-500 border-slate-200'}`}>{s}</button>
            ))}
          </div>

          <div className="space-y-2">
            {visible.length === 0 && <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-8 text-center text-slate-400">No tasks in this view. Add one, or log a study follow-up from Today.</div>}
            {visible.map((task) =>
              editingId === task.id ? (
                <EditTaskRow key={task.id} task={task} modules={modules} onDone={() => { setEditingId(null); bump(); }} />
              ) : (
                <TaskRow key={task.id} task={task} moduleName={moduleName(task.moduleId)}
                  onToggle={() => { setTaskStatus(task.id, task.status === 'done' ? 'open' : 'done'); bump(); }}
                  onEdit={() => setEditingId(task.id)}
                  onDelete={() => { deleteTask(task.id); bump(); }} />
              ),
            )}
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <p className="mb-3 text-sm text-slate-400">Read-only Semester-1 task history (migrated; the legacy store is preserved).</p>
          {archived.length === 0 && <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-8 text-center text-slate-400">No archived tasks.</div>}
          {archived.map((task) => (
            <div key={task.id} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 opacity-80">
              <div className="flex items-center gap-2 mb-1">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${CAT_TONE[task.category]}`}>{CAT_LABEL[task.category]}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${PRIO_TONE[task.priority]}`}>{task.priority}</span>
                <span className="text-[10px] font-bold uppercase text-slate-400">{moduleName(task.moduleId)}</span>
              </div>
              <p className={`font-medium ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-700'}`}>{task.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TaskRow: React.FC<{ task: StudyTask; moduleName: string; onToggle: () => void; onEdit: () => void; onDelete: () => void }> = ({ task, moduleName, onToggle, onEdit, onDelete }) => (
  <div className={`group rounded-2xl border p-4 shadow-sm ${task.status === 'done' ? 'border-slate-100 bg-slate-50 opacity-70' : 'border-slate-100 bg-white'}`}>
    <div className="flex items-start gap-3">
      <button onClick={onToggle} className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${task.status === 'done' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 hover:border-stellenbosch-maroon'}`}>
        {task.status === 'done' && <Check size={15} />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${CAT_TONE[task.category]}`}>{CAT_LABEL[task.category]}</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${PRIO_TONE[task.priority]}`}>{task.priority}</span>
          <span className="text-[10px] font-bold uppercase text-stellenbosch-maroon/70">{moduleName}</span>
          {task.status === 'carried_over' && <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-700">carried over</span>}
        </div>
        <p className={`font-bold ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-slate-400">
          {task.dueDate && <span>Due {task.dueDate}</span>}
          <span>{SOURCE_LABEL[task.source] ?? task.source}</span>
          {task.linkedStudyBlockId && <span className="inline-flex items-center gap-1"><Link2 size={11} /> linked block</span>}
        </div>
      </div>
      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button onClick={onEdit} className="p-1.5 text-slate-300 hover:text-stellenbosch-maroon"><Pencil size={16} /></button>
        <button onClick={onDelete} className="p-1.5 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
      </div>
    </div>
  </div>
);

const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm';

const NewTaskForm: React.FC<{ modules: Module[]; onCreate: () => void }> = ({ modules, onCreate }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [moduleId, setModuleId] = useState(modules[0]?.id ?? '');
  const [category, setCategory] = useState<TaskCategory>('MUST_DO');
  const [priority, setPriority] = useState<TaskPriority>('P2');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => { if (!moduleId && modules[0]) setModuleId(modules[0].id); }, [modules, moduleId]);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stellenbosch-maroon/25 py-3 text-sm font-bold text-stellenbosch-maroon active:scale-95">
        <Plus size={16} /> New task
      </button>
    );
  }
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" className={`${inputCls} mb-2`} />
      <div className="grid grid-cols-2 gap-2">
        <select value={moduleId} onChange={(e) => setModuleId(e.target.value)} className={inputCls}>
          {modules.map((m) => <option key={m.id} value={m.id}>{m.shortName}</option>)}
        </select>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
        <select value={category} onChange={(e) => setCategory(e.target.value as TaskCategory)} className={inputCls}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className={inputCls}>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          disabled={!title.trim() || !moduleId}
          onClick={() => { createTask({ moduleId, title, category, priority, dueDate: dueDate || null, source: 'manual' }); setTitle(''); setDueDate(''); setOpen(false); onCreate(); }}
          className="rounded-xl maroon-gradient px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
        >Add task</button>
        <button onClick={() => setOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-500">Cancel</button>
      </div>
    </div>
  );
};

const EditTaskRow: React.FC<{ task: StudyTask; modules: Module[]; onDone: () => void }> = ({ task, modules, onDone }) => {
  const [title, setTitle] = useState(task.title);
  const [moduleId, setModuleId] = useState(task.moduleId);
  const [category, setCategory] = useState<TaskCategory>(task.category);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate ?? '');
  return (
    <div className="rounded-2xl border border-stellenbosch-maroon/20 bg-white p-4 shadow-sm">
      <input value={title} onChange={(e) => setTitle(e.target.value)} className={`${inputCls} mb-2`} />
      <div className="grid grid-cols-2 gap-2">
        <select value={moduleId} onChange={(e) => setModuleId(e.target.value)} className={inputCls}>
          {modules.map((m) => <option key={m.id} value={m.id}>{m.shortName}</option>)}
        </select>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
        <select value={category} onChange={(e) => setCategory(e.target.value as TaskCategory)} className={inputCls}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className={inputCls}>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="mt-3 flex gap-2">
        <button disabled={!title.trim()} onClick={() => { updateTaskFields(task.id, { title, moduleId, category, priority, dueDate: dueDate || null }); onDone(); }} className="rounded-xl maroon-gradient px-4 py-2 text-sm font-bold text-white disabled:opacity-40 inline-flex items-center gap-1"><Check size={14} /> Save</button>
        <button onClick={onDone} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-500 inline-flex items-center gap-1"><RotateCcw size={14} /> Cancel</button>
      </div>
    </div>
  );
};

export default Tasks;
