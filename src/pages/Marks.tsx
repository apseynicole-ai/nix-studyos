import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Calculator, CheckCircle2, LineChart, Save, Target, TrendingUp } from 'lucide-react';
import { modules } from '../data/baccllb';
import ProgressBar from '../components/ui/ProgressBar';
import ProgressBadge from '../components/ui/ProgressBadge';
import {
  calcConLaw178,
  calcDLA112,
  calcDLA122,
  calcEcon114,
  calcFinAcc178,
  calcLegalSkills114,
  calcSDS188,
  getModuleAssessmentModel,
} from '../lib/marksEngine';
import type { MarksOutput } from '../lib/marksEngine';
import { clampProgress } from '../lib/progressMetrics';

type SupportedModuleId =
  | 'econ114'
  | 'dla112'
  | 'dla122'
  | 'finacc178'
  | 'foundations178'
  | 'sds188'
  | 'legalskills114'
  | 'conlaw178';

interface AssessmentDraftState {
  completed: boolean;
  status: 'pending' | 'completed' | 'missed';
  mark: string;
  validSubmission: boolean;
  hoursLate: string;
  notes: string;
}

interface ModuleDraftState {
  assessments: Record<string, AssessmentDraftState>;
}

interface MarkEngineState {
  selectedModuleId: SupportedModuleId;
  modules: Record<SupportedModuleId, ModuleDraftState>;
}

interface ModuleMeta {
  id: SupportedModuleId;
  label: string;
  shortName: string;
  code: string;
  colour: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  target: number;
}

interface NeededMarkRow {
  target: number;
  needed: number | null;
  feasible: boolean;
  focusLabel: string;
  status: string;
}

const STORAGE_KEY = 'baccllb-mark-engine-state';
const LEGACY_STORAGE_KEY = 'baccllb-mark-rows';
const MODULE_TARGETS_KEY = 'baccllb-module-targets';
const TARGETS = [50, 60, 70, 75, 80] as const;
const SUPPORTED_MODULES: SupportedModuleId[] = [
  'econ114',
  'dla112',
  'dla122',
  'finacc178',
  'foundations178',
  'sds188',
  'legalskills114',
  'conlaw178',
];

const baseModules = Object.fromEntries(modules.map((module) => [module.id, module])) as Record<string, (typeof modules)[number]>;
const dlaBase = baseModules.dla122 || baseModules.dla112;

const MODULE_META: Record<SupportedModuleId, ModuleMeta> = {
  econ114: {
    id: 'econ114',
    label: 'Economics 114',
    shortName: 'Econ 114',
    code: 'ECO114',
    colour: baseModules.econ114.colour,
    icon: baseModules.econ114.icon,
    target: baseModules.econ114.target,
  },
  dla112: {
    id: 'dla112',
    label: 'DLA 112',
    shortName: 'DLA 112',
    code: 'DLA112',
    colour: dlaBase.colour,
    icon: dlaBase.icon,
    target: dlaBase.target,
  },
  dla122: {
    id: 'dla122',
    label: 'DLA 122',
    shortName: 'DLA 122',
    code: 'DLA122',
    colour: dlaBase.colour,
    icon: dlaBase.icon,
    target: dlaBase.target,
  },
  finacc178: {
    id: 'finacc178',
    label: 'Financial Accounting 178',
    shortName: 'FinAcc 178',
    code: 'FAF178',
    colour: baseModules.finacc178.colour,
    icon: baseModules.finacc178.icon,
    target: baseModules.finacc178.target,
  },
  foundations178: {
    id: 'foundations178',
    label: 'Foundations of Law 178',
    shortName: 'Foundations 178',
    code: 'FOL178',
    colour: baseModules.foundations178.colour,
    icon: baseModules.foundations178.icon,
    target: baseModules.foundations178.target,
  },
  sds188: {
    id: 'sds188',
    label: 'Statistics and Data Science 188',
    shortName: 'Stats 188',
    code: 'SDS188',
    colour: baseModules.sds188.colour,
    icon: baseModules.sds188.icon,
    target: baseModules.sds188.target,
  },
  legalskills114: {
    id: 'legalskills114',
    label: 'Legal Skills 114',
    shortName: 'Legal Skills 114',
    code: 'LSK114',
    colour: baseModules.legalskills114.colour,
    icon: baseModules.legalskills114.icon,
    target: baseModules.legalskills114.target,
  },
  conlaw178: {
    id: 'conlaw178',
    label: 'Introduction to Constitutional Law and Statutory Interpretation 178',
    shortName: 'Con Law 178',
    code: 'CON178',
    colour: baseModules.conlaw178.colour,
    icon: baseModules.conlaw178.icon,
    target: baseModules.conlaw178.target,
  },
};

