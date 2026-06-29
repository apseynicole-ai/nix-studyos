import React, { useState, useMemo } from 'react';
import { NotebookPen, Plus, Trash2, Pencil, X, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { modules } from '../data/baccllb';
import {
  createClassLogEntry,
  updateClassLogEntry,
  deleteClassLogEntry,
  readClassLogEntries,
  type ClassLogEntry,
  type ClassLogConfidence,
} from '../lib/classLog';
import { todayIsoLocal } from '../lib/dateUtils';

const CONFIDENCE_LABELS: Record<ClassLogConfidence, string> = {
  low: 'Confused',
  medium: 'Following',
  high: 'Got it',
};

const CONFIDENCE_COLORS: Record<ClassLogConfidence, string> = {
  low: 'bg-red-50 text-red-700 border-red-100',
  medium: 'bg-amber-50 text-amber-700 border-amber-100',
  high: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

const MODULE_OPTIONS = modules
  .filter((m) => m.code && !['lawpersons144', 'law101', 'toi142'].includes(m.id) || true)
  .map((m) => ({ value: m.code, label: `${m.code} — ${m.name}` }));

function emptyDraft(moduleCode = '') {
  return {
    moduleCode: moduleCode || (MODULE_OPTIONS[0]?.value ?? ''),
    date: todayIsoLocal(),
    title: '',
    rawNotes: '',
    lecturerEmphasis: '',
    examples: '',
    questions: '',
    homework: '',
    confidence: 'medium' as ClassLogConfidence,
  };
}

const ClassLog: React.FC = () => {
  const [entries, setEntries] = useState<ClassLogEntry[]>(() => readClassLogEntries());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(() => emptyDraft());
  const [moduleFilter, setModuleFilter] = useState('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredEntries = useMemo(() => {
    const sorted = [...entries].sort((a, b) => {
      const dateCmp = b.date.localeCompare(a.date);
      return dateCmp !== 0 ? dateCmp : b.createdAt.localeCompare(a.createdAt);
    });
    return moduleFilter === 'all' ? sorted : sorted.filter((e) => e.moduleCode === moduleFilter);
  }, [entries, moduleFilter]);

  const usedModuleCodes = useMemo(() => {
    const codes = new Set(entries.map((e) => e.moduleCode));
    return MODULE_OPTIONS.filter((m) => codes.has(m.value));
  }, [entries]);

  function setField<K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function openAddForm() {
    setEditingId(null);
    setDraft(emptyDraft());
    setShowForm(true);
    setDeleteConfirmId(null);
  }

  function openEditForm(entry: ClassLogEntry) {
    setEditingId(entry.id);
    setDraft({
      moduleCode: entry.moduleCode,
      date: entry.date,
      title: entry.title,
      rawNotes: entry.rawNotes,
      lecturerEmphasis: entry.lecturerEmphasis,
      examples: entry.examples,
      questions: entry.questions,
      homework: entry.homework,
      confidence: entry.confidence,
    });
    setShowForm(true);
    setDeleteConfirmId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setDraft(emptyDraft());
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.moduleCode.trim() || !draft.date.trim()) return;

    if (editingId) {
      const updated = updateClassLogEntry(editingId, draft);
      if (updated) {
        setEntries(readClassLogEntries());
      }
    } else {
      createClassLogEntry(draft);
      setEntries(readClassLogEntries());
    }
    cancelForm();
  }

  function handleDelete(id: string) {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      return;
    }
    deleteClassLogEntry(id);
    setEntries(readClassLogEntries());
    setDeleteConfirmId(null);
    if (editingId === id) cancelForm();
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="min-h-screen pb-32 px-5 md:px-8 pt-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="section-kicker mb-2">learning log</p>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl text-stellenbosch-maroon mb-2">Class Capture</h1>
            <p className="text-slate-500 text-sm max-w-lg">
              Record what happened in each lecture. Capture notes, what the lecturer stressed, examples, and your questions while the class is fresh.
            </p>
          </div>
          {!showForm && (
            <button
              onClick={openAddForm}
              className="shrink-0 maroon-gradient text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-stellenbosch-maroon/20 hover:scale-[1.02] transition-transform"
            >
              <Plus size={18} />
              Log Class
            </button>
          )}
        </div>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <section className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-stellenbosch-maroon/5 text-stellenbosch-maroon flex items-center justify-center">
                <NotebookPen size={20} />
              </div>
              <h2 className="font-display text-xl text-slate-800">
                {editingId ? 'Edit Log Entry' : 'New Class Log'}
              </h2>
            </div>
            <button onClick={cancelForm} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Module</label>
                <select
                  value={draft.moduleCode}
                  onChange={(e) => setField('moduleCode', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/30"
                  required
                >
                  {MODULE_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Date</label>
                <input
                  type="date"
                  value={draft.date}
                  onChange={(e) => setField('date', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/30"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Class Topic / Title</label>
              <input
                type="text"
                value={draft.title}
                onChange={(e) => setField('title', e.target.value)}
                placeholder="e.g. Chapter 4 — Market equilibrium"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Raw Notes</label>
              <textarea
                value={draft.rawNotes}
                onChange={(e) => setField('rawNotes', e.target.value)}
                placeholder="Everything you captured during the lecture…"
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/30 resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Lecturer Emphasis</label>
                <textarea
                  value={draft.lecturerEmphasis}
                  onChange={(e) => setField('lecturerEmphasis', e.target.value)}
                  placeholder="What did the lecturer stress or repeat?"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/30 resize-y"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Examples / Cases / Statutes</label>
                <textarea
                  value={draft.examples}
                  onChange={(e) => setField('examples', e.target.value)}
                  placeholder="Examples, cases, formulas, or statutes mentioned…"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/30 resize-y"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Questions / Confusions</label>
                <textarea
                  value={draft.questions}
                  onChange={(e) => setField('questions', e.target.value)}
                  placeholder="What didn't make sense yet?"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/30 resize-y"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Homework / Follow-up</label>
                <textarea
                  value={draft.homework}
                  onChange={(e) => setField('homework', e.target.value)}
                  placeholder="Readings, exercises, or follow-up tasks…"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/30 resize-y"
                />
              </div>
            </div>

            <div className="flex items-end justify-between gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Confidence after class</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as ClassLogConfidence[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setField('confidence', c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${draft.confidence === c ? CONFIDENCE_COLORS[c] + ' scale-105 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300'}`}
                    >
                      {CONFIDENCE_LABELS[c]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="maroon-gradient text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform shadow-sm shadow-stellenbosch-maroon/20"
                >
                  {editingId ? 'Save Changes' : 'Log This Class'}
                </button>
              </div>
            </div>
          </form>
        </section>
      )}

      {/* Module filter */}
      {entries.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setModuleFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${moduleFilter === 'all' ? 'bg-stellenbosch-maroon text-white border-stellenbosch-maroon' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
          >
            All modules
          </button>
          {usedModuleCodes.map((m) => (
            <button
              key={m.value}
              onClick={() => setModuleFilter(m.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${moduleFilter === m.value ? 'bg-stellenbosch-maroon text-white border-stellenbosch-maroon' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
            >
              {m.value}
            </button>
          ))}
        </div>
      )}

      {/* Entry list */}
      {filteredEntries.length > 0 ? (
        <div className="space-y-3">
          {filteredEntries.map((entry) => {
            const expanded = expandedIds.has(entry.id);
            const isDeleting = deleteConfirmId === entry.id;
            return (
              <div
                key={entry.id}
                className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden"
              >
                {/* Card header */}
                <div className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-bold text-stellenbosch-maroon bg-stellenbosch-maroon/5 px-2 py-0.5 rounded-lg">
                          {entry.moduleCode}
                        </span>
                        <span className="text-xs text-slate-400">{entry.date}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${CONFIDENCE_COLORS[entry.confidence]}`}>
                          {CONFIDENCE_LABELS[entry.confidence]}
                        </span>
                      </div>
                      <p className="font-bold text-slate-800 text-sm leading-snug">
                        {entry.title || <span className="text-slate-400 italic">No title</span>}
                      </p>
                      {!expanded && entry.rawNotes && (
                        <p className="text-slate-500 text-xs mt-1 line-clamp-2">{entry.rawNotes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditForm(entry)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-stellenbosch-maroon hover:bg-stellenbosch-maroon/5 transition-colors"
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      {isDeleting ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="text-[10px] font-bold text-white bg-red-500 px-2 py-1 rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-[10px] font-bold text-slate-500 border border-slate-200 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            Keep
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => toggleExpand(entry.id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                        aria-label={expanded ? 'Collapse' : 'Expand'}
                      >
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded content */}
                {expanded && (
                  <div className="border-t border-slate-100 px-5 py-4 space-y-3 bg-slate-50/50">
                    {entry.rawNotes && (
                      <ExpandField label="Raw Notes" content={entry.rawNotes} />
                    )}
                    {entry.lecturerEmphasis && (
                      <ExpandField label="Lecturer Emphasis" content={entry.lecturerEmphasis} />
                    )}
                    {entry.examples && (
                      <ExpandField label="Examples / Cases / Statutes" content={entry.examples} />
                    )}
                    {entry.questions && (
                      <ExpandField label="Questions / Confusions" content={entry.questions} />
                    )}
                    {entry.homework && (
                      <ExpandField label="Homework / Follow-up" content={entry.homework} />
                    )}
                    {!entry.rawNotes && !entry.lecturerEmphasis && !entry.examples && !entry.questions && !entry.homework && (
                      <p className="text-slate-400 text-xs italic">No additional detail captured.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-stellenbosch-maroon/5 text-stellenbosch-maroon flex items-center justify-center mx-auto mb-4">
            <BookOpen size={28} />
          </div>
          <h2 className="font-display text-2xl text-slate-700 mb-2">
            {moduleFilter !== 'all' ? `No logs for ${moduleFilter}` : 'No class logs yet'}
          </h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
            {moduleFilter !== 'all'
              ? 'Switch to "All modules" or add a new entry for this module.'
              : 'Log your first class to start building a record of what was covered, what the lecturer stressed, and what you still need to follow up on.'}
          </p>
          {!showForm && (
            <button
              onClick={openAddForm}
              className="maroon-gradient text-white px-5 py-3 rounded-2xl font-bold inline-flex items-center gap-2 shadow-lg shadow-stellenbosch-maroon/20 hover:scale-[1.02] transition-transform"
            >
              <Plus size={18} />
              Log First Class
            </button>
          )}
        </section>
      )}
    </div>
  );
};

const ExpandField: React.FC<{ label: string; content: string }> = ({ label, content }) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
    <p className="text-sm text-slate-700 whitespace-pre-wrap">{content}</p>
  </div>
);

export default ClassLog;
