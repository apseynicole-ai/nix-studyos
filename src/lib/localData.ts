export const BACKUP_KEYS = [
  'baccllb-mark-rows',
  'baccllb-mark-engine-state',
  'baccllb-module-targets',
  'baccllb-module-confidence',
  'baccllb-academic-snapshots',
  'baccllb-tasks',
  'baccllb-timer-sessions',
  'baccllb-studyai-summaries',
  'baccllb-profile',
  'baccllb-checklist',
  'baccllb-planner',
  'baccllb-settings',
  'baccllb-dashboard',
  'baccllb-topic-mastery',
  'baccllb-mistake-bank',
  'baccllb-class-log',
];

export const LOCAL_CLASS_LOG_KEY = 'baccllb-class-log';
export const LOCAL_PROFILE_KEY = 'baccllb-profile';
export const LOCAL_TASKS_KEY = 'baccllb-tasks';
export const LOCAL_TIMER_SESSIONS_KEY = 'baccllb-timer-sessions';
export const LOCAL_SUMMARIES_KEY = 'baccllb-studyai-summaries';
export const LOCAL_TOPIC_MASTERY_KEY = 'baccllb-topic-mastery';
export const LOCAL_MODULE_CONFIDENCE_KEY = 'baccllb-module-confidence';
export const LOCAL_ACADEMIC_SNAPSHOTS_KEY = 'baccllb-academic-snapshots';
export const LOCAL_BACKUP_META_KEY = 'baccllb-last-backup-meta';
export const LOCAL_DASHBOARD_VIEW_MODE_KEY = 'baccllb-dashboard-view-mode';
export const BACKUP_SCHEMA_VERSION = 1;
export const BACKUP_APP_NAME = 'Nix StudyOS';

const ADDITIONAL_RECOGNISED_BACKUP_KEYS = [
  LOCAL_BACKUP_META_KEY,
  'baccllb-manual-assessments',
  'baccllb-active-timer',
];

export const RECOGNISED_BACKUP_KEYS = [...BACKUP_KEYS, ...ADDITIONAL_RECOGNISED_BACKUP_KEYS].sort();

const HIGH_RISK_BACKUP_KEYS = new Set([
  'baccllb-mark-rows',
  'baccllb-mark-engine-state',
  'baccllb-tasks',
  'baccllb-manual-assessments',
  'baccllb-mistake-bank',
  'baccllb-studyai-summaries',
  'baccllb-academic-snapshots',
]);

interface BackupMeta {
  action: 'export' | 'import';
  exportedAt: string;
  fileName: string;
  includedKeys: string[];
  importedAt?: string;
  warning?: string;
}

export interface StudyOSBackupFile {
  appName: string;
  exportedAt: string;
  backupVersion: number;
  includedKeys: string[];
  data: Record<string, unknown>;
  placeholders?: {
    topicMastery?: unknown[];
    mistakeBank?: unknown[];
  };
}

export interface BackupImportPreview {
  valid: boolean;
  appName?: string;
  version?: string;
  exportedAt?: string;
  importedAt?: string;
  includedKeys: string[];
  recognisedKeys: string[];
  unknownKeys: string[];
  missingKnownKeys: string[];
  overwriteKeys: string[];
  highRiskKeys: string[];
  warnings: string[];
  error?: string;
  backup?: StudyOSBackupFile;
}

function isStudyOSStorageKey(key: string) {
  return key.startsWith('baccllb-') || key.startsWith('nix-');
}

function isRecognisedBackupKey(key: string) {
  return RECOGNISED_BACKUP_KEYS.includes(key);
}

function appKeys(): string[] {
  // Dynamic key discovery keeps active StudyOS-prefixed data backward-compatible
  // without needing to preserve dead legacy keys in BACKUP_KEYS forever.
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && isStudyOSStorageKey(k)) keys.push(k);
  }
  return keys;
}

export function collectBackup(): Record<string, unknown> {
  const backup: Record<string, unknown> = {};
  const seen = new Set<string>();
  for (const key of [...BACKUP_KEYS, ...appKeys()]) {
    if (seen.has(key)) continue;
    seen.add(key);
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      try { backup[key] = JSON.parse(raw); } catch { backup[key] = raw; }
    }
  }
  return backup;
}

function getIncludedBackupKeys(data: Record<string, unknown>) {
  return Object.keys(data).sort();
}

