import type { AssessmentCalendarEntry } from '../data/assessmentCalendar';
import { todayIsoLocal } from './dateUtils';

export interface NextAssessmentResult {
  entry: AssessmentCalendarEntry;
  daysFromNow: number;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00`);
  if (isNaN(d.getTime())) return false;
  const [year, month, day] = value.split('-').map(Number);
  return d.getFullYear() === year && d.getMonth() + 1 === month && d.getDate() === day;
}

export function getNextAssessment(
  entries: AssessmentCalendarEntry[],
  todayStr?: string,
): NextAssessmentResult | null {
  const today = todayStr ?? todayIsoLocal();

  const upcoming = entries
    .filter((entry) => isValidIsoDate(entry.date) && entry.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (upcoming.length === 0) return null;

  const entry = upcoming[0];
  const todayMs = new Date(`${today}T00:00:00`).getTime();
  const entryMs = new Date(`${entry.date}T00:00:00`).getTime();
  const daysFromNow = Math.round((entryMs - todayMs) / 86400000);

  return { entry, daysFromNow };
}
