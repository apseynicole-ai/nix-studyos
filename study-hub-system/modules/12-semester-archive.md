# Module 12 — Semester Archive

## Purpose

At the end of each semester, preserve the complete module record so it can be referenced, audited, or reused in future semesters without any reconstruction. Nothing is deleted. Everything is organised. The archive is the permanent record of exactly how the module was built.

---

## Inputs

- Complete module folder
- Module register (updated with final build status)
- All HTML builds, cover sheets, case sheets, revision and exam packs
- All audit reports
- All patch logs
- All source files
- Print manifests

---

## Outputs

- `08_archive/ARCHIVE_[MODULE_CODE]_S[N]_[YEAR].md` — archive index
- All folders in their final organised state
- Module register updated with final status and archive confirmation

---

## Rules

1. Nothing is deleted. The archive is additive only.
2. Do not rename approved final files during archiving.
3. If duplicate or uncertain files exist, move them to a `_review/` subfolder inside `08_archive/` — do not delete.
4. The archive index must be complete enough that a future reader could understand the entire module history without reading the build files.
5. The archive is locked after completion. No further changes to archived files without starting a new version.

---

## Pre-Archive Checklist

Before running the archive, confirm the following:

- [ ] Module register final build status is fully updated
- [ ] v1.0 HTML file confirmed and correctly named
- [ ] Cover sheets confirmed (if generated)
- [ ] Case sheets confirmed (if generated, law only)
- [ ] Revision pack confirmed (if generated)
- [ ] Exam pack confirmed (if generated)
- [ ] All audit reports present in `06_audit/`
- [ ] All patch logs present
- [ ] Print manifest completed in `07_print/`
- [ ] All raw sources present in `01_sources/raw/`
- [ ] All processed sources present in `01_sources/processed/`
- [ ] Build brief present in `00_intake/`
- [ ] No duplicate ZIPs or export files in root or builds folders

---

## Archive Index Format

```markdown
# Semester Archive Index

## Module: [MODULE_CODE] [Full Name]
## Semester: [Semester and Year]
## Archive Date: [Date]

---

## Module Summary
- Module type: [Law / Quantitative / Mixed]
- Assessment result: [Grade or "pending"]
- Exam completed: [Yes / No / Date]

---

## File Inventory

### Final Approved Files
| File | Location | Version | Status |
|------|----------|---------|--------|
| Master Study Hub | 02_builds/ | v1.0 | Approved |
| Topic Cover Sheets | 03_cover_sheets/ | — | Approved |
| Case Sheets | 04_case_sheets/ | — | Approved (law only) |
| Revision Pack | 05_revision/ | v1.0 | Approved |
| Exam Pack | 05_revision/ | v1.0 | Approved |

### Source Files
| Source Name | Classification | Tier | Location |
|-------------|----------------|------|----------|
| | | | 01_sources/raw/ |

### Audit Trail
| Audit | Date | Version | Result |
|-------|------|---------|--------|
| QA Audit 1 | | v0.8 | [N] issues found |
| QA Audit 2 | | v0.9 | [N] issues found |
| Print Audit | | v1.0 | Passed |

### Patch History
| Patch Log | Date | Changes |
|-----------|------|---------|
| | | |

---

## Build History Summary
[Brief narrative: how the hub was built, major problems encountered, how they were resolved, what worked well]

---

## Reuse Notes for Future Semesters
[What would need to change if this module runs again: new cases, updated legislation, new assessment structure, etc.]

---

## Archive Status
- [ ] Archive complete and verified
- [ ] Module register updated
- [ ] No files deleted
- [ ] Review folder created for uncertain files (if applicable)
```

---

## Reusable Prompt — Semester Archive

```
You are running Module 12 Semester Archive for the Nix Study Hub Production System.

MODULE: [MODULE_CODE] — [Full Name], [Semester]
OUTPUT FILE: 08_archive/ARCHIVE_[MODULE_CODE]_S[N]_[YEAR].md

TASK:
1. Review the module folder and confirm all expected files are present.
2. Identify any duplicate, unnamed, or uncertain files and list them for the _review/ subfolder.
3. Update the module register final build status.
4. Generate the complete archive index.
5. Write reuse notes for future semesters.
6. Do not delete any files.
7. Do not rename any approved files.

SAFETY:
- Do not delete, rename, or move any file without explicit instruction.
- Do not stage, commit, or push.
- Uncertain files go to 08_archive/_review/ — not to the bin.

OUTPUT: ARCHIVE_[MODULE_CODE]_S[N]_[YEAR].md written to 08_archive/
```

---

## Common Failure Points

- Archiving before the exam pack is generated
- Deleting early version builds (v0.8, v0.9) when cleaning up — they must be kept
- Not writing reuse notes (causes the next semester to start from scratch unnecessarily)
- Duplicate ZIP exports not moved to review folder (leaves archive messy)

---

## Automation Opportunities

| Task | Automatable | Difficulty | Time Saved |
|------|-------------|------------|------------|
| Scan folder and list all files | Yes | Low | 10 min/module |
| Detect duplicate files by content | Yes | Medium | 5 min/module |
| Generate archive index skeleton | Yes | Low | 10 min/module |
| Flag files that don't match naming convention | Yes | Low | 5 min/module |
