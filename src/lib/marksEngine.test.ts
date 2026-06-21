import { describe, expect, it } from 'vitest';
import {
  calcConLaw178,
  calcDLA112,
  calcDLA122,
  calcDLA122LatePenalty,
  calcEcon114,
  calcFinAcc178,
  calcLegalSkills114,
  calcSDS188,
  getModuleAssessmentModel,
} from './marksEngine';
import { calculateModuleMarksOutput, type ModuleDraftState } from './marksOutput';

function completed(mark: number, extra: Partial<ModuleDraftState['assessments'][string]> = {}) {
  return {
    completed: true,
    status: 'completed' as const,
    mark: String(mark),
    validSubmission: true,
    hoursLate: '',
    notes: '',
    ...extra,
  };
}

describe('marks engine calculators', () => {
  it('calculates Economics 114 A3 substitution without capping A3 at 50', () => {
    const output = calcEcon114({ a1: 50, a2: null, a3: 70 });

    expect(output.fm1).toBeNull();
    expect(output.fm2).toBe(62);
    expect(output.fm).toBe(62);
    expect(output.isValidFM).toBe(true);
    expect(output.selfCheck.some((line) => line.includes('expected 62') && line.includes('PASS'))).toBe(true);
  });

  it('marks DLA112 invalid when A1 is missing even if A2 is present', () => {
    const output = calcDLA112({ af: 80, a1: null, a2: 70, a3: null });

    expect(output.mtd).toBeNull();
    expect(output.fm1).toBeNull();
    expect(output.fm).toBeNull();
    expect(output.isValidFM).toBe(false);
    expect(output.warnings).toEqual(expect.arrayContaining([
      expect.stringContaining('A1 not completed'),
      expect.stringContaining('complete at least two main assessments'),
    ]));
  });

  it('allows DLA112 A3 to replace a missed A2 when A1 exists', () => {
    const output = calcDLA112({ af: 80, a1: 60, a2: null, a3: 70 });

    expect(output.mtd).toBe(64);
    expect(output.fm1).toBeNull();
    expect(output.fm2).toBe(67);
    expect(output.fm).toBe(67);
    expect(output.isValidFM).toBe(true);
  });

  it('applies DLA122 late penalties before FM calculation', () => {
    const output = calcDLA122({
      af: 75,
      a1: 60,
      a1Valid: true,
      a2: 55,
      a2Valid: true,
      a3: null,
      hoursLateA1: 10,
    });

    expect(calcDLA122LatePenalty(10)).toBe(15);
    expect(output.fm1).toBe(55.5);
    expect(output.fm).toBe(55.5);
    expect(output.isValidFM).toBe(true);
    expect(output.warnings).toContain('A1 submitted 10h late — 15 marks deducted.');
  });

  it('keeps the DLA122 subminimum gate closed when A2 is invalid', () => {
    const output = calcDLA122({
      af: 75,
      a1: 60,
      a1Valid: true,
      a2: 55,
      a2Valid: false,
      a3: 90,
    });

    expect(output.fm1).toBeNull();
    expect(output.fm2).toBeNull();
    expect(output.fm).toBeNull();
    expect(output.isValidFM).toBe(false);
    expect(output.warnings).toEqual(expect.arrayContaining([
      expect.stringContaining('A2 submitted but flagged invalid'),
      expect.stringContaining('A3 cannot rescue'),
      expect.stringContaining('subminimum requirements not met'),
    ]));
  });

  it('treats the DLA122 AF input as the pre-computed best-4-of-6 average', () => {
    const output = calculateModuleMarksOutput('dla122', {
      assessments: {
        AF: completed(75),
        A1: completed(60),
        A2: completed(55),
      },
    });

    expect(output?.fm1).toBe(60.75);
    expect(output?.fm).toBe(60.75);
    expect(output?.isValidFM).toBe(true);
  });

  it('calculates Financial Accounting 178 year-module FM1 with all main assessments present', () => {
    const output = calcFinAcc178({
      a1s1: 60,
      a2s1: 65,
      a1s2: 55,
      afs2: 80,
      a2s2: 70,
      a3: null,
    });

    expect(output.my).toBe(62.86);
    expect(output.fm1).toBe(65);
    expect(output.fm).toBe(65);
    expect(output.isValidFM).toBe(true);
  });

  it('uses Financial Accounting 178 variable A3 weight for multiple missed mains', () => {
    const output = calcFinAcc178({
      a1s1: null,
      a2s1: null,
      a1s2: 55,
      afs2: 80,
      a2s2: 70,
      a3: 90,
    });

    expect(output.fm1).toBeNull();
    expect(output.fm2).toBe(74.5);
    expect(output.fm).toBe(74.5);
    expect(output.isValidFM).toBe(true);
    expect(output.warnings).toContain('A3 variable weight: 35% (missed: A1S1, A2S1).');
  });

  it('calculates SDS188 year-module FM2 when A2S2 is missed and A3 is written', () => {
    const output = calcSDS188({
      afs1: 50,
      a1s1: 25,
      a2s1: 40,
      afs2: 50,
      a1s2: 55,
      a2s2: null,
      a3: 66,
    });

    expect(output.fm1).toBeNull();
    expect(output.fm2).toBe(52.41);
    expect(output.fm).toBe(52.41);
    expect(output.isValidFM).toBe(true);
    expect(output.warnings).toContain('A2S2 not written — FM1 not available.');
  });

  it('calculates Con Law Scenario A when exactly one main assessment is missed', () => {
    const output = calcConLaw178({
      afs1: 70,
      a1s1: 60,
      a2s1: 75,
      afs2: 65,
      a1s2: 55,
      a2s2: null,
      a3: 65,
    });

    expect(output.fm2).toBe(64.5);
    expect(output.fm).toBe(64.5);
    expect(output.isValidFM).toBe(true);
    expect(output.warnings).toContain('Scenario A: A3 substitutes for missed A2S2 (weight 30%). FM is not capped at 50.');
  });

  it('calculates Con Law Scenario B when exactly two main assessments are missed', () => {
    const output = calcConLaw178({
      afs1: 70,
      a1s1: 60,
      a2s1: null,
      afs2: 65,
      a1s2: 55,
      a2s2: null,
      a3: 60,
    });

    expect(output.fm2).toBe(60);
    expect(output.fm).toBe(60);
    expect(output.isValidFM).toBe(true);
    expect(output.warnings).toContain('Scenario B: A3 carries combined weight of two missed mains (A2S1, A2S2) = 50%. FM is not capped at 50.');
  });

  it('caps Con Law Scenario C supplementary rescue at 50', () => {
    const output = calcConLaw178({
      afs1: 40,
      a1s1: 100,
      a2s1: 100,
      afs2: 40,
      a1s2: 1,
      a2s2: 20,
      a3: 100,
    });

    expect(output.fm1).toBe(47.2);
    expect(output.fm2).toBe(50);
    expect(output.fm).toBe(50);
    expect(output.isValidFM).toBe(true);
    expect(output.warnings).toEqual(expect.arrayContaining([
      expect.stringContaining('Scenario C'),
      expect.stringContaining('FM capped at 50'),
    ]));
  });

  it('applies Con Law Scenario D hard cap and invalid warning when more than two mains are missed', () => {
    const output = calcConLaw178({
      afs1: 70,
      a1s1: null,
      a2s1: null,
      afs2: 65,
      a1s2: null,
      a2s2: 40,
      a3: 80,
    });

    expect(output.fm2).toBe(45);
    expect(output.fm).toBeNull();
    expect(output.isValidFM).toBe(false);
    expect(output.warnings).toEqual(expect.arrayContaining([
      expect.stringContaining('Scenario D'),
      expect.stringContaining('hard-capped at 45'),
      expect.stringContaining('at least three main summative assessment opportunities required'),
    ]));
  });

  it('calculates Legal Skills 114 continuous weighted FM when all components are complete', () => {
    const output = calcLegalSkills114({
      rt: 80,
      lw: 75,
      ao: 70,
      t1: 65,
      t2: 60,
      ae: 55,
      mq: 70,
    });

    expect(output.mtd).toBe(63.75);
    expect(output.fm1).toBe(63.75);
    expect(output.fm).toBe(63.75);
    expect(output.isValidFM).toBe(true);
  });

  it('warns that Legal Skills 114 missing components make the FM invalid', () => {
    const output = calcLegalSkills114({
      rt: 80,
      lw: 75,
      ao: 70,
      t1: 65,
      t2: 60,
      ae: null,
      mq: 70,
    });

    expect(output.mtd).toBe(47.25);
    expect(output.fm).toBeNull();
    expect(output.isValidFM).toBe(false);
    expect(output.warnings).toEqual(expect.arrayContaining([
      expect.stringContaining('Academic Essay (30%)'),
      expect.stringContaining('INVALID FM: all 7 continuous assessment components required'),
    ]));
  });

  it('keeps Foundations 178 separate and explicitly verification-sensitive', () => {
    const foundationsModel = getModuleAssessmentModel('foundations178');
    const conLawOutput = calcConLaw178({
      afs1: 70,
      a1s1: 60,
      a2s1: 75,
      afs2: 65,
      a1s2: 55,
      a2s2: null,
      a3: 65,
    });
    const foundationsOutput = calculateModuleMarksOutput('foundations178', {
      assessments: {
        AFS1: completed(70),
        A1S1: completed(60),
        A2S1: completed(75),
        AFS2: completed(65),
        A1S2: completed(55),
        A3: completed(65),
      },
    });

    expect(foundationsModel?.moduleId).toBe('foundations178');
    expect(foundationsModel?.needsVerification).toBe(true);
    expect(foundationsModel?.cautionaryNotes).toEqual(expect.arrayContaining([
      expect.stringContaining('Foundations of Law 178 is currently using the public-law flexible-year assessment model'),
    ]));
    expect(foundationsOutput?.fm).toBe(conLawOutput.fm);
    expect(foundationsOutput?.isValidFM).toBe(conLawOutput.isValidFM);
  });
});
