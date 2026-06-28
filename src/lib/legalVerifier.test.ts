import { describe, expect, it } from 'vitest';
import {
  analyzeLegalCitationDraft,
  detectBibliographyLikeLines,
  detectFootnoteLikeLines,
  formatLegalVerifierReport,
  generateAiReviewPrompt,
  type LegalVerifierInputs,
} from './legalVerifier';

function emptyInputs(overrides: Partial<LegalVerifierInputs> = {}): LegalVerifierInputs {
  return {
    draftText: '',
    footnotesText: '',
    bibliographyText: '',
    sourcePackText: '',
    guideRulesText: '',
    rubricText: '',
    ...overrides,
  };
}

describe('detectFootnoteLikeLines', () => {
  it('returns empty array for empty input', () => {
    expect(detectFootnoteLikeLines('')).toEqual([]);
  });

  it('returns empty array for whitespace-only input', () => {
    expect(detectFootnoteLikeLines('   \n\n  ')).toEqual([]);
  });

  it('excludes lines shorter than 8 characters', () => {
    // '1. para' is 7 chars — below the minimum length
    expect(detectFootnoteLikeLines('1. para')).toEqual([]);
  });

  it('detects numbered footnote lines', () => {
    const lines = detectFootnoteLikeLines('1 Smith v Jones [2019] ZASCA 42.');
    expect(lines).toHaveLength(1);
    expect(lines[0].value).toBe('1 Smith v Jones [2019] ZASCA 42.');
  });

  it('detects bracketed numbered footnote lines', () => {
    const lines = detectFootnoteLikeLines('[1] Ibid para 15.');
    expect(lines).toHaveLength(1);
  });

  it('detects ibid keyword', () => {
    const lines = detectFootnoteLikeLines('ibid at paragraph 12.');
    expect(lines).toHaveLength(1);
  });

  it('detects para keyword', () => {
    const lines = detectFootnoteLikeLines('See Smith 2020 para 15.');
    expect(lines).toHaveLength(1);
  });

  it('detects case citation pattern with v separator', () => {
    const lines = detectFootnoteLikeLines('Smith v Jones is relevant here.');
    expect(lines).toHaveLength(1);
  });

  it('detects bclr reference', () => {
    const lines = detectFootnoteLikeLines('[2019] 5 BCLR 1234 (CC).');
    expect(lines).toHaveLength(1);
  });

  it('detects constitution keyword', () => {
    const lines = detectFootnoteLikeLines('Section 9 of the Constitution applies.');
    expect(lines).toHaveLength(1);
  });

  it('detects sasa keyword', () => {
    const lines = detectFootnoteLikeLines('Section 1 SASA exemption applies here.');
    expect(lines).toHaveLength(1);
  });

  it('detects statute line starting with s followed by a word boundary', () => {
    const lines = detectFootnoteLikeLines('s 10(1) of the relevant act.');
    expect(lines).toHaveLength(1);
  });

  it('detects https URLs as footnote signals', () => {
    const lines = detectFootnoteLikeLines('Available at <https://www.saflii.org/za/cases/ZASCA/2020/1.html>.');
    expect(lines).toHaveLength(1);
  });

  it('does not detect plain body text without legal signals', () => {
    const lines = detectFootnoteLikeLines('This assignment examines the legal question.');
    expect(lines).toHaveLength(0);
  });

  it('returns correct 1-based index and preserves the raw line', () => {
    // First line is blank, so the detected line is on index 2
    const text = '\nSmith v Jones [2019] ZASCA 42.';
    const lines = detectFootnoteLikeLines(text);
    expect(lines[0].index).toBe(2);
    expect(lines[0].raw).toBe('Smith v Jones [2019] ZASCA 42.');
  });

  it('handles multiple footnote lines in one block', () => {
    const text = [
      '1 Smith v Jones [2019] ZASCA 42.',
      '2 ibid para 30.',
      'Plain body text without signals.',
      '3 See Constitution s 9.',
    ].join('\n');
    const lines = detectFootnoteLikeLines(text);
    expect(lines).toHaveLength(3);
  });
});

