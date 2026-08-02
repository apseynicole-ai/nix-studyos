// BAccLLB Study System — Phase A structured data model.
//
// Locked-spec alignment (BACCLLB_APP_STUDY_SYSTEM_SPEC.md):
//  - Reference layer (seeded from the Control Centre, editable + audited): Module,
//    Assessment, ScheduledActivity, StudyBlock, WeeklyPlan.
//  - Transactional layer (user-generated, never overwritten by re-seed): StudySession,
//    ActivityLogEntry, StudyTask, DataChangeAudit, AppState.
//
// Phase A implements the *data* only. All percentages/totals are DERIVED on read in a
// later phase — none are stored here (spec §9 propagation).

export type ModuleArea = 'Accounting' | 'Law' | 'Economics' | 'Quantitative' | 'Digital' | 'Personal';
export type Semester = 'S1' | 'S2' | 'Year';

// --- Completion states (spec §1A / §11). Identical across log, calculations and UI. ---
export type CompletionState =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'PARTIALLY_COMPLETED'
  | 'MISSED'
  | 'CANCELLED';

// --- Attendance actions for classes (spec §2). ---
export type AttendanceState = 'ATTENDED' | 'MISSED' | 'CANCELLED';

// --- Scheduled-activity types + locked Daily-Completion weights (spec §1A). ---
export type ScheduledActivityType =
  | 'lecture'
  | 'tutorial'
  | 'practical'
  | 'compulsory'
  | 'optional';

// --- Study-session outcome (spec §3). ---
export type StudySessionStatus = 'COMPLETED' | 'PARTIALLY_COMPLETED' | 'COULD_NOT_COMPLETE';
export type StudyLocation = 'Room' | 'Library' | 'Campus' | 'Coffee shop' | 'Other';
export type CouldNotCompleteReason =
  | 'ran_out_of_time'
  | 'class_overran'
  | 'too_tired'
  | 'material_unclear'
  | 'needed_another_resource'
  | 'unexpected_commitment'
  | 'other';

// --- Task model (spec §8). ---
export type TaskCategory = 'MUST_DO' | 'SHOULD_DO' | 'NICE_TO_HAVE';
export type TaskPriority = 'P1' | 'P2' | 'P3';
export type TaskStatus = 'open' | 'done' | 'carried_over' | 'cancelled';
export type TaskSource =
  | 'ai_chat'
  | 'study_followup'
  | 'unplanned'
  | 'weekly_reset'
  | 'manual'
  | 'seed'
  | 'legacy_migration';

// --- Reference layer -------------------------------------------------------------

export interface Module {
  id: string;
  code: string;
  name: string;
  shortName: string;
  area: ModuleArea;
  semester: Semester;
  /** Nominal per-week private-study budget in minutes (WeeklyPlan overrides per week). */
  defaultWeeklyMinutes: number;
  /** User-chosen planning target (%). Optional — NOT seeded, not an authoritative academic
   *  fact. Absent unless Nicole sets it in preferences. */
  target?: number | null;
  active: boolean;
  colour: string;
  /** Cross-semester continuity pointer (e.g. S1 predecessor id), for reference only. */
  predecessorId?: string;
  notes?: string;
}

export interface Assessment {
  id: string;
  moduleId: string;
  label: string;
  /** ISO date (YYYY-MM-DD) or null when the source says TBC / ⚪ (never invented). */
  date: string | null;
  /** HH:mm when concrete, else null. `timeNote` carries source phrasing like "invigilated". */
  time: string | null;
  timeNote?: string;
  /** Weight as a fraction (0..1) when known, else null. */
  weight: number | null;
  weightNote?: string;
  wholeYear: boolean;
  format?: string;
  venue?: string | null;
  source: string;
  needsVerification: boolean;
  notes?: string;
}

export interface ScheduledActivity {
  id: string;
  moduleId: string;
  type: ScheduledActivityType;
  /** ISO date for the specific occurrence. */
  date: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  venue?: string | null;
  /** Locked Daily-Completion weight (spec §1A): lecture/tut/practical = 1, optional = 0. */
  weight: number;
  required: boolean;
  /** Stable key for regenerating a recurring item across weeks. */
  recurrenceKey?: string;
  notes?: string;
}

export interface StudyBlock {
  id: string;
  moduleId: string;
  date: string;      // ISO date
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  plannedMinutes: number;
  /** The block's purpose/output (spec §1A dedup anchor). */
  taskText: string;
  linkedTaskId?: string | null;
  /** When set, this block is the planned work for an assessment/milestone; completing it
   *  satisfies that obligation so the assessment is not counted again on its due date (§2.3). */
  linkedAssessmentId?: string | null;
  /** Locked Daily-Completion weight for a planned private-study block (spec §1A) = 2. */
  weight: number;
  /** Drives §1A deduplication — true only when it is an obligation beyond the block. */
  isIndependentObligation: boolean;
  notes?: string;
}

export interface WeeklyPlan {
  id: string;        // e.g. "2026-W15"
  weekStart: string; // ISO date (Monday)
  weekEnd: string;   // ISO date (Sunday)
  objective: string;
  /** moduleId -> planned private-study minutes for the week (authoritative for the week). */
  perModuleBudgetMinutes: Record<string, number>;
  totalPlannedMinutes: number;
  frozen: boolean;
  archivedAt?: string | null;
  notes?: string;
}

// --- Transactional layer ---------------------------------------------------------

