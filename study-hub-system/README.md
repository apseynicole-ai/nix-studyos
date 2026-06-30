# Nix Study Hub Operating System (SHOS)

**Version:** 1.0  
**Owner:** Nicole  
**Designated:** Nix Study Hub Operating System (SHOS) v1.0  
**Purpose:** Permanent, production-grade operating system for building every study hub across every module, every semester. Foundation layer for the future StudyOS application.

---

## What This Is

This is not a collection of notes or prompts. It is an operating system.

Every component is designed to be reused without modification across modules. The only variable is the input material. The process, quality standards, agent roles, component library, configuration schema, error library, and output format remain constant.

SHOS v1.0 supersedes the v0.9 Production System. All v0.9 files remain valid. See `migration/migration-v09-to-v10.md` for migration guidance.

---

## System Structure

```
study-hub-system/
├── README.md                        ← this file
├── ARCHITECTURE-REVIEW.md           ← v0.9 audit and upgrade rationale
│
├── config/                          ← system-wide configuration
│   ├── system-config.md             ← naming conventions, safety rules, colour themes
│   ├── module-template.yaml         ← module configuration file template
│   ├── automation-roadmap.md        ← prioritised automation plan
│   └── studyos-future-vision.md     ← StudyOS architecture and transition plan
│
├── agents/                          ← AI agent specifications
│   └── agent-registry.md            ← 17 specialist agents with full specifications
│
├── router/                          ← workflow navigation
│   └── prompt-router.md             ← master routing table + decision trees
│
├── modules/                         ← production pipeline modules
│   ├── 01-module-intake.md
│   ├── 02-source-audit.md
│   ├── 03-build-planning.md
│   ├── 04-html-production.md
│   ├── 05-html-patching.md
│   ├── 06-qa-audit.md
│   ├── 07-print-audit.md
│   ├── 08-cover-sheet-generator.md
│   ├── 09-case-sheet-generator.md
│   ├── 10-revision-pack-generator.md
│   ├── 11-exam-pack-generator.md
│   ├── 12-semester-archive.md
│   └── 13-module-rollover.md
│
├── components/                      ← HTML component library
│   └── component-library.md         ← 20 reusable components (C-01 to C-20)
│
├── specs/                           ← technical specifications
│   ├── html-spec.md                 ← HTML structure, IDs, architecture
│   ├── print-spec.md                ← complete @media print CSS template
│   └── style-guide.md               ← colour themes, typography, design rules
│
├── sops/                            ← standard operating procedures
│   ├── sop-index.md
│   ├── sop-01-start-new-module.md
│   ├── sop-02-add-lecture-content.md
│   ├── sop-04-patch-existing-html.md
│   ├── sop-05-run-qa-audit.md
│   ├── sop-07-prepare-for-printing.md
│   └── sop-09-semester-rollover.md
│
├── checklists/                      ← production checklists
│   ├── new-module-checklist.md
│   ├── qa-checklist.md
│   └── print-checklist.md
│
├── manifests/                       ← provenance and tracking templates
│   ├── source-manifest-template.md
│   ├── build-manifest-template.md
│   └── archive-manifest-template.md
│
├── error-library/                   ← permanent QA error catalogue
│   └── error-library.md             ← 30 errors with causes, detection, fixes
│
├── knowledge-bases/                 ← discipline-specific structural references
│   ├── law/law-knowledge-base.md
│   ├── accounting/accounting-knowledge-base.md
│   ├── economics/economics-knowledge-base.md
│   └── statistics/statistics-knowledge-base.md
│
├── quality-gates/                   ← mandatory production gates
│   └── quality-gates.md             ← 10 gates with pass/hold criteria
│
├── data-model/                      ← structured data layer
│   └── data-model.md                ← entity model for StudyOS integration
│
├── migration/                       ← version migration documentation
│   └── migration-v09-to-v10.md
│
├── prompts/                         ← reserved for standalone prompt files
└── archives/                        ← semester archive index
```

---

## Core Principles

1. Never overwrite approved work. Always version forward.
2. Prefer patching over rebuilding.
3. Primary sources take precedence over AI-generated content.
4. Never invent academic content.
5. Every output must be auditable and reproducible.
6. Academic accuracy before speed, always.
7. The system helps you learn — it does not generate notes for you.
8. Quality is non-negotiable.
9. No gate proceeds until the previous gate passes.
10. The HTML is an output format. The data is the source of truth.

---

## Quick Start — Where to Begin

**I don't know what to do next:**  
→ Open `router/prompt-router.md` and find your current situation

**I'm starting a new module:**  
→ Open `checklists/new-module-checklist.md`

**I need a specific prompt:**  
→ Open `router/prompt-router.md` → Prompt Location Index

**I'm choosing an AI tool:**  
→ Open `agents/agent-registry.md` → Agent Selection Quick Reference

**I found a QA error:**  
→ Open `error-library/error-library.md` → search by error description

**I'm building HTML:**  
→ Open `components/component-library.md` → assemble from components

**I'm printing:**  
→ Open `checklists/print-checklist.md`

---

## Production Pipeline (in gate order)

| Gate | Module | Purpose |
|------|--------|---------|
| 1 | Module Intake (01) | Folder structure + source registration |
| 2 | Source Audit (02) | Source classification, tiering, coverage analysis |
| 3 | Build Planning (03) | Approved build brief |
| 4 | HTML Production (04) | First complete HTML (v0.8) |
| 5 | QA Audit (06) | Academic + structural quality review |
| — | HTML Patching (05) | Fix issues found in QA |
| 6 | Print Audit (07) | Print readiness → v1.0 designation |
| — | Cover Sheets (08) | Topic divider pages |
| — | Case Sheets (09) | Law case reference pages |
| 7 | Revision Pack (10) | Exam-focused revision resource |
| 8 | Exam Pack (11) | Exam-night resource |
| 9 | Semester Archive (12) | Complete module record |
| 10 | Module Rollover (13) | New semester preparation |

---

## Version History

| Version | Date | Summary |
|---------|------|---------|
| v0.9 | 2026-06-30 | Initial production system: 13 modules, SOPs, specs, checklists |
| v1.0 | 2026-06-30 | Full OS upgrade: agents, router, component library, manifests, error library, knowledge bases, quality gates, data model, migration guide |
