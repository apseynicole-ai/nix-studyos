import type { LucideIcon } from 'lucide-react';

export type ModuleArea = 'Accounting' | 'Law' | 'Economics' | 'Quantitative' | 'Digital' | 'Personal';
export type Semester = 'S1' | 'S2' | 'Year';
export type AssessmentStatus = 'done' | 'upcoming' | 'draft' | 'unknown';
export type SourceStatus = 'available' | 'partial' | 'missing' | 'in-progress' | 'needs-verification' | 'not-needed';

export interface Assessment {
  title: string;
  date: string;
  time?: string;
  weight?: number;
  status: AssessmentStatus;
  notes?: string;
}

export interface ModuleAssessmentDetail {
  id: string;
  title: string;
  date?: string;
  time?: string;
  weight?: number | null;
  format?: string;
  scope?: string[];
  status: AssessmentStatus;
  notes?: string;
  needsVerification?: boolean;
}

export interface ModuleTopic {
  id: string;
  title: string;
  shortLabel?: string;
  semester?: Semester;
  assessmentTags?: string[];
  subtopics: string[];
  needsVerification?: boolean;
}

export interface ModuleSourceItem {
  label: string;
  status: SourceStatus;
  note?: string;
}

export interface ModuleCurrentMark {
  id: string;
  label: string;
  value: number | null;
  note?: string;
}

export interface ModuleFinalBossItem {
  id: string;
  title: string;
  description: string;
}

export interface ModuleAssessmentRules {
  formulaSummary: string[];
  passRequirements: string[];
  riskWarnings: string[];
  examFormats: string[];
  a3Logic?: string[];
  negativeMarking?: string[];
  impossibleTargetNote?: string;
  a2A3LogicUncertain?: boolean;
}

export interface ModuleAppRequirements {
  dashboardCards: string[];
  topicTracker: string[];
  marksEngine: string[];
  mistakeBank?: string[];
  lexAi?: string[];
  planner?: string[];
  finalBoss?: string[];
}

export interface ModuleInfo {
  id: string;
  code: string;
  name: string;
  shortName: string;
  aliases: string[];
  area: ModuleArea;
  semester: Semester;
  credits?: number;
  target: number;
  currentMark?: number | null;
  confidence: number;
  colour: string;
  icon: LucideIcon;
  programmeContext: string;
  currentMarks: {
    overall: number | null;
    byAssessment: ModuleCurrentMark[];
    targetBand: string;
    a2GoalMark?: number | null;
    a3GoalMark?: number | null;
    note?: string;
  };
  weakPoints: string[];
  examFocus: string[];
  studySystem: string[];
  nextActions: string[];
  studyMethodPreference: string[];
  assessments: Assessment[];
  assessmentStructure: ModuleAssessmentDetail[];
  assessmentRules: ModuleAssessmentRules;
  topics: ModuleTopic[];
  subtopics: string[];
  sourceStatus: {
    summary: string;
    items: ModuleSourceItem[];
  };
  appRequirements: ModuleAppRequirements;
  mistakeBankCategories: string[];
  finalBossVaultItems: ModuleFinalBossItem[];
  nextBestActionRules: string[];
  needsVerification: boolean;
  verificationNotes: string[];
  hardRules: string[];
}

export function flattenModuleSubtopics(topics: ModuleTopic[]) {
  return [...new Set(topics.flatMap((topic) => [topic.title, ...topic.subtopics]).map((entry) => entry.trim()).filter(Boolean))];
}

export function toLegacyAssessments(assessmentStructure: ModuleAssessmentDetail[]): Assessment[] {
  return assessmentStructure.map((assessment) => ({
    title: assessment.title,
    date: assessment.date || 'TBC',
    time: assessment.time,
    weight: assessment.weight === null ? undefined : assessment.weight,
    status: assessment.status,
    notes: assessment.notes,
  }));
}
