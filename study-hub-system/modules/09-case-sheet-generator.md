# Module 09 — Case Sheet Generator

## Purpose

Produce individual law case reference pages — one case per page or two-page spread — for the law module binder. Case sheets allow fast case revision without hunting through the main study hub. This module applies to Law modules only.

---

## Inputs

- Module code, name, semester
- Complete case list (from source audit and build brief)
- Source documents for each case (Tier 1 — case documents, lecture slides, prescribed readings)
- Module colour theme

---

## Outputs

- `04_case_sheets/[MODULE_CODE]_S[N]_CaseSheets_Print.html`
- Single self-contained HTML file
- Cases in alphabetical order within each area of law

---

## Rules

1. Law modules only. Skip this module for Quantitative or Mixed modules unless explicitly instructed.
2. Every case on the build brief case list must appear.
3. Case summaries must be based on Tier 1 sources (case documents, lecture slides, prescribed readings).
4. Do not invent case details. If a source does not provide a fact, leave it blank rather than guess.
5. Case names must be written in the correct legal citation format.
6. Never describe a case as authority for a principle it does not actually establish.
7. Each case fits on one page (preferred) or a two-page spread maximum.
8. Cases are grouped by area of law, then sorted alphabetically within each group.
9. This file is printed separately from the main study hub.

---

## Case Sheet Structure

### One-Page Case Sheet Layout

```
┌─────────────────────────────────────────────────┐
│ [Case Name]                         [Year] [Court] │
│ [Full Citation]                                   │
│ Area of Law: [e.g. Contract — Consideration]      │
├──────────────────────┬────────────────────────────┤
│ FACTS                │ LEGAL ISSUE                │
│ [2–4 sentences]      │ [1–2 sentences]            │
├──────────────────────┴────────────────────────────┤
│ JUDGMENT                                          │
│ [Who won, brief outcome]                          │
├───────────────────────────────────────────────────┤
│ RATIO DECIDENDI                                   │
│ [The legal rule or principle established]         │
├───────────────────────────────────────────────────┤
│ KEY PRINCIPLE                                     │
│ [1–2 sentences — the exam-ready statement]        │
├──────────────────────┬────────────────────────────┤
│ EXAM USE             │ MEMORY TRIGGER             │
│ [How to use in       │ [Memorable hook or         │
│  essays/problems]    │  shorthand]                │
├──────────────────────┴────────────────────────────┤
│ RELATED CASES                                     │
│ [Case Name] — [Brief link]                        │
├───────────────────────────────────────────────────┤
│ KEY QUOTE (if applicable)                         │
│ "[Direct quote from judgment]" — [Judge], [Year]  │
└───────────────────────────────────────────────────┘
```

---

## Data Fields per Case

| Field | Required | Source | Notes |
|-------|----------|--------|-------|
| Case name | Yes | Case document | Use standard legal citation format |
| Full citation | Yes | Case document | Include court and year |
| Court | Yes | Case document | Full court name |
| Year | Yes | Case document | Decision year |
| Area of law | Yes | Lecture slides / module | e.g. "Contract — Consideration" |
| Facts | Yes | Case document / LS | 2–4 sentences, exam-relevant facts only |
| Legal issue | Yes | Case document / LS | The precise legal question decided |
| Judgment | Yes | Case document | Outcome and brief reasoning |
| Ratio decidendi | Yes | Case document / LS | The binding legal rule |
| Key principle | Yes | Lecture slides | Exam-ready statement of the principle |
| Exam use | Yes | LS / tutorial documents | How to use this case in a problem or essay |
| Memory trigger | Recommended | — | Original memory hook |
| Related cases | If available | LS | Cases that support, distinguish, or follow |
| Key quote | If available | Case document | Must be verbatim. Never paraphrase a quote. |

---

## FIRAC Approach Note

Where a lecturer has explicitly taught a case using FIRAC (Facts → Issue → Rule → Application → Conclusion), the case sheet should reflect that structure. Where FIRAC has not been explicitly taught, use the standard case sheet format above. Do not impose FIRAC on a case if it was not presented that way.

---

## Case Organisation

Cases are grouped in the following way:
1. By area of law (e.g. Contract, Tort, Constitutional)
2. Within each group, alphabetically by case name

Each group begins with a brief group header page:
```
Area of Law: [Name]
[Module code] | [Semester] | [Year]
[Number of cases in this group]
```

---

## HTML Architecture

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>[MODULE_CODE] Case Sheets — [Semester] [Year]</title>
  <style>
    @page { size: A4; margin: 15mm 20mm; }
    .case-sheet { page-break-after: always; min-height: 267mm; }
    .group-header { page-break-after: always; }
    @media print { /* ensure breaks, hide nav */ }
  </style>
</head>
<body>
  <!-- One .case-sheet div per case -->
  <!-- One .group-header div per area of law -->
</body>
</html>
```

---

## Quality Checks

- [ ] Every case on the build brief case list is present
- [ ] Case names in correct citation format
- [ ] No case details invented — blanks used where source does not provide information
- [ ] Ratio decidendi accurately stated per source
- [ ] Key principle is exam-appropriate (matches how the lecturer taught the case)
- [ ] Key quotes are verbatim
- [ ] Cases grouped by area of law, alphabetical within each group
- [ ] Each case fits on one page or two-page spread
- [ ] File named correctly and in correct folder
- [ ] Prints cleanly in Chrome

---

## Reusable Prompt — Case Sheet Generator

```
You are running Module 09 Case Sheet Generator for the Nix Study Hub Production System.

MODULE: [MODULE_CODE] — [Full Name], [Semester]
OUTPUT FILE: [MODULE_CODE]_S[N]_CaseSheets_Print.html

COLOUR THEME:
- Primary: [hex]
- Accent: [hex]

CASE LIST AND SOURCES:
[For each case, provide: case name, citation, court, year, area of law, and the source file that covers it]

AVAILABLE SOURCES (Tier 1):
[List relevant case documents and lecture slide files]

TASK:
1. Generate a complete case sheet for every case in the case list.
2. Base all content on Tier 1 sources only.
3. If a field is not provided by any source, leave it blank — do not invent.
4. Use correct legal citation format for all case names.
5. Never paraphrase a key quote — use verbatim quotes only or omit.
6. Group cases by area of law, then alphabetically within each group.
7. Each case fits on one A4 page (or two-page spread maximum).
8. Include group header pages between areas of law.
9. Apply the module colour theme.
10. Do not merge this file with the main study hub.

SAFETY:
- Do not overwrite any existing file.
- Do not stage, commit, or push.

OUTPUT: [MODULE_CODE]_S[N]_CaseSheets_Print.html written to 04_case_sheets/
```

---

## Common Failure Points

- Invented case facts when source material is thin (instead: leave blank and flag)
- Paraphrased quotes presented as verbatim (must be exactly as written in judgment)
- Cases missing from list because they appeared only in tutorial documents
- Ratio decidendi confused with obiter dicta
- Wrong area of law classification (causes binder organisation problems)
- File accidentally merged into main study hub

---

## Automation Opportunities

| Task | Automatable | Difficulty | Time Saved |
|------|-------------|------------|------------|
| Extract case list from lecture slides | Future | High | 20 min/module |
| Generate case sheet HTML from structured data | Yes | Medium | 30 min/module |
| Validate citation format | Partial | Medium | 10 min/module |
| Sort and group cases automatically | Yes | Low | 5 min/module |
| Cross-check case list against main hub | Future | Medium | 10 min/module |
