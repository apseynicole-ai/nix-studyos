// Phase D — recurring timetable base (Nicole's confirmed personal MySUN schedule).
//
// This is the RECURRING SOURCE. Week 15's dated records (Phase A seed) are NOT the source;
// future weeks are generated from this base. Classifications from the Control Centre are
// preserved: lectures/practicals recurring; DLA 142 Wed = async; DLA 152 Fri Teams = optional;
// ToI Tue/Thu = optional Q&A; FinAcc ILP = optional support; Economics tutorial EXCLUDED.

import type { RecurringActivity, StudyBlockTemplate, TutorialAllocation, TutorialOccurrence } from '../types';

const FROM = '2026-07-27'; // Semester 2 teaching start (Week 15).
const SRC = 'Confirmed personal MySUN timetable (Control Centre, source-locked)';

function req(p: Omit<RecurringActivity, 'weight' | 'required' | 'validFrom' | 'source' | 'activityType'> & { activityType: 'lecture' | 'practical' }): RecurringActivity {
  return { required: true, weight: 1, validFrom: FROM, source: SRC, ...p };
}
function opt(p: Omit<RecurringActivity, 'weight' | 'required' | 'validFrom' | 'source'>): RecurringActivity {
  return { required: false, weight: 0, validFrom: FROM, source: SRC, ...p };
}

// Mon = 1 … Fri = 5.
export const RECURRING_ACTIVITIES: RecurringActivity[] = [
  // Monday
  req({ id: 'r-mon-econ', moduleId: 'econ144', activityType: 'lecture', dayOfWeek: 1, startTime: '08:00', endTime: '09:00', venue: 'JM 3010' }),
  req({ id: 'r-mon-found', moduleId: 'foundations178', activityType: 'lecture', dayOfWeek: 1, startTime: '09:00', endTime: '10:00', venue: 'VDS 1024' }),
  req({ id: 'r-mon-lop', moduleId: 'lawpersons144', activityType: 'lecture', dayOfWeek: 1, startTime: '11:00', endTime: '12:00', venue: 'Arts 230' }),
  req({ id: 'r-mon-finacc', moduleId: 'finacc178', activityType: 'lecture', dayOfWeek: 1, startTime: '12:00', endTime: '13:00', venue: 'Chem 2011' }),
  req({ id: 'r-mon-stats', moduleId: 'sds188', activityType: 'lecture', dayOfWeek: 1, startTime: '15:00', endTime: '16:00', venue: 'JM 3010' }),
  req({ id: 'r-mon-dla142', moduleId: 'dla142', activityType: 'practical', dayOfWeek: 1, startTime: '16:00', endTime: '17:00', venue: 'JM EC 2011 (Grp 4)' }),
  // Tuesday
  req({ id: 'r-tue-stats', moduleId: 'sds188', activityType: 'lecture', dayOfWeek: 2, startTime: '09:00', endTime: '10:00', venue: 'JM 3010' }),
  req({ id: 'r-tue-finacc', moduleId: 'finacc178', activityType: 'lecture', dayOfWeek: 2, startTime: '10:00', endTime: '11:00', venue: 'Chem 2011' }),
  opt({ id: 'r-tue-toi-qa', moduleId: 'toi142', activityType: 'optional_qa', dayOfWeek: 2, startTime: '15:00', endTime: '15:50', venue: 'VDS 2118', notes: 'ToI Q&A — optional drop-in' }),
  // Wednesday
  req({ id: 'r-wed-finacc', moduleId: 'finacc178', activityType: 'lecture', dayOfWeek: 3, startTime: '08:00', endTime: '09:00', venue: 'Chem 2011' }),
  req({ id: 'r-wed-econ', moduleId: 'econ144', activityType: 'lecture', dayOfWeek: 3, startTime: '09:00', endTime: '10:00', venue: 'JM 3010' }),
  req({ id: 'r-wed-found', moduleId: 'foundations178', activityType: 'lecture', dayOfWeek: 3, startTime: '12:00', endTime: '13:00', venue: 'VDS 1024' }),
  opt({ id: 'r-wed-dla142-async', moduleId: 'dla142', activityType: 'async', dayOfWeek: 3, startTime: '13:00', endTime: '14:00', venue: 'EMSLearn', notes: 'async lesson — own time' }),
  req({ id: 'r-wed-lop', moduleId: 'lawpersons144', activityType: 'lecture', dayOfWeek: 3, startTime: '14:00', endTime: '15:00', venue: 'Arts 230' }),
  opt({ id: 'r-wed-finacc-ilp', moduleId: 'finacc178', activityType: 'support', dayOfWeek: 3, startTime: '13:10', endTime: '14:00', venue: 'VDS 1024', notes: 'FinAcc ILP — optional support' }),
  // Thursday
  req({ id: 'r-thu-found', moduleId: 'foundations178', activityType: 'lecture', dayOfWeek: 4, startTime: '08:00', endTime: '09:00', venue: 'VDS 1024' }),
  req({ id: 'r-thu-conlaw', moduleId: 'conlaw178', activityType: 'lecture', dayOfWeek: 4, startTime: '09:00', endTime: '10:00', venue: 'Krotoa 1001' }),
  opt({ id: 'r-thu-toi-qa', moduleId: 'toi142', activityType: 'optional_qa', dayOfWeek: 4, startTime: '10:00', endTime: '10:50', venue: 'VDS 2118', notes: 'ToI Q&A — optional drop-in' }),
  req({ id: 'r-thu-econ', moduleId: 'econ144', activityType: 'lecture', dayOfWeek: 4, startTime: '12:00', endTime: '13:00', venue: 'JM 3013' }),
  req({ id: 'r-thu-stats-prac', moduleId: 'sds188', activityType: 'practical', dayOfWeek: 4, startTime: '13:00', endTime: '15:00', venue: 'Neelsie E01.1/E01.2' }),
  opt({ id: 'r-thu-finacc-ilp', moduleId: 'finacc178', activityType: 'support', dayOfWeek: 4, startTime: '11:10', endTime: '12:00', venue: 'VDS 1024', notes: 'FinAcc ILP — optional support' }),
  // Friday
  req({ id: 'r-fri-conlaw', moduleId: 'conlaw178', activityType: 'lecture', dayOfWeek: 5, startTime: '08:00', endTime: '09:00', venue: 'Arts 230' }),
  req({ id: 'r-fri-finacc', moduleId: 'finacc178', activityType: 'lecture', dayOfWeek: 5, startTime: '09:00', endTime: '10:00', venue: 'Chem 2011' }),
  req({ id: 'r-fri-dla152', moduleId: 'dla152', activityType: 'practical', dayOfWeek: 5, startTime: '11:00', endTime: '12:00', venue: 'JM EC 2010 (Grp 4)' }),
  req({ id: 'r-fri-stats', moduleId: 'sds188', activityType: 'lecture', dayOfWeek: 5, startTime: '12:00', endTime: '13:00', venue: 'JM 3010' }),
  opt({ id: 'r-fri-dla152-teams', moduleId: 'dla152', activityType: 'optional_qa', dayOfWeek: 5, startTime: '13:00', endTime: '14:00', venue: 'Teams', notes: 'DLA 152 Teams Q&A — only when announced' }),
];

