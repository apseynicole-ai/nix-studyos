import type { AssessmentCalendarEntry } from '../data/assessmentCalendar';
import type { AssessmentConfidence } from '../data/modules/types';
import { readLocalJson, writeLocalJson } from './localData';
export { isValidIsoDateString } from './dateUtils';

export const LOCAL_MANUAL_ASSESSMENTS_KEY = 'baccllb-manual-assessments';

export interface ManualAssessmentEntry {
  id: string;
  moduleId: string;
  moduleCode: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  durationMinutes: number;
  confidence: AssessmentConfidence;
  createdAt: string;
}

export function readManualAssessments(): ManualAssessmentEntry[] {
  return readLocalJson<ManualAssessmentEntry[]>(LOCAL_MANUAL_ASSESSMENTS_KEY, []);
}

export function saveManualAssessments(entries: ManualAssessmentEntry[]): void {
  writeLocalJson(LOCAL_MANUAL_ASSESSMENTS_KEY, entries);
}

export function addManualAssessment(draft: Omit<ManualAssessmentEntry, 'id'>): ManualAssessmentEntry[] {
  const entry: ManualAssessmentEntry = { ...draft, id: crypto.randomUUID() };
  const next = [...readManualAssessments(), entry];
  saveManualAssessments(next);
  return next;
}

export function deleteManualAssessment(id: string): ManualAssessmentEntry[] {
  const next = readManualAssessments().filter((e) => e.id !== id);
  saveManualAssessments(next);
  return next;
}

export function toAssessmentCalendarEntry(entry: ManualAssessmentEntry): AssessmentCalendarEntry {
  return {
    assessmentId: entry.id,
    moduleId: entry.moduleId,
    moduleCode: entry.moduleCode,
    title: entry.title,
    date: entry.date,
    time: entry.time,
    durationMinutes: entry.durationMinutes,
    venue: entry.venue,
    source: 'manual',
    confidence: entry.confidence,
    notes: '',
  };
}
