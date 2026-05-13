// BAccLLB module-specific marks engine

import type { ModuleAssessmentModel, MarksOutput } from '../types/academic';
export type { MarksOutput };

// ─── Economics 114 ───────────────────────────────────────────────────────────

const econ114Model: ModuleAssessmentModel = {
  moduleId: 'econ114',
  moduleName: 'Economics 114',
  assessmentModelType: 'FLEX_A3_SUBSTITUTE',
  assessments: [
    { id: 'A1', label: 'A1 (Class Test)', weight: 40 },
    { id: 'A2', label: 'A2 (Semester Test)', weight: 60 },
    { id: 'A3', label: 'A3 (Supplementary / Substitute Exam)', weight: 60, isOptional: true },
  ],
  passRequirements: [
    {
      type: 'AT_LEAST_ONE_OF',
      description: 'Must complete at least one of A2 or A3 for a valid FM.',
      assessmentIds: ['A2', 'A3'],
      minimumCount: 1,
    },
    {
      type: 'MINIMUM_ASSESSMENTS_COMPLETED',
      description: 'Must complete at least two main assessment opportunities for a valid FM.',
      minimumCount: 2,
    },
  ],
  a3Rules: [
    {
      type: 'SUBSTITUTE_MISSED_SAME_WEIGHT',
      description: 'A3 carries the same 60% weight as A2 and substitutes for A2 if A2 was missed or A3 is higher.',
      conditions: ['A3 replaces A2 at equal weight (60)', 'A3 is not capped at 50'],
    },
  ],
  formulaExplanation: [
    'FM = A1 (40%) + A2 (60%), where A3 can substitute for A2 at the same weight.',
    'If both A2 and A3 are written, confirm with official module handbook which score applies.',
  ],
  cautionaryNotes: [
    'UNVERIFIED EDGE CASE: if both A2 and A3 are written, confirm whether best-of or A3-overrides applies.',
    'Missing both A2 and A3 results in an invalid FM regardless of A1 mark.',
  ],
  needsVerification: false,
};

// ─── DLA 112 ─────────────────────────────────────────────────────────────────

const dla112Model: ModuleAssessmentModel = {
  moduleId: 'dla112',
  moduleName: 'Digital & Leadership Acumen 112',
  assessmentModelType: 'FLEX_A3_SUBSTITUTE',
  assessments: [
    { id: 'A1',  label: 'A1 (Assignment / Project)',  weight: 40 },
    { id: 'AF',  label: 'AF (Formative Component)',   weight: 10 },
    { id: 'A2',  label: 'A2 (Semester Test)',          weight: 50 },
    { id: 'A3',  label: 'A3 (Substitute / Suppl)',     weight: 50, isOptional: true },
  ],
  passRequirements: [
    {
      type: 'AT_LEAST_ONE_OF',
      description: 'Must complete at least one of A2 or A3.',
      assessmentIds: ['A2', 'A3'],
      minimumCount: 1,
    },
    {
      type: 'MINIMUM_ASSESSMENTS_COMPLETED',
      description: 'Must complete at least two main assessment opportunities (A1, A2, A3) for a valid FM.',
      assessmentIds: ['A1', 'A2', 'A3'],
      minimumCount: 2,
    },
  ],
  a3Rules: [
    {
      type: 'SUBSTITUTE_MISSED_SAME_WEIGHT',
      description: 'A3 substitutes for A2 at equal weight (50%). Not capped at 50.',
    },
  ],
  formulaExplanation: [
    'FM = A1 (40%) + AF (10%) + A2 or A3 (50%).',
    'A3 replaces A2 at the same weight when A2 is missed or when A3 is written as a supplementary.',
  ],
  cautionaryNotes: [
    'UNVERIFIED: AF internal mechanics — confirm whether AF is awarded automatically or requires specific tasks.',
    'DLA 112 shares a module code sequence with DLA 122 — treat marks separately.',
  ],
  needsVerification: false,
};

// ─── DLA 122 ─────────────────────────────────────────────────────────────────

const dla122Model: ModuleAssessmentModel = {
  moduleId: 'dla122',
  moduleName: 'Digital & Leadership Acumen 122',
  assessmentModelType: 'FLEX_A3_SUBSTITUTE',
  assessments: [
    { id: 'A1',  label: 'A1 (Assignment / Project)',  weight: 35 },
    { id: 'AF',  label: 'AF (Best 4 of 6 Tutorials)', weight: 20, countRule: 'best 4 of 6' },
    { id: 'A2',  label: 'A2 (Semester Test)',          weight: 45 },
    { id: 'A3',  label: 'A3 (Substitute / Suppl)',     weight: 45, isOptional: true },
  ],
  passRequirements: [
    {
      type: 'SUBMINIMUM_ASSESSMENT',
      description: 'A valid A1 is required. An invalid A1 cannot be rescued by A3.',
      assessmentIds: ['A1'],
    },
    {
      type: 'SUBMINIMUM_ASSESSMENT',
      description: 'A valid A2 is required. An invalid A2 cannot be rescued by A3.',
      assessmentIds: ['A2'],
    },
  ],
  a3Rules: [
    {
      type: 'SUBSTITUTE_MISSED_SAME_WEIGHT',
      description: 'A3 can substitute for A2 at equal weight (45%) if A2 was missed.',
      conditions: ['A3 does NOT rescue an invalid A1', 'A3 does NOT rescue an invalid A2 — subminimum rules still apply'],
    },
  ],
  subminimumRules: [
    { assessmentId: 'A1', minimumMark: 40, description: 'UNVERIFIED numeric threshold — document requires valid/competent A1 but does not confirm 40% as the exact cut-off.' },
    { assessmentId: 'A2', minimumMark: 40, description: 'UNVERIFIED numeric threshold — document requires valid/competent A2 but does not confirm 40% as the exact cut-off.' },
  ],
  latePenaltyRules: [
    { hoursAfterDeadline: 6,   cumulativeDeduction: 10, description: '0–6 h late' },
    { hoursAfterDeadline: 12,  cumulativeDeduction: 15, description: '6–12 h late' },
    { hoursAfterDeadline: 24,  cumulativeDeduction: 20, description: '12–24 h late' },
    { hoursAfterDeadline: 36,  cumulativeDeduction: 25, description: '24–36 h late' },
    { hoursAfterDeadline: 48,  cumulativeDeduction: 30, description: '36–48 h late' },
    { hoursAfterDeadline: 72,  cumulativeDeduction: 40, description: '48–72 h late' },
    { hoursAfterDeadline: 96,  cumulativeDeduction: 50, description: '72–96 h late' },
    { hoursAfterDeadline: 120, cumulativeDeduction: 60, description: '96–120 h late' },
    { hoursAfterDeadline: 144, cumulativeDeduction: 70, description: '120–144 h late' },
    { hoursAfterDeadline: 168, cumulativeDeduction: 80, description: '144–168 h late (max 80)' },
  ],
  formulaExplanation: [
    'FM = A1 (35%) + AF (20%, best 4 of 6 tutorials) + A2 or A3 (45%).',
    'AF counts the best 4 scores from 6 available tutorials — lowest 2 are dropped.',
    'A3 substitutes A2 when A2 is missed; it does not override A1/A2 subminimum failures.',
  ],
  cautionaryNotes: [
    'UNVERIFIED: exact numeric competence threshold for A1 and A2 subminimum — 40% is a placeholder pending 2026 module guide confirmation.',
    'A3 cannot rescue an invalid A1 regardless of A3 mark.',
    'A3 cannot rescue an invalid A2 — subminimum rules still apply after substitution.',
  ],
  needsVerification: true,
};

