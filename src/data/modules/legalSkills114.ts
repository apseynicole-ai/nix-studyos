import { Scale } from 'lucide-react';
import type { ModuleInfo, ModuleTopic } from './types';
import { flattenModuleSubtopics, toLegacyAssessments } from './types';

const topics: ModuleTopic[] = [
  {
    id: 'ls-writing',
    title: 'Legal Writing and Submission Technique',
    shortLabel: 'Writing',
    semester: 'S1',
    assessmentTags: ['A2'],
    subtopics: [
      'Faculty writing guide precision',
      'Footnotes and bibliography accuracy',
      'Legal opinion structure',
      'Formal legal tone',
      'Authority hierarchy',
    ],
    needsVerification: true,
  },
  {
    id: 'ls-readtheory',
    title: 'ReadTheory Evidence and Progress',
    shortLabel: 'ReadTheory',
    semester: 'S1',
    assessmentTags: ['AF'],
    subtopics: [
      'Profile activation evidence',
      'Placement test completion',
      'First quiz evidence',
      'Passing quiz evidence',
      'Lexile level',
      'Screenshot quality',
    ],
  },
];

const assessmentStructure = [
  { id: 'A2', title: 'A2 / Legal Writing Task', date: '2026-04-20', weight: null, format: 'Legal writing task', status: 'done' as const },
  { id: 'RT', title: 'ReadTheory Evidence', date: '2026-05-15', weight: null, format: 'ReadTheory progress evidence', status: 'upcoming' as const, notes: 'Track placement, first quiz, passing quiz screenshots, Lexile, and score evidence.' },
];

export const legalSkills114Module: ModuleInfo = {
  id: 'legalskills114',
  code: 'LSK114',
  name: 'Legal Skills 114',
  shortName: 'Legal Skills',
  aliases: ['LSK114', 'Legal Skills 114', 'LS 114'],
  area: 'Law',
  semester: 'S1',
  target: 80,
  currentMark: null,
  confidence: 66,
  colour: 'from-emerald-900 to-green-700',
  icon: Scale,
  programmeContext: 'BAccLLB Year 1, Stellenbosch University',
  currentMarks: {
    overall: null,
    byAssessment: [
      { id: 'A2', label: 'A2', value: null },
      { id: 'RT', label: 'ReadTheory evidence', value: null },
    ],
    targetBand: '70–80%+ / distinction-level exam prep',
    note: 'The attached module-info document says no deeper update is needed because the module is effectively finished, so the enrichment stays cautious.',
  },
  weakPoints: [
    'Faculty writing guide precision',
    'Footnotes and bibliography accuracy',
    'Legal opinion structure',
    'ReadTheory completion evidence',
  ],
  examFocus: [
    'Use PEEL / ISAR style depending on question type.',
    'Footnotes must be accurate and not dumped only at paragraph ends.',
    'Preserve formal legal tone and authority hierarchy.',
    'Track ReadTheory evidence cleanly.',
  ],
  studySystem: [
    'All-star answer templates',
    'Citation audit checklist',
    'Pre-submission integrity checker',
    'ReadTheory evidence tracker',
  ],
  nextActions: [
    'Run a footnote audit on the latest tutorial or writing task.',
    'Keep ReadTheory evidence complete until the module is fully closed out.',
    'Use the legal-opinion prompt pack when revisiting writing quality.',
  ],
  studyMethodPreference: [
    'Answer templates',
    'Citation audits',
    'Submission-integrity checklists',
    'Evidence tracking',
  ],
  assessments: toLegacyAssessments(assessmentStructure),
  assessmentStructure,
  assessmentRules: {
    formulaSummary: ['Continuous-assessment style module context is already handled in the marks engine.', 'This enrichment keeps Legal Skills cautious because the attached source said a deeper update is not needed now.'],
    passRequirements: ['Preserve writing-guide precision and evidence completeness; do not invent new assessment structure beyond what is already in the app and engine.'],
    riskWarnings: ['ReadTheory evidence still needs careful screenshot and proof tracking.', 'Current mark is not locked from the attached module-info document.'],
    examFormats: ['Legal writing task', 'Opinion-style answers', 'ReadTheory evidence and completion tracking'],
  },
  topics,
  subtopics: flattenModuleSubtopics(topics),
  sourceStatus: {
    summary: 'The module is largely complete, so the app keeps Legal Skills steady rather than inventing new structure.',
    items: [
      { label: 'Writing-guide workflow', status: 'available', note: 'Existing app context already supports legal-writing audits and prompt packs.' },
      { label: 'ReadTheory evidence', status: 'partial', note: 'Evidence flow exists but still depends on user screenshots and progress proofs.' },
      { label: 'Current mark', status: 'missing', note: 'Current mark is not locked from the attached module-info document.' },
    ],
  },
  appRequirements: {
    dashboardCards: ['ReadTheory evidence reminder', 'Current mark missing warning', 'Writing-guide risk'],
    topicTracker: ['writing workflow', 'authority confidence', 'footnote audit status', 'ReadTheory evidence status'],
    marksEngine: ['Leave Legal Skills logic to the audited marks engine and existing page.'],
    mistakeBank: ['Footnote, bibliography, authority-use, and writing-structure categories'],
    lexAi: ['Inject writing-guide, authority, and opinion-structure context.'],
    finalBoss: ['Citation audit', 'legal-opinion structure sheet', 'ReadTheory evidence checklist'],
  },
  mistakeBankCategories: [
    'Footnote error',
    'Bibliography mismatch',
    'Authority hierarchy weakness',
    'Opinion structure weakness',
    'ReadTheory evidence gap',
  ],
  finalBossVaultItems: [
    { id: 'ls-citation-audit', title: 'Citation Audit Checklist', description: 'Use before submitting any law-writing task.' },
    { id: 'ls-opinion-structure', title: 'Legal Opinion Structure Sheet', description: 'Use to keep issues, law, application, and conclusion organised.' },
  ],
  nextBestActionRules: [
    'If ReadTheory evidence is incomplete, surface it as a low-friction admin priority.',
    'If authority use or footnotes are weak, route the task into audit-checklist mode rather than broad rewriting.',
  ],
  needsVerification: true,
  verificationNotes: [
    'The attached module-info document says no deeper update is needed because the module is finished.',
    'Current mark is not confirmed from the attached source block.',
  ],
  hardRules: [
    'Do not invent current marks.',
    'Keep Legal Skills stable; do not force a redesign for a module already near completion.',
  ],
};
