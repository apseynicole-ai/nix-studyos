import { getModuleAssessmentModel, calcConLaw178, calcDLA112, calcDLA122, calcEcon114, calcFinAcc178, calcLegalSkills114, calcSDS188, type MarksOutput } from './marksEngine';
import { modules, type ModuleInfo } from '../data/baccllb';
import { readLocalJson } from './localData';
import { getEffectiveModuleConfidence } from './moduleConfidence';
import { hasMissingCurrentMark, hasSourceWarning, isHighRiskModule } from './studyMetrics';
import { readMistakeBank, type MistakeRecord } from './mistakeBank';
import { readTopicMastery, type TopicMasteryRecord, type TopicStatus } from './topicMastery';

export type NextBestActionPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NextBestActionType =
  | 'assessment-prep'
  | 'marks-review'
  | 'topic-revision'
  | 'mistake-retest'
  | 'source-gap'
  | 'final-boss'
  | 'data-entry'
  | 'practice'
  | 'planning';

export interface NextBestActionFactor {
  kind:
    | 'assessment-urgency'
    | 'assessment-weight'
    | 'missing-mark'
    | 'required-mark-pressure'
    | 'topic-confidence'
    | 'topic-stage'
    | 'weak-point'
    | 'mistake-count'
    | 'mistake-retest'
    | 'source-status'
    | 'final-boss'
    | 'study-method'
    | 'verification';
  score: number;
  evidence: string;
}

export interface NextBestAction {
  id: string;
  moduleId: string;
  moduleCode: string;
  title: string;
  actionType: NextBestActionType;
  priority: NextBestActionPriority;
  reason: string;
  evidence: NextBestActionFactor[];
  estimatedMinutes: number;
  dueDate?: string;
  suggestedDate?: string;
  linkedTopic?: string;
  linkedSubtopic?: string;
  linkedMistakeCategory?: string;
  suggestedStudyMethod: string;
  confidenceRiskLabel: string;
  needsVerification: boolean;
}

interface NextBestActionOptions {
  moduleId?: string;
  limit?: number;
}

