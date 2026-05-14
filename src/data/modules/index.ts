import { Users, BookOpen, Percent } from 'lucide-react';
import { conlaw178Module } from './conlaw178';
import { dla112Module } from './dla112';
import { dla122Module } from './dla122';
import { econ114Module } from './econ114';
import { fa178Module } from './fa178';
import { foundations178Module } from './foundations178';
import { legalSkills114Module } from './legalSkills114';
import { sta188Module } from './sta188';
import type { ModuleInfo } from './types';
import { flattenModuleSubtopics, toLegacyAssessments } from './types';

const lawPersons144Shell: ModuleInfo = {
  id: 'lawpersons144',
  code: 'LPR144',
  name: 'Law of Persons 144',
  shortName: 'Law of Persons',
  aliases: ['LPR144', 'Law of Persons 144'],
  area: 'Law',
  semester: 'S2',
  target: 80,
  currentMark: null,
  confidence: 30,
  colour: 'from-orange-200 to-amber-200',
  icon: Users,
  programmeContext: 'BAccLLB Year 1, Stellenbosch University',
  currentMarks: {
    overall: null,
    byAssessment: [],
    targetBand: '70–80%+ / distinction-level exam prep',
    note: 'Module starts in Semester 2. More data should be added after A2 season.',
  },
  weakPoints: ['Second-semester content not yet mapped', 'Need early case/concept tracker'],
  examFocus: ['Start with status, capacity, personality rights, and remedies once the module opens.', 'Build case cards from week 1.'],
  studySystem: ['Pre-build tracker shell', 'Add lectures weekly', 'Early definitions bank'],
  nextActions: ['Create S2 module shell', 'Add first lecture topics once available'],
  studyMethodPreference: ['Lecture-by-lecture topic tracking', 'Case cards', 'Definitions bank'],
  assessments: [{ title: 'S2 shell', date: '2026-07-01', status: 'draft' }],
  assessmentStructure: [{ id: 'S2-shell', title: 'S2 shell', date: '2026-07-01', status: 'draft' }],
  assessmentRules: {
    formulaSummary: ['No source-locked assessment structure yet.'],
    passRequirements: ['Wait for the official Semester 2 framework before locking structure.'],
    riskWarnings: ['Semester 2 shell only.'],
    examFormats: ['To be confirmed once the module opens.'],
  },
  topics: [{ id: 'lawpersons-shell', title: 'Semester 2 shell', shortLabel: 'Shell', semester: 'S2', subtopics: ['Add first lecture topics once available'], needsVerification: true }],
  subtopics: ['Add first lecture topics once available'],
  sourceStatus: {
    summary: 'Shell only.',
    items: [{ label: 'Framework', status: 'missing', note: 'Module opens in Semester 2.' }],
  },
  appRequirements: {
    dashboardCards: ['Shell only'],
    topicTracker: ['Add lecture topics once available'],
    marksEngine: ['Wait for official Semester 2 framework'],
  },
  mistakeBankCategories: ['Case principle', 'Definition', 'Remedy confusion'],
  finalBossVaultItems: [{ id: 'lawpersons-shell', title: 'Semester 2 shell', description: 'Placeholder until the module opens.' }],
  nextBestActionRules: ['Keep as a shell until Semester 2 opens.'],
  needsVerification: true,
  verificationNotes: ['Module opens next semester.'],
  hardRules: ['Keep this separate from first-semester law modules.'],
};