export function exportBackup(): { fileName: string; includedKeys: string[] } {
  const exportedAt = new Date().toISOString();
  const fileName = `nix-studyos-backup-${exportedAt.slice(0, 10)}.json`;
  const data = collectBackup();
  const includedKeys = getIncludedBackupKeys(data);
  const backupFile: StudyOSBackupFile = {
    appName: BACKUP_APP_NAME,
    exportedAt,
    backupVersion: BACKUP_SCHEMA_VERSION,
    includedKeys,
    data,
    placeholders: {
      topicMastery: readLocalJson<unknown[]>('baccllb-topic-mastery', []),
      mistakeBank: readLocalJson<unknown[]>('baccllb-mistake-bank', []),
    },
  };

  writeLocalJson<BackupMeta>(LOCAL_BACKUP_META_KEY, {
    action: 'export',
    exportedAt,
    fileName,
    includedKeys,
  });

  const blob = new Blob([JSON.stringify(backupFile, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);

  return { fileName, includedKeys };
}

export function parseBackupForPreview(rawJson: string): BackupImportPreview {
  try {
    return buildBackupImportPreview(JSON.parse(rawJson));
  } catch {
    return invalidBackupPreview('Could not parse file. Make sure it is a valid JSON backup.');
  }
}

export function buildBackupImportPreview(candidate: unknown): BackupImportPreview {
  if (!isValidBackupShape(candidate)) {
    return invalidBackupPreview('Invalid backup: this does not appear to be a Nix StudyOS backup file.', candidate as Partial<StudyOSBackupFile>);
  }

  const version = readBackupVersion(candidate);
  if (version === null) {
    return invalidBackupPreview('Invalid backup: backup version metadata is missing.', candidate);
  }

  const includedKeys = Object.keys(candidate.data).sort();
  const recognisedDataKeys = includedKeys.filter(isRecognisedBackupKey);
  const unknownKeys = includedKeys.filter((key) => !isRecognisedBackupKey(key));
  const placeholderKeys = getPlaceholderRestoreKeys(candidate);
  const recognisedKeys = uniqueSorted([...recognisedDataKeys, ...placeholderKeys]);
  const warnings: string[] = [];

  if (version > BACKUP_SCHEMA_VERSION) {
    return {
      ...previewBase(candidate, includedKeys, recognisedKeys, unknownKeys),
      version: String(version),
      error: `This backup uses a newer version (${version}) than this app currently supports.`,
    };
  }

  if (version < BACKUP_SCHEMA_VERSION) {
    warnings.push(`Imported an older backup version (${version}). Review your data after reload in case some newer features were not present yet.`);
  }

  if (unknownKeys.length > 0) {
    warnings.push(`${unknownKeys.length} unknown backup key${unknownKeys.length === 1 ? '' : 's'} will be ignored.`);
  }

  if (recognisedKeys.length === 0) {
    return {
      ...previewBase(candidate, includedKeys, recognisedKeys, unknownKeys),
      version: String(version),
      warnings,
      error: 'Invalid backup: no recognised StudyOS local data keys were found in this file.',
    };
  }

  return {
    ...previewBase(candidate, includedKeys, recognisedKeys, unknownKeys),
    valid: true,
    version: String(version),
    missingKnownKeys: RECOGNISED_BACKUP_KEYS.filter((key) => !recognisedKeys.includes(key)),
    overwriteKeys: recognisedKeys.filter((key) => localStorage.getItem(key) !== null),
    highRiskKeys: recognisedKeys.filter((key) => HIGH_RISK_BACKUP_KEYS.has(key)),
    warnings,
    backup: candidate,
  };
}

export function readBackupFileForPreview(file: File): Promise<BackupImportPreview> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(parseBackupForPreview(String(e.target?.result ?? '')));
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsText(file);
  });
}

export function applyBackupImport(preview: BackupImportPreview, fileName = 'selected-backup.json'): { keys: string[]; warning?: string } {
  if (!preview.valid || !preview.backup) {
    throw new Error(preview.error || 'Invalid backup: preview is not ready to import.');
  }

  const keys: string[] = [];
  for (const key of preview.recognisedKeys) {
    let value: unknown;
    if (Object.prototype.hasOwnProperty.call(preview.backup.data, key)) {
      value = preview.backup.data[key];
    } else if (key === LOCAL_TOPIC_MASTERY_KEY) {
      value = preview.backup.placeholders?.topicMastery ?? [];
    } else if (key === 'baccllb-mistake-bank') {
      value = preview.backup.placeholders?.mistakeBank ?? [];
    } else {
      continue;
    }

    localStorage.setItem(key, JSON.stringify(value));
    keys.push(key);
  }

  const olderVersionWarning = preview.warnings.find((warning) => warning.startsWith('Imported an older backup version'));
  writeLocalJson<BackupMeta>(LOCAL_BACKUP_META_KEY, {
    action: 'import',
    exportedAt: preview.backup.exportedAt,
    fileName,
    includedKeys: keys,
    importedAt: new Date().toISOString(),
    warning: olderVersionWarning,
  });

  return { keys, warning: olderVersionWarning };
}

