import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  normaliseClassLogEntry,
  readClassLogEntries,
  writeClassLogEntries,
  createClassLogEntry,
  updateClassLogEntry,
  deleteClassLogEntry,
  getClassLogEntriesByModule,
  getRecentClassLogEntries,
  type ClassLogEntry,
} from './classLog';
import { BACKUP_KEYS, LOCAL_CLASS_LOG_KEY } from './localData';

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

let uuidCounter = 0;

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: new MemoryStorage(),
    configurable: true,
  });
  uuidCounter = 0;
  vi.spyOn(globalThis.crypto, 'randomUUID').mockImplementation(
    () => `test-uuid-${++uuidCounter}` as `${string}-${string}-${string}-${string}-${string}`,
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

function makeEntry(overrides: Partial<ClassLogEntry> = {}): ClassLogEntry {
  return {
    id: 'entry-1',
    moduleCode: 'ECO114',
    date: '2026-06-01',
    title: 'Supply and Demand',
    rawNotes: 'Markets clear at equilibrium',
    lecturerEmphasis: 'Price elasticity',
    examples: 'Petrol price example',
    questions: 'Why does demand slope down?',
    homework: 'Read ch. 4',
    confidence: 'medium',
    createdAt: '2026-06-01T08:00:00.000Z',
    updatedAt: '2026-06-01T08:00:00.000Z',
    ...overrides,
  };
}

describe('normaliseClassLogEntry', () => {
  it('normalises a valid entry', () => {
    const result = normaliseClassLogEntry(makeEntry());
    expect(result).not.toBeNull();
    expect(result?.id).toBe('entry-1');
    expect(result?.moduleCode).toBe('ECO114');
  });

  it('returns null for non-object inputs', () => {
    expect(normaliseClassLogEntry(null)).toBeNull();
    expect(normaliseClassLogEntry(42)).toBeNull();
    expect(normaliseClassLogEntry('string')).toBeNull();
    expect(normaliseClassLogEntry([])).toBeNull();
  });

  it('returns null when id is missing', () => {
    const raw = { ...makeEntry(), id: '' };
    expect(normaliseClassLogEntry(raw)).toBeNull();
  });

  it('returns null when moduleCode is missing', () => {
    const raw = { ...makeEntry(), moduleCode: '' };
    expect(normaliseClassLogEntry(raw)).toBeNull();
  });

  it('returns null when date is missing', () => {
    const raw = { ...makeEntry(), date: '' };
    expect(normaliseClassLogEntry(raw)).toBeNull();
  });

  it('trims string fields', () => {
    const raw = { ...makeEntry(), title: '  Untrimmed Title  ', rawNotes: '  some notes  ' };
    const result = normaliseClassLogEntry(raw);
    expect(result?.title).toBe('Untrimmed Title');
    expect(result?.rawNotes).toBe('some notes');
  });

  it('falls back to medium confidence for unknown confidence values', () => {
    const raw = { ...makeEntry(), confidence: 'very-high' };
    const result = normaliseClassLogEntry(raw);
    expect(result?.confidence).toBe('medium');
  });

  it('accepts all valid confidence values', () => {
    expect(normaliseClassLogEntry({ ...makeEntry(), confidence: 'low' })?.confidence).toBe('low');
    expect(normaliseClassLogEntry({ ...makeEntry(), confidence: 'medium' })?.confidence).toBe('medium');
    expect(normaliseClassLogEntry({ ...makeEntry(), confidence: 'high' })?.confidence).toBe('high');
  });
});

describe('readClassLogEntries', () => {
  it('returns empty array when storage is empty', () => {
    expect(readClassLogEntries()).toEqual([]);
  });

  it('returns empty array for malformed JSON', () => {
    localStorage.setItem(LOCAL_CLASS_LOG_KEY, '{bad-json}');
    expect(readClassLogEntries()).toEqual([]);
  });

  it('returns empty array when stored value is not an array', () => {
    localStorage.setItem(LOCAL_CLASS_LOG_KEY, JSON.stringify({ not: 'an-array' }));
    expect(readClassLogEntries()).toEqual([]);
  });

  it('skips invalid entries and returns valid ones', () => {
    const valid = makeEntry();
    const invalid = { id: '', moduleCode: 'BAD', date: '2026-06-01' };
    localStorage.setItem(LOCAL_CLASS_LOG_KEY, JSON.stringify([valid, invalid, null, 42]));
    const result = readClassLogEntries();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('entry-1');
  });
});

describe('writeClassLogEntries', () => {
  it('persists entries to localStorage', () => {
    const entries = [makeEntry()];
    writeClassLogEntries(entries);
    const stored = JSON.parse(localStorage.getItem(LOCAL_CLASS_LOG_KEY) || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('entry-1');
  });

  it('does not throw when localStorage is unavailable', () => {
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('localStorage unavailable');
    });
    expect(() => writeClassLogEntries([makeEntry()])).not.toThrow();
  });
});

