// Attendance logging for scheduled activities (spec §2 / §11 mapping).
// One ActivityLogEntry per scheduled-activity occurrence; re-logging updates in place.

import { activityLogRepo } from './repositories';
import type { ActivityLogEntry, AttendanceState, CompletionState, ScheduledActivity } from './types';

// Locked UI-action -> completion-state mapping (spec §11).
export function attendanceToCompletion(state: AttendanceState): CompletionState {
  switch (state) {
    case 'ATTENDED':
      return 'COMPLETED';
    case 'MISSED':
      return 'MISSED';
    case 'CANCELLED':
      return 'CANCELLED';
  }
}

function entryId(activityId: string): string {
  return `att-${activityId}`;
}

export function getAttendanceFor(activityId: string): ActivityLogEntry | undefined {
  return activityLogRepo.getById(entryId(activityId));
}

/** One-tap attendance. Idempotent per activity; changing the choice updates the record. */
export function logAttendance(
  activity: ScheduledActivity,
  state: AttendanceState,
  note?: string,
): ActivityLogEntry {
  const existing = getAttendanceFor(activity.id);
  const now = new Date().toISOString();
  const entry: ActivityLogEntry = {
    id: entryId(activity.id),
    date: activity.date,
    moduleId: activity.moduleId,
    activityType: activity.type,
    scheduledActivityId: activity.id,
    scheduledTime: activity.startTime,
    state: attendanceToCompletion(state),
    attendance: state,
    note: note?.trim() || existing?.note,
    createdAt: existing?.createdAt ?? now,
  };
  activityLogRepo.upsert(entry);
  return entry;
}

/** Undo an attendance log (return the item to NOT STARTED). */
export function clearAttendance(activityId: string): void {
  activityLogRepo.remove(entryId(activityId));
}
