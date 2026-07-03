# Stress Test Report — SHOS v1.0

**Purpose:** Eleven adversarial scenarios designed to test SHOS v1.0 under conditions that will occur in real semester production.  
**Validation Date:** 2026-06-30  
**Module simulated:** FOL178 — Foundations of Law, Semester 1 2026  

Each scenario tests a specific failure mode. The question for each: does SHOS have a documented response, and is that response adequate?

---

## Scenario Index

| # | Scenario | Severity | SHOS Response | Verdict |
|---|---------|----------|--------------|---------|
| ST-01 | New lectures arrive before exam | Medium | Documented (Module 05) | Pass |
| ST-02 | Prescribed case changes after build | High | Documented (Module 05) | Pass |
| ST-03 | Assessment weighting changes | Medium | Documented (Module 03 rebuild) | Partial |
| ST-04 | No past papers available | Low | Implicit guidance only | Partial |
| ST-05 | Corrupted PDF source | Medium | Partial (Module 01) | Partial |
| ST-06 | Duplicate source detected | Low | Documented (Module 02) | Pass |
| ST-07 | Incorrect version selected for patching | Critical | Documented (version rules) | Pass |
| ST-08 | HTML fails print audit | High | Documented (Module 05/07 loop) | Pass |
| ST-09 | Revision pack missing key formulas | High | Partially documented | Partial |
| ST-10 | Case sheet omitted from law module | Medium | Gap — not enforced | Fail |
| ST-11 | Semester rollover interrupted mid-process | Medium | Partially documented | Partial |

---

## Scenario Detail

---

### ST-01 — New Lectures Arrive Before Exam

**Scenario:** FOL178 master hub (v1.0) has been produced and printed. Week 11 of 12, the lecturer posts a supplementary PDF covering new case law not in the hub.

**Test question:** Can SHOS handle a post-v1.0 content addition without disrupting the printed version or creating a version conflict?

**SHOS response documented?**  
Yes. Module 05 (HTML Patching) explicitly covers this:
- New content is added as a patch to the existing v1.0 file
- Patch produces v1.1 (not v2.0 — patch numbering convention)
- Printed v1.0 remains valid for earlier material
- A supplementary insert can be printed from the v1.1 file

**Gap found:**  
Module 05 does not specify whether a v1.1 patch requires a new QA audit. SOP-04 (Patch Existing HTML) says "re-run QA if > 3 changes" but a new lecture week of content would almost certainly exceed 3 changes. The trigger for a re-audit is clear, but the workflow for a "post-v1.0 audit producing v1.2" is not explicitly documented.

**Verdict:** Pass with minor documentation gap. Add a note to Module 05 clarifying that post-v1.0 patches which pass QA are designated v1.x, not v2.0.

---

### ST-02 — Prescribed Case Changes After Build

**Scenario:** The lecturer emails during Week 8 to say a case in the FOL178 curriculum has been replaced by a newer case. The hub (v1.0) already contains two full pages of FIRAC analysis for the removed case.

**Test question:** Can SHOS handle case substitution without orphaning the old case content or creating inconsistencies in the case sheets?

**SHOS response documented?**  
Partially. Module 05 supports targeted section replacement. However:

1. Case Sheets (Module 09) are separate files — updating the hub does not automatically flag that the corresponding case sheet is now stale
2. The revision pack (Gate 7) and exam pack (Gate 8) may have already been produced and will now contain the wrong case
3. There is no cross-reference mechanism linking case content in the hub to case sheets

**Resolution required:**  
Add a "cascading update checklist" to Module 05 for law content changes:
- [ ] Update case section in master hub
- [ ] Mark corresponding case sheet as STALE and regenerate
- [ ] If RevisionPack.html exists and is post-v1.0: re-run Module 10
- [ ] If ExamPack.html exists and is post-v1.0: re-run Module 11

**Verdict:** Pass for hub update. Fail for cascade tracking across derivative products. Resolution required before first law module production.

---

### ST-03 — Assessment Weighting Changes

**Scenario:** The build brief specified "essay = 40%, problem question = 60%." After Gate 3 approval, the lecturer changes the assessment to "essay = 30%, problem question = 50%, participation = 20%." The hub is now mid-production at Gate 4.

**Test question:** Does SHOS define what to do when build-brief.md becomes wrong mid-pipeline?

**SHOS response documented?**  
Partially. Gate 3 requires Nicole approval of the build brief before Gate 4 begins. But there is no documented "revise build brief after Gate 3 approval" procedure.

Module 03 covers initial build planning. It does not cover re-planning mid-pipeline.

