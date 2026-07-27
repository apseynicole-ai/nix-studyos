import { beforeEach, describe, expect, it } from 'vitest';
import { installMemoryStorage } from './testMemoryStorage';
import { LOCAL_TASKS_KEY } from '../lib/localData';
import { tasksRepo } from './repositories';
import {
  createTask,
  legacyTaskId,
  mapLegacyCategory,
  mapLegacyPriority,
  migrateLegacyTasks,
} from './tasks';

beforeEach(() => installMemoryStorage());

const legacy = [
  { id: 't1', text: 'Redo IAS 37 question', moduleId: 'finacc178', priority: 'Critical', type: 'Practice', done: false, dueDate: '2026-08-01', createdAt: '2026-07-20T10:00:00.000Z', why: 'bottleneck' },
  { id: 't2', text: 'Read Botha ch 2', moduleId: 'conlaw178', priority: 'Medium', type: 'Study', done: true, createdAt: '2026-07-19T09:00:00.000Z' },
];

describe('legacy priority/category mapping', () => {
  it('maps the 4-level legacy priority into P1/P2/P3', () => {
    expect(mapLegacyPriority('Critical')).toBe('P1');
    expect(mapLegacyPriority('High')).toBe('P2');
    expect(mapLegacyPriority('Medium')).toBe('P2');
    expect(mapLegacyPriority('Low')).toBe('P3');
    expect(mapLegacyPriority(undefined)).toBe('P2');
  });

  it('derives a MUST/SHOULD/NICE category from legacy priority', () => {
    expect(mapLegacyCategory('Critical')).toBe('MUST_DO');
    expect(mapLegacyCategory('Medium')).toBe('SHOULD_DO');
    expect(mapLegacyCategory('Low')).toBe('NICE_TO_HAVE');
  });
});

describe('migrateLegacyTasks', () => {
  it('migrates legacy tasks, preserving the original payload, without deleting the legacy store', () => {
    localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(legacy));

    const result = migrateLegacyTasks();
    expect(result.migrated).toBe(2);
    expect(result.skipped).toBe(0);

    const migrated = tasksRepo.read();
    expect(migrated).toHaveLength(2);

    const t1 = migrated.find((t) => t.id === legacyTaskId('t1'))!;
    expect(t1.priority).toBe('P1');
    expect(t1.category).toBe('MUST_DO');
    expect(t1.status).toBe('open');
    expect(t1.source).toBe('legacy_migration');
    expect(t1.title).toBe('Redo IAS 37 question');
    expect(t1.legacy).toMatchObject({ id: 't1', type: 'Practice' });

    const t2 = migrated.find((t) => t.id === legacyTaskId('t2'))!;
    expect(t2.status).toBe('done');

    // legacy store still present (not hard-deleted)
    expect(localStorage.getItem(LOCAL_TASKS_KEY)).not.toBeNull();
    expect(JSON.parse(localStorage.getItem(LOCAL_TASKS_KEY)!)).toHaveLength(2);
  });

  it('is idempotent — a second run migrates nothing new', () => {
    localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(legacy));
    migrateLegacyTasks();
    const second = migrateLegacyTasks();
    expect(second.migrated).toBe(0);
    expect(second.skipped).toBe(2);
    expect(tasksRepo.read()).toHaveLength(2);
  });

  it('ignores malformed legacy rows', () => {
    localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify([{ nope: true }, ...legacy]));
    const result = migrateLegacyTasks();
    expect(result.migrated).toBe(2);
  });
});

describe('createTask', () => {
  it('creates a spec-shaped task with defaults and persists it', () => {
    const task = createTask({ moduleId: 'lawpersons144', title: '  Do SU1 quiz  ' });
    expect(task.title).toBe('Do SU1 quiz');
    expect(task.category).toBe('SHOULD_DO');
    expect(task.priority).toBe('P2');
    expect(task.status).toBe('open');
    expect(task.source).toBe('manual');
    expect(task.carriedOver).toBe(false);
    expect(tasksRepo.getById(task.id)).toBeDefined();
  });

  it('honours explicit category/priority/source (e.g. a study follow-up default)', () => {
    const task = createTask({ moduleId: 'finacc178', title: 'Redo Q4', category: 'MUST_DO', priority: 'P2', source: 'study_followup' });
    expect(task.category).toBe('MUST_DO');
    expect(task.priority).toBe('P2');
    expect(task.source).toBe('study_followup');
  });
});
