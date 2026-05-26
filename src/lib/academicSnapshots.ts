import { modules, type ModuleInfo } from '../data/baccllb';
import { LOCAL_ACADEMIC_SNAPSHOTS_KEY, readLocalJson, writeLocalJson } from './localData';

export type AcademicSnapshotPriority = 'low' | 'medium' | 'high' | 'urgent';
export type AcademicSnapshotStatus = 'stable' | 'watch' | 'urgent';

export interface AcademicSnapshotMark {
  name: string;
  score?: number;
  outOf?: number;
  percentage?: number;
}

export interface AcademicSnapshotMissingAssessment {
  name: string;
  status: string;
  note?: string;
}

export interface AcademicSnapshotGlobalAction {
  title: string;
  moduleCode?: string;
  priority: AcademicSnapshotPriority;
  detail?: string;
}

export interface AcademicSnapshotModule {
  moduleCode: string;
  moduleName: string;
  facultyGroup?: string;
  currentKnownMarks: AcademicSnapshotMark[];
  missingAssessments: AcademicSnapshotMissingAssessment[];
  urgentActions: string[];
  status: AcademicSnapshotStatus;
  notes: string[];
}

export interface AcademicSnapshot {
  id: string;
  createdAt: string;
  sourceLabel: string;
  modules: AcademicSnapshotModule[];
  globalActions: AcademicSnapshotGlobalAction[];
  notes: string[];
}

export interface AcademicSnapshotSummary {
  modulesUpdated: number;
  urgentActionCount: number;
  mostUrgentModule: string | null;
  mostUrgentAction: string | null;
}

