import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BACKUP_KEYS,
  LOCAL_ACADEMIC_SNAPSHOTS_KEY,
  LOCAL_BACKUP_META_KEY,
  LOCAL_MODULE_CONFIDENCE_KEY,
  LOCAL_PROFILE_KEY,
  LOCAL_SUMMARIES_KEY,
  LOCAL_TASKS_KEY,
  LOCAL_TIMER_SESSIONS_KEY,
  LOCAL_TOPIC_MASTERY_KEY,
  getBackupAgeDays,
  writeLocalJson,
} from './localData';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

const fixedNow = Date.parse('2026-06-23T12:00:00.000Z');

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: new MemoryStorage(),
    configurable: true,
  });
  vi.spyOn(Date, 'now').mockReturnValue(fixedNow);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('local backup metadata helpers', () => {
  it('returns null when no backup metadata exists', () => {
    expect(getBackupAgeDays()).toBeNull();
  });

  it('uses importedAt for import records instead of the original exportedAt timestamp', () => {
    writeLocalJson(LOCAL_BACKUP_META_KEY, {
      action: 'import',
      exportedAt: '2000-01-01T00:00:00.000Z',
      importedAt: '2026-06-22T12:00:00.000Z',
      fileName: 'old-backup.json',
      includedKeys: [],
    });

    expect(getBackupAgeDays()).toBe(1);
  });

  it('clamps future backup timestamps to zero days old', () => {
    writeLocalJson(LOCAL_BACKUP_META_KEY, {
      action: 'export',
      exportedAt: '2999-01-01T00:00:00.000Z',
      fileName: 'future-backup.json',
      includedKeys: [],
    });

    expect(getBackupAgeDays()).toBe(0);
  });

  it('returns null for invalid backup dates', () => {
    writeLocalJson(LOCAL_BACKUP_META_KEY, {
      action: 'export',
      exportedAt: 'not-a-date',
      fileName: 'broken-backup.json',
      includedKeys: [],
    });

    expect(getBackupAgeDays()).toBeNull();
  });

  it('keeps the established localStorage key names stable', () => {
    expect(LOCAL_PROFILE_KEY).toBe('baccllb-profile');
    expect(LOCAL_TASKS_KEY).toBe('baccllb-tasks');
    expect(LOCAL_TIMER_SESSIONS_KEY).toBe('baccllb-timer-sessions');
    expect(LOCAL_SUMMARIES_KEY).toBe('baccllb-studyai-summaries');
    expect(LOCAL_TOPIC_MASTERY_KEY).toBe('baccllb-topic-mastery');
    expect(LOCAL_MODULE_CONFIDENCE_KEY).toBe('baccllb-module-confidence');
    expect(LOCAL_ACADEMIC_SNAPSHOTS_KEY).toBe('baccllb-academic-snapshots');
    expect(LOCAL_BACKUP_META_KEY).toBe('baccllb-last-backup-meta');
    expect(BACKUP_KEYS).toEqual(expect.arrayContaining([
      'baccllb-mark-engine-state',
      'baccllb-tasks',
      'baccllb-timer-sessions',
      'baccllb-studyai-summaries',
      'baccllb-topic-mastery',
      'baccllb-mistake-bank',
    ]));
  });
});
