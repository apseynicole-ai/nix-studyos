import { beforeEach, describe, expect, it } from 'vitest';
import { installMemoryStorage } from './testMemoryStorage';
import { bootstrapSemester2 } from './seed/bootstrap';
import { combineWeekly, computeModuleWeekly, currentWeekPlan } from './moduleWeekly';
import { resolveStatus, moduleStatus, type StatusInputs } from './moduleStatus';
import { timeCompletion } from './studyTime';
import { createTask } from './tasks';
import { completeSession, startSession, stopSession, logUnplannedActivity } from './session';

const base: StatusInputs = {
  pacePercent: 85,
  hasEvidence: true,
  hasP1Backlog: false,
  hasOverdueMustDo: false,
  hasMeaningfulP2Backlog: false,
  missedCompulsory: false,
};

describe('Module Weekly Completion formula (§10 / §15.3)', () => {
  it('locked worked example: 0.70×80 + 0.30×75 = 78.5', () => {
    expect(combineWeekly(80, 75)).toBe(78.5);
  });
});

describe('private-study time completion (§4.2)', () => {
  it('actual/planned, capped at 100; extra time cannot exceed 100', () => {
    expect(timeCompletion(90, 180).percent).toBe(50);
    expect(timeCompletion(210, 180).percent).toBe(100);
    expect(timeCompletion(180, 180).percent).toBe(100);
  });
  it('no planned time → 100 if any actual, else null', () => {
    expect(timeCompletion(30, 0).percent).toBe(100);
    expect(timeCompletion(0, 0).percent).toBeNull();
  });
});

describe('module status = pace-to-date + overrides (§5 / §5.1 · V1.0.1)', () => {
  it('clean ≥80 pace → ON TRACK', () => {
    expect(resolveStatus(base)).toBe('ON_TRACK');
  });
  it('nothing due yet (pace null) + evidence → ON TRACK (no false BEHIND from future work)', () => {
    expect(resolveStatus({ ...base, pacePercent: null })).toBe('ON_TRACK');
  });
  it('90% pace + P1 backlog → BEHIND (override wins)', () => {
    expect(resolveStatus({ ...base, pacePercent: 90, hasP1Backlog: true })).toBe('BEHIND');
  });
  it('92% pace + missed compulsory requirement → BEHIND', () => {
    expect(resolveStatus({ ...base, pacePercent: 92, missedCompulsory: true })).toBe('BEHIND');
  });
  it('85% pace + overdue MUST DO → at least AT RISK', () => {
    expect(resolveStatus({ ...base, hasOverdueMustDo: true })).toBe('AT_RISK');
  });
  it('85% pace + meaningful P2 backlog → at least AT RISK', () => {
    expect(resolveStatus({ ...base, hasMeaningfulP2Backlog: true })).toBe('AT_RISK');
  });
  it('behind-to-date bands: 60 → AT RISK, 40 → BEHIND', () => {
    expect(resolveStatus({ ...base, pacePercent: 60 })).toBe('AT_RISK');
    expect(resolveStatus({ ...base, pacePercent: 40 })).toBe('BEHIND');
  });
  it('no evidence at all → BASELINE UNKNOWN', () => {
    expect(resolveStatus({ ...base, hasEvidence: false })).toBe('BASELINE_UNKNOWN');
  });
});

