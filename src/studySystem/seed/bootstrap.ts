// One-way Control-Centre bootstrap (spec §13/§15.9).
//
// Seeds ONLY the reference stores from the reviewed SEMESTER 2 seed constant. It is
// idempotent (safe to run repeatedly) and never touches the transactional stores
// (study sessions, activity log, in-app tasks, data-change audit) or user settings.
//
// Phase A intentionally exposes this as an explicit function — it is NOT wired to run on
// every app launch. A later phase decides when/how it is invoked and how re-sync diffs
// are surfaced for approval.

import {
  appStateRepo,
  assessmentsRepo,
  DEFAULT_APP_STATE,
  modulesRepo,
  scheduledActivitiesRepo,
  studyBlocksRepo,
  weeklyPlansRepo,
} from '../repositories';
import { STUDY_SYSTEM_SCHEMA_VERSION } from '../store';
import { seedRecurringBase } from '../recurring/weekGenerator';
import {
  ACTIVE_WEEK_ID,
  BOOTSTRAP_SOURCE_LABEL,
  SEMESTER2_ASSESSMENTS,
  SEMESTER2_MODULES,
  WEEK15_PLAN,
  WEEK15_SCHEDULED_ACTIVITIES,
  WEEK15_STUDY_BLOCKS,
} from './semester2';

export interface BootstrapResult {
  modules: number;
  assessments: number;
  scheduledActivities: number;
  studyBlocks: number;
  weeklyPlans: number;
  activeWeekId: string;
  source: string;
  bootstrappedAt: string;
}

/**
 * Idempotent upsert of the reference layer. Existing records with the same id are updated
 * (so a corrected seed propagates); records the user added are left untouched; NOTHING in
 * the transactional layer is read or written here.
 */
export function bootstrapSemester2(): BootstrapResult {
  modulesRepo.upsertMany(SEMESTER2_MODULES);
  assessmentsRepo.upsertMany(SEMESTER2_ASSESSMENTS);
  scheduledActivitiesRepo.upsertMany(WEEK15_SCHEDULED_ACTIVITIES);
  studyBlocksRepo.upsertMany(WEEK15_STUDY_BLOCKS);
  weeklyPlansRepo.upsertMany([WEEK15_PLAN]);
  seedRecurringBase(); // Phase D recurring timetable base (idempotent)

  const bootstrappedAt = new Date().toISOString();
  appStateRepo.update(
    {
      schemaVersion: STUDY_SYSTEM_SCHEMA_VERSION,
      currentWeekId: ACTIVE_WEEK_ID,
      bootstrapSource: BOOTSTRAP_SOURCE_LABEL,
      bootstrappedAt,
    },
    DEFAULT_APP_STATE,
  );

  return {
    modules: SEMESTER2_MODULES.length,
    assessments: SEMESTER2_ASSESSMENTS.length,
    scheduledActivities: WEEK15_SCHEDULED_ACTIVITIES.length,
    studyBlocks: WEEK15_STUDY_BLOCKS.length,
    weeklyPlans: 1,
    activeWeekId: ACTIVE_WEEK_ID,
    source: BOOTSTRAP_SOURCE_LABEL,
    bootstrappedAt,
  };
}

/** True once the reference layer has been seeded at least once. */
export function isBootstrapped(): boolean {
  return appStateRepo.read(DEFAULT_APP_STATE).bootstrappedAt != null && !modulesRepo.isEmpty();
}
