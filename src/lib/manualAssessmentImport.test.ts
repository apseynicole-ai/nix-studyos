import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  normaliseConfidence,
  normaliseModuleToken,
  parseManualAssessmentImport,
} from './manualAssessmentImport';
import { modules } from '../data/modules';
import type { ManualAssessmentEntry } from './manualAssessments';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return Array.from(this.values.keys())[index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true });
});

afterEach(() => {
  (globalThis.localStorage as MemoryStorage).clear();
});

const conlaw = modules.find((m) => m.id === 'conlaw178')!;
const finacc = modules.find((m) => m.id === 'finacc178')!;
const econ = modules.find((m) => m.id === 'econ114')!;
const foundations = modules.find((m) => m.id === 'foundations178')!;

function existing(overrides: Partial<ManualAssessmentEntry> = {}): ManualAssessmentEntry {
  return {
    id: 'existing-1',
    moduleId: 'conlaw178',
    moduleCode: 'CON178',
    title: 'A1S2',
    date: '2026-10-01',
    time: '',
    venue: 'TBC',
    durationMinutes: 0,
    confidence: 'high',
    createdAt: '2026-06-24T00:00:00.000Z',
    ...overrides,
  };
}

describe('normaliseModuleToken', () => {
  it('matches by module code (case-insensitive)', () => {
    expect(normaliseModuleToken('CON178', modules)?.id).toBe('conlaw178');
    expect(normaliseModuleToken('con178', modules)?.id).toBe('conlaw178');
  });

  it('matches by module id (case-insensitive)', () => {
    expect(normaliseModuleToken('conlaw178', modules)?.id).toBe('conlaw178');
    expect(normaliseModuleToken('CONLAW178', modules)?.id).toBe('conlaw178');
  });

  it('matches by shortName', () => {
    expect(normaliseModuleToken(conlaw.shortName, modules)?.id).toBe('conlaw178');
  });

  it('matches finacc by id token FINACC178 (id is finacc178)', () => {
    expect(normaliseModuleToken('FINACC178', modules)?.id).toBe('finacc178');
  });

  it('matches finacc by code FA178', () => {
    expect(normaliseModuleToken('FA178', modules)?.id).toBe('finacc178');
  });

  it('matches finacc by id token FINACC178 (case-insensitive id match)', () => {
    expect(normaliseModuleToken('FINACC178', modules)?.id).toBe('finacc178');
  });

  it('matches econ by original code ECO114', () => {
    expect(normaliseModuleToken('ECO114', modules)?.id).toBe('econ114');
    expect(normaliseModuleToken('eco114', modules)?.id).toBe('econ114');
  });

  it('matches econ by alternate Semester 2 code ECO144', () => {
    expect(normaliseModuleToken('ECO144', modules)?.id).toBe('econ114');
    expect(normaliseModuleToken('eco144', modules)?.id).toBe('econ114');
  });

  it('matches foundations by code FOL178', () => {
    expect(normaliseModuleToken('FOL178', modules)?.id).toBe('foundations178');
  });

  it('matches foundations by alternate token FOUNDATIONS178 (case-insensitive id match)', () => {
    expect(normaliseModuleToken('FOUNDATIONS178', modules)?.id).toBe('foundations178');
  });

  it('returns null for unknown token', () => {
    expect(normaliseModuleToken('NOTAMOD', modules)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(normaliseModuleToken('', modules)).toBeNull();
  });
});

describe('normaliseConfidence', () => {
  it('maps confirmed to high', () => {
    expect(normaliseConfidence('confirmed')).toBe('high');
    expect(normaliseConfidence('CONFIRMED')).toBe('high');
  });

  it('maps high to high', () => {
    expect(normaliseConfidence('high')).toBe('high');
  });

  it('maps provisional to provisional', () => {
    expect(normaliseConfidence('provisional')).toBe('provisional');
  });

  it('defaults empty string to provisional', () => {
    expect(normaliseConfidence('')).toBe('provisional');
  });

  it('defaults unknown value to provisional', () => {
    expect(normaliseConfidence('unknown-value')).toBe('provisional');
  });
});

describe('parseManualAssessmentImport', () => {
  it('parses a valid row correctly', () => {
    const text = 'CON178 | A1S2 | 2026-10-01 | 17:00 | TBC | confirmed';
    const result = parseManualAssessmentImport(text, modules, []);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].status).toBe('valid');
    expect(result.rows[0].moduleId).toBe('conlaw178');
    expect(result.rows[0].moduleCode).toBe(conlaw.code);
    expect(result.rows[0].title).toBe('A1S2');
    expect(result.rows[0].date).toBe('2026-10-01');
    expect(result.rows[0].time).toBe('17:00');
    expect(result.rows[0].venue).toBe('TBC');
    expect(result.rows[0].confidence).toBe('high');
    expect(result.validCount).toBe(1);
    expect(result.errorCount).toBe(0);
    expect(result.duplicateCount).toBe(0);
  });

  it('ignores blank lines', () => {
    const text = '\n\nCON178 | A1S2 | 2026-10-01 | | |\n\n';
    const result = parseManualAssessmentImport(text, modules, []);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].status).toBe('valid');
  });

  it('ignores comment lines starting with #', () => {
    const text = '# This is a comment\nCON178 | A1S2 | 2026-10-01 | | |';
    const result = parseManualAssessmentImport(text, modules, []);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].status).toBe('valid');
  });

  it('returns empty rows for empty string', () => {
    const result = parseManualAssessmentImport('', modules, []);
    expect(result.rows).toHaveLength(0);
    expect(result.validCount).toBe(0);
  });

  it('returns empty rows for comment-only input', () => {
    const result = parseManualAssessmentImport('# header line\n# another comment', modules, []);
    expect(result.rows).toHaveLength(0);
  });

  it('matches module by module id', () => {
    const text = 'conlaw178 | Test | 2026-10-01 | | |';
    const result = parseManualAssessmentImport(text, modules, []);
    expect(result.rows[0].status).toBe('valid');
    expect(result.rows[0].moduleId).toBe('conlaw178');
  });

  it('matches module by shortName', () => {
    const text = `${conlaw.shortName} | Test | 2026-10-01 | | |`;
    const result = parseManualAssessmentImport(text, modules, []);
    expect(result.rows[0].status).toBe('valid');
    expect(result.rows[0].moduleId).toBe('conlaw178');
  });

  it('matches finacc module by FA178 code', () => {
    const text = `${finacc.code} | A1S2 | 2026-09-03 | 17:30 | TBC | confirmed`;
    const result = parseManualAssessmentImport(text, modules, []);
    expect(result.rows[0].status).toBe('valid');
    expect(result.rows[0].moduleId).toBe('finacc178');
  });

  it('ECO144 resolves to the econ module and produces a valid row', () => {
    const text = 'ECO144 | A1 | 2026-09-01 | 17:40 | TBC | confirmed';
    const result = parseManualAssessmentImport(text, modules, []);
    expect(result.rows[0].status).toBe('valid');
    expect(result.rows[0].moduleId).toBe('econ114');
    expect(result.rows[0].moduleCode).toBe(econ.code);
  });

  it('ECO114 continues to resolve to the econ module', () => {
    const text = 'ECO114 | A1 | 2026-09-01 | | |';
    const result = parseManualAssessmentImport(text, modules, []);
    expect(result.rows[0].status).toBe('valid');
    expect(result.rows[0].moduleId).toBe('econ114');
  });

  it('FOUNDATIONS178 resolves to the foundations module', () => {
    const text = 'FOUNDATIONS178 | A1S2 | 2026-10-05 | | |';
    const result = parseManualAssessmentImport(text, modules, []);
    expect(result.rows[0].status).toBe('valid');
    expect(result.rows[0].moduleId).toBe('foundations178');
    expect(result.rows[0].moduleCode).toBe(foundations.code);
  });

  it('rejects unknown module', () => {
    const text = 'NOTAMOD | Test | 2026-10-01 | | |';
    const result = parseManualAssessmentImport(text, modules, []);
    expect(result.rows[0].status).toBe('error');
    expect(result.rows[0].errors[0]).toMatch(/unknown module/i);
    expect(result.errorCount).toBe(1);
  });

  it('rejects empty title', () => {
    const text = 'CON178 |  | 2026-10-01 | | |';
    const result = parseManualAssessmentImport(text, modules, []);
    expect(result.rows[0].status).toBe('error');
    expect(result.rows[0].errors.some((e) => /title/i.test(e))).toBe(true);
  });

  it('rejects missing date', () => {
    const text = 'CON178 | Test |  | | |';
    const result = parseManualAssessmentImport(text, modules, []);
    expect(result.rows[0].status).toBe('error');
    expect(result.rows[0].errors.some((e) => /date/i.test(e))).toBe(true);
  });

  it('rejects malformed date string', () => {
    const text = 'CON178 | Test | not-a-date | | |';
    const result = parseManualAssessmentImport(text, modules, []);
    expect(result.rows[0].status).toBe('error');
    expect(result.rows[0].errors.some((e) => /invalid date/i.test(e))).toBe(true);
  });

  it('rejects impossible date (e.g. 2026-02-30)', () => {
    const text = 'CON178 | Test | 2026-02-30 | | |';
    const result = parseManualAssessmentImport(text, modules, []);
    expect(result.rows[0].status).toBe('error');
    expect(result.rows[0].errors.some((e) => /invalid date/i.test(e))).toBe(true);
  });

  it('defaults missing confidence to provisional', () => {
    const text = 'CON178 | Test | 2026-10-01 | | |';
    const result = parseManualAssessmentImport(text, modules, []);
    expect(result.rows[0].status).toBe('valid');
    expect(result.rows[0].confidence).toBe('provisional');
  });

  it('accepts confirmed and maps it to high', () => {
    const text = 'CON178 | Test | 2026-10-01 | | | confirmed';
    const result = parseManualAssessmentImport(text, modules, []);
    expect(result.rows[0].confidence).toBe('high');
  });

  it('accepts high confidence', () => {
    const text = 'CON178 | Test | 2026-10-01 | | | high';
    const result = parseManualAssessmentImport(text, modules, []);
    expect(result.rows[0].confidence).toBe('high');
  });

  it('accepts provisional confidence', () => {
    const text = 'CON178 | Test | 2026-10-01 | | | provisional';
    const result = parseManualAssessmentImport(text, modules, []);
    expect(result.rows[0].confidence).toBe('provisional');
  });

  it('detects duplicate against existing manual entries', () => {
    const entry = existing({ moduleId: 'conlaw178', title: 'A1S2', date: '2026-10-01', time: '' });
    const text = 'CON178 | A1S2 | 2026-10-01 | | |';
    const result = parseManualAssessmentImport(text, modules, [entry]);
    expect(result.rows[0].status).toBe('duplicate-existing');
    expect(result.duplicateCount).toBe(1);
    expect(result.validCount).toBe(0);
  });

  it('detects duplicate within the batch — keeps first, flags second', () => {
    const text = 'CON178 | A1S2 | 2026-10-01 | | |\nCON178 | A1S2 | 2026-10-01 | | |';
    const result = parseManualAssessmentImport(text, modules, []);
    expect(result.rows[0].status).toBe('valid');
    expect(result.rows[1].status).toBe('duplicate-batch');
    expect(result.validCount).toBe(1);
    expect(result.duplicateCount).toBe(1);
  });

  it('does not write to localStorage (pure parser)', () => {
    const key = 'baccllb-manual-assessments';
    const before = localStorage.getItem(key);
    parseManualAssessmentImport('CON178 | Test | 2026-10-01 | | |', modules, []);
    expect(localStorage.getItem(key)).toBe(before);
  });

  it('parses multiple valid rows and returns correct counts', () => {
    const text = `CON178 | A1S2 | 2026-10-01 | 17:00 | TBC | confirmed\n${finacc.code} | A1S2 | 2026-09-03 | 17:30 | TBC | confirmed`;
    const result = parseManualAssessmentImport(text, modules, []);
    expect(result.validCount).toBe(2);
    expect(result.errorCount).toBe(0);
    expect(result.duplicateCount).toBe(0);
  });

  it('returns correct counts for a mixed-validity batch', () => {
    const text = [
      'CON178 | A1S2 | 2026-10-01 | | | confirmed',
      'NOTAMOD | Test | 2026-10-01 | | |',
      `${finacc.code} | A1S2 | 2026-09-03 | | |`,
    ].join('\n');
    const result = parseManualAssessmentImport(text, modules, []);
    expect(result.validCount).toBe(2);
    expect(result.errorCount).toBe(1);
  });

  it('accumulates multiple errors on a single invalid row', () => {
    const text = 'NOTAMOD |  | bad-date | | |';
    const result = parseManualAssessmentImport(text, modules, []);
    expect(result.rows[0].status).toBe('error');
    expect(result.rows[0].errors.length).toBeGreaterThanOrEqual(2);
  });
});
