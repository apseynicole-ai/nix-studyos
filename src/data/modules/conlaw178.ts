import { Gavel } from 'lucide-react';
import type { ModuleInfo, ModuleTopic } from './types';
import { flattenModuleSubtopics, toLegacyAssessments } from './types';

const topics: ModuleTopic[] = [
  {
    id: 'conlaw-theme-1',
    title: 'Constitutional Law Foundations',
    shortLabel: 'Theme 1',
    semester: 'S1',
    assessmentTags: ['A1', 'A2'],
    subtopics: [
      'Introduction to constitutional law',
      'Historical constitutional development',
      'Constitutional supremacy',
      'Rule of law',
      'Sources of constitutional authority',
    ],
    needsVerification: true,
  },
  {
    id: 'conlaw-theme-2',
    title: 'Interpretation, Authority, and Precedent',
    shortLabel: 'Theme 2',
    semester: 'S1',
    assessmentTags: ['A1', 'A2'],
    subtopics: [
      'Constitutional interpretation',
      'Precedent',
      'Authority hierarchy',
      'Case-based reasoning',
      'Statutory interpretation foundations',
    ],
    needsVerification: true,
  },
  {
    id: 'conlaw-theme-3',
    title: 'Application of the Bill of Rights',
    shortLabel: 'Theme 3',
    semester: 'S1',
    assessmentTags: ['A2'],
    subtopics: [
      'Vertical application',
      'Horizontal application',
      'State action',
      'Private relationships and constitutional effect',
    ],
    needsVerification: true,
  },
  {
    id: 'conlaw-theme-4',
    title: 'Section 36 and Limitations Analysis',
    shortLabel: 'Theme 4',
    semester: 'S1',
    assessmentTags: ['A2'],
    subtopics: [
      'Section 36 structure',
      'Limitation vs justification',
      'Proportionality analysis',
      'Balancing rights and purpose',
    ],
  },
];

const assessmentStructure = [
  { id: 'A1', title: 'A1', date: '2026-04-16', time: '15:00', weight: 15, format: 'Main assessment', status: 'done' as const },
  { id: 'A2', title: 'A2', date: '2026-06-08', time: '09:00', weight: null, format: 'Main assessment', status: 'upcoming' as const, notes: 'Weight and detailed format should still be checked against the latest official framework.', needsVerification: true },
  { id: 'A3', title: 'A3', weight: null, format: 'Further assessment path if applicable', status: 'unknown' as const, needsVerification: true },
];

