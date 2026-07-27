// BAccLLB Study System — local-first storage layer.
//
// Every store is persisted under a `baccllb-ss-*` key so it is automatically picked up by
// the existing backup collector (`collectBackup` in lib/localData scans `baccllb-` keys).
// Each store is wrapped in a versioned envelope `{ v, data }` and run through a forward-only
// migration ladder on read, so the on-disk schema can evolve safely (spec §13/§15.9).

export const STUDY_SYSTEM_SCHEMA_VERSION = 1;

export const SS_KEYS = {
  // Reference layer (seeded from the Control Centre; idempotently re-seedable).
  modules: 'baccllb-ss-modules',
  assessments: 'baccllb-ss-assessments',
  scheduledActivities: 'baccllb-ss-scheduled-activities',
  studyBlocks: 'baccllb-ss-study-blocks',
  weeklyPlans: 'baccllb-ss-weekly-plans',
  // Transactional layer (user-generated; NEVER overwritten by a re-seed).
  studySessions: 'baccllb-ss-study-sessions',
  activityLog: 'baccllb-ss-activity-log',
  tasks: 'baccllb-ss-tasks',
  dataChangeAudit: 'baccllb-ss-data-change-audit',
  appState: 'baccllb-ss-app-state',
  // Persisted study-session timer (spec §11 safety): survives refresh/reopen.
  activeSession: 'baccllb-ss-active-session',
  pendingSession: 'baccllb-ss-pending-session',
} as const;

export type SsKey = (typeof SS_KEYS)[keyof typeof SS_KEYS];

/** Keys that a Control-Centre re-seed is allowed to touch. */
export const REFERENCE_KEYS: readonly SsKey[] = [
  SS_KEYS.modules,
  SS_KEYS.assessments,
  SS_KEYS.scheduledActivities,
  SS_KEYS.studyBlocks,
  SS_KEYS.weeklyPlans,
];

/** User data a re-seed must never overwrite. */
export const TRANSACTIONAL_KEYS: readonly SsKey[] = [
  SS_KEYS.studySessions,
  SS_KEYS.activityLog,
  SS_KEYS.tasks,
  SS_KEYS.dataChangeAudit,
];

export const ALL_SS_KEYS: readonly SsKey[] = [
  ...REFERENCE_KEYS,
  ...TRANSACTIONAL_KEYS,
  SS_KEYS.appState,
  SS_KEYS.activeSession,
  SS_KEYS.pendingSession,
];

interface Envelope<T> {
  v: number;
  data: T;
}

/**
 * Forward-only migration ladder. Each entry upgrades a store's `data` from version `to - 1`
 * to `to`. Phase A ships schema v1 as the baseline, so the ladder is intentionally empty;
 * future schema changes append `{ to: N, migrate }` steps here.
 */
type MigrationStep = { to: number; migrate: (data: unknown, key: SsKey) => unknown };
const MIGRATIONS: MigrationStep[] = [];

function ls(): Storage | null {
  // Mirrors lib/localData.ts: use the global Storage, guarded for non-browser contexts.
  return typeof localStorage !== 'undefined' ? localStorage : null;
}

function readEnvelope<T>(key: SsKey): Envelope<T> | null {
  const store = ls();
  if (!store) return null;
  const raw = store.getItem(key);
  if (raw == null) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && 'v' in parsed && 'data' in parsed) {
      return parsed as Envelope<T>;
    }
    // Legacy/un-enveloped payload: treat as version 0 so migrations can adopt it.
    return { v: 0, data: parsed as T };
  } catch {
    return null;
  }
}

function runMigrations(key: SsKey, env: Envelope<unknown>): Envelope<unknown> {
  let { v, data } = env;
  if (v > STUDY_SYSTEM_SCHEMA_VERSION) {
    // Newer-than-supported: don't destroy it, just surface the data as-is.
    return env;
  }
  for (const step of MIGRATIONS) {
    if (step.to > v && step.to <= STUDY_SYSTEM_SCHEMA_VERSION) {
      data = step.migrate(data, key);
      v = step.to;
    }
  }
  return { v: STUDY_SYSTEM_SCHEMA_VERSION, data };
}

function writeEnvelope<T>(key: SsKey, data: T): void {
  const store = ls();
  if (!store) return;
  const env: Envelope<T> = { v: STUDY_SYSTEM_SCHEMA_VERSION, data };
  try {
    store.setItem(key, JSON.stringify(env));
  } catch {
    // Storage full / unavailable — fail closed rather than corrupt state.
  }
}

/** A collection store: an array of records keyed by `id`. */
export class CollectionRepository<T extends { id: string }> {
  constructor(private readonly key: SsKey) {}

  read(): T[] {
    const env = readEnvelope<T[]>(this.key);
    if (!env) return [];
    const migrated = runMigrations(this.key, env);
    const data = migrated.data;
    return Array.isArray(data) ? (data as T[]) : [];
  }

  write(items: T[]): void {
    writeEnvelope<T[]>(this.key, items);
  }

  getById(id: string): T | undefined {
    return this.read().find((item) => item.id === id);
  }

  upsert(item: T): T {
    const items = this.read();
    const index = items.findIndex((existing) => existing.id === item.id);
    if (index === -1) items.push(item);
    else items[index] = item;
    this.write(items);
    return item;
  }

  upsertMany(incoming: T[]): void {
    const items = this.read();
    const byId = new Map(items.map((item) => [item.id, item] as const));
    for (const item of incoming) byId.set(item.id, item);
    this.write([...byId.values()]);
  }

  remove(id: string): void {
    this.write(this.read().filter((item) => item.id !== id));
  }

  clear(): void {
    this.write([]);
  }

  isEmpty(): boolean {
    return this.read().length === 0;
  }
}

/** A single-object store (e.g. app state). */
export class SingletonRepository<T> {
  constructor(private readonly key: SsKey) {}

  read(fallback: T): T {
    const env = readEnvelope<T>(this.key);
    if (!env) return fallback;
    const migrated = runMigrations(this.key, env);
    return (migrated.data as T) ?? fallback;
  }

  write(value: T): void {
    writeEnvelope<T>(this.key, value);
  }

  update(patch: Partial<T>, fallback: T): T {
    const next = { ...this.read(fallback), ...patch };
    this.write(next);
    return next;
  }
}