describe('detectBibliographyLikeLines', () => {
  it('returns empty array for empty input', () => {
    expect(detectBibliographyLikeLines('')).toEqual([]);
  });

  it('excludes lines with 8 or fewer characters', () => {
    // 'No year.' is exactly 8 chars — value.length > 8 is false
    expect(detectBibliographyLikeLines('No year.')).toEqual([]);
  });

  it('detects bibliography entry containing a year', () => {
    const lines = detectBibliographyLikeLines('Smith J Legal Writing (2020) Cape Town.');
    expect(lines).toHaveLength(1);
    expect(lines[0].value).toBe('Smith J Legal Writing (2020) Cape Town.');
  });

  it('detects bibliography entry matching surname-comma-initial pattern', () => {
    const lines = detectBibliographyLikeLines('Jones, A Constitutional Law Cape Town.');
    expect(lines).toHaveLength(1);
  });

  it('does not detect plain lines without a year or author-initial pattern', () => {
    const lines = detectBibliographyLikeLines('This is a plain sentence with no markers.');
    expect(lines).toHaveLength(0);
  });

  it('returns correct 1-based index', () => {
    const text = 'First line no match.\nSmith J Legal Writing (2020) Cape Town.';
    const lines = detectBibliographyLikeLines(text);
    expect(lines[0].index).toBe(2);
  });

  it('detects multiple bibliography entries', () => {
    const text = [
      'Smith J Legal Writing (2020) Cape Town.',
      'Jones, A Constitutional Law Cape Town.',
      'Plain line with no signals at all here.',
    ].join('\n');
    const lines = detectBibliographyLikeLines(text);
    expect(lines).toHaveLength(2);
  });
});