// ─── Financial Accounting 178 ─────────────────────────────────────────────────

const finacc178Model: ModuleAssessmentModel = {
  moduleId: 'finacc178',
  moduleName: 'Financial Accounting 178',
  assessmentModelType: 'MULTI_SEMESTER',
  assessments: [
    { id: 'A1S1', label: 'A1 Semester 1 (Class Test)',   weight: 15, semester: 'S1' },
    { id: 'A2S1', label: 'A2 Semester 1 (Main Test)',    weight: 20, semester: 'S1' },
    { id: 'A1S2', label: 'A1 Semester 2 (Class Test)',   weight: 20, semester: 'S2' },
    { id: 'A2S2', label: 'A2 Semester 2 (Main Test)',    weight: 40, semester: 'S2' },
    { id: 'AFS2', label: 'AF Semester 2 (Formative)',    weight: 5,  semester: 'S2' },
    {
      id: 'A3',
      label: 'A3 (Exam — variable weight)',
      weight: 0,
      isOptional: true,
      notes: 'A3 weight is variable depending on which main assessments were missed. See a3Rules.',
    },
  ],
  passRequirements: [
    {
      type: 'MINIMUM_MARK',
      description: 'Minimum FM of 50% required to pass the module.',
      minimumMark: 50,
    },
  ],
  a3Rules: [
    {
      type: 'SUBSTITUTE_MISSED_SAME_WEIGHT',
      description: 'A3 substitutes for missed main assessments; weight equals the missed assessment(s) weight.',
      conditions: [
        'A3 weight = weight of missed main assessment(s)',
        'Exact cap and combination rules need verification against 2026 handbook',
      ],
    },
  ],
  formulaExplanation: [
    'FM = A1S1 (15%) + A2S1 (20%) + A1S2 (20%) + A2S2 (40%) + AFS2 (5%).',
    'Total across both semesters = 100%.',
    'A3 carries a variable weight matching the missed main assessment; exact formula pending verification.',
  ],
  cautionaryNotes: [
    'UNVERIFIED: A3 variable weight logic — which missed mains qualify, cap rules, and combination behaviour.',
    'UNVERIFIED: AFS2 delivery method (submission vs invigilated).',
  ],
  needsVerification: true,
};

// ─── Statistics and Data Science 188 ─────────────────────────────────────────

const sds188Model: ModuleAssessmentModel = {
  moduleId: 'sds188',
  moduleName: 'Statistics and Data Science 188',
  assessmentModelType: 'MULTI_SEMESTER',
  assessments: [
    { id: 'A1S1',  label: 'A1 Semester 1 (Class Test)',  weight: 10, semester: 'S1' },
    { id: 'A2S1',  label: 'A2 Semester 1 (Main Test)',   weight: 25, semester: 'S1' },
    { id: 'AFS1',  label: 'AF Semester 1 (Formative)',   weight: 5,  semester: 'S1' },
    { id: 'A1S2',  label: 'A1 Semester 2 (Class Test)',  weight: 25, semester: 'S2' },
    { id: 'A2S2',  label: 'A2 Semester 2 (Main Test)',   weight: 30, semester: 'S2' },
    { id: 'AFS2',  label: 'AF Semester 2 (Formative)',   weight: 5,  semester: 'S2' },
    { id: 'A3',    label: 'A3 (Exam)',                   weight: 40, isOptional: true },
  ],
  passRequirements: [
    {
      type: 'MINIMUM_MARK',
      description: 'Minimum FM of 50% required to pass.',
      minimumMark: 50,
    },
  ],
  a3Rules: [
    {
      type: 'SUBSTITUTE_MISSED_SAME_WEIGHT',
      description: 'A3 (40%) can substitute for missed main assessments or act as a supplementary opportunity.',
      conditions: [
        'A3 weight is fixed at 40 regardless of which assessment is substituted — needs verification',
      ],
    },
  ],
  formulaExplanation: [
    'S1 base: A1S1 (10%) + A2S1 (25%) + AFS1 (5%) = 40%.',
    'S2 base: A1S2 (25%) + A2S2 (30%) + AFS2 (5%) = 60%.',
    'Total without A3 = 100%. A3 (40%) substitutes for missed mains.',
  ],
  cautionaryNotes: [
    'UNVERIFIED EDGE CASE: A3 substitution logic — confirm which specific assessment A3 replaces and whether a cap applies.',
    'UNVERIFIED: AFS1 and AFS2 delivery method (invigilated vs submission-based).',
  ],
  needsVerification: false,
};

// ─── Legal Skills 114 ────────────────────────────────────────────────────────

const legalskills114Model: ModuleAssessmentModel = {
  moduleId: 'legalskills114',
  moduleName: 'Legal Skills 114',
  assessmentModelType: 'CONTINUOUS_ONLY',
  assessments: [
    { id: 'RT',   label: 'ReadTheory',                          weight: 5  },
    { id: 'LW',   label: 'Legal Writing Short Course',          weight: 10 },
    { id: 'AO',   label: 'Asynchronous Online Component',       weight: 10 },
    { id: 'T1',   label: 'A1 Test',                             weight: 15 },
    { id: 'T2',   label: 'A2 Test',                             weight: 20 },
    { id: 'AE',   label: 'Academic Essay',                      weight: 30 },
    { id: 'MQ',   label: 'Micro Quizzes',                       weight: 10 },
  ],
  passRequirements: [
    {
      type: 'MINIMUM_MARK',
      description: 'Minimum FM of 50% required to pass.',
      minimumMark: 50,
    },
    {
      type: 'MINIMUM_ASSESSMENTS_COMPLETED',
      description: 'All continuous assessment components must be submitted — no rescue exam exists.',
      minimumCount: 7,
    },
  ],
  a3Rules: [
    {
      type: 'NO_A3',
      description: 'Legal Skills 114 has no formal exam and no A3 rescue path. Every component counts.',
    },
  ],
  formulaExplanation: [
    'FM = RT (5%) + LW (10%) + AO (10%) + T1 (15%) + T2 (20%) + AE (30%) + MQ (10%).',
    'Total = 100%. All components are continuous — no exam rescue opportunity.',
  ],
  cautionaryNotes: [
    'Missing any component cannot be compensated by other marks.',
    'Academic essay (30%) carries the highest single weight — prioritise quality and submission compliance.',
    'UNVERIFIED: ReadTheory exact screenshot evidence requirements.',
    'UNVERIFIED: Micro-quiz count and drop policy — confirm with 2026 LSK114 guide.',
  ],
  needsVerification: false,
};

// ─── Public Law / Introduction to Constitutional Law and Statutory Interpretation 178 ─

