# SHOS v1.1 Roadmap

**Purpose:** Prioritised plan for the first post-production-cycle upgrade of the Nix Study Hub Operating System.  
**Trigger:** After the first complete live module production cycle.  
**Target designation date:** End of Semester 1 2026 (after FOL178 or equivalent first module is archived).

---

## Versioning Philosophy

- **v1.0.x** (patch) — Fix blocking gaps without changing workflow structure. No new documents.
- **v1.1** (minor) — New protocol documentation, module additions, KPI data from first cycle. May add new SOP files.
- **v2.0** (major) — StudyOS integration, automation tooling, data layer implementation. Requires architectural changes.

This roadmap covers v1.0.1 and v1.1.

---

## v1.0.1 — Immediate Fixes (Before First Live Run)

These items must be resolved before SHOS is used in production. They are not cosmetic — two are blocking.

### v1.0.1-A — File Access Protocol (DEBT-001)

**Priority:** P1 — Blocking  
**What changes:** A new document added: `protocols/file-access-protocol.md`  
**What it contains:**

> **Document Access Protocol — Claude and Source Files**
>
> Claude (the Source Auditor and QA Auditor agent) cannot directly read PDF files. Before running any module that requires Claude to read source content, use this protocol:
>
> **Step 1 — Text Extraction (Claude Code)**  
> Use Claude Code to extract text from each PDF in `01_sources/raw/`:
> ```
> For each PDF, read the file and output the full text to:
> 01_sources/processed/[filename].txt
> ```
>
> **Step 2 — Source Audit (Claude)**  
> Paste the extracted `.txt` content into Claude for classification and audit.  
> For large source sets: process 3–4 sources per Claude session. Begin each session with the source audit prompt.
>
> **Step 3 — Unreadable Files**  
> If a PDF cannot be extracted (image-based, corrupted):  
> - Flag in source-manifest.md as: `extraction_status: manual_required`  
> - Do not skip — manually retype or screenshot key sections

**Modules affected:** 02, 03, 06, 09, 10, 11, 13  
**Effort:** Low (documentation only for now; automation in Phase 1)

---

### v1.0.1-B — Three-Pass QA Protocol (DEBT-002)

**Priority:** P1 — Blocking  
**What changes:** Module 06 (qa-audit.md) rewritten. SOP-05 updated.  
**New structure of Module 06:**

```
PASS 1 — Structural Audit (Claude Code)
  Agent: HTML Inspector (AGENT-09, Claude Code)
  Scope: Domains C (structure), D (components), E (print)
  Input: HTML file only
  Output: Structural findings report (S-findings.md)

PASS 2 — Academic Audit (Claude)
  Agent: QA Auditor (AGENT-10, Claude)
  Scope: Domains A (accuracy), B (coverage)
  Input: S-findings.md + PASTED source extracts for relevant topics
         + build brief section list
         + error library (key entries only)
  Do NOT load: full HTML file, full source files
  Output: Academic findings report (A-findings.md)

PASS 3 — Source Verification (NotebookLM)
  Agent: Source Verifier (AGENT-17, NotebookLM)
  Scope: P1 and P2 findings from Pass 2 only
  Input: Uploaded Tier 1 sources + specific claim from A-findings.md
  Output: Verified / Not verified per finding
  Note: NotebookLM output is Tier 3 — it supports findings, never creates them
  
FINAL: Merge all findings into AuditReport.md with combined priority ratings
```

**Effort:** Medium (rewrite of Module 06 + SOP-05)

---

### v1.0.1-C — Module 04 Prompt Wired to module.yaml (DEBT-003)

**Priority:** P2  
**What changes:** First 3 lines of Module 04 prompt  
**Exact addition:**
> "Before beginning production: read `00_intake/module.yaml`. Extract `theme.preset` and apply the corresponding CSS custom properties from `specs/style-guide.md`. Extract `module_type` and apply the corresponding component set from `components/component-library.md`."

**Effort:** Very low

---

### v1.0.1-D — color-mix() CSS Fallbacks (DEBT-004)

**Priority:** P2  
**What changes:** component-library.md — all 20 components  
**Pattern:** Add `rgba()` fallback before every `color-mix()` value  
**Effort:** Low (systematic find-and-update across component-library.md)

---

### v1.0.1-E — Gate 1 Tier 1 Count Fix (DEBT-005)

**Priority:** P3  
**What changes:** quality-gates.md — Gate 1 pass criteria, Gate 2 hold criteria  
**Effort:** Very low

---

### v1.0.1-F — Case Sheet Gate Enforcement (DEBT-009)

**Priority:** P2  
**What changes:** quality-gates.md Gate 6 (law module criterion), Module 09 prompt  
**Effort:** Low

---

### v1.0.1-G — Law Case Update Cascade (DEBT-010)

**Priority:** P2  
**What changes:** Module 05 — new sub-procedure  
**Effort:** Low

---

### v1.0.1-H — Build Brief Review Checklist (DEBT-008)

