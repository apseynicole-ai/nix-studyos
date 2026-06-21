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

export const MARK_ENGINE_STORAGE_KEY = 'baccllb-mark-engine-state';

export interface AssessmentDraftState {
  status?: 'pending' | 'completed' | 'missed';
  completed?: boolean;
  mark?: string;
  validSubmission?: boolean;
  hoursLate?: string;
}

export interface ModuleDraftState {
  assessments?: Record<string, AssessmentDraftState>;
}

interface MarkEngineState {
  modules?: Record<string, ModuleDraftState>;
}

export function getModuleMarksOutput(moduleId: string): MarksOutput | null {
  const state = readLocalJson<MarkEngineState | null>(MARK_ENGINE_STORAGE_KEY, null);
  const moduleState = state?.modules?.[moduleId];
  if (!moduleState?.assessments) return null;
  return calculateModuleMarksOutput(moduleId, moduleState);
}

export function getAllModuleMarksOutputs(): Record<string, MarksOutput | null> {
  const state = readLocalJson<MarkEngineState | null>(MARK_ENGINE_STORAGE_KEY, null);
  const moduleEntries = Object.entries(state?.modules ?? {});
  return Object.fromEntries(
    moduleEntries.map(([moduleId, moduleState]) => [moduleId, calculateModuleMarksOutput(moduleId, moduleState)]),
  );
}

export function calculateModuleMarksOutput(moduleId: string, moduleState: ModuleDraftState): MarksOutput | null {
  const pick = (assessmentId: string) => getAssessmentMark(moduleState.assessments?.[assessmentId]);

  switch (moduleId) {
    case 'econ114':
      return calcEcon114({ a1: pick('A1'), a2: pick('A2'), a3: pick('A3') });
    case 'dla112':
      return calcDLA112({ af: pick('AF'), a1: pick('A1'), a2: pick('A2'), a3: pick('A3') });
    case 'dla122':
      return calcDLA122({
        // The Marks page stores AF as the already-computed best-4-of-6 tutorial average.
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

export function getAssessmentMark(assessment?: AssessmentDraftState): number | null {
  if (!assessment || assessment.status !== 'completed' || !assessment.completed) return null;
  const parsed = parseNumber(assessment.mark ?? '');
  if (parsed === null) return null;
  return Math.max(0, Math.min(100, parsed));
}

export function hasAnyCompletedNumericMark(moduleState: ModuleDraftState): boolean {
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
