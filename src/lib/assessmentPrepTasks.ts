import type { AssessmentCalendarEntry } from '../data/assessmentCalendar';
import { LOCAL_TASKS_KEY, readLocalJson, writeLocalJson } from './localData';
import { isValidIsoDateString } from './manualAssessments';
import { todayIsoLocal } from './dateUtils';

export type PrepTaskType = 'start-revision' | 'practice-questions' | 'final-review';

export interface PrepTask {
  id: string;
  text: string;
  done: boolean;
  moduleId: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  type: 'Study' | 'Practice' | 'Admin' | 'Submission' | 'Revision' | 'Health';
  minutes: number;
  points: number;
  dueDate: string | null;
  createdAt: string;
  userId: string;
  why: string;
  completedAt: null;
}

export interface MergeResult {
  added: number;
  skipped: number;
}

const PREP_SPECS: Array<{
  prepType: PrepTaskType;
  daysBeforeExam: number;
  buildText: (code: string, title: string) => string;
  taskType: 'Revision' | 'Practice';
  minutes: number;
}> = [
  {
    prepType: 'start-revision',
    daysBeforeExam: 14,
    buildText: (code, title) => `Start revision: ${code} ${title}`,
    taskType: 'Revision',
    minutes: 60,
  },
  {
    prepType: 'practice-questions',
    daysBeforeExam: 7,
    buildText: (code, title) => `Practice questions: ${code} ${title}`,
    taskType: 'Practice',
    minutes: 45,
  },
  {
    prepType: 'final-review',
    daysBeforeExam: 2,
    buildText: (code, title) => `Final review: ${code} ${title}`,
    taskType: 'Revision',
    minutes: 30,
  },
];

export function assessmentPrepTaskId(
  moduleId: string,
  assessmentId: string,
  date: string,
  prepType: PrepTaskType,
): string {
  return `prep-${moduleId}-${assessmentId}-${date}-${prepType}`;
}

function subtractDays(isoDate: string, n: number): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return todayIsoLocal(new Date(year, month - 1, day - n));
}

export function buildAssessmentPrepTasks(
  entry: AssessmentCalendarEntry,
  todayStr = todayIsoLocal(),
  userId = 'local-guest',
): PrepTask[] {
  if (!isValidIsoDateString(entry.date)) return [];

  const parts = [entry.date, entry.time, entry.venue].filter(Boolean);
  const why = `Generated from assessment calendar: ${parts.join(' • ')}`;
  const createdAt = new Date().toISOString();

  return PREP_SPECS.map(({ prepType, daysBeforeExam, buildText, taskType, minutes }) => {
    const rawDue = subtractDays(entry.date, daysBeforeExam);
    const dueDate = rawDue < todayStr ? todayStr : rawDue;
    return {
      id: assessmentPrepTaskId(entry.moduleId, entry.assessmentId, entry.date, prepType),
      text: buildText(entry.moduleCode, entry.title),
      done: false,
      moduleId: entry.moduleId,
      category: 'Exam prep',
      priority: 'High' as const,
      type: taskType,
      minutes,
      points: 10,
      dueDate,
      createdAt,
      userId,
      why,
      completedAt: null,
    };
  });
}

export function buildPrepTasksForAssessments(
  entries: AssessmentCalendarEntry[],
  todayStr = todayIsoLocal(),
  userId = 'local-guest',
): PrepTask[] {
  return entries.flatMap((entry) => buildAssessmentPrepTasks(entry, todayStr, userId));
}

export function mergeAssessmentPrepTasks(
  existingTasks: { id: string }[],
  generatedTasks: PrepTask[],
): MergeResult {
  const existingIds = new Set(existingTasks.map((t) => t.id));
  const newCount = generatedTasks.filter((t) => !existingIds.has(t.id)).length;
  return { added: newCount, skipped: generatedTasks.length - newCount };
}

export function savePrepTasksToLocal(generatedTasks: PrepTask[]): MergeResult {
  const existing = readLocalJson<{ id: string }[]>(LOCAL_TASKS_KEY, []);
  const existingIds = new Set(existing.map((t) => t.id));
  const toAdd = generatedTasks.filter((t) => !existingIds.has(t.id));
  if (toAdd.length > 0) {
    writeLocalJson(LOCAL_TASKS_KEY, [...existing, ...toAdd]);
  }
  return { added: toAdd.length, skipped: generatedTasks.length - toAdd.length };
}

export interface AssessmentPrepProgress {
  totalExpected: number;
  existingCount: number;
  completedCount: number;
  missingCount: number;
  allExist: boolean;
  allComplete: boolean;
  taskIds: string[];
}

export function getAssessmentPrepProgress(
  entry: AssessmentCalendarEntry,
  tasks: { id: string; done: boolean }[],
): AssessmentPrepProgress {
  const totalExpected = PREP_SPECS.length;

  if (!isValidIsoDateString(entry.date)) {
    return { totalExpected, existingCount: 0, completedCount: 0, missingCount: totalExpected, allExist: false, allComplete: false, taskIds: [] };
  }

  const taskIds = PREP_SPECS.map(({ prepType }) =>
    assessmentPrepTaskId(entry.moduleId, entry.assessmentId, entry.date, prepType),
  );

  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const existingCount = taskIds.filter((id) => taskMap.has(id)).length;
  const completedCount = taskIds.filter((id) => taskMap.get(id)?.done === true).length;

  return {
    totalExpected,
    existingCount,
    completedCount,
    missingCount: totalExpected - existingCount,
    allExist: existingCount === totalExpected,
    allComplete: completedCount === totalExpected,
    taskIds,
  };
}
