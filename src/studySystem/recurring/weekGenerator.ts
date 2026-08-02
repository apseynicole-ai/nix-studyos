// Phase D — deterministic, idempotent week generator.
//
// generateWeek(weekId) stamps the recurring base + confirmed tutorial occurrences + the
// study-block template onto a week's dates, producing WeeklyPlan, ScheduledActivities,
// StudyBlocks, and VerificationItems (TBC / conflicts). All ids are deterministic, so
// re-running never duplicates. Week 15 (pre-seeded) is left untouched by ensureWeek.

import {
  recurringActivitiesRepo,
  scheduledActivitiesRepo,
  studyBlocksRepo,
  tutorialAllocationsRepo,
  tutorialOccurrencesRepo,
  verificationItemsRepo,
  weeklyPlansRepo,
} from '../repositories';
import { detectConflicts } from '../conflicts';
import {
  RECURRING_ACTIVITIES,
  STUDY_BLOCK_TEMPLATE,
  TUTORIAL_ALLOCATIONS,
  TUTORIAL_OCCURRENCES,
  WEEK_BUDGET,
} from './timetableSeed';
import type { ScheduledActivity, StudyBlock, VerificationItem, WeeklyPlan } from '../types';

const ANCHOR_WEEK = 15;
const ANCHOR_MONDAY = '2026-07-27';
export const TBC_TASK_TEXT = 'CURRENT WEEK TASK — UPDATE FROM LIVE MODULE INFO';

export function weekNumber(weekId: string): number {
  return Number(weekId.split('W')[1]);
}
export function weekIdFor(n: number): string {
  return `2026-W${n}`;
}

function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function mondayForWeek(weekId: string): string {
  return addDaysISO(ANCHOR_MONDAY, (weekNumber(weekId) - ANCHOR_WEEK) * 7);
}

/** weekId whose Mon–Sun range contains the date (custom teaching-week numbering). */
export function weekIdForDate(dateISO: string): string {
  const days = Math.floor((Date.parse(`${dateISO}T00:00:00Z`) - Date.parse(`${ANCHOR_MONDAY}T00:00:00Z`)) / 86400000);
  return weekIdFor(ANCHOR_WEEK + Math.floor(days / 7));
}

export function weekDates(weekId: string): string[] {
  const mon = mondayForWeek(weekId);
  return Array.from({ length: 7 }, (_, i) => addDaysISO(mon, i));
}

/** Seed the recurring reference layer (idempotent). Safe to call on every bootstrap. */
export function seedRecurringBase(): void {
  recurringActivitiesRepo.upsertMany(RECURRING_ACTIVITIES);
  tutorialAllocationsRepo.upsertMany(TUTORIAL_ALLOCATIONS);
  tutorialOccurrencesRepo.upsertMany(TUTORIAL_OCCURRENCES);
}

export interface GenerateWeekResult {
  weekId: string;
  activities: number;
  tutorials: number;
  studyBlocks: number;
  conflicts: number;
  verification: number;
}

function occurrenceStatus(allocationId: string, weekId: string) {
  return tutorialOccurrencesRepo.getById(`${allocationId}:${weekId}`)?.status ?? 'TBC';
}

