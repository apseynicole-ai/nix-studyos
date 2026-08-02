// SEMESTER 2 APP BOOTSTRAP SOURCE — V1
//
// Reviewed seed data transcribed from the reconciled Control Centre state
// (00_MASTER_ADMIN/SEMESTER_2_CONTROL_CENTRE.md and siblings, live-data reconciliation
// 27 Jul 2026). This is the *reviewed seed* — the app imports from THIS constant, not by
// parsing Markdown at runtime (spec §13/§15.9). TBC / ⚪ values stay null and are never
// invented. Numeric `target` values are neutral planning defaults, not sourced academic facts.

import type { Assessment, Module, ScheduledActivity, StudyBlock, WeeklyPlan } from '../types';

export const BOOTSTRAP_SOURCE_LABEL = 'SEMESTER 2 APP BOOTSTRAP SOURCE — V1';
export const ACTIVE_WEEK_ID = '2026-W15';

const D = {
  mon: '2026-07-27',
  tue: '2026-07-28',
  wed: '2026-07-29',
  thu: '2026-07-30',
  fri: '2026-07-31',
  sat: '2026-08-01',
  sun: '2026-08-02',
} as const;

export const SEMESTER2_MODULES: Module[] = [
  { id: 'foundations178', code: 'FOL178', name: 'Foundations of Law 178', shortName: 'Foundations', area: 'Law', semester: 'Year', defaultWeeklyMinutes: 225, active: true, colour: 'from-lime-200 to-stone-100' },
  { id: 'finacc178', code: 'FAC178', name: 'Financial Accounting 178', shortName: 'FinAcc', area: 'Accounting', semester: 'Year', defaultWeeklyMinutes: 180, active: true, colour: 'from-emerald-200 to-lime-100' },
  { id: 'conlaw178', code: 'CON178', name: 'Introduction to Constitutional Law & Statutory Interpretation 178', shortName: 'Con Law', area: 'Law', semester: 'Year', defaultWeeklyMinutes: 165, active: true, colour: 'from-violet-200 to-fuchsia-100' },
  { id: 'lawpersons144', code: 'LPR144', name: 'Law of Persons 144', shortName: 'Law of Persons', area: 'Law', semester: 'S2', defaultWeeklyMinutes: 180, active: true, colour: 'from-orange-200 to-amber-100' },
  { id: 'econ144', code: 'ECO144', name: 'Economics 144', shortName: 'Economics', area: 'Economics', semester: 'S2', defaultWeeklyMinutes: 180, active: true, colour: 'from-sky-200 to-cyan-100', predecessorId: 'econ114' },
  { id: 'sds188', code: 'SDS188', name: 'Statistics & Data Science 188', shortName: 'Statistics', area: 'Quantitative', semester: 'S2', defaultWeeklyMinutes: 120, active: true, colour: 'from-indigo-200 to-cyan-100' },
  { id: 'toi142', code: 'TOI142', name: 'Theory of Interest 142', shortName: 'Theory of Interest', area: 'Quantitative', semester: 'S2', defaultWeeklyMinutes: 120, active: true, colour: 'from-rose-200 to-pink-100' },
  { id: 'dla142', code: 'DLA142', name: 'DLA 142 (Xero)', shortName: 'DLA 142', area: 'Digital', semester: 'S2', defaultWeeklyMinutes: 75, active: true, colour: 'from-teal-200 to-emerald-100', predecessorId: 'dla112' },
  { id: 'dla152', code: 'DLA152', name: 'DLA 152 (Excel)', shortName: 'DLA 152', area: 'Digital', semester: 'S2', defaultWeeklyMinutes: 75, active: true, colour: 'from-cyan-200 to-teal-100', predecessorId: 'dla122' },
];

const SRC = 'ASSESSMENT_MASTER_REGISTER.md (reconciled 27 Jul 2026)';

// Assessment helper keeps the long list readable.
function a(p: Partial<Assessment> & { id: string; moduleId: string; label: string }): Assessment {
  return {
    date: null, time: null, weight: null, wholeYear: false, venue: null,
    source: SRC, needsVerification: false, ...p,
  };
}

