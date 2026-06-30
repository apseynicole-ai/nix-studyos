# Quality Gate Framework

**Version:** 1.0  
**Purpose:** Mandatory production gates that enforce the correct sequential workflow. No stage may proceed until the previous gate is passed and signed off.

**Principle:** A gate is not a checklist. It is a decision point with a binary outcome: pass or hold.

---

## Gate Overview

```
GATE 1 — Module Intake Complete
         ↓
GATE 2 — Source Audit Passed
         ↓
GATE 3 — Build Plan Approved
         ↓
GATE 4 — HTML v0.8 Produced
         ↓
GATE 5 — Academic QA Passed
         ↓
GATE 6 — Print QA Passed → v1.0 designation
         ↓
GATE 7 — Revision Pack Complete
         ↓
GATE 8 — Exam Pack Complete
         ↓
GATE 9 — Semester Archive Complete
         ↓
GATE 10 — Module Rollover Ready (next semester)
```

---

## Gate Specifications

---

### GATE 1 — Module Intake Complete

**Prerequisite for:** Source Audit  
**Responsible agent:** Study Hub Architect + Source Auditor  
**Sign-off required:** Yes — Nicole reviews module register

**Pass criteria:**
- [ ] `00_intake/module.yaml` complete
- [ ] `00_intake/module-register.md` complete
- [ ] All available sources physically present in `01_sources/raw/`
- [ ] Every source listed in the source inventory
- [ ] Module type correctly identified (Law / Quantitative / Mixed)
- [ ] At least 2 Tier 1 sources available

**Hold criteria (any one = hold):**
- Module type is ambiguous
- Fewer than 2 Tier 1 sources available
- Key sources expected but not yet arrived (wait if within 1 week)

**Gate record:** Update `build_status.intake` in module.yaml to `"complete"`

---

### GATE 2 — Source Audit Passed

**Prerequisite for:** Build Planning  
**Responsible agent:** Source Auditor  
**Sign-off required:** Yes — Nicole reviews coverage gaps

**Pass criteria:**
- [ ] `01_sources/source-audit.md` complete
- [ ] `01_sources/source-manifest.md` complete
- [ ] Every source classified and tiered
- [ ] Coverage analysis completed for all topics
- [ ] No Tier 3-only topics for High-priority examinable topics
- [ ] No unresolved source conflicts

**Hold criteria (any one = hold):**
- Any High-priority examinable topic has zero Tier 1 or 2 source coverage
- Two Tier 1 sources directly contradict each other on a core principle
- Unresolved question about whether a key source is usable

**Gate record:** Update `build_status.source_audit` in module.yaml to `"complete"`

---

### GATE 3 — Build Plan Approved

**Prerequisite for:** HTML Production  
**Responsible agent:** Build Planner  
**Sign-off required:** Yes — Nicole approves build-brief.md before HTML begins

**Pass criteria:**
- [ ] `00_intake/build-brief.md` complete
- [ ] Every section maps to at least one Tier 1 or 2 source
- [ ] Tier 3-only sections explicitly flagged
- [ ] Topic ordering logical (exam priority where scope known)
- [ ] Colour theme selected
- [ ] Feature list complete
- [ ] Law extras specified (if law module)
- [ ] Quantitative extras specified (if quantitative module)
- [ ] Print requirements specified
- [ ] Nicole has reviewed and approved

**Hold criteria (any one = hold):**
- Nicole has not approved the build brief
- Any section has no source coverage at all
- Build brief is ambiguous about section structure

**Gate record:** Update `build_status.build_plan` in module.yaml to `"complete"`

---

### GATE 4 — HTML v0.8 Produced

**Prerequisite for:** Academic QA  
**Responsible agent:** HTML Builder  
**Sign-off required:** No — auto-proceeds to Gate 5

**Pass criteria:**
- [ ] HTML file exists at `02_builds/[MODULE]_S[N]_v0_8_*.html`
- [ ] File opens in Chrome without console errors
- [ ] All sections from build brief are present
- [ ] Sidebar navigation renders
- [ ] Print CSS block present (`@media print` detectable)
- [ ] Version watermark present in footer
- [ ] No external CDN dependencies
- [ ] No duplicate IDs

**Hold criteria (any one = hold):**
- File does not open in Chrome
- More than one section from build brief is absent
- No print CSS block

**Gate record:** Update `build_status.html_v08` in module.yaml to `"complete"`

---

### GATE 5 — Academic QA Passed

**Prerequisite for:** Print QA and v1.0 designation  
**Responsible agent:** QA Auditor  
**Sign-off required:** Yes — Nicole reviews QA report

**Pass criteria:**
- [ ] QA Audit report complete (all 5 domains)
- [ ] Zero P1 (Critical) issues outstanding
- [ ] Zero P2 (Major) issues outstanding
- [ ] All P1/P2 issues from previous audits confirmed resolved
- [ ] QA Auditor has declared "Print Candidate" verdict

**Hold criteria (any one = hold):**
- Any P1 issue unresolved
- Any P2 issue unresolved
- QA Auditor has declared "Do Not Print"
- Academic accuracy uncertainty not resolved with source reference

**When P3/P4 issues remain:**
- May proceed to Gate 6 with P3/P4 issues outstanding
- Must resolve P3 issues before printing if time allows

