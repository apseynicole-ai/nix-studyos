import { ShieldCheck, FileText, TimerReset, AlertTriangle, Target, Mic2, Sparkles, ClipboardCheck } from 'lucide-react';
import { modules } from './modules';
import type { ModuleArea } from './modules/types';
export type { ModuleArea, Semester, AssessmentStatus, Assessment, ModuleInfo, ModuleAssessmentDetail, ModuleTopic, ModuleFinalBossItem } from './modules/types';
export { modules };

export interface PromptPack {
  id: string;
  title: string;
  moduleId?: string;
  category: 'MegaNote' | 'Exam' | 'Assignment' | 'Feedback' | 'Planning' | 'AI Studio' | 'ReadTheory';
  description: string;
  prompt: string;
}

export interface TaskTemplate {
  id: string;
  title: string;
  moduleId: string;
  type: 'Study' | 'Practice' | 'Admin' | 'Submission' | 'Revision' | 'Health';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  points: number;
  minutes: number;
  why: string;
}

export interface ExamTemplate {
  id: string;
  title: string;
  area: ModuleArea | 'Universal';
  purpose: string;
  steps: string[];
}

export const USER_ACADEMIC_PROFILE = {
  preferredName: 'Nix',
  programme: 'BAccLLB',
  institution: 'Stellenbosch University',
  year: 'Year 1',
  academicGoal: '70%+ semester average, with distinction-level A2 preparation where possible',
  executionStyle: 'ClickUp-style tasks + Excel-style dashboards + MegaNotes + exam simulation',
  strongestSystems: [
    'MegaNotes that preserve detail but reorganise it for exam use',
    'Short skeleton notes before full theory',
    'Timed micro-practice and pressure simulation',
    'Teach-aloud revision and voice-based explanations',
    'Mistake logs with retest dates',
  ],
  preferredColours: [
    'Dark purple',
    'Pastel purple',
    'Dark blue',
    'Light blue',
    'Dark green',
    'Pastel green',
    'Pastel yellow',
    'Light orange',
    'Darker orange',
    'Red',
    'Pink',
  ],
};

export const promptPacks: PromptPack[] = [
  {
    id: 'finacc-meganote',
    title: 'FinAcc Official-Source MegaNote Builder',
    moduleId: 'finacc178',
    category: 'MegaNote',
    description: 'Turns official packs into a simple-first, formal-second, exam-focused accounting master note.',
    prompt: `Build a full exam-focused MegaNote for Financial Accounting 178/188 on [TOPIC], using only the uploaded official sources. Prioritise the theory pack, slides, question pack, answer pack, class examples and past-test feedback. Explain the topic simply first, then formally. Preserve all exam-relevant content. Include theory, journal logic, formulas, disclosure/presentation rules, worked examples, full memo-style answers, examiner traps, trigger phrases, common mistakes, a 5-minute checklist, a Spot the Trick sheet and a Final Boss 1-page memory sheet. Where sources conflict, flag the conflict and follow the official memo/module convention. Colour scheme: black, blue, green, yellow.`,
  },
  {
    id: 'law-opinion-checker',
    title: 'Top-Lawyer Legal Opinion Checker',
    moduleId: 'legalskills114',
    category: 'Feedback',
    description: 'Strict legal-submission feedback for writing guide, structure, authority, footnotes and argument strength.',
    prompt: `Act as a top South African law lecturer and practitioner. Review the attached/pasted legal answer strictly against the question, rubric, Faculty of Law Writing Guide, legal opinion structure, authority use, footnotes, bibliography, paragraph logic, precision, tone and submission risk. Identify every error, weak authority, unsupported claim, citation issue, missing distinction, formatting issue and improvement. Then provide a prioritised fix list: must-fix before submission, high-value improvements, polish only. Do not invent sources.`,
  },
  {
    id: 'a2-exam-generator',
    title: 'A2 Mock Exam + Memo Generator',
    category: 'Exam',
    description: 'Creates a realistic test and full memo from module frameworks, feedback and past question style.',
    prompt: `Using only the uploaded course materials, frameworks, past feedback and notes, create the most realistic A2 mock exam possible for [MODULE]. Assume all work covered so far can be tested. Include clear instructions, mark allocation, mixed difficulty, examiner-style wording, traps, and a full memo with mark breakdown, model answers and common wrong-answer notes.`,
  },
  {
    id: 'notebooklm-studio',
    title: 'NotebookLM Studio Pack Prompt',
    category: 'AI Studio',
    description: 'Creates video, audio and slide-deck prompts from dense notes.',
    prompt: `Turn the provided study material into three NotebookLM Studio outputs: (1) a video overview prompt, (2) an audio overview prompt and (3) a slide deck prompt. Make each output exam-focused, conversational, structured by headings, and designed for active recall. Include likely questions, memory hooks, examples, and a final 5-minute recap. Keep all important detail; do not oversummarise.`,
  },
  {
    id: 'readtheory-tracker',
    title: 'ReadTheory Evidence Tracker',
    moduleId: 'legalskills114',
    category: 'ReadTheory',
    description: 'Tracks placement, first quiz, passing quiz, Lexile and screenshot evidence.',
    prompt: `Help me audit my ReadTheory evidence for Legal Skills 114. Check whether I have proof of profile activation, placement test completion, first quiz, passing quiz, Lexile level, score percentage, attempt count and screenshot quality. Tell me what is complete, what is missing, what mark band this likely fits, and what I must still do.`,
  },
  {
    id: 'study-timetable',
    title: 'Distinction Study Timetable Builder',
    category: 'Planning',
    description: 'Builds a detailed A2 timetable from marks, weak areas and available hours.',
    prompt: `Build my final detailed A2 study timetable for my BAccLLB modules. Use my current marks, weak points, assessment dates, realistic study hours, ADHD-friendly task design, short early-day tasks and longer late-afternoon productive blocks. Include daily tasks, module priorities, exact topics, active recall, exam practice, breaks, nightly checklists, risk warnings and weekly resets.`,
  },
];