function createAssessmentDraft(moduleId: SupportedModuleId, assessmentId: string): AssessmentDraftState {
  const assessment = getModuleAssessmentModel(moduleId)?.assessments.find((item) => item.id === assessmentId);
  return {
    completed: false,
    status: 'pending',
    mark: '',
    validSubmission: true,
    hoursLate: '',
    notes: '',
  };
}

function createDefaultState(): MarkEngineState {
  return {
    selectedModuleId: 'econ114',
    modules: SUPPORTED_MODULES.reduce((acc, moduleId) => {
      const model = getModuleAssessmentModel(moduleId);
      acc[moduleId] = {
        assessments: Object.fromEntries(
          (model?.assessments ?? []).map((assessment) => [assessment.id, createAssessmentDraft(moduleId, assessment.id)]),
        ),
      };
      return acc;
    }, {} as Record<SupportedModuleId, ModuleDraftState>),
  };
}

function parseNumber(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function clampPercentage(value: number): number {
  return Math.max(0, Math.min(100, Number.isNaN(value) ? 0 : value));
}

function getAssessmentMark(assessment: AssessmentDraftState): number | null {
  if (assessment.status !== 'completed' || !assessment.completed) return null;
  const parsed = parseNumber(assessment.mark);
  return parsed === null ? null : Math.max(0, Math.min(100, parsed));
}

function isAssessmentAvailable(draft: AssessmentDraftState): boolean {
  return draft.status === 'pending';
}

function isAssessmentBlocked(moduleId: SupportedModuleId, assessmentId: string, draft: AssessmentDraftState): boolean {
  if (draft.status === 'missed') return true;
  if (hasValidSubmissionField(moduleId, assessmentId) && draft.status === 'completed' && !draft.validSubmission) return true;
  return false;
}

function loadInitialState(): MarkEngineState {
  const fallback = createDefaultState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<MarkEngineState>;
      return {
        selectedModuleId:
          parsed.selectedModuleId && SUPPORTED_MODULES.includes(parsed.selectedModuleId)
            ? parsed.selectedModuleId
            : fallback.selectedModuleId,
        modules: SUPPORTED_MODULES.reduce((acc, moduleId) => {
          const baseAssessments = fallback.modules[moduleId].assessments;
          const savedAssessments = parsed.modules?.[moduleId]?.assessments ?? {};
          acc[moduleId] = {
            assessments: Object.fromEntries(
              Object.entries(baseAssessments).map(([assessmentId, baseDraft]) => {
                const saved = savedAssessments[assessmentId];
                return [
                  assessmentId,
                  {
                    completed: typeof saved?.completed === 'boolean' ? saved.completed : baseDraft.completed,
                    status:
                      saved?.status === 'completed' || saved?.status === 'missed' || saved?.status === 'pending'
                        ? saved.status
                        : (typeof saved?.completed === 'boolean' && saved.completed ? 'completed' : 'pending'),
                    mark: typeof saved?.mark === 'string' ? saved.mark : baseDraft.mark,
                    validSubmission:
                      typeof saved?.validSubmission === 'boolean' ? saved.validSubmission : baseDraft.validSubmission,
                    hoursLate: typeof saved?.hoursLate === 'string' ? saved.hoursLate : baseDraft.hoursLate,
                    notes: typeof saved?.notes === 'string' ? saved.notes : baseDraft.notes,
                  },
                ];
              }),
            ),
          };
          return acc;
        }, {} as Record<SupportedModuleId, ModuleDraftState>),
      };
    }

    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw) as Array<{ moduleId?: string }>;
      const firstSupported = parsed.find((row) => row.moduleId && SUPPORTED_MODULES.includes(row.moduleId as SupportedModuleId));
      if (firstSupported?.moduleId) {
        fallback.selectedModuleId = firstSupported.moduleId as SupportedModuleId;
      }
    }
  } catch {
    return fallback;
  }

  return fallback;
}

