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
  sourcePackText: string;
  guideRulesText: string;
  rubricText: string;
}

export interface LegalVerifierReport {
  overallStatus: string;
  footnoteIssues: LegalVerifierIssue[];
  bibliographyIssues: LegalVerifierIssue[];
  missingBibliographyItems: LegalVerifierIssue[];
  uncitedBibliographyItems: LegalVerifierIssue[];
  guideChecklist: LegalVerifierIssue[];
  finalFixChecklist: string[];
  parsingConfidence: 'none' | 'low' | 'medium' | 'high';
  summaryNotes: string[];
}

const PLACEHOLDER_PATTERN = /\b(insert source|page\?|ibid\?|n\.d\.|tbc|todo|xx|citation needed)\b/i;
const YEAR_PATTERN = /\b(19|20)\d{2}\b/;
const RULE_KEYWORD_PATTERN =
  /\b(must|should|remember|references?|authority|conclusion|recommendation|structure|relevant and sufficient authority|mistakes of law|plain and understandable language|logical manner|numbered paragraphs?|clear and unambiguous|no new points in conclusion|bibliography|complete|consistent)\b/i;
const FOOTNOTE_SIGNAL_PATTERN =
  /(^(\[?\d+[\].)]|\d+\s))|\b(ibid|para|paras|reg|regs|art|arts|gn|gg|bclr|constitution|sasa|exemption regulations)\b|<https?:\/\/[^>]+>|\b[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,6}\s+v\s+[A-Z][A-Za-z]+/i;
const LEGAL_SOURCE_PATTERN =
  /^(s|ss|reg|regs|art|arts|gn|gg)\b|constitution\b|sasa\b|exemption regulations\b|\bsa\b|\bsca\b|\bcc\b|\bbclr\b|“[^”]+”|"[^"]+"/i;

