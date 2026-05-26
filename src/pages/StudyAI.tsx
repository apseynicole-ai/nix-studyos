import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, BrainCircuit, Sparkles, Scale, BookOpen, Calculator, History, Trash2, Copy, Wand2, FileText, Target } from 'lucide-react';
import { askGemini } from '../lib/gemini';
import { useAuth } from '../components/auth/AuthGuard';
import { db, collection, addDoc, query, where, onSnapshot, deleteDoc, doc, isFirestoreUnavailableError } from '../lib/firebase';
import ReactMarkdown from 'react-markdown';
import { modules, promptPacks, USER_ACADEMIC_PROFILE } from '../data/baccllb';
import { LOCAL_SUMMARIES_KEY, readLocalJson, writeLocalJson } from '../lib/localData';
import { readTopicMastery, topicsNeedingRetestSoon } from '../lib/topicMastery';
import { readMistakeBank } from '../lib/mistakeBank';
import { getAssessmentCalendarEntry } from '../data/assessmentCalendar';

function buildLiveContext(moduleId: string): string {
  const parts: string[] = [];

  const moduleTopics = readTopicMastery().filter((t) => t.moduleId === moduleId);
  if (moduleTopics.length > 0) {
    const topicLines: string[] = [];
    const urgent = moduleTopics.filter((t) => t.examPriority === 'urgent');
    const weak = moduleTopics.filter((t) => t.confidencePercent < 50 && t.examPriority !== 'urgent');
    const retestSoon = topicsNeedingRetestSoon(moduleTopics);
    const finalBoss = moduleTopics.filter((t) => t.finalBossReady);
    if (urgent.length) topicLines.push(`Urgent priority: ${urgent.map((t) => t.topicName).join(', ')}`);
    if (weak.length) topicLines.push(`Low confidence (<50%): ${weak.map((t) => `${t.topicName} (${t.confidencePercent}%)`).join(', ')}`);
    if (retestSoon.length) topicLines.push(`Retest due within 3 days: ${retestSoon.map((t) => t.topicName).join(', ')}`);
    if (finalBoss.length) topicLines.push(`Final-boss ready: ${finalBoss.map((t) => t.topicName).join(', ')}`);
    if (topicLines.length) parts.push(`Topic mastery (${moduleTopics.length} tracked):\n${topicLines.map((l) => `- ${l}`).join('\n')}`);
  }

  const unresolved = readMistakeBank().filter((m) => m.moduleId === moduleId && !m.resolved);
  if (unresolved.length > 0) {
    const preview = unresolved.slice(0, 5).map((m) => `- ${m.mistakeTitle}${m.topicName ? ` [${m.topicName}]` : ''}`).join('\n');
    parts.push(`Unresolved mistakes (${unresolved.length} total):\n${preview}`);
  }

  const calEntry = getAssessmentCalendarEntry(moduleId, 'A2') ?? getAssessmentCalendarEntry(moduleId, 'A2S1');
  if (calEntry) {
    const dateStr = new Date(calEntry.date).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    parts.push(`Upcoming final assessment:\n- ${dateStr} at ${calEntry.time}, ${calEntry.durationMinutes} min\n- Venue: ${calEntry.venue} (${calEntry.confidence === 'high' ? 'confirmed' : 'provisional'})`);
  }

  const markState = readLocalJson<{ modules?: Record<string, { assessments?: Record<string, { status?: string; completed?: boolean; mark?: string }> }> } | null>('baccllb-mark-engine-state', null);
  const completedMarks = Object.entries(markState?.modules?.[moduleId]?.assessments ?? {})
    .filter(([, a]) => a.status === 'completed' && a.completed && Number.isFinite(Number(a.mark?.trim())) && a.mark?.trim() !== '')
    .map(([id, a]) => `${id}: ${Number(a.mark?.trim())}%`);
  if (completedMarks.length) parts.push(`Marks entered:\n${completedMarks.map((l) => `- ${l}`).join('\n')}`);

  if (parts.length === 0) return '';
  return `\nLive study state for this module:\n${parts.join('\n\n')}`;
}