const conlaw178Model: ModuleAssessmentModel = {
  moduleId: 'conlaw178',
  moduleName: 'Introduction to Constitutional Law and Statutory Interpretation 178',
  assessmentModelType: 'FLEX_A3_SUBSTITUTE',
  assessments: [
    { id: 'AFS1', label: 'AF Semester 1 (Formative)',   weight: 5,  semester: 'S1' },
    { id: 'A1S1', label: 'A1 Semester 1 (Class Test)',  weight: 15, semester: 'S1' },
    { id: 'A2S1', label: 'A2 Semester 1 (Main Test)',   weight: 20, semester: 'S1' },
    { id: 'AFS2', label: 'AF Semester 2 (Formative)',   weight: 10, semester: 'S2' },
    { id: 'A1S2', label: 'A1 Semester 2 (Class Test)',  weight: 20, semester: 'S2' },
    { id: 'A2S2', label: 'A2 Semester 2 (Main Test)',   weight: 30, semester: 'S2' },
    {
      id: 'A3',
      label: 'A3 (Exam — flexible year model)',
      weight: 0,
      isOptional: true,
      notes: 'Four distinct scenarios govern A3 weight and FM cap. See a3Rules.',
    },
  ],
  passRequirements: [
    {
      type: 'MINIMUM_MARK',
      description: 'Minimum FM of 50% required to pass.',
      minimumMark: 50,
    },
  ],
  a3Rules: [
    {
      type: 'SUBSTITUTE_MISSED_SAME_WEIGHT',
      description:
        'Scenario A — missed exactly one main assessment: A3 substitutes at that assessment\'s weight. FM is NOT capped at 50.',
      cappedAt: undefined,
      canReduceFM: false,
      conditions: ['Missed exactly one of A1S1, A2S1, A1S2, A2S2'],
    },
    {
      type: 'SUBSTITUTE_COMBINED_MISSED',
      description:
        'Scenario B — missed exactly two main assessments: A3 carries the combined weight of both missed assessments. FM is NOT capped at 50.',
      cappedAt: undefined,
      canReduceFM: false,
      conditions: ['Missed exactly two of A1S1, A2S1, A1S2, A2S2'],
    },
    {
      type: 'SUBSTITUTE_WORST_CAPPED',
      description:
        'Scenario C — completed all four main assessments but FM below 50: A3 replaces the worst-weighted main assessment. FM is CAPPED at 50. A3 cannot reduce FM.',
      cappedAt: 50,
      canReduceFM: false,
      conditions: ['All four main assessments completed', 'FM before A3 is below 50', 'A3 replaces lowest-weighted main only'],
    },
    {
      type: 'FM_CAP_PENALTY',
      description:
        'Scenario D — missed more than two main assessments: FM is capped at 45 regardless of A3. Module fail warning applies.',
      cappedAt: 45,
      canReduceFM: false,
      conditions: ['Missed more than two of A1S1, A2S1, A1S2, A2S2'],
    },
  ],
  formulaExplanation: [
    'Base FM = AFS1 (5%) + A1S1 (15%) + A2S1 (20%) + AFS2 (10%) + A1S2 (20%) + A2S2 (30%) = 100%.',
    'A3 replaces one or two missed mains at equal weight when fewer than three mains are missed.',
    'When all four mains are done but FM < 50, A3 replaces the worst main, FM capped at 50.',
    'When more than two mains are missed, FM is hard-capped at 45.',
  ],
  cautionaryNotes: [
    'UNVERIFIED EDGE CASE: "worst weighted main" in Scenario C — confirm whether it means lowest raw score or lowest weighted contribution.',
    'UNVERIFIED: whether AF components are excluded from A3 substitution in all scenarios.',
  ],
  needsVerification: false,
};

const foundations178Model: ModuleAssessmentModel = {
  ...conlaw178Model,
  moduleId: 'foundations178',
  moduleName: 'Foundations of Law 178',
  cautionaryNotes: [
    ...conlaw178Model.cautionaryNotes,
    'Foundations of Law 178 is currently using the public-law flexible-year assessment model and should be verified against the official Foundations module framework.',
  ],
  needsVerification: true,
};

// ─── Module model registry ────────────────────────────────────────────────────

export const moduleAssessmentModels: Record<string, ModuleAssessmentModel> = {
  econ114:        econ114Model,
  dla112:         dla112Model,
  dla122:         dla122Model,
  finacc178:      finacc178Model,
  foundations178: foundations178Model,
  sds188:         sds188Model,
  legalskills114: legalskills114Model,
  conlaw178:      conlaw178Model,
};

export function getModuleAssessmentModel(moduleId: string): ModuleAssessmentModel | undefined {
  return moduleAssessmentModels[moduleId];
}

export function getModelsNeedingVerification(): ModuleAssessmentModel[] {
  return Object.values(moduleAssessmentModels).filter((m) => m.needsVerification);
}

// ─── Calculation helpers ──────────────────────────────────────────────────────

// Weighted average per EMS formula: missing assessments have weight 0; wsum >= 1.
function wCalc(components: Array<{ w: number; mark: number | null }>): number {
  const wsum = Math.max(1, components.reduce((s, c) => s + (c.mark !== null ? c.w : 0), 0));
  return components.reduce((s, c) => s + (c.mark !== null ? (c.w / wsum) * c.mark : 0), 0);
}

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ─── Economics 114 calculator ─────────────────────────────────────────────────

export interface Econ114Input {
  a1: number | null;
  a2: number | null;
  a3: number | null;
}

export function calcEcon114(input: Econ114Input): MarksOutput {
  const { a1, a2, a3 } = input;
  const warnings: string[] = [];

  const mtd = a1 !== null ? r2(wCalc([{ w: 40, mark: a1 }])) : null;
  if (a1 === null) warnings.push('A1 not completed — no MTD.');

  const fm1 = (a1 !== null && a2 !== null) ? r2(wCalc([{ w: 40, mark: a1 }, { w: 60, mark: a2 }])) : null;
  if (a1 === null && a2 !== null) warnings.push('FM1 not assigned — A1 required alongside A2.');

  const completedMains = [a1, a2, a3].filter((m) => m !== null).length;
  const fm2 = completedMains >= 2
    ? r2(wCalc([{ w: 40, mark: a1 }, { w: 60, mark: a2 }, { w: 60, mark: a3 }]))
    : null;

  const hasA2orA3 = a2 !== null || a3 !== null;
  const hasTwoMains = completedMains >= 2;
  const isValidFM = hasA2orA3 && hasTwoMains;

  if (!hasA2orA3) warnings.push('INVALID FM: must complete at least one of A2 or A3.');
  if (!hasTwoMains) warnings.push('INVALID FM: must complete at least two main assessments.');
  if (a1 === null && a2 === null && a3 !== null) warnings.push('Only A3 completed — FM simulation only, no valid FM.');

  const fm = isValidFM ? r2(Math.max(fm1 ?? 0, fm2 ?? 0)) : null;

  // Self-check: A1=50, A2=70 → FM1 = (40*50+60*70)/100 = 62
  const sc = r2(wCalc([{ w: 40, mark: 50 }, { w: 60, mark: 70 }]));
  const selfCheck = [
    `Econ114: A1=${a1} A2=${a2} A3=${a3} → MTD=${mtd} FM1=${fm1} FM2=${fm2} FM=${fm} valid=${isValidFM}`,
    `Self-check [A1=50,A2=70]: FM1 expected 62, got ${sc} — ${sc === 62 ? 'PASS' : 'FAIL'}`,
  ];

  return { mtd, fm1, fm2, fm, isValidFM, warnings, selfCheck };
}

