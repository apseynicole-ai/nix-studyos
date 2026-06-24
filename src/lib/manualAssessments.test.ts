import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  addManualAssessment,
  deleteManualAssessment,
  isValidIsoDateString,
  readManualAssessments,
  saveManualAssessments,
  toAssessmentCalendarEntry,
  type ManualAssessmentEntry,
} from './manualAssessments';
import { getNextAssessment } from './assessmentCountdown';
import { finalAssessmentCalendarEntries } from '../data/assessmentCalendar';

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

function draft(overrides: Partial<Omit<ManualAssessmentEntry, 'id'>> = {}): Omit<ManualAssessmentEntry, 'id'> {
  return {
    moduleId: 'conlaw178',
    moduleCode: 'CON178',
    title: 'S2 Test',
    date: '2026-09-01',
    time: '09:00',
    venue: 'Edu 1003',
    durationMinutes: 90,
    confidence: 'high',
    createdAt: '2026-06-24T08:00:00.000Z',
    ...overrides,
  };
}

describe('isValidIsoDateString', () => {
  it('accepts a valid ISO date', () => {
    expect(isValidIsoDateString('2026-09-01')).toBe(true);
  });

  it('rejects an empty string', () => {
    expect(isValidIsoDateString('')).toBe(false);
  });

  it('rejects a malformed string', () => {
    expect(isValidIsoDateString('not-a-date')).toBe(false);
  });

  it('rejects an impossible date that JS rolls over', () => {
    expect(isValidIsoDateString('2026-02-30')).toBe(false);
  });
});

describe('readManualAssessments / saveManualAssessments', () => {
  it('returns an empty array when nothing is saved', () => {
    expect(readManualAssessments()).toEqual([]);
  });

  it('saves and reads back entries correctly', () => {
    const entry: ManualAssessmentEntry = { id: 'test-id', ...draft() };
    saveManualAssessments([entry]);
    expect(readManualAssessments()).toEqual([entry]);
  });
});

describe('addManualAssessment', () => {
  it('adds an entry and returns the updated list', () => {
    const result = addManualAssessment(draft());
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('S2 Test');
    expect(result[0].id).toBeTruthy();
  });

  it('accumulates multiple entries without overwriting', () => {
    addManualAssessment(draft({ title: 'First' }));
    const result = addManualAssessment(draft({ title: 'Second' }));
    expect(result).toHaveLength(2);
  });
});

describe('deleteManualAssessment', () => {
  it('removes only the targeted entry by id', () => {
    const first = addManualAssessment(draft({ title: 'Keep' }));
    const second = addManualAssessment(draft({ title: 'Remove' }));
    const idToRemove = second.find((e) => e.title === 'Remove')!.id;
    const result = deleteManualAssessment(idToRemove);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Keep');
  });
});

describe('toAssessmentCalendarEntry', () => {
  it('maps all fields correctly for countdown consumption', () => {
    const entry: ManualAssessmentEntry = { id: 'abc-123', ...draft() };
    const mapped = toAssessmentCalendarEntry(entry);
    expect(mapped.assessmentId).toBe('abc-123');
    expect(mapped.moduleId).toBe('conlaw178');
    expect(mapped.moduleCode).toBe('CON178');
    expect(mapped.title).toBe('S2 Test');
    expect(mapped.date).toBe('2026-09-01');
    expect(mapped.time).toBe('09:00');
    expect(mapped.venue).toBe('Edu 1003');
    expect(mapped.confidence).toBe('high');
    expect(mapped.source).toBe('manual');
  });
});

describe('combined static + manual entries', () => {
  it('getNextAssessment picks a manual future entry when static entries are all past', () => {
    const manualEntry: ManualAssessmentEntry = { id: 'future-id', ...draft({ date: '2026-09-15' }) };
    const combined = [...finalAssessmentCalendarEntries, toAssessmentCalendarEntry(manualEntry)];
    const result = getNextAssessment(combined, '2026-06-24');
    expect(result).not.toBeNull();
    expect(result!.entry.assessmentId).toBe('future-id');
    expect(Number.isFinite(result!.daysFromNow)).toBe(true);
  });

  it('manual entry with invalid date does not produce NaN daysFromNow', () => {
    const bad: ManualAssessmentEntry = { id: 'bad-id', ...draft({ date: 'not-a-date' }) };
    const combined = [toAssessmentCalendarEntry(bad)];
    const result = getNextAssessment(combined, '2026-06-24');
    expect(result).toBeNull();
  });
});