export const SEMESTER2_ASSESSMENTS: Assessment[] = [
  a({ id: 'foundations178-A1S2', moduleId: 'foundations178', label: 'A1S2', date: '2026-08-27', timeNote: 'invigilated', weight: 0.20, wholeYear: true }),
  a({ id: 'sds188-A1S2', moduleId: 'sds188', label: 'A1S2 (Excel)', date: '2026-08-29', timeNote: 'TBC', weight: 0.25, format: 'Excel, computer-based', needsVerification: true }),
  a({ id: 'dla152-A1', moduleId: 'dla152', label: 'A1', date: '2026-08-31', time: '09:00', weight: 0.40, weightNote: '40% (project)', format: 'project' }),
  a({ id: 'econ144-A1', moduleId: 'econ144', label: 'A1', date: '2026-09-01', time: '17:40', weight: 0.40, weightNote: '40% (test)', format: 'test' }),
  a({ id: 'finacc178-A1S2', moduleId: 'finacc178', label: 'A1S2', date: '2026-09-03', time: '17:30', weightNote: 'var', wholeYear: true, format: 'test', needsVerification: true }),
  a({ id: 'dla142-A1', moduleId: 'dla142', label: 'A1', date: '2026-09-04', timeNote: '<14:00', weight: 0.40, weightNote: '40% (project, compulsory)', format: 'project' }),
  a({ id: 'lawpersons144-A1', moduleId: 'lawpersons144', label: 'A1', date: '2026-09-16', timeNote: 'invigilated', weight: 0.30 }),
  a({ id: 'dla152-AF', moduleId: 'dla152', label: 'AF', date: '2026-09-21', time: '09:00', weight: 0.15, weightNote: '15% (submit; peer review 28 Sep)', format: 'AF' }),
  a({ id: 'toi142-A1', moduleId: 'toi142', label: 'A1', date: '2026-09-22', timeNote: 'invigilated', weight: 0.35, notes: 'to §2.5 / tut 8' }),
  a({ id: 'conlaw178-A1S2', moduleId: 'conlaw178', label: 'A1S2', date: '2026-10-01', timeNote: 'test', weight: 0.20, wholeYear: true }),
  a({ id: 'dla142-A2', moduleId: 'dla142', label: 'A2', date: '2026-10-21', timeNote: '<14:00', weight: 0.45, format: 'project' }),
  a({ id: 'dla152-A2', moduleId: 'dla152', label: 'A2', date: '2026-10-23', timeNote: '<16:00', weight: 0.45, format: 'project' }),
  a({ id: 'conlaw178-A2S2', moduleId: 'conlaw178', label: 'A2S2', date: '2026-10-26', time: '09:00', weight: 0.30, wholeYear: true }),
  a({ id: 'econ144-A2', moduleId: 'econ144', label: 'A2', date: '2026-10-28', time: '09:00', weight: 0.60, weightNote: '60% (test)', format: 'test' }),
  a({ id: 'foundations178-A2S2', moduleId: 'foundations178', label: 'A2S2', date: '2026-10-31', timeNote: 'invigilated', weight: 0.40, wholeYear: true, format: '70-mark / 2h' }),
  a({ id: 'finacc178-A2S2', moduleId: 'finacc178', label: 'A2S2', date: '2026-11-02', time: '14:00', weightNote: 'var', wholeYear: true, format: 'test', needsVerification: true }),
  a({ id: 'sds188-A2S2', moduleId: 'sds188', label: 'A2S2', date: '2026-11-06', time: '14:00', weight: 0.30, format: 'written' }),
  a({ id: 'toi142-A2', moduleId: 'toi142', label: 'A2', date: '2026-11-12', timeNote: 'invigilated', weight: 0.55, notes: 'all work' }),
  a({ id: 'lawpersons144-A2', moduleId: 'lawpersons144', label: 'A2', date: '2026-11-14', timeNote: 'invigilated', weight: 0.50 }),
  a({ id: 'conlaw178-A3', moduleId: 'conlaw178', label: 'A3', date: '2026-11-19', time: '09:00', weightNote: 'var', wholeYear: true, needsVerification: true }),
  a({ id: 'econ144-A3', moduleId: 'econ144', label: 'A3', date: '2026-11-21', time: '09:00', weight: 0.60, weightNote: '60% (test)', format: 'test' }),
  a({ id: 'dla142-A3', moduleId: 'dla142', label: 'A3', date: '2026-11-25', timeNote: '<14:00', weight: 0.45, format: 'project' }),
  a({ id: 'foundations178-A3', moduleId: 'foundations178', label: 'A3', date: '2026-11-25', timeNote: 'invigilated', weightNote: 'var', wholeYear: true, needsVerification: true }),
  a({ id: 'finacc178-A3', moduleId: 'finacc178', label: 'A3', date: '2026-11-26', time: '14:00', weightNote: 'var', wholeYear: true, format: 'test', needsVerification: true }),
  a({ id: 'lawpersons144-A3', moduleId: 'lawpersons144', label: 'A3', date: '2026-11-30', timeNote: 'invigilated', weightNote: 'var', needsVerification: true }),
  a({ id: 'sds188-A3', moduleId: 'sds188', label: 'A3', date: '2026-12-01', time: '14:00', weight: 0.40 }),
  a({ id: 'toi142-A3', moduleId: 'toi142', label: 'A3', date: '2026-12-05', timeNote: 'invigilated', weight: 0.55, notes: 'all work' }),
  a({ id: 'dla152-A3', moduleId: 'dla152', label: 'A3', date: null, timeNote: 'TBC', weight: 0.45, needsVerification: true, notes: '⚪ date to be announced' }),
  // Continuous / rolling AF + this-week live items.
  a({ id: 'toi142-AF', moduleId: 'toi142', label: 'AF (weekly)', date: null, weight: 0.10, format: 'weekly online', notes: 'best 8 count; opens Thu 15:00 → Tue 16:00; ≥50% gates next week content' }),
  a({ id: 'dla142-AF', moduleId: 'dla142', label: 'AF (weekly quiz)', date: null, weight: 0.15, format: 'weekly Xero quiz', notes: 'best 7 of 10 count' }),
  a({ id: 'lawpersons144-SU1-quiz', moduleId: 'lawpersons144', label: 'Study Unit 1 quiz (AF)', date: '2026-08-02', time: '23:59', timeNote: 'opens Mon 27 Jul 12:00, closes Sun 2 Aug 23:59; 1h limit; highest grade; attempts not stated', weightNote: 'AF (part of 0.2)', format: 'AF quiz', needsVerification: true, notes: 'LIVE Week 15' }),
  a({ id: 'sds188-LP-AF', moduleId: 'sds188', label: 'Linear Programming online AF', date: '2026-07-24', time: '23:59', timeNote: 'window Mon 20 Jul 08:00 → Fri 24 Jul 23:59', weightNote: '= 1/5 of AFS2', format: 'online AF', needsVerification: true, notes: 'STATUS: VERIFY COMPLETION — not marked completed/missed/zero' }),
];