export const taskTemplates: TaskTemplate[] = [
  { id: 'fa-adjustments', title: 'FinAcc: timed adjustment question + memo marking', moduleId: 'finacc178', type: 'Practice', priority: 'Critical', points: 15, minutes: 60, why: 'Application under exam conditions is the current bottleneck.' },
  { id: 'fa-inventory', title: 'FinAcc: Chapter 11 inventory periodic/perpetual drill', moduleId: 'finacc178', type: 'Study', priority: 'High', points: 12, minutes: 75, why: 'Current requested next topic; needs full topic system.' },
  { id: 'econ-unit8', title: 'Econ: Unit 8 supply/demand graph drill', moduleId: 'econ114', type: 'Practice', priority: 'High', points: 10, minutes: 45, why: 'Graph movement and competitive equilibrium are high-yield.' },
  { id: 'foundations-roman', title: 'Foundations: Roman legal history timeline recall', moduleId: 'foundations178', type: 'Revision', priority: 'High', points: 10, minutes: 40, why: 'Known uncertainty area.' },
  { id: 'conlaw-s36', title: 'Con Law: section 36 proportionality skeleton answer', moduleId: 'conlaw178', type: 'Practice', priority: 'High', points: 12, minutes: 50, why: 'Core constitutional method and recurring exam structure.' },
  { id: 'legal-footnotes', title: 'Legal Skills: footnote + bibliography audit', moduleId: 'legalskills114', type: 'Submission', priority: 'Critical', points: 14, minutes: 45, why: 'Past marks were lost for footnote issues.' },
  { id: 'stats-formula', title: 'Stats: Chapters 3–6 formula trigger table', moduleId: 'sds188', type: 'Study', priority: 'High', points: 11, minutes: 50, why: 'Formula choice under pressure needs structure.' },
  { id: 'dla-final', title: 'DLA: final workbook formula + instruction audit', moduleId: 'dla122', type: 'Submission', priority: 'Critical', points: 16, minutes: 60, why: 'Project instructions and spreadsheet final checking are high risk.' },
  { id: 'nightly-reset', title: 'Nightly reset: log time, mistakes and tomorrow’s first task', moduleId: 'personal', type: 'Health', priority: 'Medium', points: 6, minutes: 15, why: 'Keeps the system alive without relying on memory.' },
];

