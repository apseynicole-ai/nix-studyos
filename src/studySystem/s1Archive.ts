// Semester 1 preservation (locked decision B: do NOT hard-delete S1 data).
//
// The existing `src/data/modules/*` dataset (Semester 1 + shells) is left completely
// untouched — the legacy Marks/Timer/Mistake pages still read it, and existing localStorage
// (marks state, timer sessions, tasks) is keyed by these module ids. This module only
// *describes* the S1 → S2 relationship so active S2 views can exclude archived S1 modules
// without deleting anything.

/** Module ids present in the legacy app dataset (`src/data/modules`). */
export const LEGACY_MODULE_IDS = [
  'finacc178',
  'econ114',
  'foundations178',
  'conlaw178',
  'legalskills114',
  'sds188',
  'dla112',
  'dla122',
  'lawpersons144',
  'law101',
  'toi142',
] as const;

/** Active Semester 2 module ids (mirrors the seed). */
export const ACTIVE_S2_MODULE_IDS = [
  'foundations178',
  'finacc178',
  'conlaw178',
  'lawpersons144',
  'econ144',
  'sds188',
  'toi142',
  'dla142',
  'dla152',
] as const;

/**
 * Legacy ids that are archived/read-only in Semester 2 (present in the S1 dataset, not in
 * the active S2 set). NOT deleted — historical marks/sessions/tasks may reference them.
 */
export const ARCHIVED_S1_MODULE_IDS = LEGACY_MODULE_IDS.filter(
  (id) => !(ACTIVE_S2_MODULE_IDS as readonly string[]).includes(id),
);

/** S1 → S2 continuity pointers (reference only; NO automatic data merge). */
export const S1_TO_S2_SUCCESSOR: Record<string, string | null> = {
  econ114: 'econ144',
  dla112: 'dla142',
  dla122: 'dla152',
  legalskills114: null, // Semester-1-only module; no S2 successor.
  law101: null, // placeholder shell; no successor.
};

export function isArchivedS1(moduleId: string): boolean {
  return (ARCHIVED_S1_MODULE_IDS as readonly string[]).includes(moduleId);
}

export function isActiveS2(moduleId: string): boolean {
  return (ACTIVE_S2_MODULE_IDS as readonly string[]).includes(moduleId);
}

export function successorOf(moduleId: string): string | null {
  return S1_TO_S2_SUCCESSOR[moduleId] ?? null;
}