describe('analyzeLegalCitationDraft', () => {
  it('does not throw with all-empty inputs', () => {
    expect(() => analyzeLegalCitationDraft(emptyInputs())).not.toThrow();
  });

  it('returns a valid report structure for empty inputs', () => {
    const report = analyzeLegalCitationDraft(emptyInputs());
    expect(report).toHaveProperty('overallStatus');
    expect(report).toHaveProperty('footnoteIssues');
    expect(report).toHaveProperty('bibliographyIssues');
    expect(report).toHaveProperty('missingBibliographyItems');
    expect(report).toHaveProperty('uncitedBibliographyItems');
    expect(report).toHaveProperty('guideChecklist');
    expect(report).toHaveProperty('finalFixChecklist');
    expect(report).toHaveProperty('parsingConfidence');
    expect(report).toHaveProperty('summaryNotes');
  });

  it('returns parsingConfidence none when no footnotes are detected', () => {
    const report = analyzeLegalCitationDraft(emptyInputs({ footnotesText: 'No citations here at all.' }));
    expect(report.parsingConfidence).toBe('none');
  });

  it('returns parsingConfidence low for 1 to 2 detected footnote lines', () => {
    const report = analyzeLegalCitationDraft(emptyInputs({
      footnotesText: '1 Smith v Jones [2019] ZASCA 42.',
    }));
    expect(report.parsingConfidence).toBe('low');
  });

  it('returns parsingConfidence medium for 3 to 5 detected footnote lines', () => {
    const footnotes = [
      '1 Smith v Jones [2019] ZASCA 42.',
      '2 ibid para 12.',
      '3 See Constitution s 9.',
    ].join('\n');
    const report = analyzeLegalCitationDraft(emptyInputs({ footnotesText: footnotes }));
    expect(report.parsingConfidence).toBe('medium');
  });

  it('returns parsingConfidence high for 6 or more detected footnote lines', () => {
    const footnotes = [
      '1 Smith v Jones [2019] ZASCA 42.',
      '2 ibid para 12.',
      '3 See Constitution s 9.',
      '4 Jones v Brown [2020] BCLR 1.',
      '5 ibid para 5.',
      '6 See SASA and the exemption regulations.',
    ].join('\n');
    const report = analyzeLegalCitationDraft(emptyInputs({ footnotesText: footnotes }));
    expect(report.parsingConfidence).toBe('high');
  });

  it('flags placeholder text in footnotes', () => {
    const report = analyzeLegalCitationDraft(emptyInputs({
      footnotesText: '1 Smith v Jones page? insert source.',
    }));
    const hasPlaceholder = report.footnoteIssues.some((item) => item.title === 'Placeholder detected');
    expect(hasPlaceholder).toBe(true);
  });

  it('flags a very short citation line — content under 12 chars after stripping the number prefix', () => {
    // '1 ibid at 5.' → strips '1 ' → content 'ibid at 5.' = 10 chars < 12
    const report = analyzeLegalCitationDraft(emptyInputs({
      footnotesText: '1 ibid at 5.',
    }));
    const hasShort = report.footnoteIssues.some((item) => item.title === 'Very short citation line');
    expect(hasShort).toBe(true);
  });

  it('does not flag placeholder or possible-issue severity for a clean well-formed citation', () => {
    const report = analyzeLegalCitationDraft(emptyInputs({
      footnotesText: '1 Smith v Jones [2019] ZASCA 42 para 15.',
    }));
    const hasProblem = report.footnoteIssues.some(
      (item) => item.severity === 'possible issue' || item.title === 'Placeholder detected',
    );
    expect(hasProblem).toBe(false);
  });

  it('surfaces no separate bibliography issue when bibliographyText is empty', () => {
    const report = analyzeLegalCitationDraft(emptyInputs({
      footnotesText: '1 Smith v Jones [2019] ZASCA 42 para 15.',
    }));
    const hasMissing = report.bibliographyIssues.some((item) => item.title === 'No separate bibliography detected');
    expect(hasMissing).toBe(true);
  });

  it('detects duplicate bibliography entries after normalisation', () => {
    const bib = [
      'Smith J Legal Writing (2020) Cape Town.',
      'Smith J Legal Writing (2020) Cape Town.',
    ].join('\n');
    const report = analyzeLegalCitationDraft(emptyInputs({ bibliographyText: bib }));
    const hasDuplicate = report.bibliographyIssues.some((item) => item.title === 'Duplicate bibliography entry');
    expect(hasDuplicate).toBe(true);
  });

  it('flags missing year on a bibliography entry without a year', () => {
    const report = analyzeLegalCitationDraft(emptyInputs({
      bibliographyText: 'Jones, A Constitutional Law Cape Town.',
    }));
    const hasNoYear = report.bibliographyIssues.some((item) => item.title === 'No year detected');
    expect(hasNoYear).toBe(true);
  });

  it('flags placeholder in bibliography', () => {
    const report = analyzeLegalCitationDraft(emptyInputs({
      bibliographyText: 'Smith J Legal Writing (2020) insert source.',
    }));
    const hasPlaceholder = report.bibliographyIssues.some((item) => item.title === 'Placeholder detected');
    expect(hasPlaceholder).toBe(true);
  });

  it('adds source pack summary note when sourcePackText is empty', () => {
    const report = analyzeLegalCitationDraft(emptyInputs());
    const hasNote = report.summaryNotes.some((note) => note.includes('Source-support review'));
    expect(hasNote).toBe(true);
  });

  it('omits source pack summary note when sourcePackText is provided', () => {
    const report = analyzeLegalCitationDraft(emptyInputs({ sourcePackText: 'Some source material here.' }));
    const hasNote = report.summaryNotes.some((note) => note.includes('Source-support review'));
    expect(hasNote).toBe(false);
  });

  it('includes a non-empty finalFixChecklist', () => {
    const report = analyzeLegalCitationDraft(emptyInputs());
    expect(report.finalFixChecklist.length).toBeGreaterThan(0);
  });

  it('adds a source pack prompt to finalFixChecklist when sourcePackText is absent', () => {
    const report = analyzeLegalCitationDraft(emptyInputs());
    const hasPrompt = report.finalFixChecklist.some((item) => item.includes('source pack'));
    expect(hasPrompt).toBe(true);
  });

  it('produces an overallStatus string mentioning item count when issues with severity above not-enough-information exist', () => {
    const report = analyzeLegalCitationDraft(emptyInputs({
      footnotesText: '1 Smith v Jones page? insert source.',
    }));
    expect(report.overallStatus).toMatch(/item/i);
  });

  it('produces a clean overallStatus when all issues are informational only', () => {
    // Empty inputs → no footnotes / no bibliography → all issues are 'not enough information'
    // totalHighAttention is 0 → clean status message
    const report = analyzeLegalCitationDraft(emptyInputs());
    expect(report.overallStatus).toMatch(/no obvious/i);
  });

  it('builds a guide checklist from pasted guide rules containing recognised rule keywords', () => {
    const guideRulesText = [
      'You must use relevant and sufficient authority for every claim.',
      'Remember that the bibliography must be complete and consistent.',
      'References should follow numbered paragraphs and be clear.',
    ].join('\n');
    const report = analyzeLegalCitationDraft(emptyInputs({ guideRulesText }));
    expect(report.guideChecklist.length).toBeGreaterThan(0);
    expect(report.guideChecklist[0].section).toBe('guide-checklist');
    expect(report.guideChecklist[0].severity).toBe('needs review');
  });

  it('falls back to draftText for footnote detection when footnotesText is empty', () => {
    // draftText contains a case citation so footnotes should be detected from it
    const report = analyzeLegalCitationDraft(emptyInputs({
      draftText: '1 Smith v Jones [2019] ZASCA 42 para 15.',
      footnotesText: '',
    }));
    expect(report.parsingConfidence).not.toBe('none');
  });

  it('handles mixed legal writing with body text, footnotes, and bibliography without throwing', () => {
    const inputs: LegalVerifierInputs = {
      draftText: 'The rights in s 9 of the Constitution are fundamental.',
      footnotesText: [
        '1 Minister of Home Affairs v NICRO [2004] ZACC 10.',
        '2 ibid para 30.',
        '3 See Constitution s 9.',
        '4 Khosa v Minister of Social Development [2004] ZACC 11.',
        '5 ibid para 29.',
        '6 See SASA and the exemption regulations.',
      ].join('\n'),
      bibliographyText: [
        'Minister of Home Affairs v NICRO [2004] ZACC 10.',
        'Khosa, M Constitutional Law (2019) Johannesburg.',
      ].join('\n'),
      sourcePackText: '',
      guideRulesText: 'References must be complete and consistent.',
      rubricText: '',
    };
    expect(() => analyzeLegalCitationDraft(inputs)).not.toThrow();
    const report = analyzeLegalCitationDraft(inputs);
    expect(report.parsingConfidence).toBe('high');
    expect(Array.isArray(report.footnoteIssues)).toBe(true);
    expect(Array.isArray(report.bibliographyIssues)).toBe(true);
    expect(Array.isArray(report.missingBibliographyItems)).toBe(true);
    expect(Array.isArray(report.uncitedBibliographyItems)).toBe(true);
  });

  it('issue ids follow the section-idSuffix pattern', () => {
    const report = analyzeLegalCitationDraft(emptyInputs({
      footnotesText: '1 Smith v Jones page? insert source.',
    }));
    const placeholderIssue = report.footnoteIssues.find((item) => item.title === 'Placeholder detected');
    expect(placeholderIssue?.id).toMatch(/^footnotes-/);
    expect(placeholderIssue?.section).toBe('footnotes');
  });
});

