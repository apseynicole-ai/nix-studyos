# Module 01 — Module Intake

## Purpose

Create the standardised folder structure for a new module, register all known sources, and produce the module register. This module is always the first step. Nothing else starts until intake is complete.

---

## Inputs

- Module code (e.g. `FOL178`)
- Module full name (e.g. `Foundations of Law`)
- Semester and year (e.g. `Semester 1 2026`)
- Module type: Law / Quantitative / Mixed
- List of all available sources (filenames, formats, origin)
- Assessment structure if known (assignments, tests, exam weighting)
- Exam scope if known

---

## Outputs

- `00_intake/module-register.md` — complete module record
- Full folder structure created (see system-config.md for layout)
- Source files copied into `01_sources/raw/` without modification
- `01_sources/source-audit.md` — placeholder, completed in Module 02

---

## Rules

1. Do not modify any raw source files. Copy only.
2. Do not rename raw sources until Module 02 Source Audit approves renaming.
3. Do not build anything in this module. Intake only.
4. If a source is a ZIP export from an AI tool, log it but do not extract automatically.
5. If a source is an unreadable PDF, log it as `STATUS: unreadable` and flag for decision.
6. Record every source, even if its usefulness is uncertain.

---

## Module Register Format

```markdown
# Module Register

## Module Identity
- Code: FOL178
- Name: Foundations of Law
- Semester: Semester 1 2026
- Type: Law
- University: [University name]
- LMS: SocioLearn / EMS Learn

## Assessment Structure
| Assessment | Weight | Due Date | Notes |
|------------|--------|----------|-------|
| | | | |

## Exam
- Exam date: [date or TBC]
- Scope: [confirmed / estimated / unknown]
- Format: [open book / closed book / online]

## Source Inventory
| # | Filename | Format | Origin | Status |
|---|----------|--------|--------|--------|
| 1 | | | | Registered |

## Build Status
- Intake: ✓ Complete
- Source Audit: ○ Pending
- Build Plan: ○ Pending
- HTML v0.8: ○ Pending
- HTML v0.9: ○ Pending
- HTML v1.0: ○ Pending
- Cover Sheets: ○ Pending
- Case Sheets: ○ Pending (Law only)
- Revision Pack: ○ Pending
- Exam Pack: ○ Pending
- Semester Archive: ○ Pending

## Notes
[Any module-specific notes, known risks, or special requirements]
```

---

## Quality Checks

- [ ] Module code matches university records
- [ ] Module type correctly identified (Law / Quantitative / Mixed)
- [ ] All sources physically present in `01_sources/raw/`
- [ ] Every source listed in the register
- [ ] Unreadable or uncertain sources flagged
- [ ] Folder structure matches system-config.md exactly
- [ ] No raw sources have been renamed or modified

---

## Reusable Prompt — Module Intake

```
You are running Module 01 Intake for the Nix Study Hub Production System.

MODULE DETAILS:
- Code: [MODULE_CODE]
- Name: [FULL MODULE NAME]
- Semester: [SEMESTER AND YEAR]
- Type: [Law / Quantitative / Mixed]

SOURCES AVAILABLE:
[List each source: filename, format, origin]

TASK:
1. Confirm the module folder structure matches system-config.md.
2. Produce the module-register.md using the standard format.
3. List every source in the source inventory table.
4. Flag any sources that are ZIP files, unreadable PDFs, or AI-generated outputs.
5. Set all build status items to ○ Pending.
6. Do not rename, move, or modify any source files.
7. Do not begin building the study hub.

OUTPUT: Complete module-register.md only.
```

---

## Common Failure Points

- Starting Module 03 Build Planning before Module 02 Source Audit is complete
- Forgetting to copy raw sources before any processing begins
- Including AI-generated outputs in the raw sources folder without flagging them
- Incomplete source inventory (missing tutorial documents, past papers, or marking guidance)
- Wrong module type classification (affects template selection in later modules)

---

## Automation Opportunities

| Task | Automatable | Difficulty | Time Saved |
|------|-------------|------------|------------|
| Create folder structure from config | Yes | Low | 5 min/module |
| Generate module-register.md skeleton | Yes | Low | 10 min/module |
| Copy sources to raw folder | Yes | Low | 5 min/module |
| Detect unreadable PDFs | Partial | Medium | 5 min/module |
| Pre-fill assessment dates from LMS | Future | High | 15 min/module |
