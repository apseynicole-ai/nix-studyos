import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  assessmentPrepTaskId,
  buildAssessmentPrepTasks,
  getAssessmentPrepProgress,
  mergeAssessmentPrepTasks,
  savePrepTasksToLocal,
} from './assessmentPrepTasks';
import type { AssessmentCalendarEntry } from '../data/assessmentCalendar';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return Array.from(this.values.keys())[index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true });
});
afterEach(() => {
  (globalThis.localStorage as MemoryStorage).clear();
});

function makeEntry(overrides: Partial<AssessmentCalendarEntry> = {}): AssessmentCalendarEntry {
  return {
    assessmentId: 'A2',
    moduleId: 'conlaw178',
    moduleCode: 'CON178',
    title: 'A1S2',
    date: '2026-10-01',
    time: '17:00',
    durationMinutes: 120,
    venue: 'TBC',
    source: 'manual',
    confidence: 'high',
    notes: '',
    ...overrides,
  };
}

describe('assessmentPrepTaskId', () => {
  it('produces a stable deterministic id', () => {
    expect(assessmentPrepTaskId('conlaw178', 'A2', '2026-10-01', 'start-revision'))
      .toBe('prep-conlaw178-A2-2026-10-01-start-revision');
  });
});

describe('buildAssessmentPrepTasks', () => {
  const TODAY = '2026-07-01';

  it('returns 3 tasks for a valid entry', () => {
    const tasks = buildAssessmentPrepTasks(makeEntry(), TODAY);
    expect(tasks).toHaveLength(3);
  });

  it('returns empty array for an invalid date', () => {
    expect(buildAssessmentPrepTasks(makeEntry({ date: 'not-a-date' }), TODAY)).toHaveLength(0);
    expect(buildAssessmentPrepTasks(makeEntry({ date: '2026-02-30' }), TODAY)).toHaveLength(0);
    expect(buildAssessmentPrepTasks(makeEntry({ date: '' }), TODAY)).toHaveLength(0);
  });

  it('calculates due dates as D-14, D-7, D-2 relative to exam date', () => {
    // Exam 2026-10-01: D-14 = 2026-09-17, D-7 = 2026-09-24, D-2 = 2026-09-29
    const tasks = buildAssessmentPrepTasks(makeEntry(), TODAY);
    expect(tasks[0].dueDate).toBe('2026-09-17');
    expect(tasks[1].dueDate).toBe('2026-09-24');
    expect(tasks[2].dueDate).toBe('2026-09-29');
  });

  it('clamps past due dates to today', () => {
    // Exam 2026-06-10 with today=2026-06-24: all calculated dates are past
    const tasks = buildAssessmentPrepTasks(makeEntry({ date: '2026-06-10' }), '2026-06-24');
    for (const task of tasks) {
      expect(task.dueDate).toBe('2026-06-24');
    }
  });

  it('handles month-boundary subtraction correctly', () => {
    // Exam 2026-03-05, D-7 = 2026-02-26; use a today before that date to avoid clamping
    const tasks = buildAssessmentPrepTasks(makeEntry({ date: '2026-03-05' }), '2026-01-01');
    expect(tasks[1].dueDate).toBe('2026-02-26');
  });

  it('uses stable IDs derived from moduleId, assessmentId, date, and type', () => {
    const tasks = buildAssessmentPrepTasks(makeEntry(), TODAY);
    expect(tasks[0].id).toBe('prep-conlaw178-A2-2026-10-01-start-revision');
    expect(tasks[1].id).toBe('prep-conlaw178-A2-2026-10-01-practice-questions');
    expect(tasks[2].id).toBe('prep-conlaw178-A2-2026-10-01-final-review');
  });

  it('sets correct task types and priorities', () => {
    const tasks = buildAssessmentPrepTasks(makeEntry(), TODAY);
    expect(tasks[0].type).toBe('Revision');
    expect(tasks[1].type).toBe('Practice');
    expect(tasks[2].type).toBe('Revision');
    for (const task of tasks) {
      expect(task.priority).toBe('High');
      expect(task.done).toBe(false);
      expect(task.completedAt).toBeNull();
    }
  });

  it('includes the assessment date in the why field', () => {
    const tasks = buildAssessmentPrepTasks(makeEntry(), TODAY);
    for (const task of tasks) {
      expect(task.why).toContain('2026-10-01');
    }
  });

  it('omits empty time/venue from why field', () => {
    const tasks = buildAssessmentPrepTasks(makeEntry({ time: '', venue: '' }), TODAY);
    expect(tasks[0].why).toBe('Generated from assessment calendar: 2026-10-01');
  });

  it('sets moduleId and userId from entry and parameter', () => {
    const tasks = buildAssessmentPrepTasks(makeEntry(), TODAY, 'user-abc');
    for (const task of tasks) {
      expect(task.moduleId).toBe('conlaw178');
      expect(task.userId).toBe('user-abc');
    }
  });
});

