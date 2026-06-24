import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BACKUP_APP_NAME,
  BACKUP_KEYS,
  BACKUP_SCHEMA_VERSION,
  LOCAL_ACADEMIC_SNAPSHOTS_KEY,
  LOCAL_BACKUP_META_KEY,
  LOCAL_MODULE_CONFIDENCE_KEY,
  LOCAL_PROFILE_KEY,
  LOCAL_SUMMARIES_KEY,
  LOCAL_TASKS_KEY,
  LOCAL_TIMER_SESSIONS_KEY,
  LOCAL_TOPIC_MASTERY_KEY,
  applyBackupImport,
  parseBackupForPreview,
  type StudyOSBackupFile,
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

function backupFile(overrides: Partial<StudyOSBackupFile> = {}): StudyOSBackupFile {
  return {
    appName: BACKUP_APP_NAME,
    exportedAt: '2026-06-23T10:00:00.000Z',
    backupVersion: BACKUP_SCHEMA_VERSION,
    includedKeys: [LOCAL_TASKS_KEY],
    data: {
      [LOCAL_TASKS_KEY]: [{ id: 'task-from-backup', text: 'Imported task', done: false }],
    },
    placeholders: {
      topicMastery: [],
      mistakeBank: [],
    },
    ...overrides,
  };
}

describe('backup import preview', () => {
  it('previews a valid backup without writing localStorage', () => {
    localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify([{ id: 'existing-task' }]));
    localStorage.setItem('outside-key', 'keep-me');

    const preview = parseBackupForPreview(JSON.stringify(backupFile({
      data: {
        [LOCAL_TASKS_KEY]: [{ id: 'task-from-backup' }],
        'baccllb-manual-assessments': [{ id: 'manual-a1' }],
        'baccllb-unknown-future-key': { future: true },
      },
    })));

    expect(preview.valid).toBe(true);
    expect(preview.recognisedKeys).toEqual(expect.arrayContaining([LOCAL_TASKS_KEY, 'baccllb-manual-assessments']));
    expect(preview.unknownKeys).toContain('baccllb-unknown-future-key');
    expect(preview.overwriteKeys).toContain(LOCAL_TASKS_KEY);
    expect(preview.highRiskKeys).toEqual(expect.arrayContaining([LOCAL_TASKS_KEY, 'baccllb-manual-assessments']));
    expect(localStorage.getItem(LOCAL_TASKS_KEY)).toBe(JSON.stringify([{ id: 'existing-task' }]));
    expect(localStorage.getItem('outside-key')).toBe('keep-me');
  });

  it('rejects invalid JSON and invalid backup shapes', () => {
    expect(parseBackupForPreview('{bad-json').valid).toBe(false);

    const preview = parseBackupForPreview(JSON.stringify({ data: {} }));
    expect(preview.valid).toBe(false);
    expect(preview.error).toContain('Invalid backup');
  });

  it('rejects backups for a different app name', () => {
    const preview = parseBackupForPreview(JSON.stringify(backupFile({ appName: 'Other App' })));
    expect(preview.valid).toBe(false);
    expect(preview.error).toContain('Nix StudyOS backup');
  });

  it('rejects newer backup versions before import', () => {
    const preview = parseBackupForPreview(JSON.stringify(backupFile({ backupVersion: BACKUP_SCHEMA_VERSION + 1 })));
    expect(preview.valid).toBe(false);
    expect(preview.error).toContain('newer version');
  });

  it('preserves the older backup version warning', () => {
    const preview = parseBackupForPreview(JSON.stringify(backupFile({ backupVersion: BACKUP_SCHEMA_VERSION - 1 })));
    expect(preview.valid).toBe(true);
    expect(preview.warnings.join(' ')).toContain('older backup version');
  });

  it('lists missing known keys and unknown keys separately', () => {
    const preview = parseBackupForPreview(JSON.stringify(backupFile({
      data: {
        [LOCAL_TASKS_KEY]: [],
        'random-browser-key': true,
      },
    })));

    expect(preview.valid).toBe(true);
    expect(preview.recognisedKeys).toContain(LOCAL_TASKS_KEY);
    expect(preview.unknownKeys).toContain('random-browser-key');
    expect(preview.missingKnownKeys).toContain(LOCAL_PROFILE_KEY);
  });

  it('applies imports only after explicit apply and writes only recognised keys', () => {
    localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify([{ id: 'existing-task' }]));
    localStorage.setItem('outside-key', 'keep-me');
    localStorage.setItem('baccllb-unknown-future-key', JSON.stringify({ local: true }));

    const preview = parseBackupForPreview(JSON.stringify(backupFile({
      data: {
        [LOCAL_TASKS_KEY]: [{ id: 'task-from-backup' }],
        [LOCAL_PROFILE_KEY]: { displayName: 'Nicole' },
        'outside-key': 'do-not-write',
        'baccllb-unknown-future-key': { future: true },
      },
    })));

    expect(localStorage.getItem(LOCAL_PROFILE_KEY)).toBeNull();
    const result = applyBackupImport(preview, 'backup.json');

    expect(result.keys).toEqual(expect.arrayContaining([LOCAL_TASKS_KEY, LOCAL_PROFILE_KEY]));
    expect(JSON.parse(localStorage.getItem(LOCAL_TASKS_KEY) || '[]')).toEqual([{ id: 'task-from-backup' }]);
    expect(JSON.parse(localStorage.getItem(LOCAL_PROFILE_KEY) || '{}')).toEqual({ displayName: 'Nicole' });
    expect(localStorage.getItem('outside-key')).toBe('keep-me');
    expect(JSON.parse(localStorage.getItem('baccllb-unknown-future-key') || '{}')).toEqual({ local: true });
    expect(localStorage.getItem(LOCAL_BACKUP_META_KEY)).toBeTruthy();
  });
});