interface AssessmentDraftState {
  completed?: boolean;
  status?: 'pending' | 'completed' | 'missed';
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

interface ModuleMarkSnapshot {
  currentFinal: number | null;
  warnings: string[];
  isValidFM: boolean;
}

const MARK_ENGINE_STORAGE_KEY = 'baccllb-mark-engine-state';

export function getNextBestActions(options: NextBestActionOptions = {}): NextBestAction[] {
  const topicRecords = readTopicMastery();
  const mistakeRecords = readMistakeBank();
  const scope = options.moduleId ? modules.filter((module) => module.id === options.moduleId) : modules;
  const actions = scope.flatMap((module) => buildModuleActions(module, topicRecords, mistakeRecords));

  return actions
    .sort((a, b) => scoreAction(b) - scoreAction(a) || compareDates(a, b) || a.title.localeCompare(b.title))
    .slice(0, options.limit ?? actions.length);
}

export function scoreModuleRisk(module: ModuleInfo) {
  let score = Math.max(0, 100 - getEffectiveModuleConfidence(module));
  if (hasMissingCurrentMark(module)) score += 12;
  if (hasSourceWarning(module)) score += 10;
  if (module.assessmentRules.impossibleTargetNote) score += 12;
  if (module.assessmentRules.a2A3LogicUncertain) score += 8;
  return Math.min(100, score);
}

export function scoreTopicPriority(record: TopicMasteryRecord) {
  const priorityBonus = { low: 4, medium: 10, high: 18, urgent: 28 }[record.examPriority];
  const stageBonus = { 'not-started': 20, learning: 14, practising: 8, 'exam-ready': 2 }[record.status];
  const confidencePenalty = Math.max(0, 100 - record.confidencePercent) * 0.45;
  const retestBonus = getDateUrgencyScore(record.retestDate, 7);
  const methodGapBonus = Number(!record.readDone) * 4 + Number(!record.notesDone) * 5 + Number(!record.practiceDone) * 8;
  return Math.round(priorityBonus + stageBonus + confidencePenalty + retestBonus + methodGapBonus);
}

export function getAssessmentUrgency(module: ModuleInfo) {
  const nextAssessment = module.assessmentStructure
    .filter((assessment) => assessment.status === 'upcoming' || assessment.status === 'draft')
    .sort((a, b) => compareDateStrings(a.date, b.date))[0];

  if (!nextAssessment) {
    return { score: 0, assessment: null as null };
  }

  return {
    score: getDateUrgencyScore(nextAssessment.date, 30) + Math.min(25, Math.round((nextAssessment.weight ?? 0) / 2)),
    assessment: nextAssessment,
  };
}

export function getMistakeRetestActions(module: ModuleInfo, mistakeRecords: MistakeRecord[]): NextBestAction[] {
  const moduleMistakes = mistakeRecords.filter((record) => record.moduleId === module.id && !record.resolved);
  if (moduleMistakes.length === 0) return [];

  const dueSoon = moduleMistakes
    .filter((record) => getDateUrgencyScore(record.retestDate, 14) > 0)
    .sort((a, b) => compareDateStrings(a.retestDate, b.retestDate));

  const hotspot = dueSoon[0] || moduleMistakes.sort((a, b) => (b.markLost ?? 0) - (a.markLost ?? 0))[0];
  if (!hotspot) return [];

  const factors: NextBestActionFactor[] = [
    {
      kind: 'mistake-count',
      score: Math.min(20, moduleMistakes.length * 4),
      evidence: `${moduleMistakes.length} unresolved mistake${moduleMistakes.length === 1 ? '' : 's'} logged for ${module.shortName}.`,
    },
    {
      kind: 'mistake-retest',
      score: getDateUrgencyScore(hotspot.retestDate, 14),
      evidence: hotspot.retestDate ? `Retest date ${hotspot.retestDate} is approaching.` : 'No retest date set yet for this mistake.',
    },
  ];

  if (hotspot.markLost !== undefined) {
    factors.push({
      kind: 'required-mark-pressure',
      score: Math.min(12, hotspot.markLost),
      evidence: `${hotspot.markLost} mark${hotspot.markLost === 1 ? '' : 's'} were lost on this mistake cluster.`,
    });
  }

  return [
    createAction(module, {
      id: `${module.id}-mistake-${hotspot.id}`,
      title: `${module.code}: retest ${hotspot.mistakeCategory || hotspot.topicName || 'recent mistake pattern'}`,
      actionType: 'mistake-retest',
      reason: `A logged mistake needs a correction loop before it hardens into a repeat error.`,
      evidence: factors,
      estimatedMinutes: 35,
      dueDate: hotspot.retestDate || undefined,
      linkedTopic: hotspot.topicName || undefined,
      linkedMistakeCategory: hotspot.mistakeCategory || undefined,
      suggestedStudyMethod: pickStudyMethod(module, 'mistake-retest', hotspot.topicName),
      confidenceRiskLabel: getRiskLabel(module, hotspot.retestDate ? 'high' : 'medium'),
      needsVerification: module.needsVerification,
    }),
  ];
}

export function getSourceWarningActions(module: ModuleInfo): NextBestAction[] {
  const flaggedSources = module.sourceStatus.items.filter((item) => item.status === 'missing' || item.status === 'partial' || item.status === 'needs-verification');
  if (flaggedSources.length === 0) return [];

  const topSource = flaggedSources[0];
  return [
    createAction(module, {
      id: `${module.id}-source-${slug(topSource.label)}`,
      title: `${module.code}: verify ${topSource.label.toLowerCase()}`,
      actionType: 'source-gap',
      reason: `The module still has source gaps, so any study plan built on this area should be verified before going deep.`,
      evidence: [
        {
          kind: 'source-status',
          score: 20,
          evidence: `${topSource.label} is marked ${topSource.status}${topSource.note ? `: ${topSource.note}` : '.'}`,
        },
        {
          kind: 'verification',
          score: module.needsVerification ? 12 : 6,
          evidence: module.needsVerification ? 'This module already carries a needs-verification flag.' : 'Only part of the source pack is confirmed.',
        },
      ],
      estimatedMinutes: 20,
      suggestedDate: todayIso(),
      linkedTopic: module.topics[0]?.title,
      suggestedStudyMethod: 'Open the official framework/pack first, then update your notes and tracker from the confirmed source.',
      confidenceRiskLabel: 'Verification needed',
      needsVerification: true,
    }),
  ];
}

export function getFinalBossActions(module: ModuleInfo): NextBestAction[] {
  const readinessTrigger = isHighRiskModule(module) || getAssessmentUrgency(module).score >= 24;
  if (!readinessTrigger || module.finalBossVaultItems.length === 0) return [];

  const item = module.finalBossVaultItems[0];
  return [
    createAction(module, {
      id: `${module.id}-final-boss-${item.id}`,
      title: `${module.code}: rehearse ${item.title}`,
      actionType: 'final-boss',
      reason: `This module is close enough to a pressure point that a Final Boss rehearsal now will surface weak recall before the real assessment.`,
      evidence: [
        {
          kind: 'final-boss',
          score: 18,
          evidence: item.description,
        },
        {
          kind: 'assessment-urgency',
          score: getAssessmentUrgency(module).score,
          evidence: getAssessmentUrgency(module).assessment
            ? `${getAssessmentUrgency(module).assessment?.title} is the next open assessment.`
            : 'Use Final Boss mode as a readiness check.',
        },
      ],
      estimatedMinutes: 25,
      suggestedDate: todayIso(),
      linkedTopic: module.topics[0]?.title,
      suggestedStudyMethod: pickStudyMethod(module, 'final-boss', module.topics[0]?.title),
      confidenceRiskLabel: getRiskLabel(module, 'high'),
      needsVerification: module.needsVerification,
    }),
  ];
}

function buildModuleActions(module: ModuleInfo, topicRecords: TopicMasteryRecord[], mistakeRecords: MistakeRecord[]): NextBestAction[] {
  const actions: NextBestAction[] = [];
  const moduleTopics = topicRecords.filter((record) => record.moduleId === module.id);
  const markSnapshot = getModuleMarkSnapshot(module.id);
  const assessmentAction = getAssessmentAction(module, markSnapshot, moduleTopics);
  if (assessmentAction) actions.push(assessmentAction);

  const missingMarkAction = getMissingMarkAction(module, markSnapshot);
  if (missingMarkAction) actions.push(missingMarkAction);

  const topicAction = getTopicAction(module, moduleTopics);
  if (topicAction) actions.push(topicAction);

  const starterAction = getStarterAction(module, moduleTopics);
  if (starterAction) actions.push(starterAction);

  actions.push(...getMistakeRetestActions(module, mistakeRecords));
  actions.push(...getSourceWarningActions(module));
  actions.push(...getFinalBossActions(module));

  return dedupeActions(actions);
}

function getAssessmentAction(module: ModuleInfo, snapshot: ModuleMarkSnapshot | null, topicRecords: TopicMasteryRecord[]) {
  const nextAssessment = module.assessmentStructure
    .filter((assessment) => assessment.status === 'upcoming' || assessment.status === 'draft')
    .sort((a, b) => compareDateStrings(a.date, b.date))[0];

  if (!nextAssessment) return null;

  const linkedRecord = topicRecords
    .slice()
    .sort((a, b) => scoreTopicPriority(b) - scoreTopicPriority(a))[0];
  const linkedTopic = linkedRecord?.topicName || module.topics[0]?.title || module.weakPoints[0];
  const linkedSubtopic = linkedTopic ? module.subtopics.find((subtopic) => subtopic.toLowerCase().includes(linkedTopic.toLowerCase())) : undefined;
  const pressureScore = getMarkPressureScore(module, snapshot);

  return createAction(module, {
    id: `${module.id}-assessment-${nextAssessment.id}`,
    title: `${module.code}: prep ${nextAssessment.title}`,
    actionType: module.area === 'Digital' ? 'practice' : 'assessment-prep',
    reason: `The next open assessment is the strongest short-term pressure point for this module.`,
    evidence: [
      {
        kind: 'assessment-urgency',
        score: getDateUrgencyScore(nextAssessment.date, 30),
        evidence: nextAssessment.date ? `${nextAssessment.title} is scheduled for ${nextAssessment.date}.` : `${nextAssessment.title} is still upcoming.`,
      },
      {
        kind: 'assessment-weight',
        score: Math.min(25, Math.round((nextAssessment.weight ?? 0) / 2)),
        evidence: nextAssessment.weight != null ? `${nextAssessment.weight}% of the module rides on this assessment.` : 'Assessment weight is not fully confirmed yet.',
      },
      {
        kind: 'required-mark-pressure',
        score: pressureScore,
        evidence: getMarkPressureEvidence(module, snapshot),
      },
    ],
    estimatedMinutes: estimateMinutesByArea(module),
    dueDate: nextAssessment.date,
    linkedTopic,
    linkedSubtopic,
    suggestedStudyMethod: pickStudyMethod(module, 'assessment-prep', linkedTopic),
    confidenceRiskLabel: getRiskLabel(module, pressureScore >= 18 ? 'high' : 'medium'),
    needsVerification: module.needsVerification || Boolean(nextAssessment.needsVerification),
  });
}

function getMissingMarkAction(module: ModuleInfo, snapshot: ModuleMarkSnapshot | null) {
  if (!hasMissingCurrentMark(module)) return null;

  const urgency = getAssessmentUrgency(module).score >= 24 ? 'high' : 'medium';
  return createAction(module, {
    id: `${module.id}-missing-mark`,
    title: `${module.code}: enter current marks before planning deeper`,
    actionType: 'data-entry',
    reason: `The app can rank this module more honestly once your latest marks are entered instead of guessed.`,
    evidence: [
      {
        kind: 'missing-mark',
        score: 18,
        evidence: 'Current mark data is missing, so the engine is avoiding zero-assumptions.',
      },
      {
        kind: 'required-mark-pressure',
        score: snapshot?.currentFinal !== null && snapshot?.currentFinal !== undefined ? 8 : 0,
        evidence: snapshot?.currentFinal !== null && snapshot?.currentFinal !== undefined
          ? `A live marks-engine snapshot exists (${Math.round(snapshot.currentFinal)}%), but module-level current marks are still incomplete.`
          : 'No complete marks snapshot is available yet.',
      },
    ],
    estimatedMinutes: 10,
    suggestedDate: todayIso(),
    linkedTopic: module.topics[0]?.title,
    suggestedStudyMethod: 'Open Marks, enter the latest confirmed scores only, then come back for recalculated priorities.',
    confidenceRiskLabel: getRiskLabel(module, urgency),
    needsVerification: module.needsVerification,
  });
}

function getTopicAction(module: ModuleInfo, topicRecords: TopicMasteryRecord[]) {
  const topic = topicRecords
    .filter((record) => record.confidencePercent < 75 || record.examPriority === 'urgent' || Boolean(record.retestDate))
    .sort((a, b) => scoreTopicPriority(b) - scoreTopicPriority(a))[0];

  if (!topic) return null;

  return createAction(module, {
    id: `${module.id}-topic-${topic.id}`,
    title: `${module.code}: ${buildTopicTitle(topic)}`,
    actionType: topic.practiceDone ? 'topic-revision' : 'practice',
    reason: `This topic has the strongest mix of low confidence, unfinished study stages, and exam pressure.`,
    evidence: [
      {
        kind: 'topic-confidence',
        score: Math.round((100 - topic.confidencePercent) * 0.45),
        evidence: `${topic.topicName} is sitting at ${topic.confidencePercent}% confidence.`,
      },
      {
        kind: 'topic-stage',
        score: stageScore(topic.status),
        evidence: `Status is ${topic.status.replace('-', ' ')}${stageGapText(topic)}.`,
      },
      {
        kind: 'study-method',
        score: Number(!topic.practiceDone) * 8 + Number(!topic.notesDone) * 5,
        evidence: describeStudyGap(topic),
      },
    ],
    estimatedMinutes: topic.practiceDone ? 30 : 45,
    dueDate: topic.retestDate || undefined,
    linkedTopic: topic.topicName,
    suggestedStudyMethod: pickStudyMethod(module, topic.practiceDone ? 'topic-revision' : 'practice', topic.topicName),
    confidenceRiskLabel: getRiskLabel(module, topic.examPriority === 'urgent' ? 'high' : 'medium'),
    needsVerification: module.needsVerification,
  });
}

function getStarterAction(module: ModuleInfo, topicRecords: TopicMasteryRecord[]) {
  if (topicRecords.length > 0) return null;

  const starterTopic = module.topics[0];
  const weakPoint = module.weakPoints[0];
  const labelTopic = starterTopic?.title || weakPoint || module.name;

  return createAction(module, {
    id: `${module.id}-starter`,
    title: `${module.code}: start with ${labelTopic}`,
    actionType: 'planning',
    reason: `There is not enough tracked progress yet, so the engine is falling back to the module's known weak points and first confirmed topic area.`,
    evidence: [
      {
        kind: 'weak-point',
        score: 14,
        evidence: weakPoint ? `Known weak point: ${weakPoint}.` : 'No tracked topic progress exists yet.',
      },
      {
        kind: 'study-method',
        score: 8,
        evidence: `${module.studyMethodPreference[0] || 'Module-specific study method'} is the best starter pattern here.`,
      },
    ],
    estimatedMinutes: 30,
    suggestedDate: todayIso(),
    linkedTopic: labelTopic,
    linkedSubtopic: starterTopic?.subtopics[0],
    suggestedStudyMethod: pickStudyMethod(module, 'planning', labelTopic),
    confidenceRiskLabel: getRiskLabel(module, 'medium'),
    needsVerification: module.needsVerification || starterTopic?.needsVerification === true,
  });
}

function createAction(module: ModuleInfo, action: Omit<NextBestAction, 'moduleId' | 'moduleCode' | 'priority'> & { evidence: NextBestActionFactor[] }) : NextBestAction {
  const score = action.evidence.reduce((sum, factor) => sum + factor.score, 0);
  return {
    ...action,
    moduleId: module.id,
    moduleCode: module.code,
    priority: priorityFromScore(score),
  };
}

function priorityFromScore(score: number): NextBestActionPriority {
  if (score >= 52) return 'urgent';
  if (score >= 34) return 'high';
  if (score >= 18) return 'medium';
  return 'low';
}

function scoreAction(action: NextBestAction) {
  return action.evidence.reduce((sum, factor) => sum + factor.score, 0);
}

function dedupeActions(actions: NextBestAction[]) {
  return Array.from(new Map(actions.map((action) => [`${action.moduleId}:${action.title}`, action])).values());
}

function compareDates(a: NextBestAction, b: NextBestAction) {
  return compareDateStrings(a.dueDate || a.suggestedDate, b.dueDate || b.suggestedDate);
}

function compareDateStrings(a?: string, b?: string) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  const left = normaliseDate(a);
  const right = normaliseDate(b);
  if (!left && !right) return 0;
  if (!left) return 1;
  if (!right) return -1;
  return left.localeCompare(right);
}

