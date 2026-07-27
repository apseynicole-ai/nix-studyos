// LOCKED Module Weekly Completion (spec §10 / §15.3):
//   0.70 × required task/activity completion + 0.30 × private-study-time completion.
//
// Phase C.1: Component A now includes compulsory module actions (required practicals /
// tutorials-when-active / compulsory sessions) via their attendance records, and MUST DO
// tasks are scoped to the CURRENT WEEK. Deduplication is preserved. Task DISPLAY counts are
// kept separate from progress-obligation counts (a linked follow-up still shows in x/y).

import { getAttendanceFor } from './attendance';
import { getSessionForBlock } from './session';
import { listActiveTasks } from './tasks';
import { scheduledActivitiesRepo, studyBlocksRepo, weeklyPlansRepo } from './repositories';
import { contribution } from './dailyCompletion';
import { moduleActualMinutesForWeek, timeCompletion } from './studyTime';
import type { CompletionState, ScheduledActivity, StudyBlock, StudyTask, WeeklyPlan } from './types';

export interface ModuleWeeklyResult {
  moduleId: string;
  completion: number | null; // weighted %, null when there is no evidence
  taskActivityPercent: number | null; // component A
  timePercent: number | null;          // component B (capped 100)
  tasksComplete: number;               // DISPLAY count (includes linked follow-ups)
  tasksTotal: number;                  // DISPLAY count
  actualMinutes: number;
  plannedMinutes: number;
  obligationCount: number;
}

function blockState(block: StudyBlock): CompletionState {
  const session = getSessionForBlock(block.id);
  if (!session) return 'NOT_STARTED';
  if (session.status === 'COMPLETED') return 'COMPLETED';
  if (session.status === 'PARTIALLY_COMPLETED') return 'PARTIALLY_COMPLETED';
  return 'NOT_STARTED';
}

// A compulsory module action: required practical / tutorial(when scheduled) / compulsory
// session. Ordinary lectures are excluded — plain attendance is not a compulsory requirement.
export function isCompulsoryAction(a: ScheduledActivity): boolean {
  return a.required && (a.type === 'practical' || a.type === 'tutorial' || a.type === 'compulsory');
}

function compulsoryActionState(a: ScheduledActivity): CompletionState {
  const att = getAttendanceFor(a.id);
  if (!att) return 'NOT_STARTED';
  return att.state; // ATTENDED→COMPLETED, MISSED→MISSED, CANCELLED→CANCELLED (excluded later)
}

function withinWeek(date: string | null | undefined, plan: WeeklyPlan): boolean {
  return !!date && date >= plan.weekStart && date <= plan.weekEnd;
}

/** Current-week membership (spec §4.1): explicit week assignment, OR due within the week, OR
 *  linked to a study block in the week. Future/unassigned tasks do not enter weekly component A. */
export function isCurrentWeekTask(task: StudyTask, plan: WeeklyPlan, weekBlockIds: Set<string>): boolean {
  if (task.plannedWeekId && task.plannedWeekId === plan.id) return true;
  if (withinWeek(task.dueDate, plan)) return true;
  if (task.linkedStudyBlockId && weekBlockIds.has(task.linkedStudyBlockId)) return true;
  return false;
}

export function currentWeekMustDoTasks(moduleId: string, plan: WeeklyPlan): StudyTask[] {
  const weekBlockIds = new Set(
    studyBlocksRepo.read().filter((b) => b.date >= plan.weekStart && b.date <= plan.weekEnd).map((b) => b.id),
  );
  return listActiveTasks().filter(
    (t) => t.moduleId === moduleId && t.category === 'MUST_DO' && isCurrentWeekTask(t, plan, weekBlockIds),
  );
}

/** Pure weighted combine (exposed for the locked worked-example test). */
export function combineWeekly(taskActivityPercent: number, timePercent: number): number {
  return Math.round((0.7 * taskActivityPercent + 0.3 * timePercent) * 100) / 100;
}

export function computeModuleWeekly(moduleId: string, plan: WeeklyPlan): ModuleWeeklyResult {
  const blocks = studyBlocksRepo
    .read()
    .filter((b) => b.moduleId === moduleId && b.date >= plan.weekStart && b.date <= plan.weekEnd);
  const countedBlockIds = new Set(blocks.map((b) => b.id));

  // Component A obligations: planned blocks + compulsory actions + independent MUST DO tasks.
  const obligationStates: CompletionState[] = blocks.map(blockState);

  for (const a of scheduledActivitiesRepo.read()) {
    if (a.moduleId !== moduleId || !withinWeek(a.date, plan) || !isCompulsoryAction(a)) continue;
    obligationStates.push(compulsoryActionState(a));
  }

  const weekMustDo = currentWeekMustDoTasks(moduleId, plan);
  // Dedup (§2.3): a task that is a counted study block's purpose is not a separate obligation.
  const independentTasks = weekMustDo.filter((t) => !(t.linkedStudyBlockId && countedBlockIds.has(t.linkedStudyBlockId)));
  for (const t of independentTasks) obligationStates.push(t.status === 'done' ? 'COMPLETED' : 'NOT_STARTED');

  const counted = obligationStates.filter((s) => s !== 'CANCELLED');
  const taskActivityPercent = counted.length
    ? Math.round((counted.reduce((sum, s) => sum + contribution(s), 0) / counted.length) * 100)
    : null;

  const plannedMinutes = plan.perModuleBudgetMinutes[moduleId] ?? blocks.reduce((s, b) => s + b.plannedMinutes, 0);
  const actualMinutes = moduleActualMinutesForWeek(moduleId, plan.weekStart, plan.weekEnd);
  const timePercent = timeCompletion(actualMinutes, plannedMinutes).percent;

  // DISPLAY counts include ALL current-week MUST DO tasks (linked ones too) — dedup is a
  // progress-only rule and must not hide real tasks from the x/y count.
  const tasksTotal = weekMustDo.length;
  const tasksComplete = weekMustDo.filter((t) => t.status === 'done').length;

  const completion = taskActivityPercent !== null ? combineWeekly(taskActivityPercent, timePercent ?? 0) : null;

  return {
    moduleId,
    completion,
    taskActivityPercent,
    timePercent,
    tasksComplete,
    tasksTotal,
    actualMinutes,
    plannedMinutes,
    obligationCount: counted.length,
  };
}

export function currentWeekPlan(): WeeklyPlan | undefined {
  const plans = weeklyPlansRepo.read();
  return plans[plans.length - 1];
}
