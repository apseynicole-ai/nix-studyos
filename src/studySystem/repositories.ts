// Concrete repository instances for each study-system store.
import { CollectionRepository, SingletonRepository, SS_KEYS } from './store';
import type {
  ActiveSession,
  ActivityLogEntry,
  Assessment,
  AppState,
  DataChangeAudit,
  Module,
  PendingSession,
  ScheduledActivity,
  StudyBlock,
  StudySession,
  StudyTask,
  WeeklyPlan,
} from './types';

export const modulesRepo = new CollectionRepository<Module>(SS_KEYS.modules);
export const assessmentsRepo = new CollectionRepository<Assessment>(SS_KEYS.assessments);
export const scheduledActivitiesRepo = new CollectionRepository<ScheduledActivity>(SS_KEYS.scheduledActivities);
export const studyBlocksRepo = new CollectionRepository<StudyBlock>(SS_KEYS.studyBlocks);
export const weeklyPlansRepo = new CollectionRepository<WeeklyPlan>(SS_KEYS.weeklyPlans);

export const studySessionsRepo = new CollectionRepository<StudySession>(SS_KEYS.studySessions);
export const activityLogRepo = new CollectionRepository<ActivityLogEntry>(SS_KEYS.activityLog);
export const tasksRepo = new CollectionRepository<StudyTask>(SS_KEYS.tasks);
export const dataChangeAuditRepo = new CollectionRepository<DataChangeAudit>(SS_KEYS.dataChangeAudit);

export const DEFAULT_APP_STATE: AppState = {
  schemaVersion: 1,
  currentWeekId: null,
  bootstrapSource: null,
  bootstrappedAt: null,
  lastResetAt: null,
};

export const appStateRepo = new SingletonRepository<AppState>(SS_KEYS.appState);

export const activeSessionRepo = new SingletonRepository<ActiveSession | null>(SS_KEYS.activeSession);
export const pendingSessionRepo = new SingletonRepository<PendingSession | null>(SS_KEYS.pendingSession);
