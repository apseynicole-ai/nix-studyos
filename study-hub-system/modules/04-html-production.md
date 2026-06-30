# Module 04 — HTML Production

## Purpose

Build the first complete HTML version of the study hub (v0.8) from the approved build brief. This module produces a working, navigable, print-aware HTML file. It is never the final version. The output of this module goes immediately to Module 06 QA Audit.

---

## Inputs

- `00_intake/build-brief.md` (approved)
- `01_sources/source-audit.md`
- All Tier 1 and Tier 2 processed sources in `01_sources/processed/`
- HTML specification (see `specs/html-spec.md`)
- CSS/print specification (see `specs/print-spec.md`)
- Style guide (see `specs/style-guide.md`)

---

## Outputs

- `02_builds/[MODULE_CODE]_S[N]_v0_8_MasterStudyHub.html`

---

## Rules

1. Follow the build brief exactly. Do not add sections not in the brief.
2. Base all content on Tier 1 and Tier 2 sources only.
3. If a source is ambiguous, write the content conservatively and flag it with an HTML comment: `<!-- NEEDS REVIEW: [reason] -->`.
4. Do not invent academic content.
5. Do not use AI-generated content as a primary source.
6. Include print CSS from the start — do not add it later as a patch.
7. Use unique IDs for every section and anchor. No duplicate IDs.
8. The output must be a single self-contained HTML file.
9. Name the output file exactly as specified in the build brief.
10. Do not overwrite any existing file. If the target filename already exists, stop and report.

---

## HTML Architecture (all module types)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[MODULE_CODE] [Full Name] — Study Hub [Semester] [Year]</title>
  <style>
    /* === SCREEN STYLES === */
    /* === PRINT STYLES (@media print) === */
  </style>
</head>
<body>
  <!-- HEADER: module title, version, semester -->
  <!-- SIDEBAR: navigation links to all major sections -->
  <!-- MAIN CONTENT: all topic sections -->
  <!-- FOOTER: version watermark, print date -->
</body>
</html>
```

---

## Content Structure by Section Type

### Module Overview Section
- Module title, code, semester, year
- Learning outcomes list
- Assessment overview table (weight, due date, format)
- Exam scope summary (or "Scope TBC" if unknown)
- How to use this hub

### Topic Section (Law)
```
[Topic Title]
├── Overview and context
├── Key doctrine / legal principle
├── Legal test (elements)
├── Key cases
│   └── [Case name]: facts → issue → ratio → application
├── Statutory provisions (if applicable)
├── Doctrine → test → application worked example
├── Exam traps and common mistakes
└── Quick revision summary
```

### Topic Section (Quantitative)
```
[Topic Title]
├── Overview and context
├── Key definitions
├── Formulas (clearly formatted, labelled)
├── Step-by-step method
├── Worked examples (2–3 minimum)
├── Graph or diagram (description or SVG if simple)
├── Interpretation rules
├── Common mistakes
└── Quick revision summary
```

### Quick Revision Section (all modules)
```
├── One-page summary per topic
├── Memory triggers
├── Exam traps
└── Final checklist
```

---

## CSS Requirements

The HTML must include all of the following at build time:

**Screen:**
- Sidebar navigation (fixed or sticky)
- Colour-coded topic sections (from build brief theme)
- Clean typography (readable body font, clear headings)
- Expand/collapse (if in feature list)
- Responsive layout (readable on laptop, not mobile-first)

**Print (`@media print`):**
- Hide sidebar and navigation controls
- A4 page size (`@page { size: A4; }`)
- Remove interactive elements
- Enable background colours and graphics
- Insert page breaks before major topics (`page-break-before: always`)
- Print footer with module code, version, and page number
- No orphaned headings
- Tables: readable without colour if possible (use borders)

---

## Version Watermark

Every HTML file must include a visible watermark in the print footer:

```
[MODULE_CODE] Study Hub | [Semester] [Year] | Version [X.X] | Generated [Date] | DRAFT — Not for Redistribution
```

Change to `APPROVED PRINT CANDIDATE` when file reaches v1.0.

---

## Quality Checks (pre-submission to Module 06)

- [ ] File opens in Chrome without errors
- [ ] Sidebar links all resolve
- [ ] No duplicate section IDs
- [ ] All topic sections present per build brief
- [ ] Flagged sections marked `<!-- NEEDS REVIEW -->`
- [ ] Print CSS present and tested (Chrome → Print Preview → A4)
- [ ] Version watermark in footer
- [ ] File named correctly
- [ ] No existing approved file overwritten

---

## Reusable Prompt — HTML Production

```
You are running Module 04 HTML Production for the Nix Study Hub Production System.

MODULE: [MODULE_CODE] — [Full Name], [Semester]
MODULE TYPE: [Law / Quantitative / Mixed]
OUTPUT FILE: [MODULE_CODE]_S[N]_v0_8_MasterStudyHub.html

BUILD BRIEF: [Paste build-brief.md or provide path]
SOURCES: [List Tier 1 and Tier 2 source files available]

TASK:
1. Build the complete HTML study hub using the build brief and sources.
2. Include all sections specified in the build brief. Do not add sections not in the brief.
3. Base all content on Tier 1 and Tier 2 sources only.
4. Mark uncertain content with <!-- NEEDS REVIEW: [reason] -->.
5. Include full print CSS (A4, background graphics, page breaks, print footer).
6. Use unique IDs throughout. No duplicate IDs.
7. Output a single self-contained HTML file.
8. Do not invent academic content.
9. Do not use AI-generated content as a primary source.
10. Before writing the file, confirm the target path does not already contain an approved version.

SAFETY:
- Do not overwrite any existing file.
- Do not delete, rename, or move any file.
- Do not stage, commit, or push changes.
- Do not clean any folder.

OUTPUT: [MODULE_CODE]_S[N]_v0_8_MasterStudyHub.html written to 02_builds/
```

---

## Common Failure Points

- Missing print CSS (causes print layout failures that require patching)
- Duplicate HTML IDs (breaks sidebar navigation)
- Sections missing from build despite being in the brief
- AI-generated content from a previous session accidentally used as a source
- File written to wrong folder or with wrong name
- Interactive features (collapse, tabs) breaking print layout
- Law doctrine presented without the legal test elements
- Formulas written as plain text instead of styled formula blocks

---

## Automation Opportunities

| Task | Automatable | Difficulty | Time Saved |
|------|-------------|------------|------------|
| Scaffold HTML from build brief automatically | Future | High | 30 min/module |
| Validate unique IDs post-build | Yes | Low | 5 min/module |
| Auto-check print CSS present | Yes | Low | 3 min/module |
| Generate sidebar links from section headings | Yes | Medium | 10 min/module |
| Insert version watermark automatically | Yes | Low | 2 min/module |
