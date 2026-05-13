// BAccLLB module-specific marks engine — data/model layer only
// Formulas are NOT implemented here yet. This file defines assessment structures.

import type { ModuleAssessmentModel } from '../types/academic';

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
    { daysLate: 1,  penaltyPercent: 10, description: '1 day late' },
    { daysLate: 2,  penaltyPercent: 20, description: '2 days late' },
    { daysLate: 3,  penaltyPercent: 30, description: '3 days late' },
    { daysLate: 7,  penaltyPercent: 50, description: '7+ days late' },
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
