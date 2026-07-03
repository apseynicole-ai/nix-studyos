# Workflow Dependency Diagram — SHOS v1.0

**Purpose:** Maps every inter-module dependency in the production pipeline. Identifies critical path, parallel opportunities, and failure propagation routes.

---

## Legend

```
[Module] → [Module]        Required dependency (blocking)
[Module] ⇢ [Module]        Reference dependency (informational, non-blocking)
[Module] ⊕ [Module]        Parallel execution possible
[File]                     Artefact produced or consumed
❌                          Blocking gap identified in validation
⚠                          Warning — dependency exists but is weakly enforced
```

---

## Complete Dependency Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│ EXTERNAL INPUTS                                                         │
│  Source PDFs · Assessment Brief · Case Documents · Exam scope           │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ GATE 1 — MODULE INTAKE (Module 01)                                      │
│                                                                         │
│  Produces:                                                              │
│  ├── 00_intake/module.yaml          ← configuration for all agents      │
│  ├── 00_intake/module-register.md   ← human-readable module summary     │
│  └── 01_sources/raw/                ← raw source files                  │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                          module.yaml + raw sources
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ GATE 2 — SOURCE AUDIT (Module 02)                          ❌ G2-01     │
│                                                                         │
│  Inputs:  01_sources/raw/  ← FILE ACCESS PROTOCOL UNDEFINED            │
│                                                                         │
│  Produces:                                                              │
│  ├── 01_sources/source-audit.md     ← coverage analysis + tier ratings │
│  ├── 01_sources/source-manifest.md  ← operational ledger               │
│  └── 01_sources/processed/          ← renamed + organised sources      │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                           source-audit.md
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ GATE 3 — BUILD PLANNING (Module 03)                                     │
│                                                                         │
│  Inputs:  source-audit.md + module-register.md + exam scope            │
│  ⇢ Refs:  style-guide.md (colour theme)  ⚠ [vs system-config.md]      │
│                                                                         │
│  Produces:                                                              │
│  └── 00_intake/build-brief.md       ← Nicole-approved section list     │
│                                                                         │
│  HOLD: Nicole approval required before Gate 4                          │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                            build-brief.md
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ GATE 4 — HTML PRODUCTION (Module 04)                       ⚠ G4-01     │
│                                                                         │
│  Inputs:  build-brief.md + source files + specs                        │
│  ⇢ Refs:  component-library.md (C-01 to C-20)                         │
│           print-spec.md                                                 │
│           style-guide.md                                                │
│           html-spec.md                                                  │
│           module.yaml  ← NOT WIRED IN (Gap G4-01)                      │
│                                                                         │
│  Produces:                                                              │
│  └── 02_builds/FOL178_S1_v0_8_MasterStudyHub.html                     │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                              v0.8 HTML file
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ GATE 5 — QA AUDIT (Module 06)                              ❌ G5-01     │
│                                                                         │
│  Inputs:  v0.8 HTML (up to 800KB) ← CONTEXT WINDOW LIMIT              │
│           source-audit.md          ← cannot co-load with full HTML     │
│           build-brief.md                                                │
│           error-library.md                                              │
│           law knowledge base (for law modules)                          │
│                                                                         │
│  Produces:                                                              │
│  └── 06_audit/AuditReport.md       ← P1–P4 findings + patch           │
│                                       instructions                      │
│                                                                         │
│  If P1/P2 found: → Module 05 (patching) → return to Gate 5            │
└──────────────┬────────────────────────┬────────────────────────────────┘
               │ (P3/P4 only)           │ (P1/P2 found)
               │                        ▼
               │             ┌──────────────────────────┐
               │             │ HTML PATCHING (Module 05) │
               │             │                          │
               │             │ Inputs: AuditReport.md   │
               │             │         v0.8 HTML        │
               │             │                          │
               │             │ Produces: v0.9 HTML      │
               │             └──────────────┬───────────┘
               │                            │
               │                    loops back to Gate 5
               │
               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ GATE 6 — PRINT AUDIT (Module 07)                                        │
│                                                                         │
│  Inputs:  v0.9 HTML + Chrome browser                                   │
│  ⇢ Refs:  print-spec.md + print-checklist.md                          │
│                                                                         │
│  Produces:                                                              │
│  ├── 07_print/[MODULE]_S[N]_v1_0_MasterStudyHub.pdf                   │
│  ├── 06_audit/PrintAuditReport.md                                      │
│  └── v1.0 HTML (renamed from v0.9)                                     │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                              v1.0 HTML + PDF
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
          ▼                         ▼                         ▼
┌──────────────────┐   ┌────────────────────┐   ┌────────────────────────┐
│ COVER SHEETS     │   │ CASE SHEETS        │   │                        │
│ (Module 08)      │   │ (Module 09)        │   │ (continue below)       │
│                  │   │                    │   │                        │
│ Law only:        │   │ Law modules only   │   │                        │
│ topic dividers   │   │ ← law-knowledge-   │   │                        │
│                  │   │   base.md          │   │                        │
│ Produces:        │   │                    │   │                        │
│ └── CoverSheet   │   │ Produces:          │   │                        │
│     s.html       │   │ └── CaseSheets.html│   │                        │
└──────────────────┘   └────────────────────┘   └────────────────────────┘
          │                         │
          └────────────┬────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ GATE 7 — REVISION PACK (Module 10)                         ⚠ G7-01     │