const law101Shell: ModuleInfo = {
  id: 'law101',
  code: 'LAW101',
  name: 'Law 101',
  shortName: 'Law 101',
  aliases: ['LAW101', 'General law shell'],
  area: 'Law',
  semester: 'Year',
  target: 75,
  currentMark: null,
  confidence: 35,
  colour: 'from-orange-600 to-red-400',
  icon: BookOpen,
  programmeContext: 'BAccLLB Year 1, Stellenbosch University',
  currentMarks: {
    overall: null,
    byAssessment: [],
    targetBand: 'Foundational law shell',
    note: 'Retained as a low-detail shell only.',
  },
  weakPoints: ['General law foundation tracker still needed'],
  examFocus: ['Keep definitions, legal systems, and sources of law separated cleanly.'],
  studySystem: ['Foundational glossary', 'Mini case cards', 'Weekly recap'],
  nextActions: ['Add LAW101 framework once confirmed'],
  studyMethodPreference: ['Glossary-first', 'Mini case cards'],
  assessments: [{ title: 'Framework pending', date: '2026-07-01', status: 'unknown' }],
  assessmentStructure: [{ id: 'framework-pending', title: 'Framework pending', date: '2026-07-01', status: 'unknown', needsVerification: true }],
  assessmentRules: {
    formulaSummary: ['Framework pending.'],
    passRequirements: ['Wait for a confirmed LAW101 framework before using this beyond a shell.'],
    riskWarnings: ['Shell only.'],
    examFormats: ['Unknown'],
  },
  topics: [{ id: 'law101-shell', title: 'Foundational glossary shell', shortLabel: 'Shell', semester: 'Year', subtopics: ['Definitions', 'Legal systems', 'Sources of law'], needsVerification: true }],
  subtopics: ['Definitions', 'Legal systems', 'Sources of law'],
  sourceStatus: {
    summary: 'Shell only.',
    items: [{ label: 'Framework', status: 'missing', note: 'Framework still pending.' }],
  },
  appRequirements: {
    dashboardCards: ['Shell only'],
    topicTracker: ['Definitions', 'Legal systems', 'Sources of law'],
    marksEngine: ['Do not use until framework exists'],
  },
  mistakeBankCategories: ['Definition confusion', 'Source-of-law confusion'],
  finalBossVaultItems: [{ id: 'law101-shell', title: 'LAW101 shell', description: 'Retained as a low-detail placeholder.' }],
  nextBestActionRules: ['Add framework once confirmed.'],
  needsVerification: true,
  verificationNotes: ['Not relevant for the current phase; kept only as a shell.'],
  hardRules: ['Do not let this shell override real first-semester modules.'],
};

const toi142ShellTopics = [{ id: 'toi-shell', title: 'Theory of Interest shell', shortLabel: 'Shell', semester: 'S2' as const, subtopics: ['Formula tracker shell'], needsVerification: true }];
const toi142Shell: ModuleInfo = {
  id: 'toi142',
  code: 'TOI142',
  name: 'Theory of Interest 142',
  shortName: 'Theory of Interest',
  aliases: ['TOI142', 'Theory of Interest 142'],
  area: 'Quantitative',
  semester: 'S2',
  target: 75,
  currentMark: null,
  confidence: 28,
  colour: 'from-rose-200 to-pink-100',
  icon: Percent,
  programmeContext: 'BAccLLB Year 1, Stellenbosch University',
  currentMarks: {
    overall: null,
    byAssessment: [],
    targetBand: 'Semester 2 shell',
    note: 'Semester 2 module shell only.',
  },
  weakPoints: ['Second-semester quantitative content pending'],
  examFocus: ['Formula choice, financial-calculator logic, and interpretation'],
  studySystem: ['Formula bank', 'Trigger phrase table', 'Timed calculation drills'],
  nextActions: ['Create formula tracker shell'],
  studyMethodPreference: ['Formula bank', 'Timed drills'],
  assessments: [{ title: 'S2 shell', date: '2026-07-01', status: 'draft' }],
  assessmentStructure: [{ id: 'S2-shell', title: 'S2 shell', date: '2026-07-01', status: 'draft' }],
  assessmentRules: {
    formulaSummary: ['Shell only.'],
    passRequirements: ['Wait for Semester 2 framework.'],
    riskWarnings: ['Shell only.'],
    examFormats: ['Unknown'],
  },
  topics: toi142ShellTopics,
  subtopics: flattenModuleSubtopics(toi142ShellTopics),
  sourceStatus: {
    summary: 'Shell only.',
    items: [{ label: 'Framework', status: 'missing', note: 'Module starts in Semester 2.' }],
  },
  appRequirements: {
    dashboardCards: ['Shell only'],
    topicTracker: ['Formula tracker shell'],
    marksEngine: ['Wait for Semester 2 framework'],
  },
  mistakeBankCategories: ['Formula choice', 'Calculator logic', 'Interpretation wording'],
  finalBossVaultItems: [{ id: 'toi-shell', title: 'TOI142 shell', description: 'Retained as a Semester 2 placeholder.' }],
  nextBestActionRules: ['Keep as a shell until Semester 2 opens.'],
  needsVerification: true,
  verificationNotes: ['Semester 2 shell only.'],
  hardRules: ['Keep TOI142 separate from STA188.'],
};

export const modules: ModuleInfo[] = [
  fa178Module,
  econ114Module,
  foundations178Module,
  conlaw178Module,
  legalSkills114Module,
  sta188Module,
  dla112Module,
  dla122Module,
  lawPersons144Shell,
  law101Shell,
  toi142Shell,
];

export type { ModuleInfo } from './types';