// --- Week 15 timetable (compulsory contact only; NO tutorials run this week). -------
function sa(p: Omit<ScheduledActivity, 'weight' | 'required'> & { weight?: number }): ScheduledActivity {
  const required = p.type !== 'optional';
  return { required, weight: required ? 1 : 0, ...p, ...(p.weight != null ? { weight: p.weight } : {}) };
}

export const WEEK15_SCHEDULED_ACTIVITIES: ScheduledActivity[] = [
  // Monday
  sa({ id: 'sa-mon-econ', moduleId: 'econ144', type: 'lecture', date: D.mon, startTime: '08:00', endTime: '09:00', venue: 'JM 3010' }),
  sa({ id: 'sa-mon-found', moduleId: 'foundations178', type: 'lecture', date: D.mon, startTime: '09:00', endTime: '10:00', venue: 'VDS 1024' }),
  sa({ id: 'sa-mon-lop', moduleId: 'lawpersons144', type: 'lecture', date: D.mon, startTime: '11:00', endTime: '12:00', venue: 'Arts 230' }),
  sa({ id: 'sa-mon-finacc', moduleId: 'finacc178', type: 'lecture', date: D.mon, startTime: '12:00', endTime: '13:00', venue: 'Chem 2011' }),
  sa({ id: 'sa-mon-stats', moduleId: 'sds188', type: 'lecture', date: D.mon, startTime: '15:00', endTime: '16:00', venue: 'JM 3010' }),
  sa({ id: 'sa-mon-dla142', moduleId: 'dla142', type: 'practical', date: D.mon, startTime: '16:00', endTime: '17:00', venue: 'JM EC 2011 (Grp 4)' }),
  // Tuesday
  sa({ id: 'sa-tue-stats', moduleId: 'sds188', type: 'lecture', date: D.tue, startTime: '09:00', endTime: '10:00', venue: 'JM 3010' }),
  sa({ id: 'sa-tue-finacc', moduleId: 'finacc178', type: 'lecture', date: D.tue, startTime: '10:00', endTime: '11:00', venue: 'Chem 2011' }),
  sa({ id: 'sa-tue-toi-qa', moduleId: 'toi142', type: 'optional', date: D.tue, startTime: '15:00', endTime: '15:50', venue: 'VDS 2118', notes: 'ToI Q&A — optional drop-in' }),
  // Wednesday
  sa({ id: 'sa-wed-finacc', moduleId: 'finacc178', type: 'lecture', date: D.wed, startTime: '08:00', endTime: '09:00', venue: 'Chem 2011' }),
  sa({ id: 'sa-wed-econ', moduleId: 'econ144', type: 'lecture', date: D.wed, startTime: '09:00', endTime: '10:00', venue: 'JM 3010' }),
  sa({ id: 'sa-wed-found', moduleId: 'foundations178', type: 'lecture', date: D.wed, startTime: '12:00', endTime: '13:00', venue: 'VDS 1024' }),
  sa({ id: 'sa-wed-dla142-async', moduleId: 'dla142', type: 'optional', date: D.wed, startTime: '13:00', endTime: '14:00', venue: 'EMSLearn', notes: 'async lesson — do in own time' }),
  sa({ id: 'sa-wed-lop', moduleId: 'lawpersons144', type: 'lecture', date: D.wed, startTime: '14:00', endTime: '15:00', venue: 'Arts 230' }),
  // Thursday
  sa({ id: 'sa-thu-found', moduleId: 'foundations178', type: 'lecture', date: D.thu, startTime: '08:00', endTime: '09:00', venue: 'VDS 1024' }),
  sa({ id: 'sa-thu-conlaw', moduleId: 'conlaw178', type: 'lecture', date: D.thu, startTime: '09:00', endTime: '10:00', venue: 'Krotoa 1001' }),
  sa({ id: 'sa-thu-toi-qa', moduleId: 'toi142', type: 'optional', date: D.thu, startTime: '10:00', endTime: '10:50', venue: 'VDS 2118', notes: 'ToI Q&A — optional drop-in' }),
  sa({ id: 'sa-thu-econ', moduleId: 'econ144', type: 'lecture', date: D.thu, startTime: '12:00', endTime: '13:00', venue: 'JM 3013' }),
  sa({ id: 'sa-thu-stats-prac', moduleId: 'sds188', type: 'practical', date: D.thu, startTime: '13:00', endTime: '15:00', venue: 'Neelsie E01.1/E01.2' }),
  // Friday
  sa({ id: 'sa-fri-conlaw', moduleId: 'conlaw178', type: 'lecture', date: D.fri, startTime: '08:00', endTime: '09:00', venue: 'Arts 230' }),
  sa({ id: 'sa-fri-finacc', moduleId: 'finacc178', type: 'lecture', date: D.fri, startTime: '09:00', endTime: '10:00', venue: 'Chem 2011' }),
  sa({ id: 'sa-fri-dla152', moduleId: 'dla152', type: 'practical', date: D.fri, startTime: '11:00', endTime: '12:00', venue: 'JM EC 2010 (Grp 4)' }),
  sa({ id: 'sa-fri-stats', moduleId: 'sds188', type: 'lecture', date: D.fri, startTime: '12:00', endTime: '13:00', venue: 'JM 3010' }),
];

