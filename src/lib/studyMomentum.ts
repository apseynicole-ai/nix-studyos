export interface FocusSessionLike {
  createdAt: string;
  durationMinutes: number;
  mode: string;
  autoCompleted: boolean;
}

export interface MomentumDay {
  key: string;
  label: string;
  minutes: number;
  hasStudy: boolean;
}

export interface StudyMomentumSummary {
  currentStreak: number;
  bestStreak: number;
  totalLast7DaysMinutes: number;
  todayMinutes: number;
  yesterdayMinutes: number;
  needsSessionToday: boolean;
  label: string;
  last7Days: MomentumDay[];
}

function toDayKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fromDayKey(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function addDays(date: Date, days: number) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

function dayDiff(left: Date, right: Date) {
  const leftMidnight = new Date(left.getFullYear(), left.getMonth(), left.getDate()).getTime();
  const rightMidnight = new Date(right.getFullYear(), right.getMonth(), right.getDate()).getTime();
  return Math.round((leftMidnight - rightMidnight) / 86400000);
}

function isCompletedFocusSession(session: FocusSessionLike) {
  return session.autoCompleted && session.mode !== 'break';
}

function getLabel(currentStreak: number, needsSessionToday: boolean, totalLast7DaysMinutes: number) {
  if (currentStreak >= 7) return 'Strong study rhythm';
  if (needsSessionToday && currentStreak > 0) return 'Keep the chain alive';
  if (currentStreak >= 3 || totalLast7DaysMinutes >= 180) return 'Momentum building';
  return 'Restart gently today';
}

export function getStudyMomentumSummary(
  sessions: FocusSessionLike[],
  now = new Date(),
): StudyMomentumSummary {
  const focusSessions = sessions.filter(isCompletedFocusSession);
  const minutesByDay = focusSessions.reduce<Record<string, number>>((acc, session) => {
    const date = new Date(session.createdAt);
    if (Number.isNaN(date.getTime())) return acc;
    const key = toDayKey(date);
    acc[key] = (acc[key] ?? 0) + session.durationMinutes;
    return acc;
  }, {});

  const todayKey = toDayKey(now);
  const yesterdayKey = toDayKey(addDays(now, -1));
  const todayMinutes = minutesByDay[todayKey] ?? 0;
  const yesterdayMinutes = minutesByDay[yesterdayKey] ?? 0;

  let currentStreak = 0;
  if (todayMinutes > 0 || yesterdayMinutes > 0) {
    let cursor = todayMinutes > 0 ? now : addDays(now, -1);
    while ((minutesByDay[toDayKey(cursor)] ?? 0) > 0) {
      currentStreak += 1;
      cursor = addDays(cursor, -1);
    }
  }

  const studyDayKeys = Object.keys(minutesByDay).sort();
  let bestStreak = 0;
  let runningStreak = 0;
  let previousDate: Date | null = null;

  for (const key of studyDayKeys) {
    const currentDate = fromDayKey(key);
    if (previousDate && dayDiff(currentDate, previousDate) === 1) {
      runningStreak += 1;
    } else {
      runningStreak = 1;
    }

    if (runningStreak > bestStreak) bestStreak = runningStreak;
    previousDate = currentDate;
  }

  const last7Days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(now, index - 6);
    const key = toDayKey(date);
    const minutes = minutesByDay[key] ?? 0;
    return {
      key,
      label: new Intl.DateTimeFormat('en-ZA', { weekday: 'short' }).format(date),
      minutes,
      hasStudy: minutes > 0,
    };
  });

  const totalLast7DaysMinutes = last7Days.reduce((sum, day) => sum + day.minutes, 0);
  const needsSessionToday = todayMinutes === 0 && yesterdayMinutes > 0 && currentStreak > 0;

  return {
    currentStreak,
    bestStreak,
    totalLast7DaysMinutes,
    todayMinutes,
    yesterdayMinutes,
    needsSessionToday,
    label: getLabel(currentStreak, needsSessionToday, totalLast7DaysMinutes),
    last7Days,
  };
}
