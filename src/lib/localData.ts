export const BACKUP_KEYS = [
  'baccllb-mark-rows',
  'baccllb-tasks',
  'baccllb-timer-sessions',
  'baccllb-mistake-log',
  'baccllb-checklist',
  'baccllb-planner',
];

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
  const blob = new Blob([JSON.stringify(collectBackup(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nix-studyos-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importBackup(file: File): Promise<{ keys: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
          reject(new Error('Invalid backup: expected a JSON object.')); return;
        }
        const keys: string[] = [];
        for (const [key, value] of Object.entries(data)) {
          localStorage.setItem(key, JSON.stringify(value));
          keys.push(key);
        }
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
