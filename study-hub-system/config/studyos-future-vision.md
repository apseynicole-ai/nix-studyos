# StudyOS Future Vision

**Purpose:** Design document ensuring today's production system can evolve into the StudyOS application without redesign.

---

## The Vision

StudyOS is a personal academic operating system. A student inputs a module framework once and the system automatically generates every resource needed for that module — folder structure, study hub scaffold, assessment tracker, reminders, marks engine, case hub, topic dividers, print pack, revision pack, and exam pack.

The Nix Study Hub Production System is the brain of StudyOS. Everything built today becomes a module in the application.

---

## Architecture Alignment

The current system is designed to become StudyOS. Every component maps directly:

| Current System Component | StudyOS Feature |
|--------------------------|----------------|
| Module 01 Intake | Module Setup Wizard |
| Module 02 Source Audit | Source Manager |
| Module 03 Build Planning | Hub Architect |
| Module 04 HTML Production | Hub Builder |
| Module 05 HTML Patching | Hub Editor |
| Module 06 QA Audit | Quality Engine |
| Module 07 Print Audit | Print Manager |
| Module 08 Cover Sheet Generator | Divider Generator |
| Module 09 Case Sheet Generator | Case Hub Builder |
| Module 10 Revision Pack Generator | Revision Engine |
| Module 11 Exam Pack Generator | Exam Prep Engine |
| Module 12 Semester Archive | Archive Manager |
| Module 13 Module Rollover | Semester Rollover |
| system-config.md | System Settings |
| Module Register | Module Dashboard |
| Automation Roadmap | Development Backlog |

---

## Data Model (Future)

Today the system works with flat files and markdown. StudyOS will need a structured data model. Design everything now with this in mind.

### Module Record
```json
{
  "moduleCode": "FOL178",
  "fullName": "Foundations of Law",
  "semester": 1,
  "year": 2026,
  "type": "law",
  "university": "...",
  "colourTheme": "law",
  "assessments": [
    { "name": "Assignment 1", "weight": 30, "due": "2026-04-15", "status": "pending" }
  ],
  "exam": {
    "date": "2026-06-10",
    "format": "closed-book",
    "duration": 180,
    "scope": "confirmed"
  },
  "buildStatus": {
    "intake": "complete",
    "sourceAudit": "complete",
    "buildPlan": "complete",
    "htmlV08": "complete",
    "htmlV10": "complete",
    "coverSheets": "complete",
    "caseSheets": "complete",
    "revisionPack": "pending",
    "examPack": "pending",
    "archive": "pending"
  }
}
```

### Source Record
```json
{
  "id": "src-001",
  "moduleCode": "FOL178",
  "originalFilename": "Week1_Lecture.pdf",
  "processedFilename": "FOL178_LS_Topic1_IntroToLaw.pdf",
  "classification": "LS",
  "tier": 1,
  "topicsCovered": ["topic-1", "topic-2"],
  "addedDate": "2026-02-01",
  "status": "active"
}
```

### Case Record (Law)
```json
{
  "id": "case-001",
  "moduleCode": "FOL178",
  "name": "Carlill v Carbolic Smoke Ball Co",
  "citation": "[1893] 1 QB 256",
  "court": "Court of Appeal",
  "year": 1893,
  "areaOfLaw": "contract-offer",
  "facts": "...",
  "issue": "...",
  "judgment": "...",
  "ratio": "...",
  "keyPrinciple": "...",
  "examUse": "...",
  "memoryTrigger": "...",
  "relatedCases": [],
  "keyQuote": "",
  "sourceId": "src-003"
}
```

### Formula Record (Quantitative)
```json
{
  "id": "formula-001",
  "moduleCode": "SDS188",
  "name": "Simple Linear Regression",
  "symbol": "Ŷ = β₀ + β₁X",
  "variables": {
    "Ŷ": "predicted value of Y",
    "β₀": "y-intercept",
    "β₁": "slope coefficient",
    "X": "predictor variable"
  },
  "useCase": "Predicting a continuous outcome from one predictor",
  "topicId": "topic-4-regression",
  "sourceId": "src-012"
}
```

---

## API Design (Future)

When StudyOS has an AI backend, every module prompt becomes an API endpoint:

```
POST /api/modules/:code/intake
POST /api/modules/:code/source-audit
POST /api/modules/:code/build-plan
POST /api/modules/:code/html-build
POST /api/modules/:code/patch
POST /api/modules/:code/qa-audit
POST /api/modules/:code/print-audit
POST /api/modules/:code/cover-sheets
POST /api/modules/:code/case-sheets
POST /api/modules/:code/revision-pack
POST /api/modules/:code/exam-pack
POST /api/modules/:code/archive
```

Today's reusable prompts are the specification for these endpoints.

---

## Transition Strategy

**Today (Semester 1 2026):**
Run the system manually using the module prompts and SOPs. Build all 13 modules on real data. Identify what works and what needs refining.

**Semester 2 2026:**
Automate Tier 1 and Tier 2 items from the automation roadmap. Reduce manual steps by ~60%.

**Year 2 of law degree:**
Build StudyOS MVP with module dashboard, source manager, and AI-assisted hub builder. All manual prompts become automated endpoints.

**Year 3+:**
Full StudyOS with marks engine, reminders, revision scheduling, and case hub. The production system is the engine. StudyOS is the interface.

---

## Non-Negotiable Design Constraints for StudyOS

These constraints come from your core principles and must be built into the application architecture — not handled at the UI level.

1. **Immutable approved versions.** Once a file is marked approved, it cannot be overwritten. New versions only.
2. **Source provenance tracking.** Every piece of content in every hub must be traceable to a specific source record.
3. **AI output labelling.** All AI-generated content must be flagged in the data model — it can never be silently promoted to Tier 1.
4. **Audit trail.** Every change to a module — patch, rebuild, rollover — must be logged with date, reason, and result.
5. **Offline-first.** The study hub HTML files must work without internet access (exam conditions).
6. **Print-first design.** The system generates for print. Screen is secondary.
7. **Academic integrity.** The system must make it impossible to accidentally cite AI content as primary academic source.

---

## What This System Already Has That StudyOS Needs

- Module type classification (Law / Quantitative / Mixed) → module type routing
- Source tier system → source provenance engine
- Naming convention → file management system
- Version numbering → version control system
- Audit domains (A–E) → quality engine specification
- Print spec → rendering engine specification
- Colour theme system → theme engine
- Case data model → case hub database schema
- Formula data model → formula library schema
- Module register → module dashboard data model
- Archive format → long-term storage schema

Everything designed here is forward-compatible. Nothing needs to be redesigned.