// ─── DLA 112 calculator ───────────────────────────────────────────────────────

export interface DLA112Input {
  af: number | null;
  a1: number | null;
  a2: number | null;
  a3: number | null;
}

export function calcDLA112(input: DLA112Input): MarksOutput {
  const { af, a1, a2, a3 } = input;
  const warnings: string[] = [];

  const mtd = a1 !== null ? r2(wCalc([{ w: 10, mark: af }, { w: 40, mark: a1 }])) : null;
  if (a1 === null) warnings.push('A1 not completed — no MTD.');

  const fm1 = (a1 !== null && a2 !== null)
    ? r2(wCalc([{ w: 10, mark: af }, { w: 40, mark: a1 }, { w: 50, mark: a2 }]))
    : null;
  if (a2 === null && a1 !== null) warnings.push('FM1 not yet available — A2 not written.');
  if (a1 === null && a2 !== null) warnings.push('FM1 not assigned — A1 required.');

  const completedMains = [a1, a2, a3].filter((m) => m !== null).length;
  const fm2 = completedMains >= 2
    ? r2(wCalc([{ w: 10, mark: af }, { w: 40, mark: a1 }, { w: 50, mark: a2 }, { w: 50, mark: a3 }]))
    : null;

  if (a3 !== null && fm1 !== null && fm1 >= 50) warnings.push('A3 written but FM1 was already ≥ 50 — confirm A3 access.');
  if (a3 !== null && a1 === null && a2 === null) warnings.push('Both A1 and A2 missed — A3 alone may not produce valid FM.');

  const hasA2orA3 = a2 !== null || a3 !== null;
  const hasTwoMains = completedMains >= 2;
  const isValidFM = hasA2orA3 && hasTwoMains;

  if (!hasA2orA3) warnings.push('INVALID FM: complete at least one of A2 or A3.');
  if (!hasTwoMains) warnings.push('INVALID FM: complete at least two main assessments.');

  const fm = isValidFM ? r2(Math.max(fm1 ?? 0, fm2 ?? 0)) : null;

  // Self-check: AF=80, A1=60, A2=70 → FM1=(10*80+40*60+50*70)/100 = 67
  const sc = r2(wCalc([{ w: 10, mark: 80 }, { w: 40, mark: 60 }, { w: 50, mark: 70 }]));
  const selfCheck = [
    `DLA112: AF=${af} A1=${a1} A2=${a2} A3=${a3} → MTD=${mtd} FM1=${fm1} FM2=${fm2} FM=${fm} valid=${isValidFM}`,
    `Self-check [AF=80,A1=60,A2=70]: FM1 expected 67, got ${sc} — ${sc === 67 ? 'PASS' : 'FAIL'}`,
  ];

  return { mtd, fm1, fm2, fm, isValidFM, warnings, selfCheck };
}

// ─── DLA 122 late penalty ─────────────────────────────────────────────────────

// Returns cumulative marks deducted (out of 100) for a given hours-after-deadline value.
export function calcDLA122LatePenalty(hoursLate: number): number {
  if (hoursLate <= 0)   return 0;
  if (hoursLate <= 6)   return 10;
  if (hoursLate <= 12)  return 15;
  if (hoursLate <= 24)  return 20;
  if (hoursLate <= 36)  return 25;
  if (hoursLate <= 48)  return 30;
  if (hoursLate <= 72)  return 40;
  if (hoursLate <= 96)  return 50;
  if (hoursLate <= 120) return 60;
  if (hoursLate <= 144) return 70;
  return 80;
}

// ─── DLA 122 calculator ───────────────────────────────────────────────────────

export interface DLA122Input {
  af: number | null;     // caller supplies best-4-of-6 average already computed
  a1: number | null;     // raw mark before late penalty
  a1Valid: boolean;      // valid submission demonstrating competence
  a2: number | null;
  a2Valid: boolean;
  a3: number | null;
  hoursLateA1?: number;  // hours after deadline; omit or 0 if on time
  hoursLateA2?: number;
}

export function calcDLA122(input: DLA122Input): MarksOutput {
  const { af, a1Valid, a2Valid, a3 } = input;
  const warnings: string[] = [];

  // Apply late penalties first
  let a1 = input.a1;
  let a2 = input.a2;
  if (a1 !== null && input.hoursLateA1 && input.hoursLateA1 > 0) {
    const pen = calcDLA122LatePenalty(input.hoursLateA1);
    warnings.push(`A1 submitted ${input.hoursLateA1}h late — ${pen} marks deducted.`);
    a1 = Math.max(0, a1 - pen);
  }
  if (a2 !== null && input.hoursLateA2 && input.hoursLateA2 > 0) {
    const pen = calcDLA122LatePenalty(input.hoursLateA2);
    warnings.push(`A2 submitted ${input.hoursLateA2}h late — ${pen} marks deducted.`);
    a2 = Math.max(0, a2 - pen);
  }

  // Submission validity warnings
  warnings.push('DLA122 requires valid A1 and A2 submissions.');
  if (a1 === null) warnings.push('A1 not submitted — invalid submission, subminimum not met, module fail.');
  else if (!a1Valid) warnings.push('A1 submitted but flagged invalid (competence not demonstrated) — subminimum not met.');
  if (a2 === null) warnings.push('A2 not submitted — invalid submission, subminimum not met, module fail.');
  else if (!a2Valid) warnings.push('A2 submitted but flagged invalid (competence not demonstrated) — subminimum not met.');

  // DLA 122 submission risk reminders
  warnings.push('RISK: wrong directory upload = non-submission if not corrected before late deadline.');
  warnings.push('RISK: empty workbook = non-submission even if quiz was attempted.');
  warnings.push('RISK: material quiz/file mismatch = penalised or treated as non-submission.');
  warnings.push('RISK: quiz attempted after late deadline without file = nil awarded.');

  const subminimumMet = a1 !== null && a1Valid && a2 !== null && a2Valid;

  const mtd = a1 !== null ? r2(wCalc([{ w: 20, mark: af }, { w: 35, mark: a1 }])) : null;
  if (a1 === null) warnings.push('No MTD — A1 not submitted.');

  const fm1 = subminimumMet
    ? r2(wCalc([{ w: 20, mark: af }, { w: 35, mark: a1 }, { w: 45, mark: a2 }]))
    : null;
  if (!subminimumMet && a2 !== null) warnings.push('FM1 not assigned — subminimum not met (valid A1 + A2 required).');

  // A3 access: subminimum met AND FM1 < 50 AND all other mains completed
  if (a3 !== null && !subminimumMet) warnings.push('A3 cannot rescue an invalid or missing A1/A2 submission.');
  if (a3 !== null && subminimumMet && fm1 !== null && fm1 >= 50) warnings.push('A3 access: FM1 ≥ 50, A3 should only be used if A2 was missed.');

  const completedMains = [a1, a2, a3].filter((m) => m !== null).length;
  const fm2 = (subminimumMet && completedMains >= 2)
    ? r2(wCalc([{ w: 20, mark: af }, { w: 35, mark: a1 }, { w: 45, mark: a2 }, { w: 45, mark: a3 }]))
    : null;

  const hasA2orA3 = a2 !== null || a3 !== null;
  const hasTwoMains = completedMains >= 2;
  const isValidFM = subminimumMet && hasA2orA3 && hasTwoMains;

  if (!subminimumMet) warnings.push('INVALID FM: subminimum requirements not met.');
  if (!hasA2orA3) warnings.push('INVALID FM: complete at least one of A2 or A3.');

  const fm = isValidFM ? r2(Math.max(fm1 ?? 0, fm2 ?? 0)) : null;

  // Self-checks
  // FM1: AF=75,A1=60,A2=55 (both valid) → wsum=100 → (20*75+35*60+45*55)/100 = 60.75
  const scFm = r2(wCalc([{ w: 20, mark: 75 }, { w: 35, mark: 60 }, { w: 45, mark: 55 }]));
  // Late penalty: 10h → cumulative 15
  const scLp = calcDLA122LatePenalty(10);
  // Subminimum gate: A2=null → subminimumMet=false → fm2=null, isValidFM=false (A3 cannot rescue missing A2)
  const scMissingA2Submin: boolean = null !== null && true; // a2=null → false
  const selfCheck = [
    `DLA122: AF=${af} A1=${input.a1}(valid=${a1Valid}) A2=${input.a2}(valid=${a2Valid}) A3=${a3}`,
    `  submin=${subminimumMet} MTD=${mtd} FM1=${fm1} FM2=${fm2} FM=${fm} valid=${isValidFM}`,
    `Self-check FM1 [AF=75,A1=60,A2=55,both valid]: expected 60.75, got ${scFm} — ${scFm === 60.75 ? 'PASS' : 'FAIL'}`,
    `Self-check late [10h]: expected 15, got ${scLp} — ${scLp === 15 ? 'PASS' : 'FAIL'}`,
    `Self-check [A2=null,A3 present]: subminimumMet=false → FM2=null, isValidFM=false — ${scMissingA2Submin === false ? 'PASS' : 'FAIL'}`,
  ];

  return { mtd, fm1, fm2, fm, isValidFM, warnings, selfCheck };
}

