// Assembles the chronological TODAY feed for a date from the reference layer + logs.
// Read-only projection — it derives display state, it does not store anything.

import { getAttendanceFor } from './attendance';
import { getActiveSession, getSessionForBlock, getSessionsForDate } from './session';
import { scheduledActivitiesRepo, studyBlocksRepo } from './repositories';
import type {
  ActivityLogEntry,
  CompletionState,
  ScheduledActivity,
  StudyBlock,
  StudySession,
} from './types';

export interface ClassFeedItem {
  kind: 'class';
  sortTime: string;
  activity: ScheduledActivity;
  attendance?: ActivityLogEntry;
  state: CompletionState;
}

export interface StudyFeedItem {
  kind: 'study';
  sortTime: string;
  block: StudyBlock;
  session?: StudySession;
  isRunning: boolean;
  state: CompletionState;
}

export type DayFeedItem = ClassFeedItem | StudyFeedItem;

function classState(item?: ActivityLogEntry): CompletionState {
  return item?.state ?? 'NOT_STARTED';
}

function studyState(session: StudySession | undefined, isRunning: boolean): CompletionState {
  if (isRunning) return 'IN_PROGRESS';
  if (!session) return 'NOT_STARTED';
  if (session.status === 'COMPLETED') return 'COMPLETED';
  if (session.status === 'PARTIALLY_COMPLETED') return 'PARTIALLY_COMPLETED';
  // COULD_NOT_COMPLETE counts as an incomplete result (spec §11) — 0% for later progress.
  return 'NOT_STARTED';
}

export function buildDayFeed(date: string): DayFeedItem[] {
  const active = getActiveSession();

  const classItems: ClassFeedItem[] = scheduledActivitiesRepo
    .read()
    .filter((a) => a.date === date)
    .map((activity) => {
      const attendance = getAttendanceFor(activity.id);
      return { kind: 'class', sortTime: activity.startTime, activity, attendance, state: classState(attendance) };
    });

  const studyItems: StudyFeedItem[] = studyBlocksRepo
    .read()
    .filter((b) => b.date === date)
    .map((block) => {
      const session = getSessionForBlock(block.id);
      const isRunning = !!active && active.studyBlockId === block.id;
      return { kind: 'study', sortTime: block.startTime, block, session, isRunning, state: studyState(session, isRunning) };
    });

  return [...classItems, ...studyItems].sort(
    (a, b) => a.sortTime.localeCompare(b.sortTime) || (a.kind === 'class' ? -1 : 1),
  );
}

export interface DaySummary {
  date: string;
  plannedStudyMinutes: number;
  actualStudyMinutes: number; // exact
  plannedBlocks: number;
  completedBlocks: number;
}

export function buildDaySummary(date: string): DaySummary {
  const blocks = studyBlocksRepo.read().filter((b) => b.date === date);
  const sessions: StudySession[] = getSessionsForDate(date);
  const plannedStudyMinutes = blocks.reduce((s, b) => s + b.plannedMinutes, 0);
  const actualStudyMinutes = sessions.reduce((s, x) => s + x.exactMinutes, 0);
  const completedBlocks = blocks.filter((b) => {
    const session = getSessionForBlock(b.id);
    return session?.status === 'COMPLETED' || session?.status === 'PARTIALLY_COMPLETED';
  }).length;
  return { date, plannedStudyMinutes, actualStudyMinutes, plannedBlocks: blocks.length, completedBlocks };
}
