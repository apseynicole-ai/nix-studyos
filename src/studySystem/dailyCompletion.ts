// LOCKED weighted Daily Completion engine (spec §1A / §15.1). Pure calculation + a builder
// that derives obligations from the transactional records. No derived values are stored.

import { getAttendanceFor } from './attendance';
import { getActiveSession, getSessionForBlock } from './session';
import { listActiveTasks } from './tasks';
import { assessmentsRepo, scheduledActivitiesRepo, studyBlocksRepo } from './repositories';
import type { CompletionState } from './types';

export interface Obligation {
  id: string;
  weight: number;
  state: CompletionState;
  optional: boolean;
}

export interface DailyCompletionResult {
  percent: number | null; // null when there are no required obligations (denominator 0)
  bonusWork: number;       // completed optional activities (never pushes % above 100)
  requiredCount: number;
  numerator: number;
  denominator: number;
}

// Locked contribution per completion state (spec §2.2). CANCELLED is handled before this.
export function contribution(state: CompletionState): number {
  if (state === 'COMPLETED') return 1;
  if (state === 'PARTIALLY_COMPLETED') return 0.5;
  return 0; // NOT_STARTED, IN_PROGRESS, MISSED, COULD_NOT_COMPLETE(→incomplete)
}

/** Pure weighted Daily Completion. Cancelled → removed from num+denom; optional → excluded
 *  from the denominator; capped at 100%. */
export function computeDailyCompletion(obligations: Obligation[]): DailyCompletionResult {
  const required = obligations.filter((o) => !o.optional && o.state !== 'CANCELLED');
  const denominator = required.reduce((sum, o) => sum + o.weight, 0);
  const numerator = required.reduce((sum, o) => sum + o.weight * contribution(o.state), 0);
  const bonusWork = obligations.filter((o) => o.optional && o.state === 'COMPLETED').length;
  const percent = denominator > 0 ? Math.min(100, Math.round((numerator / denominator) * 100)) : null;
  return { percent, bonusWork, requiredCount: required.length, numerator, denominator };
}

function blockState(blockId: string, runningBlockId: string | null): CompletionState {
  if (runningBlockId === blockId) return 'IN_PROGRESS';
  const session = getSessionForBlock(blockId);
  if (!session) return 'NOT_STARTED';
  if (session.status === 'COMPLETED') return 'COMPLETED';
  if (session.status === 'PARTIALLY_COMPLETED') return 'PARTIALLY_COMPLETED';
  return 'NOT_STARTED'; // COULD_NOT_COMPLETE → incomplete result
}

/**
 * Build the day's obligations with the locked weights (§2.1) and deduplication (§2.3):
 *  - required lecture/tutorial/practical = 1, optional = 0 (state from attendance)
 *  - planned private-study block = 2 (state from linked session)
 *  - important MUST DO task due today = 2, ONLY if it is an independent obligation
 *    (a task linked to a study block counted today is NOT counted again).
 *
 *  - assessment/project milestone due today = 3, ONLY when independent: skipped if a linked
 *    study block is counted the same day, or if the assessment is already satisfied by a
 *    completed/partial linked block (any day) or a done linked task (§2.3 cross-day dedup).
 */
export function assessmentSatisfied(assessmentId: string): boolean {
  const blockSatisfied = studyBlocksRepo.read().some((b) => {
    if (b.linkedAssessmentId !== assessmentId) return false;
    const status = getSessionForBlock(b.id)?.status;
    return status === 'COMPLETED' || status === 'PARTIALLY_COMPLETED';
  });
  const taskSatisfied = listActiveTasks().some((t) => t.linkedAssessmentId === assessmentId && t.status === 'done');
  return blockSatisfied || taskSatisfied;
}

export function buildDailyObligations(date: string): Obligation[] {
  const active = getActiveSession();
  const runningBlockId = active?.studyBlockId ?? null;
  const obligations: Obligation[] = [];

  for (const a of scheduledActivitiesRepo.read().filter((x) => x.date === date)) {
    const att = getAttendanceFor(a.id);
    const optional = a.weight === 0 || a.type === 'optional';
    obligations.push({ id: a.id, weight: a.weight, state: att?.state ?? 'NOT_STARTED', optional });
  }

  const countedBlockIds = new Set<string>();
  for (const b of studyBlocksRepo.read().filter((x) => x.date === date)) {
    countedBlockIds.add(b.id);
    obligations.push({ id: b.id, weight: 2, state: blockState(b.id, runningBlockId), optional: false });
  }

  for (const t of listActiveTasks()) {
    if (t.dueDate !== date || t.category !== 'MUST_DO') continue;
    // Dedup (§2.3): a task that is a counted study block's purpose is not counted separately.
    if (t.linkedStudyBlockId && countedBlockIds.has(t.linkedStudyBlockId)) continue;
    obligations.push({ id: t.id, weight: 2, state: t.status === 'done' ? 'COMPLETED' : 'NOT_STARTED', optional: false });
  }

  // Assessment / project milestones due today (weight 3), with cross-day dedup.
  const blocks = studyBlocksRepo.read();
  for (const a of assessmentsRepo.read()) {
    if (a.date !== date) continue;
    const linkedBlockToday = blocks.some((b) => b.linkedAssessmentId === a.id && b.date === date);
    if (linkedBlockToday) continue;        // counted today as its study block
    if (assessmentSatisfied(a.id)) continue; // already done (e.g. the quiz taken earlier this week)
    obligations.push({ id: `milestone-${a.id}`, weight: 3, state: 'NOT_STARTED', optional: false });
  }

  return obligations;
}

export function dailyCompletion(date: string): DailyCompletionResult {
  return computeDailyCompletion(buildDailyObligations(date));
}
