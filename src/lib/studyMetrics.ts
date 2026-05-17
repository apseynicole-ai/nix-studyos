import { modules, type ModuleInfo } from '../data/baccllb';
import { readLocalJson } from './localData';
import {
  calcConLaw178,
  calcDLA112,
  calcDLA122,
  calcEcon114,
  calcFinAcc178,
  calcLegalSkills114,
  calcSDS188,
  type MarksOutput,
} from './marksEngine';

export interface MarkScenario {
  currentMark: number;
  completedWeight: number;
  nextWeight: number;
  targetMark: number;
}

export function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export function requiredMarkForTarget({ currentMark, completedWeight, nextWeight, targetMark }: MarkScenario) {
  const remainingWeightAfterNext = Math.max(0, 100 - completedWeight - nextWeight);
  const achievedWeighted = (currentMark * completedWeight) / 100;
  const neededWeightedFromNextAndFuture = targetMark - achievedWeighted;

  if (nextWeight <= 0) return 0;

  // Conservative: assumes future remaining assessments hit the target mark.
  const futureContributionAtTarget = (targetMark * remainingWeightAfterNext) / 100;
  const requiredFromNext = neededWeightedFromNextAndFuture - futureContributionAtTarget;
  return clamp((requiredFromNext / nextWeight) * 100, 0, 150);
}

export function readinessLabel(score: number) {
  if (score >= 80) return 'Distinction-ready';
  if (score >= 65) return 'On track';
  if (score >= 50) return 'Needs pressure practice';
  return 'High-risk focus zone';
}

export function riskTone(score: number) {
  if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-100';
  if (score >= 65) return 'text-blue-700 bg-blue-50 border-blue-100';
  if (score >= 50) return 'text-amber-700 bg-amber-50 border-amber-100';
  return 'text-red-700 bg-red-50 border-red-100';
}

export function getModule(moduleId?: string) {
  return modules.find((module) => module.id === moduleId) || modules[0];
}

export function hasMissingCurrentMark(module: ModuleInfo) {
  if (module.currentMarks.overall !== null && module.currentMarks.overall !== undefined) return false;
  return module.currentMarks.byAssessment.every((assessment) => assessment.value === null);
}

export function hasSourceWarning(module: ModuleInfo) {
  return module.sourceStatus.items.some((item) => item.status === 'missing' || item.status === 'partial' || item.status === 'needs-verification');
}

export function isHighRiskModule(module: ModuleInfo) {
  return module.confidence < 50 || Boolean(module.assessmentRules.impossibleTargetNote);
}

export function moduleFlags(module: ModuleInfo) {
  const flags: Array<{ label: string; tone: string }> = [];

  if (module.needsVerification) {
    flags.push({ label: 'Needs verification', tone: 'bg-amber-50 text-amber-800 border-amber-100' });
  }
  if (hasSourceWarning(module)) {
    flags.push({ label: 'Source warning', tone: 'bg-orange-50 text-orange-800 border-orange-100' });
  }
  if (hasMissingCurrentMark(module)) {
    flags.push({ label: 'Current mark missing', tone: 'bg-slate-100 text-slate-700 border-slate-200' });
  }
  if (isHighRiskModule(module)) {
    flags.push({ label: 'High risk', tone: 'bg-red-50 text-red-800 border-red-100' });
  }
  if (module.assessmentRules.impossibleTargetNote) {
    flags.push({ label: 'Impossible target', tone: 'bg-red-50 text-red-800 border-red-100' });
  }
  if (module.assessmentRules.a2A3LogicUncertain) {
    flags.push({ label: 'A2/A3 logic uncertain', tone: 'bg-yellow-50 text-yellow-800 border-yellow-100' });
  }

  return flags;
}

export function averageConfidence() {
  return Math.round(modules.reduce((sum, module) => sum + module.confidence, 0) / modules.length);
}

export function modulesMissingCurrentMarks() {
  return modules.filter((module) => hasMissingCurrentMark(module));
}

export function modulesWithSourceWarnings() {
  return modules.filter((module) => hasSourceWarning(module));
}

export function highRiskModules() {
  return modules.filter((module) => isHighRiskModule(module));
}

