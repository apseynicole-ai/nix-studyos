import { modules } from '../data/baccllb';
import type { MistakeRecord } from './mistakeBank';
import type { TopicMasteryRecord } from './topicMastery';

export interface ProgressTaskLike {
  done?: boolean;
  completedAt?: string | null;
  moduleId?: string;
}

export interface PlannerProgressItemLike {
  done?: boolean;
  completed?: boolean;
  status?: string;
}

export function clampProgress(value: number | null | undefined): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(Number(value))));
}

export function calculateTopicProgress(records: TopicMasteryRecord[]): number {
  if (!records.length) return 0;

  const progress = records.map((record) => {
    const statusScore = topicStatusScore(record.status);
    const checklistScore = (
      Number(record.readDone) +
      Number(record.notesDone) +
      Number(record.practiceDone)
    ) / 3 * 100;
    const confidenceScore = clampProgress(record.confidencePercent);

    return clampProgress((confidenceScore * 0.5) + (statusScore * 0.3) + (checklistScore * 0.2));
  });

  return clampProgress(progress.reduce((sum, value) => sum + value, 0) / progress.length);
}

export function calculateMistakeResolutionProgress(records: MistakeRecord[]): number {
  if (!records.length) return 0;
  const resolved = records.filter((record) => record.resolved).length;
  return clampProgress((resolved / records.length) * 100);
}

export function calculateTaskProgress(tasks: ProgressTaskLike[]): number {
  if (!tasks.length) return 0;
  const completed = tasks.filter((task) => isTaskDone(task)).length;
  return clampProgress((completed / tasks.length) * 100);
}

export function calculatePlannerProgress(plannerData: unknown): number {
  const items = extractPlannerItems(plannerData);
  if (!items.length) return 0;
  const completed = items.filter((item) => isPlannerItemDone(item)).length;
  return clampProgress((completed / items.length) * 100);
}

export function calculateModuleReadiness(
  moduleId: string,
  topicRecords: TopicMasteryRecord[],
  mistakeRecords: MistakeRecord[],
  tasks: ProgressTaskLike[],
): number {
  const module = modules.find((item) => item.id === moduleId);
  const baseConfidence = clampProgress(module?.confidence ?? 50);

  const moduleTopics = topicRecords.filter((record) => record.moduleId === moduleId);
  const moduleMistakes = mistakeRecords.filter((record) => record.moduleId === moduleId);
  const moduleTasks = tasks.filter((task) => task.moduleId === moduleId);

  if (!moduleTopics.length && !moduleMistakes.length && !moduleTasks.length) {
    return baseConfidence;
  }

  const topicProgress = moduleTopics.length ? calculateTopicProgress(moduleTopics) : baseConfidence;
  const mistakeProgress = moduleMistakes.length ? calculateMistakeResolutionProgress(moduleMistakes) : 50;
  const taskProgress = moduleTasks.length ? calculateTaskProgress(moduleTasks) : 40;

  return clampProgress(
    (baseConfidence * 0.2) +
    (topicProgress * 0.45) +
    (mistakeProgress * 0.2) +
    (taskProgress * 0.15),
  );
}

function topicStatusScore(status: TopicMasteryRecord['status']): number {
  switch (status) {
    case 'exam-ready':
      return 90;
    case 'practising':
      return 68;
    case 'learning':
      return 38;
    case 'not-started':
    default:
      return 8;
  }
}

function isTaskDone(task: ProgressTaskLike): boolean {
  return Boolean(task.done || task.completedAt);
}

function isPlannerItemDone(item: PlannerProgressItemLike): boolean {
  const status = item.status?.toLowerCase?.() ?? '';
  return Boolean(
    item.done ||
    item.completed ||
    status === 'done' ||
    status === 'completed' ||
    status === 'complete'
  );
}

function extractPlannerItems(plannerData: unknown): PlannerProgressItemLike[] {
  if (!plannerData) return [];

  if (Array.isArray(plannerData)) {
    return plannerData.filter(isPlannerItemLike);
  }

  if (typeof plannerData !== 'object') return [];

  const record = plannerData as Record<string, unknown>;
  const candidateArrays = [
    record.items,
    record.tasks,
    record.blocks,
    record.plan,
    (record.smartPlanner as Record<string, unknown> | undefined)?.blocks,
    (record.smartPlanner as Record<string, unknown> | undefined)?.items,
  ];

  for (const candidate of candidateArrays) {
    if (Array.isArray(candidate)) {
      return candidate.filter(isPlannerItemLike);
    }
  }

  return [];
}

function isPlannerItemLike(value: unknown): value is PlannerProgressItemLike {
  return typeof value === 'object' && value !== null;
}
