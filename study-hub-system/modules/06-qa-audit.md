# Module 06 — QA Audit

## Purpose

Systematically review a study hub HTML build for academic accuracy, structural completeness, source fidelity, and usability. This module is run after every build (Module 04) and after every significant patch (Module 05). It produces a prioritised list of issues for Module 05 to resolve.

---

## Inputs

- HTML file to audit
- `01_sources/source-audit.md` (source truth reference)
- `00_intake/build-brief.md` (structural completeness reference)
- Module type (Law / Quantitative / Mixed)
- NotebookLM QA reference (optional — use as cross-check, not primary source)

---

## Outputs

- `06_audit/[MODULE_CODE]_S[N]_[version]_AuditReport.md`
- Prioritised patch instruction list ready for Module 05

---

## Rules

1. The audit must reference sources — do not evaluate content from general knowledge alone.
2. NotebookLM outputs may be used as a cross-check but never as the sole basis for a finding.
3. Every issue must be specific: name the section, the problem, and the source that contradicts or supports the finding.
4. Do not suggest adding content that is not supported by a Tier 1 or Tier 2 source.
5. Separate academic issues (content accuracy) from structural issues (HTML, navigation, print) — they have different fix priorities.
6. Flag but do not fix issues. Fixes happen in Module 05.

---

## Audit Domains

### Domain A — Academic Accuracy
These issues must be resolved before the file reaches v1.0.

| Check | Applies To |
|-------|-----------|
| All key cases cited correctly (name, court, year) | Law |
| Case ratio decidendi accurately stated | Law |
| Legal tests stated with correct elements | Law |
| Doctrine presented without oversimplification | Law |
| Statutory provisions quoted accurately | Law |
| All formulas correct | Quantitative |
| Formula variable definitions accurate | Quantitative |
| Worked example calculations verified | Quantitative |
| Interpretation rules match source | Quantitative |
| No AI-generated content presented as primary source | All |
| No invented academic content | All |

### Domain B — Coverage Completeness
| Check | Applies To |
|-------|-----------|
| All topics in build brief are present | All |
| All examinable topics marked High priority are present | All |
| All key cases from source list are present | Law |
| All required formulas are present | Quantitative |
| Practice questions present | All |
| Exam tips present | All |
| Quick revision section present | All |

### Domain C — Structure and Navigation
| Check | Applies To |
|-------|-----------|
| All sidebar links resolve | All |
| No duplicate section IDs | All |
| Section headings follow build brief naming | All |
| Sections in correct order | All |
| No broken internal anchors | All |
| Expand/collapse working (if present) | All |

### Domain D — Print Readiness
| Check | Applies To |
|-------|-----------|
| `@media print` CSS present | All |
| A4 page size specified | All |
| Page breaks before major topics | All |
| Background graphics enabled in CSS | All |
| Sidebar hidden in print | All |
| Interactive elements hidden in print | All |
| Version watermark present in footer | All |
| No content cut off at page edges | All |

### Domain E — Usability
| Check | Applies To |
|-------|-----------|
| File opens in Chrome without errors | All |
| Colour theme consistent throughout | All |
| Font legible at normal screen size | All |
| Law: doctrine → test → application flow clear | Law |
| Quant: formula → method → example flow clear | Quantitative |

---

## Issue Priority Scale

| Priority | Label | Meaning |
|----------|-------|---------|
| P1 | Critical | Academic inaccuracy. Must fix before printing. |
| P2 | Major | Missing examinable content. Must fix before v1.0. |
| P3 | Standard | Structural or navigation problem. Fix before printing. |
| P4 | Minor | Usability or cosmetic. Fix if time allows. |
| P5 | Enhancement | Improvement beyond current scope. Log for future. |

---

## Audit Report Format

```markdown
# QA Audit Report

## Module: [MODULE_CODE] [Full Name]
## Version Audited: [vX.X]
## Audit Date: [Date]
## Auditor: [Claude / Manual / NotebookLM cross-check]

---

## Summary

| Domain | Issues Found | Critical | Major | Standard | Minor |
|--------|-------------|----------|-------|----------|-------|
| A — Academic Accuracy | | | | | |
| B — Coverage Completeness | | | | | |
| C — Structure & Navigation | | | | | |
| D — Print Readiness | | | | | |
| E — Usability | | | | | |
| **Total** | | | | | |

---

## Issues

### [Issue ID] — [Priority] — [Domain]
**Location:** [Section name and ID]
**Problem:** [Exact description of the problem]
**Source:** [Which source contradicts or supports this]
**Recommended patch:** [What needs to change]

[Repeat for each issue]

---

## Positive Findings
[List anything that is well-done and should not be changed]

---

## Verdict

- [ ] **DO NOT PRINT** — Critical or Major issues unresolved
- [ ] **PATCH REQUIRED** — Standard or Minor issues found
- [ ] **PRINT CANDIDATE** — All P1 and P2 issues resolved
- [ ] **APPROVED v1.0** — All issues resolved, ready to name v1.0

---

## Patch Instructions (for Module 05)
[Export numbered patch instructions here for immediate use]
```

---

## Quality Checks

- [ ] All five domains audited
- [ ] Every issue assigned a priority
- [ ] Every issue references a specific source
- [ ] No suggestions based on general knowledge without source support
- [ ] NotebookLM cross-check noted if used
- [ ] Verdict clearly stated
- [ ] Patch instructions ready for Module 05

---

## Reusable Prompt — QA Audit

```
You are running Module 06 QA Audit for the Nix Study Hub Production System.

MODULE: [MODULE_CODE] — [Full Name], [Semester]
MODULE TYPE: [Law / Quantitative / Mixed]
FILE TO AUDIT: [filename and version]

SOURCE TRUTH: [Paste coverage analysis from source-audit.md]
BUILD BRIEF: [Paste section list from build-brief.md]

TASK:
Audit the HTML across five domains:
  A — Academic Accuracy
  B — Coverage Completeness
  C — Structure and Navigation
  D — Print Readiness
  E — Usability

For each issue found:
- State the domain
- Assign priority (P1 Critical / P2 Major / P3 Standard / P4 Minor / P5 Enhancement)
- State the exact location (section name and ID)
- Describe the problem precisely
- Reference the source that supports the finding
- Write a patch instruction

Do not suggest adding content without a Tier 1 or Tier 2 source.
Do not fix anything. List issues only.
State a clear verdict at the end.

OUTPUT: Complete AuditReport.md with patch instructions.
```

---

## Common Failure Points

- Raising findings based on AI knowledge rather than sources (creates unreliable patches)
- Missing print CSS domain entirely (very common in first audits)
- Conflating "would be nice to have" with actual source-supported gaps
- Not referencing the build brief when checking completeness
- Duplicate IDs going undetected (especially after patching)

---

## Automation Opportunities

| Task | Automatable | Difficulty | Time Saved |
|------|-------------|------------|------------|
| Detect duplicate IDs | Yes | Low | 5 min/audit |
| Validate sidebar links | Yes | Low | 5 min/audit |
| Check print CSS present | Yes | Low | 3 min/audit |
| Cross-check section list against build brief | Yes | Medium | 10 min/audit |
| Run formula validation (quantitative) | Future | High | 15 min/audit |
| NotebookLM auto cross-check | Partial | Medium | 20 min/audit |
