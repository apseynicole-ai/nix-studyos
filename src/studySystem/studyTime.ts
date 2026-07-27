// Private-study time engine (spec §1B / §3). Actual = logged private-study sessions only
// (planned, partial, could-not-complete actual minutes, and unplanned). Never lectures/
// tutorials/practicals. Exact minutes stored; rounding is display-only (elsewhere).

import { studyBlocksRepo, studySessionsRepo } from './repositories';
import type { StudySession } from './types';

export interface TimeCompletion {
  actualMinutes: number;   // exact
  plannedMinutes: number;
  percent: number | null;  // capped at 100
}

function sessionsForDate(date: string): StudySession[] {
  return studySessionsRepo.read().filter((s) => s.date === date);
}

export function actualStudyMinutesForDate(date: string): number {
  return sessionsForDate(date).reduce((sum, s) => sum + s.exactMinutes, 0);
}

export function plannedStudyMinutesForDate(date: string): number {
  return studyBlocksRepo.read().filter((b) => b.date === date).reduce((sum, b) => sum + b.plannedMinutes, 0);
}

function withinWeek(date: string, weekStart: string, weekEnd: string): boolean {
  return date >= weekStart && date <= weekEnd;
}

export function moduleActualMinutesForWeek(moduleId: string, weekStart: string, weekEnd: string): number {
  return studySessionsRepo
    .read()
    .filter((s) => s.moduleId === moduleId && withinWeek(s.date, weekStart, weekEnd))
    .reduce((sum, s) => sum + s.exactMinutes, 0);
}

/** actual ÷ planned, capped at 100. planned 0 → 100 if any actual, else null. */
export function timeCompletion(actualMinutes: number, plannedMinutes: number): TimeCompletion {
  let percent: number | null;
  if (plannedMinutes > 0) percent = Math.min(100, Math.round((actualMinutes / plannedMinutes) * 100));
  else percent = actualMinutes > 0 ? 100 : null;
  return { actualMinutes, plannedMinutes, percent };
}
