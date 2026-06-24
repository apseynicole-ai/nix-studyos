import type { AssessmentCalendarEntry } from '../data/assessmentCalendar';
import { isValidIsoDateString, todayIsoLocal } from './dateUtils';

export interface NextAssessmentResult {
  entry: AssessmentCalendarEntry;
  daysFromNow: number;
}

export function getNextAssessment(
  entries: AssessmentCalendarEntry[],
  todayStr?: string,
): NextAssessmentResult | null {
  const today = todayStr ?? todayIsoLocal();

  const upcoming = entries
    .filter((entry) => isValidIsoDateString(entry.date) && entry.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (upcoming.length === 0) return null;

  const entry = upcoming[0];
  const todayMs = new Date(`${today}T00:00:00`).getTime();
  const entryMs = new Date(`${entry.date}T00:00:00`).getTime();
  const daysFromNow = Math.round((entryMs - todayMs) / 86400000);

  return { entry, daysFromNow };
}