**Patch cycle:** P1/P2 issues → Module 05 Patch → Re-run Gate 5. Repeat until passed.

**Gate record:** Update `build_status.html_v10` in module.yaml to `"in-progress"`

---

### GATE 6 — Print QA Passed (v1.0 Designation)

**Prerequisite for:** Printing, Cover Sheets, Case Sheets  
**Responsible agent:** Print QA Inspector  
**Sign-off required:** Yes — Nicole reviews PDF before printing

**Pass criteria:**
- [ ] Print Audit Report complete
- [ ] PDF saved to `07_print/`
- [ ] Nicole has reviewed the PDF
- [ ] Sidebar hidden in print output
- [ ] Background colours printing
- [ ] Page breaks correct
- [ ] Content within A4 margins
- [ ] Version watermark on all pages
- [ ] File renamed to v1.0
- [ ] Watermark updated to "APPROVED PRINT CANDIDATE"

**Hold criteria:**
- PDF not yet saved or reviewed
- Sidebar visible in print output
- Background colours not printing
- Content cut at page edge

**Gate record:** Update `build_status.html_v10` in module.yaml to `"complete"`

---

### GATE 7 — Revision Pack Complete

**Prerequisite for:** Exam Pack  
**Responsible agent:** Revision Pack Builder  
**Sign-off required:** Yes — Nicole reviews before printing

**Pass criteria:**
- [ ] `05_revision/[MODULE]_S[N]_v1_0_RevisionPack.html` exists
- [ ] All High-priority topics have one-page summaries
- [ ] Law: case quick reference table complete
- [ ] Quantitative: formula sheet complete
- [ ] Night Before Review is one page
- [ ] 30-Minute Emergency Guide present

**Hold criteria:**
- Gate 6 not yet passed (must have approved v1.0 hub first)
- Exam scope not confirmed and Revision Pack structure depends on it

**Gate record:** Update `build_status.revision_pack` in module.yaml to `"complete"`

---

### GATE 8 — Exam Pack Complete

**Prerequisite for:** Semester Archive  
**Responsible agent:** Exam Pack Builder  
**Sign-off required:** Yes — Nicole reviews before exam

**Pass criteria:**
- [ ] `05_revision/[MODULE]_S[N]_v1_0_ExamPack.html` exists
- [ ] Exam logistics (date, time, format) confirmed and accurate
- [ ] Total pages within limit (10 general / 15 law)
- [ ] Night Before Review is one page
- [ ] 30-Minute Emergency Guide present and concise

**Hold criteria:**
- Exam date and format not yet confirmed
- Gate 7 not yet passed

**Gate record:** Update `build_status.exam_pack` in module.yaml to `"complete"`

---

### GATE 9 — Semester Archive Complete

**Prerequisite for:** Module Rollover  
**Responsible agent:** Archive Manager  
**Sign-off required:** Yes — Nicole confirms

**Pass criteria:**
- [ ] `08_archive/ARCHIVE_[MODULE]_S[N]_[YEAR].md` complete
- [ ] `08_archive/archive-manifest.md` complete
- [ ] All expected files verified present
- [ ] Reuse notes written
- [ ] No files deleted
- [ ] Module register fully updated

**Hold criteria:**
- Gate 8 not yet passed
- Key files missing from archive inventory

**Gate record:** Update `build_status.archive` in module.yaml to `"complete"`

---

### GATE 10 — Module Rollover Ready

**Prerequisite for:** Next semester build  
**Responsible agent:** Build Planner  
**Sign-off required:** Yes — Nicole confirms before next semester begins

**Pass criteria:**
- [ ] Gate 9 complete
- [ ] Rollover change analysis complete (Module 13)
- [ ] New semester module.yaml created
- [ ] Rollover copy present in new semester builds folder
- [ ] Nicole has confirmed rollover approach (patch / partial rebuild / full rebuild)

**Gate record:** Create new semester module.yaml with `build_status.intake: "complete"`

---

## Gate Status Dashboard

Use this summary table in each module register:

```
| Gate | Name | Status | Date | Notes |
|------|------|--------|------|-------|
| 1 | Module Intake | ○ Pending | | |
| 2 | Source Audit | ○ Pending | | |
| 3 | Build Plan | ○ Pending | | |
| 4 | HTML v0.8 | ○ Pending | | |
| 5 | Academic QA | ○ Pending | | |
| 6 | Print QA (v1.0) | ○ Pending | | |
| 7 | Revision Pack | ○ Pending | | |
| 8 | Exam Pack | ○ Pending | | |
| 9 | Archive | ○ Pending | | |
| 10 | Rollover Ready | ○ Pending | | |
```

Status values: `○ Pending` | `⏳ In Progress` | `✓ Passed` | `⚠ Hold`

---

## Gate Bypass Policy

No gate may be bypassed without Nicole's explicit written instruction in the module register.

If a gate is bypassed, the reason must be recorded and any increased risk acknowledged.

Permitted bypass scenarios:
- Gate 7 and 8: If exams are cancelled or assessment structure changes
- Gate 10: If the module will not run the following semester

Bypassed gates must be recorded as: `✓ Bypassed — [Reason] — [Date]`
