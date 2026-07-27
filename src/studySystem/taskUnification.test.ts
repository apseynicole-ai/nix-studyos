import { beforeEach, describe, expect, it } from 'vitest';
import { installMemoryStorage } from './testMemoryStorage';
import { LOCAL_TASKS_KEY } from '../lib/localData';
import { listActiveTasks, listArchivedTasks, migrateLegacyTasks } from './tasks';
import { completeSession, startSession, stopSession } from './session';

beforeEach(() => installMemoryStorage());

describe('one active task system', () => {
  it('a study follow-up appears in the ACTIVE task list immediately', () => {
    const t0 = Date.parse('2026-07-27T13:00:00Z');
    startSession({ moduleId: 'finacc178', studyBlockId: 'sb-tue-finacc' }, t0);
    stopSession(t0 + 40 * 60000);
    completeSession({ status: 'PARTIALLY_COMPLETED', location: 'Library', followUpRequired: true, followUpText: 'Redo Q4b' });

    const active = listActiveTasks();
    expect(active).toHaveLength(1);
    expect(active[0].title).toBe('Redo Q4b');
    expect(active[0].source).toBe('study_followup');
    expect(active[0].category).toBe('MUST_DO');
    expect(active[0].priority).toBe('P2');
    expect(listArchivedTasks()).toHaveLength(0);
  });

  it('migrated legacy S1 tasks are archived, not mixed into the active S2 list', () => {
    localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify([
      { id: 'l1', text: 'S1 task', moduleId: 'econ114', priority: 'High', done: false, createdAt: '2026-05-01T00:00:00Z' },
    ]));
    migrateLegacyTasks();
    expect(listActiveTasks()).toHaveLength(0);
    expect(listArchivedTasks()).toHaveLength(1);
    expect(listArchivedTasks()[0].source).toBe('legacy_migration');
    // legacy store preserved
    expect(localStorage.getItem(LOCAL_TASKS_KEY)).not.toBeNull();
  });
});