function loadModuleTargets(): Partial<Record<SupportedModuleId, number>> {
  try {
    const raw = localStorage.getItem(MODULE_TARGETS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const entries = Object.entries(parsed).filter(
      ([moduleId, value]) => SUPPORTED_MODULES.includes(moduleId as SupportedModuleId) && typeof value === 'number' && Number.isFinite(value),
    );
    return Object.fromEntries(entries.map(([moduleId, value]) => [moduleId, clampPercentage(value as number)])) as Partial<Record<SupportedModuleId, number>>;
  } catch {
    return {};
  }
}

function hasValidSubmissionField(moduleId: SupportedModuleId, assessmentId: string): boolean {
  return moduleId === 'dla122' && (assessmentId === 'A1' || assessmentId === 'A2');
}

function hasLateHoursField(moduleId: SupportedModuleId, assessmentId: string): boolean {
  return moduleId === 'dla122' && (assessmentId === 'A1' || assessmentId === 'A2');
}

function calculateModuleOutput(moduleId: SupportedModuleId, moduleState: ModuleDraftState): MarksOutput {
  const pick = (assessmentId: string) => getAssessmentMark(moduleState.assessments[assessmentId] ?? createAssessmentDraft(moduleId, assessmentId));

  switch (moduleId) {
    case 'econ114':
      return calcEcon114({ a1: pick('A1'), a2: pick('A2'), a3: pick('A3') });
    case 'dla112':
      return calcDLA112({ af: pick('AF'), a1: pick('A1'), a2: pick('A2'), a3: pick('A3') });
    case 'dla122':
      return calcDLA122({
        af: pick('AF'),
        a1: pick('A1'),
        a1Valid: moduleState.assessments.A1?.validSubmission ?? true,
        a2: pick('A2'),
        a2Valid: moduleState.assessments.A2?.validSubmission ?? true,
        a3: pick('A3'),
        hoursLateA1: parseNumber(moduleState.assessments.A1?.hoursLate ?? '') ?? 0,
        hoursLateA2: parseNumber(moduleState.assessments.A2?.hoursLate ?? '') ?? 0,
      });
    case 'finacc178':
      return calcFinAcc178({
        a1s1: pick('A1S1'),
        a2s1: pick('A2S1'),
        a1s2: pick('A1S2'),
        a2s2: pick('A2S2'),
        afs2: pick('AFS2'),
        a3: pick('A3'),
      });
    case 'foundations178':
      return calcConLaw178({
        afs1: pick('AFS1'),
        a1s1: pick('A1S1'),
        a2s1: pick('A2S1'),
        afs2: pick('AFS2'),
        a1s2: pick('A1S2'),
        a2s2: pick('A2S2'),
        a3: pick('A3'),
      });
    case 'sds188':
      return calcSDS188({
        afs1: pick('AFS1'),
        a1s1: pick('A1S1'),
        a2s1: pick('A2S1'),
        afs2: pick('AFS2'),
        a1s2: pick('A1S2'),
        a2s2: pick('A2S2'),
        a3: pick('A3'),
      });
    case 'legalskills114':
      return calcLegalSkills114({
        rt: pick('RT'),
        lw: pick('LW'),
        ao: pick('AO'),
        t1: pick('T1'),
        t2: pick('T2'),
        ae: pick('AE'),
        mq: pick('MQ'),
      });
    case 'conlaw178':
      return calcConLaw178({
        afs1: pick('AFS1'),
        a1s1: pick('A1S1'),
        a2s1: pick('A2S1'),
        afs2: pick('AFS2'),
        a1s2: pick('A1S2'),
        a2s2: pick('A2S2'),
        a3: pick('A3'),
      });
  }
}

function getCurrentFinal(output: MarksOutput): number | null {
  // Prefer MTD (normalised over completed assessments only) over FM1, which uses a
  // fixed denominator and treats pending slots as zero in some module models (e.g.
  // ConLaw178, Foundations178). FM1 is still shown in its own KPI as a projection.
  return output.fm ?? output.fm2 ?? output.mtd ?? output.fm1 ?? output.my ?? null;
}

function getRiskLevel(output: MarksOutput): { label: string; tone: string } {
  const current = getCurrentFinal(output);
  const hasInvalidWarning = output.warnings.some((warning) => warning.includes('INVALID') || warning.includes('fail'));

  if (!output.isValidFM || hasInvalidWarning) {
    return { label: 'High', tone: 'bg-red-50 text-red-700 border-red-100' };
  }
  if (current !== null && current < 60) {
    return { label: 'Medium', tone: 'bg-amber-50 text-amber-700 border-amber-100' };
  }
  if (output.warnings.length >= 3) {
    return { label: 'Watch', tone: 'bg-sky-50 text-sky-700 border-sky-100' };
  }
  return { label: 'Low', tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
}

function getA3Status(moduleId: SupportedModuleId, output: MarksOutput, moduleState: ModuleDraftState): string {
  const model = getModuleAssessmentModel(moduleId);
  const hasA3 = model?.assessments.some((assessment) => assessment.id === 'A3');
  if (!hasA3 || moduleId === 'legalskills114') return 'No A3 for this module';
  if (moduleState.assessments.A3?.completed) return 'A3 entered';
  if (moduleId === 'dla122') {
    if (!(moduleState.assessments.A1?.validSubmission ?? true) || !(moduleState.assessments.A2?.validSubmission ?? true)) {
      return 'No access until A1 and A2 are valid';
    }
    if (output.fm1 !== null && output.fm1 < 50) return 'Likely A3 access if officially granted';
    return 'A3 only if A2 was missed or official supplementary applies';
  }
  if (output.fm1 !== null && output.fm1 < 50) return 'Possible supplementary route';
  if (!output.isValidFM) return 'Use A3 if a main assessment is missed';
  return 'Not currently needed';
}

function getAssessmentModelNotes(moduleId: SupportedModuleId, assessmentId: string): string[] {
  const assessment = getModuleAssessmentModel(moduleId)?.assessments.find((item) => item.id === assessmentId);
  const notes = [assessment?.countRule, assessment?.notes].filter(Boolean) as string[];
  if (hasLateHoursField(moduleId, assessmentId)) {
    notes.push('Late penalties are cumulative and applied before DLA122 FM logic.');
  }
  return Array.from(new Set(notes));
}

function cloneModuleState(moduleState: ModuleDraftState): ModuleDraftState {
  return {
    assessments: Object.fromEntries(
      Object.entries(moduleState.assessments).map(([assessmentId, draft]) => [assessmentId, { ...draft }]),
    ),
  };
}

function getFocusAssessment(moduleId: SupportedModuleId, moduleState: ModuleDraftState): { id: string; label: string } | null {
  const model = getModuleAssessmentModel(moduleId);
  if (!model) return null;
  const incompleteRequired = model.assessments.find(
    (assessment) => !assessment.isOptional && isAssessmentAvailable(moduleState.assessments[assessment.id]),
  );
  if (incompleteRequired) return { id: incompleteRequired.id, label: incompleteRequired.label };
  const incompleteOptional = model.assessments.find(
    (assessment) => assessment.isOptional && isAssessmentAvailable(moduleState.assessments[assessment.id]),
  );
  if (incompleteOptional) return { id: incompleteOptional.id, label: incompleteOptional.label };
  return null;
}

function getNeededMarkRows(moduleId: SupportedModuleId, moduleState: ModuleDraftState, targets: readonly number[] = TARGETS): NeededMarkRow[] {
  const model = getModuleAssessmentModel(moduleId);
  const focus = getFocusAssessment(moduleId, moduleState);
  if (!model) return [];

  const blockedRequired = model.assessments.find((assessment) => (
    !assessment.isOptional && isAssessmentBlocked(moduleId, assessment.id, moduleState.assessments[assessment.id])
  ));

  return targets.map((target) => {
    if (blockedRequired) {
      return {
        target,
        needed: null,
        feasible: false,
        focusLabel: blockedRequired.label,
        status: 'Blocked by missed/invalid required assessment',
      };
    }

    if (!focus) {
      return {
        target,
        needed: null,
        feasible: false,
        focusLabel: 'No remaining assessment',
        status: 'Blocked or already finalised',
      };
    }

    const simulate = (score: number): MarksOutput => {
      const simulated = cloneModuleState(moduleState);
      for (const assessment of model.assessments) {
        const draft = simulated.assessments[assessment.id];
        if (assessment.id === focus.id) {
          draft.status = 'completed';
          draft.completed = true;
          draft.mark = String(score);
          if (hasValidSubmissionField(moduleId, assessment.id)) draft.validSubmission = true;
        } else if (isAssessmentAvailable(draft) && !assessment.isOptional) {
          draft.status = 'completed';
          draft.completed = true;
          draft.mark = String(target);
          if (hasValidSubmissionField(moduleId, assessment.id)) draft.validSubmission = true;
        }
      }
      return calculateModuleOutput(moduleId, simulated);
    };

    const bestCase = simulate(100);
    const bestCaseFinal = getCurrentFinal(bestCase);
    if (!bestCase.isValidFM || bestCaseFinal === null || bestCaseFinal < target) {
      return {
        target,
        needed: null,
        feasible: false,
        focusLabel: focus.label,
        status: 'Impossible with remaining valid opportunities',
      };
    }

    let answer: number | null = null;
    let low = 0;
    let high = 100;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const result = simulate(mid);
      const final = getCurrentFinal(result);
      if (result.isValidFM && final !== null && final >= target) {
        answer = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return {
      target,
      needed: answer,
      feasible: answer !== null,
      focusLabel: focus.label,
      status: answer !== null ? 'Reachable' : 'Impossible with remaining valid opportunities',
    };
  });
}

function getTargetChoices(overallGoal: number): number[] {
  const merged = Array.from(new Set([...TARGETS, Math.round(overallGoal)])).sort((left, right) => left - right);
  return merged;
}

function formatMetric(value: number | null | undefined): string {
  return value === null || value === undefined ? 'n/a' : `${value}%`;
}

const Kpi: React.FC<{ icon: React.ReactNode; label: string; value: string | number; note: string; tone?: string }> = ({ icon, label, value, note, tone }) => (
  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
    <div className="w-12 h-12 rounded-2xl bg-stellenbosch-maroon/5 text-stellenbosch-maroon flex items-center justify-center mb-5">{icon}</div>
    <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">{label}</p>
    <p className="font-display text-4xl text-slate-900 my-1">{value}</p>
    <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${tone || 'bg-slate-50 text-slate-500 border-slate-100'}`}>{note}</span>
  </div>
);

const EditableGoalKpi: React.FC<{
  value: number;
  onChange: (value: number) => void;
}> = ({ value, onChange }) => (
  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
    <div className="w-12 h-12 rounded-2xl bg-stellenbosch-maroon/5 text-stellenbosch-maroon flex items-center justify-center mb-5">
      <Target />
    </div>
    <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">OVERALL GOAL</p>
    <div className="flex items-end gap-2 my-1">
      <input
        type="number"
        min="0"
        max="100"
        value={value}
        onChange={(event) => onChange(clampPercentage(Number(event.target.value)))}
        className="w-24 rounded-2xl bg-slate-50 border border-slate-100 px-3 py-2 font-display text-4xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20"
      />
      <span className="font-display text-4xl text-slate-900">%</span>
    </div>
    <span className="inline-flex rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-500 border-slate-100">
      Final module target
    </span>
  </div>
);

const Marks: React.FC = () => {
  const [state, setState] = useState<MarkEngineState>(() => loadInitialState());
  const [moduleTargets, setModuleTargets] = useState<Partial<Record<SupportedModuleId, number>>>(() => loadModuleTargets());
  const [savedPulse, setSavedPulse] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem(MODULE_TARGETS_KEY, JSON.stringify(moduleTargets));
  }, [moduleTargets]);

  const selectedModule = MODULE_META[state.selectedModuleId];
  const selectedModel = getModuleAssessmentModel(state.selectedModuleId);
  const selectedModuleState = state.modules[state.selectedModuleId];
  const selectedOverallGoal = moduleTargets[state.selectedModuleId] ?? selectedModule.target;

  const output = useMemo(
    () => calculateModuleOutput(state.selectedModuleId, selectedModuleState),
    [state.selectedModuleId, selectedModuleState],
  );

  const risk = useMemo(() => getRiskLevel(output), [output]);
  const targetChoices = useMemo(() => getTargetChoices(selectedOverallGoal), [selectedOverallGoal]);
  const neededRows = useMemo(
    () => getNeededMarkRows(state.selectedModuleId, selectedModuleState, targetChoices),
    [state.selectedModuleId, selectedModuleState, targetChoices],
  );
  const currentFinal = getCurrentFinal(output);
  const currentPathProgress = currentFinal === null ? 0 : clampProgress((currentFinal / Math.max(selectedOverallGoal || 1, 1)) * 100);
  const currentMarkProgress = output.mtd === null ? 0 : clampProgress((output.mtd / Math.max(selectedOverallGoal || 1, 1)) * 100);
  const extraWarnings = Object.entries(selectedModuleState.assessments)
    .filter(([, draft]) => draft.status === 'completed' && parseNumber(draft.mark) === null)
    .map(([assessmentId]) => `${assessmentId} is marked completed but has no numeric mark yet.`);

  const updateAssessment = (assessmentId: string, patch: Partial<AssessmentDraftState>) => {
    setState((current) => ({
      ...current,
      modules: {
        ...current.modules,
        [current.selectedModuleId]: {
          assessments: {
            ...current.modules[current.selectedModuleId].assessments,
            [assessmentId]: {
              ...current.modules[current.selectedModuleId].assessments[assessmentId],
              ...patch,
            },
          },
        },
      },
    }));
  };

  const updateAssessmentStatus = (assessmentId: string, status: AssessmentDraftState['status']) => {
    const currentDraft = selectedModuleState.assessments[assessmentId];
    updateAssessment(assessmentId, {
      status,
      completed: status === 'completed',
      mark: status === 'missed' ? '' : currentDraft.mark,
      hoursLate: status === 'missed' ? '' : currentDraft.hoursLate,
    });
  };

  const updateOverallGoal = (value: number) => {
    setModuleTargets((current) => ({
      ...current,
      [state.selectedModuleId]: clampPercentage(value),
    }));
  };

  const saveNow = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setSavedPulse(true);
    setTimeout(() => setSavedPulse(false), 1200);
  };

  return (
    <div className="page-shell">
      <header className="mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div>
          <p className="page-kicker">marks engine dashboard</p>
          <h1 className="page-title">Module-Specific Marks Control Room</h1>
          <p className="page-subtitle">
            Select a supported BAccLLB module, capture the exact assessment inputs, and let the audited marks engine
            calculate MTD, FM paths, A3 status, warnings, and next-mark targets.
          </p>
        </div>
        <button onClick={saveNow} className="maroon-gradient text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-stellenbosch-maroon/20 hover:scale-105 transition-transform">
          <Save size={18} /> {savedPulse ? 'Saved' : 'Save marks state'}
        </button>
      </header>

      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {SUPPORTED_MODULES.map((moduleId) => {
            const module = MODULE_META[moduleId];
            const Icon = module.icon;
            const active = moduleId === state.selectedModuleId;
            return (
              <button
                key={moduleId}
                type="button"
                onClick={() => setState((current) => ({ ...current, selectedModuleId: moduleId }))}
                className={`rounded-[2rem] border p-5 text-left transition-all ${
                  active
                    ? 'border-stellenbosch-maroon bg-white shadow-lg shadow-stellenbosch-maroon/10'
                    : 'border-slate-100 bg-white/80 hover:border-slate-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${module.colour} text-white flex items-center justify-center mb-4`}>
                  <Icon size={22} />
                </div>
                <p className="font-bold text-slate-900">{module.label}</p>
                <p className="text-xs text-slate-400 mt-1">{module.code}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-4 mb-8">
        <Kpi icon={<LineChart />} label="MY" value={formatMetric(output.my)} note="Year mark" />
        <EditableGoalKpi value={selectedOverallGoal} onChange={updateOverallGoal} />
        <Kpi icon={<TrendingUp />} label="MTD" value={formatMetric(output.mtd)} note="Completed only" />
        <Kpi icon={<Calculator />} label="FM1" value={formatMetric(output.fm1)} note="Projected / running total" />
        <Kpi icon={<Target />} label="FM2 / FM" value={formatMetric(output.fm ?? output.fm2)} note="Alternate/final path" />
        <Kpi icon={<CheckCircle2 />} label="Valid FM" value={output.isValidFM ? 'Yes' : 'No'} note={getA3Status(state.selectedModuleId, output, selectedModuleState)} tone={output.isValidFM ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'} />
        <Kpi icon={<AlertTriangle />} label="Risk" value={risk.label} note={currentFinal !== null ? `Current path ${currentFinal}%` : 'Waiting for enough inputs'} tone={risk.tone} />
      </section>

      <section className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm mb-8">
        <div className="flex flex-wrap gap-2 mb-5">
          <ProgressBadge value={currentPathProgress} label="Current path vs goal" tone="maroon" />
          <ProgressBadge value={currentMarkProgress} label="MTD vs goal" tone="amber" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProgressBar value={currentPathProgress} label="Current mark path" helper={currentFinal !== null ? `${output.isValidFM ? `Valid final mark: ${currentFinal}%` : `Completed assessments: ${currentFinal}%`} against an overall goal of ${selectedOverallGoal}%` : 'Add completed assessment marks to compare the current path to your overall goal'} tone="maroon" />
          <ProgressBar value={currentMarkProgress} label="Mark-to-date momentum" helper={output.mtd !== null ? `${output.mtd}% mark-to-date against an overall goal of ${selectedOverallGoal}%` : 'No mark-to-date available yet for this module'} tone="amber" />
        </div>
      </section>

      <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="font-display text-3xl text-stellenbosch-maroon">{selectedModule.label}</h2>
          <p className="text-sm text-slate-500 mt-2">Capture each assessment exactly as the module model expects. Use Pending for future opportunities, Completed for submitted work, and Missed when an opportunity is lost.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4 text-left font-bold">Assessment</th>
                <th className="px-4 py-4 text-left font-bold">Weight</th>
                <th className="px-4 py-4 text-left font-bold">Mark</th>
                <th className="px-4 py-4 text-left font-bold">Status</th>
                <th className="px-4 py-4 text-left font-bold">Valid submission</th>
                <th className="px-4 py-4 text-left font-bold">Late hours</th>
                <th className="px-4 py-4 text-left font-bold">Notes / warnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selectedModel?.assessments.map((assessment) => {
                const draft = selectedModuleState.assessments[assessment.id];
                const notes = getAssessmentModelNotes(state.selectedModuleId, assessment.id);
                return (
                  <motion.tr layout key={assessment.id} className="align-top">
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-900">{assessment.label}</p>
                      <p className="text-xs text-slate-400 mt-1">{assessment.id}{assessment.isOptional ? ' • optional' : ''}</p>
                    </td>
                    <td className="px-4 py-5 text-sm font-bold text-slate-700">{assessment.weight}%</td>
                    <td className="px-4 py-5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={draft.mark}
                        disabled={draft.status !== 'completed'}
                        onChange={(event) => updateAssessment(assessment.id, { mark: event.target.value })}
                        className="w-28 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 font-bold text-slate-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20"
                      />
                    </td>
                    <td className="px-4 py-5">
                      <select
                        value={draft.status}
                        onChange={(event) => updateAssessmentStatus(assessment.id, event.target.value as AssessmentDraftState['status'])}
                        className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20"
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="missed">Missed</option>
                      </select>
                    </td>
                    <td className="px-4 py-5">
                      {hasValidSubmissionField(state.selectedModuleId, assessment.id) ? (
                        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                          <input
                            type="checkbox"
                            checked={draft.validSubmission}
                            onChange={(event) => updateAssessment(assessment.id, { validSubmission: event.target.checked })}
                            className="rounded border-slate-300 text-stellenbosch-maroon focus:ring-stellenbosch-maroon/30"
                          />
                          {draft.validSubmission ? 'Valid' : 'Invalid'}
                        </label>
                      ) : (
                        <span className="text-sm text-slate-400">n/a</span>
                      )}
                    </td>
                    <td className="px-4 py-5">
                      {hasLateHoursField(state.selectedModuleId, assessment.id) ? (
                        <input
                          type="number"
                          min="0"
                          value={draft.hoursLate}
                          disabled={draft.status !== 'completed'}
                          onChange={(event) => updateAssessment(assessment.id, { hoursLate: event.target.value })}
                          className="w-24 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 font-bold text-slate-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20"
                        />
                      ) : (
                        <span className="text-sm text-slate-400">n/a</span>
                      )}
                    </td>
                    <td className="px-4 py-5">
                      <div className="space-y-3">
                        {notes.length > 0 ? (
                          <div className="space-y-2">
                            {notes.map((note) => (
                              <p key={note} className="text-xs text-slate-500 leading-relaxed">{note}</p>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">No model notes.</span>
                        )}
                        <textarea
                          value={draft.notes}
                          onChange={(event) => updateAssessment(assessment.id, { notes: event.target.value })}
                          placeholder="Your notes for this assessment"
                          rows={3}
                          className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20"
                        />
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-8 mb-8">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="font-display text-3xl text-stellenbosch-maroon">Mark Needed Table</h2>
            <p className="text-sm text-slate-500 mt-2">Needed on the next open assessment, assuming later required assessments land exactly on the target. Overall Goal is your final module target. Next assessment goal stays assessment-specific.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {neededRows.map((row) => (
              <div key={row.target} className="grid grid-cols-3 gap-4 px-6 py-4 items-center">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Target FM</p>
                  <p className="font-display text-3xl text-slate-900">{row.target}%</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Focus assessment</p>
                  <p className="font-semibold text-slate-700">{row.focusLabel}</p>
                </div>
                <div className={`rounded-2xl border px-4 py-3 text-right ${row.feasible ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                  <p className="text-xs uppercase tracking-wider font-bold opacity-70">Needed mark</p>
                  <p className="font-display text-3xl">{row.needed === null ? 'Blocked' : `${row.needed}%`}</p>
                  <p className="mt-1 text-[11px] font-medium">{row.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-950 text-white rounded-[2.5rem] p-7 shadow-2xl shadow-slate-950/20">
          <h2 className="font-display text-3xl mb-4 flex items-center gap-2"><AlertTriangle className="text-stellenbosch-gold" /> Warnings</h2>
          <div className="space-y-3 text-sm text-white/75">
            {[...extraWarnings, ...output.warnings].length > 0 ? (
              [...extraWarnings, ...output.warnings].map((warning) => <p key={warning}>• {warning}</p>)
            ) : (
              <p>• No engine warnings for the current input set.</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="glass rounded-[2.5rem] p-7 border-slate-200/50">
          <h2 className="font-display text-3xl text-stellenbosch-maroon mb-4 flex items-center gap-2"><Calculator /> Formula explanation</h2>
          <div className="space-y-3 text-sm text-slate-600">
            {selectedModel?.formulaExplanation.map((line) => <p key={line}>{line}</p>)}
          </div>
        </div>
        <div className="bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-sm">
          <h2 className="font-display text-3xl text-stellenbosch-maroon mb-4 flex items-center gap-2"><Target /> Cautionary notes</h2>
          <div className="space-y-3 text-sm text-slate-600">
            {selectedModel?.cautionaryNotes.map((note) => <p key={note}>• {note}</p>)}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Marks;