describe('mergeAssessmentPrepTasks', () => {
  const TODAY = '2026-07-01';

  it('returns added=3 and skipped=0 when no existing tasks', () => {
    const generated = buildAssessmentPrepTasks(makeEntry(), TODAY);
    const result = mergeAssessmentPrepTasks([], generated);
    expect(result.added).toBe(3);
    expect(result.skipped).toBe(0);
  });

  it('returns added=0 and skipped=3 when all tasks already exist', () => {
    const generated = buildAssessmentPrepTasks(makeEntry(), TODAY);
    const result = mergeAssessmentPrepTasks(generated, generated);
    expect(result.added).toBe(0);
    expect(result.skipped).toBe(3);
  });

  it('counts partial duplicates correctly', () => {
    const generated = buildAssessmentPrepTasks(makeEntry(), TODAY);
    const result = mergeAssessmentPrepTasks([{ id: generated[0].id }], generated);
    expect(result.added).toBe(2);
    expect(result.skipped).toBe(1);
  });
});

describe('savePrepTasksToLocal', () => {
  const TODAY = '2026-07-01';

  it('writes tasks to localStorage and returns correct counts', () => {
    const generated = buildAssessmentPrepTasks(makeEntry(), TODAY);
    const result = savePrepTasksToLocal(generated);
    expect(result.added).toBe(3);
    expect(result.skipped).toBe(0);
    const stored = JSON.parse(localStorage.getItem('baccllb-tasks') || '[]');
    expect(stored).toHaveLength(3);
  });

  it('does not duplicate tasks when called twice', () => {
    const generated = buildAssessmentPrepTasks(makeEntry(), TODAY);
    savePrepTasksToLocal(generated);
    const result2 = savePrepTasksToLocal(generated);
    expect(result2.added).toBe(0);
    expect(result2.skipped).toBe(3);
    const stored = JSON.parse(localStorage.getItem('baccllb-tasks') || '[]');
    expect(stored).toHaveLength(3);
  });

  it('appends to existing tasks without overwriting them', () => {
    const existing = [{ id: 'task-existing', text: 'Keep me', done: false }];
    localStorage.setItem('baccllb-tasks', JSON.stringify(existing));
    const generated = buildAssessmentPrepTasks(makeEntry(), TODAY);
    savePrepTasksToLocal(generated);
    const stored = JSON.parse(localStorage.getItem('baccllb-tasks') || '[]');
    expect(stored).toHaveLength(4);
    expect(stored[0].id).toBe('task-existing');
  });

  it('does not write to localStorage when all tasks already exist', () => {
    const generated = buildAssessmentPrepTasks(makeEntry(), TODAY);
    savePrepTasksToLocal(generated);
    const snapshot = localStorage.getItem('baccllb-tasks');
    savePrepTasksToLocal(generated);
    expect(localStorage.getItem('baccllb-tasks')).toBe(snapshot);
  });
});