// --- Week 15 planned private-study blocks (from the daily plan). --------------------
function sb(p: Omit<StudyBlock, 'weight' | 'isIndependentObligation'> & { independent?: boolean }): StudyBlock {
  const { independent, ...rest } = p;
  return { weight: 2, isIndependentObligation: !!independent, ...rest };
}

export const WEEK15_STUDY_BLOCKS: StudyBlock[] = [
  // Monday
  sb({ id: 'sb-mon-econ', moduleId: 'econ144', date: D.mon, startTime: '13:15', endTime: '14:00', plannedMinutes: 45, taskText: 'CORE Unit 1 models; draw labour-market / real-wage diagram from memory ×2' }),
  sb({ id: 'sb-mon-found', moduleId: 'foundations178', date: D.mon, startTime: '18:30', endTime: '19:30', plannedMinutes: 60, taskText: 'Theme 8 — Evans-Jones pp 9–15; 5-line summary from memory + start learning questions' }),
  sb({ id: 'sb-mon-lop', moduleId: 'lawpersons144', date: D.mon, startTime: '19:45', endTime: '20:30', plannedMinutes: 45, taskText: 'Read the current study-guide section (Study Unit 1); notes + 3 retrieval questions' }),
  // Tuesday
  sb({ id: 'sb-tue-stats', moduleId: 'sds188', date: D.tue, startTime: '11:15', endTime: '12:15', plannedMinutes: 60, taskText: "This chapter's tutorial problems in Excel (before Thu practical)" }),
  sb({ id: 'sb-tue-finacc', moduleId: 'finacc178', date: D.tue, startTime: '13:00', endTime: '14:00', plannedMinutes: 60, taskText: 'IAS 2 Inventory: revise Examples 9–13; closed-book attempt Q4/Q4b; read theory no. 7; review Recording 4 (NB). Attempt → mark.' }),
  sb({ id: 'sb-tue-toi', moduleId: 'toi142', date: D.tue, startTime: '15:00', endTime: '16:00', plannedMinutes: 60, taskText: 'EMSLearn §1.3.2–1.4 on HP 10bII+; complete weekly AF before 16:00 (aim ≥50%)', independent: true }),
  // Wednesday
  sb({ id: 'sb-wed-finacc', moduleId: 'finacc178', date: D.wed, startTime: '10:00', endTime: '11:00', plannedMinutes: 60, taskText: 'IAS 2 Inventory: mark Tue attempts vs memo (diagnose → redo); Example 15; ILP Question 17 (support work).' }),
  sb({ id: 'sb-wed-conlaw', moduleId: 'conlaw178', date: D.wed, startTime: '11:00', endTime: '11:45', plannedMinutes: 45, taskText: 'Read Botha 15–46; define "legislation" (ss 1–2 Interpretation Act, s 239)' }),
  sb({ id: 'sb-wed-dla142', moduleId: 'dla142', date: D.wed, startTime: '18:00', endTime: '18:45', plannedMinutes: 45, taskText: "This week's Xero steps + submit the weekly quiz", independent: true }),
  // Thursday
  sb({ id: 'sb-thu-conlaw', moduleId: 'conlaw178', date: D.thu, startTime: '10:00', endTime: '11:00', plannedMinutes: 60, taskText: 'Read Pharmaceutical Manufacturers / SANDU / Bato Star (prescribed paras)' }),
  sb({ id: 'sb-thu-lop', moduleId: 'lawpersons144', date: D.thu, startTime: '11:00', endTime: '11:45', plannedMinutes: 45, taskText: 'Consolidate Mon/Wed lectures; answer Monday retrieval questions closed-book' }),
  sb({ id: 'sb-thu-econ', moduleId: 'econ144', date: D.thu, startTime: '18:00', endTime: '19:00', plannedMinutes: 60, taskText: '6–8 Unit 1 MCQs/problems; mark; log errors; redo wrong ones unaided' }),
  // Friday
  sb({ id: 'sb-fri-dla152', moduleId: 'dla152', date: D.fri, startTime: '10:00', endTime: '10:45', plannedMinutes: 45, taskText: "This week's online Excel module + exercises (prep for the 11:00 practical)" }),
  sb({ id: 'sb-fri-found', moduleId: 'foundations178', date: D.fri, startTime: '14:00', endTime: '15:15', plannedMinutes: 75, taskText: "Consolidate the week's 3 lectures; then 5 closed-book questions" }),
  sb({ id: 'sb-fri-dla142', moduleId: 'dla142', date: D.fri, startTime: '15:30', endTime: '16:00', plannedMinutes: 30, taskText: 'Ensure Xero company current for all lessons; redo any fumbled step' }),
  // Saturday
  sb({ id: 'sb-sat-finacc', moduleId: 'finacc178', date: D.sat, startTime: '09:00', endTime: '10:00', plannedMinutes: 60, taskText: 'IAS 2 Inventory: assignment Question 22 + Question 3; revise the week (esp. NRV). Attempt → mark → diagnose → redo.' }),
  sb({ id: 'sb-sat-conlaw', moduleId: 'conlaw178', date: D.sat, startTime: '10:15', endTime: '11:15', plannedMinutes: 60, taskText: 'Answer 3 Theme-1 study-guide questions closed-book' }),
  sb({ id: 'sb-sat-stats', moduleId: 'sds188', date: D.sat, startTime: '11:30', endTime: '12:30', plannedMinutes: 60, taskText: "Reproduce this week's Excel functions from memory; finish tutorial problems" }),
  sb({ id: 'sb-sat-lop-quiz', moduleId: 'lawpersons144', date: D.sat, startTime: '14:30', endTime: '15:30', plannedMinutes: 60, taskText: 'Take the Study Unit 1 quiz (1 h; closes Sun 2 Aug 23:59; highest grade)', independent: true, linkedAssessmentId: 'lawpersons144-SU1-quiz' }),
  sb({ id: 'sb-sat-econ', moduleId: 'econ144', date: D.sat, startTime: '15:45', endTime: '16:30', plannedMinutes: 45, taskText: 'Write "why involuntary unemployment exists" in own words + redo remaining wrong Qs' }),
  sb({ id: 'sb-sat-toi', moduleId: 'toi142', date: D.sat, startTime: '16:45', endTime: '17:15', plannedMinutes: 30, taskText: "Redo this week's tutorial problems unaided on the HP 10bII+" }),
  // Sunday
  sb({ id: 'sb-sun-found-1', moduleId: 'foundations178', date: D.sun, startTime: '09:00', endTime: '09:45', plannedMinutes: 45, taskText: 'Start the Semester-1 recall list (can / can\'t recall)' }),
  sb({ id: 'sb-sun-found-2', moduleId: 'foundations178', date: D.sun, startTime: '10:00', endTime: '10:45', plannedMinutes: 45, taskText: 'Retrieval on 3 weakest recall-list items + 2 whole-year gap-questions' }),
  sb({ id: 'sb-sun-lop', moduleId: 'lawpersons144', date: D.sun, startTime: '11:00', endTime: '11:30', plannedMinutes: 30, taskText: 'Closed-book: answer remaining retrieval questions from the week' }),
  sb({ id: 'sb-sun-toi', moduleId: 'toi142', date: D.sun, startTime: '11:45', endTime: '12:15', plannedMinutes: 30, taskText: 'Extra Theory of Interest practice: redo a mixed set unaided on the HP 10bII+' }),
  sb({ id: 'sb-sun-econ', moduleId: 'econ144', date: D.sun, startTime: '14:00', endTime: '14:30', plannedMinutes: 30, taskText: 'CORE Unit 1 review + one more graph from memory' }),
  sb({ id: 'sb-sun-dla152', moduleId: 'dla152', date: D.sun, startTime: '15:00', endTime: '15:30', plannedMinutes: 30, taskText: 'Start the A1 project scaffold workbook (early start, not polishing)' }),
];

// Budget table (deliberate per-module Week 15 budget, 22.0 h). Phase C.1: the study blocks
// above were adjusted so that for EVERY module sum(StudyBlock.plannedMinutes) EXACTLY equals
// perModuleBudgetMinutes[module] (enforced by a test), while preserving the 1320-minute total,
// day loads, live academic tasks, and no time overlaps.
export const WEEK15_PLAN: WeeklyPlan = {
  id: ACTIVE_WEEK_ID,
  weekStart: D.mon,
  weekEnd: D.sun,
  objective:
    'Run the whole 9-module system for real: stay current in every module, log outputs, hit the Theory of Interest AF before Tue 16:00, keep the DLA 142 quiz current. No assessment <21 days away — habit-building.',
  perModuleBudgetMinutes: {
    foundations178: 225,
    finacc178: 180,
    conlaw178: 165,
    lawpersons144: 180,
    econ144: 180,
    sds188: 120,
    toi142: 120,
    dla142: 75,
    dla152: 75,
  },
  totalPlannedMinutes: 1320,
  frozen: true,
  notes: 'Realism-adjusted 22.0 h (from 24.5 h test target). No law tutorials run this week.',
};