describe('formatLegalVerifierReport', () => {
  it('starts with the report heading', () => {
    const report = analyzeLegalCitationDraft(emptyInputs());
    const formatted = formatLegalVerifierReport(report);
    expect(formatted).toMatch(/^# Legal Source & Citation Review Report/);
  });

  it('includes the overall status line', () => {
    const report = analyzeLegalCitationDraft(emptyInputs());
    const formatted = formatLegalVerifierReport(report);
    expect(formatted).toContain(report.overallStatus);
  });

  it('includes all expected section headings', () => {
    const report = analyzeLegalCitationDraft(emptyInputs());
    const formatted = formatLegalVerifierReport(report);
    expect(formatted).toContain('## Footnote issues');
    expect(formatted).toContain('## Bibliography issues');
    expect(formatted).toContain('## Final fix checklist');
  });

  it('renders no-obvious-items message for empty issue arrays', () => {
    const report = analyzeLegalCitationDraft(emptyInputs());
    const formatted = formatLegalVerifierReport(report);
    // missingBibliographyItems and uncitedBibliographyItems are empty for zero-input
    expect(formatted).toContain('No obvious items flagged by the deterministic checker');
  });

  it('renders issue severity and title in the expected format', () => {
    const report = analyzeLegalCitationDraft(emptyInputs({
      footnotesText: '1 Smith v Jones page? insert source.',
    }));
    const formatted = formatLegalVerifierReport(report);
    expect(formatted).toMatch(/\[needs review\].*Placeholder detected/);
  });

  it('includes line label in parentheses when present', () => {
    const report = analyzeLegalCitationDraft(emptyInputs({
      footnotesText: '1 Smith v Jones page? insert source.',
    }));
    const formatted = formatLegalVerifierReport(report);
    expect(formatted).toContain('(Footnote line 1)');
  });

  it('includes the AI-ready prompt section when a prompt is provided', () => {
    const report = analyzeLegalCitationDraft(emptyInputs());
    const prompt = 'Test prompt content here.';
    const formatted = formatLegalVerifierReport(report, prompt);
    expect(formatted).toContain('## AI-ready review prompt');
    expect(formatted).toContain(prompt);
  });

  it('omits the AI-ready prompt section when no prompt is provided', () => {
    const report = analyzeLegalCitationDraft(emptyInputs());
    const formatted = formatLegalVerifierReport(report);
    expect(formatted).not.toContain('## AI-ready review prompt');
  });

  it('includes parsing confidence in the output', () => {
    const report = analyzeLegalCitationDraft(emptyInputs());
    const formatted = formatLegalVerifierReport(report);
    expect(formatted).toContain(`Parsing confidence: ${report.parsingConfidence}`);
  });
});

describe('generateAiReviewPrompt', () => {
  it('includes the draft text in the prompt', () => {
    const inputs = emptyInputs({ draftText: 'My legal opinion here.' });
    const report = analyzeLegalCitationDraft(inputs);
    const prompt = generateAiReviewPrompt(inputs, report);
    expect(prompt).toContain('My legal opinion here.');
  });

  it('shows [Not provided] placeholders for empty optional fields', () => {
    const inputs = emptyInputs();
    const report = analyzeLegalCitationDraft(inputs);
    const prompt = generateAiReviewPrompt(inputs, report);
    expect(prompt).toContain('[Not provided]');
  });

  it('includes cautious mark band note when rubric is provided', () => {
    const inputs = emptyInputs({ rubricText: 'Criterion A: 20 marks.' });
    const report = analyzeLegalCitationDraft(inputs);
    const prompt = generateAiReviewPrompt(inputs, report);
    expect(prompt).toContain('estimate a mark band cautiously');
  });

  it('suppresses mark band estimation when rubric is absent', () => {
    const inputs = emptyInputs();
    const report = analyzeLegalCitationDraft(inputs);
    const prompt = generateAiReviewPrompt(inputs, report);
    expect(prompt).toContain('Do not estimate a mark band');
  });

  it('includes the overall status from the report', () => {
    const inputs = emptyInputs();
    const report = analyzeLegalCitationDraft(inputs);
    const prompt = generateAiReviewPrompt(inputs, report);
    expect(prompt).toContain(report.overallStatus);
  });

  it('includes the bibliography text when provided', () => {
    const inputs = emptyInputs({ bibliographyText: 'Smith J Legal Writing (2020) Cape Town.' });
    const report = analyzeLegalCitationDraft(inputs);
    const prompt = generateAiReviewPrompt(inputs, report);
    expect(prompt).toContain('Smith J Legal Writing (2020) Cape Town.');
  });
});