// Tutorial ALLOCATIONS (occurrence is separate — see TUTORIAL_OCCURRENCES). Economics tutorial
// is intentionally EXCLUDED per Nicole's instruction.
export const TUTORIAL_ALLOCATIONS: TutorialAllocation[] = [
  { id: 'tut-foundations', moduleId: 'foundations178', group: 'Grp 2.1', dayOfWeek: 2, startTime: '09:10', endTime: '10:00', venue: 'Arts 228', source: 'Personal allocation (Ms Rowland)', notes: 'Announced weeks only' },
  { id: 'tut-conlaw', moduleId: 'conlaw178', group: 'T/Gr 2/1', dayOfWeek: 1, startTime: '10:00', endTime: '11:00', venue: null, source: 'MySUN timetable (27 Jul)', notes: 'Room TBC — OldMain 1031 / OldMain 1017 / Arts 221; final check 3 Aug' },
  { id: 'tut-lop', moduleId: 'lawpersons144', group: 'Grp 1', dayOfWeek: 2, startTime: '08:00', endTime: '09:00', venue: null, source: 'Framework', notes: 'Venue + start week TBC' },
];

// Per-week tutorial OCCURRENCE status. Absent record for a week ⇒ TBC (surface "confirm").
export const TUTORIAL_OCCURRENCES: TutorialOccurrence[] = [
  // Week 15 — no law tutorials ran.
  { id: 'tut-foundations:2026-W15', allocationId: 'tut-foundations', weekId: '2026-W15', status: 'CONFIRMED_NOT_ACTIVE', source: 'SocSciLearn 27 Jul: tutorials start week of 3 Aug' },
  { id: 'tut-conlaw:2026-W15', allocationId: 'tut-conlaw', weekId: '2026-W15', status: 'CONFIRMED_NOT_ACTIVE', source: 'No session confirmed Week 15' },
  { id: 'tut-lop:2026-W15', allocationId: 'tut-lop', weekId: '2026-W15', status: 'CONFIRMED_NOT_ACTIVE', source: 'Arrangements communicated week 3' },
  // Week 16 — Foundations begins; Con Law & LoP remain TBC (allocation ≠ occurrence).
  { id: 'tut-foundations:2026-W16', allocationId: 'tut-foundations', weekId: '2026-W16', status: 'CONFIRMED_ACTIVE', source: 'SocSciLearn: Sem-2 tutorials begin week of 3 Aug' },
  { id: 'tut-conlaw:2026-W16', allocationId: 'tut-conlaw', weekId: '2026-W16', status: 'TBC', source: 'Allocation only — session not confirmed; final check 3 Aug' },
  { id: 'tut-lop:2026-W16', allocationId: 'tut-lop', weekId: '2026-W16', status: 'TBC', source: 'Start/venue unconfirmed' },
];