describe('createClassLogEntry', () => {
  it('creates entry with generated id and timestamps', () => {
    const draft = {
      moduleCode: 'ECO114',
      date: '2026-06-10',
      title: 'Fiscal Policy',
      rawNotes: 'Government spending',
      lecturerEmphasis: 'Multiplier effect',
      examples: 'Budget 2025',
      questions: 'Crowding out?',
      homework: 'Read ch. 12',
      confidence: 'high' as const,
    };

    const entry = createClassLogEntry(draft);

    expect(entry.id).toBe('test-uuid-1');
    expect(entry.moduleCode).toBe('ECO114');
    expect(entry.date).toBe('2026-06-10');
    expect(entry.title).toBe('Fiscal Policy');
    expect(entry.createdAt).toBeTruthy();
    expect(entry.updatedAt).toBe(entry.createdAt);
  });

  it('trims fields on creation', () => {
    const entry = createClassLogEntry({
      moduleCode: '  ECO114  ',
      date: '  2026-06-10  ',
      title: '  Untrimmed  ',
      rawNotes: '  raw  ',
      lecturerEmphasis: '  emph  ',
      examples: '  ex  ',
      questions: '  q  ',
      homework: '  hw  ',
      confidence: 'low',
    });

    expect(entry.moduleCode).toBe('ECO114');
    expect(entry.date).toBe('2026-06-10');
    expect(entry.title).toBe('Untrimmed');
    expect(entry.rawNotes).toBe('raw');
  });

  it('persists entry to localStorage and appends to existing entries', () => {
    const first = createClassLogEntry({
      moduleCode: 'ECO114', date: '2026-06-01', title: 'First', rawNotes: '', lecturerEmphasis: '',
      examples: '', questions: '', homework: '', confidence: 'medium',
    });
    const second = createClassLogEntry({
      moduleCode: 'FA178', date: '2026-06-02', title: 'Second', rawNotes: '', lecturerEmphasis: '',
      examples: '', questions: '', homework: '', confidence: 'high',
    });

    const all = readClassLogEntries();
    expect(all).toHaveLength(2);
    expect(all.map((e) => e.id)).toEqual([first.id, second.id]);
  });
});

describe('updateClassLogEntry', () => {
  it('updates fields and changes updatedAt', () => {
    vi.useFakeTimers({ now: new Date('2026-06-01T08:00:00.000Z') });
    const original = createClassLogEntry({
      moduleCode: 'FA178', date: '2026-06-01', title: 'Original', rawNotes: '',
      lecturerEmphasis: '', examples: '', questions: '', homework: '', confidence: 'low',
    });
    expect(original.updatedAt).toBe('2026-06-01T08:00:00.000Z');

    vi.setSystemTime(new Date('2026-06-01T09:00:00.000Z'));
    const updated = updateClassLogEntry(original.id, { title: 'Updated Title', confidence: 'high' });
    vi.useRealTimers();

    expect(updated).not.toBeNull();
    expect(updated?.title).toBe('Updated Title');
    expect(updated?.confidence).toBe('high');
    expect(updated?.moduleCode).toBe('FA178');
    expect(updated?.createdAt).toBe('2026-06-01T08:00:00.000Z');
    expect(updated?.updatedAt).toBe('2026-06-01T09:00:00.000Z');
  });

  it('trims updated text fields', () => {
    const entry = createClassLogEntry({
      moduleCode: 'ECO114', date: '2026-06-01', title: 'Old', rawNotes: '',
      lecturerEmphasis: '', examples: '', questions: '', homework: '', confidence: 'medium',
    });

    const updated = updateClassLogEntry(entry.id, { rawNotes: '  trimmed notes  ' });
    expect(updated?.rawNotes).toBe('trimmed notes');
  });

  it('returns null for non-existent id', () => {
    expect(updateClassLogEntry('does-not-exist', { title: 'X' })).toBeNull();
  });

  it('does not affect other entries', () => {
    const a = createClassLogEntry({
      moduleCode: 'ECO114', date: '2026-06-01', title: 'A', rawNotes: '',
      lecturerEmphasis: '', examples: '', questions: '', homework: '', confidence: 'medium',
    });
    const b = createClassLogEntry({
      moduleCode: 'FA178', date: '2026-06-02', title: 'B', rawNotes: '',
      lecturerEmphasis: '', examples: '', questions: '', homework: '', confidence: 'high',
    });

    updateClassLogEntry(a.id, { title: 'A Updated' });

    const all = readClassLogEntries();
    const bEntry = all.find((e) => e.id === b.id);
    expect(bEntry?.title).toBe('B');
  });
});