const StudyAI: React.FC = () => {
  const { user, localFirstMode, profile } = useAuth();
  const [input, setInput] = useState('');
  const [moduleId, setModuleId] = useState(modules[0].id);
  const [loading, setLoading] = useState(false);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [currentSummary, setCurrentSummary] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedModule = useMemo(() => modules.find((module) => module.id === moduleId) || modules[0], [moduleId]);

  useEffect(() => {
    const loadLocalSummaries = () => {
      setSummaries(readLocalJson<any[]>(LOCAL_SUMMARIES_KEY, []).filter((summary) => !user || summary.userId === user.uid || !summary.userId));
    };

    if (localFirstMode || !user) {
      loadLocalSummaries();
      return;
    }

    const q = query(collection(db, 'summaries'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSummaries(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      if (isFirestoreUnavailableError(error)) {
        loadLocalSummaries();
        return;
      }
      console.error('Summaries sync failed:', error instanceof Error ? error.message : String(error));
      loadLocalSummaries();
    });
    return () => unsubscribe();
  }, [user, localFirstMode]);

  const buildContext = () => `
Student profile:
- Preferred name: ${USER_ACADEMIC_PROFILE.preferredName}
- Programme: ${USER_ACADEMIC_PROFILE.programme}, ${USER_ACADEMIC_PROFILE.institution}
- Goal: ${USER_ACADEMIC_PROFILE.academicGoal}
- Preferred study style: ${USER_ACADEMIC_PROFILE.executionStyle}
- Learning systems: ${USER_ACADEMIC_PROFILE.strongestSystems.join('; ')}

Selected module:
- ${selectedModule.name} (${selectedModule.code})
- Aliases: ${selectedModule.aliases.join('; ') || 'None'}
- Area: ${selectedModule.area}
- Semester: ${selectedModule.semester}
- Programme context: ${selectedModule.programmeContext}
- Target: ${selectedModule.target}%
- Confidence: ${selectedModule.confidence}%
- Current mark: ${selectedModule.currentMarks.overall === null ? 'Missing / not confirmed yet' : `${selectedModule.currentMarks.overall}%`}
- Weak points: ${selectedModule.weakPoints.join('; ')}
- Exam focus: ${selectedModule.examFocus.join('; ')}
- Next actions: ${selectedModule.nextActions.join('; ')}
- Study method preference: ${selectedModule.studyMethodPreference.join('; ')}
- Topic map: ${selectedModule.topics.map((topic) => `${topic.title}${topic.subtopics.length ? ` (${topic.subtopics.join(', ')})` : ''}`).join('; ')}
- Assessment structure: ${selectedModule.assessmentStructure.map((assessment) => `${assessment.title}${assessment.weight != null ? ` ${assessment.weight}%` : ''}${assessment.format ? ` ${assessment.format}` : ''}${assessment.date ? ` on ${assessment.date}` : ''}${assessment.needsVerification ? ' [needs verification]' : ''}`).join('; ')}
- Assessment rules: ${selectedModule.assessmentRules.formulaSummary.join('; ')}
- Source status: ${selectedModule.sourceStatus.summary}
- Source items: ${selectedModule.sourceStatus.items.map((item) => `${item.label}: ${item.status}${item.note ? ` (${item.note})` : ''}`).join('; ')}
- Mistake categories: ${selectedModule.mistakeBankCategories.join('; ')}
- Hard rules: ${selectedModule.hardRules.join('; ')}
- Needs verification: ${selectedModule.needsVerification ? `Yes - ${selectedModule.verificationNotes.join('; ')}` : 'No'}

Response rules:
- Be specific to Stellenbosch BAccLLB where possible.
- For accounting: explain simply first, then formal treatment, then exam workflow and traps.
- For law: use issue/rule/authority/application/conclusion where helpful; do not invent cases or sources.
- For planning: make tasks concrete, timed, and ADHD-friendly.
- Respect module hard rules and separation rules.
- Be honest when more official material is needed.
${buildLiveContext(moduleId)}`;

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setCurrentSummary(null);
    setErrorMessage(null);
    try {
      const response = await askGemini({
        prompt: input,
        context: buildContext(),
        moduleId,
        moduleName: selectedModule.name,
        promptMode: 'study-ai',
        weakPoints: selectedModule.weakPoints,
        options: {
          moduleArea: selectedModule.area,
          targetMark: selectedModule.target,
          confidence: selectedModule.confidence,
        },
      });
      setCurrentSummary(response);
      const newSummary = {
        id: crypto.randomUUID(),
        userId: user?.uid || profile?.uid || 'local-guest',
        title: input.slice(0, 70) + (input.length > 70 ? '...' : ''),
        content: response,
        originalText: input,
        moduleId,
        moduleName: selectedModule.shortName,
        createdAt: new Date().toISOString(),
      };
      if (localFirstMode || !user) {
        writeLocalJson(LOCAL_SUMMARIES_KEY, [...readLocalJson<any[]>(LOCAL_SUMMARIES_KEY, []), newSummary]);
        setSummaries((current) => [...current, newSummary]);
      } else {
        try {
          await addDoc(collection(db, 'summaries'), newSummary);
        } catch (error) {
          if (isFirestoreUnavailableError(error)) {
            writeLocalJson(LOCAL_SUMMARIES_KEY, [...readLocalJson<any[]>(LOCAL_SUMMARIES_KEY, []), newSummary]);
            setSummaries((current) => [...current, newSummary]);
          } else {
            throw error;
          }
        }
      }
      setInput('');
    } catch (error) {
      console.error('StudyAI generation failed:', error instanceof Error ? error.message : String(error));
      setErrorMessage(error instanceof Error ? error.message : 'StudyAI request failed.');
    } finally {
      setLoading(false);
    }
  };

  const deleteSummary = async (id: string) => {
    try {
      if (localFirstMode || !user) {
        const nextSummaries = readLocalJson<any[]>(LOCAL_SUMMARIES_KEY, []).filter((summary) => summary.id !== id);
        writeLocalJson(LOCAL_SUMMARIES_KEY, nextSummaries);
        setSummaries(nextSummaries.filter((summary) => !user || summary.userId === user.uid || !summary.userId));
        return;
      }
      await deleteDoc(doc(db, 'summaries', id));
    } catch (error) {
      if (isFirestoreUnavailableError(error)) {
        const nextSummaries = readLocalJson<any[]>(LOCAL_SUMMARIES_KEY, []).filter((summary) => summary.id !== id);
        writeLocalJson(LOCAL_SUMMARIES_KEY, nextSummaries);
        setSummaries(nextSummaries.filter((summary) => !user || summary.userId === user.uid || !summary.userId));
        return;
      }
      console.error('Summary delete failed:', error instanceof Error ? error.message : String(error));
    }
  };

  const usePrompt = (prompt: string) => {
    setInput(prompt);
    const pack = promptPacks.find((item) => item.prompt === prompt);
    if (pack?.moduleId) setModuleId(pack.moduleId);
  };

  const copyOutput = async () => {
    if (!currentSummary) return;
    await navigator.clipboard.writeText(currentSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="max-w-7xl mx-auto pt-8 pb-36 px-5 md:px-8 grid grid-cols-1 xl:grid-cols-[1fr_0.42fr] gap-8">
      <div>
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl maroon-gradient flex items-center justify-center text-white shadow-lg shadow-stellenbosch-maroon/20">
              <BrainCircuit size={24} />
            </div>
            <div>
              <p className="uppercase tracking-[0.35em] text-xs text-slate-400 font-bold">personal study agent</p>
              <h1 className="font-display text-5xl text-stellenbosch-maroon">LexAI Command Lab</h1>
            </div>
          </div>
          <p className="text-slate-500 max-w-3xl">Now injected with your BAccLLB module map, weak points, A2 goals, exam preferences and study-system logic before it answers.</p>
          {localFirstMode && <p className="mt-3 text-sm font-medium text-amber-800">Local-first mode active: saved AI summaries stay on this device.</p>}
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-[0.72fr_0.28fr] gap-6 mb-8">
          <form onSubmit={handleGenerate} className="glass p-6 rounded-[2.5rem] border-slate-200/50 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_0.45fr] gap-3 mb-4">
              <label className="block">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">Ask LexAI</span>
                <textarea 
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Paste a question, source extract, messy notes, assignment draft, or ask for a module-specific study system..."
                  rows={8}
                  className="w-full bg-white rounded-3xl border border-slate-100 px-5 py-4 text-base placeholder:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20"
                />
              </label>
              <div className="space-y-3">
                <label className="block">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">Module context</span>
                  <select value={moduleId} onChange={(event) => setModuleId(event.target.value)} className="w-full rounded-2xl bg-white border border-slate-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20">
                    {modules.map((module) => <option key={module.id} value={module.id}>{module.shortName} ({module.code})</option>)}
                  </select>
                </label>
                <div className="rounded-3xl bg-white/80 border border-slate-100 p-4">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">Injected weak points</p>
                  <ul className="space-y-2">
                    {selectedModule.weakPoints.slice(0, 4).map((point) => <li key={point} className="text-xs text-slate-500 flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-stellenbosch-maroon mt-1.5 shrink-0" />{point}</li>)}
                  </ul>
                </div>
                <button 
                  disabled={loading || !input.trim()}
                  type="submit"
                  className="w-full maroon-gradient text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-[1.01]"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={18} />}
                  Generate
                </button>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <QuickAction label="Law answer skeleton" icon={<Scale size={14}/>} onClick={() => setInput('Create a top-mark answer skeleton for this law question. Use issue, rule, authority, application, conclusion, and show how marks should be allocated: ')} />
              <QuickAction label="Accounting workflow" icon={<Calculator size={14}/>} onClick={() => setInput('Explain this accounting topic simply first, then formally, then give the exam workflow, common traps and a 5-minute checklist: ')} />
              <QuickAction label="A2 rescue plan" icon={<Target size={14}/>} onClick={() => setInput(`Create a rescue plan for ${selectedModule.name}. Focus on my weak points, exact next actions, timed practice and what to do first today.`)} />
              <QuickAction label="Teach aloud" icon={<BookOpen size={14}/>} onClick={() => setInput('Turn this content into a teach-aloud script with active recall questions and a final 5-minute recap: ')} />
            </div>
          </form>

          <section className="bg-slate-950 text-white rounded-[2.5rem] p-6 shadow-2xl shadow-slate-950/20">
            <h2 className="font-display text-3xl mb-4 flex items-center gap-2"><Wand2 className="text-stellenbosch-gold" /> Prompt Packs</h2>
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
              {promptPacks.map((pack) => (
                <button key={pack.id} onClick={() => usePrompt(pack.prompt)} className="w-full text-left rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 p-4 transition-all">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-stellenbosch-gold">{pack.category}</span>
                  <p className="font-bold text-white mt-1">{pack.title}</p>
                  <p className="text-xs text-white/50 mt-1">{pack.description}</p>
                </button>
              ))}
            </div>
          </section>
        </section>

        <AnimatePresence>
          {currentSummary && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 markdown-body prose prose-slate max-w-none"
            >
              <div className="flex items-center justify-between gap-3 mb-6 not-prose">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-bold">Generated output</p>
                  <h2 className="font-display text-3xl text-stellenbosch-maroon">{selectedModule.shortName} response</h2>
                </div>
                <button onClick={copyOutput} className="rounded-2xl bg-slate-50 text-slate-500 hover:text-stellenbosch-maroon px-4 py-3 flex items-center gap-2 text-sm font-bold">
                  <Copy size={16} /> {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <ReactMarkdown>{currentSummary}</ReactMarkdown>
            </motion.div>
          )}
        </AnimatePresence>
        {errorMessage && (
          <div className="mt-6 rounded-[2rem] border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-800">
            {errorMessage}
          </div>
        )}
      </div>

      <aside className="space-y-6">
        <section className="glass p-6 rounded-[2.5rem] sticky top-6 border-slate-200/50 shadow-sm">
          <h2 className="font-display text-2xl mb-6 flex items-center gap-2">
            <History size={20} className="text-stellenbosch-maroon" />
            Recent Inquiries
          </h2>
          <div className="space-y-4 max-h-[58vh] overflow-y-auto pr-2 custom-scrollbar">
            {summaries.sort((a,b) => b.createdAt.localeCompare(a.createdAt)).map((summary) => (
              <div key={summary.id} className="bg-white/70 p-4 rounded-2xl border border-slate-100 group relative">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-stellenbosch-maroon">{summary.moduleName || 'General'}</span>
                    <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 mt-1">{summary.title}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">{new Date(summary.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => setCurrentSummary(summary.content)} className="bg-slate-100 p-2 rounded-xl text-slate-500 hover:text-stellenbosch-maroon"><FileText size={14} /></button>
                    <button onClick={() => deleteSummary(summary.id)} className="bg-slate-100 p-2 rounded-xl text-slate-500 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
            {summaries.length === 0 && <p className="text-center text-slate-400 py-10 italic">No history yet</p>}
          </div>
        </section>
      </aside>
    </div>
  );
};

const QuickAction: React.FC<{ label: string; icon: React.ReactNode; onClick: () => void }> = ({ label, icon, onClick }) => (
  <button 
    type="button"
    onClick={onClick}
    className="px-3 py-2 rounded-xl bg-white text-slate-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-slate-50 transition-colors border border-slate-100"
  >
    {icon}
    {label}
  </button>
);

export default StudyAI;
