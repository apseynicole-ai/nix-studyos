# Technical Debt Register — SHOS v1.0

**Purpose:** Consolidated register of all known technical debt, gaps, and deferred work identified across the SHOS v1.0 self-audit, production validation, stress testing, and human factors review.  
**Maintained:** Add entries after every production cycle.  
**Last updated:** 2026-06-30  

---

## Severity Scale

| Severity | Code | Description |
|----------|------|-------------|
| Critical | P1 | Blocking production. Must resolve before first live run. |
| High | P2 | Significant impact on quality or reliability. Resolve in v1.0.1. |
| Medium | P3 | Functional gap or usability issue. Resolve in v1.1. |
| Low | P4 | Minor gap or documentation improvement. Resolve in v1.1 or v1.2. |

---

## Register

---

### DEBT-001 — File Access Protocol Undefined

**ID:** DEBT-001  
**Source:** Production Validation Gap G2-01  
**Severity:** P1 — Blocking  
**Status:** Open  
**Area:** Source Audit (Module 02), QA Audit (Module 06)

**Description:**  
Claude (the recommended Source Auditor agent) cannot read PDF files directly. The source audit prompt instructs Claude to classify and review source files, but no protocol exists for how Claude physically accesses the content of those files.

This gap affects: Modules 02, 03, 06, 09, 10, 11, 13.

**Resolution:**  
Implement a two-step file access protocol:
1. Claude Code reads source files and extracts text to `.txt` files in `01_sources/processed/`
2. Claude receives extracted text (pasted or file-read) for classification and analysis

**Automation candidate:** B1 (Source PDF Text Extraction) in Phase 1 automation.  
**Effort:** Medium — requires new protocol documentation + automation script  
**Owner:** System architect  
**Target:** Before first live module production

---

### DEBT-002 — QA Audit Context Window Protocol

**ID:** DEBT-002  
**Source:** Production Validation Gap G5-01 (highest severity in system)  
**Severity:** P1 — Blocking  
**Status:** Open  
**Area:** QA Audit (Module 06, Gate 5)

**Description:**  
The current QA audit prompt requires Claude to simultaneously hold the full HTML file (potentially 600KB+ / 150K+ tokens), source coverage analysis, build brief, and error library. This is impossible in a single Claude session for any real module.

**Resolution:**  
Define a mandatory three-pass QA protocol:
- **Pass 1 (Claude Code):** Structural audit — Domains C, D, E. No source material needed. Claude Code reads the HTML file directly.
- **Pass 2 (Claude):** Academic audit — Domains A, B. Source extracts pasted in for the specific topics being verified. HTML is NOT loaded in full — only relevant sections are pasted.
- **Pass 3 (NotebookLM):** Source cross-verification. Specific P1/P2 findings from Pass 2 are queried against uploaded Tier 1 sources.

**Effort:** High — requires rewriting Module 06 and SOP-05, creating new handoff templates  
**Owner:** System architect  
**Target:** Before first live module production

---

### DEBT-003 — module.yaml Not Wired Into HTML Production Prompt

**ID:** DEBT-003  
**Source:** Production Validation Gap G4-01  
**Severity:** P2 — High  
**Status:** Open  
**Area:** HTML Production (Module 04)

**Description:**  
Module 04 lists `module.yaml` as an input ("Apply colour theme from module.yaml") but the Module 04 prompt contains no instruction to read module.yaml. HTML Builder agents will not read this file unless explicitly instructed.

**Resolution:**  
Add to the Module 04 prompt opening:
> "Before beginning, read `00_intake/module.yaml`. Apply the colour theme from `theme.preset` (map to CSS custom properties per style-guide.md). Apply module-type-specific components based on `module_type`."

**Effort:** Low — prompt edit only  
**Target:** v1.0.1

---

### DEBT-004 — color-mix() CSS Without Fallback

**ID:** DEBT-004  
**Source:** Self-Audit W-03, Production Validation Gap G4-02  
**Severity:** P2 — High  
**Status:** Open  
**Area:** Component Library (component-library.md)

**Description:**  
Component CSS uses `color-mix(in srgb, var(--primary) 6%, white)` which requires modern Chrome. No fallback `background` value is specified. Components will render incorrectly (white backgrounds) in older Chrome versions.

**Resolution:**  
Add fallback before every `color-mix()` usage:
```css
background: rgba(26, 39, 68, 0.06);  /* fallback */
background: color-mix(in srgb, var(--primary) 6%, white);
```

**Effort:** Low — targeted CSS edits across component-library.md  
**Target:** Before first component library build (immediate)

---

### DEBT-005 — Gate 1 Tier 1 Count Check

**ID:** DEBT-005  
**Source:** Production Validation Gap G1-02  
**Severity:** P3 — Medium  
**Status:** Open  
**Area:** Quality Gates (quality-gates.md)

**Description:**  
Gate 1 pass criteria requires "at least 2 Tier 1 sources available" but source tiers are not assigned until Gate 2. Gate 1 cannot verify a criterion that Gate 2 establishes.

