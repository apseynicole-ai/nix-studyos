// Unified chronological LOG projection (spec §12): merges attendance entries and study
// sessions, newest first, with filters by date / module / type / status.

import { activityLogRepo, studySessionsRepo } from './repositories';
import type { StudySessionStatus } from './types';

export interface LogRow {
  id: string;
  kind: 'class' | 'study';
  date: string;
  time: string | null;
  moduleId: string;
  title: string;
  detail?: string;
  minutes?: number;      // exact (study rows only)
  location?: string | null;
  status: string;        // display status (attendance or session status)
  followUp?: string;
}

export interface LogFilter {
  date?: string;
  moduleId?: string;
  kind?: 'class' | 'study';
  status?: string;
}

const SESSION_STATUS_LABEL: Record<StudySessionStatus, string> = {
  COMPLETED: 'COMPLETED',
  PARTIALLY_COMPLETED: 'PARTIALLY COMPLETED',
  COULD_NOT_COMPLETE: 'COULD NOT COMPLETE',
};

export function buildLogRows(filter: LogFilter = {}): LogRow[] {
  const classRows: LogRow[] = activityLogRepo.read().map((e) => ({
    id: e.id,
    kind: 'class',
    date: e.date,
    time: e.scheduledTime ?? null,
    moduleId: e.moduleId,
    title: `${e.activityType.charAt(0).toUpperCase()}${e.activityType.slice(1)}`,
    detail: e.note,
    status: e.attendance ?? e.state,
  }));

  const studyRows: LogRow[] = studySessionsRepo.read().map((s) => ({
    id: s.id,
    kind: 'study',
    date: s.date,
    time: s.startedAt.slice(11, 16),
    moduleId: s.moduleId,
    title: s.planned ? 'Study session' : 'Unplanned study',
    detail: s.output,
    minutes: s.exactMinutes,
    location: s.location,
    status: SESSION_STATUS_LABEL[s.status],
    followUp: s.followUpRequired ? s.followUpText : undefined,
  }));

  return [...classRows, ...studyRows]
    .filter((r) => (filter.date ? r.date === filter.date : true))
    .filter((r) => (filter.moduleId ? r.moduleId === filter.moduleId : true))
    .filter((r) => (filter.kind ? r.kind === filter.kind : true))
    .filter((r) => (filter.status ? r.status === filter.status : true))
    .sort((a, b) => {
      const dateCmp = b.date.localeCompare(a.date);
      if (dateCmp !== 0) return dateCmp;
      return (b.time ?? '').localeCompare(a.time ?? '');
    });
}