// Calibrated per-module weekly private-study budget (minutes). Total = 1320 (22.0 h).
export const WEEK_BUDGET: Record<string, number> = {
  foundations178: 225,
  finacc178: 180,
  conlaw178: 165,
  lawpersons144: 180,
  econ144: 180,
  sds188: 120,
  toi142: 120,
  dla142: 75,
  dla152: 75,
};

// Study-block time-slot template (per module sums match WEEK_BUDGET; no class overlaps).
// The generator stamps week dates onto these; task content starts TBC (never invented).
export const STUDY_BLOCK_TEMPLATE: StudyBlockTemplate[] = [
  { id: 't-mon-econ', moduleId: 'econ144', dayOfWeek: 1, startTime: '13:15', endTime: '14:00', plannedMinutes: 45 },
  { id: 't-mon-found', moduleId: 'foundations178', dayOfWeek: 1, startTime: '18:30', endTime: '19:30', plannedMinutes: 60 },
  { id: 't-mon-lop', moduleId: 'lawpersons144', dayOfWeek: 1, startTime: '19:45', endTime: '20:30', plannedMinutes: 45 },
  { id: 't-tue-stats', moduleId: 'sds188', dayOfWeek: 2, startTime: '11:15', endTime: '12:15', plannedMinutes: 60 },
  { id: 't-tue-finacc', moduleId: 'finacc178', dayOfWeek: 2, startTime: '13:00', endTime: '14:00', plannedMinutes: 60 },
  { id: 't-tue-toi', moduleId: 'toi142', dayOfWeek: 2, startTime: '15:00', endTime: '16:00', plannedMinutes: 60 },
  { id: 't-wed-finacc', moduleId: 'finacc178', dayOfWeek: 3, startTime: '10:00', endTime: '11:00', plannedMinutes: 60 },
  { id: 't-wed-conlaw', moduleId: 'conlaw178', dayOfWeek: 3, startTime: '11:00', endTime: '11:45', plannedMinutes: 45 },
  { id: 't-wed-dla142', moduleId: 'dla142', dayOfWeek: 3, startTime: '18:00', endTime: '18:45', plannedMinutes: 45 },
  { id: 't-thu-conlaw', moduleId: 'conlaw178', dayOfWeek: 4, startTime: '10:00', endTime: '11:00', plannedMinutes: 60 },
  { id: 't-thu-lop', moduleId: 'lawpersons144', dayOfWeek: 4, startTime: '11:00', endTime: '11:45', plannedMinutes: 45 },
  { id: 't-thu-econ', moduleId: 'econ144', dayOfWeek: 4, startTime: '18:00', endTime: '19:00', plannedMinutes: 60 },
  { id: 't-fri-dla152', moduleId: 'dla152', dayOfWeek: 5, startTime: '10:00', endTime: '10:45', plannedMinutes: 45 },
  { id: 't-fri-found', moduleId: 'foundations178', dayOfWeek: 5, startTime: '14:00', endTime: '15:15', plannedMinutes: 75 },
  { id: 't-fri-dla142', moduleId: 'dla142', dayOfWeek: 5, startTime: '15:30', endTime: '16:00', plannedMinutes: 30 },
  { id: 't-sat-finacc', moduleId: 'finacc178', dayOfWeek: 6, startTime: '09:00', endTime: '10:00', plannedMinutes: 60 },
  { id: 't-sat-conlaw', moduleId: 'conlaw178', dayOfWeek: 6, startTime: '10:15', endTime: '11:15', plannedMinutes: 60 },
  { id: 't-sat-stats', moduleId: 'sds188', dayOfWeek: 6, startTime: '11:30', endTime: '12:30', plannedMinutes: 60 },
  { id: 't-sat-lop', moduleId: 'lawpersons144', dayOfWeek: 6, startTime: '14:30', endTime: '15:30', plannedMinutes: 60 },
  { id: 't-sat-econ', moduleId: 'econ144', dayOfWeek: 6, startTime: '15:45', endTime: '16:30', plannedMinutes: 45 },
  { id: 't-sat-toi', moduleId: 'toi142', dayOfWeek: 6, startTime: '16:45', endTime: '17:15', plannedMinutes: 30 },
  { id: 't-sun-found-1', moduleId: 'foundations178', dayOfWeek: 7, startTime: '09:00', endTime: '09:45', plannedMinutes: 45 },
  { id: 't-sun-found-2', moduleId: 'foundations178', dayOfWeek: 7, startTime: '10:00', endTime: '10:45', plannedMinutes: 45 },
  { id: 't-sun-lop', moduleId: 'lawpersons144', dayOfWeek: 7, startTime: '11:00', endTime: '11:30', plannedMinutes: 30 },
  { id: 't-sun-toi', moduleId: 'toi142', dayOfWeek: 7, startTime: '11:45', endTime: '12:15', plannedMinutes: 30 },
  { id: 't-sun-econ', moduleId: 'econ144', dayOfWeek: 7, startTime: '14:00', endTime: '14:30', plannedMinutes: 30 },
  { id: 't-sun-dla152', moduleId: 'dla152', dayOfWeek: 7, startTime: '15:00', endTime: '15:30', plannedMinutes: 30 },
];
