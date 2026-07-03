# Production Validation Report

**SHOS Version Validated:** 1.0  
**Validation Date:** 2026-06-30  
**Method:** Simulated end-to-end production cycle  
**Simulated Module:** FOL178 — Foundations of Law, Semester 1 2026 (Law module — highest complexity type)  
**Validator role:** Software Quality Engineer

---

## Validation Method

A law module was chosen because it exercises the maximum number of SHOS subsystems: source audit, law content specialist, case sheets, case-specific QA rules, FIRAC templates, law knowledge base, and citation validation. If SHOS holds for a law module, it will hold for quantitative modules.

Each gate was walked through as if being executed in production. Documents were traced from their required inputs to their expected outputs. Gaps, ambiguities, and missing dependencies were recorded.

---

## Gate-by-Gate Walkthrough

---

### GATE 1 — Module Intake

**Simulated inputs:**
- Module code: FOL178
- Sources: 8 lecture slide PDFs, 3 tutorial PDFs, 1 assessment brief, 2 case document PDFs

**Expected outputs:**
- `00_intake/module.yaml`
- `00_intake/module-register.md`
- `01_sources/raw/` populated

**Responsible agent:** Study Hub Architect (ChatGPT)

**Document trace:**
- SOP-01 → Module 01 → module-template.yaml → module-register.md ✓

