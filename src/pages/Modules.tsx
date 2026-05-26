import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, BookMarked, CheckCircle2, Clock3, FileText, GraduationCap, ListChecks, Pencil, Plus, RefreshCcw, Search, ShieldCheck, Target, Trash2 } from 'lucide-react';
import { modules, ModuleArea } from '../data/baccllb';
import { getEffectiveModuleConfidence, readModuleConfidenceOverrides, setModuleConfidenceOverride, type ModuleConfidenceOverrideMap } from '../lib/moduleConfidence';
import { moduleFlags, priorityScore, readinessLabel, riskTone } from '../lib/studyMetrics';
import { getNextBestActions, type NextBestAction } from '../lib/nextBestAction';
import ProgressBar from '../components/ui/ProgressBar';
import ProgressBadge from '../components/ui/ProgressBadge';
import {
  averageTopicConfidence,
  deriveTopicStrengthLabel,
  deleteTopicMastery,
  deriveTopicStatus,
  emptyTopicDraft,
  markTopicReviewedToday,
  moduleNameForTopic,
  readTopicMastery,
  resetTopicMasteryRecord,
  topicSuggestionsForModule,
  topicsNeedingRetestSoon,
  updateTopicQuickAction,
  upsertTopicMastery,
  type ExamPriority,
  type TopicMasteryRecord,
} from '../lib/topicMastery';
import { calculateTopicProgress, clampProgress } from '../lib/progressMetrics';

const areas: Array<ModuleArea | 'All'> = ['All', 'Accounting', 'Law', 'Economics', 'Quantitative', 'Digital'];
const trackerModuleOptions = [{ label: 'All modules', value: 'all' }, ...modules.map((module) => ({ label: `${module.shortName} (${module.code})`, value: module.id }))];
const priorityOptions: ExamPriority[] = ['low', 'medium', 'high', 'urgent'];

