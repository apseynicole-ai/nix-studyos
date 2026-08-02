import React, { useState } from 'react';
import { X } from 'lucide-react';
import type {
  CouldNotCompleteReason,
  Module,
  SessionCompletion,
  StudyLocation,
  StudySessionStatus,
  UnplannedActivityInput,
} from '../../studySystem';
import { formatDurationDisplay } from '../../studySystem';

const LOCATIONS: StudyLocation[] = ['Room', 'Library', 'Campus', 'Coffee shop', 'Other'];
const REASONS: { value: CouldNotCompleteReason; label: string }[] = [
  { value: 'ran_out_of_time', label: 'Ran out of time' },
  { value: 'class_overran', label: 'Class/activity overran' },
  { value: 'too_tired', label: 'Too tired' },
  { value: 'material_unclear', label: 'Material unclear' },
  { value: 'needed_another_resource', label: 'Needed another resource' },
  { value: 'unexpected_commitment', label: 'Unexpected commitment' },
  { value: 'other', label: 'Other' },
];

function Sheet({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-display text-2xl text-stellenbosch-maroon">{title}</h2>
            {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const chip = (active: boolean, tone: string) =>
  `rounded-xl px-3 py-2.5 text-sm font-bold border transition-all active:scale-95 ${active ? tone : 'border-slate-200 text-slate-500'}`;

function StatusButtons({ value, onChange }: { value: StudySessionStatus; onChange: (s: StudySessionStatus) => void }) {
  return (
    <div className="grid grid-cols-1 gap-2">
      <button type="button" onClick={() => onChange('COMPLETED')} className={chip(value === 'COMPLETED', 'border-emerald-300 bg-emerald-50 text-emerald-800')}>Completed</button>
      <button type="button" onClick={() => onChange('PARTIALLY_COMPLETED')} className={chip(value === 'PARTIALLY_COMPLETED', 'border-amber-300 bg-amber-50 text-amber-800')}>Partially completed</button>
      <button type="button" onClick={() => onChange('COULD_NOT_COMPLETE')} className={chip(value === 'COULD_NOT_COMPLETE', 'border-red-300 bg-red-50 text-red-700')}>Could not complete</button>
    </div>
  );
}

function LocationRow({ value, onChange }: { value: StudyLocation | null; onChange: (l: StudyLocation) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {LOCATIONS.map((loc) => (
        <button key={loc} type="button" onClick={() => onChange(loc)} className={chip(value === loc, 'border-stellenbosch-maroon/40 bg-stellenbosch-maroon/5 text-stellenbosch-maroon')}>{loc}</button>
      ))}
    </div>
  );
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="block text-[11px] uppercase tracking-wide font-bold text-slate-400 mb-1.5 mt-4">{children}</span>
);

export function PostSessionSheet({
  moduleName,
  exactMinutes,
  onSave,
  onDiscard,
}: {
  moduleName: string;
  exactMinutes: number;
  onSave: (c: SessionCompletion) => void;
  onDiscard: () => void;
}) {
  const [status, setStatus] = useState<StudySessionStatus>('COMPLETED');
  const [location, setLocation] = useState<StudyLocation | null>(null);
  const [output, setOutput] = useState('');
  const [followUp, setFollowUp] = useState(false);
  const [followUpText, setFollowUpText] = useState('');
  const [reason, setReason] = useState<CouldNotCompleteReason | null>(null);

  return (
    <Sheet title="Session done" subtitle={`${moduleName} · ${formatDurationDisplay(exactMinutes)}`} onClose={onDiscard}>
      <Label>Status</Label>
      <StatusButtons value={status} onChange={setStatus} />

      {status === 'COULD_NOT_COMPLETE' && (
        <>
          <Label>Reason (optional)</Label>
          <select value={reason ?? ''} onChange={(e) => setReason((e.target.value || null) as CouldNotCompleteReason | null)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
            <option value="">—</option>
            {REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </>
      )}

      <Label>Location</Label>
      <LocationRow value={location} onChange={setLocation} />

      <Label>Output / note (optional)</Label>
      <textarea value={output} onChange={(e) => setOutput(e.target.value)} rows={2} placeholder="What did you produce?" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm resize-none" />

      <label className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-600">
        <input type="checkbox" checked={followUp} onChange={(e) => setFollowUp(e.target.checked)} className="h-4 w-4 accent-stellenbosch-maroon" />
        Follow-up required?
      </label>
      {followUp && (
        <textarea value={followUpText} onChange={(e) => setFollowUpText(e.target.value)} rows={2} placeholder="e.g. Redo question 4" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm resize-none" />
      )}

      <button
        onClick={() => onSave({ status, location, output, followUpRequired: followUp, followUpText, notCompletedReason: reason })}
        className="mt-5 w-full rounded-2xl maroon-gradient py-3.5 text-sm font-bold text-white active:scale-95 transition-transform"
      >
        Save session
      </button>
    </Sheet>
  );
}

export function LogActivitySheet({
  modules,
  onSave,
  onClose,
}: {
  modules: Module[];
  onSave: (input: UnplannedActivityInput) => void;
  onClose: () => void;
}) {
  const [moduleId, setModuleId] = useState(modules[0]?.id ?? '');
  const [minutes, setMinutes] = useState(30);
  const [status, setStatus] = useState<StudySessionStatus>('COMPLETED');
  const [location, setLocation] = useState<StudyLocation | null>(null);
  const [output, setOutput] = useState('');
  const [followUp, setFollowUp] = useState(false);
  const [followUpText, setFollowUpText] = useState('');

  return (
    <Sheet title="Log activity" subtitle="Unplanned study — counts toward your time" onClose={onClose}>
      <Label>Module</Label>
      <select value={moduleId} onChange={(e) => setModuleId(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
        {modules.map((m) => <option key={m.id} value={m.id}>{m.shortName}</option>)}
      </select>

      <Label>Minutes</Label>
      <input type="number" min={1} max={480} value={minutes} onChange={(e) => setMinutes(Math.max(1, Number(e.target.value)))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />

      <Label>Status</Label>
      <StatusButtons value={status} onChange={setStatus} />

      <Label>Location</Label>
      <LocationRow value={location} onChange={setLocation} />

      <Label>Output / note (optional)</Label>
      <textarea value={output} onChange={(e) => setOutput(e.target.value)} rows={2} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm resize-none" />

      <label className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-600">
        <input type="checkbox" checked={followUp} onChange={(e) => setFollowUp(e.target.checked)} className="h-4 w-4 accent-stellenbosch-maroon" />
        Follow-up required?
      </label>
      {followUp && (
        <textarea value={followUpText} onChange={(e) => setFollowUpText(e.target.value)} rows={2} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm resize-none" />
      )}

      <button
        onClick={() => onSave({ moduleId, minutes, status, location, output, followUpRequired: followUp, followUpText })}
        disabled={!moduleId}
        className="mt-5 w-full rounded-2xl maroon-gradient py-3.5 text-sm font-bold text-white active:scale-95 transition-transform disabled:opacity-40"
      >
        Log activity
      </button>
    </Sheet>
  );
}
