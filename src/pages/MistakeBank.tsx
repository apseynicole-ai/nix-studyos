import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, ClipboardList, Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { modules } from '../data/baccllb';
import {
  deleteMistake,
  emptyMistakeDraft,
  mistakeRetestsDueSoon,
  moduleLabel,
  readMistakeBank,
  readTopicOptionsForModule,
  unresolvedMistakes,
  upsertMistake,
  type MistakeRecord,
  type MistakeSourceType,
} from '../lib/mistakeBank';

const sourceTypes: MistakeSourceType[] = ['test', 'tutorial', 'past-paper', 'class-example', 'assignment', 'self-study', 'other'];

const MistakeBank: React.FC = () => {
  const [records, setRecords] = useState<MistakeRecord[]>(() => readMistakeBank());
  const [moduleFilter, setModuleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');
  const [dueSoonOnly, setDueSoonOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<MistakeRecord>(() => emptyMistakeDraft(modules[0].id));

  const topicOptions = useMemo(() => readTopicOptionsForModule(draft.moduleId), [draft.moduleId, records]);

  const filteredRecords = useMemo(() => {
    return records
      .filter((item) => moduleFilter === 'all' || item.moduleId === moduleFilter)
      .filter((item) => statusFilter === 'all' || (statusFilter === 'resolved' ? item.resolved : !item.resolved))
      .filter((item) => !dueSoonOnly || mistakeRetestsDueSoon([item]).length > 0)
      .filter((item) => {
        const query = search.trim().toLowerCase();
        if (!query) return true;
        return [
          item.mistakeTitle,
          item.mistakeDescription,
          item.whyItHappened,
          item.correctionRule,
          item.sourceReference,
          item.topicName,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => {
        if (Number(a.resolved) !== Number(b.resolved)) return Number(a.resolved) - Number(b.resolved);
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [records, moduleFilter, statusFilter, dueSoonOnly, search]);

  const dueSoon = useMemo(() => mistakeRetestsDueSoon(records), [records]);
  const unresolved = useMemo(() => unresolvedMistakes(records), [records]);
  const finalBossRetestList = useMemo(
    () =>
      records.filter((item) => !item.resolved || (item.retestDate && mistakeRetestsDueSoon([item]).length > 0)),
    [records],
  );

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.mistakeTitle.trim() || !draft.correctionRule.trim()) return;

    const next = upsertMistake({
      ...draft,
      id: editingId || draft.id,
      mistakeTitle: draft.mistakeTitle.trim(),
      mistakeDescription: draft.mistakeDescription.trim(),
      whyItHappened: draft.whyItHappened.trim(),
      correctionRule: draft.correctionRule.trim(),
      topicName: draft.topicName?.trim() || '',
    });
    setRecords(next);
    setEditingId(null);
    setDraft(emptyMistakeDraft(draft.moduleId));
  };

  const handleEdit = (record: MistakeRecord) => {
    setEditingId(record.id);
    setDraft(record);
  };

  const handleDelete = (id: string) => {
    const confirmed = window.confirm('Delete this mistake from the local Mistake Bank?');
    if (!confirmed) return;
    setRecords(deleteMistake(id));
    if (editingId === id) {
      setEditingId(null);
      setDraft(emptyMistakeDraft(modules[0].id));
    }
  };

  const handleToggleResolved = (record: MistakeRecord) => {
    setRecords(
      upsertMistake({
        ...record,
        resolved: !record.resolved,
      }),
    );
  };

  return (
    <div className="max-w-7xl mx-auto pt-8 pb-36 px-5 md:px-8">
      <header className="mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div>
          <p className="uppercase tracking-[0.35em] text-xs text-slate-400 font-bold mb-3">local-first correction loop</p>
          <h1 className="font-display text-5xl text-stellenbosch-maroon mb-3">Mistake Bank</h1>
          <p className="text-slate-500 max-w-3xl">Turn lost marks into explicit correction rules, retest dates, and a Final Boss retest list saved on this device.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setDraft(emptyMistakeDraft(modules[0].id));
          }}
          className="maroon-gradient text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-stellenbosch-maroon/20 hover:scale-105 transition-transform"
        >
          <Plus size={18} /> New mistake
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <SummaryCard icon={<AlertTriangle size={20} />} label="Unresolved mistakes" value={unresolved.length} />
        <SummaryCard icon={<RotateCcw size={20} />} label="Retests due soon" value={dueSoon.length} />
        <SummaryCard icon={<ClipboardList size={20} />} label="Final Boss retest list" value={finalBossRetestList.length} />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[0.92fr_1.08fr] gap-8">
        <section className="glass rounded-[2.5rem] p-7 border-slate-200/50 shadow-sm">
          <h2 className="font-display text-3xl text-stellenbosch-maroon mb-5">{editingId ? 'Edit mistake' : 'Log a mistake'}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Module"
                value={draft.moduleId}
                onChange={(value) => setDraft((current) => ({ ...current, moduleId: value, topicId: '', topicName: '' }))}
                options={modules.map((module) => ({ label: `${module.shortName} (${module.code})`, value: module.id }))}
              />
              <SelectField
                label="Source type"
                value={draft.sourceType}
                onChange={(value) => setDraft((current) => ({ ...current, sourceType: value as MistakeSourceType }))}
                options={sourceTypes.map((item) => ({ label: labelise(item), value: item }))}
              />
              {topicOptions.length > 0 && (
                <SelectField
                  label="Linked topic (optional)"
                  value={draft.topicId || ''}
                  onChange={(value) => {
                    const linkedTopic = topicOptions.find((item) => item.id === value);
                    setDraft((current) => ({
                      ...current,
                      topicId: value,
                      topicName: linkedTopic?.topicName || current.topicName,
                    }));
                  }}
                  options={[{ label: 'No linked topic', value: '' }, ...topicOptions.map((topic) => ({ label: topic.topicName, value: topic.id }))]}
                />
              )}
              <TextField
                label="Topic name (optional)"
                value={draft.topicName || ''}
                onChange={(value) => setDraft((current) => ({ ...current, topicName: value }))}
                placeholder="Free-text topic if exact topic tracking is uncertain"
              />
              <TextField
                label="Mistake title"
                value={draft.mistakeTitle}
                onChange={(value) => setDraft((current) => ({ ...current, mistakeTitle: value }))}
                placeholder="e.g. Misapplied section 36 proportionality step"
              />
              <TextField
                label="Source reference"
                value={draft.sourceReference}
                onChange={(value) => setDraft((current) => ({ ...current, sourceReference: value }))}
                placeholder="e.g. A2 Q3, Tutorial 5, Past Paper 2025"
              />
              <DateField
                label="Retest date"
                value={draft.retestDate}
                onChange={(value) => setDraft((current) => ({ ...current, retestDate: value }))}
              />
              <NumberField
                label="Mark lost (optional)"
                value={draft.markLost ?? ''}
                onChange={(value) => setDraft((current) => ({ ...current, markLost: value === '' ? undefined : Number(value) }))}
              />
            </div>

            <TextAreaField
              label="Mistake description"
              value={draft.mistakeDescription}
              onChange={(value) => setDraft((current) => ({ ...current, mistakeDescription: value }))}
              placeholder="What exactly went wrong in the answer, method, or reasoning?"
            />
            <TextAreaField
              label="Why it happened"
              value={draft.whyItHappened}
              onChange={(value) => setDraft((current) => ({ ...current, whyItHappened: value }))}
              placeholder="Why did you miss it? Timing, confusion, formula choice, issue spotting, reading, memory?"
            />
            <TextAreaField
              label="Correction rule"
              value={draft.correctionRule}
              onChange={(value) => setDraft((current) => ({ ...current, correctionRule: value }))}
              placeholder="What rule, process, or trigger should you use next time?"
            />

            <label className="flex items-center gap-3 text-sm font-medium text-slate-600">
              <input
                type="checkbox"
                checked={draft.resolved}
                onChange={(event) => setDraft((current) => ({ ...current, resolved: event.target.checked }))}
                className="w-4 h-4 accent-stellenbosch-maroon"
              />
              Mark as resolved
            </label>

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="maroon-gradient text-white px-5 py-3 rounded-2xl font-bold hover:scale-[1.01] transition-transform">
                {editingId ? 'Update mistake' : 'Save mistake'}
              </button>
              <button type="button" onClick={() => { setEditingId(null); setDraft(emptyMistakeDraft(modules[0].id)); }} className="px-5 py-3 rounded-2xl font-bold bg-white border border-slate-100 text-slate-600 hover:border-stellenbosch-maroon/20">
                Clear form
              </button>
            </div>
          </form>
        </section>

        <section className="bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-3xl text-stellenbosch-maroon">Final Boss Retest List</h2>
              <p className="text-slate-500">Unresolved mistakes and near-term retests stay visible until corrected.</p>
            </div>
            <div className="relative max-w-md w-full">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search mistakes, topics, rules..."
                className="w-full rounded-2xl bg-slate-50 border border-slate-100 pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_0.9fr_0.7fr] gap-3 mb-6">
            <SelectField
              label="Module filter"
              value={moduleFilter}
              onChange={setModuleFilter}
              options={[{ label: 'All modules', value: 'all' }, ...modules.map((module) => ({ label: `${module.shortName} (${module.code})`, value: module.id }))]}
            />
            <SelectField
              label="Status filter"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as 'all' | 'unresolved' | 'resolved')}
              options={[
                { label: 'All mistakes', value: 'all' },
                { label: 'Unresolved only', value: 'unresolved' },
                { label: 'Resolved only', value: 'resolved' },
              ]}
            />
            <label className="flex items-end">
              <button
                type="button"
                onClick={() => setDueSoonOnly((current) => !current)}
                className={`w-full rounded-2xl border px-4 py-3 text-sm font-bold ${dueSoonOnly ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}
              >
                {dueSoonOnly ? 'Showing due soon' : 'Filter due soon'}
              </button>
            </label>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/50 px-6 py-14 text-center">
              <p className="font-display text-3xl text-stellenbosch-maroon mb-3">No mistakes logged yet.</p>
              <p className="text-slate-500 max-w-2xl mx-auto">Add mistakes from tests, tutorials, past papers, or self-study. Mistakes are saved locally on this device.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <motion.div key={record.id} layout className="rounded-[2rem] border border-slate-100 bg-slate-50/60 p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-bold text-slate-800">{record.mistakeTitle}</h3>
                        <span className="text-[10px] uppercase tracking-wider font-bold bg-stellenbosch-maroon/5 text-stellenbosch-maroon rounded-full px-2 py-1">{moduleLabel(record.moduleId)}</span>
                        <span className={`text-[10px] uppercase tracking-wider font-bold rounded-full px-2 py-1 ${record.resolved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {record.resolved ? 'Resolved' : 'Unresolved'}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-bold rounded-full px-2 py-1 bg-white text-slate-500 border border-slate-100">
                          {labelise(record.sourceType)}
                        </span>
                      </div>
                      {record.topicName && <p className="text-sm font-medium text-slate-500 mb-2">Topic: {record.topicName}</p>}
                      <p className="text-sm text-slate-600 mb-3">{record.mistakeDescription}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <InfoBlock title="Why it happened" text={record.whyItHappened || 'Not captured yet.'} />
                        <InfoBlock title="Correction rule" text={record.correctionRule} highlight />
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                        {record.sourceReference && <span className="px-2 py-1 rounded-full bg-white border border-slate-100">{record.sourceReference}</span>}
                        {record.markLost !== undefined && <span className="px-2 py-1 rounded-full bg-white border border-slate-100">{record.markLost} mark{record.markLost === 1 ? '' : 's'} lost</span>}
                        {record.retestDate && <span className="px-2 py-1 rounded-full bg-white border border-slate-100">Retest {record.retestDate}</span>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => handleToggleResolved(record)} className={`px-4 py-3 rounded-2xl font-bold text-sm ${record.resolved ? 'bg-slate-900 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                        {record.resolved ? 'Reopen' : 'Resolve'}
                      </button>
                      <button type="button" onClick={() => handleEdit(record)} className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-500 hover:text-stellenbosch-maroon">
                        <Pencil size={16} />
                      </button>
                      <button type="button" onClick={() => handleDelete(record.id)} className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-500 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const SummaryCard: React.FC<{ icon: React.ReactNode; label: string; value: number }> = ({ icon, label, value }) => (
  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
    <div className="flex items-center justify-between gap-3 mb-5">
      <div className="w-12 h-12 rounded-2xl bg-stellenbosch-maroon/5 text-stellenbosch-maroon flex items-center justify-center">
        {icon}
      </div>
      <AlertTriangle size={18} className="text-slate-200" />
    </div>
    <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">{label}</p>
    <p className="font-display text-4xl text-slate-900 mt-1">{value}</p>
  </div>
);

const SelectField: React.FC<{ label: string; value: string; onChange: (value: string) => void; options: Array<{ label: string; value: string }> }> = ({ label, value, onChange, options }) => (
  <label className="block">
    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2 block">{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20">
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </label>
);

const TextField: React.FC<{ label: string; value: string; onChange: (value: string) => void; placeholder: string }> = ({ label, value, onChange, placeholder }) => (
  <label className="block">
    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2 block">{label}</span>
    <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20" />
  </label>
);

const NumberField: React.FC<{ label: string; value: number | ''; onChange: (value: string) => void }> = ({ label, value, onChange }) => (
  <label className="block">
    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2 block">{label}</span>
    <input type="number" min={0} step={1} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20" />
  </label>
);

const DateField: React.FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => (
  <label className="block">
    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2 block">{label}</span>
    <input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20" />
  </label>
);

const TextAreaField: React.FC<{ label: string; value: string; onChange: (value: string) => void; placeholder: string }> = ({ label, value, onChange, placeholder }) => (
  <label className="block">
    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2 block">{label}</span>
    <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} placeholder={placeholder} className="w-full rounded-3xl bg-slate-50 border border-slate-100 px-5 py-4 resize-none focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20" />
  </label>
);

const InfoBlock: React.FC<{ title: string; text: string; highlight?: boolean }> = ({ title, text, highlight = false }) => (
  <div className={`rounded-2xl border p-4 ${highlight ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100'}`}>
    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">{title}</p>
    <p className="text-sm text-slate-700">{text}</p>
  </div>
);

function labelise(value: string) {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export default MistakeBank;
