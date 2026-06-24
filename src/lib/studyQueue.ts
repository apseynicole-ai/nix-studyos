import { todayIsoLocal } from './dateUtils';

export type StudyQueuePriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface StudyQueueTaskInput {
  id?: string;
  text?: string;
  title?: string;
  done?: boolean;
  completedAt?: string | null;
  moduleId?: string;
  category?: string;
  priority?: StudyQueuePriority | string;
  type?: string;
  dueDate?: string | null;
}

export interface StudyQueueTask extends StudyQueueTaskInput {
  dueDate: string;
}

export interface StudyQueue {
  overdue: StudyQueueTask[];
  today: StudyQueueTask[];
  thisWeek: StudyQueueTask[];
  totalVisible: number;
  hasUrgentTasks: boolean;
}

const DEFAULT_LIMIT = 10;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function buildStudyQueue(
  tasks: StudyQueueTaskInput[],
  todayStr = todayIsoLocal(),
  limit = DEFAULT_LIMIT,
): StudyQueue {
  const weekEnd = addDays(todayStr, 7);
  const grouped = {
    overdue: [] as StudyQueueTask[],
    today: [] as StudyQueueTask[],
    thisWeek: [] as StudyQueueTask[],
  };

  for (const task of tasks) {
    if (task.done || task.completedAt) continue;
    if (!task.dueDate || !isValidIsoDate(task.dueDate)) continue;

    const queueTask: StudyQueueTask = { ...task, dueDate: task.dueDate };
    if (queueTask.dueDate < todayStr) {
      grouped.overdue.push(queueTask);
    } else if (queueTask.dueDate === todayStr) {
      grouped.today.push(queueTask);
    } else if (queueTask.dueDate <= weekEnd) {
      grouped.thisWeek.push(queueTask);
    }
  }

  grouped.overdue.sort(compareQueueTasks);
  grouped.today.sort(compareQueueTasks);
  grouped.thisWeek.sort(compareQueueTasks);

  const visible = [...grouped.overdue, ...grouped.today, ...grouped.thisWeek].slice(0, Math.max(0, limit));
  const visibleIds = new Set(visible.map(taskKey));

  return {
    overdue: grouped.overdue.filter((task) => visibleIds.has(taskKey(task))),
    today: grouped.today.filter((task) => visibleIds.has(taskKey(task))),
    thisWeek: grouped.thisWeek.filter((task) => visibleIds.has(taskKey(task))),
    totalVisible: visible.length,
    hasUrgentTasks: visible.length > 0,
  };
}

function compareQueueTasks(a: StudyQueueTask, b: StudyQueueTask) {
  return a.dueDate.localeCompare(b.dueDate)
    || priorityValue(b.priority) - priorityValue(a.priority)
    || (a.text || a.title || '').localeCompare(b.text || b.title || '');
}

function priorityValue(priority?: string) {
  return { Critical: 4, High: 3, Medium: 2, Low: 1 }[priority || 'Low'] || 0;
}

function isValidIsoDate(value: string) {
  if (!ISO_DATE_RE.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const [year, month, day] = value.split('-').map(Number);
  return date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day;
}

function addDays(isoDate: string, days: number) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return todayIsoLocal(new Date(year, month - 1, day + days));
}

function taskKey(task: StudyQueueTask) {
  return task.id || `${task.moduleId || ''}:${task.dueDate}:${task.text || task.title || ''}`;
}