**Gap found — G1-01 (Medium):**  
Module 01 (intake) and module-template.yaml both exist as the source of truth for the module register. Module 01 produces `module-register.md` in markdown format. module-template.yaml is a separate YAML config. Neither document explicitly tells the user *which to create first* or *whether they must both be created*.  
A first-time user will not know whether module-register.md is now superseded by module.yaml (it isn't — they serve different purposes) or whether they need to maintain both (they do).  
**Resolution required:** Add explicit sequencing note to SOP-01 and Gate 1 criteria.

**Gap found — G1-02 (Low):**  
Gate 1 pass criteria requires "at least 2 Tier 1 sources available" but the intake module has not yet run the source audit — tiers are not yet assigned at Gate 1. The gate is checking a criterion that Gate 2 is responsible for establishing.  
**Resolution required:** Remove the Tier 1 source count from Gate 1. Move it to Gate 2 hold criteria.

**Failure point:** User does not know whether to open SOP-01 or Module 01. Both describe the same process at different levels of detail. No document tells them which takes precedence.

**Rollback strategy:** If Gate 1 fails (wrong module type, missing sources), re-run the intake prompt. No destructive action is possible at this stage.

**Gate 1 verdict:** Passable, with G1-01 and G1-02 requiring fixes.

---

### GATE 2 — Source Audit

**Simulated inputs:**
- 8 lecture slide PDFs (Tier 1)
- 3 tutorial PDFs (Tier 1)
- 1 assessment brief (Tier 1)
- 2 case documents (Tier 1)
- 1 ChatGPT-generated case summary from a previous study session (Tier 3 — must be identified)
- 1 ZIP archive of unknown content from an earlier semester

**Expected outputs:**
- `01_sources/source-audit.md`
- `01_sources/source-manifest.md`
- Processed copies in `01_sources/processed/`

**Responsible agent:** Source Auditor (Claude)

**Document trace:**
- Module 02 prompt → source-audit.md + source-manifest.md ✓
- Module 02 classification table → processed/ naming ✓

**Gap found — G2-01 (High):**  
The source audit prompt (Module 02) gives Claude a list of filenames. However, Claude in standard mode cannot read files — it can only read text pasted into the conversation. Claude Code can read files but is not the recommended agent for the source audit (Claude is recommended for long-context review).  

The prompt says "List each source: filename, format, origin" but in practice:
- For 13 source files, pasting all content into Claude would exceed context for large PDFs
- Claude Code could read files but the audit prompt is not written for Claude Code
- NotebookLM could read the files but produces Tier 3 output

This is the most significant practical gap in the entire system. There is no documented workflow for how Claude (the recommended tool) physically accesses the source files for classification and review.  
**Resolution required:** Define a document access protocol. Options: (a) Claude Code reads files and outputs structured summaries, then Claude audits summaries; (b) Nicole pastes extracted text; (c) NotebookLM ingests sources and Claude queries it with caveat that NotebookLM output is Tier 3. This gap affects Modules 02, 03, 06, 09, 10, 11, and 13.

**Gap found — G2-02 (Medium):**  
The ZIP archive scenario is handled in Module 01 ("do not extract automatically") but the source audit module gives no guidance on how to classify a ZIP file's contents without opening it. The hold criteria say to flag it, but there's no defined resolution path: "Wait for Nicole to manually extract it? Skip it? Treat the ZIP as a single Tier-unknown source?"  
**Resolution required:** Add ZIP file resolution procedure to Module 02.

**Gap found — G2-03 (Low):**  
source-audit.md and source-manifest.md serve different but overlapping purposes. Both contain source listings. A user running the system for the first time will not intuit the distinction:
- source-audit.md = analysis report (coverage gaps, reliability reasoning)
- source-manifest.md = operational ledger (current status, versioning)  
The Module 02 prompt produces only source-audit.md. A separate step is needed for source-manifest.md, but this step is not in any SOP.  
**Resolution required:** Clarify in Module 02 that both documents are required outputs. The prompt currently only outputs one.

**Failure point:** Large PDFs cannot realistically be pasted into Claude for classification.

**Rollback strategy:** If a source is misclassified, update the tier in source-manifest.md and re-run coverage analysis. No destructive action.

**Gate 2 verdict:** G2-01 is a blocking practical gap. The system specifies what to do but not how to do it.

---

### GATE 3 — Build Planning

**Simulated inputs:**
- source-audit.md (completed)
- module-register.md
- Exam scope: "All topics, higher weighting on Topics 3–5"

**Expected outputs:**
- `00_intake/build-brief.md`
- Nicole's approval

**Responsible agent:** Build Planner (Claude)

**Document trace:**
- Module 03 prompt → build-brief.md ✓
- Gate 3 criteria → Nicole approval ✓

**Gap found — G3-01 (Medium):**  
Gate 3 requires "Nicole has reviewed and approved." The gate document states this as a binary criterion but provides no guidance on *what Nicole is checking for* when she reviews the build brief. A first-time user will rubber-stamp it without knowing what a bad build brief looks like.  
**Resolution required:** Add a build-brief review checklist to Gate 3 (5–7 items covering: every section has a source, law extras are specified, topic order is defensible).

**Gap found — G3-02 (Low):**  
Module 03 prompt tells Claude to "select the colour theme from system-config.md for this module type." The style-guide.md also defines colour themes with more detail (CSS custom properties). A user reading only Module 03 will look in system-config.md; a user reading Module 04 will look in style-guide.md. The canonical source of colour theme definitions is ambiguous.  
**Resolution required:** Designate style-guide.md as the single source of colour theme truth. Update Module 03 prompt reference accordingly.

**Gate 3 verdict:** Passable. G3-01 is a usability issue, not a technical failure.

---

### GATE 4 — HTML v0.8 Production

**Simulated inputs:**
- Approved build-brief.md
- 13 source files (Tier 1 and 2)
- component-library.md
- print-spec.md
- style-guide.md
- html-spec.md
- module.yaml

**Expected outputs:**
- `02_builds/FOL178_S1_v0_8_MasterStudyHub.html`

**Responsible agent:** HTML Builder (Claude Code)

**Document trace:**
- Module 04 prompt → HTML file ✓
- Component library → standard blocks ✓
- Print spec → @media print CSS ✓

**Gap found — G4-01 (High):**  
Module 04 lists module.yaml as an input ("Apply the colour theme from module.yaml") but the Module 04 prompt contains no instruction to read module.yaml. The prompt says "Apply colour theme from build brief or system-config.md." This means the configuration file added in v1.0 is not actually wired into the production prompt. An HTML Builder following Module 04 will not read module.yaml.  
**Resolution required:** Update Module 04 prompt to explicitly reference module.yaml as the configuration source, with instructions to read the `theme.preset` field and apply accordingly.

**Gap found — G4-02 (Medium):**  
The component library (component-library.md) uses `color-mix(in srgb, ...)` CSS syntax. The Self-Audit (SELF-AUDIT.md) flagged this as W-03 but it was not fixed before v1.0 designation. An HTML Builder using the component library will produce CSS that renders incorrectly in some environments.  
**Resolution required:** Add fallback CSS values immediately.

**Gap found — G4-03 (Low):**  
The HTML production prompt instructs: "Before writing the file, confirm the target path does not already contain an approved version." There is no mechanism by which Claude Code can reliably determine whether a file is "approved" vs "draft" without reading the version watermark inside the file. This check is currently unenforceable without a naming convention check (v1.0+ = approved).  
**Resolution required:** Formalise: if the target filename contains "v1_0" or higher, stop and ask. If v0_8 or v0_9, safe to proceed.

**Gate 4 verdict:** G4-01 means module.yaml is decorative for the current production pipeline. This is a genuine v1.0 gap.

---

### GATE 5 — Academic QA

**Simulated inputs:**
- FOL178_S1_v0_8_MasterStudyHub.html
- source-audit.md (coverage analysis)
- build-brief.md (section list)
- error-library.md
- Module type: Law

**Expected outputs:**
- AuditReport.md with prioritised issues and patch instructions

**Responsible agent:** QA Auditor (Claude)

**Document trace:**
- Module 06 prompt → AuditReport.md ✓
- qa-checklist.md → checklist cross-reference ✓
- error-library.md → known error cross-reference ✓

**Gap found — G5-01 (Critical — highest severity in system):**  
This is the most serious architectural gap in SHOS v1.0.

The QA Audit requires Claude to:
1. Read the HTML file (potentially 300–800KB)
2. Simultaneously reference the source audit coverage analysis
3. Cross-check content against Tier 1 sources
4. Reference the error library
5. Reference the build brief section list

In practice, a 600KB HTML file pasted into Claude will consume 150,000+ tokens. Claude's context limit means sources cannot also be loaded. The QA prompt assumes Claude can simultaneously hold the HTML file AND the source material — this is impossible in a single context window for any module larger than a small prototype.

The agent registry says to use Claude for QA and NotebookLM for cross-checking. But there is no documented multi-step protocol for how Claude conducts the structural audit (Domain C, D, E) while NotebookLM handles source verification (Domain A, B). These tasks need to be split across two sessions with a structured handoff — which is not defined anywhere in SHOS.  
**Resolution required:** Define a two-pass QA protocol:
- Pass 1: Claude Code performs structural audit (Domains C, D, E — no source needed)
- Pass 2: Claude performs academic audit (Domains A, B) with source extracts pasted
- Pass 3: NotebookLM cross-checks specific findings against uploaded sources
This is a significant workflow change requiring a new SOP and updates to Module 06 and Gate 5.

**Gap found — G5-02 (Medium):**  
The QA checklist (checklists/qa-checklist.md) and Module 06 (modules/06-qa-audit.md) both define the five audit domains and their items. They are nearly but not exactly identical. If they drift, audits will miss items.  
**Resolution required:** Either make the QA checklist a subset reference of Module 06, or designate Module 06 as canonical and make the checklist auto-generated from it.

**Gate 5 verdict:** G5-01 is a practical blocking issue for any real module. QA as specified cannot be executed in a single Claude session for a full-size hub.

---

### GATE 6 — Print QA (v1.0 Designation)

**Simulated inputs:**
- FOL178_S1_v0_9_MasterStudyHub.html (post-patch)
- Chrome browser
- print-checklist.md

**Expected outputs:**
- PDF in 07_print/
- Print Audit Report
- v1.0 file designation

**Responsible agent:** Print QA Inspector (Claude Code + Nicole)

**Document trace:**
- Module 07 prompt → Print Audit Report ✓
- print-spec.md → CSS validation ✓
- print-checklist.md → Step-by-step ✓

**Gap found — G6-01 (Low):**  
The print-spec.md defines margin as `15mm 20mm 15mm 25mm` (extra left for hole punch). The module-template.yaml defines `hole_punch_margin_mm: 25`. These are consistent, but neither document links to the other. A user reading only print-spec.md will not know this is configurable via module.yaml.

**Gate 6 verdict:** Mostly sound. The print workflow is the best-documented area of SHOS.

---

### GATES 7–9 — Revision Pack, Exam Pack, Archive

**Assessment:** These gates depend on earlier gates being clean. The revision pack and exam pack module prompts are well-structured and specific. The main risk is that they inherit any content accuracy problems from the master hub.

**Gap found — G7-01 (Medium):**  
Module 10 (Revision Pack) says "derive all content from the master hub and Tier 1 sources." However, the revision pack generator prompt does not instruct the agent to cross-check the hub content against sources — it trusts the hub is correct. If a P1 error slipped through Gate 5 (which G5-01 makes more likely), it will be replicated into the revision and exam packs.  
**Resolution required:** Add a targeted source spot-check to Module 10 for high-priority content. At minimum: verify all case names and formulas before building the revision pack.

**Gate 9 (Archive) verdict:** Sound. Archive manifest, module register, and folder verification are well-specified. No critical gaps.

---

## Simulated Production Cycle Summary

| Gate | Status | Critical Gaps | Passable? |
|------|--------|--------------|-----------|
| 1 | ⚠ Minor gaps | G1-01, G1-02 | Yes |
| 2 | ❌ Blocking gap | G2-01 (file access) | No without fix |
| 3 | ⚠ Usability gap | G3-01, G3-02 | Yes |
| 4 | ⚠ Config gap | G4-01 (module.yaml not wired in), G4-02 (CSS) | Yes with workaround |
| 5 | ❌ Blocking gap | G5-01 (context window) | No without protocol fix |
| 6 | ✓ Sound | G6-01 (minor) | Yes |
| 7 | ⚠ Inherited risk | G7-01 | Yes with workaround |
| 8 | ✓ Sound | None | Yes |
| 9 | ✓ Sound | None | Yes |
| 10 | ✓ Sound | None | Yes |

**Two blocking gaps prevent a clean first production run: G2-01 (file access protocol) and G5-01 (QA context window).** Both are solvable with protocol additions, not architectural changes.
