import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { modules } from '../data/baccllb';
import { LOCAL_TOPIC_MASTERY_KEY } from './localData';
import { LOCAL_MISTAKE_BANK_KEY, type MistakeRecord } from './mistakeBank';
import {
  getFinalBossActions,
  getMistakeRetestActions,
  getNextBestActions,
  scoreTopicPriority,
  type NextBestAction,
} from './nextBestAction';
import type { TopicMasteryRecord } from './topicMastery';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return Array.from(this.values.keys())[index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

const TODAY = '2026-06-24';

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true });
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${TODAY}T12:00:00.000Z`));
});

afterEach(() => {
  vi.useRealTimers();
  (globalThis.localStorage as MemoryStorage).clear();
});

function topic(overrides: Partial<TopicMasteryRecord> = {}): TopicMasteryRecord {
  const now = `${TODAY}T09:00:00.000Z`;
  return {
    id: 'topic-1',
    moduleId: 'econ114',
    topicName: 'Demand and supply graphs',
    confidencePercent: 35,
    readDone: false,
    notesDone: false,
    practiceDone: false,
    practiceCount: 0,
    lastReviewed: '',
    retestDate: '',
    examPriority: 'high',
    status: 'learning',
    statusLabel: 'weak',
    finalBossReady: false,
    notes: '',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function mistake(overrides: Partial<MistakeRecord> = {}): MistakeRecord {
  const now = `${TODAY}T09:00:00.000Z`;
  return {
    id: 'mistake-1',
    moduleId: 'conlaw178',
    mistakeCategory: 'Limitations analysis',
    topicId: '',
    topicName: 'Section 36 limitation analysis',
    mistakeTitle: 'Skipped proportionality',
    mistakeDescription: 'Jumped to conclusion before weighing factors.',
    whyItHappened: 'Rushed issue spotting.',
    correctionRule: 'List each section 36 factor before concluding.',
    sourceType: 'test',
    sourceReference: 'A2 practice',
    markLost: 4,
    retestDate: '2026-06-25',
    resolved: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function writeTopics(records: TopicMasteryRecord[]) {
  localStorage.setItem(LOCAL_TOPIC_MASTERY_KEY, JSON.stringify(records));
}

function writeMistakes(records: MistakeRecord[]) {
  localStorage.setItem(LOCAL_MISTAKE_BANK_KEY, JSON.stringify(records));
}

function expectDashboardSafeShape(action: NextBestAction) {
  expect(action.id).toBeTruthy();
  expect(action.moduleId).toBeTruthy();
  expect(action.moduleCode).toBeTruthy();
  expect(action.title).toBeTruthy();
  expect(action.reason).toBeTruthy();
  expect(action.actionType).toBeTruthy();
  expect(action.priority).toMatch(/^(low|medium|high|urgent)$/);
  expect(action.estimatedMinutes).toBeGreaterThan(0);
  expect(action.suggestedStudyMethod).toBeTruthy();
  expect(action.confidenceRiskLabel).toBeTruthy();
  expect(Array.isArray(action.evidence)).toBe(true);
  expect(action.evidence.length).toBeGreaterThan(0);
}

describe('getNextBestActions', () => {
  it('does not crash with empty local topic and mistake state', () => {
    expect(() => getNextBestActions({ limit: 8 })).not.toThrow();

    const actions = getNextBestActions({ limit: 8 });
    expect(Array.isArray(actions)).toBe(true);
    expect(actions.length).toBeGreaterThan(0);
    actions.forEach(expectDashboardSafeShape);
  });

  it('creates a concrete recommendation for the weakest high-priority topic and deprioritises an exam-ready topic', () => {
    const weak = topic({
      id: 'weak-topic',
      topicName: 'Demand and supply graphs',
      confidencePercent: 30,
      examPriority: 'urgent',
      status: 'learning',
      readDone: false,
      notesDone: false,
      practiceDone: false,
    });
    const strong = topic({
      id: 'strong-topic',
      topicName: 'Already exam-ready content',
      confidencePercent: 95,
      examPriority: 'low',
      status: 'exam-ready',
      statusLabel: 'strong',
      readDone: true,
      notesDone: true,
      practiceDone: true,
      practiceCount: 4,
      finalBossReady: true,
    });
    writeTopics([strong, weak]);

    const actions = getNextBestActions({ moduleId: 'econ114', limit: 10 });
    const topicAction = actions.find((action) => action.linkedTopic === weak.topicName && action.actionType === 'practice');

    expect(topicAction).toBeDefined();
    expect(topicAction?.moduleId).toBe('econ114');
    expect(topicAction?.moduleCode).toBe('ECO114');
    expect(topicAction?.title).toContain(weak.topicName);
    expect(topicAction?.reason).toContain('low confidence');
    expect(topicAction?.estimatedMinutes).toBeGreaterThan(0);
    expect(actions.some((action) => action.title.includes(strong.topicName))).toBe(false);
    expect(scoreTopicPriority(weak)).toBeGreaterThan(scoreTopicPriority(strong));
  });

  it('creates unresolved mistake retest recommendations and ignores resolved mistakes', () => {
    const dueSoon = mistake({ id: 'due-soon', retestDate: '2026-06-25', resolved: false });
    const resolved = mistake({ id: 'resolved', retestDate: '2026-06-25', resolved: true });
    writeMistakes([resolved, dueSoon]);

    const actions = getNextBestActions({ moduleId: 'conlaw178', limit: 10 });
    const mistakeActions = actions.filter((action) => action.actionType === 'mistake-retest');

    expect(mistakeActions).toHaveLength(1);
    expect(mistakeActions[0].id).toContain(dueSoon.id);
    expect(mistakeActions[0].linkedTopic).toBe(dueSoon.topicName);
    expect(mistakeActions[0].dueDate).toBe(dueSoon.retestDate);
    expect(mistakeActions[0].reason).toContain('correction loop');
    expect(mistakeActions[0].id).not.toContain(resolved.id);
  });

  it('prioritises an overdue high-loss mistake hotspot when no due-soon retest exists', () => {
    const overdueHighLoss = mistake({
      id: 'overdue-high-loss',
      mistakeCategory: 'High loss cluster',
      markLost: 10,
      retestDate: '2026-06-20',
    });
    const undatedLowLoss = mistake({
      id: 'undated-low-loss',
      mistakeCategory: 'Low loss cluster',
      markLost: 2,
      retestDate: '',
    });
    const conlaw = modules.find((module) => module.id === 'conlaw178')!;

    const actions = getMistakeRetestActions(conlaw, [undatedLowLoss, overdueHighLoss]);

    expect(actions).toHaveLength(1);
    expect(actions[0].id).toContain(overdueHighLoss.id);
    expect(actions[0].title).toContain('High loss cluster');
    expect(actions[0].evidence.some((factor) => factor.evidence.includes('10 marks'))).toBe(true);
  });

  it('returns a concrete final-boss action for a high-risk module with vault items', () => {
    const finacc = modules.find((module) => module.id === 'finacc178')!;
    const actions = getFinalBossActions(finacc);

    expect(actions.length).toBeGreaterThan(0);
    expect(actions[0].actionType).toBe('final-boss');
    expect(actions[0].moduleId).toBe('finacc178');
    expect(actions[0].title).toContain('rehearse');
    expect(actions[0].reason).toContain('Final Boss rehearsal');
    expect(actions[0].suggestedStudyMethod).toBeTruthy();
  });

  it('sorts higher urgency recommendations ahead of lower priority recommendations', () => {
    writeTopics([
      topic({
        id: 'urgent-topic',
        moduleId: 'econ114',
        topicName: 'Urgent weak topic',
        examPriority: 'urgent',
        confidencePercent: 10,
        status: 'not-started',
        retestDate: '2026-06-25',
      }),
      topic({
        id: 'low-topic',
        moduleId: 'econ114',
        topicName: 'Lower pressure topic',
        examPriority: 'low',
        confidencePercent: 70,
        status: 'practising',
        readDone: true,
        notesDone: true,
        practiceDone: true,
      }),
    ]);

    const actions = getNextBestActions({ moduleId: 'econ114', limit: 10 });
    const urgentIndex = actions.findIndex((action) => action.title.includes('Urgent weak topic'));
    const lowIndex = actions.findIndex((action) => action.title.includes('Lower pressure topic'));

    expect(urgentIndex).toBeGreaterThanOrEqual(0);
    expect(lowIndex).toBe(-1);
    expect(actions[urgentIndex].priority).toMatch(/^(high|urgent)$/);
    expect(actions[0].priority).toMatch(/^(high|urgent)$/);
  });

  it('keeps shell module fallback recommendations dashboard-safe when they are produced', () => {
    const lawPersonsActions = getNextBestActions({ moduleId: 'lawpersons144', limit: 5 });

    // Current behaviour: shell modules can produce fallback/source/planning recommendations
    // because they intentionally carry placeholder topics and verification flags.
    expect(lawPersonsActions.length).toBeGreaterThan(0);
    lawPersonsActions.forEach(expectDashboardSafeShape);
    expect(lawPersonsActions.every((action) => action.needsVerification)).toBe(true);
  });
});
