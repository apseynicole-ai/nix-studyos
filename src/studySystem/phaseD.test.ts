import { beforeEach, describe, expect, it } from 'vitest';
import { installMemoryStorage } from './testMemoryStorage';
import { bootstrapSemester2 } from './seed/bootstrap';
import {
  generateWeek,
  ensureWeek,
  weekDates,
  weekNumber,
  weekIdFor,
  weekIdForDate,
  TBC_TASK_TEXT,
} from './recurring/weekGenerator';
import { WEEK_BUDGET, TUTORIAL_ALLOCATIONS } from './recurring/timetableSeed';
import { detectConflicts, detectWeekConflicts } from './conflicts';
import { canRunWeeklyReset, runWeeklyReset, suggestSlot, acceptCarryOverSlot } from './weeklyReset';
import { resolveWeekPlan } from './currentWeek';
import {
  appStateRepo,
  DEFAULT_APP_STATE,
  scheduledActivitiesRepo,
  studyBlocksRepo,
  verificationItemsRepo,
  weeklyPlansRepo,
} from './repositories';
import { createTask, listActiveTasks, setTaskStatus } from './tasks';
import { completeSession, startSession, stopSession } from './session';
import type { StudyBlock } from './types';

const W16 = '2026-W16';
const W16_ACTS = () => scheduledActivitiesRepo.read().filter((a) => a.id.endsWith(`:${W16}`));
const W16_BLOCKS = () => studyBlocksRepo.read().filter((b) => b.id.endsWith(`:${W16}`));

beforeEach(() => { installMemoryStorage(); bootstrapSemester2(); });

describe('week id / date maths', () => {
  it('W16 is 3–9 Aug; date maps back to the right week', () => {
    expect(weekDates(W16)[0]).toBe('2026-08-03');
    expect(weekDates(W16)[6]).toBe('2026-08-09');
    expect(weekIdForDate('2026-08-05')).toBe(W16);
    expect(weekIdForDate('2026-07-27')).toBe('2026-W15');
    expect(weekIdFor(weekNumber(W16))).toBe(W16);
  });
});

describe('recurring timetable generation', () => {
  it('generates Mon–Fri recurring lectures/practicals with correct module & times', () => {
    generateWeek(W16);
    const acts = W16_ACTS();
    const mon = acts.find((a) => a.recurrenceKey === 'r-mon-econ')!;
    expect(mon.date).toBe('2026-08-03');
    expect(mon.startTime).toBe('08:00');
    expect(mon.type).toBe('lecture');
    expect(acts.find((a) => a.recurrenceKey === 'r-thu-stats-prac')!.type).toBe('practical');
  });

  it('classifies optional periods (ToI Q&A) as weight 0 / optional', () => {
    generateWeek(W16);
    const qa = W16_ACTS().find((a) => a.recurrenceKey === 'r-tue-toi-qa')!;
    expect(qa.type).toBe('optional');
    expect(qa.weight).toBe(0);
    expect(qa.required).toBe(false);
  });

  it('excludes the Economics tutorial (no allocation for it)', () => {
    expect(TUTORIAL_ALLOCATIONS.some((t) => t.moduleId === 'econ144')).toBe(false);
  });
});

describe('tutorial allocation vs occurrence', () => {
  it('Foundations tutorial ACTIVATES in Week 16', () => {
    generateWeek(W16);
    const tut = W16_ACTS().find((a) => a.type === 'tutorial' && a.moduleId === 'foundations178');
    expect(tut).toBeDefined();
    expect(tut!.startTime).toBe('09:10');
    expect(tut!.date).toBe('2026-08-04'); // Tuesday
  });

  it('Con Law & LoP allocations do NOT imply an occurrence (TBC → no event, a verify item instead)', () => {
    generateWeek(W16, (id) => id);
    const acts = W16_ACTS();
    expect(acts.some((a) => a.type === 'tutorial' && a.moduleId === 'conlaw178')).toBe(false);
    expect(acts.some((a) => a.type === 'tutorial' && a.moduleId === 'lawpersons144')).toBe(false);
    const verify = verificationItemsRepo.read().filter((v) => v.kind === 'tutorial_tbc' && v.weekId === W16);
    expect(verify.some((v) => v.moduleId === 'conlaw178')).toBe(true);
    expect(verify.some((v) => v.moduleId === 'lawpersons144')).toBe(true);
  });

  it('does not duplicate tutorial events on regeneration', () => {
    generateWeek(W16);
    generateWeek(W16);
    expect(W16_ACTS().filter((a) => a.type === 'tutorial').length).toBe(1);
  });
});