export function generateWeek(weekId: string, moduleName: (id: string) => string = (id) => id): GenerateWeekResult {
  const dates = weekDates(weekId);
  const [weekStart] = dates;
  const weekEnd = dates[6];

  // 1) WeeklyPlan (preserve an existing plan's objective/frozen/archived state).
  const existing = weeklyPlansRepo.getById(weekId);
  const plan: WeeklyPlan = existing ?? {
    id: weekId,
    weekStart,
    weekEnd,
    objective: 'Generated week — update objective from live weekly plan.',
    perModuleBudgetMinutes: { ...WEEK_BUDGET },
    totalPlannedMinutes: Object.values(WEEK_BUDGET).reduce((a, b) => a + b, 0),
    frozen: false,
    notes: 'Generated from the recurring timetable (Phase D).',
  };
  weeklyPlansRepo.upsert(plan);

  // 2) Recurring activities → dated ScheduledActivities.
  const activities: ScheduledActivity[] = [];
  for (const r of recurringActivitiesRepo.read()) {
    if (r.validFrom > weekEnd) continue;
    if (r.validUntil && r.validUntil < weekStart) continue;
    activities.push({
      id: `sa:${r.id}:${weekId}`,
      moduleId: r.moduleId,
      type: r.required ? (r.activityType === 'practical' ? 'practical' : 'lecture') : 'optional',
      date: dates[r.dayOfWeek - 1],
      startTime: r.startTime,
      endTime: r.endTime,
      venue: r.venue ?? null,
      weight: r.weight,
      required: r.required,
      recurrenceKey: r.id,
      notes: r.notes,
    });
  }

  // 3) Tutorial occurrences → activities (ACTIVE) / verification (TBC).
  const verification: VerificationItem[] = [];
  let tutorialCount = 0;
  for (const alloc of tutorialAllocationsRepo.read()) {
    const status = occurrenceStatus(alloc.id, weekId);
    if (status === 'CONFIRMED_ACTIVE') {
      activities.push({
        id: `sa:tut:${alloc.id}:${weekId}`,
        moduleId: alloc.moduleId,
        type: 'tutorial',
        date: dates[alloc.dayOfWeek - 1],
        startTime: alloc.startTime,
        endTime: alloc.endTime,
        venue: alloc.venue ?? null,
        weight: 1,
        required: true,
        recurrenceKey: alloc.id,
        notes: alloc.notes,
      });
      tutorialCount += 1;
    } else if (status === 'TBC') {
      verification.push({
        id: `verify:tut:${alloc.id}:${weekId}`,
        weekId,
        kind: 'tutorial_tbc',
        moduleId: alloc.moduleId,
        title: `${moduleName(alloc.moduleId)} tutorial this week — confirm`,
        detail: `Allocation ${alloc.group} ${alloc.startTime}–${alloc.endTime}. ${alloc.notes ?? ''} Do NOT attend as fixed until confirmed.`.trim(),
        status: 'open',
        createdAt: new Date().toISOString(),
      });
    }
  }

  // 4) Study-block template → dated StudyBlocks (task content TBC — never invented).
  const studyBlocks: StudyBlock[] = STUDY_BLOCK_TEMPLATE.map((t) => ({
    id: `sb:${t.id}:${weekId}`,
    moduleId: t.moduleId,
    date: dates[t.dayOfWeek - 1],
    startTime: t.startTime,
    endTime: t.endTime,
    plannedMinutes: t.plannedMinutes,
    taskText: TBC_TASK_TEXT,
    linkedAssessmentId: t.linkedAssessmentId ?? null,
    weight: 2,
    isIndependentObligation: false,
  }));

  // 5) Persist activities + blocks (idempotent — deterministic ids).
  scheduledActivitiesRepo.upsertMany(activities);
  studyBlocksRepo.upsertMany(studyBlocks);

  // 6) Conflicts → verification items.
  const conflicts = detectConflicts(activities, studyBlocks, weekId, moduleName);
  for (const c of conflicts) {
    verification.push({
      id: `verify:${c.id}`,
      weekId,
      kind: 'conflict',
      title: 'Schedule conflict — action required',
      detail: `${c.aLabel}  vs  ${c.bLabel} (${c.date}). ${c.reason}`,
      status: 'open',
      createdAt: new Date().toISOString(),
    });
  }

  // 7) Content-TBC nudge per module (blocks generated with placeholder text).
  for (const moduleId of Object.keys(WEEK_BUDGET)) {
    verification.push({
      id: `verify:content:${moduleId}:${weekId}`,
      weekId,
      kind: 'content_tbc',
      moduleId,
      title: `${moduleName(moduleId)} — set this week's tasks`,
      detail: 'Study-block content is a placeholder until live module info is added.',
      status: 'open',
      createdAt: new Date().toISOString(),
    });
  }

  verificationItemsRepo.upsertMany(verification);

  return {
    weekId,
    activities: activities.length - tutorialCount,
    tutorials: tutorialCount,
    studyBlocks: studyBlocks.length,
    conflicts: conflicts.length,
    verification: verification.length,
  };
}

/** Generate a week only if it has no plan yet (leaves the pre-seeded Week 15 alone). */
export function ensureWeek(weekId: string, moduleName?: (id: string) => string): boolean {
  if (weeklyPlansRepo.getById(weekId)) return false;
  generateWeek(weekId, moduleName);
  return true;
}

/** Ensure the week containing `today` and the next week exist (keeps the app from expiring). */
export function ensureUpcomingWeeks(today: string, moduleName?: (id: string) => string): void {
  const current = weekNumber(weekIdForDate(today));
  ensureWeek(weekIdFor(current), moduleName);
  ensureWeek(weekIdFor(current + 1), moduleName);
}
