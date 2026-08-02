// LOCKED module status engine (spec §10 / §5) + SPEC CLARIFICATION V1.0.1 (Phase C.1):
//
//   Full-week Module Weekly Completion % (moduleWeekly.ts) is UNCHANGED — it remains the
//   full-week progress indicator. STATUS, however, answers a different question — "am I
//   currently on pace?" — and is computed on a PACE-TO-DATE basis: only obligations whose
//   scheduled end / due time has already passed are considered. Future planned work can
//   never make a module BEHIND, and a current-day obligation is not "late" before its end
//   time. The locked serious overrides still always win.

import { getAttendanceFor } from './attendance';
import { getSessionForBlock } from './session';
import { listActiveTasks } from './tasks';
import { scheduledActivitiesRepo, studyBlocksRepo } from './repositories';
import { isCompulsoryAction, computeModuleWeekly, currentWeekMustDoTasks, type ModuleWeeklyResult } from './moduleWeekly';
import { contribution } from './dailyCompletion';
import type { CompletionState, WeeklyPlan } from './types';

export type ModuleStatus = 'BASELINE_UNKNOWN' | 'ON_TRACK' | 'AT_RISK' | 'BEHIND';

export interface StatusInputs {
  /** pace-to-date completion % of obligations already due; null = nothing due yet. */
  pacePercent: number | null;
  hasEvidence: boolean; // the module has weekly obligations at all
  hasP1Backlog: boolean;
  hasOverdueMustDo: boolean;
  hasMeaningfulP2Backlog: boolean;
  missedCompulsory: boolean;
}

const ORDER: ModuleStatus[] = ['ON_TRACK', 'AT_RISK', 'BEHIND'];

/** Pure resolution: pace band, then overrides escalate to the more serious state. */
export function resolveStatus(input: StatusInputs): ModuleStatus {
  if (!input.hasEvidence) return 'BASELINE_UNKNOWN';

  // Nothing due yet → trivially on pace (no false BEHIND from future work).
  let level = input.pacePercent === null ? 0 : input.pacePercent >= 80 ? 0 : input.pacePercent >= 50 ? 1 : 2;

  if (input.hasOverdueMustDo) level = Math.max(level, 1);      // → at least AT RISK
  if (input.hasMeaningfulP2Backlog) level = Math.max(level, 1); // → at least AT RISK
  if (input.hasP1Backlog) level = Math.max(level, 2);          // → BEHIND
  if (input.missedCompulsory) level = Math.max(level, 2);      // → BEHIND

  return ORDER[level];
}

function blockState(blockId: string): CompletionState {
  const s = getSessionForBlock(blockId);
  if (!s) return 'NOT_STARTED';
  if (s.status === 'COMPLETED') return 'COMPLETED';
  if (s.status === 'PARTIALLY_COMPLETED') return 'PARTIALLY_COMPLETED';
  return 'NOT_STARTED';
}

const deadlineMs = (date: string, endTime: string) => Date.parse(`${date}T${endTime}:00`);
const endOfDayMs = (date: string) => Date.parse(`${date}T23:59:59`);

/** Pace-to-date completion for a module: mean contribution over obligations already due. */
export function modulePace(moduleId: string, plan: WeeklyPlan, now: number): number | null {
  const dueStates: CompletionState[] = [];

  for (const b of studyBlocksRepo.read()) {
    if (b.moduleId !== moduleId || b.date < plan.weekStart || b.date > plan.weekEnd) continue;
    if (deadlineMs(b.date, b.endTime) <= now) dueStates.push(blockState(b.id));
  }

  for (const a of scheduledActivitiesRepo.read()) {
    if (a.moduleId !== moduleId || a.date < plan.weekStart || a.date > plan.weekEnd || !isCompulsoryAction(a)) continue;
    if (deadlineMs(a.date, a.endTime) <= now) dueStates.push(getAttendanceFor(a.id)?.state ?? 'NOT_STARTED');
  }

  for (const t of currentWeekMustDoTasks(moduleId, plan)) {
    const due = t.dueDate ? endOfDayMs(t.dueDate) : endOfDayMs(plan.weekEnd);
    if (due <= now) dueStates.push(t.status === 'done' ? 'COMPLETED' : 'NOT_STARTED');
  }

  const counted = dueStates.filter((s) => s !== 'CANCELLED');
  if (counted.length === 0) return null;
  return Math.round((counted.reduce((sum, s) => sum + contribution(s), 0) / counted.length) * 100);
}

const P2_MEANINGFUL_THRESHOLD = 2;

export function buildStatusInputs(moduleId: string, weekly: ModuleWeeklyResult, plan: WeeklyPlan, today: string, now: number): StatusInputs {
  const openTasks = listActiveTasks().filter((t) => t.moduleId === moduleId && t.status !== 'done');
  const weekBlockIds = new Set(studyBlocksRepo.read().filter((b) => b.date >= plan.weekStart && b.date <= plan.weekEnd).map((b) => b.id));

  const hasP1Backlog = openTasks.some((t) => t.priority === 'P1');
  const hasOverdueMustDo = openTasks.some((t) => t.category === 'MUST_DO' && !!t.dueDate && t.dueDate < today);

  // Meaningful P2 backlog (Phase C.1): 2+ open P2 tasks that are overdue / current-week /
  // carried over — NOT arbitrary future P2 work.
  const relevantP2 = openTasks.filter(
    (t) => t.priority === 'P2' && (
      (t.dueDate && t.dueDate < today) ||
      t.carriedOver ||
      (t.plannedWeekId === plan.id) ||
      (t.dueDate ? t.dueDate <= plan.weekEnd : false) ||
      (t.linkedStudyBlockId ? weekBlockIds.has(t.linkedStudyBlockId) : false)
    ),
  );

  const missedCompulsory = scheduledActivitiesRepo
    .read()
    .filter((a) => a.moduleId === moduleId && a.date >= plan.weekStart && a.date <= plan.weekEnd && isCompulsoryAction(a))
    .some((a) => getAttendanceFor(a.id)?.state === 'MISSED');

  return {
    pacePercent: modulePace(moduleId, plan, now),
    hasEvidence: weekly.obligationCount > 0,
    hasP1Backlog,
    hasOverdueMustDo,
    hasMeaningfulP2Backlog: relevantP2.length >= P2_MEANINGFUL_THRESHOLD,
    missedCompulsory,
  };
}

export function moduleStatus(moduleId: string, plan: WeeklyPlan, today: string, now: number = Date.now()): { status: ModuleStatus; weekly: ModuleWeeklyResult } {
  const weekly = computeModuleWeekly(moduleId, plan);
  const status = resolveStatus(buildStatusInputs(moduleId, weekly, plan, today, now));
  return { status, weekly };
}
