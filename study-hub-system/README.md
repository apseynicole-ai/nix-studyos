# Nix Study Hub Production System

**Version:** 1.0  
**Owner:** Nicole  
**Purpose:** Permanent reusable production pipeline for building every study hub across every module, every semester.

---

## What This Is

This is not a collection of notes. It is a production operating system.

Every file in this system is designed to be reused without modification across modules. The only thing that changes per module is the input material. The process, the quality standards, the file structure, and the output format remain constant.

This system will eventually power the StudyOS application.

---

## System Structure

```
study-hub-system/
├── README.md                   ← this file
├── config/                     ← system-wide configuration
├── modules/                    ← one file per production module
├── sops/                       ← standard operating procedures
├── templates/                  ← reusable HTML, CSS, and document templates
├── specs/                      ← HTML, print, audit, and style specifications
├── checklists/                 ← QA, print, and audit checklists
├── prompts/                    ← reusable AI prompts
└── archives/                   ← semester archive index
```

---

## Core Principles

1. Never overwrite approved work. Always version forward.
2. Prefer patching over rebuilding.
3. Primary sources take precedence over AI-generated content.
4. Never invent academic content.
5. Every output must be auditable and reproducible.
6. Academic accuracy before speed, always.
7. The system teaches you to learn, not just to generate notes.
8. Quality is non-negotiable.

---

## Production Modules (in order)

| # | Module | Purpose |
|---|--------|---------|
| 01 | Module Intake | Set up folder structure and register sources |
| 02 | Source Audit | Verify, classify, and organise all sources |
| 03 | Build Planning | Design the hub structure before writing HTML |
| 04 | HTML Production | Build the first HTML version |
| 05 | HTML Patching | Update an existing build without rebuilding |
| 06 | QA Audit | Academic and structural quality review |
| 07 | Print Audit | Verify print readiness before printing |
| 08 | Cover Sheet Generator | Produce topic divider pages |
| 09 | Case Sheet Generator | Produce individual law case reference pages |
| 10 | Revision Pack Generator | Produce exam-focused revision resource |
| 11 | Exam Pack Generator | Produce the final exam-night resource |
| 12 | Semester Archive | Archive everything at semester end |
| 13 | Module Rollover | Update an existing hub for a new semester |

---

## Quick Start — New Module

1. Run **Module 01 Intake** → creates folder structure
2. Run **Module 02 Source Audit** → classifies and registers sources
3. Run **Module 03 Build Planning** → produces the build brief
4. Run **Module 04 HTML Production** → first HTML draft (v0.8)
5. Run **Module 06 QA Audit** → find problems
6. Run **Module 05 HTML Patching** → fix problems
7. Repeat steps 5–6 until print-ready
8. Run **Module 07 Print Audit** → confirm print readiness
9. Run **Module 08 Cover Sheet Generator** → topic dividers
10. Run **Module 09 Case Sheet Generator** (law only) → case reference pages
11. Print and assemble binder
12. As exams approach → run **Module 10** then **Module 11**
13. At semester end → run **Module 12 Semester Archive**
