import { modules } from '../data/baccllb';
import { LOCAL_TOPIC_MASTERY_KEY, readLocalJson, writeLocalJson } from './localData';

export type MistakeSourceType =
  | 'test'
  | 'tutorial'
  | 'past-paper'
  | 'class-example'
  | 'assignment'
  | 'self-study'
  | 'other';

export interface MistakeRecord {
  id: string;
  moduleId: string;
  mistakeCategory?: string;
  topicId?: string;
  topicName?: string;
  mistakeTitle: string;
  mistakeDescription: string;
  whyItHappened: string;
  correctionRule: string;
  sourceType: MistakeSourceType;
  sourceReference: string;
  markLost?: number;
  retestDate: string;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export const LOCAL_MISTAKE_BANK_KEY = 'baccllb-mistake-bank';

export function emptyMistakeDraft(moduleId: string): MistakeRecord {
  const now = new Date().toISOString();
  return {
    id: '',
    moduleId,
    mistakeCategory: '',
    topicId: '',
    topicName: '',
    mistakeTitle: '',
    mistakeDescription: '',
    whyItHappened: '',
    correctionRule: '',
    sourceType: 'test',
    sourceReference: '',
    markLost: undefined,
    retestDate: '',
    resolved: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function readMistakeBank(): MistakeRecord[] {
  return readLocalJson<MistakeRecord[]>(LOCAL_MISTAKE_BANK_KEY, []);
}

export function writeMistakeBank(records: MistakeRecord[]) {
  writeLocalJson(LOCAL_MISTAKE_BANK_KEY, records);
}

export function upsertMistake(record: MistakeRecord) {
  const existing = readMistakeBank();
  const updatedRecord: MistakeRecord = {
    ...record,
    updatedAt: new Date().toISOString(),
    createdAt: record.createdAt || new Date().toISOString(),
  };
  const next = record.id
    ? existing.map((item) => (item.id === record.id ? updatedRecord : item))
    : [...existing, { ...updatedRecord, id: crypto.randomUUID() }];
  writeMistakeBank(next);
  return next;
}

export function deleteMistake(id: string) {
  const next = readMistakeBank().filter((item) => item.id !== id);
  writeMistakeBank(next);
  return next;
}

export function unresolvedMistakes(records: MistakeRecord[]) {
  return records.filter((item) => !item.resolved);
}

const PLACEHOLDER_CORRECTION_RULES = new Set(['', 'tbd', 'todo', 'fix', 'n/a', 'na', 'placeholder', 'none', '-', 'unknown']);

export function needsCorrectionRule(item: MistakeRecord): boolean {
  if (item.resolved) return false;
  const rule = (item.correctionRule ?? '').trim().toLowerCase();
  return !rule || PLACEHOLDER_CORRECTION_RULES.has(rule);
}

export function mistakesNeedingCorrectionRule(records: MistakeRecord[]): MistakeRecord[] {
  return records.filter(needsCorrectionRule);
}

export function mistakeRetestsDueThisWeek(records: MistakeRecord[]) {
  const today = stripTime(new Date());
  const weekFromNow = new Date(today);
  weekFromNow.setDate(today.getDate() + 7);

  return records.filter((item) => {
    if (!item.retestDate || item.resolved) return false;
    const date = stripTime(new Date(item.retestDate));
    return date >= today && date <= weekFromNow;
  });
}

export function mistakeRetestsInWindow(records: MistakeRecord[], days: number): MistakeRecord[] {
  const today = stripTime(new Date());
  const cutoff = new Date(today);
  cutoff.setDate(today.getDate() + days);

  return records
    .filter((item) => {
      if (item.resolved || !item.retestDate) return false;
      const parsed = new Date(item.retestDate);
      if (isNaN(parsed.getTime())) return false;
      return stripTime(parsed) <= cutoff;
    })
    .sort((a, b) => a.retestDate.localeCompare(b.retestDate));
}

export function mistakeRetestsDueSoon(records: MistakeRecord[]) {
  const today = stripTime(new Date());
  const threeDays = new Date(today);
  threeDays.setDate(today.getDate() + 3);

  return records.filter((item) => {
    if (!item.retestDate || item.resolved) return false;
    const date = stripTime(new Date(item.retestDate));
    return date >= today && date <= threeDays;
  });
}

export function moduleWithMostUnresolvedMistakes(records: MistakeRecord[]) {
  const counts = unresolvedMistakes(records).reduce<Record<string, number>>((acc, item) => {
    acc[item.moduleId] = (acc[item.moduleId] || 0) + 1;
    return acc;
  }, {});

  const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (!winner) return null;

  const module = modules.find((item) => item.id === winner[0]);
  return module ? { moduleId: module.id, moduleName: module.shortName, count: winner[1] } : null;
}

export function readTopicOptionsForModule(moduleId: string) {
  const topics = readLocalJson<Array<{ id: string; moduleId: string; topicName: string }>>(LOCAL_TOPIC_MASTERY_KEY, []);
  return topics.filter((item) => item.moduleId === moduleId && item.topicName?.trim());
}

export function moduleLabel(moduleId: string) {
  return modules.find((module) => module.id === moduleId)?.shortName || 'Unknown module';
}

function stripTime(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