// ─── Financial Accounting 178 calculator ─────────────────────────────────────

export interface FinAcc178Input {
  a1s1: number | null;
  a2s1: number | null;
  a1s2: number | null;
  a2s2: number | null;
  afs2: number | null;
  a3:   number | null;
}

export function calcFinAcc178(input: FinAcc178Input): MarksOutput {
  const { a1s1, a2s1, a1s2, a2s2, afs2, a3 } = input;
  const warnings: string[] = [];

  const mainSlots = [
    { id: 'A1S1', w: 15, mark: a1s1 },
    { id: 'A2S1', w: 20, mark: a2s1 },
    { id: 'A1S2', w: 20, mark: a1s2 },
    { id: 'A2S2', w: 40, mark: a2s2 },
  ];
  const missedMains    = mainSlots.filter((m) => m.mark === null);
  const completedMains = 4 - missedMains.length;

  // A3 variable weight: 0–1 missed → 40; 2+ missed → sum of missed weights
  const a3Weight = missedMains.length <= 1
    ? 40
    : missedMains.reduce((s, m) => s + m.w, 0);
  if (a3 !== null && missedMains.length >= 2) {
    warnings.push(`A3 variable weight: ${a3Weight}% (missed: ${missedMains.map((m) => m.id).join(', ')}).`);
  }

  // MY after A2S1 — no AFS1 in this model
  const my = (a1s1 !== null || a2s1 !== null)
    ? r2(wCalc([{ w: 15, mark: a1s1 }, { w: 20, mark: a2s1 }]))
    : null;
  if (my === null) warnings.push('MY not assigned — neither A1S1 nor A2S1 written.');

  // MTD before A2S2 (unofficial planning output)
  const mtd = r2(wCalc([{ w: 15, mark: a1s1 }, { w: 20, mark: a2s1 }, { w: 20, mark: a1s2 }, { w: 5, mark: afs2 }]));

  // FM1 after A2S2
  const firstThreeDone = [a1s1, a2s1, a1s2].filter((m) => m !== null).length;
  const fm1 = (firstThreeDone >= 2 && a2s2 !== null)
    ? r2(wCalc([{ w: 15, mark: a1s1 }, { w: 20, mark: a2s1 }, { w: 20, mark: a1s2 }, { w: 5, mark: afs2 }, { w: 40, mark: a2s2 }]))
    : null;
  if (a2s2 === null) warnings.push('A2S2 not written — FM1 not assigned. Use for A3 access planning only.');
  if (firstThreeDone < 2 && a2s2 !== null) warnings.push('FM1 not assigned — at least two of A1S1/A2S1/A1S2 required alongside A2S2.');

  // A3 cannot improve if all four mains done and FM1 >= 50
  const allFourDone = completedMains === 4;
  if (a3 !== null && allFourDone && fm1 !== null && fm1 >= 50) {
    warnings.push('A3 cannot improve FM — all four main assessments completed and FM1 ≥ 50.');
  }

  // FM2 after A3 — computed from raw components, NOT from FM1
  const totalMainsIncA3 = completedMains + (a3 !== null ? 1 : 0);
  const hasA2s2OrA3 = a2s2 !== null || a3 !== null;
  const canUseA3 = !(allFourDone && fm1 !== null && fm1 >= 50);
  const fm2 = (canUseA3 && totalMainsIncA3 >= 3 && hasA2s2OrA3)
    ? r2(wCalc([
        { w: 15, mark: a1s1 }, { w: 20, mark: a2s1 }, { w: 20, mark: a1s2 },
        { w: 5,  mark: afs2 }, { w: 40, mark: a2s2 }, { w: a3Weight, mark: a3 },
      ]))
    : null;

  const isValidFM = hasA2s2OrA3 && totalMainsIncA3 >= 3;
  if (!hasA2s2OrA3)        warnings.push('INVALID FM: must complete at least one of A2S2 or A3.');
  if (totalMainsIncA3 < 3) warnings.push('INVALID FM: must complete at least three main assessment opportunities.');

  const fm = isValidFM ? r2(Math.max(fm1 ?? 0, fm2 ?? 0)) : null;

  // Self-checks
  // FM1: A1S1=60,A2S1=65,A1S2=55,AFS2=80,A2S2=70 → wsum=100 → 65
  const scFm1 = r2(wCalc([{ w:15,mark:60 },{ w:20,mark:65 },{ w:20,mark:55 },{ w:5,mark:80 },{ w:40,mark:70 }]));
  const scA3W = 15 + 20; // A1S1+A2S1 both missed → a3Weight=35

  const selfCheck = [
    `FinAcc178: A1S1=${a1s1} A2S1=${a2s1} A1S2=${a1s2} AFS2=${afs2} A2S2=${a2s2} A3=${a3}`,
    `  MY=${my} MTD=${mtd} FM1=${fm1} FM2=${fm2} FM=${fm} valid=${isValidFM}`,
    `Self-check FM1 [60,65,55,AFS2=80,A2S2=70]: expected 65, got ${scFm1} — ${scFm1 === 65 ? 'PASS' : 'FAIL'}`,
    `Self-check A3 weight [A1S1+A2S1 missed]: expected 35, got ${scA3W} — ${scA3W === 35 ? 'PASS' : 'FAIL'}`,
  ];

  return { my, mtd, fm1, fm2, fm, isValidFM, warnings, selfCheck };
}

