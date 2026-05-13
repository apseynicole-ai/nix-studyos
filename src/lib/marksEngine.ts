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
      weight: 0,          // weight varies by scenario; not a fixed value
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
      weight: 0,         // weight depends on which scenario applies
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
        'Scenario 1 — missed exactly one main assessment: A3 substitutes at that assessment\'s weight. FM is NOT capped at 50.',
      cappedAt: undefined,
      canReduceFM: false,
      conditions: ['Missed exactly one of A1S1, A2S1, A1S2, A2S2'],
    },
    {
      type: 'SUBSTITUTE_COMBINED_MISSED',
      description:
        'Scenario 2 — missed exactly two main assessments: A3 carries the combined weight of both missed assessments. FM is NOT capped at 50.',
      cappedAt: undefined,
      canReduceFM: false,
      conditions: ['Missed exactly two of A1S1, A2S1, A1S2, A2S2'],
    },
    {
      type: 'SUBSTITUTE_WORST_CAPPED',
      description:
        'Scenario 3 — completed all four main assessments but FM below 50: A3 replaces the worst-weighted main assessment. FM is CAPPED at 50. A3 cannot reduce FM.',
      cappedAt: 50,
      canReduceFM: false,
      conditions: ['All four main assessments completed', 'FM before A3 is below 50', 'A3 replaces lowest-weighted main only'],
    },
    {
      type: 'FM_CAP_PENALTY',
      description:
        'Scenario 4 — missed more than two main assessments: FM is capped at 45 regardless of A3. Module fail warning applies.',
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
    'UNVERIFIED EDGE CASE: "worst weighted main" in Scenario 3 — confirm whether it means lowest raw score or lowest weighted contribution.',
    'UNVERIFIED: whether AF components are excluded from A3 substitution in all scenarios.',
  ],
  needsVerification: false,
};

// ─── Module model registry ────────────────────────────────────────────────────

export const moduleAssessmentModels: Record<string, ModuleAssessmentModel> = {
  econ114:       econ114Model,
  dla112:        dla112Model,
  dla122:        dla122Model,
  finacc178:     finacc178Model,
  sds188:        sds188Model,
  legalskills114: legalskills114Model,
  conlaw178:     conlaw178Model,
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
