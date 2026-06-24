import { describe, expect, it } from 'vitest';
import { buildStudyQueue, type StudyQueueTaskInput } from './studyQueue';

const TODAY = '2026-06-24';

function task(overrides: Partial<StudyQueueTaskInput> = {}): StudyQueueTaskInput {
  return {
    id: overrides.text || overrides.title || 'task',
    text: 'Read cases',
    done: false,
    moduleId: 'conlaw178',
    priority: 'Medium',
    type: 'Study',
    category: 'Constitutional Law',
    dueDate: TODAY,
    ...overrides,
  };
}

describe('buildStudyQueue', () => {
  it('excludes completed tasks', () => {
    const queue = buildStudyQueue([
      task({ id: 'done', text: 'Done task', done: true }),
      task({ id: 'completed', text: 'Completed task', completedAt: '2026-06-24T10:00:00.000Z' }),
      task({ id: 'open', text: 'Open task' }),
    ], TODAY);

    expect(queue.today.map((item) => item.id)).toEqual(['open']);
  });

  it('ignores tasks without due dates', () => {
    const queue = buildStudyQueue([
      task({ id: 'no-date', dueDate: null }),
      task({ id: 'empty-date', dueDate: '' }),
      task({ id: 'today' }),
    ], TODAY);

    expect(queue.totalVisible).toBe(1);
    expect(queue.today[0].id).toBe('today');
  });

  it('ignores invalid due dates safely', () => {
    const queue = buildStudyQueue([
      task({ id: 'bad-string', dueDate: 'not-a-date' }),
      task({ id: 'bad-calendar-date', dueDate: '2026-02-30' }),
      task({ id: 'today' }),
    ], TODAY);

    expect(queue.totalVisible).toBe(1);
    expect(queue.today[0].id).toBe('today');
  });

  it('groups overdue tasks correctly', () => {
    const queue = buildStudyQueue([
      task({ id: 'overdue', dueDate: '2026-06-23' }),
      task({ id: 'today', dueDate: TODAY }),
    ], TODAY);

    expect(queue.overdue.map((item) => item.id)).toEqual(['overdue']);
    expect(queue.today.map((item) => item.id)).toEqual(['today']);
  });

  it('groups today tasks correctly', () => {
    const queue = buildStudyQueue([
      task({ id: 'today-a', dueDate: TODAY }),
      task({ id: 'tomorrow', dueDate: '2026-06-25' }),
    ], TODAY);

    expect(queue.today.map((item) => item.id)).toEqual(['today-a']);
    expect(queue.thisWeek.map((item) => item.id)).toEqual(['tomorrow']);
  });

  it('groups this-week tasks correctly', () => {
    const queue = buildStudyQueue([
      task({ id: 'tomorrow', dueDate: '2026-06-25' }),
      task({ id: 'week-end', dueDate: '2026-07-01' }),
    ], TODAY);

    expect(queue.thisWeek.map((item) => item.id)).toEqual(['tomorrow', 'week-end']);
  });

  it('excludes future tasks beyond this week', () => {
    const queue = buildStudyQueue([
      task({ id: 'this-week', dueDate: '2026-07-01' }),
      task({ id: 'later', dueDate: '2026-07-02' }),
    ], TODAY);

    expect(queue.thisWeek.map((item) => item.id)).toEqual(['this-week']);
    expect(queue.totalVisible).toBe(1);
  });

  it('sorts high priority tasks before lower priority tasks on the same due date', () => {
    const queue = buildStudyQueue([
      task({ id: 'medium', text: 'Medium task', priority: 'Medium', dueDate: TODAY }),
      task({ id: 'critical', text: 'Critical task', priority: 'Critical', dueDate: TODAY }),
      task({ id: 'low', text: 'Low task', priority: 'Low', dueDate: TODAY }),
    ], TODAY);

    expect(queue.today.map((item) => item.id)).toEqual(['critical', 'medium', 'low']);
  });

  it('applies the output limit while preserving group order', () => {
    const queue = buildStudyQueue([
      task({ id: 'overdue-1', dueDate: '2026-06-22' }),
      task({ id: 'overdue-2', dueDate: '2026-06-23' }),
      task({ id: 'today-1', dueDate: TODAY }),
      task({ id: 'week-1', dueDate: '2026-06-25' }),
    ], TODAY, 3);

    expect(queue.totalVisible).toBe(3);
    expect(queue.overdue.map((item) => item.id)).toEqual(['overdue-1', 'overdue-2']);
    expect(queue.today.map((item) => item.id)).toEqual(['today-1']);
    expect(queue.thisWeek).toHaveLength(0);
  });
});
