export type LegalVerifierSeverity = 'possible issue' | 'needs review' | 'not enough information';

export type LegalVerifierSection =
  | 'footnotes'
  | 'bibliography'
  | 'missing-bibliography'
  | 'uncited-bibliography'
  | 'guide-checklist'
  | 'fix-checklist';

export interface LegalVerifierIssue {
  id: string;
  section: LegalVerifierSection;
  severity: LegalVerifierSeverity;
  title: string;
  detail: string;
  lineLabel?: string;
}

export interface LegalVerifierInputs {
  draftText: string;
  footnotesText: string;
  bibliographyText: string;
  guideRulesText: string;
}

export interface LegalVerifierReport {
  overallStatus: string;
  footnoteIssues: LegalVerifierIssue[];
  bibliographyIssues: LegalVerifierIssue[];
  missingBibliographyItems: LegalVerifierIssue[];
  uncitedBibliographyItems: LegalVerifierIssue[];
  guideChecklist: LegalVerifierIssue[];
  finalFixChecklist: string[];
}

const PLACEHOLDER_PATTERN = /\b(insert source|page\?|ibid\?|n\.d\.|tbc|todo|xx|citation needed)\b/i;
const YEAR_PATTERN = /\b(19|20)\d{2}\b/;

function normalizeLine(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeAuthorYear(value: string) {
  const normalized = normalizeLine(value);
  const yearMatch = normalized.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch?.[0] ?? '';
  const author = normalized
    .split(' ')
    .filter(Boolean)
    .find((token) => token.length > 2 && token !== year);
  return `${author ?? ''}:${year}`;
}

function splitNonEmptyLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function detectFootnoteLikeLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((raw, index) => ({ raw, index: index + 1, value: raw.trim() }))
    .filter(({ value }) => /^(\[?\d+[\].)]|\d+\s)/.test(value) || /\bibid\b/i.test(value));
}

export function detectBibliographyLikeLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((raw, index) => ({ raw, index: index + 1, value: raw.trim() }))
    .filter(({ value }) => value.length > 8 && (YEAR_PATTERN.test(value) || /[A-Z][a-z]+,\s*[A-Z]/.test(value)));
}

function makeIssue(
  section: LegalVerifierSection,
  severity: LegalVerifierSeverity,
  title: string,
  detail: string,
  idSuffix: string,
  lineLabel?: string,
): LegalVerifierIssue {
  return {
    id: `${section}-${idSuffix}`,
    section,
    severity,
    title,
    detail,
    lineLabel,
  };
}

function getFootnoteIssues(footnoteLines: ReturnType<typeof detectFootnoteLikeLines>) {
  const issues: LegalVerifierIssue[] = [];

  footnoteLines.forEach(({ value, index }) => {
    const content = value.replace(/^(\[?\d+[\].)]|\d+\s)/, '').trim();
    if (content.length < 6) {
      issues.push(
        makeIssue(
          'footnotes',
          'possible issue',
          'Very short footnote',
          'This footnote looks incomplete and may need an authority, page pinpoint, or fuller detail.',
          `short-${index}`,
          `Footnote line ${index}`,
        ),
      );
    }

    if (PLACEHOLDER_PATTERN.test(value)) {
      issues.push(
        makeIssue(
          'footnotes',
          'needs review',
          'Placeholder detected',
          'A placeholder such as “insert source”, “page?” or “n.d.” was detected in this footnote.',
          `placeholder-${index}`,
          `Footnote line ${index}`,
        ),
      );
    }

    if (!/[.;)]$/.test(value)) {
      issues.push(
        makeIssue(
          'footnotes',
          'not enough information',
          'Punctuation pattern may be inconsistent',
          'This footnote does not end with common punctuation. Review whether it matches your chosen footnote style.',
          `punctuation-${index}`,
          `Footnote line ${index}`,
        ),
      );
    }

    if (/^[\[\(]?\d+[\].)]\s+[a-z]/.test(value)) {
      issues.push(
        makeIssue(
          'footnotes',
          'not enough information',
          'Footnote starts with lowercase text',
          'This may be fine for some sources, but it can also signal inconsistent capitalisation.',
          `caps-${index}`,
          `Footnote line ${index}`,
        ),
      );
    }
  });

  if (footnoteLines.length === 0) {
    issues.push(
      makeIssue(
        'footnotes',
        'not enough information',
        'No separate footnotes detected',
        'Paste footnotes separately or include clear footnote-style lines to allow a stronger check.',
        'none',
      ),
    );
  }

  return issues;
}