// ─── SDS188 weighted helper (AFS always contribute to Wsum) ──────────────────

function wCalcSDS(
  afFixed:     Array<{ w: number; mark: number | null }>,
  conditional: Array<{ w: number; mark: number | null }>,
): number {
  const wsumFixed = afFixed.reduce((s, c) => s + c.w, 0);
  const wsumCond  = conditional.reduce((s, c) => s + (c.mark !== null ? c.w : 0), 0);
  const wsum = Math.max(1, wsumFixed + wsumCond);
  return (
    afFixed.reduce((s, c) => s + (c.mark !== null ? (c.w / wsum) * c.mark : 0), 0) +
    conditional.reduce((s, c) => s + (c.mark !== null ? (c.w / wsum) * c.mark : 0), 0)
  );
}

// ─── Statistics and Data Science 188 calculator ───────────────────────────────

export interface SDS188Input {
  afs1: number | null;
  a1s1: number | null;
  a2s1: number | null;
  afs2: number | null;
  a1s2: number | null;
  a2s2: number | null;
  a3:   number | null;
}

export function calcSDS188(input: SDS188Input): MarksOutput {
  const { afs1, a1s1, a2s1, afs2, a1s2, a2s2, a3 } = input;
  const warnings: string[] = [];
  const af = (val: number | null, w: number) => ({ w, mark: val });

  // MY after A2S1: AFS1 always in wsum
  const my = (a1s1 !== null || a2s1 !== null)
    ? r2(wCalcSDS([af(afs1, 5)], [{ w: 10, mark: a1s1 }, { w: 25, mark: a2s1 }]))
    : null;
  if (my === null) warnings.push('MY not assigned — neither A1S1 nor A2S1 written.');

  // MTD: AFS1+AFS2 always in wsum; A1S1, A2S1, A1S2 conditional
  const mtd = r2(wCalcSDS(
    [af(afs1, 5), af(afs2, 5)],
    [{ w: 10, mark: a1s1 }, { w: 25, mark: a2s1 }, { w: 25, mark: a1s2 }],
  ));

  // FM1 after A2S2
  const firstThreeDone = [a1s1, a2s1, a1s2].filter((m) => m !== null).length;
  const fm1 = (firstThreeDone >= 2 && a2s2 !== null)
    ? r2(wCalcSDS(
        [af(afs1, 5), af(afs2, 5)],
        [{ w: 10, mark: a1s1 }, { w: 25, mark: a2s1 }, { w: 25, mark: a1s2 }, { w: 30, mark: a2s2 }],
      ))
    : null;
  if (a2s2 === null) warnings.push('A2S2 not written — FM1 not available.');
  if (firstThreeDone < 2 && a2s2 !== null) warnings.push('FM1 not assigned — at least two of A1S1/A2S1/A1S2 required alongside A2S2.');

  // FM2 after A3
  const completedMains  = [a1s1, a2s1, a1s2, a2s2].filter((m) => m !== null).length;
  const totalMainsIncA3 = completedMains + (a3 !== null ? 1 : 0);
  const hasA2s2OrA3     = a2s2 !== null || a3 !== null;
  const fm2 = (totalMainsIncA3 >= 3 && hasA2s2OrA3)
    ? r2(wCalcSDS(
        [af(afs1, 5), af(afs2, 5)],
        [{ w: 10, mark: a1s1 }, { w: 25, mark: a2s1 }, { w: 25, mark: a1s2 }, { w: 30, mark: a2s2 }, { w: 40, mark: a3 }],
      ))
    : null;

  const isValidFM = hasA2s2OrA3 && totalMainsIncA3 >= 3;
  if (!hasA2s2OrA3)        warnings.push('INVALID FM: must complete at least one of A2S2 or A3.');
  if (totalMainsIncA3 < 3) warnings.push('INVALID FM: must complete at least three main assessment opportunities.');

  const fm = isValidFM ? r2(Math.max(fm1 ?? 0, fm2 ?? 0)) : null;

  // Self-checks (static constants verified against task spec)
  // Sample 1: AFS1=60,A1S1=75,A2S1=40,AFS2=60,A1S2=55,A2S2=65 → FM1 = 56.75
  const sc1 = r2(wCalcSDS(
    [{ w: 5, mark: 60 }, { w: 5, mark: 60 }],
    [{ w: 10, mark: 75 }, { w: 25, mark: 40 }, { w: 25, mark: 55 }, { w: 30, mark: 65 }],
  ));
  // Sample 2: AFS1=50,A1S1=25,A2S1=40,AFS2=50,A1S2=55,A2S2=null,A3=66 → FM2 = 52.41
  const sc2 = r2(wCalcSDS(
    [{ w: 5, mark: 50 }, { w: 5, mark: 50 }],
    [{ w: 10, mark: 25 }, { w: 25, mark: 40 }, { w: 25, mark: 55 }, { w: 30, mark: null }, { w: 40, mark: 66 }],
  ));

  const selfCheck = [
    `SDS188: AFS1=${afs1} A1S1=${a1s1} A2S1=${a2s1} AFS2=${afs2} A1S2=${a1s2} A2S2=${a2s2} A3=${a3}`,
    `  MY=${my} MTD=${mtd} FM1=${fm1} FM2=${fm2} FM=${fm} valid=${isValidFM}`,
    `Self-check FM1 [all completed]: expected 56.75, got ${sc1} — ${sc1 === 56.75 ? 'PASS' : 'FAIL'}`,
    `Self-check FM2 [missed A2S2, A3=66]: expected 52.41, got ${sc2} — ${sc2 === 52.41 ? 'PASS' : 'FAIL'}`,
  ];

  return { my, mtd, fm1, fm2, fm, isValidFM, warnings, selfCheck };
}

// ─── Legal Skills 114 calculator ─────────────────────────────────────────────

export interface LegalSkills114Input {
  rt: number | null;  // ReadTheory (5%)
  lw: number | null;  // Legal Writing Short Course (10%)
  ao: number | null;  // Asynchronous Online Component (10%)
  t1: number | null;  // A1 Test (15%)
  t2: number | null;  // A2 Test (20%)
  ae: number | null;  // Academic Essay (30%)
  mq: number | null;  // Micro Quizzes (10%)
}

