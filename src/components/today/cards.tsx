import React from 'react';
import { Check, X, Ban, Play, Square, MapPin, ArrowRight, Clock } from 'lucide-react';
import type { ClassFeedItem, StudyFeedItem } from '../../studySystem';
import { formatDurationDisplay, formatStopwatch } from '../../studySystem';

const STATE_BADGE: Record<string, string> = {
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  PARTIALLY_COMPLETED: 'bg-amber-100 text-amber-800',
  IN_PROGRESS: 'bg-sky-100 text-sky-800',
  MISSED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-slate-200 text-slate-500 line-through',
  NOT_STARTED: 'bg-slate-100 text-slate-500',
};

export function DailyHeader({
  dateLabel,
  actualMinutes,
  plannedMinutes,
  doneCount,
  totalCount,
}: {
  dateLabel: string;
  actualMinutes: number;
  plannedMinutes: number;
  doneCount: number;
  totalCount: number;
}) {
  const studyPct = plannedMinutes > 0 ? Math.min(100, Math.round((actualMinutes / plannedMinutes) * 100)) : 0;
  return (
    <header className="mb-6">
      <p className="page-kicker mb-1">Today</p>
      <h1 className="font-display text-3xl md:text-4xl text-stellenbosch-maroon leading-tight mb-5">{dateLabel}</h1>

      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-slate-400">Private study</span>
          <span className="text-sm font-bold text-slate-700 tabular-nums">
            {formatDurationDisplay(actualMinutes)} <span className="text-slate-300">/</span> {formatDurationDisplay(plannedMinutes)}
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full maroon-gradient transition-all" style={{ width: `${studyPct}%` }} />
        </div>
        <p className="mt-3 text-xs text-slate-400">
          {doneCount} of {totalCount} planned items done today
        </p>
      </div>
    </header>
  );
}

const ATTEND_BTN = 'flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wide border transition-all active:scale-95';

export function ClassCard({
  item,
  moduleName,
  onAttend,
  onClear,
}: {
  item: ClassFeedItem;
  moduleName: string;
  onAttend: (state: 'ATTENDED' | 'MISSED' | 'CANCELLED') => void;
  onClear: () => void;
}) {
  const { activity, attendance } = item;
  const logged = attendance?.attendance;
  return (
    <div className={`rounded-3xl border border-slate-100 bg-white p-4 shadow-sm ${logged === 'CANCELLED' ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
            <Clock size={13} /> <span className="tabular-nums">{activity.startTime}–{activity.endTime}</span>
            <span className="uppercase tracking-wide">{activity.type}</span>
          </div>
          <h3 className="font-bold text-slate-800 truncate">{moduleName}</h3>
          {activity.venue && <p className="text-xs text-slate-400 truncate">{activity.venue}</p>}
        </div>
        {logged && (
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${STATE_BADGE[item.state]}`}>
            {logged}
          </span>
        )}
      </div>

      {logged ? (
        <button onClick={onClear} className="w-full rounded-xl py-2 text-xs font-bold text-slate-400 hover:text-stellenbosch-maroon border border-dashed border-slate-200 transition-colors">
          Change
        </button>
      ) : (
        <div className="flex gap-2">
          <button onClick={() => onAttend('ATTENDED')} className={`${ATTEND_BTN} border-emerald-200 text-emerald-700 hover:bg-emerald-50`}><Check size={14} /> Attended</button>
          <button onClick={() => onAttend('MISSED')} className={`${ATTEND_BTN} border-red-200 text-red-600 hover:bg-red-50`}><X size={14} /> Missed</button>
          <button onClick={() => onAttend('CANCELLED')} className={`${ATTEND_BTN} border-slate-200 text-slate-500 hover:bg-slate-50`}><Ban size={14} /> Cancelled</button>
        </div>
      )}
    </div>
  );
}

export function StudyCard({
  item,
  moduleName,
  runningSeconds,
  canStart,
  onStart,
  onStop,
}: {
  item: StudyFeedItem;
  moduleName: string;
  runningSeconds: number;
  canStart: boolean;
  onStart: () => void;
  onStop: () => void;
}) {
  const { block, session, isRunning, state } = item;
  return (
    <div className={`rounded-3xl border p-4 shadow-sm ${isRunning ? 'border-sky-200 bg-sky-50/60' : 'border-slate-100 bg-white'}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
            <Clock size={13} /> <span className="tabular-nums">{block.startTime}–{block.endTime}</span>
            <span className="uppercase tracking-wide text-stellenbosch-maroon/70">Study · {formatDurationDisplay(block.plannedMinutes)}</span>
          </div>
          <h3 className="font-bold text-slate-800 truncate">{moduleName}</h3>
          <p className="text-sm text-slate-500 leading-snug mt-0.5">{block.taskText}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${STATE_BADGE[state]}`}>
          {isRunning ? 'Running' : state === 'NOT_STARTED' ? 'To do' : state.replace('_', ' ')}
        </span>
      </div>

      {isRunning ? (
        <div className="mt-3 flex items-center gap-3">
          <span className="font-display text-3xl text-sky-800 tabular-nums">{formatStopwatch(runningSeconds)}</span>
          <button onClick={onStop} className="ml-auto flex items-center gap-2 rounded-xl bg-stellenbosch-maroon px-5 py-2.5 text-sm font-bold text-white active:scale-95 transition-transform">
            <Square size={15} fill="currentColor" /> Stop
          </button>
        </div>
      ) : session ? (
        <div className="mt-3 rounded-2xl bg-slate-50 border border-slate-100 p-3 text-sm">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600">
            <span className="font-bold text-slate-800">{formatDurationDisplay(session.exactMinutes)}</span>
            <span>·</span>
            <span>{session.status.replace(/_/g, ' ').toLowerCase()}</span>
            {session.location && (<><span>·</span><span className="inline-flex items-center gap-1"><MapPin size={12} />{session.location}</span></>)}
          </div>
          {session.output && <p className="mt-1 text-slate-500">{session.output}</p>}
          {session.followUpRequired && session.followUpText && (
            <p className="mt-1 text-stellenbosch-maroon font-medium inline-flex items-center gap-1"><ArrowRight size={13} /> {session.followUpText}</p>
          )}
        </div>
      ) : (
        <button
          onClick={onStart}
          disabled={!canStart}
          className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl maroon-gradient py-3 text-sm font-bold text-white active:scale-95 transition-transform disabled:opacity-40"
        >
          <Play size={15} fill="currentColor" /> {canStart ? 'Start' : 'Finish current session first'}
        </button>
      )}
    </div>
  );
}
