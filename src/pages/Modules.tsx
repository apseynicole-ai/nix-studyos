import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, BookMarked, CheckCircle2, Clock3, FileText, GraduationCap, ListChecks, Pencil, Plus, Search, Target, Trash2 } from 'lucide-react';
import { modules, ModuleArea } from '../data/baccllb';
import { priorityScore, readinessLabel, riskTone } from '../lib/studyMetrics';
import {
  averageTopicConfidence,
  deleteTopicMastery,
  emptyTopicDraft,
  moduleNameForTopic,
  readTopicMastery,
  topicSuggestionsForModule,
  topicsNeedingRetestSoon,
  upsertTopicMastery,
  type ExamPriority,
  type TopicMasteryRecord,
  type TopicStatus,
} from '../lib/topicMastery';

const areas: Array<ModuleArea | 'All'> = ['All', 'Accounting', 'Law', 'Economics', 'Quantitative', 'Digital'];
const trackerModuleOptions = [{ label: 'All modules', value: 'all' }, ...modules.map((module) => ({ label: `${module.shortName} (${module.code})`, value: module.id }))];
const priorityOptions: ExamPriority[] = ['low', 'medium', 'high', 'urgent'];
const statusOptions: TopicStatus[] = ['not-started', 'learning', 'practising', 'exam-ready'];