export const examTemplates: ExamTemplate[] = [
  {
    id: 'law-peel',
    title: 'Law 5/10/15 Mark Answer Skeleton',
    area: 'Law',
    purpose: 'Use when a question asks you to explain, discuss, evaluate or apply a legal principle.',
    steps: [
      '1. Issue: identify the exact legal question in one sentence.',
      '2. Rule: define the principle, constitutional section, statute or common-law rule.',
      '3. Authority: add the strongest case/source that proves the rule.',
      '4. Application: apply the rule to the facts, not just the topic generally.',
      '5. Counterpoint/limitation: mention the strongest opposing consideration if marks allow.',
      '6. Conclusion: answer the question directly using the wording of the question.',
    ],
  },
  {
    id: 'legal-opinion',
    title: 'Legal Opinion Structure',
    area: 'Law',
    purpose: 'Use for Legal Skills opinion-style questions and formal advice.',
    steps: [
      '1. Heading and facts assumed.',
      '2. Legal issues for determination.',
      '3. Short answer / executive conclusion.',
      '4. Applicable law in authority order.',
      '5. Application to facts with risk levels.',
      '6. Conclusion and practical recommendations.',
      '7. Footnotes and bibliography audit.',
    ],
  },
  {
    id: 'accounting-adjustment',
    title: 'Accounting Adjustment Workflow',
    area: 'Accounting',
    purpose: 'Use for IAS/IFRS scenario adjustments where calculations are not the main problem.',
    steps: [
      '1. Identify the standard/topic from trigger words.',
      '2. State the recognition/classification rule.',
      '3. Extract only relevant numbers and dates.',
      '4. Calculate with clear workings.',
      '5. Show journal logic: debit, credit and reason.',
      '6. Present in the correct statement/note/disclosure.',
      '7. Final scan: sign, date, units, rounding and wording.',
    ],
  },
  {
    id: 'stats-panic-proof',
    title: 'Stats “Don’t Panic” Workflow',
    area: 'Quantitative',
    purpose: 'Use when a statistics question looks unfamiliar.',
    steps: [
      '1. Circle what the question asks for.',
      '2. Identify variable type and sample/population clue.',
      '3. Write givens in symbol form.',
      '4. Choose formula/test from trigger phrase.',
      '5. Calculate carefully.',
      '6. Interpret the result in ordinary words.',
      '7. Check whether answer needs units, percentage or conclusion sentence.',
    ],
  },
  {
    id: 'universal-final-boss',
    title: 'Final Boss 20-Minute Review Loop',
    area: 'Universal',
    purpose: 'Use the night before or morning of a test.',
    steps: [
      '1. 5 min: scan weakest-topic list.',
      '2. 5 min: read one-page memory sheet aloud.',
      '3. 5 min: redo last mistake without looking.',
      '4. 3 min: check formula/case/authority list.',
      '5. 2 min: write the first step you will do when the paper opens.',
    ],
  },
];

export const weeklyRhythm = [
  { day: 'Monday', focus: 'Reset + easiest first task', detail: 'Use a short early task, then one deep block from 16:00–18:00.' },
  { day: 'Tuesday', focus: 'Practice-heavy day', detail: 'One timed question or graph/calculation drill. Mark immediately.' },
  { day: 'Wednesday', focus: 'Law writing / case day', detail: 'Write one structured answer or case card. Read aloud once.' },
  { day: 'Thursday', focus: 'Accounting / quant day', detail: 'Scenario application, formula choice and memo-style presentation.' },
  { day: 'Friday', focus: 'Catch-up + admin audit', detail: 'Check deadlines, submissions, screenshots and file naming.' },
  { day: 'Saturday', focus: 'Major deep-work block', detail: 'Longer A2 block: MegaNote + practice + correction.' },
  { day: 'Sunday', focus: 'Weekly Uni Reset', detail: 'Plan week, update marks, update mistake log, set first task for Monday.' },
];

export const nightlyChecklist = [
  'Log study minutes per module',
  'Capture one mistake or one thing learned',
  'Set tomorrow’s first 15-minute task',
  'Check next deadline and evidence needed',
  'Reset workspace/downloads/file names',
  'Stop studying with a written “next step” so restarting is easier',
];

export const quickStats = {
  semesterOneAssessments: modules.flatMap((m) => m.assessments.filter((a) => a.status === 'upcoming')).length,
  highRiskModules: modules.filter((m) => m.confidence < 50).length,
  distinctionModules: modules.filter((m) => m.target >= 80).length,
};

export const moduleOptions = modules.map((m) => ({ value: m.id, label: `${m.shortName} (${m.code})` }));

export const iconBank = {
  ShieldCheck,
  FileText,
  TimerReset,
  AlertTriangle,
  Target,
  Mic2,
  Sparkles,
  ClipboardCheck,
};