describe('conflict detection', () => {
  it('detects the Foundations Tue 09:10 tutorial vs Statistics Tue 09:00 lecture (Week 16)', () => {
    generateWeek(W16, (id) => id);
    const plan = weeklyPlansRepo.getById(W16)!;
    const conflicts = detectWeekConflicts(W16, plan.weekStart, plan.weekEnd, (id) => id);
    const tue = conflicts.find((c) => c.date === '2026-08-04');
    expect(tue).toBeDefined();
    expect(tue!.severity).toBe('hard');
    expect(`${tue!.aLabel} ${tue!.bLabel}`).toMatch(/tutorial/);
    expect(`${tue!.aLabel} ${tue!.bLabel}`).toMatch(/lecture/);
  });

  it('does NOT flag an optional Q&A overlapping a study block', () => {
    generateWeek(W16);
    const plan = weeklyPlansRepo.getById(W16)!;
    // ToI Q&A Tue 15:00–15:50 (optional) overlaps ToI study block Tue 15:00–16:00.
    const tueConflicts = detectWeekConflicts(W16, plan.weekStart, plan.weekEnd).filter((c) => c.date === '2026-08-04' && c.aLabel.includes('15:00'));
    expect(tueConflicts.every((c) => !/Q&A|optional/.test(c.aLabel + c.bLabel))).toBe(true);
  });

  it('detects a hard study-block ↔ study-block overlap', () => {
    const a: StudyBlock = { id: 'x', moduleId: 'm', date: '2026-08-03', startTime: '10:00', endTime: '11:00', plannedMinutes: 60, taskText: '', weight: 2, isIndependentObligation: false };
    const b: StudyBlock = { ...a, id: 'y', startTime: '10:30', endTime: '11:30' };
    expect(detectConflicts([], [a, b], W16).length).toBe(1);
  });
});

describe('week generation invariants', () => {
  it('generated Week 16 has 9-module budgets summing to 22h and matching per module', () => {
    generateWeek(W16);
    const sums: Record<string, number> = {};
    for (const b of W16_BLOCKS()) sums[b.moduleId] = (sums[b.moduleId] ?? 0) + b.plannedMinutes;
    for (const [m, budget] of Object.entries(WEEK_BUDGET)) expect(sums[m]).toBe(budget);
    expect(Object.values(sums).reduce((a, b) => a + b, 0)).toBe(1320);
  });

  it('is idempotent — regenerating creates no duplicate blocks/activities', () => {
    generateWeek(W16);
    const acts = W16_ACTS().length;
    const blocks = W16_BLOCKS().length;
    generateWeek(W16);
    expect(W16_ACTS().length).toBe(acts);
    expect(W16_BLOCKS().length).toBe(blocks);
  });

  it('leaves study-block content as TBC (never invented)', () => {
    generateWeek(W16);
    expect(W16_BLOCKS().every((b) => b.taskText === TBC_TASK_TEXT)).toBe(true);
  });

  it('ensureWeek leaves the pre-seeded Week 15 untouched but generates a fresh week', () => {
    expect(ensureWeek('2026-W15')).toBe(false);
    expect(ensureWeek(W16)).toBe(true);
  });
});

