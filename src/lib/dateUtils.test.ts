import { describe, expect, it } from 'vitest';
import { isPastDate, isRelevantAssessmentDate, isWithinNextDays, todayIsoLocal } from './dateUtils';

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
