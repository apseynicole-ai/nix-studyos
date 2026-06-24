import { describe, expect, it } from 'vitest';
import { getNextAssessment } from './assessmentCountdown';
import type { AssessmentCalendarEntry } from '../data/assessmentCalendar';

function entry(overrides: Partial<AssessmentCalendarEntry> = {}): AssessmentCalendarEntry {
  return {
    assessmentId: 'A1',
    moduleId: 'test-module',
    moduleCode: 'TST100',
    title: 'Test Assessment',
    date: '2999-01-01',
    time: '09:00',
    durationMinutes: 120,
    venue: 'Main Hall',
    source: 'Test timetable',
    confidence: 'high',
    notes: '',
    ...overrides,
  };
}

const TODAY = '2026-06-01';

describe('getNextAssessment', () => {
  it('returns null for an empty list', () => {
    expect(getNextAssessment([], TODAY)).toBeNull();
  });

  it('excludes assessments in the past', () => {
    expect(getNextAssessment([entry({ date: '2026-05-01' })], TODAY)).toBeNull();
  });

  it('returns null when all entries are past', () => {
    const past = [entry({ assessmentId: 'A1', date: '2026-01-01' }), entry({ assessmentId: 'A2', date: '2026-03-15' })];
    expect(getNextAssessment(past, TODAY)).toBeNull();
  });

  it('includes an assessment due today with daysFromNow = 0', () => {
    const result = getNextAssessment([entry({ date: TODAY })], TODAY);
    expect(result).not.toBeNull();
    expect(result!.entry.date).toBe(TODAY);
    expect(result!.daysFromNow).toBe(0);
  });

  it('picks the nearest future assessment when multiple exist', () => {
    const nearer = entry({ assessmentId: 'A1', date: '2026-07-10' });
    const farther = entry({ assessmentId: 'A2', date: '2026-08-01' });
    const result = getNextAssessment([farther, nearer], TODAY);
    expect(result!.entry.assessmentId).toBe('A1');
  });

  it('calculates daysFromNow correctly', () => {
    const result = getNextAssessment([entry({ date: '2026-06-05' })], TODAY);
    expect(result!.daysFromNow).toBe(4);
  });

  it('ignores entries with empty or missing dates', () => {
    expect(getNextAssessment([entry({ date: '' })], TODAY)).toBeNull();
  });
});