**Resolution:**  
Remove Tier 1 source count from Gate 1 pass criteria. Move to Gate 2 hold criteria: "Minimum 2 Tier 1 sources identified and tiered."

**Effort:** Very low — edit to quality-gates.md only  
**Target:** v1.0.1

---

### DEBT-006 — Canonical Colour Theme Source Ambiguity

**ID:** DEBT-006  
**Source:** Production Validation Gap G3-02  
**Severity:** P3 — Medium  
**Status:** Open  
**Area:** Module 03 prompt, system-config.md, style-guide.md

**Description:**  
Module 03 tells Claude to "select the colour theme from system-config.md" but style-guide.md contains the full CSS custom property definitions (the actual implementable values). Agents following Module 03 will look in the wrong document.

**Resolution:**  
1. Designate `style-guide.md` as the canonical source for colour theme CSS values
2. Update Module 03 prompt to reference style-guide.md
3. Update system-config.md to say "Colour themes defined in full in specs/style-guide.md"

**Effort:** Very low — documentation edits  
**Target:** v1.0.1

---

### DEBT-007 — Module Intake Two-Document Sequencing

**ID:** DEBT-007  
**Source:** Production Validation Gap G1-01, Human Factors Review HF-03  
**Severity:** P3 — Medium  
**Status:** Open  
**Area:** Module 01, SOP-01

**Description:**  
Module 01 requires both `module-register.md` and `module.yaml` but gives no guidance on creation order or their relationship. First-time users will not know which to create first or why both exist.

**Resolution:**  
Add to Module 01 and SOP-01: explicit creation order (module-register.md first, then module.yaml populated from it) and a one-paragraph explanation of why both documents exist and serve different purposes.

**Effort:** Low — documentation only  
**Target:** v1.0.1

---

### DEBT-008 — Build Brief Review Checklist Missing

**ID:** DEBT-008  
**Source:** Production Validation Gap G3-01  
**Severity:** P3 — Medium  
**Status:** Open  
**Area:** Quality Gates (Gate 3)

**Description:**  
Gate 3 requires Nicole to review and approve the build brief but provides no guidance on what to check. A first-time user will not know what a bad build brief looks like.

**Resolution:**  
Add a 5–7 item build brief review checklist to Gate 3:
- [ ] Every section has at least one identified source
- [ ] Law extras (cases, statutes) are specified for law modules
- [ ] Topic order matches lecture sequence (or a defensible alternative)
- [ ] Assessment types and weightings are captured
- [ ] Exam scope matches what the lecturer has indicated
- [ ] Topic count is realistic for a single hub
- [ ] No section relies solely on AI-generated material

**Effort:** Low — Gate 3 edit only  
**Target:** v1.0.1

---

### DEBT-009 — Case Sheet Omission Not Gate-Enforced

**ID:** DEBT-009  
**Source:** Stress Test Report ST-10  
**Severity:** P2 — High  
**Status:** Open  
**Area:** Module 09, Gate 6

**Description:**  
No quality gate checks that all required cases (from module.yaml `law.cases_required`) have a corresponding case sheet. A law module can pass all 10 gates with missing case sheets.

**Resolution:**  
Add to Gate 6 pass criteria (law modules only): "All cases in module.yaml `law.cases_required` have a case sheet file in `09_case_sheets/`."

Add to Module 09 prompt: "Before completing, list all cases you were given and confirm a sheet was produced for each."

**Automation candidate:** A9 (Case Sheet Completeness Check)  
**Effort:** Low — Gate 6 edit + Module 09 edit  
**Target:** v1.0.1

---

### DEBT-010 — Law Case Update Cascade Protocol

**ID:** DEBT-010  
**Source:** Stress Test Report ST-02  
**Severity:** P2 — High  
**Status:** Open  
**Area:** Module 05

**Description:**  
When a prescribed law case is replaced or updated, the corresponding case sheet becomes stale. No cascade update procedure exists to propagate hub changes to case sheets, revision packs, or exam packs.

**Resolution:**  
Add a "Law Content Change" sub-procedure to Module 05 with a cascade checklist:
- [ ] Update case section in master hub
- [ ] Mark case sheet as STALE → regenerate via Module 09
- [ ] If RevisionPack.html exists post-v1.0: re-run Module 10
- [ ] If ExamPack.html exists post-v1.0: re-run Module 11

**Effort:** Low — Module 05 documentation addition  
**Target:** v1.0.1

---

### DEBT-011 — Missing 4 SOPs

**ID:** DEBT-011  
**Source:** Self-Audit W-01  
**Severity:** P4 — Low  
**Status:** Open  
**Area:** SOPs (sops/)

**Description:**  
SOPs exist for 6 of 10 documented workflows. Missing: SOP-03 (Rebuild HTML Section), SOP-06 (Generate Case Sheets), SOP-08 (Final QA), SOP-10 (Version Control).

The missing SOPs cover processes fully documented in their module files. The SOP format is a convenience layer, not a new specification.

