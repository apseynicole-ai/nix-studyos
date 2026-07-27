import { beforeEach, describe, expect, it } from 'vitest';
import { installMemoryStorage } from '../testMemoryStorage';
import {
  ACTIVE_WEEK_ID,
  BOOTSTRAP_SOURCE_LABEL,
  SEMESTER2_ASSESSMENTS,
  SEMESTER2_MODULES,
  WEEK15_PLAN,
  WEEK15_SCHEDULED_ACTIVITIES,
  WEEK15_STUDY_BLOCKS,
} from './semester2';
import { bootstrapSemester2, isBootstrapped } from './bootstrap';
import {
  activityLogRepo,
  appStateRepo,
  assessmentsRepo,
  dataChangeAuditRepo,
  DEFAULT_APP_STATE,
  modulesRepo,
  scheduledActivitiesRepo,
  studyBlocksRepo,
  studySessionsRepo,
  tasksRepo,
  weeklyPlansRepo,
} from '../repositories';

beforeEach(() => installMemoryStorage());

describe('Semester 2 seed integrity', () => {
  it('has 9 active modules with unique ids', () => {
    expect(SEMESTER2_MODULES).toHaveLength(9);
    expect(new Set(SEMESTER2_MODULES.map((m) => m.id)).size).toBe(9);
    expect(SEMESTER2_MODULES.every((m) => m.active)).toBe(true);
  });

  it('references only known module ids from assessments/activities/blocks', () => {
    const ids = new Set(SEMESTER2_MODULES.map((m) => m.id));
    for (const a of SEMESTER2_ASSESSMENTS) expect(ids.has(a.moduleId)).toBe(true);
    for (const s of WEEK15_SCHEDULED_ACTIVITIES) expect(ids.has(s.moduleId)).toBe(true);
    for (const b of WEEK15_STUDY_BLOCKS) expect(ids.has(b.moduleId)).toBe(true);
  });

  it('reconciles the Week 15 total to 1320 minutes (22.0 h) three ways', () => {
    const blockTotal = WEEK15_STUDY_BLOCKS.reduce((s, b) => s + b.plannedMinutes, 0);
    const budgetTotal = Object.values(WEEK15_PLAN.perModuleBudgetMinutes).reduce((s, m) => s + m, 0);
    expect(blockTotal).toBe(1320);
    expect(budgetTotal).toBe(1320);
    expect(WEEK15_PLAN.totalPlannedMinutes).toBe(1320);
  });

  it('runs NO tutorials in Week 15 (tutorial lock)', () => {
    expect(WEEK15_SCHEDULED_ACTIVITIES.some((s) => s.type === 'tutorial')).toBe(false);
  });

  it('applies locked Daily-Completion weights (study block = 2; required contact = 1; optional = 0)', () => {
    expect(WEEK15_STUDY_BLOCKS.every((b) => b.weight === 2)).toBe(true);
    for (const s of WEEK15_SCHEDULED_ACTIVITIES) {
      expect(s.weight).toBe(s.type === 'optional' ? 0 : 1);
      expect(s.required).toBe(s.type !== 'optional');
    }
  });

  it('preserves TBC values as null / needs-verification (nothing invented)', () => {
    const dla152A3 = SEMESTER2_ASSESSMENTS.find((a) => a.id === 'dla152-A3')!;
    expect(dla152A3.date).toBeNull();
    expect(dla152A3.needsVerification).toBe(true);

    const lp = SEMESTER2_ASSESSMENTS.find((a) => a.id === 'sds188-LP-AF')!;
    expect(lp.needsVerification).toBe(true);
    expect(lp.notes).toMatch(/VERIFY COMPLETION/);
  });

  it('records the Law of Persons Study Unit 1 quiz window', () => {
    const quiz = SEMESTER2_ASSESSMENTS.find((a) => a.id === 'lawpersons144-SU1-quiz')!;
    expect(quiz.moduleId).toBe('lawpersons144');
    expect(quiz.date).toBe('2026-08-02');
    expect(quiz.timeNote).toMatch(/opens Mon 27 Jul 12:00/);
  });
});

describe('bootstrapSemester2', () => {
  it('seeds the reference layer with the expected counts', () => {
    const result = bootstrapSemester2();
    expect(result.modules).toBe(9);
    expect(result.assessments).toBe(SEMESTER2_ASSESSMENTS.length);
    expect(result.activeWeekId).toBe(ACTIVE_WEEK_ID);
    expect(modulesRepo.read()).toHaveLength(9);
    expect(assessmentsRepo.read()).toHaveLength(SEMESTER2_ASSESSMENTS.length);
    expect(scheduledActivitiesRepo.read()).toHaveLength(WEEK15_SCHEDULED_ACTIVITIES.length);
    expect(studyBlocksRepo.read()).toHaveLength(WEEK15_STUDY_BLOCKS.length);
    expect(weeklyPlansRepo.read()).toHaveLength(1);
  });

  it('is idempotent — running twice does not duplicate records', () => {
    bootstrapSemester2();
    bootstrapSemester2();
    expect(modulesRepo.read()).toHaveLength(9);
    expect(assessmentsRepo.read()).toHaveLength(SEMESTER2_ASSESSMENTS.length);
    expect(scheduledActivitiesRepo.read()).toHaveLength(WEEK15_SCHEDULED_ACTIVITIES.length);
  });

  it('records bootstrap source + active week in app state', () => {
    bootstrapSemester2();
    const state = appStateRepo.read(DEFAULT_APP_STATE);
    expect(state.bootstrapSource).toBe(BOOTSTRAP_SOURCE_LABEL);
    expect(state.currentWeekId).toBe(ACTIVE_WEEK_ID);
    expect(state.bootstrappedAt).not.toBeNull();
    expect(isBootstrapped()).toBe(true);
  });

  it('NEVER overwrites transactional data on (re-)seed', () => {
    studySessionsRepo.write([{ id: 'sess-1' } as never]);
    activityLogRepo.write([{ id: 'log-1' } as never]);
    tasksRepo.write([{ id: 'task-1' } as never]);
    dataChangeAuditRepo.write([{ id: 'audit-1' } as never]);

    bootstrapSemester2();
    bootstrapSemester2();

    expect(studySessionsRepo.read()).toEqual([{ id: 'sess-1' }]);
    expect(activityLogRepo.read()).toEqual([{ id: 'log-1' }]);
    expect(tasksRepo.read()).toEqual([{ id: 'task-1' }]);
    expect(dataChangeAuditRepo.read()).toEqual([{ id: 'audit-1' }]);
  });

  it('preserves a user-added reference record while updating seeded ones', () => {
    bootstrapSemester2();
    modulesRepo.upsert({ ...modulesRepo.getById('foundations178')!, defaultWeeklyMinutes: 999 });
    modulesRepo.upsert({ id: 'custom-mod', code: 'X', name: 'Custom', shortName: 'X', area: 'Personal', semester: 'S2', defaultWeeklyMinutes: 0, active: true, colour: '' });

    bootstrapSemester2(); // re-seed

    // seeded module reset to seed value, custom user module retained
    expect(modulesRepo.getById('foundations178')!.defaultWeeklyMinutes).toBe(225);
    expect(modulesRepo.getById('foundations178')!.target == null).toBe(true);
    expect(modulesRepo.getById('custom-mod')).toBeDefined();
    expect(modulesRepo.read()).toHaveLength(10);
  });
});