export interface StudySession {
  id: string;
  moduleId: string;
  studyBlockId: string | null; // null = unplanned (spec §4)
  date: string;
  startedAt: string;  // ISO timestamp
  stoppedAt: string;  // ISO timestamp
  /** Exact elapsed minutes stored (spec §1B/§15.4); rounding is display-only. */
  exactMinutes: number;
  status: StudySessionStatus;
  location: StudyLocation | null;
  output?: string;
  followUpRequired: boolean;
  followUpText?: string;
  notCompletedReason?: CouldNotCompleteReason | null;
  planned: boolean;
  source: TaskSource;
  createdAt: string;
}

export interface ActivityLogEntry {
  id: string;
  date: string;
  moduleId: string;
  activityType: ScheduledActivityType;
  scheduledActivityId?: string | null;
  scheduledTime?: string | null;
  state: CompletionState;
  attendance?: AttendanceState;
  note?: string;
  createdAt: string;
}

export interface StudyTask {
  id: string;
  moduleId: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate?: string | null;
  status: TaskStatus;
  source: TaskSource;
  createdAt: string;
  completedAt?: string | null;
  linkedStudyBlockId?: string | null;
  linkedAssessmentId?: string | null;
  /** Explicit current-week association (e.g. "2026-W15"). Null/absent = not week-assigned;
   *  week membership then falls back to due date / linked block (spec §4.1 current-week scope). */
  plannedWeekId?: string | null;
  carriedOver: boolean;
  carryOverFromId?: string | null;
  why?: string;
  /** Preserved payload when a task is migrated from the legacy `baccllb-tasks` store. */
  legacy?: Record<string, unknown>;
}

export interface DataChangeAudit {
  id: string;
  entity: 'assessment' | 'scheduledActivity' | 'module' | 'studyBlock' | 'weeklyPlan';
  entityId: string;
  moduleId?: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changedAt: string;
  sourceText?: string;
  approvedAt: string;
  approvedBy?: string;
}

/** A running count-up study session (persisted; time derived from `startedAt`). */
export interface ActiveSession {
  id: string;
  moduleId: string;
  studyBlockId: string | null;
  startedAt: string; // ISO timestamp
  planned: boolean;
  source: TaskSource;
}

/** A stopped-but-not-yet-completed session awaiting the post-session sheet. */
export interface PendingSession {
  id: string;
  moduleId: string;
  studyBlockId: string | null;
  startedAt: string;
  stoppedAt: string;
  exactMinutes: number;
  planned: boolean;
  source: TaskSource;
}

/** Details captured in the post-session sheet (spec §3). */
export interface SessionCompletion {
  status: StudySessionStatus;
  location: StudyLocation | null;
  output?: string;
  followUpRequired: boolean;
  followUpText?: string;
  notCompletedReason?: CouldNotCompleteReason | null;
}

// --- Recurring timetable layer (Phase D) ----------------------------------------

export type RecurringActivityType = 'lecture' | 'practical' | 'async' | 'optional_qa' | 'support';

/** A recurring timetable commitment (Nicole's confirmed personal MySUN schedule). */
export interface RecurringActivity {
  id: string;            // stable recurrence id
  moduleId: string;
  activityType: RecurringActivityType;
  dayOfWeek: number;     // 1 = Monday … 7 = Sunday (ISO)
  startTime: string;
  endTime: string;
  venue?: string | null;
  required: boolean;
  weight: number;        // Daily-Completion weight (lecture/practical = 1; optional = 0)
  validFrom: string;     // ISO date
  validUntil?: string | null;
  source: string;
  notes?: string;
}

/** A tutorial ALLOCATION — who/group/day/time/venue. Separate from OCCURRENCE. */
export interface TutorialAllocation {
  id: string;
  moduleId: string;
  group: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  venue?: string | null; // may be null / TBC
  source: string;
  notes?: string;
}

export type TutorialOccurrenceStatus = 'CONFIRMED_ACTIVE' | 'CONFIRMED_NOT_ACTIVE' | 'TBC';

/** Whether a given tutorial allocation actually runs in a given week. */
export interface TutorialOccurrence {
  id: string;            // `${allocationId}:${weekId}`
  allocationId: string;
  weekId: string;
  status: TutorialOccurrenceStatus;
  source: string;
}

/** A week-agnostic study-block time slot; the generator stamps dates onto it. */
export interface StudyBlockTemplate {
  id: string;            // stable template id
  moduleId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  plannedMinutes: number;
  linkedAssessmentId?: string | null;
}

export type VerificationKind = 'tutorial_tbc' | 'conflict' | 'content_tbc' | 'allocation_check';

/** A TBC / action item surfaced by week generation (a lightweight inbox). */
export interface VerificationItem {
  id: string;            // deterministic per week
  weekId: string;
  kind: VerificationKind;
  moduleId?: string;
  title: string;
  detail?: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

export type ConflictSeverity = 'hard' | 'soft';

/** A detected schedule conflict (never auto-resolved). */
export interface WeekConflict {
  id: string;
  weekId: string;
  date: string;
  aLabel: string;
  bLabel: string;
  severity: ConflictSeverity;
  reason: string;
}

export interface AppState {
  schemaVersion: number;
  currentWeekId: string | null;
  bootstrapSource: string | null; // e.g. "SEMESTER 2 APP BOOTSTRAP SOURCE — V1"
  bootstrappedAt: string | null;
  lastResetAt?: string | null;
}
