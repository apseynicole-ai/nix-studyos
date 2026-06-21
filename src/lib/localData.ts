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
];

export const LOCAL_PROFILE_KEY = 'baccllb-profile';
export const LOCAL_TASKS_KEY = 'baccllb-tasks';
export const LOCAL_TIMER_SESSIONS_KEY = 'baccllb-timer-sessions';
export const LOCAL_SUMMARIES_KEY = 'baccllb-studyai-summaries';
export const LOCAL_TOPIC_MASTERY_KEY = 'baccllb-topic-mastery';
export const LOCAL_MODULE_CONFIDENCE_KEY = 'baccllb-module-confidence';
export const LOCAL_ACADEMIC_SNAPSHOTS_KEY = 'baccllb-academic-snapshots';
export const LOCAL_BACKUP_META_KEY = 'baccllb-last-backup-meta';
export const BACKUP_SCHEMA_VERSION = 1;
export const BACKUP_APP_NAME = 'Nix StudyOS';

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

function isStudyOSStorageKey(key: string) {
  return key.startsWith('baccllb-') || key.startsWith('nix-');
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

export function importBackup(file: File): Promise<{ keys: string[]; warning?: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (!isValidBackupShape(data)) {
          reject(new Error('Invalid backup: this does not appear to be a Nix StudyOS backup file.'));
          return;
        }

        const version = readBackupVersion(data);
        if (version === null) {
          reject(new Error('Invalid backup: backup version metadata is missing.'));
          return;
        }

        let warning: string | undefined;
        if (version > BACKUP_SCHEMA_VERSION) {
          reject(new Error(`This backup uses a newer version (${version}) than this app currently supports.`));
          return;
        }
        if (version < BACKUP_SCHEMA_VERSION) {
          warning = `Imported an older backup version (${version}). Review your data after reload in case some newer features were not present yet.`;
        }

        const keys: string[] = [];
        for (const [key, value] of Object.entries(data.data)) {
          if (!isStudyOSStorageKey(key)) continue;
          localStorage.setItem(key, JSON.stringify(value));
          keys.push(key);
        }
        if (keys.length === 0 && !data.placeholders?.topicMastery && !data.placeholders?.mistakeBank) {
          reject(new Error('Invalid backup: no StudyOS local data keys were found in this file.'));
          return;
        }
        if (!('baccllb-topic-mastery' in data.data)) {
          localStorage.setItem('baccllb-topic-mastery', JSON.stringify(data.placeholders?.topicMastery ?? []));
          keys.push('baccllb-topic-mastery');
        }
        if (!('baccllb-mistake-bank' in data.data)) {
          localStorage.setItem('baccllb-mistake-bank', JSON.stringify(data.placeholders?.mistakeBank ?? []));
          keys.push('baccllb-mistake-bank');
        }
        writeLocalJson<BackupMeta>(LOCAL_BACKUP_META_KEY, {
          action: 'import',
          exportedAt: data.exportedAt,
          fileName: file.name,
          includedKeys: keys,
          importedAt: new Date().toISOString(),
          warning,
        });
        resolve({ keys, warning });
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