export const ACADEMIC_SNAPSHOT_EXAMPLE = {
  sourceLabel: 'SUNLearn academic status snapshot - May 2026',
  notes: [
    'Snapshot based on user-provided SUNLearn screenshots and notes.',
    'Do not treat screenshot-derived marks as final unless confirmed against official module frameworks.',
    'Economics 114 requires urgent follow-up because A2 was missed due to hospitalisation.'
  ],
  globalActions: [
    {
      title: 'Check Economics 114 course framework for missed A2 procedure',
      moduleCode: 'ECO114',
      priority: 'urgent',
      detail: 'User missed A2 because they were in hospital. Need to check whether A3 access/replacement requires an email, concession, or other action.'
    },
    {
      title: 'Confirm Economics 114 A3 date and start prep',
      moduleCode: 'ECO114',
      priority: 'urgent',
      detail: 'Confirm date and begin prep soon.'
    },
    {
      title: 'Redo Legal Skills A1 quiz',
      moduleCode: 'LSK114',
      priority: 'high',
      detail: 'User noted they will redo the A1 quiz tomorrow after Foundations of Law.'
    }
  ],
  modules: [
    {
      moduleCode: 'ECO114',
      moduleName: 'Economics 114',
      facultyGroup: 'EMS',
      status: 'urgent',
      currentKnownMarks: [],
      missingAssessments: [
        {
          name: 'A2',
          status: 'missed',
          note: 'Missed because user was in hospital.'
        }
      ],
      urgentActions: [
        'Check course framework for A2 missed-assessment procedure.',
        'Check whether email/concession is needed for A3 access.',
        'Confirm A3 date.',
        'Start A3 prep soon.'
      ],
      notes: [
        'User note from snapshot: missed A2 due to hospitalisation.'
      ]
    },
    {
      moduleCode: 'SDS188',
      moduleName: 'Statistics and Data Science 188',
      facultyGroup: 'EMS',
      status: 'watch',
      currentKnownMarks: [
        {
          name: 'AFA Chapter 3',
          score: 88,
          outOf: 100,
          percentage: 88
        },
        {
          name: 'AFA Chapter 5',
          score: 88,
          outOf: 100,
          percentage: 88
        },
        {
          name: 'A51 Assessment 2026',
          score: 74,
          outOf: 100,
          percentage: 74
        }
      ],
      missingAssessments: [
        {
          name: 'AFA Chapter 1',
          status: 'empty'
        },
        {
          name: 'AFA Chapter 2',
          status: 'empty'
        },
        {
          name: 'AFA Chapter 4',
          status: 'empty'
        },
        {
          name: 'AFA Chapter 6',
          status: 'empty'
        }
      ],
      urgentActions: [
        'Confirm which AFA chapters are still required.',
        'Check whether empty AFA items affect final mark.'
      ],
      notes: []
    },
    {
      moduleCode: 'FA178',
      moduleName: 'Financial Accounting 178',
      facultyGroup: 'EMS',
      status: 'watch',
      currentKnownMarks: [
        {
          name: 'A1S1',
          score: 23,
          outOf: 100,
          percentage: 23
        }
      ],
      missingAssessments: [
        {
          name: 'A2S1',
          status: 'empty'
        },
        {
          name: 'A1S3',
          status: 'empty'
        },
        {
          name: 'A2S3',
          status: 'empty'
        }
      ],
      urgentActions: [
        'Confirm current mark-to-date and upcoming assessment requirements.'
      ],
      notes: [
        'Snapshot also shows access item for A3 on 27 November 2025 and CA future project item.'
      ]
    },
    {
      moduleCode: 'DLA112',
      moduleName: 'Digital and Leadership Acumen 112',
      facultyGroup: 'EMS',
      status: 'stable',
      currentKnownMarks: [
        {
          name: 'A1 mark',
          score: 6,
          outOf: 4,
          percentage: 150
        },
        {
          name: 'AF total',
          score: 100,
          outOf: 100,
          percentage: 100
        }
      ],
      missingAssessments: [
        {
          name: 'MTD final',
          status: 'empty'
        },
        {
          name: 'FM A2',
          status: 'empty'
        }
      ],
      urgentActions: [
        'Confirm whether AF Report submission is complete and correctly counted.'
      ],
      notes: []
    },
    {
      moduleCode: 'DLA122',
      moduleName: 'Digital and Leadership Acumen 122',
      facultyGroup: 'EMS',
      status: 'watch',
      currentKnownMarks: [
        {
          name: 'AI Part A percentage before penalties',
          score: 88.37,
          outOf: 100,
          percentage: 88.37
        },
        {
          name: 'AI Part B percentage after penalties',
          score: 100,
          outOf: 100,
          percentage: 100
        },
        {
          name: 'AI Combined percentage before penalties',
          score: 92.31,
          outOf: 100,
          percentage: 92.31
        },
        {
          name: 'M2 / 55% of FM',
          score: 41.66,
          outOf: 100,
          percentage: 41.66
        },
        {
          name: 'AI Quiz Part 1',
          score: 38,
          outOf: 43,
          percentage: 88.37
        },
        {
          name: 'AI Part B quiz',
          score: 22,
          outOf: 22,
          percentage: 100
        },
        {
          name: 'Tutorial quiz score',
          score: 7.66,
          outOf: 10,
          percentage: 76.62
        },
        {
          name: 'Tutorial quiz score',
          score: 5,
          outOf: 10,
          percentage: 50
        },
        {
          name: 'Tutorial quiz score',
          score: 6,
          outOf: 10,
          percentage: 60
        },
        {
          name: 'Chapter 1 examples video',
          score: 100,
          outOf: 100,
          percentage: 100
        }
      ],
      missingAssessments: [
        {
          name: 'AF final',
          status: 'empty'
        },
        {
          name: 'A1',
          status: 'empty'
        }
      ],
      urgentActions: [
        'Confirm DLA122 mark-to-date and remaining required items.'
      ],
      notes: []
    },
    {
      moduleCode: 'FOL178',
      moduleName: 'Foundations of Law 178',
      facultyGroup: 'Law',
      status: 'watch',
      currentKnownMarks: [
        {
          name: 'AF1s Mark',
          score: 17.5,
          outOf: 35,
          percentage: 50
        },
        {
          name: 'Tutorial 2',
          score: 20.5,
          outOf: 25,
          percentage: 82
        }
      ],
      missingAssessments: [
        {
          name: 'AFS1',
          status: 'empty'
        },
        {
          name: 'AFS2',
          status: 'empty'
        },
        {
          name: 'Tutorial 1',
          status: '0',
          note: 'Did not attend the tutorial.'
        },
        {
          name: 'Tutorial 4',
          status: 'empty'
        }
      ],
      urgentActions: [
        'Prepare for Foundations of Law before redoing Legal Skills A1 quiz.'
      ],
      notes: [
        'Tutorial 2 feedback visible: participation, layout, tutorial assignment.'
      ]
    },
    {
      moduleCode: 'CON178',
      moduleName: 'Introduction to Constitutional Law and Statutory Interpretation',
      facultyGroup: 'Law',
      status: 'watch',
      currentKnownMarks: [
        {
          name: 'A1 Mark',
          score: 49,
          outOf: 100,
          percentage: 49
        },
        {
          name: 'AF Mark',
          score: 63,
          outOf: 100,
          percentage: 63
        }
      ],
      missingAssessments: [
        {
          name: 'Progress mark',
          status: 'empty'
        },
        {
          name: 'A2.1 mark',
          status: 'empty'
        },
        {
          name: 'AF mark second semester',
          status: 'empty'
        },
        {
          name: 'A1S2',
          status: 'empty'
        },
        {
          name: 'Tutorial 4 Submission',
          status: '0',
          note: 'No mark awarded because submission did not comply with required referencing and presentation standards.'
        }
      ],
      urgentActions: [
        'Improve legal referencing and presentation standards.',
        'Check tutorial submission requirements before the next Con Law submission.'
      ],
      notes: [
        'Feedback indicates good understanding but issues with references, footnotes, bibliography, and formatting.'
      ]
    },
    {
      moduleCode: 'LSK114',
      moduleName: 'Legal Skills 114',
      facultyGroup: 'Law',
      status: 'watch',
      currentKnownMarks: [
        {
          name: 'A1 quiz mark out of 20',
          score: 13,
          outOf: 20,
          percentage: 65
        },
        {
          name: 'Tutorial 1 email exercise',
          score: 100,
          outOf: 100,
          percentage: 100
        },
        {
          name: 'Tutorial 2 submission',
          score: 100,
          outOf: 100,
          percentage: 100
        },
        {
          name: 'Legal Skills semester assignment 1 of 2',
          score: 60,
          outOf: 100,
          percentage: 60
        }
      ],
      missingAssessments: [
        {
          name: 'ReadTheory',
          status: 'empty'
        },
        {
          name: 'Main written assignment',
          status: 'empty'
        },
        {
          name: 'Final assessment',
          status: 'empty'
        }
      ],
      urgentActions: [
        'Redo A1 quiz tomorrow after Foundations of Law.',
        'Continue monitoring ReadTheory and written assignment requirements.'
      ],
      notes: []
    }
  ]
} as const;

