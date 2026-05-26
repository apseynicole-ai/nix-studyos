import { modules } from '../data/baccllb';
import { LOCAL_TASKS_KEY, readLocalJson, writeLocalJson } from './localData';
import type { AcademicSnapshot, AcademicSnapshotGlobalAction, AcademicSnapshotModule, AcademicSnapshotPriority } from './academicSnapshots';

type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
type TaskType = 'Study' | 'Practice' | 'Admin' | 'Submission' | 'Revision' | 'Health';

export interface SnapshotActionTask {
  id: string;
  userId: string;
  text: string;
  done: boolean;
  moduleId: string;
  category: string;
  priority: TaskPriority;
  type: TaskType;
  minutes: number;
  points: number;
  dueDate: string | null;
  createdAt: string;
  why?: string;
  source?: 'academic-snapshot';
  snapshotActionId?: string;
  snapshotSourceLabel?: string;
}

export interface SnapshotTaskAction {
  id: string;
  title: string;
  moduleCode?: string;
  moduleName?: string;
  priority: TaskPriority;
  detail?: string;
  sourceLabel: string;
  sourceType: 'global-action' | 'module-action';
}

export function getSnapshotTaskActions(snapshot: AcademicSnapshot | null): SnapshotTaskAction[] {
  if (!snapshot) return [];

  const globalActions = snapshot.globalActions
    .filter((action) => action.priority === 'urgent' || action.priority === 'high')
    .map((action) => taskActionFromGlobal(snapshot, action));

  const moduleActions = snapshot.modules.flatMap((module) =>
    module.urgentActions.map((action) => taskActionFromModule(snapshot, module, action)),
  );

  return [...globalActions, ...moduleActions];
}

export function readSnapshotTasks() {
  return readLocalJson<SnapshotActionTask[]>(LOCAL_TASKS_KEY, []);
}

export function isSnapshotActionAlreadyTasked(action: SnapshotTaskAction, tasks = readSnapshotTasks()) {
  const normalizedTitle = normalizeText(action.title);
  const normalizedModuleCode = normalizeText(action.moduleCode || '');

  return tasks.some((task) => {
    if (task.snapshotActionId && task.snapshotActionId === action.id) return true;

    const sameTitle = normalizeText(task.text) === normalizedTitle;
    const module = modules.find((item) => item.id === task.moduleId);
    const sameModule = !normalizedModuleCode || normalizeText(module?.code || task.category || '') === normalizedModuleCode;
    return sameTitle && sameModule;
  });
}

export function addSnapshotActionToTasks(action: SnapshotTaskAction, userId = 'local-guest') {
  const tasks = readSnapshotTasks();
  if (isSnapshotActionAlreadyTasked(action, tasks)) {
    return { tasks, added: false };
  }

  const module = findModuleForCode(action.moduleCode);
  const newTask: SnapshotActionTask = {
    id: crypto.randomUUID(),
    userId,
    text: action.title,
    done: false,
    moduleId: module?.id || 'personal',
    category: module?.area || action.moduleCode || 'Academic snapshot',
    priority: action.priority,
    type: 'Admin',
    minutes: action.priority === 'Critical' ? 30 : 20,
    points: action.priority === 'Critical' ? 12 : 8,
    dueDate: null,
    createdAt: new Date().toISOString(),
    why: buildWhy(action),
    source: 'academic-snapshot',
    snapshotActionId: action.id,
    snapshotSourceLabel: action.sourceLabel,
  };

  const nextTasks = [...tasks, newTask];
  writeLocalJson(LOCAL_TASKS_KEY, nextTasks);
  return { tasks: nextTasks, added: true };
}

export function addAllSnapshotActionsToTasks(actions: SnapshotTaskAction[], userId = 'local-guest') {
  let added = 0;
  let tasks = readSnapshotTasks();

  for (const action of actions) {
    if (isSnapshotActionAlreadyTasked(action, tasks)) continue;
    const result = addSnapshotActionToTasks(action, userId);
    tasks = result.tasks;
    if (result.added) added += 1;
  }

  return { tasks, added };
}

function taskActionFromGlobal(snapshot: AcademicSnapshot, action: AcademicSnapshotGlobalAction): SnapshotTaskAction {
  return {
    id: snapshotActionId(snapshot.id, 'global', action.moduleCode, action.title),
    title: action.title,
    moduleCode: action.moduleCode,
    priority: mapPriority(action.priority),
    detail: action.detail,
    sourceLabel: snapshot.sourceLabel,
    sourceType: 'global-action',
  };
}

function taskActionFromModule(snapshot: AcademicSnapshot, module: AcademicSnapshotModule, title: string): SnapshotTaskAction {
  return {
    id: snapshotActionId(snapshot.id, 'module', module.moduleCode, title),
    title,
    moduleCode: module.moduleCode,
    moduleName: module.moduleName,
    priority: module.status === 'urgent' ? 'Critical' : 'High',
    detail: module.notes[0],
    sourceLabel: snapshot.sourceLabel,
    sourceType: 'module-action',
  };
}

function snapshotActionId(snapshotId: string, type: string, moduleCode: string | undefined, title: string) {
  return `${snapshotId}:${type}:${normalizeText(moduleCode || 'global')}:${normalizeText(title)}`;
}

function mapPriority(priority: AcademicSnapshotPriority): TaskPriority {
  switch (priority) {
    case 'urgent':
      return 'Critical';
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    default:
      return 'Low';
  }
}

function findModuleForCode(moduleCode: string | undefined) {
  if (!moduleCode) return null;
  const normalized = normalizeText(moduleCode);
  return modules.find((module) => {
    const candidates = [module.code, module.shortName, module.name, ...module.aliases].map(normalizeText);
    return candidates.includes(normalized);
  }) ?? null;
}

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function buildWhy(action: SnapshotTaskAction) {
  const parts = [
    action.detail,
    `Source: academic snapshot (${action.sourceLabel}).`,
    action.moduleCode ? `Module: ${action.moduleCode}.` : undefined,
  ].filter(Boolean);

  return parts.join(' ');
}
