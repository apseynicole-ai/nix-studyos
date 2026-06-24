import { describe, expect, it } from 'vitest';
import { isPastDate, isRelevantAssessmentDate, isValidIsoDateString, isWithinNextDays, todayIsoLocal } from './dateUtils';

describe('isValidIsoDateString', () => {
  it('accepts valid YYYY-MM-DD calendar dates', () => {
    expect(isValidIsoDateString('2026-02-28')).toBe(true);
    expect(isValidIsoDateString('2026-12-01')).toBe(true);
    expect(isValidIsoDateString('2028-02-29')).toBe(true);
  });

  it('rejects empty, malformed, and impossible dates', () => {
    expect(isValidIsoDateString('')).toBe(false);
    expect(isValidIsoDateString('not-a-date')).toBe(false);
    expect(isValidIsoDateString('2026-2-3')).toBe(false);
    expect(isValidIsoDateString('2026-02-30')).toBe(false);
    expect(isValidIsoDateString('2026-13-01')).toBe(false);
    expect(isValidIsoDateString('2026-00-10')).toBe(false);
  });
});

describe('date relevance helpers', () => {
  it('filters clearly past assessment dates', () => {
    expect(isRelevantAssessmentDate('2000-01-01')).toBe(false);
    expect(isPastDate('2000-01-01')).toBe(true);
  });

  it('keeps current, future, and unknown assessment dates relevant', () => {
    expect(isRelevantAssessmentDate(todayIsoLocal())).toBe(true);
    expect(isRelevantAssessmentDate('2999-01-01')).toBe(true);
    expect(isRelevantAssessmentDate('TBC')).toBe(true);
    expect(isRelevantAssessmentDate(undefined)).toBe(true);
  });

  it('only counts usable dates inside the requested forward window', () => {
    expect(isWithinNextDays(todayIsoLocal(), 7)).toBe(true);
    expect(isWithinNextDays('2000-01-01', 7)).toBe(false);
    expect(isWithinNextDays('TBC', 7)).toBe(false);
  });
});