export function readAcademicSnapshots(): AcademicSnapshot[] {
  if (typeof window === 'undefined') return [];
  return readLocalJson<AcademicSnapshot[]>(LOCAL_ACADEMIC_SNAPSHOTS_KEY, []);
}

export function writeAcademicSnapshots(snapshots: AcademicSnapshot[]) {
  if (typeof window === 'undefined') return;
  writeLocalJson(LOCAL_ACADEMIC_SNAPSHOTS_KEY, snapshots);
}

export function getLatestAcademicSnapshot() {
  return readAcademicSnapshots()[0] ?? null;
}

export function importAcademicSnapshot(raw: unknown): AcademicSnapshot {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error('Snapshot JSON must be a single object.');
  }

  const value = raw as Record<string, unknown>;
  const sourceLabel = readRequiredString(value.sourceLabel, 'sourceLabel');
  const modules = readModuleArray(value.modules);
  const globalActions = readGlobalActionArray(value.globalActions);
  const notes = readStringArray(value.notes, 'notes');

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    sourceLabel,
    modules,
    globalActions,
    notes,
  };
}

export function saveImportedAcademicSnapshot(snapshot: AcademicSnapshot) {
  const next = [snapshot, ...readAcademicSnapshots()];
  writeAcademicSnapshots(next);
  return next;
}

export function deleteAcademicSnapshot(id: string) {
  const next = readAcademicSnapshots().filter((snapshot) => snapshot.id !== id);
  writeAcademicSnapshots(next);
  return next;
}

export function summarizeAcademicSnapshot(snapshot: AcademicSnapshot | null): AcademicSnapshotSummary | null {
  if (!snapshot) return null;

  const urgentGlobalActions = snapshot.globalActions.filter((action) => action.priority === 'urgent');
  const urgentModule = snapshot.modules.find((module) => module.status === 'urgent') ?? null;
  const urgentActionCount =
    urgentGlobalActions.length +
    snapshot.modules
      .filter((module) => module.status === 'urgent')
      .reduce((count, module) => count + module.urgentActions.length, 0);

  const firstUrgentGlobal = urgentGlobalActions[0] ?? null;
  const firstUrgentModuleAction = urgentModule?.urgentActions[0] ?? null;

  return {
    modulesUpdated: snapshot.modules.length,
    urgentActionCount,
    mostUrgentModule: firstUrgentGlobal?.moduleCode || urgentModule?.moduleCode || snapshot.modules[0]?.moduleCode || null,
    mostUrgentAction: firstUrgentGlobal?.title || firstUrgentModuleAction || snapshot.globalActions[0]?.title || null,
  };
}