function getBibliographyIssues(bibliographyLines: ReturnType<typeof detectBibliographyLikeLines>) {
  const issues: LegalVerifierIssue[] = [];
  const seen = new Map<string, number>();
  const endingWithPeriod = bibliographyLines.filter(({ value }) => value.endsWith('.')).length;

  bibliographyLines.forEach(({ value, index }) => {
    const normalized = normalizeLine(value);
    if (!normalized) return;

    if (PLACEHOLDER_PATTERN.test(value)) {
      issues.push(
        makeIssue(
          'bibliography',
          'needs review',
          'Placeholder detected',
          'A placeholder appears in this bibliography entry and should be replaced before submission.',
          `placeholder-${index}`,
          `Bibliography line ${index}`,
        ),
      );
    }

    if (!YEAR_PATTERN.test(value)) {
      issues.push(
        makeIssue(
          'bibliography',
          'not enough information',
          'No year detected',
          'This entry may be valid, but the checker could not detect a year. Review the entry manually.',
          `year-${index}`,
          `Bibliography line ${index}`,
        ),
      );
    }

    const count = seen.get(normalized) ?? 0;
    seen.set(normalized, count + 1);
    if (count >= 1) {
      issues.push(
        makeIssue(
          'bibliography',
          'possible issue',
          'Duplicate bibliography entry',
          'This entry appears more than once after normalisation.',
          `duplicate-${index}`,
          `Bibliography line ${index}`,
        ),
      );
    }
  });

  if (bibliographyLines.length > 1 && endingWithPeriod > 0 && endingWithPeriod < bibliographyLines.length) {
    issues.push(
      makeIssue(
        'bibliography',
        'not enough information',
        'Mixed ending punctuation detected',
        'Some bibliography entries end with a full stop and others do not. Review for consistency.',
        'mixed-endings',
      ),
    );
  }

  if (bibliographyLines.length === 0) {
    issues.push(
      makeIssue(
        'bibliography',
        'not enough information',
        'No separate bibliography detected',
        'Paste bibliography entries separately to allow duplicate and citation cross-checking.',
        'none',
      ),
    );
  }

  return issues;
}

function getCrossCheckIssues(
  footnoteLines: ReturnType<typeof detectFootnoteLikeLines>,
  bibliographyLines: ReturnType<typeof detectBibliographyLikeLines>,
) {
  const bibliographyKeys = new Set(
    bibliographyLines.map(({ value }) => normalizeAuthorYear(value)).filter((value) => value !== ':'),
  );
  const footnoteKeys = new Set(
    footnoteLines.map(({ value }) => normalizeAuthorYear(value)).filter((value) => value !== ':'),
  );

  const missingBibliographyItems: LegalVerifierIssue[] = [];
  const uncitedBibliographyItems: LegalVerifierIssue[] = [];

  footnoteLines.forEach(({ value, index }) => {
    const key = normalizeAuthorYear(value);
    if (!key || key === ':' || !key.split(':')[0]) return;
    if (!bibliographyKeys.has(key)) {
      missingBibliographyItems.push(
        makeIssue(
          'missing-bibliography',
          'possible issue',
          'Likely cited source missing from bibliography',
          'A likely author/year pattern appears in the footnotes but was not matched in the bibliography text.',
          `missing-${index}`,
          `Footnote line ${index}`,
        ),
      );
    }
  });

  bibliographyLines.forEach(({ value, index }) => {
    const key = normalizeAuthorYear(value);
    if (!key || key === ':' || !key.split(':')[0]) return;
    if (!footnoteKeys.has(key)) {
      uncitedBibliographyItems.push(
        makeIssue(
          'uncited-bibliography',
          'possible issue',
          'Bibliography entry may be uncited',
          'This bibliography entry was not matched to a likely footnote pattern. Check whether it is cited in the draft.',
          `uncited-${index}`,
          `Bibliography line ${index}`,
        ),
      );
    }
  });

  return { missingBibliographyItems, uncitedBibliographyItems };
}