**Gap:**  
If assessment weighting affects section priority (which it typically does), the build brief must be revised. Revising it after Gate 4 has started means:
- Gate 3 must be re-held (re-approval required)
- Gate 4 may need to restart or patch the section priorities
- module.yaml must be updated to reflect new assessment fields

No SOP or module covers this scenario explicitly.

**Verdict:** Partial. This is a real-world scenario that will occur. Add a "Build Brief Revision" sub-procedure to Module 03 covering what to do when inputs change post-approval.

---

### ST-04 — No Past Papers Available

**Scenario:** FOL178 is a new unit. No past exam papers exist. The exam pack prompt (Module 11) instructs the agent to "draw from past paper analysis." This input does not exist.

**Test question:** Does SHOS define behaviour when a normally-required input is absent?

**SHOS response documented?**  
Implicitly. Module 11 states the exam pack is built from "hub content + exam scope + past papers (if available)." The "if available" qualifier exists, but no guidance is given on what the agent does when past papers are absent — how does it structure the exam pack differently?

**Gap:**  
Module 11 should include a branch:
- IF past papers available: include predicted question types based on past patterns
- IF no past papers available: use assessment brief + topic weighting from module.yaml to infer likely question formats

**Verdict:** Partial. Low severity — "if available" is documented. But the alternative workflow is not specified.

---

### ST-05 — Corrupted PDF Source

**Scenario:** One of FOL178's Tier 1 lecture PDFs is corrupted. It opens in Preview but displays garbled text. The file appears to open, but the content is unreadable.

**Test question:** Does SHOS have a documented response to an unreadable source file?

**SHOS response documented?**  
Partially. Module 01 says "flag sources that cannot be opened for extraction." But:
- The source is not fully unopenable — it opens but is garbled
- The flag procedure does not specify: what happens next? Is the module paused? Does Nicole try to re-download? Does the corrupted file count against minimum Tier 1 source requirements?
- Module 02 holds at "minimum 2 Tier 1 sources" — if the corrupted file was one of 2 Tier 1 sources, Gate 2 cannot pass

**Gap:**  
Add a corrupted-source decision tree to Module 01:
1. Can the file be re-downloaded from LMS? → Re-download and replace
2. Can the file be opened in alternative software (browser PDF viewer)? → Extract text and save as .txt in processed/
3. Is the file truly unreadable? → Remove from source-manifest, flag coverage gap in source-audit, check whether Tier 1 minimum is still met

**Verdict:** Partial. Gap is low-severity because the workflow exists in principle. The specific decision path for partially-readable files is missing.

---

### ST-06 — Duplicate Source Detected

**Scenario:** During source audit, Module 02 identifies that two of the 13 submitted files are identical — same lecture PDF uploaded twice with slightly different filenames.

**Test question:** Does SHOS specify how to handle duplicate sources?

**SHOS response documented?**  
Yes. Module 02 includes a "duplicate file" detection step: identify files with identical content, retain one, mark the other as DUP in source-manifest.md, and note in source-audit.md. The canonical copy is the one with the correct naming convention.

**Verdict:** Pass. Well-handled. No action required.

---

### ST-07 — Incorrect Version Selected for Patching

**Scenario:** Nicole has v0.9 and v1.0 of the FOL178 hub in `02_builds/`. A patch is needed. She accidentally opens v0.9 for patching instead of v1.0.

**Test question:** Does SHOS prevent or detect patching of a non-current file?

**SHOS response documented?**  
Yes — with caveats. The version numbering convention makes this detectable:
- v0.9 filename does not contain "v1_0" → agent should query which version to use
- Module 04/05 both say to "confirm the current approved version before proceeding"

The gap found in production validation (G4-03) applies here: the "approved version check" in Module 04 is not mechanically enforceable. An agent reading the filename can infer from version number but cannot see inside the file to verify the watermark matches.

**Gap (known, G4-03):**  
The resolution proposed was: treat any file with `v1_0` or higher in the filename as approved; anything below is a draft. This is a deterministic rule the agent can follow without reading file contents.

**Verdict:** Pass — but only if G4-03 is resolved. The version naming convention, combined with the proposed G4-03 fix, makes this scenario handleable.

---

### ST-08 — HTML Fails Print Audit

**Scenario:** After Gate 5 passes, Gate 6 (Print Audit) finds that section backgrounds are not printing — `background-color` is rendering without the `-webkit-print-color-adjust: exact` declaration applying correctly.

**Test question:** Does SHOS have a documented fix-and-retest loop for print failures?

**SHOS response documented?**  
Yes. Module 07 (Print Audit) and SOP-07 (Prepare for Printing) both specify:
- Print failures trigger a patch via Module 05
- The patch addresses specific print CSS issues
- After patching, a targeted print re-check is run (full Gate 6 re-run if > 2 print failures)

