import React, { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { MapPin, ArrowRight, Filter } from 'lucide-react';
import { buildLogRows, modulesRepo, formatDurationDisplay, type LogFilter, type Module } from '../studySystem';

const KINDS: { value: '' | 'class' | 'study'; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'class', label: 'Classes' },
  { value: 'study', label: 'Study' },
];

const STATUS_TONE: Record<string, string> = {
  ATTENDED: 'bg-emerald-100 text-emerald-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  'PARTIALLY COMPLETED': 'bg-amber-100 text-amber-800',
  'COULD NOT COMPLETE': 'bg-red-100 text-red-700',
  MISSED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-slate-200 text-slate-500',
};

const ActivityLog: React.FC = () => {
  const [kind, setKind] = useState<'' | 'class' | 'study'>('');
  const [moduleId, setModuleId] = useState('');
  const modules = useMemo(() => modulesRepo.read(), []);
  const moduleName = (id: string) => modules.find((m: Module) => m.id === id)?.shortName ?? id;

  const filter: LogFilter = { kind: kind || undefined, moduleId: moduleId || undefined };
  const rows = useMemo(() => buildLogRows(filter), [kind, moduleId]);

  const byDate = useMemo(() => {
    const groups = new Map<string, typeof rows>();
    for (const r of rows) {
      const list = groups.get(r.date) ?? [];
      list.push(r);
      groups.set(r.date, list);
    }
    return [...groups.entries()];
  }, [rows]);

  return (
    <div className="page-shell">
      <header className="mb-6">
        <p className="page-kicker mb-1">Chronological</p>
        <h1 className="font-display text-3xl md:text-4xl text-stellenbosch-maroon">Activity Log</h1>
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Filter size={16} className="text-slate-400" />
        {KINDS.map((k) => (
          <button key={k.label} onClick={() => setKind(k.value)} className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wide border ${kind === k.value ? 'bg-stellenbosch-maroon text-white border-stellenbosch-maroon' : 'bg-white text-slate-500 border-slate-200'}`}>{k.label}</button>
        ))}
        <select value={moduleId} onChange={(e) => setModuleId(e.target.value)} className="ml-auto rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600">
          <option value="">All modules</option>
          {modules.map((m: Module) => <option key={m.id} value={m.id}>{m.shortName}</option>)}
        </select>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-10 text-center text-slate-400">
          No log entries yet. Attend a class or log study on the Today screen.
        </div>
      ) : (
        <div className="space-y-6">
          {byDate.map(([d, list]) => (
            <section key={d}>
              <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{format(parseISO(d), 'EEE d MMM yyyy')}</h2>
              <div className="space-y-2">
                {list.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                          {r.time && <span className="tabular-nums">{r.time}</span>}
                          <span className="text-stellenbosch-maroon/70">{moduleName(r.moduleId)}</span>
                        </div>
                        <p className="font-bold text-slate-800">
                          {r.title}
                          {r.minutes != null && <span className="ml-2 font-normal text-slate-500">{formatDurationDisplay(r.minutes)}</span>}
                        </p>
                        {r.detail && <p className="text-sm text-slate-500">{r.detail}</p>}
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-400">
                          {r.location && <span className="inline-flex items-center gap-1"><MapPin size={11} />{r.location}</span>}
                          {r.followUp && <span className="inline-flex items-center gap-1 text-stellenbosch-maroon"><ArrowRight size={11} />{r.followUp}</span>}
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${STATUS_TONE[r.status] ?? 'bg-slate-100 text-slate-500'}`}>{r.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
