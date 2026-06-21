import type { DashboardMarksPressureSummary } from './studyMetrics';

export type WeeklyReviewTone = 'red' | 'amber' | 'blue' | 'emerald' | 'slate';

export interface WeeklyReviewAction {
  title: string;
  detail: string;
  to: string;
  tone: WeeklyReviewTone;
}

interface ProvisionalEntry {
  moduleCode: string;
  assessmentId: string;
}

export interface WeeklyReviewInput {
  overdueCount: number;
  dueSoonCount: number;
  missingMarksCount: number;
  marksPressure: DashboardMarksPressureSummary;
  mistakeRetests: number;
  incompleteRuleCount: number;
  provisionalCalendarEntries: ProvisionalEntry[];
  backupAgeDays: number | null;
}

export function buildWeeklyReviewActions(input: WeeklyReviewInput): WeeklyReviewAction[] {
  const {
    overdueCount,
    dueSoonCount,
    missingMarksCount,
    marksPressure,
    mistakeRetests,
    incompleteRuleCount,
    provisionalCalendarEntries,
    backupAgeDays,
  } = input;

  const actions: WeeklyReviewAction[] = [];

  if (overdueCount > 0) {
    actions.push({
      title: 'Complete overdue tasks',
      detail: `${overdueCount} open task${overdueCount === 1 ? '' : 's'} past due.`,
      to: '/tasks',
      tone: 'red',
    });
  }

  if (missingMarksCount > 0 || !marksPressure.hasAnyMarkData) {
    actions.push({
      title: 'Add missing marks to activate pressure tracking',
      detail: missingMarksCount > 0
        ? `${missingMarksCount} module${missingMarksCount === 1 ? '' : 's'} still need current marks.`
        : 'No marks snapshot has been entered yet.',
      to: '/marks',
      tone: 'amber',
    });
  } else if (marksPressure.mostAtRisk) {
    actions.push({
      title: `Review ${marksPressure.mostAtRisk.moduleCode} marks pressure`,
      detail: marksPressure.mostAtRisk.warnings[0] || 'This module is the strongest current marks-pressure signal.',
      to: '/marks',
      tone: marksPressure.mostAtRisk.needsHighRecovery ? 'red' : 'amber',
    });
  }

  if (mistakeRetests > 0) {
    actions.push({
      title: 'Review mistakes due soon',
      detail: `${mistakeRetests} mistake retest${mistakeRetests === 1 ? '' : 's'} due this week.`,
      to: '/mistakes',
      tone: 'amber',
    });
  }

  if (incompleteRuleCount > 0) {
    actions.push({
      title: 'Add correction rules to repeated mistakes',
      detail: `${incompleteRuleCount} unresolved mistake${incompleteRuleCount === 1 ? '' : 's'} need clear correction rules.`,
      to: '/mistakes',
      tone: 'blue',
    });
  }

  if (provisionalCalendarEntries.length > 0) {
    actions.push({
      title: 'Verify provisional assessment details before the assessment',
      detail: provisionalCalendarEntries.map((e) => `${e.moduleCode} ${e.assessmentId}`).join(', '),
      to: '/modules',
      tone: 'blue',
    });
  }

  if (backupAgeDays === null || backupAgeDays > 7) {
    actions.push({
      title: 'Back up your StudyOS data',
      detail: backupAgeDays === null
        ? 'No local backup is recorded yet.'
        : `Last backup was ${backupAgeDays} day${backupAgeDays === 1 ? '' : 's'} ago.`,
      to: '/settings',
      tone: 'slate',
    });
  }

  if (actions.length === 0 && dueSoonCount > 0) {
    actions.push({
      title: 'Finish due-soon tasks steadily',
      detail: `${dueSoonCount} open task${dueSoonCount === 1 ? '' : 's'} due within 7 days.`,
      to: '/tasks',
      tone: 'emerald',
    });
  }

  return actions.slice(0, 6);
}

export function weeklyReviewTone(tone: WeeklyReviewTone): string {
  switch (tone) {
    case 'red':
      return 'border-red-100 bg-red-50 text-red-800';
    case 'amber':
      return 'border-amber-100 bg-amber-50 text-amber-800';
    case 'blue':
      return 'border-blue-100 bg-blue-50 text-blue-800';
    case 'emerald':
      return 'border-emerald-100 bg-emerald-50 text-emerald-800';
    default:
      return 'border-slate-100 bg-slate-50 text-slate-700';
  }
}

export function weeklyReviewDotTone(tone: WeeklyReviewTone): string {
  switch (tone) {
    case 'red':
      return 'bg-red-500';
    case 'amber':
      return 'bg-amber-500';
    case 'blue':
      return 'bg-blue-500';
    case 'emerald':
      return 'bg-emerald-500';
    default:
      return 'bg-slate-400';
  }
}
