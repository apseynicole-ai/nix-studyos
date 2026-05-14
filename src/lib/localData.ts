export const BACKUP_KEYS = [
  'baccllb-mark-rows',
  'baccllb-mark-engine-state',
  'baccllb-tasks',
  'baccllb-timer-sessions',
  'baccllb-studyai-summaries',
  'baccllb-profile',
  'baccllb-mistake-log',
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
export const LOCAL_BACKUP_META_KEY = 'baccllb-last-backup-meta';
export const BACKUP_SCHEMA_VERSION = 1;
export const BACKUP_APP_NAME = 'Nix StudyOS';

interface BackupMeta {
  exportedAt: string;
  fileName: string;
}

export interface StudyOSBackupFile {
  appName: string;
  exportedAt: string;
  schemaVersion: number;
  data: Record<string, unknown>;
  placeholders: {
    topicMastery: unknown[];
    mistakeBank: unknown[];
  };
}

function appKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && (k.startsWith('baccllb-') || k.startsWith('nix-'))) keys.push(k);
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

export function exportBackup(): void {
  const exportedAt = new Date().toISOString();
  const fileName = `nix-studyos-backup-${exportedAt.slice(0, 10)}.json`;
  const backupFile: StudyOSBackupFile = {
    appName: BACKUP_APP_NAME,
    exportedAt,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    data: collectBackup(),
    placeholders: {
      topicMastery: readLocalJson<unknown[]>('baccllb-topic-mastery', []),
      mistakeBank: readLocalJson<unknown[]>('baccllb-mistake-bank', []),
    },
  };

  writeLocalJson<BackupMeta>(LOCAL_BACKUP_META_KEY, { exportedAt, fileName });

  const blob = new Blob([JSON.stringify(backupFile, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export function importBackup(file: File): Promise<{ keys: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (!isValidBackupShape(data)) {
          reject(new Error('Invalid backup: this does not appear to be a Nix StudyOS backup file.'));
          return;
        }

        if (data.schemaVersion !== BACKUP_SCHEMA_VERSION) {
          reject(new Error(`Unsupported backup schema version: ${String(data.schemaVersion)}.`));
          return;
        }

        const keys: string[] = [];
        for (const [key, value] of Object.entries(data.data)) {
          localStorage.setItem(key, JSON.stringify(value));
          keys.push(key);
        }
        if (!('baccllb-topic-mastery' in data.data)) {
          localStorage.setItem('baccllb-topic-mastery', JSON.stringify(data.placeholders.topicMastery ?? []));
          keys.push('baccllb-topic-mastery');
        }
        if (!('baccllb-mistake-bank' in data.data)) {
          localStorage.setItem('baccllb-mistake-bank', JSON.stringify(data.placeholders.mistakeBank ?? []));
          keys.push('baccllb-mistake-bank');
        }
        writeLocalJson<BackupMeta>(LOCAL_BACKUP_META_KEY, {
          exportedAt: data.exportedAt,
          fileName: file.name,
        });
        resolve({ keys });
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

function isValidBackupShape(value: unknown): value is StudyOSBackupFile {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;

  const candidate = value as Partial<StudyOSBackupFile>;
  return (
    candidate.appName === BACKUP_APP_NAME &&
    typeof candidate.exportedAt === 'string' &&
    typeof candidate.schemaVersion === 'number' &&
    typeof candidate.data === 'object' &&
    candidate.data !== null &&
    !Array.isArray(candidate.data) &&
    typeof candidate.placeholders === 'object' &&
    candidate.placeholders !== null
  );
}