export function importBackup(file: File): Promise<{ keys: string[]; warning?: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const preview = parseBackupForPreview(String(e.target?.result ?? ''));
        if (!preview.valid) {
          reject(new Error(preview.error || 'Invalid backup.'));
          return;
        }
        resolve(applyBackupImport(preview, file.name));
      } catch {
        reject(new Error('Could not parse file. Make sure it is a valid JSON backup.'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsText(file);
  });
}

export function resetAppData(): void {
  [...BACKUP_KEYS, ...appKeys()].forEach((key) => localStorage.removeItem(key));
}

export function readLocalJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeLocalJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getLastBackupMeta(): BackupMeta | null {
  return readLocalJson<BackupMeta | null>(LOCAL_BACKUP_META_KEY, null);
}

export function getBackupAgeDays(): number | null {
  const meta = getLastBackupMeta();
  if (!meta) return null;
  const timestamp = meta.action === 'import' && meta.importedAt
    ? meta.importedAt
    : meta.exportedAt;
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)));
}

function isValidBackupShape(value: unknown): value is StudyOSBackupFile {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;

  const candidate = value as Partial<StudyOSBackupFile>;
  return (
    candidate.appName === BACKUP_APP_NAME &&
    typeof candidate.exportedAt === 'string' &&
    typeof candidate.data === 'object' &&
    candidate.data !== null &&
    !Array.isArray(candidate.data)
  );
}

function readBackupVersion(candidate: Partial<StudyOSBackupFile> & { schemaVersion?: unknown }) {
  if (typeof candidate.backupVersion === 'number') return candidate.backupVersion;
  if (typeof candidate.schemaVersion === 'number') return candidate.schemaVersion;
  return null;
}

function invalidBackupPreview(error: string, candidate?: Partial<StudyOSBackupFile>): BackupImportPreview {
  return {
    valid: false,
    appName: typeof candidate?.appName === 'string' ? candidate.appName : undefined,
    exportedAt: typeof candidate?.exportedAt === 'string' ? candidate.exportedAt : undefined,
    version: typeof candidate?.backupVersion === 'number' ? String(candidate.backupVersion) : undefined,
    includedKeys: [],
    recognisedKeys: [],
    unknownKeys: [],
    missingKnownKeys: RECOGNISED_BACKUP_KEYS,
    overwriteKeys: [],
    highRiskKeys: [],
    warnings: [],
    error,
  };
}

function previewBase(
  backup: StudyOSBackupFile,
  includedKeys: string[],
  recognisedKeys: string[],
  unknownKeys: string[],
): BackupImportPreview {
  return {
    valid: false,
    appName: backup.appName,
    exportedAt: backup.exportedAt,
    includedKeys,
    recognisedKeys,
    unknownKeys,
    missingKnownKeys: RECOGNISED_BACKUP_KEYS.filter((key) => !recognisedKeys.includes(key)),
    overwriteKeys: recognisedKeys.filter((key) => localStorage.getItem(key) !== null),
    highRiskKeys: recognisedKeys.filter((key) => HIGH_RISK_BACKUP_KEYS.has(key)),
    warnings: [],
  };
}

function getPlaceholderRestoreKeys(backup: StudyOSBackupFile) {
  const keys: string[] = [];
  if (!Object.prototype.hasOwnProperty.call(backup.data, LOCAL_TOPIC_MASTERY_KEY) && backup.placeholders?.topicMastery) {
    keys.push(LOCAL_TOPIC_MASTERY_KEY);
  }
  if (!Object.prototype.hasOwnProperty.call(backup.data, 'baccllb-mistake-bank') && backup.placeholders?.mistakeBank) {
    keys.push('baccllb-mistake-bank');
  }
  return keys;
}

function uniqueSorted(keys: string[]) {
  return Array.from(new Set(keys)).sort();
}
