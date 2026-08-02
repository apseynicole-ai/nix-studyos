import { beforeEach, describe, expect, it } from 'vitest';
import { installMemoryStorage } from './testMemoryStorage';
import { bootstrapSemester2 } from './seed/bootstrap';
import {
  SEMESTER2_MODULES,
  WEEK15_PLAN,
  WEEK15_SCHEDULED_ACTIVITIES,
  WEEK15_STUDY_BLOCKS,
} from './seed/semester2';
import { buildDailyObligations } from './dailyCompletion';
import { completeSession, followUpPriority, startSession, stopSession } from './session';
import { listActiveTasks } from './tasks';

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));

describe('Week 15 budget reconciliation (Part 1)', () => {
  it('for EVERY module, sum(block.plannedMinutes) === perModuleBudgetMinutes[module]', () => {
    const sums: Record<string, number> = {};
    for (const b of WEEK15_STUDY_BLOCKS) sums[b.moduleId] = (sums[b.moduleId] ?? 0) + b.plannedMinutes;
    for (const [moduleId, budget] of Object.entries(WEEK15_PLAN.perModuleBudgetMinutes)) {
      expect(sums[moduleId] ?? 0).toBe(budget);
    }
    expect(Object.values(sums).reduce((a, b) => a + b, 0)).toBe(1320);
  });

  it('no study block overlaps another block or a REQUIRED class on the same day', () => {
    // Optional activities (ToI Q&A / async drop-ins, weight 0) may overlap study by design.
    const byDay: Record<string, { start: number; end: number }[]> = {};
    for (const b of WEEK15_STUDY_BLOCKS) (byDay[b.date] ??= []).push({ start: toMin(b.startTime), end: toMin(b.endTime) });
    for (const a of WEEK15_SCHEDULED_ACTIVITIES) {
      if (!a.required || a.type === 'optional') continue;
      (byDay[a.date] ??= []).push({ start: toMin(a.startTime), end: toMin(a.endTime) });
    }
    for (const intervals of Object.values(byDay)) {
      const sorted = [...intervals].sort((x, y) => x.start - y.start);
      for (let i = 1; i < sorted.length; i++) expect(sorted[i].start).toBeGreaterThanOrEqual(sorted[i - 1].end);
    }
  });
});

describe('no unsourced target on S2 modules (Part 10)', () => {
  it('the seed assigns no numeric target to any module', () => {
    for (const m of SEMESTER2_MODULES) expect(m.target == null).toBe(true);
  });
});

describe('assessment / project milestone weight 3 (Part 6)', () => {
  beforeEach(() => { installMemoryStorage(); bootstrapSemester2(); });
  const SUN = '2026-08-02';

  it('an incomplete assessment due today surfaces as a weight-3 milestone', () => {
    const obs = buildDailyObligations(SUN);
    const milestone = obs.find((o) => o.id === 'milestone-lawpersons144-SU1-quiz');
    expect(milestone).toBeDefined();
    expect(milestone!.weight).toBe(3);
    expect(milestone!.state).toBe('NOT_STARTED');
  });

  it('completing the linked block earlier in the week dedups it (not counted again on the deadline day)', () => {
    // Take the Saturday quiz block → COMPLETED.
    const t0 = Date.parse('2026-08-01T14:30:00Z');
    startSession({ moduleId: 'lawpersons144', studyBlockId: 'sb-sat-lop-quiz' }, t0);
    stopSession(t0 + 55 * 60000);
    completeSession({ status: 'COMPLETED', location: 'Room', followUpRequired: false });

    const obs = buildDailyObligations(SUN);
    expect(obs.find((o) => o.id === 'milestone-lawpersons144-SU1-quiz')).toBeUndefined();
  });

  it('the linked Saturday block is counted on Saturday (weight 2), not double-counted', () => {
    const sat = buildDailyObligations('2026-08-01');
    expect(sat.find((o) => o.id === 'sb-sat-lop-quiz')?.weight).toBe(2);
    // no milestone on Saturday (assessment date is Sunday)
    expect(sat.find((o) => o.id.startsWith('milestone-'))).toBeUndefined();
  });
});

describe('follow-up P1 escalation (Part 7)', () => {
  beforeEach(() => { installMemoryStorage(); bootstrapSemester2(); });

  it('escalates to P1 when a module assessment is due within 48h; P2 otherwise', () => {
    // LoP quiz closes 2026-08-02 23:59 → a session on 08-01 is within 48h; 07-30 is not.
    expect(followUpPriority('lawpersons144', '2026-08-01')).toBe('P1');
    expect(followUpPriority('lawpersons144', '2026-07-30')).toBe('P2');
    // FinAcc next assessment is 2026-09-03 → far away.
    expect(followUpPriority('finacc178', '2026-07-28')).toBe('P2');
  });

  it('a study follow-up near a deadline is created as P1', () => {
    const t0 = Date.parse('2026-08-01T10:00:00Z');
    startSession({ moduleId: 'lawpersons144', studyBlockId: null, planned: false }, t0);
    stopSession(t0 + 30 * 60000);
    completeSession({ status: 'PARTIALLY_COMPLETED', location: 'Library', followUpRequired: true, followUpText: 'Finish SU1 revision before the quiz' });
    const task = listActiveTasks().find((x) => x.title.startsWith('Finish SU1'))!;
    expect(task.priority).toBe('P1');
    expect(task.plannedWeekId).toBe('2026-W15');
  });
});
