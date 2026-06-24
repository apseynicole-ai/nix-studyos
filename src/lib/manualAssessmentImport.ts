import type { ModuleInfo } from '../data/modules/types';
import { isValidIsoDateString, type ManualAssessmentEntry } from './manualAssessments';

export type ImportRowStatus = 'valid' | 'duplicate-existing' | 'duplicate-batch' | 'error';

export interface ParsedImportRow {
  raw: string;
  lineNumber: number;
  status: ImportRowStatus;
  errors: string[];
  moduleId?: string;
  moduleCode?: string;
  title?: string;
  date?: string;
  time?: string;
  venue?: string;
  confidence?: 'high' | 'provisional';
}

export interface ImportParseResult {
  rows: ParsedImportRow[];
  validCount: number;
  errorCount: number;
  duplicateCount: number;
}

export function normaliseModuleToken(token: string, modules: ModuleInfo[]): ModuleInfo | null {
  const t = token.trim().toLowerCase();
  if (!t) return null;
  return (
    modules.find(
      (m) =>
        m.id.toLowerCase() === t ||
        m.code.toLowerCase() === t ||
        m.shortName.toLowerCase() === t ||
        m.name.toLowerCase() === t ||
        m.aliases.some((alias) => alias.toLowerCase() === t),
    ) ?? null
  );
}

export function normaliseConfidence(token: string): 'high' | 'provisional' {
  const t = token.trim().toLowerCase();
  if (t === 'confirmed' || t === 'high') return 'high';
  return 'provisional';
}

function duplicateKey(moduleId: string, title: string, date: string, time: string): string {
  return `${moduleId}|${title.toLowerCase().trim()}|${date}|${time.trim()}`;
}

export function parseManualAssessmentImport(
  text: string,
  modules: ModuleInfo[],
  existingEntries: ManualAssessmentEntry[],
): ImportParseResult {
  const existingKeys = new Set(
    existingEntries.map((e) => duplicateKey(e.moduleId, e.title, e.date, e.time)),
  );
  const batchKeys = new Set<string>();
  const rows: ParsedImportRow[] = [];
  let lineNumber = 0;

  for (const raw of text.split('\n')) {
    lineNumber++;
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const [
      moduleToken = '',
      titleToken = '',
      dateToken = '',
      timeToken = '',
      venueToken = '',
      confidenceToken = '',
    ] = trimmed.split('|').map((p) => p.trim());

    const errors: string[] = [];
    const resolvedModule = normaliseModuleToken(moduleToken, modules);

    if (!resolvedModule) {
      errors.push(`Unknown module "${moduleToken || '(empty)'}" — check module code, id, or name.`);
    }
    if (!titleToken) {
      errors.push('Title is required.');
    }
    if (!dateToken) {
      errors.push('Date is required (YYYY-MM-DD).');
    } else if (!isValidIsoDateString(dateToken)) {
      errors.push(`Invalid date "${dateToken}" — use YYYY-MM-DD format.`);
    }

    if (errors.length > 0) {
      rows.push({ raw, lineNumber, status: 'error', errors });
      continue;
    }

    const moduleId = resolvedModule!.id;
    const moduleCode = resolvedModule!.code;
    const title = titleToken;
    const date = dateToken;
    const time = timeToken;
    const venue = venueToken;
    const confidence = normaliseConfidence(confidenceToken);
    const key = duplicateKey(moduleId, title, date, time);

    if (existingKeys.has(key)) {
      rows.push({
        raw, lineNumber, status: 'duplicate-existing',
        errors: [`Duplicate of an existing entry: ${moduleCode} "${title}" on ${date}.`],
        moduleId, moduleCode, title, date, time, venue, confidence,
      });
      continue;
    }

    if (batchKeys.has(key)) {
      rows.push({
        raw, lineNumber, status: 'duplicate-batch',
        errors: [`Duplicate within this batch: ${moduleCode} "${title}" on ${date} — only the first occurrence is saved.`],
        moduleId, moduleCode, title, date, time, venue, confidence,
      });
      continue;
    }

    batchKeys.add(key);
    rows.push({ raw, lineNumber, status: 'valid', errors: [], moduleId, moduleCode, title, date, time, venue, confidence });
  }

  return {
    rows,
    validCount: rows.filter((r) => r.status === 'valid').length,
    errorCount: rows.filter((r) => r.status === 'error').length,
    duplicateCount: rows.filter((r) => r.status === 'duplicate-existing' || r.status === 'duplicate-batch').length,
  };
}