describe('Sunday reset', () => {
  it('allows reset only on or after weekEnd for an active plan', () => {
    const plan = { ...weeklyPlansRepo.getById('2026-W15')!, frozen: false, archivedAt: null };
    expect(canRunWeeklyReset('2026-08-01', plan)).toBe(false);
    expect(canRunWeeklyReset('2026-08-02', plan)).toBe(true);
    expect(canRunWeeklyReset('2026-08-03', plan)).toBe(true);
  });

  it('rejects frozen and archived plans', () => {
    const plan = weeklyPlansRepo.getById('2026-W15')!;
    expect(canRunWeeklyReset(plan.weekEnd, { ...plan, frozen: true })).toBe(false);
    expect(canRunWeeklyReset(plan.weekEnd, { ...plan, archivedAt: '2026-08-02T20:00:00.000Z' })).toBe(false);
  });

  it('archives Week 15, preserves logs, advances currentWeekId, and is idempotent', () => {
    // A completed session + a could-not-complete session in W15 (preserved as history).
    const t0 = Date.parse('2026-07-28T13:00:00Z');
    startSession({ moduleId: 'finacc178', studyBlockId: 'sb-tue-finacc' }, t0);
    stopSession(t0 + 60 * 60000);
    completeSession({ status: 'COMPLETED', location: 'Library', followUpRequired: false });

    const r1 = runWeeklyReset('2026-W15', W16, (id) => id);
    expect(r1.archived).toBe(true);
    expect(weeklyPlansRepo.getById('2026-W15')!.frozen).toBe(true);
    expect(weeklyPlansRepo.getById('2026-W15')!.archivedAt).toBeTruthy();
    expect(appStateRepo.read(DEFAULT_APP_STATE).currentWeekId).toBe(W16);
    expect(r1.finalActualMinutes).toBe(60);
    // history preserved
    expect(resolveWeekPlan('2026-07-27')!.id).toBe('2026-W15');

    const r2 = runWeeklyReset('2026-W15', W16, (id) => id);
    expect(r2.archived).toBe(false); // already archived
  });

  it('carries incomplete required work forward (unscheduled) but not completed work; idempotent', () => {
    const carry = createTask({ moduleId: 'conlaw178', title: 'Finish SANDU notes', category: 'MUST_DO', priority: 'P2', plannedWeekId: '2026-W15' });
    const done = createTask({ moduleId: 'conlaw178', title: 'Read Botha', category: 'MUST_DO', priority: 'P2', plannedWeekId: '2026-W15' });
    setTaskStatus(done.id, 'done');

    const r = runWeeklyReset('2026-W15', W16, (id) => id);
    expect(r.carriedOverTaskIds).toContain(carry.id);
    expect(r.carriedOverTaskIds).not.toContain(done.id);

    const carried = listActiveTasks().find((t) => t.id === carry.id)!;
    expect(carried.carriedOver).toBe(true);
    expect(carried.plannedWeekId).toBe(W16);
    expect(carried.status).toBe('carried_over');
    expect(carried.linkedStudyBlockId).toBeNull(); // unscheduled until approved

    // idempotent: a second reset does not re-carry (already moved to W16)
    const r2 = runWeeklyReset('2026-W15', W16, (id) => id);
    expect(r2.carriedOverTaskIds).not.toContain(carry.id);
  });

  it('accepting a suggested slot schedules the carry-over into a Week 16 block', () => {
    const carry = createTask({ moduleId: 'conlaw178', title: 'x', category: 'MUST_DO', priority: 'P2', plannedWeekId: '2026-W15' });
    runWeeklyReset('2026-W15', W16, (id) => id);
    const slot = suggestSlot(listActiveTasks().find((t) => t.id === carry.id)!, W16)!;
    expect(slot).toBeTruthy();
    acceptCarryOverSlot(carry.id, slot.blockId);
    expect(listActiveTasks().find((t) => t.id === carry.id)!.linkedStudyBlockId).toBe(slot.blockId);
  });
});
