import { modules, type ModuleInfo } from '../data/baccllb';
import { LOCAL_TOPIC_MASTERY_KEY, readLocalJson, writeLocalJson } from './localData';

export type ExamPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TopicStatus = 'not-started' | 'learning' | 'practising' | 'exam-ready';

export interface TopicMasteryRecord {
  id: string;
  moduleId: string;
  topicName: string;
  confidencePercent: number;
  readDone: boolean;
  notesDone: boolean;
  practiceDone: boolean;
  lastReviewed: string;
  retestDate: string;
  examPriority: ExamPriority;
  status: TopicStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

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
    lastReviewed: '',
    retestDate: '',
    examPriority: 'medium',
    status: 'not-started',
    notes: '',
    createdAt: now,
    updatedAt: now,
  };
};

export function readTopicMastery(): TopicMasteryRecord[] {
  return readLocalJson<TopicMasteryRecord[]>(LOCAL_TOPIC_MASTERY_KEY, []);
}

export function writeTopicMastery(records: TopicMasteryRecord[]) {
  writeLocalJson(LOCAL_TOPIC_MASTERY_KEY, records);
}

export function upsertTopicMastery(record: TopicMasteryRecord) {
  const existing = readTopicMastery();
  const updatedRecord = {
    ...record,
    updatedAt: new Date().toISOString(),
    createdAt: record.createdAt || new Date().toISOString(),
  };
  const next = record.id
    ? existing.map((item) => (item.id === record.id ? updatedRecord : item))
    : [...existing, { ...updatedRecord, id: crypto.randomUUID() }];
  writeTopicMastery(next);
  return next;
}

export function deleteTopicMastery(id: string) {
  const next = readTopicMastery().filter((item) => item.id !== id);
  writeTopicMastery(next);
  return next;
}

export function topicSuggestionsForModule(module: ModuleInfo) {
  return dedupeStrings([...module.weakPoints, ...module.examFocus, ...module.nextActions]);
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

function dedupeStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function stripTime(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
