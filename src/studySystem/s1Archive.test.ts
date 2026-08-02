import { describe, expect, it } from 'vitest';
import {
  ACTIVE_S2_MODULE_IDS,
  ARCHIVED_S1_MODULE_IDS,
  isActiveS2,
  isArchivedS1,
  successorOf,
} from './s1Archive';
import { SEMESTER2_MODULES } from './seed/semester2';

describe('S1 preservation / archive map', () => {
  it('archives exactly the S1-only legacy modules (nothing active is archived)', () => {
    expect([...ARCHIVED_S1_MODULE_IDS].sort()).toEqual(
      ['dla112', 'dla122', 'econ114', 'law101', 'legalskills114'].sort(),
    );
  });

  it('keeps the active S2 set aligned with the seed', () => {
    expect([...ACTIVE_S2_MODULE_IDS].sort()).toEqual(SEMESTER2_MODULES.map((m) => m.id).sort());
  });

  it('never marks an active S2 module as archived', () => {
    for (const id of ACTIVE_S2_MODULE_IDS) {
      expect(isArchivedS1(id)).toBe(false);
      expect(isActiveS2(id)).toBe(true);
    }
  });

  it('exposes S1 -> S2 continuity pointers without merging data', () => {
    expect(successorOf('econ114')).toBe('econ144');
    expect(successorOf('dla112')).toBe('dla142');
    expect(successorOf('dla122')).toBe('dla152');
    expect(successorOf('legalskills114')).toBeNull();
    expect(successorOf('foundations178')).toBeNull();
  });
});