const Modules: React.FC = () => {
  const [area, setArea] = useState<ModuleArea | 'All'>('All');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(modules[0].id);
  const [trackerModuleId, setTrackerModuleId] = useState<string>(modules[0].id);
  const [masteryRecords, setMasteryRecords] = useState<TopicMasteryRecord[]>(() => readTopicMastery());
  const [draft, setDraft] = useState<TopicMasteryRecord>(() => emptyTopicDraft(modules[0].id));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confidenceOverrides, setConfidenceOverrides] = useState<ModuleConfidenceOverrideMap>(() => readModuleConfidenceOverrides());

  const effectiveConfidence = (moduleId: string) => {
    const override = confidenceOverrides[moduleId];
    if (override) return override.confidence;
    return getEffectiveModuleConfidence(moduleId);
  };

  const filteredModules = useMemo(() => {
    return modules.filter((module) => {
      const matchesArea = area === 'All' || module.area === area;
      const query = search.toLowerCase();
      const matchesSearch =
        !query ||
        [
          module.name,
          module.code,
          module.shortName,
          module.programmeContext,
          ...module.aliases,
          ...module.weakPoints,
          ...module.topics.map((topic) => topic.title),
          ...module.subtopics,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query);
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
  const moduleActionsMap = useMemo(
    () =>
      Object.fromEntries(
        modules.map((module) => [module.id, getNextBestActions({ moduleId: module.id, limit: 3 })]),
      ) as Record<string, NextBestAction[]>,
    [masteryRecords],
  );
  const selectedActions = moduleActionsMap[selected.id] || [];
  const masteryByModule = useMemo(
    () => modules.reduce<Record<string, TopicMasteryRecord[]>>((acc, module) => {
      acc[module.id] = masteryRecords.filter((item) => item.moduleId === module.id);
      return acc;
    }, {}),
    [masteryRecords],
  );
  const selectedModuleTopics = masteryByModule[selected.id] || [];
  const selectedReadProgress = progressFromBoolean(selectedModuleTopics, 'readDone');
  const selectedNotesProgress = progressFromBoolean(selectedModuleTopics, 'notesDone');
  const selectedPracticeProgress = progressFromBoolean(selectedModuleTopics, 'practiceDone');
  const selectedConfidence = effectiveConfidence(selected.id);
  const selectedConfidenceMeta = confidenceOverrides[selected.id] ?? null;
  const selectedExamReadyProgress = selectedModuleTopics.length
    ? clampProgress((selectedModuleTopics.filter((topic) => topic.finalBossReady || topic.status === 'exam-ready').length / selectedModuleTopics.length) * 100)
    : 0;
  const selectedFinalBossReadyCount = selectedModuleTopics.filter((topic) => topic.finalBossReady).length;

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
      status: deriveTopicStatus(draft),
      statusLabel: deriveTopicStrengthLabel(draft),
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

  const handleResetTopic = (topic: TopicMasteryRecord) => {
    const confirmed = window.confirm(`Reset tracker progress for "${topic.topicName}"? This keeps the topic name but clears confidence, practice, notes, dates, and Final Boss readiness.`);
    if (!confirmed) return;
    const next = resetTopicMasteryRecord(topic.id);
    setMasteryRecords(next);
    if (editingId === topic.id) {
      const refreshed = next.find((item) => item.id === topic.id);
      if (refreshed) {
        setDraft(refreshed);
      }
    }
  };

  const handleQuickUpdate = (id: string, updater: (record: TopicMasteryRecord) => TopicMasteryRecord) => {
    const next = updateTopicQuickAction(id, (record) => {
      const updated = updater(record);
      return {
        ...updated,
        status: deriveTopicStatus(updated),
        statusLabel: deriveTopicStrengthLabel(updated),
      };
    });
    setMasteryRecords(next);
    if (editingId === id) {
      const refreshed = next.find((item) => item.id === id);
      if (refreshed) setDraft(refreshed);
    }
  };

  const adjustConfidence = (moduleId: string, delta: number) => {
    const nextValue = Math.max(0, Math.min(100, effectiveConfidence(moduleId) + delta));
    setConfidenceOverrides(setModuleConfidenceOverride(moduleId, nextValue));
  };

  return (
    <div className="page-shell">
      <header className="mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div>
          <p className="page-kicker">BAccLLB module intelligence</p>
          <h1 className="page-title">Module Command Centre</h1>
          <p className="page-subtitle">Your module shells now reflect the actual Stellenbosch BAccLLB subjects, known weak points, A2 dates, exam focus and next actions.</p>
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
            const moduleConfidence = effectiveConfidence(module.id);
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
                      {moduleFlags(module).slice(0, 2).map((flag) => (
                        <span key={flag.label} className={`text-[10px] uppercase font-bold tracking-wider border rounded-full px-2 py-1 ${flag.tone}`}>
                          {flag.label}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4">{module.weakPoints.slice(0, 2).join(' • ')}</p>
                    {moduleActionsMap[module.id]?.[0] && (
                      <p className="text-xs text-stellenbosch-maroon font-medium mb-3 line-clamp-2">
                        Next: {moduleActionsMap[module.id][0].title}
                      </p>
                    )}
                    <div className="space-y-2">
                      <ProgressBar
                        value={calculateTopicProgress(masteryByModule[module.id] || [])}
                        label="Topic progress"
                        tone="maroon"
                        size="sm"
                      />
                      <div className="flex items-center justify-between gap-3">
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex-1">
                          <div className="h-full bg-stellenbosch-maroon rounded-full" style={{ width: `${moduleConfidence}%` }} />
                        </div>
                        <span className="text-xs font-bold text-stellenbosch-maroon">{moduleConfidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </section>

        <section className="editorial-panel overflow-hidden sticky top-6 self-start">
          <div className={`bg-gradient-to-br ${selected.colour} p-7 text-white relative overflow-hidden`}>
            <div className="absolute right-6 top-6 opacity-20"><SelectedIcon size={120} /></div>
            <div className="relative z-10">
              <p className="uppercase tracking-[0.35em] text-xs font-bold text-white/70 mb-3">{selected.area} • {selected.semester}</p>
              <h2 className="font-display text-4xl mb-2">{selected.name}</h2>
              <p className="text-white/80">Target: {selected.target}% • Confidence: {selectedConfidence}% • Priority score: {priorityScore(selectedConfidence, selected.target)}</p>
              <span className="mt-4 inline-flex bg-white/15 border border-white/20 rounded-full px-3 py-1 text-xs uppercase tracking-wider font-bold">{readinessLabel(selectedConfidence)}</span>
              <div className="mt-4 flex flex-wrap gap-2">
                {moduleFlags(selected).map((flag) => (
                  <span key={flag.label} className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-white">
                    {flag.label}
                  </span>
                ))}
              </div>
              <div className="mt-5 max-w-xl rounded-[1.75rem] border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/70">Confidence override</p>
                    <p className="mt-2 text-2xl font-display text-white">{selectedConfidence}% effective confidence</p>
                    <p className="mt-1 text-sm text-white/75">
                      Base confidence is {selected.confidence}%. Update this when your real current confidence shifts.
                    </p>
                    {selectedConfidenceMeta?.updatedAt && (
                      <p className="mt-2 text-xs text-white/65">
                        Last updated {new Date(selectedConfidenceMeta.updatedAt).toLocaleString('en-ZA', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[-10, -5, 5, 10].map((delta) => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() => adjustConfidence(selected.id, delta)}
                        className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/20"
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
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
            <InfoPanel icon={<BookMarked size={19} />} title="Source status" tone="gold">
              {selected.sourceStatus.items.slice(0, 5).map((item) => (
                <Bullet
                  key={item.label}
                  text={`${item.label}: ${item.status}${item.note ? ` - ${item.note}` : ''}`}
                />
              ))}
            </InfoPanel>
            <InfoPanel icon={<FileText size={19} />} title="Assessment rules" tone="blue">
              {selected.assessmentRules.riskWarnings.slice(0, 4).map((point) => <Bullet key={point} text={point} />)}
            </InfoPanel>
          </div>

          <div className="px-7 pb-7">
            <h3 className="font-display text-2xl text-stellenbosch-maroon mb-4">Module next best actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {selectedActions.map((action) => (
                <div key={action.id} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`text-[10px] uppercase font-bold tracking-wider rounded-full px-2 py-1 ${actionPriorityTone(action.priority)}`}>{action.priority}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider rounded-full px-2 py-1 bg-white text-slate-500 border border-slate-100">{action.actionType}</span>
                  </div>
                  <p className="font-bold text-slate-800">{action.title}</p>
                  <p className="text-xs text-slate-500 mt-2">{action.reason}</p>
                  <p className="text-xs text-stellenbosch-maroon mt-3">{action.suggestedStudyMethod}</p>
                </div>
              ))}
              {selectedActions.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-500">
                  No module-specific actions yet. Add marks, topics, or mistakes for sharper prioritisation.
                </div>
              )}
            </div>
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
                  {(assessment.venue || assessment.durationMinutes || assessment.confidence) && (
                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-wider font-bold">
                      {assessment.venue && (
                        <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-slate-600">
                          {assessment.venue}
                        </span>
                      )}
                      {assessment.durationMinutes && (
                        <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-slate-600">
                          {Math.round(assessment.durationMinutes / 60)}h{assessment.durationMinutes % 60 ? ` ${assessment.durationMinutes % 60}m` : ''}
                        </span>
                      )}
                      {assessment.confidence === 'provisional' ? (
                        <span className="rounded-full border border-amber-100 bg-amber-50 px-2 py-1 text-amber-800">
                          Venue provisional
                        </span>
                      ) : assessment.confidence === 'high' ? (
                        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-emerald-800">
                          Verified timetable
                        </span>
                      ) : null}
                    </div>
                  )}
                  {assessment.notes && <p className="text-xs text-slate-500 mt-2">{assessment.notes}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="px-7 pb-7">
            <h3 className="font-display text-2xl text-stellenbosch-maroon mb-4">Exact topic map</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selected.topics.slice(0, 6).map((topic) => (
                <div key={topic.id} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="font-bold text-slate-800">{topic.title}</p>
                    {topic.needsVerification && (
                      <span className="text-[10px] uppercase font-bold tracking-wider border rounded-full px-2 py-1 bg-amber-50 text-amber-800 border-amber-100">
                        Needs verification
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{topic.subtopics.slice(0, 4).join(' • ') || 'Subtopics still being mapped.'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-7 pb-7 grid grid-cols-1 md:grid-cols-3 gap-3">
            <MiniMetric icon={<GraduationCap size={18} />} label="Target" value={`${selected.target}%`} />
            <MiniMetric icon={<FileText size={18} />} label="Current mark" value={selected.currentMarks.overall === null ? 'Missing' : `${selected.currentMarks.overall}%`} />
            <MiniMetric icon={<CheckCircle2 size={18} />} label="Status" value={readinessLabel(selectedConfidence)} tone={riskTone(selectedConfidence)} />
          </div>

          <div className="px-7 pb-7">
            <div className="flex flex-wrap gap-2 mb-4">
              <ProgressBadge value={calculateTopicProgress(selectedModuleTopics)} label="Overall topic progress" tone="maroon" />
              <ProgressBadge value={selectedExamReadyProgress} label="Exam-ready topics" tone="emerald" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProgressBar value={selectedReadProgress} label="Read done" helper={selectedModuleTopics.length ? `${selectedModuleTopics.filter((topic) => topic.readDone).length} of ${selectedModuleTopics.length} tracked topics` : 'No tracked topics yet'} tone="slate" />
              <ProgressBar value={selectedNotesProgress} label="Notes done" helper={selectedModuleTopics.length ? `${selectedModuleTopics.filter((topic) => topic.notesDone).length} of ${selectedModuleTopics.length} tracked topics` : 'No tracked topics yet'} tone="amber" />
              <ProgressBar value={selectedPracticeProgress} label="Practice done" helper={selectedModuleTopics.length ? `${selectedModuleTopics.filter((topic) => topic.practiceDone).length} of ${selectedModuleTopics.length} tracked topics` : 'No tracked topics yet'} tone="maroon" />
              <ProgressBar value={selectedExamReadyProgress} label="Final Boss ready" helper={selectedModuleTopics.length ? `${selectedFinalBossReadyCount} of ${selectedModuleTopics.length} topics marked Final Boss ready` : 'No tracked topics yet'} tone="emerald" />
            </div>
          </div>
        </section>
      </div>

      <section className="mt-10 grid grid-cols-1 xl:grid-cols-[0.92fr_1.08fr] gap-8">
        <div className="editorial-muted-panel p-7 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="uppercase tracking-[0.35em] text-xs text-slate-400 font-bold mb-3">local-first mastery tracker</p>
              <h2 className="font-display text-4xl text-stellenbosch-maroon">Topic Tracker</h2>
              <p className="text-slate-500 mt-2">Track confidence, practice count, review dates, retest planning, notes, and Final Boss readiness locally on this device.</p>
            </div>
            <button
              type="button"
              onClick={() => startNewTopic(trackerModuleId === 'all' ? selected.id : trackerModuleId)}
              className="maroon-gradient text-white px-4 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Plus size={18} /> New topic
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
            <MiniMetric icon={<Target size={18} />} label="Average confidence" value={`${trackerAverage}%`} />
            <MiniMetric icon={<AlertTriangle size={18} />} label="Urgent topics" value={`${filteredTopics.filter((item) => item.examPriority === 'urgent').length}`} />
            <MiniMetric icon={<Clock3 size={18} />} label="Retests soon" value={`${retestSoon.length}`} tone={retestSoon.length > 0 ? 'bg-amber-50 text-amber-800 border-amber-100' : undefined} />
            <MiniMetric icon={<ShieldCheck size={18} />} label="Final Boss ready" value={`${filteredTopics.filter((item) => item.finalBossReady).length}`} tone={filteredTopics.some((item) => item.finalBossReady) ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : undefined} />
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
              <NumberField
                label="Practice count"
                value={draft.practiceCount}
                onChange={(value) => setDraft((current) => ({ ...current, practiceCount: value }))}
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <ToggleField label="Reading done" checked={draft.readDone} onChange={(checked) => setDraft((current) => ({ ...current, readDone: checked }))} />
              <ToggleField label="Notes done" checked={draft.notesDone} onChange={(checked) => setDraft((current) => ({ ...current, notesDone: checked }))} />
              <ToggleField label="Practice done" checked={draft.practiceDone} onChange={(checked) => setDraft((current) => ({ ...current, practiceDone: checked }))} />
              <ToggleField label="Final Boss ready" checked={draft.finalBossReady} onChange={(checked) => setDraft((current) => ({ ...current, finalBossReady: checked }))} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InlineInfo label="Status" value={labelise(deriveTopicStatus(draft))} />
              <InlineInfo label="Status label" value={labelise(deriveTopicStrengthLabel(draft))} tone={strengthTone(deriveTopicStrengthLabel(draft))} />
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
                      <span className={`text-[10px] uppercase tracking-wider font-bold rounded-full px-2 py-1 ${strengthTone(topic.statusLabel)}`}>{labelise(topic.statusLabel)}</span>
                      {topic.finalBossReady && (
                        <span className="text-[10px] uppercase tracking-wider font-bold rounded-full px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Final Boss ready
                        </span>
                      )}
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
                      <span className="px-2 py-1 rounded-full bg-white border border-slate-100">Practice {topic.practiceCount}</span>
                      {topic.lastReviewed && <span className="px-2 py-1 rounded-full bg-white border border-slate-100">Reviewed {topic.lastReviewed}</span>}
                      {topic.retestDate && <span className="px-2 py-1 rounded-full bg-white border border-slate-100">Retest {topic.retestDate}</span>}
                    </div>
                    {topic.notes && <p className="text-sm text-slate-600">{topic.notes}</p>}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <QuickActionButton
                        label="Reviewed today"
                        onClick={() => {
                          const next = markTopicReviewedToday(topic.id);
                          setMasteryRecords(next);
                          if (editingId === topic.id) {
                            const refreshed = next.find((item) => item.id === topic.id);
                            if (refreshed) setDraft(refreshed);
                          }
                        }}
                      />
                      <QuickActionButton
                        label="Practice -"
                        onClick={() =>
                          handleQuickUpdate(topic.id, (record) => ({
                            ...record,
                            practiceCount: Math.max(0, record.practiceCount - 1),
                            practiceDone: record.practiceCount - 1 > 0 ? record.practiceDone : false,
                          }))
                        }
                      />
                      <QuickActionButton
                        label="Practice +"
                        onClick={() =>
                          handleQuickUpdate(topic.id, (record) => ({
                            ...record,
                            practiceCount: Math.min(999, record.practiceCount + 1),
                            practiceDone: true,
                          }))
                        }
                      />
                      <QuickActionButton
                        label={topic.finalBossReady ? 'Undo Final Boss' : 'Mark Final Boss'}
                        onClick={() =>
                          handleQuickUpdate(topic.id, (record) => ({
                            ...record,
                            finalBossReady: !record.finalBossReady,
                          }))
                        }
                      />
                      <QuickActionButton
                        label="Reset topic"
                        tone="danger"
                        onClick={() => handleResetTopic(topic)}
                      />
                    </div>
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
                  Start with one of the suggested weak points or add a custom topic manually. If this module has no seeded topic map yet, you can still track confidence, practice, review dates, retest dates, notes, and Final Boss readiness with your own topic names.
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

function actionPriorityTone(priority: NextBestAction['priority']) {
  switch (priority) {
    case 'urgent':
      return 'bg-red-50 text-red-800 border border-red-100';
    case 'high':
      return 'bg-amber-50 text-amber-800 border border-amber-100';
    case 'medium':
      return 'bg-blue-50 text-blue-800 border border-blue-100';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
}

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

const NumberField: React.FC<{ label: string; onChange: (value: number) => void; value: number }> = ({ label, onChange, value }) => (
  <label className="block">
    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2 block">{label}</span>
    <input
      type="number"
      min={0}
      max={999}
      value={value}
      onChange={(event) => onChange(Math.max(0, Math.min(999, Number(event.target.value) || 0)))}
      className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20"
    />
  </label>
);

const ToggleField: React.FC<{ checked: boolean; label: string; onChange: (checked: boolean) => void }> = ({ checked, label, onChange }) => (
  <button type="button" onClick={() => onChange(!checked)} className={`rounded-2xl border px-4 py-3 text-sm font-bold text-left ${checked ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-white text-slate-500 border-slate-100'}`}>
    {label}
  </button>
);

const InlineInfo: React.FC<{ label: string; value: string; tone?: string }> = ({ label, value, tone }) => (
  <div className={`rounded-2xl border px-4 py-3 ${tone || 'bg-white text-slate-700 border-slate-100'}`}>
    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">{label}</p>
    <p className="text-sm font-bold">{value}</p>
  </div>
);

const CheckPill: React.FC<{ done: boolean; label: string }> = ({ done, label }) => (
  <span className={`px-2 py-1 rounded-full border ${done ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-white text-slate-400 border-slate-100'}`}>
    {label}
  </span>
);

const QuickActionButton: React.FC<{ label: string; onClick: () => void; tone?: 'default' | 'danger' }> = ({ label, onClick, tone = 'default' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
      tone === 'danger'
        ? 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
        : 'bg-white text-slate-600 border-slate-100 hover:border-stellenbosch-maroon/20 hover:text-stellenbosch-maroon'
    }`}
  >
    {label}
  </button>
);

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

function strengthTone(label: 'weak' | 'building' | 'good' | 'strong') {
  return {
    weak: 'bg-red-50 text-red-700 border-red-100',
    building: 'bg-amber-50 text-amber-700 border-amber-100',
    good: 'bg-blue-50 text-blue-700 border-blue-100',
    strong: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  }[label];
}

function labelise(value: string) {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function progressFromBoolean(records: TopicMasteryRecord[], key: 'readDone' | 'notesDone' | 'practiceDone') {
  if (!records.length) return 0;
  return clampProgress((records.filter((record) => record[key]).length / records.length) * 100);
}

export default Modules;