function buildGuideChecklist(guideRulesText: string) {
  const lines = splitNonEmptyLines(guideRulesText).slice(0, 12);
  if (lines.length === 0) return [];
  return lines.map((line, index) =>
    makeIssue(
      'guide-checklist',
      'needs review',
      `Guide rule ${index + 1}`,
      `Manual check required against pasted rule: ${line}`,
      `rule-${index + 1}`,
    ),
  );
}

function buildFinalChecklist(report: Omit<LegalVerifierReport, 'finalFixChecklist' | 'overallStatus'>) {
  const checklist = [
    'Review every item marked “needs review” before final submission.',
    'Replace placeholders like “insert source”, “page?” and “n.d.” with final citation details.',
    'Check that every cited source appears in the bibliography and every bibliography entry is actually cited.',
    'Confirm punctuation and capitalisation patterns are consistent across footnotes and bibliography entries.',
  ];

  if (report.guideChecklist.length > 0) {
    checklist.push('Work through the pasted Writing Guide rules one by one before exporting your final version.');
  }

  return checklist;
}

export function analyzeLegalCitationDraft(inputs: LegalVerifierInputs): LegalVerifierReport {
  const fallbackFootnotes = inputs.footnotesText.trim() || inputs.draftText;
  const fallbackBibliography = inputs.bibliographyText.trim();

  const footnoteLines = detectFootnoteLikeLines(fallbackFootnotes);
  const bibliographyLines = detectBibliographyLikeLines(fallbackBibliography);

  const footnoteIssues = getFootnoteIssues(footnoteLines);
  const bibliographyIssues = getBibliographyIssues(bibliographyLines);
  const { missingBibliographyItems, uncitedBibliographyItems } = getCrossCheckIssues(footnoteLines, bibliographyLines);
  const guideChecklist = buildGuideChecklist(inputs.guideRulesText);

  const totalHighAttention =
    footnoteIssues.filter((item) => item.severity !== 'not enough information').length +
    bibliographyIssues.filter((item) => item.severity !== 'not enough information').length +
    missingBibliographyItems.length +
    uncitedBibliographyItems.length;

  const overallStatus =
    totalHighAttention === 0
      ? 'No obvious deterministic citation problems were detected. Manual legal style review is still recommended.'
      : `${totalHighAttention} item${totalHighAttention === 1 ? '' : 's'} need review before submission.`;

  const reportWithoutChecklist = {
    footnoteIssues,
    bibliographyIssues,
    missingBibliographyItems,
    uncitedBibliographyItems,
    guideChecklist,
  };

  return {
    overallStatus,
    ...reportWithoutChecklist,
    finalFixChecklist: buildFinalChecklist(reportWithoutChecklist),
  };
}

export function formatLegalVerifierReport(report: LegalVerifierReport) {
  const renderIssues = (title: string, issues: LegalVerifierIssue[]) => {
    if (issues.length === 0) return `## ${title}\n- No obvious items flagged by the deterministic checker.\n`;
    return [
      `## ${title}`,
      ...issues.map((issue) => {
        const line = issue.lineLabel ? ` (${issue.lineLabel})` : '';
        return `- [${issue.severity}] ${issue.title}${line}: ${issue.detail}`;
      }),
      '',
    ].join('\n');
  };

  return [
    '# Legal Citation Checker Report',
    '',
    '## Overall status',
    `- ${report.overallStatus}`,
    '',
    renderIssues('Footnote issues', report.footnoteIssues),
    renderIssues('Bibliography issues', report.bibliographyIssues),
    renderIssues('Possible missing bibliography items', report.missingBibliographyItems),
    renderIssues('Possible uncited bibliography items', report.uncitedBibliographyItems),
    renderIssues('Writing Guide checklist', report.guideChecklist),
    '## Final fix checklist',
    ...report.finalFixChecklist.map((item) => `- ${item}`),
    '',
  ].join('\n');
}
