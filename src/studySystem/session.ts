// Persisted count-up study-session logger (spec §3, §4, §11).
//
// Timing is derived from persisted timestamps (never an in-memory counter), so a running
// session survives refresh / background / reopen. Exactly one session may run at a time
// (guard against a second START and against a duplicate for another module). Elapsed minutes
// are stored EXACT (spec §1B); display rounding happens elsewhere.

import { activeSessionRepo, assessmentsRepo, pendingSessionRepo, studyBlocksRepo, studySessionsRepo } from './repositories';
import { resolveWeekId } from './currentWeek';
import { createTask } from './tasks';
import type {
  ActiveSession,
  PendingSession,
  SessionCompletion,
  StudySession,
  StudyLocation,
  StudySessionStatus,
  TaskPriority,
  TaskSource,
} from './types';

const H48_MS = 48 * 60 * 60 * 1000;

/** Locked follow-up escalation (spec §3/§15.5): P1 when a module assessment/submission is due
 *  within 48 h of the session; otherwise the P2 default. */
export function followUpPriority(moduleId: string, onDate: string): TaskPriority {
  const anchor = Date.parse(`${onDate}T00:00:00`);
  const dueSoon = assessmentsRepo.read().some((a) => {
    if (a.moduleId !== moduleId || !a.date) return false;
    const due = Date.parse(`${a.date}T23:59:59`);
    return due >= anchor && due - anchor <= H48_MS;
  });
  return dueSoon ? 'P1' : 'P2';
}

function newId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getActiveSession(): ActiveSession | null {
  return activeSessionRepo.read(null);
}

export function getPendingSession(): PendingSession | null {
  return pendingSessionRepo.read(null);
}

export function elapsedSeconds(active: ActiveSession, now: number = Date.now()): number {
  return Math.max(0, (now - Date.parse(active.startedAt)) / 1000);
}

export interface StartSessionInput {
  moduleId: string;
  studyBlockId?: string | null;
  planned?: boolean;
  source?: TaskSource;
}

export class SessionConflictError extends Error {}

/** Begin a count-up session. Throws if one is already active or awaiting completion. */
export function startSession(input: StartSessionInput, now: number = Date.now()): ActiveSession {
  if (getActiveSession()) {
    throw new SessionConflictError('A study session is already running. Stop it before starting another.');
  }
  if (getPendingSession()) {
    throw new SessionConflictError('Finish logging your last session before starting a new one.');
  }
  const active: ActiveSession = {
    id: newId('sess'),
    moduleId: input.moduleId,
    studyBlockId: input.studyBlockId ?? null,
    startedAt: new Date(now).toISOString(),
    planned: input.planned ?? input.studyBlockId != null,
    source: input.source ?? 'manual',
  };
  activeSessionRepo.write(active);
  return active;
}

/** Stop the running session and move it to a pending state awaiting the post-session sheet. */
export function stopSession(now: number = Date.now()): PendingSession | null {
  const active = getActiveSession();
  if (!active) return null;
  const startedMs = Date.parse(active.startedAt);
  const exactMinutes = Math.max(0, (now - startedMs) / 60000);
  const pending: PendingSession = {
    id: active.id,
    moduleId: active.moduleId,
    studyBlockId: active.studyBlockId,
    startedAt: active.startedAt,
    stoppedAt: new Date(now).toISOString(),
    exactMinutes,
    planned: active.planned,
    source: active.source,
  };
  pendingSessionRepo.write(pending);
  activeSessionRepo.write(null);
  return pending;
}

/** Discard a running session without recording it. */
export function cancelActiveSession(): void {
  activeSessionRepo.write(null);
}

/** Discard a stopped-but-unsaved session. */
export function discardPendingSession(): void {
  pendingSessionRepo.write(null);
}

function persistSession(session: StudySession, completion: SessionCompletion): StudySession {
  studySessionsRepo.upsert(session);
  // Follow-up capture (spec §3 / §15.5): default MUST DO / P2, escalated to P1 when due ≤48h.
  if (completion.followUpRequired && completion.followUpText?.trim()) {
    const block = session.studyBlockId ? studyBlocksRepo.getById(session.studyBlockId) : undefined;
    createTask({
      moduleId: session.moduleId,
      title: completion.followUpText.trim(),
      category: 'MUST_DO',
      priority: followUpPriority(session.moduleId, session.date),
      source: 'study_followup',
      linkedStudyBlockId: session.studyBlockId,
      linkedAssessmentId: block?.linkedAssessmentId ?? null,
      plannedWeekId: resolveWeekId(session.date),
    });
  }
  return session;
}

/** Finalise the pending session with the post-session details; optionally create a follow-up task. */
export function completeSession(completion: SessionCompletion): StudySession | null {
  const pending = getPendingSession();
  if (!pending) return null;
  const session: StudySession = {
    id: pending.id,
    moduleId: pending.moduleId,
    studyBlockId: pending.studyBlockId,
    date: pending.startedAt.slice(0, 10),
    startedAt: pending.startedAt,
    stoppedAt: pending.stoppedAt,
    exactMinutes: pending.exactMinutes,
    status: completion.status,
    location: completion.location,
    output: completion.output?.trim() || undefined,
    followUpRequired: completion.followUpRequired,
    followUpText: completion.followUpText?.trim() || undefined,
    notCompletedReason: completion.notCompletedReason ?? null,
    planned: pending.planned,
    source: pending.source,
    createdAt: new Date().toISOString(),
  };
  persistSession(session, completion);
  pendingSessionRepo.write(null);
  return session;
}

export interface UnplannedActivityInput {
  moduleId: string;
  minutes: number;
  status: StudySessionStatus;
  location: StudyLocation | null;
  output?: string;
  followUpRequired?: boolean;
  followUpText?: string;
}

/** `+ LOG ACTIVITY` — manual unplanned study (spec §4). Counts toward time/progress; does
 *  NOT touch any planned block. */
export function logUnplannedActivity(input: UnplannedActivityInput, now: number = Date.now()): StudySession {
  const minutes = Math.max(0, input.minutes);
  const startedAt = new Date(now - minutes * 60000).toISOString();
  const stoppedAt = new Date(now).toISOString();
  const completion: SessionCompletion = {
    status: input.status,
    location: input.location,
    output: input.output,
    followUpRequired: !!input.followUpRequired,
    followUpText: input.followUpText,
  };
  const session: StudySession = {
    id: newId('unplanned'),
    moduleId: input.moduleId,
    studyBlockId: null,
    date: startedAt.slice(0, 10),
    startedAt,
    stoppedAt,
    exactMinutes: minutes,
    status: input.status,
    location: input.location,
    output: input.output?.trim() || undefined,
    followUpRequired: !!input.followUpRequired,
    followUpText: input.followUpText?.trim() || undefined,
    notCompletedReason: null,
    planned: false,
    source: 'unplanned',
    createdAt: stoppedAt,
  };
  return persistSession(session, completion);
}

// --- Read helpers ----------------------------------------------------------------

export function getSessionsForDate(date: string): StudySession[] {
  return studySessionsRepo.read().filter((s) => s.date === date);
}

/** Latest recorded session linked to a planned study block, if any. */
export function getSessionForBlock(studyBlockId: string): StudySession | undefined {
  return studySessionsRepo
    .read()
    .filter((s) => s.studyBlockId === studyBlockId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

/** Exact total private-study minutes logged on a date (spec §1B — private study only). */
export function totalActualMinutesForDate(date: string): number {
  return getSessionsForDate(date).reduce((sum, s) => sum + s.exactMinutes, 0);
}
