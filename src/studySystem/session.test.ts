import { beforeEach, describe, expect, it } from 'vitest';
import { installMemoryStorage } from './testMemoryStorage';
import {
  SessionConflictError,
  cancelActiveSession,
  completeSession,
  discardPendingSession,
  elapsedSeconds,
  getActiveSession,
  getPendingSession,
  getSessionForBlock,
  logUnplannedActivity,
  startSession,
  stopSession,
  totalActualMinutesForDate,
} from './session';
import { studySessionsRepo, tasksRepo } from './repositories';

const T0 = Date.parse('2026-07-27T13:00:00.000Z');

beforeEach(() => installMemoryStorage());

describe('count-up session timer (persistence + safety)', () => {
  it('derives elapsed time from the persisted start timestamp (survives refresh)', () => {
    startSession({ moduleId: 'finacc178', studyBlockId: 'sb-tue-finacc' }, T0);
    // "reopen": a fresh read of the persisted active session, 25 min later.
    const active = getActiveSession()!;
    expect(active.planned).toBe(true);
    expect(Math.round(elapsedSeconds(active, T0 + 25 * 60000))).toBe(1500);
  });

  it('blocks a second concurrent START (single active session across modules)', () => {
    startSession({ moduleId: 'finacc178' }, T0);
    expect(() => startSession({ moduleId: 'conlaw178' }, T0 + 1000)).toThrow(SessionConflictError);
  });

  it('stores EXACT minutes on stop (not 5-minute rounded)', () => {
    startSession({ moduleId: 'finacc178', studyBlockId: 'sb-tue-finacc' }, T0);
    const pending = stopSession(T0 + 67 * 60000)!; // 67 exact minutes
    expect(pending.exactMinutes).toBe(67);
    expect(getActiveSession()).toBeNull();
    expect(getPendingSession()).not.toBeNull();
  });

  it('completes a stopped session into the study-sessions store with all post-session fields', () => {
    startSession({ moduleId: 'finacc178', studyBlockId: 'sb-tue-finacc' }, T0);
    stopSession(T0 + 67 * 60000);
    const session = completeSession({
      status: 'PARTIALLY_COMPLETED',
      location: 'Library',
      output: 'Q1–Q3 attempted',
      followUpRequired: true,
      followUpText: 'Redo Q4',
    })!;

    expect(session.exactMinutes).toBe(67);
    expect(session.status).toBe('PARTIALLY_COMPLETED');
    expect(session.location).toBe('Library');
    expect(session.date).toBe('2026-07-27');
    expect(getPendingSession()).toBeNull();
    expect(studySessionsRepo.read()).toHaveLength(1);
    expect(getSessionForBlock('sb-tue-finacc')!.id).toBe(session.id);
  });

  it('creates a MUST DO / P2 follow-up task from an incomplete session (spec §3/§15.5)', () => {
    startSession({ moduleId: 'finacc178', studyBlockId: 'sb-tue-finacc' }, T0);
    stopSession(T0 + 40 * 60000);
    completeSession({ status: 'PARTIALLY_COMPLETED', location: 'Library', followUpRequired: true, followUpText: 'Redo Q4' });

    const tasks = tasksRepo.read();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].category).toBe('MUST_DO');
    expect(tasks[0].priority).toBe('P2');
    expect(tasks[0].source).toBe('study_followup');
    expect(tasks[0].linkedStudyBlockId).toBe('sb-tue-finacc');
    expect(tasks[0].title).toBe('Redo Q4');
  });

  it('does not create a task when no follow-up is required', () => {
    startSession({ moduleId: 'finacc178' }, T0);
    stopSession(T0 + 30 * 60000);
    completeSession({ status: 'COMPLETED', location: 'Room', followUpRequired: false });
    expect(tasksRepo.read()).toHaveLength(0);
  });

  it('cancel/discard leave no session behind', () => {
    startSession({ moduleId: 'finacc178' }, T0);
    cancelActiveSession();
    expect(getActiveSession()).toBeNull();

    startSession({ moduleId: 'finacc178' }, T0 + 1000);
    stopSession(T0 + 2000);
    discardPendingSession();
    expect(getPendingSession()).toBeNull();
    expect(studySessionsRepo.read()).toHaveLength(0);
  });
});

describe('unplanned activity (+ LOG ACTIVITY, spec §4)', () => {
  it('records unplanned study that counts toward time without touching a planned block', () => {
    const session = logUnplannedActivity(
      { moduleId: 'conlaw178', minutes: 40, status: 'COMPLETED', location: 'Coffee shop', output: '2 case notes' },
      T0,
    );
    expect(session.planned).toBe(false);
    expect(session.studyBlockId).toBeNull();
    expect(session.source).toBe('unplanned');
    expect(session.exactMinutes).toBe(40);
    expect(totalActualMinutesForDate('2026-07-27')).toBe(40);
  });

  it('can spawn a follow-up task from unplanned study too', () => {
    logUnplannedActivity({ moduleId: 'conlaw178', minutes: 20, status: 'PARTIALLY_COMPLETED', location: 'Library', followUpRequired: true, followUpText: 'Finish SANDU notes' }, T0);
    expect(tasksRepo.read()).toHaveLength(1);
    expect(tasksRepo.read()[0].source).toBe('study_followup');
  });
});
