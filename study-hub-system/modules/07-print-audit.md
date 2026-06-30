# Module 07 — Print Audit

## Purpose

Verify that the study hub is genuinely ready for physical printing before a single page goes to the printer. The Print Audit is a separate and final check from the QA Audit (Module 06). It focuses entirely on the physical output: layout, page breaks, colour, margins, and binder readiness.

---

## Inputs

- HTML file to audit (must have passed Module 06 QA Audit with no P1 or P2 issues)
- Chrome browser (for print preview)
- Print manifest template

---

## Outputs

- `07_print/print-manifest.md` — confirmed print settings and page counts
- `07_print/[MODULE_CODE]_S[N]_[version]_PrintAuditReport.md`
- `07_print/[MODULE_CODE]_S[N]_[version]_PrintCandidate.pdf` (saved from Chrome print preview)

---

## Rules

1. Do not print until the Print Audit is passed.
2. Always save a PDF first and review it before printing.
3. Always print from Google Chrome.
4. Background graphics must be enabled in Chrome print settings.
5. Do not print from Firefox, Safari, or Edge — output is inconsistent.
6. If the PDF has layout problems, go back to Module 05 to patch before printing.
7. The cover sheets (Module 08) and case sheets (Module 09) are printed separately.

---

## Print Settings (Chrome Standard)

```
Paper size:     A4
Orientation:    Portrait
Margins:        Default (or as specified in CSS)
Scale:          100% (adjust only if content is cut off)
Background:     Graphics enabled ✓
Headers/footers: Disabled (footer is in the HTML itself)
Double-sided:   Yes (short edge binding)
Colour:         Full colour
```

---

## Print Audit Checklist

### Section 1 — PDF Pre-Check
- [ ] PDF saved from Chrome print preview (not printed yet)
- [ ] PDF opens correctly and all pages are present
- [ ] Page count noted in print manifest
- [ ] Every page has readable content (no blank pages except intentional ones)

### Section 2 — Page Break Check
- [ ] Major topic sections begin on a new page
- [ ] No heading appears at the bottom of a page without content below it
- [ ] No paragraph is cut between pages in a distracting way
- [ ] No table is cut halfway through a page (or is clearly continued on next page)
- [ ] Case summaries are not split awkwardly (law modules)
- [ ] Formula blocks are not split across pages (quantitative modules)

### Section 3 — Layout Check
- [ ] Content fits within A4 margins on all pages
- [ ] No text or boxes cut off at page edge
- [ ] Sidebar is hidden in print output
- [ ] Navigation controls, buttons, and interactive elements hidden
- [ ] Header and footer print correctly on every page
- [ ] Colour theme prints correctly (not washed out or invisible)

### Section 4 — Colour and Visual Check
- [ ] Section colours are distinct and print legibly
- [ ] Text is readable on coloured backgrounds
- [ ] Tables have visible borders in print
- [ ] Formula styling is legible in print
- [ ] Case name formatting is consistent and clear
- [ ] Headings are visually distinct from body text in print

### Section 5 — Footer and Watermark Check
- [ ] Version watermark present on every page
- [ ] Module code present in footer
- [ ] Version number present in footer
- [ ] "APPROVED PRINT CANDIDATE" label present (if v1.0)

### Section 6 — Binder Readiness Check
- [ ] Hole-punch margin adequate (left margin or right margin depending on binding)
- [ ] Content does not extend into hole-punch area
- [ ] Double-sided printing works (even/odd pages mirror correctly)
- [ ] Page count is reasonable for a binder (flag if over 150 pages per module)

---

## Print Manifest Format

```markdown
# Print Manifest

## Module: [MODULE_CODE] [Full Name]
## Semester: [Semester and Year]
## File Printed: [filename and version]
## Print Date: [Date]
## Printer: [Home / Print Shop]

## Print Settings
- Paper: A4 white
- Orientation: Portrait
- Scale: 100%
- Colour: Full colour
- Double-sided: Yes / No
- Background graphics: Enabled
- Total pages: [N]

## Section Page Map
| Section | Start Page | End Page | Pages |
|---------|-----------|----------|-------|
| Module Overview | | | |
| Topic 1: [Name] | | | |
| Topic 2: [Name] | | | |
| Case Hub | | | |
| Quick Revision | | | |
| **Total** | | | |

## Binder Assembly Order
1. Cover sheet for this module (from Module 08)
2. Module overview pages
3. Topic divider (Module 08) — Topic 1
4. Topic 1 pages
5. [Continue per topic]
6. Case sheets (Module 09, law only)
7. Formula reference (quantitative modules)
8. Practice questions / past papers

## Print Audit Result
- [ ] PASSED — Safe to print
- [ ] FAILED — Return to Module 05 for patching

## Notes
[Any special instructions for this print run]
```

---

## Reusable Prompt — Print Audit

```
You are running Module 07 Print Audit for the Nix Study Hub Production System.

MODULE: [MODULE_CODE] — [Full Name], [Semester]
FILE: [filename and version]

The user has opened this file in Chrome and saved a PDF print preview.

TASK:
Review the HTML print CSS for the following issues:
1. Page break placement: are breaks before major topics?
2. Sidebar hidden in @media print?
3. Interactive elements hidden in @media print?
4. Background colours enabled?
5. A4 page size specified?
6. Footer with version watermark present?
7. No duplicate IDs that could cause rendering issues?
8. Margins adequate for hole-punching?
9. Tables styled for print readability?
10. Formulas legible in print? (quantitative)
11. Case names formatted clearly? (law)

For each issue found: state the CSS location, the problem, and the exact fix required.

OUTPUT: Print Audit Report and patch instructions (if any).
```

---

## Common Failure Points

- Printing before saving and reviewing the PDF
- Printing from Safari or Firefox (inconsistent output)
- Background graphics not enabled (sections print as white boxes)
- Sidebar printing alongside content (wasted pages)
- Content cut off at right margin (table too wide)
- Hole-punch margin too narrow on double-sided prints
- Interactive elements (collapse buttons) appearing in print

---

## Automation Opportunities

| Task | Automatable | Difficulty | Time Saved |
|------|-------------|------------|------------|
| Auto-validate print CSS completeness | Yes | Low | 5 min/audit |
| Generate PDF from HTML headlessly | Yes | Medium | 5 min/audit |
| Count total pages from PDF | Yes | Medium | 2 min/audit |
| Check sidebar hidden in print CSS | Yes | Low | 2 min/audit |
| Generate print manifest from page count | Future | Medium | 10 min/audit |
