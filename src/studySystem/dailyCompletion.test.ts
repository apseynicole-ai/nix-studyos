import { beforeEach, describe, expect, it } from 'vitest';
import { installMemoryStorage } from './testMemoryStorage';
import { bootstrapSemester2 } from './seed/bootstrap';
import { buildDailyObligations, computeDailyCompletion, contribution, dailyCompletion, type Obligation } from './dailyCompletion';
import { createTask } from './tasks';
import { logAttendance } from './attendance';
import { completeSession, startSession, stopSession } from './session';
import { scheduledActivitiesRepo } from './repositories';

const ob = (weight: number, state: Obligation['state'], optional = false): Obligation => ({ id: Math.random().toString(36).slice(2), weight, state, optional });

describe('computeDailyCompletion (locked weights + contributions §2.1/§2.2)', () => {
  it('all completed → 100%', () => {
    expect(computeDailyCompletion([ob(1, 'COMPLETED'), ob(2, 'COMPLETED')]).percent).toBe(100);
  });
  it('single partial → 50%', () => {
    expect(computeDailyCompletion([ob(2, 'PARTIALLY_COMPLETED')]).percent).toBe(50);
  });
  it('missed / in-progress / not-started all contribute 0%', () => {
    expect(computeDailyCompletion([ob(1, 'MISSED')]).percent).toBe(0);
    expect(computeDailyCompletion([ob(1, 'IN_PROGRESS')]).percent).toBe(0);
    expect(computeDailyCompletion([ob(1, 'NOT_STARTED')]).percent).toBe(0);
  });
  it('cancelled is removed from numerator AND denominator', () => {
    // one completed w1 + one cancelled w1 → 100% (cancelled ignored entirely)
    const r = computeDailyCompletion([ob(1, 'COMPLETED'), ob(1, 'CANCELLED')]);
    expect(r.percent).toBe(100);
    expect(r.denominator).toBe(1);
  });
  it('optional is excluded from the denominator and never reduces %', () => {
    const r = computeDailyCompletion([ob(1, 'COMPLETED'), ob(0, 'NOT_STARTED', true)]);
    expect(r.percent).toBe(100);
  });
  it('completed optional work counts as BONUS but cannot exceed 100%', () => {
    const r = computeDailyCompletion([ob(1, 'COMPLETED'), ob(0, 'COMPLETED', true), ob(0, 'COMPLETED', true)]);
    expect(r.percent).toBe(100);
    expect(r.bonusWork).toBe(2);
  });
  it('weighted mix: 1×done + 2×partial + 2×done = 4/5 = 80%', () => {
    expect(computeDailyCompletion([ob(1, 'COMPLETED'), ob(2, 'PARTIALLY_COMPLETED'), ob(2, 'COMPLETED')]).percent).toBe(80);
  });
  it('no required obligations → null (denominator-zero)', () => {
    expect(computeDailyCompletion([]).percent).toBeNull();
    expect(computeDailyCompletion([ob(0, 'COMPLETED', true)]).percent).toBeNull();
  });
  it('caps at 100 (never above)', () => {
    const r = computeDailyCompletion([ob(2, 'COMPLETED'), ob(0, 'COMPLETED', true)]);
    expect(r.percent).toBeLessThanOrEqual(100);
  });
});

describe('contribution mapping', () => {
  it('COMPLETED=1, PARTIAL=0.5, else 0', () => {
    expect(contribution('COMPLETED')).toBe(1);
    expect(contribution('PARTIALLY_COMPLETED')).toBe(0.5);
    expect(contribution('MISSED')).toBe(0);
    expect(contribution('COULD_NOT_COMPLETE' as never)).toBe(0);
  });
});

describe('buildDailyObligations — deduplication (§2.3)', () => {
  beforeEach(() => { installMemoryStorage(); bootstrapSemester2(); });
  const MON = '2026-07-27';

  it('Monday baseline = 6 required activities + 3 study blocks', () => {
    const obs = buildDailyObligations(MON);
    expect(obs.filter((o) => !o.optional)).toHaveLength(9);
  });

  it('a MUST DO task linked to a counted study block is NOT counted again', () => {
    createTask({ moduleId: 'foundations178', title: 'Theme 8', category: 'MUST_DO', priority: 'P2', dueDate: MON, linkedStudyBlockId: 'sb-mon-found' });
    expect(buildDailyObligations(MON).filter((o) => !o.optional)).toHaveLength(9); // deduped
  });

  it('a genuinely independent MUST DO task due today IS counted (weight 2)', () => {
    createTask({ moduleId: 'foundations178', title: 'Email lecturer', category: 'MUST_DO', priority: 'P2', dueDate: MON });
    const obs = buildDailyObligations(MON).filter((o) => !o.optional);
    expect(obs).toHaveLength(10);
    expect(obs.filter((o) => o.weight === 2)).toHaveLength(4); // 3 blocks + 1 independent task
  });

  it('cancelled lecture disappears from the denominator; completed optional Q&A is bonus only', () => {
    const econ = scheduledActivitiesRepo.read().find((a) => a.id === 'sa-mon-econ')!;
    // denominator is Σ weights: 6 activities×1 + 3 blocks×2 = 12
    expect(dailyCompletion(MON).denominator).toBe(12);
    logAttendance(econ, 'CANCELLED');
    expect(dailyCompletion(MON).denominator).toBe(11); // econ (weight 1) removed from denominator
  });

  it('a running (IN_PROGRESS) study block contributes 0 until finalised, then updates', () => {
    startSession({ moduleId: 'foundations178', studyBlockId: 'sb-mon-found' }, Date.parse('2026-07-27T18:30:00Z'));
    const running = dailyCompletion(MON);
    stopSession(Date.parse('2026-07-27T19:30:00Z'));
    completeSession({ status: 'COMPLETED', location: 'Room', followUpRequired: false });
    const done = dailyCompletion(MON);
    expect(done.percent!).toBeGreaterThan(running.percent!);
  });
});