export function findSnapshotModuleForAppModule(snapshot: AcademicSnapshot | null, module: ModuleInfo) {
  if (!snapshot) return null;

  const needles = new Set([
    normalizeCode(module.code),
    normalizeCode(module.shortName),
    normalizeCode(module.name),
    ...module.aliases.map(normalizeCode),
  ]);

  return (
    snapshot.modules.find((item) => {
      const haystacks = [
        normalizeCode(item.moduleCode),
        normalizeCode(item.moduleName),
        normalizeCode(item.moduleName.replace(/and/gi, '&')),
      ];
      return haystacks.some((haystack) => needles.has(haystack));
    }) ?? null
  );
}

function readModuleArray(value: unknown): AcademicSnapshotModule[] {
  if (!Array.isArray(value)) {
    throw new Error('Snapshot modules must be an array.');
  }

  return value.map((item, index) => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      throw new Error(`Module snapshot at position ${index + 1} is invalid.`);
    }

    const module = item as Record<string, unknown>;
    return {
      moduleCode: readRequiredString(module.moduleCode, `modules[${index}].moduleCode`),
      moduleName: readRequiredString(module.moduleName, `modules[${index}].moduleName`),
      facultyGroup: readOptionalString(module.facultyGroup),
      currentKnownMarks: readMarksArray(module.currentKnownMarks),
      missingAssessments: readMissingAssessmentsArray(module.missingAssessments),
      urgentActions: readStringArray(module.urgentActions, `modules[${index}].urgentActions`),
      status: readStatus(module.status),
      notes: readStringArray(module.notes, `modules[${index}].notes`),
    };
  });
}

function readGlobalActionArray(value: unknown): AcademicSnapshotGlobalAction[] {
  if (!Array.isArray(value)) {
    throw new Error('Snapshot globalActions must be an array.');
  }

  return value.map((item, index) => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      throw new Error(`Global action at position ${index + 1} is invalid.`);
    }

    const action = item as Record<string, unknown>;
    const priority = readPriority(action.priority);

    return {
      title: readRequiredString(action.title, `globalActions[${index}].title`),
      moduleCode: readOptionalString(action.moduleCode),
      priority,
      detail: readOptionalString(action.detail),
    };
  });
}

function readMarksArray(value: unknown): AcademicSnapshotMark[] {
  if (!Array.isArray(value)) return [];

  return value.map((item, index) => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      throw new Error(`currentKnownMarks[${index}] is invalid.`);
    }
    const mark = item as Record<string, unknown>;
    return {
      name: readRequiredString(mark.name, `currentKnownMarks[${index}].name`),
      score: readOptionalNumber(mark.score),
      outOf: readOptionalNumber(mark.outOf),
      percentage: readOptionalNumber(mark.percentage),
    };
  });
}

function readMissingAssessmentsArray(value: unknown): AcademicSnapshotMissingAssessment[] {
  if (!Array.isArray(value)) return [];

  return value.map((item, index) => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      throw new Error(`missingAssessments[${index}] is invalid.`);
    }
    const assessment = item as Record<string, unknown>;
    return {
      name: readRequiredString(assessment.name, `missingAssessments[${index}].name`),
      status: readRequiredString(assessment.status, `missingAssessments[${index}].status`),
      note: readOptionalString(assessment.note),
    };
  });
}

function readRequiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Snapshot field "${field}" must be a non-empty string.`);
  }
  return value.trim();
}

function readOptionalString(value: unknown) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function readStringArray(value: unknown, field: string) {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    if (typeof item !== 'string') {
      throw new Error(`Snapshot field "${field}[${index}]" must be a string.`);
    }
    return item.trim();
  }).filter(Boolean);
}

function readOptionalNumber(value: unknown) {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined;
  return value;
}

function readPriority(value: unknown): AcademicSnapshotPriority {
  if (value === 'low' || value === 'medium' || value === 'high' || value === 'urgent') {
    return value;
  }
  throw new Error('Global action priority must be one of: low, medium, high, urgent.');
}

function readStatus(value: unknown): AcademicSnapshotStatus {
  if (value === 'stable' || value === 'watch' || value === 'urgent') {
    return value;
  }
  throw new Error('Module snapshot status must be one of: stable, watch, urgent.');
}

function normalizeCode(value: string) {
  return value.replace(/[^a-z0-9]/gi, '').toUpperCase();
}

export function academicSnapshotExampleJson() {
  return JSON.stringify(ACADEMIC_SNAPSHOT_EXAMPLE, null, 2);
}