**Priority:** P3  
**What changes:** quality-gates.md Gate 3  
**Effort:** Very low

---

### v1.0.1-I — Colour Theme Canonical Source Fix (DEBT-006)

**Priority:** P3  
**What changes:** Module 03 prompt reference, system-config.md note  
**Effort:** Very low

---

### v1.0.1-J — Module 01 Two-Document Sequencing (DEBT-007)

**Priority:** P3  
**What changes:** Module 01 prompt, SOP-01  
**Effort:** Low

---

### v1.0.1-K — Revision Pack Completeness Check (DEBT-016)

**Priority:** P3  
**What changes:** Module 10 prompt  
**Effort:** Very low

---

## v1.1 — Post-First-Cycle Upgrade

**Trigger:** After first complete production cycle (one full module archived).  
**What feeds v1.1:** KPI data from first cycle, live feedback, discovered errors not in error library.

---

### v1.1-1 — Error Library Expansion

**What it is:** New entries added to error-library.md from errors discovered in the first live production run.  
**Target additions:** 5–10 new entries (estimate — may be more for a law module)  
**Format:** Same as existing ERR-001 to ERR-030 entries

---

### v1.1-2 — Four Missing SOPs (DEBT-011)

Write the four missing standard operating procedures:
- SOP-03 — Rebuild HTML Section
- SOP-06 — Generate Case Sheets
- SOP-08 — Final QA (three-pass, incorporating v1.0.1-B)
- SOP-10 — Version Control

**Effort:** Low — 4 documents, each derived from existing module content

---

### v1.1-3 — Agent Handoff Protocol Expansion (DEBT-012)

Expand the handoff template in prompt-router.md to cover:
- Sequential handoffs (agent completes, next begins)
- Parallel coordination (Claude + NotebookLM during Pass 3 QA)
- Resume handoff template (returning to a partially-complete gate)

---

### v1.1-4 — QA Checklist Synchronisation (DEBT-015)

Regenerate qa-checklist.md from the v1.0.1-B rewrite of Module 06. Add a header note: "Derived from Module 06. Do not edit independently."

---

### v1.1-5 — KPI Baseline Establishment

Populate the KPI dashboard in `module.yaml` for the first completed module. These values become the baseline against which future modules are measured.

| KPI | First module value | Notes |
|-----|-------------------|-------|
| Q-01 P1/P2 errors | TBD | |
| Q-02 Audit iterations | TBD | |
| V-01 Days to v1.0 | TBD | |
| V-03 Rework percentage | TBD | |

---

### v1.1-6 — Phase 1 Automation (Priority Items)

Implement automation items from the Automation Readiness Matrix:

| Item | Description | Effort |
|------|-------------|--------|
| A1 | Folder structure init script | Low |
| A2 | File naming validator | Low |
| A3 | module.yaml schema validator | Medium |
| A8 | Version number increment script | Very low |
| A9 | Case sheet completeness check | Low |
| B1 | PDF text extraction script | Low |

**Target:** All Phase 1-A items complete before Semester 2 begins.

---

### v1.1-7 — Rollover Checkpoints (DEBT-017)

Add three explicit resume checkpoints to Module 13 and SOP-09 for rollover recovery.

---

## v2.0 — StudyOS Integration (Future)

**Trigger:** When Nicole decides to build the StudyOS application.  
**What changes:** Everything — SHOS becomes the backend specification for a full application.

Key v2.0 items from the automation roadmap and data model:

| Item | Description |
|------|-------------|
| Data layer implementation | YAML entity tooling, validation, CRUD operations |
| API design | StudyOS REST API endpoints for module/topic/content CRUD |
| Export pipeline | Automated HTML → PDF, Notion, DOCX, mobile |
| Intelligence layer | Automated QA structural audit (Phase 2 automation) |
| Dashboard | Module production status dashboard |

v2.0 planning begins after 3+ successful production cycles confirm the data model and workflow are stable.

---

## v1.1 Delivery Checklist

Use this to confirm v1.1 is complete:

- [ ] v1.0.1-A through v1.0.1-K all resolved
- [ ] First live module archived (provides KPI baseline)
- [ ] Error library expanded from first cycle
- [ ] Four missing SOPs written
- [ ] Phase 1 automation items A1, A2, A3, A8, A9, B1 implemented
- [ ] KPI baseline populated in module.yaml
- [ ] agent-registry.md updated if any agent roles changed during first cycle
- [ ] README.md version history updated to v1.1
- [ ] SELF-AUDIT.md updated to v1.1 assessment

---

## Summary

| Version | Trigger | Key deliverables |
|---------|---------|-----------------|
| v1.0.1 | Before first live run | 11 targeted fixes; P1 and P2 debt resolved |
| v1.1 | After first live module | Error library expansion, missing SOPs, Phase 1 automation, KPI baseline |
| v2.0 | Decision to build StudyOS app | Full application architecture; data layer; API |
