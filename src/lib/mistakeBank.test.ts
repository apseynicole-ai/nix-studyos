import { describe, expect, it } from 'vitest';
import {
  mistakeRetestsDueSoon,
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
