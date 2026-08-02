// BAccLLB Study System (Phase A) — public surface.
export * from './types';
export * from './store';
export * from './repositories';
export * from './tasks';
export * from './s1Archive';
export * from './display';
export * from './attendance';
export * from './session';
export * from './studyBlocks';
export * from './dayView';
export * from './logView';
export * from './dailyCompletion';
export * from './studyTime';
export * from './moduleWeekly';
export * from './moduleStatus';
export * from './conflicts';
export * from './currentWeek';
export * from './weeklyReset';
export * from './recurring/weekGenerator';
export {
  RECURRING_ACTIVITIES,
  TUTORIAL_ALLOCATIONS,
  TUTORIAL_OCCURRENCES,
  STUDY_BLOCK_TEMPLATE,
  WEEK_BUDGET,
} from './recurring/timetableSeed';
export { bootstrapSemester2, isBootstrapped, type BootstrapResult } from './seed/bootstrap';
export {
  BOOTSTRAP_SOURCE_LABEL,
  ACTIVE_WEEK_ID,
  SEMESTER2_MODULES,
  SEMESTER2_ASSESSMENTS,
  WEEK15_SCHEDULED_ACTIVITIES,
  WEEK15_STUDY_BLOCKS,
  WEEK15_PLAN,
} from './seed/semester2';