export function calcLegalSkills114(input: LegalSkills114Input): MarksOutput {
  const { rt, lw, ao, t1, t2, ae, mq } = input;
  const warnings: string[] = [];

  const slots = [
    { id: 'RT', label: 'ReadTheory',                    w: 5,  mark: rt },
    { id: 'LW', label: 'Legal Writing Short Course',    w: 10, mark: lw },
    { id: 'AO', label: 'Asynchronous Online Component', w: 10, mark: ao },
    { id: 'T1', label: 'A1 Test',                       w: 15, mark: t1 },
    { id: 'T2', label: 'A2 Test',                       w: 20, mark: t2 },
    { id: 'AE', label: 'Academic Essay',                w: 30, mark: ae },
    { id: 'MQ', label: 'Micro Quizzes',                 w: 10, mark: mq },
  ];

  const missing = slots.filter((c) => c.mark === null);
  const completedWeight = slots.filter((c) => c.mark !== null).reduce((s, c) => s + c.w, 0);

  // Fixed-weight running total: null components contribute 0 (denominator always 100)
  const runningTotal = r2(slots.reduce((s, c) => s + (c.mark !== null ? (c.w / 100) * c.mark : 0), 0));
  const mtd = runningTotal;
  const fm1 = runningTotal;

  if (missing.length > 0) {
    const missingWeight = 100 - completedWeight;
    warnings.push(
      `Incomplete: ${missing.map((c) => `${c.label} (${c.w}%)`).join(', ')} — ${missingWeight}% of mark not yet contributed.`,
    );
    warnings.push(`Running weighted total: ${fm1}/100 from ${completedWeight}% of assessments completed.`);
    warnings.push('Continuous assessment model — no exam rescue path. All components must be submitted.');
  }

  const isValidFM = missing.length === 0;

  if (!isValidFM) {
    warnings.push('INVALID FM: all 7 continuous assessment components required for a valid final mark.');
  }

  const fm = isValidFM ? fm1 : null;

  if (fm !== null && fm < 50) {
    warnings.push('Final mark below 50% — module fail. No A3 rescue exam available.');
  }

  warnings.push('UNOFFICIAL: all calculations are planning outputs only — verify with official results.');
  warnings.push('UNVERIFIED: ReadTheory exact screenshot/evidence requirements — confirm with 2026 LSK114 guide.');
  warnings.push('UNVERIFIED: Micro-quiz count and drop policy — confirm with 2026 LSK114 guide.');

  // Self-checks
  // [1] All completed: RT=80,LW=75,AO=70,T1=65,T2=60,AE=55,MQ=70
  // FM = 80*.05+75*.1+70*.1+65*.15+60*.2+55*.3+70*.1 = 4+7.5+7+9.75+12+16.5+7 = 63.75
  const sc1 = r2(80 * .05 + 75 * .1 + 70 * .1 + 65 * .15 + 60 * .2 + 55 * .3 + 70 * .1);
  // [2] Missing AE: same marks, AE=null → running = 4+7.5+7+9.75+12+7 = 47.25
  const sc2 = r2(80 * .05 + 75 * .1 + 70 * .1 + 65 * .15 + 60 * .2 + 70 * .1);

  const selfCheck = [
    `LegalSkills114: RT=${rt} LW=${lw} AO=${ao} T1=${t1} T2=${t2} AE=${ae} MQ=${mq}`,
    `  completedWeight=${completedWeight}% runningFM=${fm1} valid=${isValidFM}`,
    `Self-check all [RT=80,LW=75,AO=70,T1=65,T2=60,AE=55,MQ=70]: expected 63.75, got ${sc1} — ${sc1 === 63.75 ? 'PASS' : 'FAIL'}`,
    `Self-check missing AE: running total expected 47.25, got ${sc2} — ${sc2 === 47.25 ? 'PASS' : 'FAIL'}`,
  ];

  return { mtd, fm1, fm2: null, fm, isValidFM, warnings, selfCheck };
}

// ─── Con Law 178 calculator ───────────────────────────────────────────────────

export interface ConLaw178Input {
  afs1: number | null;  // AF Semester 1 Formative (5%)
  a1s1: number | null;  // A1 Semester 1 Class Test (15%)
  a2s1: number | null;  // A2 Semester 1 Main Test (20%)
  afs2: number | null;  // AF Semester 2 Formative (10%)
  a1s2: number | null;  // A1 Semester 2 Class Test (20%)
  a2s2: number | null;  // A2 Semester 2 Main Test (30%)
  a3:   number | null;  // A3 Exam — weight and cap vary by scenario
}

