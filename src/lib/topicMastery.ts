import { modules, type ModuleInfo } from '../data/baccllb';
import { LOCAL_TOPIC_MASTERY_KEY, readLocalJson, writeLocalJson } from './localData';

export type ExamPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TopicStatus = 'not-started' | 'learning' | 'practising' | 'exam-ready';
export type TopicStrengthLabel = 'weak' | 'building' | 'good' | 'strong';

export interface TopicMasteryRecord {
  id: string;
  moduleId: string;
  topicName: string;
  confidencePercent: number;
  readDone: boolean;
  notesDone: boolean;
  practiceDone: boolean;
  practiceCount: number;
  lastReviewed: string;
  retestDate: string;
  examPriority: ExamPriority;
  status: TopicStatus;
  statusLabel: TopicStrengthLabel;
  finalBossReady: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

type PartialTopicRecord = Partial<TopicMasteryRecord> & {
  id?: unknown;
  moduleId?: unknown;
  topicName?: unknown;
  confidencePercent?: unknown;
  readDone?: unknown;
  notesDone?: unknown;
  practiceDone?: unknown;
  practiceCount?: unknown;
  lastReviewed?: unknown;
  retestDate?: unknown;
  examPriority?: unknown;
  status?: unknown;
  statusLabel?: unknown;
  finalBossReady?: unknown;
  notes?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

const priorityValues: ExamPriority[] = ['low', 'medium', 'high', 'urgent'];
const statusValues: TopicStatus[] = ['not-started', 'learning', 'practising', 'exam-ready'];
const strengthValues: TopicStrengthLabel[] = ['weak', 'building', 'good', 'strong'];

export const emptyTopicDraft = (moduleId: string): TopicMasteryRecord => {
  const now = new Date().toISOString();
  return {
    id: '',
    moduleId,
    topicName: '',
    confidencePercent: 40,
    readDone: false,
    notesDone: false,
    practiceDone: false,
    practiceCount: 0,
    lastReviewed: '',
    retestDate: '',
    examPriority: 'medium',
    status: 'not-started',
    statusLabel: 'weak',
    finalBossReady: false,
    notes: '',
    createdAt: now,
    updatedAt: now,
  };
};

export function readTopicMastery(): TopicMasteryRecord[] {
  const raw = readLocalJson<unknown[]>(LOCAL_TOPIC_MASTERY_KEY, []);
  const normalized = raw
    .map((item) => normalizeTopicRecord(item))
    .filter((item): item is TopicMasteryRecord => Boolean(item));
  return normalized;
}

export function writeTopicMastery(records: TopicMasteryRecord[]) {
  writeLocalJson(LOCAL_TOPIC_MASTERY_KEY, records);
}

export function upsertTopicMastery(record: TopicMasteryRecord) {
  const existing = readTopicMastery();
  const now = new Date().toISOString();
  const updatedRecord = normalizeTopicRecord({
    ...record,
    updatedAt: now,
    createdAt: record.createdAt || now,
  });
  if (!updatedRecord) return existing;
  const next = updatedRecord.id
    ? existing.map((item) => (item.id === updatedRecord.id ? updatedRecord : item))
    : [...existing, { ...updatedRecord, id: crypto.randomUUID() }];
  writeTopicMastery(next);
  return next;
}

export function deleteTopicMastery(id: string) {
  const next = readTopicMastery().filter((item) => item.id !== id);
  writeTopicMastery(next);
  return next;
}

export function updateTopicQuickAction(
  id: string,
  updater: (record: TopicMasteryRecord) => TopicMasteryRecord,
) {
  const next = readTopicMastery().map((item) => {
    if (item.id !== id) return item;
    const updated = updater(item);
    return normalizeTopicRecord({ ...updated, id: item.id, createdAt: item.createdAt, updatedAt: new Date().toISOString() }) || item;
  });
  writeTopicMastery(next);
  return next;
}

export function resetTopicMasteryRecord(id: string) {
  return updateTopicQuickAction(id, (record) => ({
    ...emptyTopicDraft(record.moduleId),
    id: record.id,
    moduleId: record.moduleId,
    topicName: record.topicName,
    createdAt: record.createdAt,
  }));
}

export function markTopicReviewedToday(id: string) {
  return updateTopicQuickAction(id, (record) => ({
    ...record,
    lastReviewed: todayDateInput(),
  }));
}

export function topicSuggestionsForModule(module: ModuleInfo) {
  return dedupeStrings([
    ...module.topics.map((topic) => topic.title),
    ...module.topics.flatMap((topic) => topic.subtopics),
    ...module.weakPoints,
    ...module.examFocus,
    ...module.nextActions,
  ]);
}

export function averageTopicConfidence(records: TopicMasteryRecord[]) {
  if (records.length === 0) return 0;
  return Math.round(records.reduce((sum, item) => sum + item.confidencePercent, 0) / records.length);
}

export function topicsDueThisWeek(records: TopicMasteryRecord[]) {
  const today = new Date();
  const weekFromNow = new Date();
  weekFromNow.setDate(today.getDate() + 7);

  return records.filter((item) => {
    if (!item.retestDate) return false;
    const date = new Date(item.retestDate);
    return date >= stripTime(today) && date <= stripTime(weekFromNow);
  });
}

export function topicsNeedingRetestSoon(records: TopicMasteryRecord[]) {
  const today = stripTime(new Date());
  const threeDays = new Date(today);
  threeDays.setDate(today.getDate() + 3);

  return records.filter((item) => {
    if (!item.retestDate) return false;
    const date = stripTime(new Date(item.retestDate));
    return date >= today && date <= threeDays;
  });
}

export function urgentTopicsCount(records: TopicMasteryRecord[]) {
  return records.filter((item) => item.examPriority === 'urgent').length;
}

export function moduleNameForTopic(moduleId: string) {
  return modules.find((module) => module.id === moduleId)?.shortName || 'Unknown module';
}

export function deriveTopicStatus(topic: Pick<TopicMasteryRecord, 'practiceDone' | 'practiceCount' | 'confidencePercent' | 'readDone' | 'notesDone' | 'finalBossReady'>): TopicStatus {
  if (topic.finalBossReady || (topic.practiceDone && topic.practiceCount >= 3 && topic.confidencePercent >= 80)) return 'exam-ready';
  if (topic.practiceDone || topic.practiceCount >= 2 || topic.confidencePercent >= 60) return 'practising';
  if (topic.readDone || topic.notesDone || topic.confidencePercent > 0) return 'learning';
  return 'not-started';
}

export function deriveTopicStrengthLabel(topic: Pick<TopicMasteryRecord, 'confidencePercent' | 'practiceCount' | 'finalBossReady'>): TopicStrengthLabel {
  if (topic.finalBossReady || (topic.confidencePercent >= 85 && topic.practiceCount >= 3)) return 'strong';
  if (topic.confidencePercent >= 70 || topic.practiceCount >= 2) return 'good';
  if (topic.confidencePercent >= 45 || topic.practiceCount >= 1) return 'building';
  return 'weak';
}

function normalizeTopicRecord(value: unknown): TopicMasteryRecord | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  const candidate = value as PartialTopicRecord;
  const moduleId = typeof candidate.moduleId === 'string' ? candidate.moduleId : '';
  const topicName = typeof candidate.topicName === 'string' ? candidate.topicName.trim() : '';
  if (!moduleId || !topicName) return null;

  const now = new Date().toISOString();
  const readDone = Boolean(candidate.readDone);
  const notesDone = Boolean(candidate.notesDone);
  const practiceDone = Boolean(candidate.practiceDone);
  const confidencePercent = clampPercent(candidate.confidencePercent);
  const practiceCount = clampPracticeCount(candidate.practiceCount);
  const finalBossReady = Boolean(candidate.finalBossReady);

  const base: TopicMasteryRecord = {
    id: typeof candidate.id === 'string' ? candidate.id : '',
    moduleId,
    topicName,
    confidencePercent,
    readDone,
    notesDone,
    practiceDone,
    practiceCount,
    lastReviewed: typeof candidate.lastReviewed === 'string' ? candidate.lastReviewed : '',
    retestDate: typeof candidate.retestDate === 'string' ? candidate.retestDate : '',
    examPriority: isPriority(candidate.examPriority) ? candidate.examPriority : 'medium',
    status: 'not-started',
    statusLabel: 'weak',
    finalBossReady,
    notes: typeof candidate.notes === 'string' ? candidate.notes : '',
    createdAt: typeof candidate.createdAt === 'string' ? candidate.createdAt : now,
    updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : now,
  };

  const derivedStatus = deriveTopicStatus(base);
  const derivedStrength = deriveTopicStrengthLabel(base);

  return {
    ...base,
    status: isStatus(candidate.status) ? candidate.status : derivedStatus,
    statusLabel: isStrength(candidate.statusLabel) ? candidate.statusLabel : derivedStrength,
  };
}

function isPriority(value: unknown): value is ExamPriority {
  return typeof value === 'string' && priorityValues.includes(value as ExamPriority);
}

function isStatus(value: unknown): value is TopicStatus {
  return typeof value === 'string' && statusValues.includes(value as TopicStatus);
}

function isStrength(value: unknown): value is TopicStrengthLabel {
  return typeof value === 'string' && strengthValues.includes(value as TopicStrengthLabel);
}

function clampPercent(value: unknown) {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function clampPracticeCount(value: unknown) {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(999, Math.round(numeric)));
}

function dedupeStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function stripTime(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function todayDateInput() {
  return new Date().toISOString().slice(0, 10);
}