const Modules: React.FC = () => {
  const [area, setArea] = useState<ModuleArea | 'All'>('All');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(modules[0].id);
  const [trackerModuleId, setTrackerModuleId] = useState<string>(modules[0].id);
  const [masteryRecords, setMasteryRecords] = useState<TopicMasteryRecord[]>(() => readTopicMastery());
  const [draft, setDraft] = useState<TopicMasteryRecord>(() => emptyTopicDraft(modules[0].id));
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredModules = useMemo(() => {
    return modules.filter((module) => {
      const matchesArea = area === 'All' || module.area === area;
      const query = search.toLowerCase();
      const matchesSearch = !query || [module.name, module.code, module.shortName, ...module.weakPoints].join(' ').toLowerCase().includes(query);
      return matchesArea && matchesSearch;
    });
  }, [area, search]);

  const selected = modules.find((module) => module.id === selectedId) || filteredModules[0] || modules[0];
  const SelectedIcon = selected.icon;
  const trackerModule = modules.find((module) => module.id === trackerModuleId) || selected;
  const filteredTopics = useMemo(() => {
    return masteryRecords
      .filter((item) => trackerModuleId === 'all' || item.moduleId === trackerModuleId)
      .sort((a, b) => {
        if (a.examPriority !== b.examPriority) return priorityRank(b.examPriority) - priorityRank(a.examPriority);
        return a.topicName.localeCompare(b.topicName);
      });
  }, [masteryRecords, trackerModuleId]);
  const suggestedTopics = useMemo(() => {
    if (!trackerModule) return [];
    const existingNames = new Set(
      masteryRecords
        .filter((item) => item.moduleId === trackerModule.id)
        .map((item) => item.topicName.trim().toLowerCase()),
    );
    return topicSuggestionsForModule(trackerModule).filter((item) => !existingNames.has(item.toLowerCase()));
  }, [trackerModule, masteryRecords]);
  const retestSoon = useMemo(() => topicsNeedingRetestSoon(filteredTopics), [filteredTopics]);
  const trackerAverage = useMemo(() => averageTopicConfidence(filteredTopics), [filteredTopics]);

  const startNewTopic = (moduleId = trackerModuleId === 'all' ? selected.id : trackerModuleId, topicName = '') => {
    setEditingId(null);
    setDraft({
      ...emptyTopicDraft(moduleId),
      topicName,
    });
  };

  const handleSaveTopic = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.topicName.trim()) return;
    const next = upsertTopicMastery({
      ...draft,
      id: editingId || draft.id,
      moduleId: draft.moduleId || selected.id,
      topicName: draft.topicName.trim(),
      status: deriveStatus(draft),
    });
    setMasteryRecords(next);
    setTrackerModuleId(draft.moduleId || trackerModuleId);
    startNewTopic(draft.moduleId || selected.id);
  };

  const handleEditTopic = (topic: TopicMasteryRecord) => {
    setEditingId(topic.id);
    setDraft(topic);
    setTrackerModuleId(topic.moduleId);
  };

  const handleDeleteTopic = (id: string) => {
    const confirmed = window.confirm('Delete this topic tracker entry?');
    if (!confirmed) return;
    setMasteryRecords(deleteTopicMastery(id));
    if (editingId === id) startNewTopic();
  };

  return (
    <div className="max-w-7xl mx-auto pt-8 pb-36 px-5 md:px-8">
      <header className="mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div>
          <p className="uppercase tracking-[0.35em] text-xs text-slate-400 font-bold mb-3">BAccLLB module intelligence</p>
          <h1 className="font-display text-5xl text-stellenbosch-maroon mb-3">Module Command Centre</h1>
          <p className="text-slate-500 max-w-3xl">Your module shells now reflect the actual Stellenbosch BAccLLB subjects, known weak points, A2 dates, exam focus and next actions.</p>
        </div>
        <div className="relative max-w-md w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search modules, weak spots, topics..."
            className="w-full rounded-2xl bg-white border border-slate-100 pl-11 pr-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20"
          />
        </div>
      </header>

      <div className="flex flex-wrap gap-2 mb-8">
        {areas.map((item) => (
          <button
            key={item}
            onClick={() => setArea(item)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider border transition-all ${area === item ? 'bg-stellenbosch-maroon text-white border-stellenbosch-maroon' : 'bg-white text-slate-500 border-slate-100 hover:border-stellenbosch-maroon/30'}`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-8">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
          {filteredModules.map((module) => {
            const Icon = module.icon;
            const active = selected.id === module.id;
            return (
              <motion.button
                layout
                key={module.id}
                onClick={() => setSelectedId(module.id)}
                className={`text-left rounded-[2rem] p-5 border transition-all ${active ? 'bg-white shadow-xl border-stellenbosch-maroon/20' : 'bg-white/70 border-slate-100 hover:bg-white hover:shadow-md'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${module.colour} text-white flex items-center justify-center shadow-sm shrink-0`}>
                    <Icon size={23} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-slate-800">{module.shortName}</h3>
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-500 rounded-full px-2 py-1">{module.code}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4">{module.weakPoints.slice(0, 2).join(' • ')}</p>
                    <div className="flex items-center justify-between gap-3">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex-1">
                        <div className="h-full bg-stellenbosch-maroon rounded-full" style={{ width: `${module.confidence}%` }} />
                      </div>
                      <span className="text-xs font-bold text-stellenbosch-maroon">{module.confidence}%</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </section>

        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden sticky top-6 self-start">
          <div className={`bg-gradient-to-br ${selected.colour} p-7 text-white relative overflow-hidden`}>
            <div className="absolute right-6 top-6 opacity-20"><SelectedIcon size={120} /></div>
            <div className="relative z-10">
              <p className="uppercase tracking-[0.35em] text-xs font-bold text-white/70 mb-3">{selected.area} • {selected.semester}</p>
              <h2 className="font-display text-4xl mb-2">{selected.name}</h2>
              <p className="text-white/80">Target: {selected.target}% • Confidence: {selected.confidence}% • Priority score: {priorityScore(selected.confidence, selected.target)}</p>
              <span className="mt-4 inline-flex bg-white/15 border border-white/20 rounded-full px-3 py-1 text-xs uppercase tracking-wider font-bold">{readinessLabel(selected.confidence)}</span>
            </div>
          </div>

          <div className="p-7 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InfoPanel icon={<AlertTriangle size={19} />} title="Known weak points" tone="red">
              {selected.weakPoints.map((point) => <Bullet key={point} text={point} />)}
            </InfoPanel>
            <InfoPanel icon={<Target size={19} />} title="Exam focus" tone="gold">
              {selected.examFocus.map((point) => <Bullet key={point} text={point} />)}
            </InfoPanel>
            <InfoPanel icon={<BookMarked size={19} />} title="Study system" tone="green">
              {selected.studySystem.map((point) => <Bullet key={point} text={point} />)}
            </InfoPanel>
            <InfoPanel icon={<ListChecks size={19} />} title="Next actions" tone="blue">
              {selected.nextActions.map((point) => <Bullet key={point} text={point} />)}
            </InfoPanel>
          </div>

          <div className="px-7 pb-7">
            <h3 className="font-display text-2xl text-stellenbosch-maroon mb-4 flex items-center gap-2"><Clock3 size={20} /> Assessment timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selected.assessments.map((assessment) => (
                <div key={assessment.title} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="font-bold text-slate-800">{assessment.title}</p>
                    <span className={`text-[10px] border rounded-full px-2 py-1 uppercase tracking-wider font-bold ${assessment.status === 'done' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : assessment.status === 'upcoming' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{assessment.status}</span>
                  </div>
                  <p className="text-xs text-slate-500">{assessment.date}{assessment.time ? ` • ${assessment.time}` : ''}</p>
                  {assessment.notes && <p className="text-xs text-slate-500 mt-2">{assessment.notes}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="px-7 pb-7 grid grid-cols-1 md:grid-cols-3 gap-3">
            <MiniMetric icon={<GraduationCap size={18} />} label="Target" value={`${selected.target}%`} />
            <MiniMetric icon={<FileText size={18} />} label="Area" value={selected.area} />
            <MiniMetric icon={<CheckCircle2 size={18} />} label="Status" value={readinessLabel(selected.confidence)} tone={riskTone(selected.confidence)} />
          </div>
        </section>
      </div>

      <section className="mt-10 grid grid-cols-1 xl:grid-cols-[0.92fr_1.08fr] gap-8">
        <div className="glass rounded-[2.5rem] p-7 border-slate-200/50 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="uppercase tracking-[0.35em] text-xs text-slate-400 font-bold mb-3">local-first mastery tracker</p>
              <h2 className="font-display text-4xl text-stellenbosch-maroon">Topic Mastery</h2>
              <p className="text-slate-500 mt-2">Track topic confidence, notes, practice, and retest planning locally on this device.</p>
            </div>
            <button
              type="button"
              onClick={() => startNewTopic(trackerModuleId === 'all' ? selected.id : trackerModuleId)}
              className="maroon-gradient text-white px-4 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Plus size={18} /> New topic
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <MiniMetric icon={<Target size={18} />} label="Average confidence" value={`${trackerAverage}%`} />
            <MiniMetric icon={<AlertTriangle size={18} />} label="Urgent topics" value={`${filteredTopics.filter((item) => item.examPriority === 'urgent').length}`} />
            <MiniMetric icon={<Clock3 size={18} />} label="Retests soon" value={`${retestSoon.length}`} tone={retestSoon.length > 0 ? 'bg-amber-50 text-amber-800 border-amber-100' : undefined} />
          </div>

          <form onSubmit={handleSaveTopic} className="bg-white rounded-[2rem] border border-slate-100 p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Module"
                value={draft.moduleId || selected.id}
                onChange={(value) => setDraft((current) => ({ ...current, moduleId: value }))}
                options={modules.map((module) => ({ label: `${module.shortName} (${module.code})`, value: module.id }))}
              />
              <TextField
                label="Topic name"
                value={draft.topicName}
                onChange={(value) => setDraft((current) => ({ ...current, topicName: value }))}
                placeholder="e.g. Section 36 limitation analysis"
              />
              <RangeField
                label="Confidence"
                value={draft.confidencePercent}
                onChange={(value) => setDraft((current) => ({ ...current, confidencePercent: value }))}
              />
              <SelectField
                label="Exam priority"
                value={draft.examPriority}
                onChange={(value) => setDraft((current) => ({ ...current, examPriority: value as ExamPriority }))}
                options={priorityOptions.map((item) => ({ label: labelise(item), value: item }))}
              />
              <DateField
                label="Last reviewed"
                value={draft.lastReviewed}
                onChange={(value) => setDraft((current) => ({ ...current, lastReviewed: value }))}
              />
              <DateField
                label="Retest date"
                value={draft.retestDate}
                onChange={(value) => setDraft((current) => ({ ...current, retestDate: value }))}
              />
              <SelectField
                label="Status"
                value={draft.status}
                onChange={(value) => setDraft((current) => ({ ...current, status: value as TopicStatus }))}
                options={statusOptions.map((item) => ({ label: labelise(item), value: item }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ToggleField label="Reading done" checked={draft.readDone} onChange={(checked) => setDraft((current) => ({ ...current, readDone: checked }))} />
              <ToggleField label="Notes done" checked={draft.notesDone} onChange={(checked) => setDraft((current) => ({ ...current, notesDone: checked }))} />
              <ToggleField label="Practice done" checked={draft.practiceDone} onChange={(checked) => setDraft((current) => ({ ...current, practiceDone: checked }))} />
            </div>

            <label className="block">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2 block">Notes</span>
              <textarea
                value={draft.notes}
                onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
                rows={4}
                placeholder="What still trips you up? What must you retest? What source should you revisit?"
                className="w-full rounded-3xl bg-slate-50 border border-slate-100 px-5 py-4 resize-none focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="maroon-gradient text-white px-5 py-3 rounded-2xl font-bold hover:scale-[1.01] transition-transform">
                {editingId ? 'Update topic' : 'Save topic'}
              </button>
              <button type="button" onClick={() => startNewTopic(trackerModuleId === 'all' ? selected.id : trackerModuleId)} className="px-5 py-3 rounded-2xl font-bold bg-white border border-slate-100 text-slate-600 hover:border-stellenbosch-maroon/20">
                Clear form
              </button>
            </div>
          </form>

          {trackerModule && suggestedTopics.length > 0 && (
            <div className="mt-6 bg-white rounded-[2rem] border border-slate-100 p-5">
              <h3 className="font-bold text-slate-800 mb-3">Suggested starting topics for {trackerModule.shortName}</h3>
              <div className="flex flex-wrap gap-2">
                {suggestedTopics.slice(0, 10).map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => startNewTopic(trackerModule.id, topic)}
                    className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600 hover:border-stellenbosch-maroon/20 hover:text-stellenbosch-maroon"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-4xl text-stellenbosch-maroon">Tracked Topics</h2>
              <p className="text-slate-500">Filter by module, spot low-confidence areas, and keep retests visible.</p>
            </div>
            <SelectField
              label="Filter"
              value={trackerModuleId}
              onChange={setTrackerModuleId}
              options={trackerModuleOptions}
            />
          </div>

          {retestSoon.length > 0 && (
            <div className="mb-6 rounded-[2rem] bg-amber-50 border border-amber-100 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-amber-700 font-bold mb-2">Needs retest soon</p>
              <div className="flex flex-wrap gap-2">
                {retestSoon.map((topic) => (
                  <span key={topic.id} className="px-3 py-2 rounded-xl bg-white border border-amber-100 text-sm text-amber-900">
                    {topic.topicName} • {topic.retestDate}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {filteredTopics.map((topic) => (
              <div key={topic.id} className="rounded-[2rem] border border-slate-100 bg-slate-50/60 p-5">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-bold text-slate-800">{topic.topicName}</h3>
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-stellenbosch-maroon/5 text-stellenbosch-maroon rounded-full px-2 py-1">{moduleNameForTopic(topic.moduleId)}</span>
                      <span className={`text-[10px] uppercase tracking-wider font-bold rounded-full px-2 py-1 ${priorityTone(topic.examPriority)}`}>{labelise(topic.examPriority)}</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold rounded-full px-2 py-1 bg-white text-slate-500 border border-slate-100">{labelise(topic.status)}</span>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden flex-1">
                        <div className="h-full bg-stellenbosch-maroon rounded-full" style={{ width: `${topic.confidencePercent}%` }} />
                      </div>
                      <span className="text-sm font-bold text-stellenbosch-maroon">{topic.confidencePercent}%</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-500 mb-3">
                      <CheckPill label="Read" done={topic.readDone} />
                      <CheckPill label="Notes" done={topic.notesDone} />
                      <CheckPill label="Practice" done={topic.practiceDone} />
                      {topic.lastReviewed && <span className="px-2 py-1 rounded-full bg-white border border-slate-100">Reviewed {topic.lastReviewed}</span>}
                      {topic.retestDate && <span className="px-2 py-1 rounded-full bg-white border border-slate-100">Retest {topic.retestDate}</span>}
                    </div>
                    {topic.notes && <p className="text-sm text-slate-600">{topic.notes}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleEditTopic(topic)} className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-500 hover:text-stellenbosch-maroon">
                      <Pencil size={16} />
                    </button>
                    <button type="button" onClick={() => handleDeleteTopic(topic.id)} className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-500 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredTopics.length === 0 && (
              <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
                <p className="font-display text-3xl text-stellenbosch-maroon mb-3">No topics tracked yet</p>
                <p className="text-slate-500 max-w-2xl mx-auto">
                  Start with one of the suggested weak points or add a topic manually. If a module does not have a confirmed topic list yet, use your own lecture or MegaNote topic names.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const InfoPanel: React.FC<{ icon: React.ReactNode; title: string; tone: 'red' | 'gold' | 'green' | 'blue'; children: React.ReactNode }> = ({ icon, title, tone, children }) => {
  const tones = {
    red: 'bg-red-50 text-red-700 border-red-100',
    gold: 'bg-amber-50 text-amber-700 border-amber-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
  };
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50/60 p-5">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className={`w-9 h-9 rounded-2xl border flex items-center justify-center ${tones[tone]}`}>{icon}</span>
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
};

const Bullet: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-start gap-2 text-sm text-slate-600">
    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-stellenbosch-maroon shrink-0" />
    <p>{text}</p>
  </div>
);

const MiniMetric: React.FC<{ icon: React.ReactNode; label: string; value: string; tone?: string }> = ({ icon, label, value, tone }) => (
  <div className={`rounded-2xl border p-4 ${tone || 'bg-slate-50 text-slate-700 border-slate-100'}`}>
    <div className="flex items-center gap-2 mb-2 text-stellenbosch-maroon">{icon}<span className="text-xs uppercase font-bold tracking-wider">{label}</span></div>
    <p className="font-bold text-sm">{value}</p>
  </div>
);

const TextField: React.FC<{ label: string; onChange: (value: string) => void; placeholder: string; value: string }> = ({ label, onChange, placeholder, value }) => (
  <label className="block">
    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2 block">{label}</span>
    <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20" />
  </label>
);

const DateField: React.FC<{ label: string; onChange: (value: string) => void; value: string }> = ({ label, onChange, value }) => (
  <label className="block">
    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2 block">{label}</span>
    <input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20" />
  </label>
);

const SelectField: React.FC<{ label: string; onChange: (value: string) => void; options: Array<{ label: string; value: string }>; value: string }> = ({ label, onChange, options, value }) => (
  <label className="block">
    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2 block">{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20">
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </label>
);

const RangeField: React.FC<{ label: string; onChange: (value: number) => void; value: number }> = ({ label, onChange, value }) => (
  <label className="block">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{label}</span>
      <span className="text-sm font-bold text-stellenbosch-maroon">{value}%</span>
    </div>
    <input type="range" min={0} max={100} step={5} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-stellenbosch-maroon" />
  </label>
);

const ToggleField: React.FC<{ checked: boolean; label: string; onChange: (checked: boolean) => void }> = ({ checked, label, onChange }) => (
  <button type="button" onClick={() => onChange(!checked)} className={`rounded-2xl border px-4 py-3 text-sm font-bold text-left ${checked ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-white text-slate-500 border-slate-100'}`}>
    {label}
  </button>
);

const CheckPill: React.FC<{ done: boolean; label: string }> = ({ done, label }) => (
  <span className={`px-2 py-1 rounded-full border ${done ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-white text-slate-400 border-slate-100'}`}>
    {label}
  </span>
);

function deriveStatus(topic: TopicMasteryRecord): TopicStatus {
  if (topic.practiceDone && topic.confidencePercent >= 75) return 'exam-ready';
  if (topic.practiceDone || topic.confidencePercent >= 60) return 'practising';
  if (topic.readDone || topic.notesDone || topic.confidencePercent > 0) return 'learning';
  return 'not-started';
}

function priorityRank(priority: ExamPriority) {
  return { low: 0, medium: 1, high: 2, urgent: 3 }[priority];
}

function priorityTone(priority: ExamPriority) {
  return {
    low: 'bg-slate-100 text-slate-500',
    medium: 'bg-blue-50 text-blue-700',
    high: 'bg-amber-50 text-amber-700',
    urgent: 'bg-red-50 text-red-700',
  }[priority];
}

function labelise(value: string) {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export default Modules;