**Effort:** Low — 4 documents to write, ~100 lines each  
**Target:** After first live production cycle (v1.0.1)

---

### DEBT-012 — Agent Handoff Protocol Incomplete

**ID:** DEBT-012  
**Source:** Self-Audit W-06  
**Severity:** P3 — Medium  
**Status:** Partial  
**Area:** router/prompt-router.md

**Description:**  
The agent registry specifies each agent's responsibilities but does not define how context is passed between agents in a production session. A handoff template exists in the router but is not specific enough for the multi-tool QA scenario (Claude + NotebookLM simultaneously).

**Resolution:**  
Expand the handoff template to include:
- Sequential handoff (one agent completes, next begins)
- Parallel coordination (Claude + NotebookLM during QA Pass 3)
- Resume handoff (returning to a session mid-gate)

Add specific QA coordination procedure to Module 06 (see HF-08).

**Effort:** Low  
**Target:** v1.0.1

---

### DEBT-013 — Prompts/ Folder Unpopulated

**ID:** DEBT-013  
**Source:** Self-Audit W-02  
**Severity:** P4 — Low  
**Status:** Open  
**Area:** prompts/

**Description:**  
The `prompts/` directory exists but contains no standalone prompt files. All prompts are embedded in their module files. A separate prompts/ folder reduces one navigation step.

**Effort:** Very low — copy-paste from module files  
**Target:** v1.0.1

---

### DEBT-014 — module.yaml Schema Validator

**ID:** DEBT-014  
**Source:** Self-Audit W-07  
**Severity:** P4 — Low  
**Status:** Open  
**Area:** Automation (config/)

**Description:**  
module.yaml has no schema validator. Incorrectly filled templates (missing fields, wrong types) will not be caught until they cause a downstream problem.

**Automation candidate:** A3 (module.yaml Schema Validator) in Phase 1 automation.  
**Effort:** Medium — requires JSON Schema definition + Python validator  
**Target:** Phase 1 automation

---

### DEBT-015 — QA Checklist / Module 06 Drift Risk

**ID:** DEBT-015  
**Source:** Production Validation Gap G5-02  
**Severity:** P3 — Medium  
**Status:** Open  
**Area:** checklists/qa-checklist.md, modules/06-qa-audit.md

**Description:**  
Both documents define the five QA audit domains and their items. They are nearly but not exactly identical. As the system evolves, these will drift and cause inconsistent audits.

**Resolution:**  
Designate Module 06 as the single source of truth for QA domain definitions. Regenerate qa-checklist.md from Module 06 after any update. Add a note at the top of qa-checklist.md: "Derived from Module 06. Do not edit independently — update Module 06, then regenerate."

**Effort:** Low  
**Target:** v1.1

---

### DEBT-016 — Revision Pack Completeness Verification

**ID:** DEBT-016  
**Source:** Production Validation Gap G7-01, Stress Test ST-09  
**Severity:** P3 — Medium  
**Status:** Open  
**Area:** Module 10

**Description:**  
The revision pack generator does not include a completeness check. Formula boxes and law case ratios from the master hub may be omitted without detection.

**Resolution:**  
Add to Module 10 prompt: "Before finalising, confirm all formula boxes from the master hub are present in the revision pack. For law modules: confirm all case ratio statements are present."

**Automation candidate:** B4 (Revision Pack Formula Completeness Check) in Phase 2 automation.  
**Effort:** Low  
**Target:** v1.0.1

---

### DEBT-017 — Module Rollover Resume Checkpoints

**ID:** DEBT-017  
**Source:** Stress Test ST-11  
**Severity:** P4 — Low  
**Status:** Open  
**Area:** Module 13, SOP-09

**Description:**  
Module 13 (Rollover) steps are sequential but have no defined resume points. If the rollover process is interrupted, there is no documented procedure for determining what has been completed and what remains.

**Resolution:**  
Add three explicit resume checkpoints to Module 13 and SOP-09.

**Effort:** Low  
**Target:** v1.1

---

## Debt Summary by Priority

| Priority | Count | Items |
|----------|-------|-------|
| P1 — Blocking | 2 | DEBT-001, DEBT-002 |
| P2 — High | 4 | DEBT-003, DEBT-004, DEBT-009, DEBT-010 |
| P3 — Medium | 7 | DEBT-005, DEBT-006, DEBT-007, DEBT-008, DEBT-012, DEBT-015, DEBT-016 |
| P4 — Low | 4 | DEBT-011, DEBT-013, DEBT-014, DEBT-017 |
| **Total** | **17** | |

**P1 items must be resolved before first live production run.**  
**P2 items must be resolved in v1.0.1 (after first production cycle).**  
**P3 and P4 items are addressed in v1.1.**

---

## Debt Resolution Log

| ID | Status | Resolution date | Notes |
|----|--------|----------------|-------|
| DEBT-001 | Open | — | |
| DEBT-002 | Open | — | |
| … | | | |

*Update this table as each item is resolved.*