export function upcomingAssessments() {
  return modules
    .flatMap((module) => module.assessments.map((assessment) => ({ ...assessment, module })))
    .filter((item) => item.status === 'upcoming' || item.status === 'draft')
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function priorityScore(confidence: number, target = 80) {
  return clamp(Math.round((target - confidence) * 1.25 + 35));
}

interface AssessmentDraftState {
  status?: 'pending' | 'completed' | 'missed';
  completed?: boolean;
  mark?: string;
  validSubmission?: boolean;
  hoursLate?: string;
}

interface ModuleDraftState {
  assessments?: Record<string, AssessmentDraftState>;
}

interface MarkEngineState {
  modules?: Record<string, ModuleDraftState>;
}

export interface DashboardMarksPressureItem {
  moduleId: string;
  moduleCode: string;
  moduleName: string;
  targetMark: number;
  currentFinal: number | null;
  isValidFM: boolean;
  warnings: string[];
  belowTarget: boolean;
  pressureScore: number;
  needsHighRecovery: boolean;
}

export interface DashboardMarksPressureSummary {
  modulesBelowTarget: number;
  modulesWithSnapshots: number;
  hasAnyMarkData: boolean;
  mostAtRisk: DashboardMarksPressureItem | null;
}

const MARK_ENGINE_STORAGE_KEY = 'baccllb-mark-engine-state';
const MODULE_TARGETS_KEY = 'baccllb-module-targets';

export function getDashboardMarksPressureSummary(): DashboardMarksPressureSummary {
  const state = readLocalJson<MarkEngineState | null>(MARK_ENGINE_STORAGE_KEY, null);
  const moduleTargets = readLocalJson<Record<string, number> | null>(MODULE_TARGETS_KEY, null) || {};

  const items = modules
    .map((module) => buildMarksPressureItem(module, state?.modules?.[module.id], moduleTargets[module.id]))
    .filter((item): item is DashboardMarksPressureItem => item !== null);

  const belowTargetItems = items.filter((item) => item.belowTarget);

  return {
    modulesBelowTarget: belowTargetItems.length,
    modulesWithSnapshots: items.length,
    hasAnyMarkData: items.length > 0,
    mostAtRisk: [...items].sort((left, right) => right.pressureScore - left.pressureScore)[0] || null,
  };
}

function buildMarksPressureItem(
  module: ModuleInfo,
  moduleState: ModuleDraftState | undefined,
  targetOverride: number | undefined,
): DashboardMarksPressureItem | null {
  if (!moduleState?.assessments) return null;
  if (!hasAnyCompletedNumericMark(moduleState)) return null;

  const output = calculateModuleOutput(module.id, moduleState);
  if (!output) return null;

  // MTD before FM1: MTD normalises over completed assessments only; FM1 uses a fixed
  // denominator in some models (ConLaw178, Foundations178) and would treat pending
  // slots as zero, artificially deflating the pressure score.
  const currentFinal = output.fm ?? output.fm2 ?? output.mtd ?? output.fm1 ?? null;
  const targetMark = normaliseTarget(targetOverride, module.target);
  const gap = currentFinal === null ? 0 : Math.max(0, targetMark - currentFinal);
  const pressureScore = output.isValidFM ? Math.min(100, Math.round(gap * 5)) : Math.min(100, Math.round(gap * 5) + 25);

  return {
    moduleId: module.id,
    moduleCode: module.code,
    moduleName: module.shortName,
    targetMark,
    currentFinal,
    isValidFM: output.isValidFM,
    warnings: output.warnings,
    belowTarget: currentFinal !== null && currentFinal < targetMark,
    pressureScore,
    needsHighRecovery: !output.isValidFM || gap >= 10,
  };
}

function normaliseTarget(override: number | undefined, fallback: number) {
  if (typeof override === 'number' && Number.isFinite(override)) {
    return clamp(Math.round(override), 0, 100);
  }
  return fallback;
}

function calculateModuleOutput(moduleId: string, moduleState: ModuleDraftState): MarksOutput | null {
  const pick = (assessmentId: string) => getAssessmentMark(moduleState.assessments?.[assessmentId]);

  switch (moduleId) {
    case 'econ114':
      return calcEcon114({ a1: pick('A1'), a2: pick('A2'), a3: pick('A3') });
    case 'dla112':
      return calcDLA112({ af: pick('AF'), a1: pick('A1'), a2: pick('A2'), a3: pick('A3') });
    case 'dla122':
      return calcDLA122({
        af: pick('AF'),
        a1: pick('A1'),
        a1Valid: moduleState.assessments?.A1?.validSubmission ?? true,
        a2: pick('A2'),
        a2Valid: moduleState.assessments?.A2?.validSubmission ?? true,
        a3: pick('A3'),
        hoursLateA1: parseNumber(moduleState.assessments?.A1?.hoursLate ?? '') ?? 0,
        hoursLateA2: parseNumber(moduleState.assessments?.A2?.hoursLate ?? '') ?? 0,
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
    default:
      return null;
  }
}

function getAssessmentMark(assessment?: AssessmentDraftState): number | null {
  if (!assessment || assessment.status !== 'completed' || !assessment.completed) return null;
  const parsed = parseNumber(assessment.mark ?? '');
  if (parsed === null) return null;
  return clamp(parsed, 0, 100);
}

function hasAnyCompletedNumericMark(moduleState: ModuleDraftState) {
  return Object.values(moduleState.assessments || {}).some((assessment) => {
    if (!assessment || assessment.status !== 'completed' || !assessment.completed) return false;
    return parseNumber(assessment.mark ?? '') !== null;
  });
}

function parseNumber(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
