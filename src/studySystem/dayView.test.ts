import { beforeEach, describe, expect, it } from 'vitest';
import { installMemoryStorage } from './testMemoryStorage';
import { bootstrapSemester2 } from './seed/bootstrap';
import { buildDayFeed, buildDaySummary } from './dayView';
import { clearAttendance, getAttendanceFor, logAttendance } from './attendance';
import { completeSession, logUnplannedActivity, startSession, stopSession } from './session';
import { scheduledActivitiesRepo } from './repositories';
import { formatActualVsPlanned, formatDurationDisplay, roundToNearest5 } from './display';

const MON = '2026-07-27';
const T0 = Date.parse('2026-07-27T13:00:00.000Z');

beforeEach(() => {
  installMemoryStorage();
  bootstrapSemester2();
});

describe('attendance logging (spec §2/§11 mapping)', () => {
  it('maps ATTENDED/MISSED/CANCELLED to the locked completion states and is idempotent', () => {
    const activity = scheduledActivitiesRepo.read().find((a) => a.id === 'sa-mon-econ')!;
    expect(logAttendance(activity, 'ATTENDED').state).toBe('COMPLETED');
    expect(logAttendance(activity, 'MISSED').state).toBe('MISSED');
    expect(logAttendance(activity, 'CANCELLED').state).toBe('CANCELLED');
    // still one entry (updated in place)
    expect(getAttendanceFor('sa-mon-econ')!.attendance).toBe('CANCELLED');
    clearAttendance('sa-mon-econ');
    expect(getAttendanceFor('sa-mon-econ')).toBeUndefined();
  });
});

describe('buildDayFeed', () => {
  it('returns classes + study blocks for the day in chronological order', () => {
    const feed = buildDayFeed(MON);
    expect(feed.length).toBeGreaterThan(0);
    const times = feed.map((i) => i.sortTime);
    expect([...times]).toEqual([...times].sort());
    expect(feed.some((i) => i.kind === 'class')).toBe(true);
    expect(feed.some((i) => i.kind === 'study')).toBe(true);
  });

  it('reflects attendance state on a class item', () => {
    const activity = scheduledActivitiesRepo.read().find((a) => a.id === 'sa-mon-found')!;
    logAttendance(activity, 'ATTENDED');
    const item = buildDayFeed(MON).find((i) => i.kind === 'class' && i.activity.id === 'sa-mon-found')!;
    expect(item.state).toBe('COMPLETED');
  });

  it('reflects running / completed state on a study block', () => {
    startSession({ moduleId: 'foundations178', studyBlockId: 'sb-mon-found' }, T0);
    let item = buildDayFeed(MON).find((i) => i.kind === 'study' && i.block.id === 'sb-mon-found')! as Extract<ReturnType<typeof buildDayFeed>[number], { kind: 'study' }>;
    expect(item.isRunning).toBe(true);
    expect(item.state).toBe('IN_PROGRESS');

    stopSession(T0 + 60 * 60000);
    completeSession({ status: 'COMPLETED', location: 'Room', followUpRequired: false });
    item = buildDayFeed(MON).find((i) => i.kind === 'study' && i.block.id === 'sb-mon-found')! as typeof item;
    expect(item.isRunning).toBe(false);
    expect(item.state).toBe('COMPLETED');
    expect(item.session!.exactMinutes).toBe(60);
  });
});

describe('buildDaySummary (private study actual vs planned)', () => {
  it('sums planned block minutes and exact actual minutes (incl. unplanned)', () => {
    // Monday planned blocks (Phase C.1 budget fix): econ 45 + found 60 + lop 45 = 150
    const before = buildDaySummary(MON);
    expect(before.plannedStudyMinutes).toBe(150);
    expect(before.actualStudyMinutes).toBe(0);

    startSession({ moduleId: 'foundations178', studyBlockId: 'sb-mon-found' }, T0);
    stopSession(T0 + 67 * 60000);
    completeSession({ status: 'PARTIALLY_COMPLETED', location: 'Library', followUpRequired: false });
    logUnplannedActivity({ moduleId: 'conlaw178', minutes: 30, status: 'COMPLETED', location: 'Coffee shop' }, T0);

    const after = buildDaySummary(MON);
    expect(after.actualStudyMinutes).toBe(97); // 67 + 30, exact
    expect(after.completedBlocks).toBe(1);
  });
});

describe('display formatting (§1B — exact stored, 5-min display)', () => {
  it('rounds to nearest 5 for display only', () => {
    expect(roundToNearest5(67)).toBe(65);
    expect(formatDurationDisplay(67)).toBe('1h 05');
    expect(formatDurationDisplay(45)).toBe('45 min');
    expect(formatActualVsPlanned(125, 180)).toBe('2h 05 / 3h 00');
  });
});
