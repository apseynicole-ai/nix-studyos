# System Configuration

## File Naming Conventions

### Module Codes
All modules use a standard code format:
```
[SUBJECT_CODE][YEAR_LEVEL]
```
Examples: `FOL178`, `CON178`, `SDS188`, `FAC178`

### Version Numbering
```
v0.5  → skeleton/scaffold only
v0.8  → first complete draft, pre-audit
v0.9  → post-audit, pre-final
v1.0  → approved final / print candidate
v1.1+ → patched versions after final
```

### File Naming Pattern
```
[MODULE_CODE]_[Semester]_[Version]_[Purpose].[ext]
```
Examples:
```
FOL178_S1_v0_9_MasterStudyHub.html
CON178_S1_v1_0_MasterLawStudentEdition.html
SDS188_S1_v1_0_PrintCandidate.html
CON178_S1_TopicCoverSheets_Print.html
CON178_S1_CaseSheets_Print.html
FOL178_S1_v1_0_RevisionPack.html
FOL178_S1_v1_0_ExamPack.html
FOL178_S1_v1_0_AuditReport.md
```

### Folder Naming Pattern
```
[MODULE_CODE] [Full Module Name] [Semester] [Year]
```
Example: `FOL178 Foundations of Law Semester 1 2026`

---

## Module Folder Structure (per module)

```
[MODULE_CODE] [Full Name] [Semester] [Year]/
├── 00_intake/
│   ├── module-register.md        ← module metadata and source list
│   └── build-brief.md            ← build plan produced in Module 03
├── 01_sources/
│   ├── raw/                      ← original files, never modified
│   ├── processed/                ← renamed/organised copies
│   └── source-audit.md           ← source audit report
├── 02_builds/
│   ├── [MODULE]_S[N]_v0_8_*.html
│   ├── [MODULE]_S[N]_v0_9_*.html
│   └── [MODULE]_S[N]_v1_0_*.html
├── 03_cover_sheets/
│   └── [MODULE]_S[N]_TopicCoverSheets_Print.html
├── 04_case_sheets/               ← law modules only
│   └── [MODULE]_S[N]_CaseSheets_Print.html
├── 05_revision/
│   ├── [MODULE]_S[N]_v1_0_RevisionPack.html
│   └── [MODULE]_S[N]_v1_0_ExamPack.html
├── 06_audit/
│   ├── [MODULE]_S[N]_v0_9_AuditReport.md
│   └── [MODULE]_S[N]_v1_0_PrintAuditReport.md
├── 07_print/
│   ├── [MODULE]_S[N]_v1_0_PrintCandidate.pdf
│   └── print-manifest.md
└── 08_archive/                   ← populated at semester end
    └── ARCHIVE_[MODULE]_S[N]_[YEAR].md
```

---

## Module Types

### Law Module
Characteristics: case-heavy, doctrine-to-application, essay and problem-question structure.
Additional outputs: case sheets, FIRAC templates, constitutional/statutory extracts.
Example codes: `FOL178`, `CON178`

### Quantitative Module
Characteristics: formula-heavy, worked examples, interpretation rules.
Additional outputs: formula reference sheet, calculation frameworks.
Example codes: `SDS188`, `FAC178`

### Mixed/Other
Use Law or Quantitative as base and adapt.

---

## Colour Themes (per module type)

These are defaults. Override per module if needed.

| Module Type | Primary | Accent | Background |
|-------------|---------|--------|------------|
| Law | Deep navy `#1a2744` | Gold `#c9a227` | Cream `#faf8f3` |
| Accounting | Forest green `#1a3d2b` | Amber `#d4a017` | Off-white `#f9f9f7` |
| Statistics | Deep teal `#1a3a44` | Coral `#e05c3a` | Light grey `#f7f8f9` |
| Economics | Burgundy `#3d1a1a` | Steel blue `#4a7fa5` | Warm white `#fafaf8` |

---

## AI Tool Role Assignment

| Task | Primary Tool | Support Tool |
|------|-------------|-------------|
| Workflow planning | ChatGPT | — |
| Source review / long context | Claude | — |
| HTML build / patch | Claude Code | Claude |
| Source QA / gap analysis | NotebookLM | Claude |
| Audit prompts | Claude | ChatGPT |
| Cover sheets | Claude Code | — |
| Case sheets | Claude Code | Claude |
| Revision / exam packs | Claude | Claude Code |

---

## Absolute Safety Rules

The following rules are system-wide and non-negotiable:

1. Never overwrite an approved version. Always increment the version number.
2. Never delete files without explicit instruction.
3. Never rename files without explicit instruction.
4. Never move files without explicit instruction.
5. Never stage, commit, or push Git changes without explicit instruction.
6. Never clean folders automatically.
7. Never extract ZIP files automatically.
8. Never OCR unreadable documents automatically.
9. Never treat AI-generated content as a primary academic source.
10. Never invent academic content.
11. Never replace accurate source material with AI summaries.
12. Always create a new version rather than modifying an approved file.
13. Always prefer patching over rebuilding.
14. Always maintain an audit trail.
