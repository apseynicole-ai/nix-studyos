import { describe, expect, it } from 'vitest';
import { buildWeeklyReviewActions, type WeeklyReviewInput } from './weeklyReview';

const calmMarksPressure: WeeklyReviewInput['marksPressure'] = {
  modulesBelowTarget: 0,
  modulesWithSnapshots: 1,
  hasAnyMarkData: true,
  mostAtRisk: null,
};

function input(overrides: Partial<WeeklyReviewInput> = {}): WeeklyReviewInput {
  return {
    overdueCount: 0,
    dueSoonCount: 0,
    missingMarksCount: 0,
    marksPressure: calmMarksPressure,
    mistakeRetests: 0,
    incompleteRuleCount: 0,
    provisionalCalendarEntries: [],
    backupAgeDays: 1,
    ...overrides,
  };
}

describe('weekly review action builder', () => {
  it('returns no actions when every signal is calm so Dashboard can render its calm fallback', () => {
    expect(buildWeeklyReviewActions(input())).toEqual([]);
  });

  it('prioritises overdue tasks as a red task action', () => {
    const actions = buildWeeklyReviewActions(input({ overdueCount: 2 }));

    expect(actions[0]).toMatchObject({
      title: 'Complete overdue tasks',
      to: '/tasks',
      tone: 'red',
    });
  });

  it('surfaces due-soon tasks when no stronger action exists', () => {
    const actions = buildWeeklyReviewActions(input({ dueSoonCount: 3 }));

    expect(actions).toEqual([
      expect.objectContaining({
        title: 'Finish due-soon tasks steadily',
        detail: '3 open tasks due within 7 days.',
        to: '/tasks',
        tone: 'emerald',
      }),
    ]);
  });

  it('surfaces missing or stale backup metadata', () => {
    expect(buildWeeklyReviewActions(input({ backupAgeDays: null }))).toContainEqual(
      expect.objectContaining({ title: 'Back up your StudyOS data', to: '/settings' }),
    );
    expect(buildWeeklyReviewActions(input({ backupAgeDays: 8 }))).toContainEqual(
      expect.objectContaining({ detail: 'Last backup was 8 days ago.' }),
    );
  });

  it('surfaces mistake correction-rule recovery actions', () => {
    const actions = buildWeeklyReviewActions(input({ incompleteRuleCount: 2 }));

    expect(actions).toContainEqual(
      expect.objectContaining({
        title: 'Add correction rules to repeated mistakes',
        detail: '2 unresolved mistakes need clear correction rules.',
        to: '/mistakes',
        tone: 'blue',
      }),
    );
  });

  it('surfaces provisional assessment verification actions deterministically', () => {
    const actions = buildWeeklyReviewActions(input({
      provisionalCalendarEntries: [
        { moduleCode: 'ECO114', assessmentId: 'A3' },
        { moduleCode: 'CON178', assessmentId: 'A2' },
      ],
    }));

    expect(actions).toContainEqual(
      expect.objectContaining({
        title: 'Verify provisional assessment details before the assessment',
        detail: 'ECO114 A3, CON178 A2',
        to: '/modules',
        tone: 'blue',
      }),
    );
  });

  it('caps action output at six deterministic items', () => {
    const actions = buildWeeklyReviewActions(input({
      overdueCount: 1,
      missingMarksCount: 1,
      mistakeRetests: 1,
      incompleteRuleCount: 1,
      provisionalCalendarEntries: [{ moduleCode: 'ECO114', assessmentId: 'A3' }],
      backupAgeDays: null,
    }));

    expect(actions).toHaveLength(6);
    expect(actions.map((action) => action.title)).toEqual([
      'Complete overdue tasks',
      'Add missing marks to activate pressure tracking',
      'Review mistakes due soon',
      'Add correction rules to repeated mistakes',
      'Verify provisional assessment details before the assessment',
      'Back up your StudyOS data',
    ]);
  });
});