│                                                                         │
│  Inputs:  v1.0 HTML (master hub)                                       │
│           Tier 1 sources (for spot-check) ← weakly enforced           │
│                                                                         │
│  Produces:                                                              │
│  └── 03_revision/[MODULE]_S[N]_RevisionPack.html                      │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ GATE 8 — EXAM PACK (Module 11)                                          │
│                                                                         │
│  Inputs:  v1.0 HTML + RevisionPack.html + exam scope                   │
│                                                                         │
│  Produces:                                                              │
│  └── 04_exam/[MODULE]_S[N]_ExamPack.html                              │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ GATE 9 — SEMESTER ARCHIVE (Module 12)                                   │
│                                                                         │
│  Inputs:  ALL files in module folder                                   │
│           module.yaml (gate status dashboard)                           │
│                                                                         │
│  Produces:                                                              │
│  └── 05_archive/archive-manifest.md                                    │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ GATE 10 — MODULE ROLLOVER (Module 13)                                   │
│                                                                         │
│  Inputs:  archive-manifest.md + new semester sources                   │
│                                                                         │
│  Produces:                                                              │
│  └── New semester module.yaml + change analysis                        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Critical Path Analysis

The critical path is the minimum sequence that must complete before exam pack production is possible:

```
Gate 1 → Gate 2 → Gate 3 → Gate 4 → Gate 5 → Gate 6 → Gate 7 → Gate 8
```

**Minimum elapsed time (no rework):** Estimated 4–6 hours of active work across multiple agent sessions.

**Most likely rework loop:** Gate 5 → Module 05 → Gate 5. Every module with P1/P2 findings extends the timeline by 1–2 hours per iteration.

---

## Parallel Execution Opportunities

| Stage | Parallel work possible? | Condition |
|-------|------------------------|-----------|
| After Gate 1 | No | Gate 2 must run next |
| After Gate 6 | Yes | Cover Sheets (08) and Case Sheets (09) can run simultaneously |
| After Gate 7 | No | Exam Pack (Gate 8) depends on Revision Pack |
| Cover/Case Sheets | Yes | Independent of each other; parallel with Revision Pack planning |

---

## Artefact Dependency Table

Every file produced by SHOS and which modules consume it:

| Artefact | Produced by | Consumed by | Criticality |
|----------|-------------|-------------|-------------|
| `module.yaml` | Gate 1 | All gates (dashboard), Gate 4 (theme) ⚠ | High |
| `module-register.md` | Gate 1 | Gate 3 | High |
| `source-audit.md` | Gate 2 | Gate 3, Gate 5, Gate 10 | Critical |
| `source-manifest.md` | Gate 2 | Gate 9 (archive) | Medium |
| `build-brief.md` | Gate 3 | Gate 4, Gate 5, Gate 7 | Critical |
| `v0.8 HTML` | Gate 4 | Gate 5 | Critical |
| `v0.9 HTML` | Module 05 | Gate 5 (re-audit), Gate 6 | Critical |
| `v1.0 HTML` | Gate 6 | Gate 7, Gate 8, Gate 9 | Critical |
| `AuditReport.md` | Gate 5 | Module 05, Gate 9 | High |
| `PrintAuditReport.md` | Gate 6 | Gate 9 | Medium |
| `CoverSheets.html` | Module 08 | Gate 9 | Low |
| `CaseSheets.html` | Module 09 | Gate 9, Gate 7 | Medium (law) |
| `RevisionPack.html` | Gate 7 | Gate 8, Gate 9 | High |
| `ExamPack.html` | Gate 8 | Gate 9 | High |
| `archive-manifest.md` | Gate 9 | Gate 10 | High |

---

## Failure Propagation Map

If a gate fails or produces a defective artefact, which downstream gates are affected?

| Failed gate | Propagates to | Propagation type |
|-------------|--------------|-----------------|
| Gate 1 (wrong module type) | All subsequent gates | Full cascade — wrong config propagates through every agent decision |
| Gate 2 (missing source, wrong tier) | Gate 5 (coverage gaps), Gate 7 (revision accuracy) | Partial cascade — content accuracy affected downstream |
| Gate 3 (wrong section list) | Gate 4, Gate 5, Gate 7, Gate 8 | Structural cascade — wrong hub structure locks in for all derivative products |
| Gate 4 (wrong HTML structure) | Gate 5, Gate 6, Gate 7, Gate 8 | Direct cascade — all output products derive from this file |
| Gate 5 (P1/P2 not found) | Gate 7, Gate 8 | Silent contamination — errors propagate to revision and exam packs |
| Gate 6 (print failure) | Gate 7 (blocking — v1.0 not designated) | Sequential block |
| Gate 7 (wrong revision content) | Gate 8 | Direct cascade |

**Most dangerous failure mode:** Gate 5 producing a false APPROVED verdict (G5-01 makes this more likely). Errors invisible to the QA audit propagate silently into the revision pack and exam pack, where they are used for actual exam preparation.

---

## Weakly Enforced Dependencies

These dependencies are documented but not mechanically enforced — they rely on the user following procedure:

| Dependency | Gap | Risk level |
|-----------|-----|-----------|
| Module 04 must read module.yaml | G4-01 — prompt doesn't instruct this | High |
| Gate 5 must load error-library.md | No enforcement — user must remember | Medium |
| Gate 3 must reference style-guide.md (not system-config.md) | G3-02 — ambiguous canonical source | Low |
| Source spot-check in Module 10 | G7-01 — not in prompt | Medium |

---

## System Entry Points

SHOS has three valid entry points depending on work state:

| Situation | Entry point | First document to open |
|-----------|-------------|----------------------|
| New module, no files | Gate 1 / Module 01 | `checklists/new-module-checklist.md` |
| Existing module, in progress | Find current gate in module.yaml | `router/prompt-router.md` → decision tree |
| Existing module, semester rollover | Gate 10 / Module 13 | `sops/sop-09-semester-rollover.md` |