function getModuleMarkSnapshot(moduleId: string): ModuleMarkSnapshot | null {
  const state = readLocalJson<MarkEngineState | null>(MARK_ENGINE_STORAGE_KEY, null);
  const moduleState = state?.modules?.[moduleId];
  if (!moduleState?.assessments) return null;

  const output = calculateModuleOutput(moduleId, moduleState);
  if (!output) return null;

  return {
    currentFinal: output.fm ?? output.fm2 ?? output.fm1 ?? output.mtd ?? null,
    warnings: output.warnings,
    isValidFM: output.isValidFM,
  };
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
    default:
      return null;
  }
}

function getAssessmentMark(assessment?: AssessmentDraftState): number | null {
  if (!assessment || assessment.status !== 'completed' || !assessment.completed) return null;
  const parsed = parseNumber(assessment.mark ?? '');
  if (parsed === null) return null;
  return Math.max(0, Math.min(100, parsed));
}

function parseNumber(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getMarkPressureScore(module: ModuleInfo, snapshot: ModuleMarkSnapshot | null) {
  if (module.assessmentRules.impossibleTargetNote) return 22;
  if (!snapshot || snapshot.currentFinal === null) return hasMissingCurrentMark(module) ? 8 : 4;
  const gap = Math.max(0, module.target - snapshot.currentFinal);
  return Math.min(24, Math.round(gap / 2.5) + (snapshot.isValidFM ? 0 : 8));
}

function getMarkPressureEvidence(module: ModuleInfo, snapshot: ModuleMarkSnapshot | null) {
  if (module.assessmentRules.impossibleTargetNote) return module.assessmentRules.impossibleTargetNote;
  if (!snapshot || snapshot.currentFinal === null) {
    return hasMissingCurrentMark(module)
      ? 'Current marks are incomplete, so this recommendation is preserving pressure without inventing a number.'
      : 'No live marks snapshot is available yet.';
  }

  const rounded = Math.round(snapshot.currentFinal);
  if (!snapshot.isValidFM) {
    return `Live marks-engine snapshot is ${rounded}%, but the final-mark path is not yet fully valid.`;
  }
  return `Live marks-engine snapshot is ${rounded}% against a ${module.target}% target.`;
}

function pickStudyMethod(module: ModuleInfo, actionType: NextBestActionType, linkedTopic?: string) {
  if (module.code === 'ECO114') {
    return `Work the Econ chain: definition -> graph -> explanation -> application question${linkedTopic ? ` on ${linkedTopic}` : ''}.`;
  }
  if (module.code === 'SDS188') {
    return 'Use a formula-choice drill, then a distribution decision tree, then mixed practice with interpretation wording.';
  }
  if (module.code === 'FAF178') {
    return 'Use the FinAcc chain: classify -> calculate -> journal/disclose -> presentation.';
  }
  if (module.area === 'Law') {
    return 'Build case cards or an IRAC skeleton, then do a short application/essay plan with source accuracy checks.';
  }
  if (module.area === 'Digital') {
    return 'Do one applied practical task, then verify the system logic or submission evidence step-by-step.';
  }
  return module.studyMethodPreference[0] || `Use the next best method already preferred for ${module.shortName}.`;
}

function estimateMinutesByArea(module: ModuleInfo) {
  switch (module.area) {
    case 'Accounting':
    case 'Quantitative':
      return 50;
    case 'Digital':
      return 40;
    default:
      return 35;
  }
}

function getRiskLabel(module: ModuleInfo, level: 'low' | 'medium' | 'high' | 'verification') {
  if (level === 'verification') return 'Verification needed';
  if (module.assessmentRules.impossibleTargetNote) return 'Impossible target risk';
  if (level === 'high') return 'High risk';
  if (level === 'medium') return 'Pressure building';
  return 'Starter / maintenance';
}

function buildTopicTitle(topic: TopicMasteryRecord) {
  if (!topic.practiceDone) return `practise ${topic.topicName}`;
  if (!topic.notesDone) return `tighten notes for ${topic.topicName}`;
  if (!topic.readDone) return `re-read ${topic.topicName}`;
  return `retest ${topic.topicName}`;
}

function stageScore(status: TopicStatus) {
  return {
    'not-started': 20,
    learning: 14,
    practising: 8,
    'exam-ready': 2,
  }[status];
}

function stageGapText(topic: TopicMasteryRecord) {
  const gaps = [];
  if (!topic.readDone) gaps.push('reading incomplete');
  if (!topic.notesDone) gaps.push('notes incomplete');
  if (!topic.practiceDone) gaps.push('practice incomplete');
  return gaps.length > 0 ? `; ${gaps.join(', ')}` : '';
}

function describeStudyGap(topic: TopicMasteryRecord) {
  const gaps = [];
  if (!topic.readDone) gaps.push('reading still needs to happen');
  if (!topic.notesDone) gaps.push('notes are not locked in yet');
  if (!topic.practiceDone) gaps.push('practice is still missing');
  return gaps.length > 0 ? gaps.join('; ') : 'This topic mostly needs a retest rather than a rebuild.';
}

function getDateUrgencyScore(value: string | undefined, horizonDays: number) {
  const date = normaliseDate(value);
  if (!date) return 0;
  const today = normaliseDate(todayIso());
  if (!today) return 0;
  const days = diffDays(today, date);
  if (days < 0) return 0;
  if (days <= 1) return 26;
  if (days <= 3) return 22;
  if (days <= 7) return 16;
  if (days <= 14) return horizonDays >= 14 ? 10 : 6;
  if (days <= horizonDays) return 5;
  return 0;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function normaliseDate(value?: string) {
  if (!value) return null;
  const match = value.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
}

function diffDays(startIso: string, endIso: string) {
  const start = new Date(`${startIso}T00:00:00`);
  const end = new Date(`${endIso}T00:00:00`);
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
