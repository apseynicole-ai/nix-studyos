import { describe, expect, it } from 'vitest';
import {
  mistakeRetestsDueSoon,
  mistakeRetestsInWindow,
  mistakesNeedingCorrectionRule,
  needsCorrectionRule,
  type MistakeRecord,
} from './mistakeBank';
import { todayIsoLocal } from './dateUtils';

function mistake(overrides: Partial<MistakeRecord> = {}): MistakeRecord {
  const now = new Date().toISOString();
  return {
    id: 'mistake-1',
    moduleId: 'econ114',
    mistakeTitle: 'Misread graph',
    mistakeDescription: 'Used the wrong axis.',
    whyItHappened: 'Rushed reading.',
    correctionRule: 'Check axes before calculating.',
    sourceType: 'self-study',
    sourceReference: 'Practice set',
    retestDate: '',
    resolved: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('mistake bank helper safety', () => {
  it('treats missing correctionRule legacy records as needing correction rules without crashing', () => {
    const legacy = mistake({ correctionRule: undefined as unknown as string });

    expect(() => needsCorrectionRule(legacy)).not.toThrow();
    expect(needsCorrectionRule(legacy)).toBe(true);
    expect(mistakesNeedingCorrectionRule([legacy])).toEqual([legacy]);
  });

  it('counts blank and placeholder correction rules as incomplete', () => {
    expect(needsCorrectionRule(mistake({ correctionRule: '   ' }))).toBe(true);
    expect(needsCorrectionRule(mistake({ correctionRule: 'TBD' }))).toBe(true);
    expect(needsCorrectionRule(mistake({ correctionRule: 'none' }))).toBe(true);
  });

  it('does not count meaningful correction rules or resolved mistakes', () => {
    expect(needsCorrectionRule(mistake({ correctionRule: 'Always write the statutory trigger first.' }))).toBe(false);
    expect(needsCorrectionRule(mistake({ correctionRule: '', resolved: true }))).toBe(false);
  });

  it('keeps retest due soon logic focused on unresolved near-term mistakes', () => {
    const dueToday = mistake({ id: 'today', retestDate: todayIsoLocal() });
    const resolvedToday = mistake({ id: 'resolved', retestDate: todayIsoLocal(), resolved: true });
    const undated = mistake({ id: 'undated', retestDate: '' });
    const farFuture = mistake({ id: 'future', retestDate: '2999-01-01' });

    expect(mistakeRetestsDueSoon([dueToday, resolvedToday, undated, farFuture])).toEqual([dueToday]);
  });
});

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return todayIsoLocal(d);
}

describe('mistakeRetestsInWindow', () => {
  it('includes unresolved retests within the window', () => {
    const item = mistake({ retestDate: daysFromNow(15) });
    expect(mistakeRetestsInWindow([item], 30)).toEqual([item]);
  });

  it('excludes resolved mistakes', () => {
    const resolved = mistake({ retestDate: daysFromNow(5), resolved: true });
    expect(mistakeRetestsInWindow([resolved], 30)).toEqual([]);
  });

  it('includes overdue unresolved retests', () => {
    const overdue = mistake({ retestDate: daysFromNow(-5) });
    expect(mistakeRetestsInWindow([overdue], 30)).toEqual([overdue]);
  });

  it('does not crash on invalid or missing retest dates', () => {
    const noDate = mistake({ retestDate: '' });
    const badDate = mistake({ retestDate: 'not-a-date' });
    expect(() => mistakeRetestsInWindow([noDate, badDate], 30)).not.toThrow();
    expect(mistakeRetestsInWindow([noDate, badDate], 30)).toEqual([]);
  });

  it('excludes retests beyond the window', () => {
    const beyond = mistake({ retestDate: daysFromNow(31) });
    expect(mistakeRetestsInWindow([beyond], 30)).toEqual([]);
  });

  it('includes items due exactly today and exactly at the day boundary', () => {
    const today = mistake({ id: 'today', retestDate: daysFromNow(0) });
    const boundary = mistake({ id: 'boundary', retestDate: daysFromNow(30) });
    const result = mistakeRetestsInWindow([today, boundary], 30);
    expect(result.map((r) => r.id)).toContain('today');
    expect(result.map((r) => r.id)).toContain('boundary');
  });

  it('sorts results date ascending', () => {
    const later = mistake({ id: 'later', retestDate: daysFromNow(20) });
    const earlier = mistake({ id: 'earlier', retestDate: daysFromNow(5) });
    const overdue = mistake({ id: 'overdue', retestDate: daysFromNow(-2) });
    const result = mistakeRetestsInWindow([later, earlier, overdue], 30);
    expect(result.map((r) => r.id)).toEqual(['overdue', 'earlier', 'later']);
  });
});
