// Phase D — resolve the active week from the actual date + AppState (no hard-coded week).

import { appStateRepo, weeklyPlansRepo, DEFAULT_APP_STATE } from './repositories';
import type { WeeklyPlan } from './types';

export function localTodayISO(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Resolve the plan for `today`: prefer the week whose Mon–Sun range contains today; else the
 * AppState.currentWeekId plan; else the latest plan. Safe fallback, never throws.
 */
export function resolveWeekPlan(today: string): WeeklyPlan | undefined {
  const plans = weeklyPlansRepo.read();
  if (plans.length === 0) return undefined;

  const covering = plans.find((p) => today >= p.weekStart && today <= p.weekEnd);
  if (covering) return covering;

  const stateId = appStateRepo.read(DEFAULT_APP_STATE).currentWeekId;
  const statePlan = stateId ? plans.find((p) => p.id === stateId) : undefined;
  if (statePlan) return statePlan;

  return [...plans].sort((a, b) => (a.weekStart < b.weekStart ? -1 : 1))[plans.length - 1];
}

export function resolveWeekId(today: string): string | null {
  return resolveWeekPlan(today)?.id ?? null;
}