describe('computeModuleWeekly (integration on the seeded week)', () => {
  beforeEach(() => { installMemoryStorage(); bootstrapSemester2(); });

  it('no work logged → component A 0, time 0, completion 0, with evidence (blocks exist)', () => {
    const plan = currentWeekPlan()!;
    const r = computeModuleWeekly('finacc178', plan);
    expect(r.obligationCount).toBeGreaterThan(0);
    expect(r.taskActivityPercent).toBe(0);
    expect(r.timePercent).toBe(0);
    expect(r.completion).toBe(0);
  });

  it('completing all module blocks + meeting time → 100; time component capped at 100', () => {
    const plan = currentWeekPlan()!;
    for (const [blockId, day] of [['sb-tue-finacc', '2026-07-28'], ['sb-wed-finacc', '2026-07-29'], ['sb-sat-finacc', '2026-08-01']] as const) {
      const t0 = Date.parse(`${day}T09:00:00Z`);
      startSession({ moduleId: 'finacc178', studyBlockId: blockId }, t0);
      stopSession(t0 + 90 * 60000);
      completeSession({ status: 'COMPLETED', location: 'Library', followUpRequired: false });
    }
    const r = computeModuleWeekly('finacc178', plan);
    expect(r.taskActivityPercent).toBe(100);
    expect(r.timePercent).toBe(100);
    expect(r.completion).toBe(100);
  });

  it('a linked task is deduped from the obligation but STILL shows in the display count (Part 8)', () => {
    const plan = currentWeekPlan()!;
    const before = computeModuleWeekly('finacc178', plan).obligationCount;
    createTask({ moduleId: 'finacc178', title: 'linked', category: 'MUST_DO', priority: 'P2', linkedStudyBlockId: 'sb-tue-finacc' });
    const r = computeModuleWeekly('finacc178', plan);
    expect(r.obligationCount).toBe(before); // not counted as a separate obligation
    expect(r.tasksTotal).toBe(1);           // but visible in x/y
  });

  it('an independent current-week task adds an obligation; a future task does not (Part 3)', () => {
    const plan = currentWeekPlan()!;
    const before = computeModuleWeekly('finacc178', plan).obligationCount;
    createTask({ moduleId: 'finacc178', title: 'future', category: 'MUST_DO', priority: 'P2', dueDate: '2026-09-01' });
    expect(computeModuleWeekly('finacc178', plan).obligationCount).toBe(before); // future excluded

    createTask({ moduleId: 'finacc178', title: 'this week', category: 'MUST_DO', priority: 'P2', dueDate: '2026-07-30' });
    expect(computeModuleWeekly('finacc178', plan).obligationCount).toBe(before + 1);
  });

  it('unplanned study raises the module time component', () => {
    const plan = currentWeekPlan()!;
    logUnplannedActivity({ moduleId: 'finacc178', minutes: 90, status: 'COMPLETED', location: 'Library' }, Date.parse('2026-07-28T20:00:00Z'));
    const r = computeModuleWeekly('finacc178', plan);
    expect(r.actualMinutes).toBe(90);
    expect(r.timePercent).toBe(50);
  });

  it('compulsory action (Stats Thu practical) enters component A via attendance (Part 2)', async () => {
    const plan = currentWeekPlan()!;
    const { scheduledActivitiesRepo } = await import('./repositories');
    const { logAttendance } = await import('./attendance');
    const before = computeModuleWeekly('sds188', plan).obligationCount;
    const prac = scheduledActivitiesRepo.read().find((a) => a.id === 'sa-thu-stats-prac')!;
    expect(prac.type).toBe('practical');
    logAttendance(prac, 'ATTENDED');
    // obligation count unchanged (the practical was always an obligation), but it now contributes.
    const r = computeModuleWeekly('sds188', plan);
    expect(r.obligationCount).toBe(before);
    expect(r.taskActivityPercent!).toBeGreaterThan(0);
  });

  it('Monday future work does NOT make a module BEHIND (pace-to-date, Part 4)', () => {
    const plan = currentWeekPlan()!;
    const mondayNoon = Date.parse('2026-07-27T12:00:00');
    // FinAcc has no obligation due by Monday noon → on pace.
    expect(moduleStatus('finacc178', plan, '2026-07-27', mondayNoon).status).toBe('ON_TRACK');
  });

  it('genuinely behind-to-date → BEHIND', () => {
    const plan = currentWeekPlan()!;
    // By Sunday night, all FinAcc blocks are past and none were done → 0% pace → BEHIND.
    const sundayNight = Date.parse('2026-08-02T22:00:00');
    expect(moduleStatus('finacc178', plan, '2026-08-02', sundayNight).status).toBe('BEHIND');
  });

  it('P1 backlog forces BEHIND even when otherwise on pace (end-to-end)', () => {
    const plan = currentWeekPlan()!;
    createTask({ moduleId: 'finacc178', title: 'urgent', category: 'MUST_DO', priority: 'P1', dueDate: '2026-07-30' });
    expect(moduleStatus('finacc178', plan, '2026-07-27', Date.parse('2026-07-27T12:00:00')).status).toBe('BEHIND');
  });
});