function normalizeLine(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeAuthorYear(value: string) {
  const normalized = normalizeLine(value);
  const yearMatch = normalized.match(YEAR_PATTERN);
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

function cleanGuideLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return null;
  if (/^back to contents$/i.test(trimmed)) return null;
  if (/^\d+$/.test(trimmed)) return null;
  if (/^\[?\d+\]?$/.test(trimmed)) return null;
  if (/^(chapter|section|part)\s+[a-z0-9]+$/i.test(trimmed)) return null;
  if (trimmed.length < 12) return null;
  if (!RULE_KEYWORD_PATTERN.test(trimmed)) return null;
  return trimmed.replace(/\s+/g, ' ');
}

export function detectFootnoteLikeLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((raw, index) => ({ raw, index: index + 1, value: raw.trim() }))
    .filter(({ value }) => {
      if (!value || value.length < 8) return false;
      return FOOTNOTE_SIGNAL_PATTERN.test(value) || LEGAL_SOURCE_PATTERN.test(value);
    });
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

function getParsingConfidence(footnoteLines: ReturnType<typeof detectFootnoteLikeLines>) {
  if (footnoteLines.length === 0) return 'none';
  if (footnoteLines.length < 3) return 'low';
  if (footnoteLines.length < 6) return 'medium';
  return 'high';
}

function getFootnoteIssues(footnoteLines: ReturnType<typeof detectFootnoteLikeLines>, confidence: LegalVerifierReport['parsingConfidence']) {
  const issues: LegalVerifierIssue[] = [];

  footnoteLines.forEach(({ value, index }) => {
    const content = value.replace(/^(\[?\d+[\].)]|\d+\s)/, '').trim();
    if (content.length < 12) {
      issues.push(
        makeIssue(
          'footnotes',
          'possible issue',
          'Very short citation line',
          'This citation line looks incomplete and may need an authority, page pinpoint, or fuller detail.',
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
          'A placeholder such as “insert source”, “page?” or “n.d.” was detected in this citation line.',
          `placeholder-${index}`,
          `Footnote line ${index}`,
        ),
      );
    }

    if (!/[.;)]$/.test(value) && value.length > 18) {
      issues.push(
        makeIssue(
          'footnotes',
          'not enough information',
          'Punctuation pattern may be inconsistent',
          'This citation line does not end with common punctuation. Review whether it matches your chosen legal citation style.',
          `punctuation-${index}`,
          `Footnote line ${index}`,
        ),
      );
    }

    if (/^[a-z]/.test(content)) {
      issues.push(
        makeIssue(
          'footnotes',
          'not enough information',
          'Citation line starts with lowercase text',
          'This may be acceptable, but it can also signal inconsistent capitalisation in the footnote style.',
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
        'No footnotes were confidently detected',
        'No footnotes were detected in a confident pattern. If you pasted unnumbered footnotes, check formatting or use the AI-ready source-review prompt.',
        'none',
      ),
    );
  } else if (confidence === 'low') {
    issues.push(
      makeIssue(
        'footnotes',
        'not enough information',
        'Footnote parsing confidence is low',
        'Some likely footnote lines were detected. Review the results manually because legal citation formats vary.',
        'low-confidence',
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
  confidence: LegalVerifierReport['parsingConfidence'],
) {
  const bibliographyKeys = new Set(
    bibliographyLines.map(({ value }) => normalizeAuthorYear(value)).filter((value) => value !== ':'),
  );
  const footnoteKeys = new Set(
    footnoteLines.map(({ value }) => normalizeAuthorYear(value)).filter((value) => value !== ':'),
  );

  const missingBibliographyItems: LegalVerifierIssue[] = [];
  const uncitedBibliographyItems: LegalVerifierIssue[] = [];
  const notes: string[] = [];

  if (confidence === 'none' || confidence === 'low') {
    if (bibliographyLines.length > 0) {
      notes.push('Bibliography-to-footnote matching is uncertain because footnotes could not be confidently parsed.');
    }
    return { missingBibliographyItems, uncitedBibliographyItems, notes };
  }

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

  return { missingBibliographyItems, uncitedBibliographyItems, notes };
}

function buildGuideChecklist(guideRulesText: string) {
  const lines = splitNonEmptyLines(guideRulesText)
    .map(cleanGuideLine)
    .filter((value): value is string => Boolean(value));

  const deduped = [...new Set(lines)].slice(0, 16);
  return deduped.map((line, index) =>
    makeIssue(
      'guide-checklist',
      'needs review',
      `Guide rule ${index + 1}`,
      `Manual check required against pasted rule: ${line}`,
      `rule-${index + 1}`,
    ),
  );
}

function buildFinalChecklist(
  report: Omit<LegalVerifierReport, 'finalFixChecklist' | 'overallStatus' | 'parsingConfidence' | 'summaryNotes'>,
  inputs: LegalVerifierInputs,
) {
  const checklist = [
    'Review every item marked “needs review” before final submission.',
    'Replace placeholders like “insert source”, “page?” and “n.d.” with final citation details.',
    'Check that every cited source appears in the bibliography and every bibliography entry is actually cited.',
    'Confirm punctuation and capitalisation patterns are consistent across footnotes and bibliography entries.',
  ];

  if (!inputs.sourcePackText.trim()) {
    checklist.push('If you want source-support verification later, paste the actual prescribed source extracts into the source pack box.');
  }

  if (!inputs.rubricText.trim()) {
    checklist.push('Add the rubric only if you want an external AI tool to estimate a mark band later.');
  }

  if (report.guideChecklist.length > 0) {
    checklist.push('Work through the pasted Writing Guide rules one by one before exporting or copying your final review pack.');
  }

  return checklist;
}

export function analyzeLegalCitationDraft(inputs: LegalVerifierInputs): LegalVerifierReport {
  const fallbackFootnotes = inputs.footnotesText.trim() || inputs.draftText;
  const fallbackBibliography = inputs.bibliographyText.trim();

  const footnoteLines = detectFootnoteLikeLines(fallbackFootnotes);
  const bibliographyLines = detectBibliographyLikeLines(fallbackBibliography);
  const parsingConfidence = getParsingConfidence(footnoteLines);

  const footnoteIssues = getFootnoteIssues(footnoteLines, parsingConfidence);
  const bibliographyIssues = getBibliographyIssues(bibliographyLines);
  const { missingBibliographyItems, uncitedBibliographyItems, notes } = getCrossCheckIssues(
    footnoteLines,
    bibliographyLines,
    parsingConfidence,
  );
  const guideChecklist = buildGuideChecklist(inputs.guideRulesText);

  const summaryNotes = [...notes];
  if (parsingConfidence === 'low') {
    summaryNotes.push('Some likely footnote lines were detected. Review the results manually because legal citation formats vary.');
  }
  if (!inputs.sourcePackText.trim()) {
    summaryNotes.push('Source-support review will be limited until actual prescribed source text or extracts are pasted into the source pack.');
  }

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
    parsingConfidence,
    summaryNotes,
    finalFixChecklist: buildFinalChecklist(reportWithoutChecklist, inputs),
  };
}

export function generateAiReviewPrompt(inputs: LegalVerifierInputs, report: LegalVerifierReport) {
  const rubricNote = inputs.rubricText.trim()
    ? 'If the rubric is detailed enough, estimate a mark band cautiously and explain why.'
    : 'Do not estimate a mark band unless the user later provides a rubric.';

  return [
    'You are acting as a strict South African law tutor, legal writing marker, and source-verification assistant.',
    '',
    'Use only the material pasted below.',
    '- Mark and verify only against the provided sources.',
    '- Never invent cases, statutes, authors, page numbers, pinpoints, journal details, or bibliography entries.',
    '- If support is missing, say exactly: "Not verifiable from provided sources".',
    '- Separate confirmed errors, likely issues, needs manual check, and not verifiable items.',
    '- Distinguish citation-format issues from source-support issues.',
    '- Check whether each footnote supports the sentence or paragraph it is attached to.',
    '- Check bibliography completeness and consistency.',
    '- Check Writing Guide compliance only against the pasted guide rules.',
    '- Assess legal opinion structure where applicable.',
    '- Check whether the conclusion introduces new points.',
    '- Check whether recommendations flow from the analysis.',
    '- Provide a final fix checklist.',
    '',
    'Output structure:',
    'A. Overall submission verdict',
    '- Ready to submit / minor fixes / major fixes / high risk',
    `- ${rubricNote}`,
    '- Top 5 urgent fixes',
    '',
    'B. Legal opinion structure',
    '- Introduction',
    '- Statement of facts and assumptions',
    '- Questions presented',
    '- Applicable law',
    '- Application',
    '- Conclusion and recommendations',
    '- Whether the conclusion introduces new points',
    '- Whether recommendations flow from the analysis',
    '',
    'C. Source support audit',
    'For each major legal claim:',
    '- Identify the claim',
    '- Identify the supporting citation or source',
    '- Say supported / partly supported / unsupported / not verifiable',
    '- Give exact fix suggestions',
    '',
    'D. Footnote audit',
    'For each footnote:',
    '- Check whether it supports the relevant sentence or paragraph',
    '- Check format against pasted guide rules',
    '- Check completeness',
    '- Flag missing pinpoints',
    '- Flag vague authority',
    '',
    'E. Bibliography audit',
    '- Missing sources',
    '- Uncited sources',
    '- Duplicate entries',
    '- Incorrect grouping',
    '- Incomplete entries',
    '- Consistency problems',
    '',
    'F. Writing Guide compliance',
    'Use only the pasted guide rules.',
    'Check legal opinion structure, clarity, authority support, mistakes of law, conclusion/recommendations, and bibliography grouping/completeness.',
    '',
    'G. Final fix checklist',
    'Give exact changes before submission.',
    '',
    'Local deterministic checker context:',
    `- Overall status: ${report.overallStatus}`,
    `- Parsing confidence: ${report.parsingConfidence}`,
    ...report.summaryNotes.map((note) => `- Note: ${note}`),
    '',
    'User content follows.',
    '',
    'FINAL ASSIGNMENT / LEGAL OPINION',
    inputs.draftText.trim() || '[Not provided]',
    '',
    'FOOTNOTES',
    inputs.footnotesText.trim() || '[Not provided separately]',
    '',
    'BIBLIOGRAPHY',
    inputs.bibliographyText.trim() || '[Not provided]',
    '',
    'SOURCE PACK / PRESCRIBED MATERIALS',
    inputs.sourcePackText.trim() || '[Not provided]',
    '',
    'FACULTY / WRITING GUIDE RULES',
    inputs.guideRulesText.trim() || '[Not provided]',
    '',
    'RUBRIC / MARKING CRITERIA',
    inputs.rubricText.trim() || '[Not provided]',
    '',
  ].join('\n');
}

export function formatLegalVerifierReport(report: LegalVerifierReport, generatedPrompt?: string) {
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
    '# Legal Source & Citation Review Report',
    '',
    '## Overall status',
    `- ${report.overallStatus}`,
    `- Parsing confidence: ${report.parsingConfidence}`,
    ...report.summaryNotes.map((note) => `- ${note}`),
    '',
    renderIssues('Footnote issues', report.footnoteIssues),
    renderIssues('Bibliography issues', report.bibliographyIssues),
    renderIssues('Possible missing bibliography items', report.missingBibliographyItems),
    renderIssues('Possible uncited bibliography items', report.uncitedBibliographyItems),
    renderIssues('Writing Guide checklist', report.guideChecklist),
    '## Final fix checklist',
    ...report.finalFixChecklist.map((item) => `- ${item}`),
    '',
    ...(generatedPrompt
      ? ['## AI-ready review prompt', '', '```text', generatedPrompt, '```', '']
      : []),
  ].join('\n');
}
