// Extended task model (spec §8) + a NON-destructive migration from the legacy
// `baccllb-tasks` store used by the current Tasks page.
//
// The legacy store uses priority Low/Medium/High/Critical and a `type`, with no
// MUST/SHOULD/NICE category, source, status, linked-block or carry-over fields. We map it
// into the spec model, PRESERVE the original payload under `legacy`, and never delete the
// legacy store (spec §13 — do not hard-delete historical user data).

import { LOCAL_TASKS_KEY, readLocalJson } from '../lib/localData';
import { tasksRepo } from './repositories';
import type { StudyTask, TaskCategory, TaskPriority, TaskSource, TaskStatus } from './types';

interface LegacyTask {
  id: string;
  text: string;
  done?: boolean;
  moduleId: string;
  category?: string;
  priority?: string;
  type?: string;
  minutes?: number;
  points?: number;
  dueDate?: string | null;
  createdAt?: string;
  completedAt?: string | null;
  why?: string;
  userId?: string;
}

// Legacy 4-level priority -> spec P1/P2/P3. Distinctness is preserved in `legacy`.
const PRIORITY_MAP: Record<string, TaskPriority> = {
  Critical: 'P1',
  High: 'P2',
  Medium: 'P2',
  Low: 'P3',
};

// Heuristic category from legacy priority (legacy had no MUST/SHOULD/NICE). Documented,
// reversible via the preserved `legacy` payload.
const CATEGORY_FROM_PRIORITY: Record<string, TaskCategory> = {
  Critical: 'MUST_DO',
  High: 'MUST_DO',
  Medium: 'SHOULD_DO',
  Low: 'NICE_TO_HAVE',
};

export function mapLegacyPriority(priority: string | undefined): TaskPriority {
  return PRIORITY_MAP[priority ?? ''] ?? 'P2';
}

export function mapLegacyCategory(priority: string | undefined): TaskCategory {
  return CATEGORY_FROM_PRIORITY[priority ?? ''] ?? 'SHOULD_DO';
}

const LEGACY_ID_PREFIX = 'legacy-';

export function legacyTaskId(originalId: string): string {
  return `${LEGACY_ID_PREFIX}${originalId}`;
}

export function legacyTaskToStudyTask(legacy: LegacyTask): StudyTask {
  const status: TaskStatus = legacy.done ? 'done' : 'open';
  return {
    id: legacyTaskId(legacy.id),
    moduleId: legacy.moduleId,
    title: legacy.text,
    category: mapLegacyCategory(legacy.priority),
    priority: mapLegacyPriority(legacy.priority),
    dueDate: legacy.dueDate ?? null,
    status,
    source: 'legacy_migration',
    createdAt: legacy.createdAt ?? new Date().toISOString(),
    completedAt: legacy.completedAt ?? (legacy.done ? legacy.createdAt ?? null : null),
    linkedStudyBlockId: null,
    carriedOver: false,
    why: legacy.why,
    legacy: { ...legacy },
  };
}

export interface LegacyMigrationResult {
  migrated: number;
  skipped: number;
  total: number;
}

/**
 * Idempotent, additive migration. Reads the legacy `baccllb-tasks` store, converts each
 * task, and upserts it into the new task store. Already-migrated tasks (matched by the
 * derived `legacy-<id>` id) are skipped. The legacy store is left intact.
 */
export function migrateLegacyTasks(): LegacyMigrationResult {
  const legacyTasks = readLocalJson<LegacyTask[]>(LOCAL_TASKS_KEY, []);
  const existingIds = new Set(tasksRepo.read().map((task) => task.id));

  let migrated = 0;
  let skipped = 0;
  const toUpsert: StudyTask[] = [];

  for (const legacy of legacyTasks) {
    if (!legacy || typeof legacy.id !== 'string' || typeof legacy.text !== 'string') continue;
    if (existingIds.has(legacyTaskId(legacy.id))) {
      skipped += 1;
      continue;
    }
    toUpsert.push(legacyTaskToStudyTask(legacy));
    migrated += 1;
  }

  if (toUpsert.length > 0) tasksRepo.upsertMany(toUpsert);
  return { migrated, skipped, total: legacyTasks.length };
}

let uid = 0;
function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  uid += 1;
  return `task-${Date.now()}-${uid}`;
}

export interface NewTaskInput {
  moduleId: string;
  title: string;
  category?: TaskCategory;
  priority?: TaskPriority;
  dueDate?: string | null;
  source?: TaskSource;
  linkedStudyBlockId?: string | null;
  why?: string;
}

export function createTask(input: NewTaskInput): StudyTask {
  const now = new Date().toISOString();
  const task: StudyTask = {
    id: newId(),
    moduleId: input.moduleId,
    title: input.title.trim(),
    category: input.category ?? 'SHOULD_DO',
    priority: input.priority ?? 'P2',
    dueDate: input.dueDate ?? null,
    status: 'open',
    source: input.source ?? 'manual',
    createdAt: now,
    completedAt: null,
    linkedStudyBlockId: input.linkedStudyBlockId ?? null,
    carriedOver: false,
    why: input.why,
  };
  tasksRepo.upsert(task);
  return task;
}
