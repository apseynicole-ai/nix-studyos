import type { AssessmentConfidence } from './modules/types';

export interface AssessmentCalendarEntry {
  assessmentId: string;
  moduleId: string;
  moduleCode: string;
  title: string;
  date: string;
  time: string;
  durationMinutes: number;
  venue: string;
  source: string;
  confidence: AssessmentConfidence;
  notes: string;
}

export const finalAssessmentCalendarEntries: AssessmentCalendarEntry[] = [
  {
    assessmentId: 'A2',
    moduleId: 'finacc178',
    moduleCode: 'FAF178',
    title: 'A2 / Final assessment',
    date: '2026-05-20',
    time: '14:00',
    durationMinutes: 180,
    venue: 'ArtsSoc 222',
    source: 'SU A2 timetable May/June 2026',
    confidence: 'high',
    notes: 'Surname range Abr-Bar. Venue from timetable row.',
  },
  {
    assessmentId: 'A2',
    moduleId: 'econ114',
    moduleCode: 'ECO114',
    title: 'A2 / Final assessment',
    date: '2026-05-23',
    time: '14:00',
    durationMinutes: 180,
    venue: 'CivEng S3061',
    source: 'SU A2 timetable May/June 2026',
    confidence: 'provisional',
    notes: 'Venue inferred from surname range Apr-Bje for Apsey. User will verify later.',
  },
  {
    assessmentId: 'A2S1',
    moduleId: 'foundations178',
    moduleCode: 'FOL178',
    title: 'A2 / Final assessment',
    date: '2026-05-27',
    time: '14:00',
    durationMinutes: 90,
    venue: 'Krotoa 3001',
    source: 'SU A2 timetable May/June 2026',
    confidence: 'high',
    notes: 'Surname range Ab-Ham. Venue from timetable row.',
  },
  {
    assessmentId: 'A2S1',
    moduleId: 'sds188',
    moduleCode: 'SDS188',
    title: 'A2 / Final assessment',
    date: '2026-06-01',
    time: '09:00',
    durationMinutes: 180,
    venue: 'MathPsyc 3001',
    source: 'SU A2 timetable May/June 2026',
    confidence: 'high',
    notes: 'Surname range Adam-Bas. Venue from timetable row.',
  },
  {
    assessmentId: 'A2',
    moduleId: 'dla112',
    moduleCode: 'DLA112',
    title: 'A2 / Final assessment',
    date: '2026-06-04',
    time: '14:00',
    durationMinutes: 90,
    venue: 'Mouton 3010',
    source: 'SU A2 timetable May/June 2026',
    confidence: 'high',
    notes: 'User provided/confirmed from timetable. Treat as verified for now.',
  },
  {
    assessmentId: 'A2',
    moduleId: 'conlaw178',
    moduleCode: 'CON178',
    title: 'A2 / Final assessment',
    date: '2026-06-08',
    time: '09:00',
    durationMinutes: 90,
    venue: 'ArtsSoc 223',
    source: 'SU A2 timetable May/June 2026',
    confidence: 'high',
    notes: 'User provided/confirmed from timetable. Treat as verified for now.',
  },
];

const calendarIndex = new Map(
  finalAssessmentCalendarEntries.map((entry) => [`${entry.moduleId}:${entry.assessmentId}`, entry]),
);

export function getAssessmentCalendarEntry(moduleId: string, assessmentId: string) {
  return calendarIndex.get(`${moduleId}:${assessmentId}`);
}
