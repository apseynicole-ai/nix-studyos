// Phase D — pure schedule-conflict detection (never auto-resolves).
// Detects: required activity ↔ required activity, required activity ↔ study block, and
// study block ↔ study block. Optional Q&A / support periods may overlap study by design.

import { scheduledActivitiesRepo, studyBlocksRepo } from './repositories';
import type { ScheduledActivity, StudyBlock, WeekConflict } from './types';

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const overlaps = (aS: string, aE: string, bS: string, bE: string) => toMin(aS) < toMin(bE) && toMin(bS) < toMin(aE);

interface Interval {
  date: string;
  start: string;
  end: string;
  label: string;
  required: boolean;
  isBlock: boolean;
}

export function detectConflicts(
  activities: ScheduledActivity[],
  blocks: StudyBlock[],
  weekId: string,
  moduleName: (id: string) => string = (id) => id,
): WeekConflict[] {
  const intervals: Interval[] = [
    ...activities.map((a) => ({
      date: a.date,
      start: a.startTime,
      end: a.endTime,
      label: `${moduleName(a.moduleId)} ${a.type} ${a.startTime}–${a.endTime}`,
      required: a.required && a.type !== 'optional',
      isBlock: false,
    })),
    ...blocks.map((b) => ({
      date: b.date,
      start: b.startTime,
      end: b.endTime,
      label: `${moduleName(b.moduleId)} study ${b.startTime}–${b.endTime}`,
      required: true, // a planned study block is a real commitment
      isBlock: true,
    })),
  ];

  const conflicts: WeekConflict[] = [];
  const byDate = new Map<string, Interval[]>();
  for (const iv of intervals) (byDate.get(iv.date) ?? byDate.set(iv.date, []).get(iv.date)!).push(iv);

  for (const [date, list] of byDate) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        if (!overlaps(a.start, a.end, b.start, b.end)) continue;
        // Optional-vs-anything (e.g. Q&A overlapping study) is allowed by design.
        if (!a.required || !b.required) continue;
        conflicts.push({
          id: `conflict:${weekId}:${date}:${a.start}:${b.start}`,
          weekId,
          date,
          aLabel: a.label,
          bLabel: b.label,
          severity: 'hard',
          reason:
            a.isBlock || b.isBlock
              ? 'A planned study block overlaps another commitment.'
              : 'Two required timetable activities overlap — resolve from authoritative university guidance.',
        });
      }
    }
  }
  return conflicts;
}

export function detectWeekConflicts(weekId: string, weekStart: string, weekEnd: string, moduleName?: (id: string) => string): WeekConflict[] {
  const activities = scheduledActivitiesRepo.read().filter((a) => a.date >= weekStart && a.date <= weekEnd);
  const blocks = studyBlocksRepo.read().filter((b) => b.date >= weekStart && b.date <= weekEnd);
  return detectConflicts(activities, blocks, weekId, moduleName);
}