export const conlaw178Module: ModuleInfo = {
  id: 'conlaw178',
  code: 'CON178',
  name: 'Introduction to Constitutional Law and Statutory Interpretation 178',
  shortName: 'Con Law 178',
  aliases: ['CON178', 'Con Law', 'Introduction to Constitutional Law 178'],
  area: 'Law',
  semester: 'S1',
  target: 80,
  currentMark: null,
  confidence: 60,
  colour: 'from-sky-300 to-blue-200',
  icon: Gavel,
  programmeContext: 'BAccLLB Year 1, Stellenbosch University',
  currentMarks: {
    overall: null,
    byAssessment: [
      { id: 'A1', label: 'A1', value: null },
      { id: 'A2', label: 'A2', value: null },
      { id: 'A3', label: 'A3', value: null },
    ],
    targetBand: '70–80%+ / distinction-level exam prep',
    note: 'Current Con Law mark is not locked from the provided module-info document and should remain user-entered.',
  },
  weakPoints: [
    'Theme integration',
    'Section 36 limitation structure',
    'Horizontal vs vertical application',
    'Precedent and constitutional interpretation',
  ],
  examFocus: [
    'Issue → constitutional provision → test → application → conclusion.',
    'Always separate limitation from justification.',
    'Use cases as authority, not decoration.',
    'Keep statutory interpretation and constitutional reasoning linked but distinct.',
  ],
  studySystem: [
    'Theme-based MegaNotes',
    'Case cards with ratio and exam use',
    'Model answers in 5/10/15 mark structures',
    'Timed skeleton answers for Section 36 and application questions',
  ],
  nextActions: [
    'Finalise Theme 4 tutorial polish.',
    'Keep Section 36 proportionality skeleton ready for quick recall.',
    'Do one timed 15-mark answer and one authority-focused case drill.',
  ],
  studyMethodPreference: [
    'Theme-based MegaNotes',
    'Case cards',
    'IRAC/issue-rule-authority-application-conclusion skeletons',
    'Timed short-answer and paragraph practice',
  ],
  assessments: toLegacyAssessments(assessmentStructure),
  assessmentStructure,
  assessmentRules: {
    formulaSummary: ['A1 date is known; A2 date is known.', 'Weighting and A3 details should still be treated as verification-sensitive unless source-locked elsewhere.'],
    passRequirements: ['Use official module announcements as the source of truth for any weighting or A3 rules not confirmed here.'],
    riskWarnings: [
      'Theme integration and Section 36 structure remain core risk areas.',
      'Current mark and exact A2/A3 weighting are not locked from the provided module-info document.',
    ],
    examFormats: [
      'Problem-style legal answers',
      'Structured paragraph answers',
      'Authority/application questions',
      'Section 36 limitation analysis',
      'Interpretation and precedent questions',
    ],
    a3Logic: ['Any A3 / further-assessment logic should stay verification-sensitive until a direct source is attached.'],
    a2A3LogicUncertain: true,
  },
  topics,
  subtopics: flattenModuleSubtopics(topics),
  sourceStatus: {
    summary: 'The app has usable Con Law topic signals, but exact framework/source-locking for the enriched structure is still partial.',
    items: [
      { label: 'Topic map', status: 'partial', note: 'Themes are inferred from existing project context and source filenames rather than a single locked module-info block.' },
      { label: 'Current mark', status: 'missing', note: 'Current mark should be user-entered.' },
      { label: 'A2 / A3 details', status: 'needs-verification', note: 'Use the latest official framework/announcements for exact weighting and further-assessment rules.' },
    ],
  },
  appRequirements: {
    dashboardCards: ['Current mark missing warning', 'A2 countdown', 'Theme-integration risk', 'Authority-use risk'],
    topicTracker: ['theme', 'subtopic', 'authority confidence', 'application confidence', 'Section 36 readiness'],
    marksEngine: ['Use known dates only unless a direct source adds more detail.'],
    mistakeBank: ['Authority, application, Section 36, horizontal/vertical, and precedent confusion categories'],
    lexAi: ['Inject theme map, authority hierarchy, and no-invented-cases rule.'],
    finalBoss: ['Section 36 skeleton', 'authority hierarchy sheet', 'case card bundle'],
  },
  mistakeBankCategories: [
    'Authority misuse',
    'Application too general',
    'Section 36 structure error',
    'Horizontal vs vertical confusion',
    'Precedent confusion',
    'Interpretation issue',
  ],
  finalBossVaultItems: [
    { id: 'conlaw-s36', title: 'Section 36 Skeleton', description: 'Use for quick proportionality and limitation recall.' },
    { id: 'conlaw-authority', title: 'Authority Hierarchy Sheet', description: 'Use to keep authority stronger than commentary in written answers.' },
    { id: 'conlaw-case-cards', title: 'Con Law Case Cards', description: 'Use for ratio, rule, and exam-use compression.' },
  ],
  nextBestActionRules: [
    'Prioritise Theme 4 / Section 36 when confidence is low.',
    'Escalate any topic with weak authority use into case-card and skeleton-answer practice.',
    'Keep horizontal/vertical application confusion high in the queue until consistently clean.',
  ],
  needsVerification: true,
  verificationNotes: [
    'Exact enriched topic structure for Con Law is still partial and should be checked against the latest official framework and lecture material.',
    'Current mark and exact A2/A3 weighting are not confirmed in the attached module-info document.',
  ],
  hardRules: [
    'Keep Constitutional Law 178 separate from Foundations of Law 178.',
    'Do not invent current marks.',
    'Do not invent exact A3 rules.',
  ],
};