The error library includes:
- ERR-004: Sidebar content printing unexpectedly → `@media print { .sidebar { display: none; } }`
- ERR-005: Background colours not printing → add `-webkit-print-color-adjust: exact !important`
- ERR-008: Missing @media print block → add complete block from print-spec.md

**Verdict:** Pass. Print failure and recovery is one of the best-documented workflows in SHOS.

---

### ST-09 — Revision Pack Missing Key Formulas

**Scenario:** After the revision pack is produced (Gate 7), Nicole notices that a key formula from Week 9 lectures is absent. The formula was in the master hub. The revision pack generator (Module 10) did not include it.

**Test question:** Does SHOS specify what to do when derivative products omit content present in the master hub?

**SHOS response documented?**  
Partially. Module 10 says to "derive all content from the master hub and Tier 1 sources" but does not specify a completeness check. The validation gap (G7-01) identified this: there is no spot-check for high-priority content in the revision pack generator.

**Gap:**  
The revision pack generator prompt needs an explicit instruction: "Before finalising, verify that all formula boxes (class `formula-box`) from the master hub are present in the revision pack. If any are absent, add them immediately."

For law modules: "Verify all case ratio statements from the master hub are present in the revision pack."

**Verdict:** Partial. The derivation instruction is there; the completeness verification is absent.

---

### ST-10 — Case Sheet Omitted From Law Module

**Scenario:** FOL178 has 8 prescribed cases. The master hub is complete (Gate 6 passed). The case sheet generator (Module 09) runs but produces only 6 case sheets. The other 2 were in source material but not in the agent's working list.

**Test question:** Does SHOS mechanically enforce that all required cases have case sheets?

**SHOS response documented?**  
No. This is a genuine gap.

Module 09 (Case Sheet Generator) takes the case list from module.yaml (`law.cases_required`) and generates sheets for those cases. But:
1. There is no gate that checks whether all `law.cases_required` cases have a corresponding case sheet file
2. Gate 6 (Print Audit) does not include a case sheet count check
3. The archive (Gate 9) does not verify case sheet completeness before archiving

**Resolution required:**  
Add to Gate 6 pass criteria (for law modules): "All cases listed in module.yaml `law.cases_required` have a corresponding case sheet in `09_case_sheets/`."

Add to Module 09 prompt: "Before completing, list all cases you were given and confirm a sheet was produced for each. If any are missing, produce them before exiting."

**Verdict:** Fail. A case sheet omission will not be caught by any gate in the current system. This is a genuine v1.0 gap requiring a Gate 6 criterion addition for law modules.

---

### ST-11 — Semester Rollover Interrupted Mid-Process

**Scenario:** Module 13 (Rollover) is in progress. Nicole has run the change analysis comparing last semester's hub to new sources, but the session ends before the new module.yaml is created or the new semester folder structure is initialised.

**Test question:** Does SHOS have checkpoints that allow a rollover to resume without restarting?

**SHOS response documented?**  
Partially. SOP-09 (Semester Rollover) lists steps sequentially but does not define checkpoint states — where in the process work has been saved and what can be skipped if resuming.

The module.yaml `build_status` fields track gate completion for a live module but do not have fields for rollover state.

**Gap:**  
Module 13 needs explicit resume points:
- Resume point A: Change analysis complete, new module.yaml not yet created
- Resume point B: New module.yaml created, new folder structure not yet initialised
- Resume point C: Folder structure initialised, source migration not yet run

**Verdict:** Partial. SOP-09 steps are clear enough that a careful user could resume manually, but there is no explicit checkpoint guidance.

---

## Summary

| Scenario | Verdict | Action required |
|----------|---------|----------------|
| ST-01 New lectures | Pass | Minor — document post-v1.0 patch versioning |
| ST-02 Case change | Partial | Add cascade update checklist to Module 05 |
| ST-03 Weighting change | Partial | Add Build Brief Revision sub-procedure |
| ST-04 No past papers | Partial | Add branch to Module 11 for absent past papers |
| ST-05 Corrupted PDF | Partial | Add corrupted-source decision tree to Module 01 |
| ST-06 Duplicate source | **Pass** | None |
| ST-07 Wrong version | Pass | Requires G4-03 resolution |
| ST-08 Print failure | **Pass** | None |
| ST-09 Revision pack gap | Partial | Add completeness check to Module 10 |
| ST-10 Case sheet omission | **Fail** | Add law case sheet gate criterion to Gate 6 |
| ST-11 Rollover interrupted | Partial | Add resume checkpoints to Module 13 |

**One outright failure (ST-10) and seven partial responses. No scenario causes complete system breakdown, but ST-10 is a systematic gap that will recur in every law module.**
