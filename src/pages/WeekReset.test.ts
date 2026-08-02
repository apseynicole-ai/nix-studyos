import { beforeEach, describe, expect, it } from 'vitest';
import { studyBlocksRepo } from '../studySystem/repositories';
import { installMemoryStorage } from '../studySystem/testMemoryStorage';
import type { StudyBlock, VerificationItem, WeeklyPlan } from '../studySystem/types';
import { detectCurrentPlanConflicts, selectCurrentWeekVerificationItems } from './WeekReset';

const CURRENT_PLAN: WeeklyPlan = {
  id: '2026-W16',
  weekStart: '2026-08-03',
  weekEnd: '2026-08-09',
  objective: 'Current week',
  perModuleBudgetMinutes: {},
  totalPlannedMinutes: 0,
  frozen: false,
};

const verificationItem = (id: string, weekId: string, overrides: Partial<VerificationItem> = {}): VerificationItem => ({
  id,
  weekId,
  kind: 'tutorial_tbc',
  title: id,
  status: 'open',
  createdAt: '2026-08-02T00:00:00.000Z',
  ...overrides,
});

const studyBlock = (id: string, date: string, startTime: string, endTime: string): StudyBlock => ({
  id,
  moduleId: 'finacc178',
  date,
  startTime,
  endTime,
  plannedMinutes: 60,
  taskText: id,
  weight: 2,
  isIndependentObligation: false,
});

beforeEach(() => installMemoryStorage());

describe('Week page current-plan alerts', () => {
  it('selects only open, non-content verification items from the current week', () => {
    const current = verificationItem('current', CURRENT_PLAN.id);
    const next = verificationItem('next', '2026-W17');
    const content = verificationItem('content', CURRENT_PLAN.id, { kind: 'content_tbc' });
    const resolved = verificationItem('resolved', CURRENT_PLAN.id, { status: 'resolved' });

    expect(selectCurrentWeekVerificationItems([current, next, content, resolved], CURRENT_PLAN.id)).toEqual([current]);
  });

  it('detects conflicts only inside the current plan date range', () => {
    studyBlocksRepo.write([
      studyBlock('current-a', '2026-08-04', '10:00', '11:00'),
      studyBlock('current-b', '2026-08-04', '10:30', '11:30'),
      studyBlock('next-a', '2026-08-11', '10:00', '11:00'),
      studyBlock('next-b', '2026-08-11', '10:30', '11:30'),
    ]);

    expect(detectCurrentPlanConflicts(CURRENT_PLAN)).toMatchObject([
      { weekId: CURRENT_PLAN.id, date: '2026-08-04' },
    ]);
    expect(detectCurrentPlanConflicts(undefined)).toEqual([]);
  });
});