describe('getAssessmentPrepProgress', () => {
  const TODAY = '2026-07-01';

  function prepIds(entry = makeEntry()): string[] {
    return [
      assessmentPrepTaskId(entry.moduleId, entry.assessmentId, entry.date, 'start-revision'),
      assessmentPrepTaskId(entry.moduleId, entry.assessmentId, entry.date, 'practice-questions'),
      assessmentPrepTaskId(entry.moduleId, entry.assessmentId, entry.date, 'final-review'),
    ];
  }

  it('returns 0 existing, 0 completed, missingCount=3 when no tasks exist', () => {
    const result = getAssessmentPrepProgress(makeEntry(), []);
    expect(result.totalExpected).toBe(3);
    expect(result.existingCount).toBe(0);
    expect(result.completedCount).toBe(0);
    expect(result.missingCount).toBe(3);
    expect(result.allExist).toBe(false);
    expect(result.allComplete).toBe(false);
  });

  it('counts 1 existing when only the first task is present', () => {
    const ids = prepIds();
    const tasks = [{ id: ids[0], done: false }];
    const result = getAssessmentPrepProgress(makeEntry(), tasks);
    expect(result.existingCount).toBe(1);
    expect(result.missingCount).toBe(2);
    expect(result.allExist).toBe(false);
  });

  it('returns allExist=true and allComplete=false when all 3 exist but none done', () => {
    const tasks = prepIds().map((id) => ({ id, done: false }));
    const result = getAssessmentPrepProgress(makeEntry(), tasks);
    expect(result.existingCount).toBe(3);
    expect(result.allExist).toBe(true);
    expect(result.completedCount).toBe(0);
    expect(result.allComplete).toBe(false);
  });

  it('counts completed tasks correctly when some are done', () => {
    const ids = prepIds();
    const tasks = [
      { id: ids[0], done: true },
      { id: ids[1], done: false },
      { id: ids[2], done: true },
    ];
    const result = getAssessmentPrepProgress(makeEntry(), tasks);
    expect(result.completedCount).toBe(2);
    expect(result.allComplete).toBe(false);
  });

  it('returns allComplete=true when all 3 tasks are done', () => {
    const tasks = prepIds().map((id) => ({ id, done: true }));
    const result = getAssessmentPrepProgress(makeEntry(), tasks);
    expect(result.allComplete).toBe(true);
    expect(result.completedCount).toBe(3);
  });

  it('ignores unrelated tasks entirely', () => {
    const unrelated = [
      { id: 'some-other-task', done: true },
      { id: 'prep-differentmodule-A2-2026-10-01-start-revision', done: true },
    ];
    const result = getAssessmentPrepProgress(makeEntry(), unrelated);
    expect(result.existingCount).toBe(0);
    expect(result.completedCount).toBe(0);
  });

  it('taskIds match the generated prep task IDs exactly', () => {
    const generated = buildAssessmentPrepTasks(makeEntry(), TODAY);
    const result = getAssessmentPrepProgress(makeEntry(), generated);
    expect(result.taskIds).toEqual(generated.map((t) => t.id));
    expect(result.existingCount).toBe(3);
  });

  it('returns safe defaults for an invalid assessment date without crashing', () => {
    const result = getAssessmentPrepProgress(makeEntry({ date: 'bad-date' }), []);
    expect(result.existingCount).toBe(0);
    expect(result.taskIds).toHaveLength(0);
    expect(result.allExist).toBe(false);
    expect(result.allComplete).toBe(false);
  });

  it('missing tasks can be generated without duplicating the existing one', () => {
    const entry = makeEntry();
    const firstOnly = buildAssessmentPrepTasks(entry, TODAY).slice(0, 1);
    localStorage.setItem('baccllb-tasks', JSON.stringify(firstOnly));

    const progress = getAssessmentPrepProgress(entry, firstOnly);
    expect(progress.existingCount).toBe(1);
    expect(progress.missingCount).toBe(2);

    const allTasks = buildAssessmentPrepTasks(entry, TODAY);
    const saveResult = savePrepTasksToLocal(allTasks);
    expect(saveResult.added).toBe(2);
    expect(saveResult.skipped).toBe(1);
  });
});
