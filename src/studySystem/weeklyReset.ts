// Phase D — Sunday reset engine + non-AI carry-over.
//
// runWeeklyReset archives the completed week (never deletes its logs), records final evidence,
// carries incomplete required tasks to the next week (unscheduled until approved), generates
// the next week, and advances AppState.currentWeekId. Idempotent — safe to run twice.

import {
  appStateRepo,
  DEFAULT_APP_STATE,
  modulesRepo,
  studyBlocksRepo,
  studySessionsRepo,
  tasksRepo,
  weeklyPlansRepo,
} from './repositories';
import { computeModuleWeekly } from './moduleWeekly';
import { moduleStatus, type ModuleStatus } from './moduleStatus';
import { listActiveTasks } from './tasks';
import { ensureWeek } from './recurring/weekGenerator';
import type { StudyTask, WeeklyPlan } from './types';

export interface ModuleEvidence {
  moduleId: string;
  completion: number | null;
  status: ModuleStatus;
  actualMinutes: number;
}

export interface ResetResult {
  fromWeekId: string;
  toWeekId: string;
  archived: boolean;
  generatedNextWeek: boolean;
  finalActualMinutes: number;
  perModuleActual: Record<string, number>;
  moduleEvidence: ModuleEvidence[];
  couldNotCompleteCount: number;
  carriedOverTaskIds: string[];
}

/** A week can be archived only once its Sunday end date has arrived. */
export function canRunWeeklyReset(today: string, plan: WeeklyPlan): boolean {
  return today >= plan.weekEnd && !plan.frozen && !plan.archivedAt;
}

function fromWeekTask(t: StudyTask, plan: WeeklyPlan, weekBlockIds: Set<string>): boolean {
  if (t.plannedWeekId === plan.id) return true;
  if (t.dueDate && t.dueDate >= plan.weekStart && t.dueDate <= plan.weekEnd) return true;
  if (t.linkedStudyBlockId && weekBlockIds.has(t.linkedStudyBlockId)) return true;
  return false;
}

export function runWeeklyReset(fromWeekId: string, toWeekId: string, moduleName?: (id: string) => string): ResetResult {
  const fromPlan = weeklyPlansRepo.getById(fromWeekId);
  if (!fromPlan) throw new Error(`Cannot reset: week ${fromWeekId} has no plan.`);

  // 1) Freeze / archive the completed week (preserve everything).
  const alreadyArchived = fromPlan.frozen && !!fromPlan.archivedAt;
  weeklyPlansRepo.upsert({ ...fromPlan, frozen: true, archivedAt: fromPlan.archivedAt ?? new Date().toISOString() });

  // 2) Generate the next week (idempotent; leaves an existing plan intact).
  const generatedNextWeek = ensureWeek(toWeekId, moduleName);

  // 3) Final actual minutes for the completed week (preserved sessions only).
  const sessions = studySessionsRepo.read().filter((s) => s.date >= fromPlan.weekStart && s.date <= fromPlan.weekEnd);
  const perModuleActual: Record<string, number> = {};
  for (const s of sessions) perModuleActual[s.moduleId] = (perModuleActual[s.moduleId] ?? 0) + s.exactMinutes;
  const finalActualMinutes = sessions.reduce((a, s) => a + s.exactMinutes, 0);
  const couldNotCompleteCount = sessions.filter((s) => s.status === 'COULD_NOT_COMPLETE').length;

  // 4) Final module completion/status evidence.
  const weekEndMs = Date.parse(`${fromPlan.weekEnd}T23:59:59`);
  const moduleEvidence: ModuleEvidence[] = modulesRepo
    .read()
    .filter((m) => m.active)
    .map((m) => {
      const { status, weekly } = moduleStatus(m.id, fromPlan, fromPlan.weekEnd, weekEndMs);
      return { moduleId: m.id, completion: weekly.completion, status, actualMinutes: weekly.actualMinutes };
    });

  // 5) Carry over incomplete required (MUST DO) tasks belonging to the completed week.
  const weekBlockIds = new Set(studyBlocksRepo.read().filter((b) => b.date >= fromPlan.weekStart && b.date <= fromPlan.weekEnd).map((b) => b.id));
  const carriedOverTaskIds: string[] = [];
  for (const t of listActiveTasks()) {
    if (t.status === 'done') continue;
    if (t.category !== 'MUST_DO') continue;
    if (!fromWeekTask(t, fromPlan, weekBlockIds)) continue;
    tasksRepo.upsert({
      ...t,
      status: 'carried_over',
      carriedOver: true,
      carryOverFromId: t.carryOverFromId ?? t.id,
      plannedWeekId: toWeekId,
      linkedStudyBlockId: null, // unscheduled until approved
    });
    carriedOverTaskIds.push(t.id);
  }

  // 6) Advance the current-week pointer.
  appStateRepo.update({ currentWeekId: toWeekId, lastResetAt: new Date().toISOString() }, DEFAULT_APP_STATE);

  return {
    fromWeekId,
    toWeekId,
    archived: !alreadyArchived,
    generatedNextWeek,
    finalActualMinutes,
    perModuleActual,
    moduleEvidence,
    couldNotCompleteCount,
    carriedOverTaskIds,
  };
}

// --- Carry-over slot approval (non-AI; locked ACCEPT / CHOOSE / LEAVE behaviour) ---------

export interface SuggestedSlot {
  blockId: string;
  date: string;
  startTime: string;
}

/** Suggest the earliest study block in the target week for the task's module. */
export function suggestSlot(task: StudyTask, toWeekId: string): SuggestedSlot | null {
  const plan = weeklyPlansRepo.getById(toWeekId);
  if (!plan) return null;
  const block = studyBlocksRepo
    .read()
    .filter((b) => b.moduleId === task.moduleId && b.date >= plan.weekStart && b.date <= plan.weekEnd)
    .sort((a, b) => (a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date)))[0];
  return block ? { blockId: block.id, date: block.date, startTime: block.startTime } : null;
}

/** ACCEPT / CHOOSE ANOTHER TIME — link the carry-over task to a chosen study block. */
export function acceptCarryOverSlot(taskId: string, blockId: string): void {
  const t = tasksRepo.getById(taskId);
  if (t) tasksRepo.upsert({ ...t, linkedStudyBlockId: blockId });
}

/** LEAVE UNSCHEDULED — keep the carry-over but with no slot. */
export function leaveUnscheduled(taskId: string): void {
  const t = tasksRepo.getById(taskId);
  if (t) tasksRepo.upsert({ ...t, linkedStudyBlockId: null });
}
