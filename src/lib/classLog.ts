import { LOCAL_CLASS_LOG_KEY, readLocalJson, writeLocalJson } from './localData';

export type ClassLogConfidence = 'low' | 'medium' | 'high';

export interface ClassLogEntry {
  id: string;
  moduleCode: string;
  date: string;
  title: string;
  rawNotes: string;
  lecturerEmphasis: string;
  examples: string;
  questions: string;
  homework: string;
  confidence: ClassLogConfidence;
  createdAt: string;
  updatedAt: string;
}

export type ClassLogDraft = Omit<ClassLogEntry, 'id' | 'createdAt' | 'updatedAt'>;

const VALID_CONFIDENCE: ReadonlyArray<ClassLogConfidence> = ['low', 'medium', 'high'];

export function normaliseClassLogEntry(raw: unknown): ClassLogEntry | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;

  const r = raw as Record<string, unknown>;

  const id = typeof r.id === 'string' ? r.id.trim() : '';
  const moduleCode = typeof r.moduleCode === 'string' ? r.moduleCode.trim() : '';
  const date = typeof r.date === 'string' ? r.date.trim() : '';

  if (!id || !moduleCode || !date) return null;

  const confidence: ClassLogConfidence = VALID_CONFIDENCE.includes(r.confidence as ClassLogConfidence)
    ? (r.confidence as ClassLogConfidence)
    : 'medium';

  return {
    id,
    moduleCode,
    date,
    title: typeof r.title === 'string' ? r.title.trim() : '',
    rawNotes: typeof r.rawNotes === 'string' ? r.rawNotes.trim() : '',
    lecturerEmphasis: typeof r.lecturerEmphasis === 'string' ? r.lecturerEmphasis.trim() : '',
    examples: typeof r.examples === 'string' ? r.examples.trim() : '',
    questions: typeof r.questions === 'string' ? r.questions.trim() : '',
    homework: typeof r.homework === 'string' ? r.homework.trim() : '',
    confidence,
    createdAt: typeof r.createdAt === 'string' ? r.createdAt : new Date().toISOString(),
    updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : new Date().toISOString(),
  };
}

export function readClassLogEntries(): ClassLogEntry[] {
  try {
    const raw = readLocalJson<unknown[]>(LOCAL_CLASS_LOG_KEY, []);
    if (!Array.isArray(raw)) return [];
    return raw.flatMap((item) => {
      const entry = normaliseClassLogEntry(item);
      return entry ? [entry] : [];
    });
  } catch {
    return [];
  }
}

export function writeClassLogEntries(entries: ClassLogEntry[]): void {
  try {
    writeLocalJson(LOCAL_CLASS_LOG_KEY, entries);
  } catch {
    // localStorage unavailable — fail silently
  }
}

export function createClassLogEntry(draft: ClassLogDraft): ClassLogEntry {
  const now = new Date().toISOString();
  const entry: ClassLogEntry = {
    id: crypto.randomUUID(),
    moduleCode: draft.moduleCode.trim(),
    date: draft.date.trim(),
    title: draft.title.trim(),
    rawNotes: draft.rawNotes.trim(),
    lecturerEmphasis: draft.lecturerEmphasis.trim(),
    examples: draft.examples.trim(),
    questions: draft.questions.trim(),
    homework: draft.homework.trim(),
    confidence: draft.confidence,
    createdAt: now,
    updatedAt: now,
  };
  const existing = readClassLogEntries();
  writeClassLogEntries([...existing, entry]);
  return entry;
}

export function updateClassLogEntry(id: string, changes: Partial<ClassLogDraft>): ClassLogEntry | null {
  const entries = readClassLogEntries();
  const index = entries.findIndex((e) => e.id === id);
  if (index === -1) return null;

  const updated: ClassLogEntry = {
    ...entries[index],
    ...changes,
    ...(changes.moduleCode !== undefined && { moduleCode: changes.moduleCode.trim() }),
    ...(changes.date !== undefined && { date: changes.date.trim() }),
    ...(changes.title !== undefined && { title: changes.title.trim() }),
    ...(changes.rawNotes !== undefined && { rawNotes: changes.rawNotes.trim() }),
    ...(changes.lecturerEmphasis !== undefined && { lecturerEmphasis: changes.lecturerEmphasis.trim() }),
    ...(changes.examples !== undefined && { examples: changes.examples.trim() }),
    ...(changes.questions !== undefined && { questions: changes.questions.trim() }),
    ...(changes.homework !== undefined && { homework: changes.homework.trim() }),
    updatedAt: new Date().toISOString(),
  };

  entries[index] = updated;
  writeClassLogEntries(entries);
  return updated;
}

export function deleteClassLogEntry(id: string): void {
  writeClassLogEntries(readClassLogEntries().filter((e) => e.id !== id));
}

export function getClassLogEntriesByModule(moduleCode: string): ClassLogEntry[] {
  return readClassLogEntries().filter((e) => e.moduleCode === moduleCode);
}

export function getRecentClassLogEntries(limit = 20): ClassLogEntry[] {
  return readClassLogEntries()
    .sort((a, b) => {
      const dateCmp = b.date.localeCompare(a.date);
      return dateCmp !== 0 ? dateCmp : b.createdAt.localeCompare(a.createdAt);
    })
    .slice(0, limit);
}