describe('deleteClassLogEntry', () => {
  it('removes only the targeted entry', () => {
    const a = createClassLogEntry({
      moduleCode: 'ECO114', date: '2026-06-01', title: 'Keep', rawNotes: '',
      lecturerEmphasis: '', examples: '', questions: '', homework: '', confidence: 'medium',
    });
    const b = createClassLogEntry({
      moduleCode: 'FA178', date: '2026-06-02', title: 'Delete me', rawNotes: '',
      lecturerEmphasis: '', examples: '', questions: '', homework: '', confidence: 'low',
    });

    deleteClassLogEntry(b.id);

    const remaining = readClassLogEntries();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(a.id);
  });

  it('is a no-op for a non-existent id', () => {
    createClassLogEntry({
      moduleCode: 'ECO114', date: '2026-06-01', title: 'Stays', rawNotes: '',
      lecturerEmphasis: '', examples: '', questions: '', homework: '', confidence: 'medium',
    });

    deleteClassLogEntry('ghost-id');

    expect(readClassLogEntries()).toHaveLength(1);
  });
});

describe('getClassLogEntriesByModule', () => {
  it('filters entries by module code', () => {
    createClassLogEntry({
      moduleCode: 'ECO114', date: '2026-06-01', title: 'Econ class', rawNotes: '',
      lecturerEmphasis: '', examples: '', questions: '', homework: '', confidence: 'medium',
    });
    createClassLogEntry({
      moduleCode: 'FA178', date: '2026-06-02', title: 'FA class', rawNotes: '',
      lecturerEmphasis: '', examples: '', questions: '', homework: '', confidence: 'high',
    });
    createClassLogEntry({
      moduleCode: 'ECO114', date: '2026-06-03', title: 'Econ class 2', rawNotes: '',
      lecturerEmphasis: '', examples: '', questions: '', homework: '', confidence: 'low',
    });

    const econ = getClassLogEntriesByModule('ECO114');
    expect(econ).toHaveLength(2);
    expect(econ.every((e) => e.moduleCode === 'ECO114')).toBe(true);
  });

  it('returns empty array when no entries match', () => {
    createClassLogEntry({
      moduleCode: 'FA178', date: '2026-06-01', title: 'FA', rawNotes: '',
      lecturerEmphasis: '', examples: '', questions: '', homework: '', confidence: 'medium',
    });

    expect(getClassLogEntriesByModule('STA188')).toHaveLength(0);
  });
});

describe('getRecentClassLogEntries', () => {
  it('returns entries sorted newest date first', () => {
    createClassLogEntry({
      moduleCode: 'ECO114', date: '2026-06-01', title: 'Older', rawNotes: '',
      lecturerEmphasis: '', examples: '', questions: '', homework: '', confidence: 'medium',
    });
    createClassLogEntry({
      moduleCode: 'FA178', date: '2026-06-10', title: 'Newer', rawNotes: '',
      lecturerEmphasis: '', examples: '', questions: '', homework: '', confidence: 'high',
    });
    createClassLogEntry({
      moduleCode: 'STA188', date: '2026-06-05', title: 'Middle', rawNotes: '',
      lecturerEmphasis: '', examples: '', questions: '', homework: '', confidence: 'low',
    });

    const recent = getRecentClassLogEntries();
    expect(recent[0].date).toBe('2026-06-10');
    expect(recent[1].date).toBe('2026-06-05');
    expect(recent[2].date).toBe('2026-06-01');
  });

  it('respects the limit parameter', () => {
    for (let i = 1; i <= 5; i++) {
      createClassLogEntry({
        moduleCode: 'ECO114', date: `2026-06-0${i}`, title: `Class ${i}`, rawNotes: '',
        lecturerEmphasis: '', examples: '', questions: '', homework: '', confidence: 'medium',
      });
    }

    expect(getRecentClassLogEntries(3)).toHaveLength(3);
  });

  it('returns empty array when storage is empty', () => {
    expect(getRecentClassLogEntries()).toEqual([]);
  });
});

describe('backup key', () => {
  it('includes baccllb-class-log in BACKUP_KEYS', () => {
    expect(BACKUP_KEYS).toContain('baccllb-class-log');
  });

  it('LOCAL_CLASS_LOG_KEY equals baccllb-class-log', () => {
    expect(LOCAL_CLASS_LOG_KEY).toBe('baccllb-class-log');
  });
});