export function calcConLaw178(input: ConLaw178Input): MarksOutput {
  const { afs1, a1s1, a2s1, afs2, a1s2, a2s2, a3 } = input;
  const warnings: string[] = [];

  // Main assessments — AFs are excluded from validity/substitution counting
  type MainSlot = { id: string; w: number; mark: number | null };
  const mainSlots: MainSlot[] = [
    { id: 'A1S1', w: 15, mark: a1s1 },
    { id: 'A2S1', w: 20, mark: a2s1 },
    { id: 'A1S2', w: 20, mark: a1s2 },
    { id: 'A2S2', w: 30, mark: a2s2 },
  ];
  const missedMains     = mainSlots.filter((m) => m.mark === null);
  type CompletedMain = { id: string; w: number; mark: number };
  const completedMains  = mainSlots.filter((m): m is CompletedMain => m.mark !== null);
  const numMissed       = missedMains.length;

  // MY after A2S1 — denominator is fixed based on which S1 mains were written
  let myDenom = 0;
  if (a1s1 !== null && a2s1 !== null) myDenom = 40;
  else if (a1s1 !== null)             myDenom = 20;
  else if (a2s1 !== null)             myDenom = 25;

  let my: number | null;
  if (myDenom > 0) {
    const myNumer = (afs1 ?? 0) * 5 + (a1s1 ?? 0) * 15 + (a2s1 ?? 0) * 20;
    my = r2(myNumer / myDenom);
  } else {
    my = 0;
    warnings.push('MY = 0: neither A1S1 nor A2S1 written.');
  }

  // MTD — running planning output before A2S2; normalised over completed S1+S2 components
  const mtd = r2(wCalc([
    { w: 5,  mark: afs1 },
    { w: 15, mark: a1s1 },
    { w: 20, mark: a2s1 },
    { w: 10, mark: afs2 },
    { w: 20, mark: a1s2 },
  ]));

  // FM1 — fixed-weight running sum; AFs contribute 0 if null (denominator always 100)
  const fm1Raw =
    (afs1 ?? 0) * 5  / 100 +
    (a1s1 ?? 0) * 15 / 100 +
    (a2s1 ?? 0) * 20 / 100 +
    (afs2 ?? 0) * 10 / 100 +
    (a1s2 ?? 0) * 20 / 100 +
    (a2s2 ?? 0) * 30 / 100;

  const hasAnyData = [afs1, a1s1, a2s1, afs2, a1s2, a2s2].some((v) => v !== null);
  const fm1: number | null = hasAnyData ? r2(fm1Raw) : null;

  if (a2s2 === null) {
    warnings.push('A2S2 not yet written — FM1 is a planning estimate only.');
  }

  // ─── A3 scenario logic ────────────────────────────────────────────────────

  let fm2: number | null = null;

  if (a3 !== null) {
    if (numMissed > 2) {
      // Scenario D: missed more than two mains → FM capped at 45
      const combinedMissedW = missedMains.reduce((s, m) => s + m.w, 0);
      warnings.push(
        `Scenario D: ${numMissed} main assessment(s) missed (${missedMains.map((m) => m.id).join(', ')}). FM hard-capped at 45 — valid pass is impossible.`,
      );
      const rawD =
        completedMains.reduce((s, m) => s + (m.mark * m.w) / 100, 0) +
        (afs1 ?? 0) * 5  / 100 +
        (afs2 ?? 0) * 10 / 100 +
        (a3 * combinedMissedW) / 100;
      fm2 = r2(Math.min(45, rawD));

    } else if (numMissed === 0) {
      // Scenario C: all four mains done — supplementary A3 replaces worst-weighted main
      if (fm1 !== null && fm1 >= 50) {
        warnings.push('All four mains completed and FM ≥ 50 — supplementary A3 access not available.');
      } else {
        // Worst-weighted = main with lowest (w/100 * mark) contribution
        const worstMain = completedMains.reduce((worst, c) => {
          return (c.w / 100) * c.mark < (worst.w / 100) * worst.mark ? c : worst;
        });
        const worstContrib = r2((worstMain.w / 100) * worstMain.mark);
        warnings.push(
          `Scenario C: A3 replaces worst-weighted main (${worstMain.id}, weighted contribution ${worstContrib}). FM capped at 50.`,
        );
        warnings.push('Scenario C: FM after A3 cannot be less than FM after A2S2.');
        const rawC = fm1Raw - (worstMain.w / 100) * worstMain.mark + (worstMain.w / 100) * a3;
        fm2 = r2(Math.min(50, Math.max(fm1Raw, rawC)));
      }

    } else if (numMissed === 1) {
      // Scenario A: missed exactly one main — A3 substitutes at same weight, no cap
      const missed = missedMains[0];
      warnings.push(
        `Scenario A: A3 substitutes for missed ${missed.id} (weight ${missed.w}%). FM is not capped at 50.`,
      );
      const rawA =
        completedMains.reduce((s, m) => s + (m.mark * m.w) / 100, 0) +
        (afs1 ?? 0) * 5  / 100 +
        (afs2 ?? 0) * 10 / 100 +
        (a3 * missed.w) / 100;
      fm2 = r2(rawA);

    } else {
      // Scenario B: missed exactly two mains — A3 carries combined weight, no cap
      const combinedW = missedMains.reduce((s, m) => s + m.w, 0);
      warnings.push(
        `Scenario B: A3 carries combined weight of two missed mains (${missedMains.map((m) => m.id).join(', ')}) = ${combinedW}%. FM is not capped at 50.`,
      );
      const rawB =
        completedMains.reduce((s, m) => s + (m.mark * m.w) / 100, 0) +
        (afs1 ?? 0) * 5  / 100 +
        (afs2 ?? 0) * 10 / 100 +
        (a3 * combinedW) / 100;
      fm2 = r2(rawB);
    }
  } else {
    // No A3 entered
    if (numMissed > 0) {
      warnings.push(
        `${numMissed} main assessment(s) not yet completed: ${missedMains.map((m) => m.id).join(', ')}. A3 not entered.`,
      );
    }
    if (numMissed === 0 && fm1 !== null && fm1 < 50) {
      warnings.push('FM below 50% — may qualify for supplementary A3 opportunity (Scenario C).');
    }
  }

  // Valid FM: at least three main summative opportunities (AFs do not count; A3 counts as one)
  const totalMainOpps = completedMains.length + (a3 !== null ? 1 : 0);
  const isValidFM = totalMainOpps >= 3 && (a2s2 !== null || a3 !== null);

  if (totalMainOpps < 3) {
    warnings.push(
      'INVALID FM: at least three main summative assessment opportunities required. AF components do not count toward this requirement.',
    );
  }
  if (a2s2 === null && a3 === null) {
    warnings.push('INVALID FM: A2S2 or A3 must be completed.');
  }

  // Resolve final FM
  let rawFM: number | null = null;
  if (isValidFM) {
    rawFM = fm2 !== null ? fm2 : fm1;
  }
  const fm = rawFM !== null ? r2(rawFM) : null;

  if (fm !== null && fm < 50) {
    warnings.push('Final mark below 50% — module fail.');
  }
  warnings.push('UNOFFICIAL: all calculations are planning outputs only — verify with official results.');

  // ─── Self-checks ──────────────────────────────────────────────────────────

  // Scenario A: AFS1=70,A1S1=60,A2S1=75,AFS2=65,A1S2=55,A2S2=null,A3=65
  // rawA = 70*.05+60*.15+75*.2+65*.1+55*.2+65*.3 = 3.5+9+15+6.5+11+19.5 = 64.5
  const scA = r2(70 * .05 + 60 * .15 + 75 * .2 + 65 * .1 + 55 * .2 + 65 * .3);

  // Scenario B: AFS1=70,A1S1=60,A2S1=null,AFS2=65,A1S2=55,A2S2=null,A3=60; combinedW=50
  // rawB = 70*.05+60*.15+65*.1+55*.2+60*.5 = 3.5+9+6.5+11+30 = 60
  const scB = r2(70 * .05 + 60 * .15 + 65 * .1 + 55 * .2 + 60 * .5);

  // Scenario C: AFS1=40,A1S1=30,A2S1=40,AFS2=35,A1S2=30,A2S2=40,A3=70
  // fm1Raw=36; worst main=A1S1 (contrib=4.5); rawC=36-4.5+70*.15=42; min(50,max(36,42))=42
  const scC_fm1Raw = 40 * .05 + 30 * .15 + 40 * .2 + 35 * .1 + 30 * .2 + 40 * .3;
  const scC_worstContrib = 30 * .15; // A1S1
  const scC_fm2 = r2(Math.min(50, Math.max(scC_fm1Raw, scC_fm1Raw - scC_worstContrib + 70 * .15)));

  // Scenario D: AFS1=70,A1S1=null,A2S1=null,AFS2=65,A1S2=null,A2S2=40,A3=80; missedW=55
  // rawD = 70*.05+65*.1+40*.3+80*.55 = 3.5+6.5+12+44=66 → capped at 45
  const scD = r2(Math.min(45, 70 * .05 + 65 * .1 + 40 * .3 + 80 * .55));

  const selfCheck = [
    `ConLaw178: AFS1=${afs1} A1S1=${a1s1} A2S1=${a2s1} AFS2=${afs2} A1S2=${a1s2} A2S2=${a2s2} A3=${a3}`,
    `  MY=${my} MTD=${mtd} FM1=${fm1} FM2=${fm2} FM=${fm} valid=${isValidFM}`,
    `Self-check Scenario A [A2S2 missed, A3=65]: expected 64.5, got ${scA} — ${scA === 64.5 ? 'PASS' : 'FAIL'}`,
    `Self-check Scenario B [A2S1+A2S2 missed, A3=60]: expected 60, got ${scB} — ${scB === 60 ? 'PASS' : 'FAIL'}`,
    `Self-check Scenario C [all done, FM1=${r2(scC_fm1Raw)}, A3=70]: FM2 expected 42, got ${scC_fm2} — ${scC_fm2 === 42 ? 'PASS' : 'FAIL'}`,
    `Self-check Scenario D [3 mains missed, A3=80]: FM2 expected 45 (capped), got ${scD} — ${scD === 45 ? 'PASS' : 'FAIL'}`,
  ];

  return { my, mtd, fm1, fm2, fm, isValidFM, warnings, selfCheck };
}
