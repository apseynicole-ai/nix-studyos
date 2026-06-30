# Module 02 — Source Audit

## Purpose

Review, classify, and quality-assess every source before any build begins. This module protects against building a hub on incomplete, unreliable, or misunderstood source material. It produces the definitive source list that all later modules reference.

---

## Inputs

- `00_intake/module-register.md` (completed in Module 01)
- All source files in `01_sources/raw/`
- Module type (Law / Quantitative / Mixed)

---

## Outputs

- `01_sources/source-audit.md` — complete source audit report
- `01_sources/processed/` — renamed, classified copies of all usable sources
- Updated `00_intake/module-register.md` — source inventory updated with audit status
- Source coverage gap analysis — list of topics likely covered and topics with no source coverage

---

## Rules

1. Do not modify raw files. Work from copies in `01_sources/processed/`.
2. Rename processed copies using the system naming convention.
3. Classify every source by type (see classification table below).
4. Assign a reliability tier to every source (see tier definitions below).
5. Flag AI-generated material as Tier 3 regardless of apparent quality.
6. If a source is an unreadable PDF, classify as `UNUSABLE` and do not include in build.
7. If two sources cover the same content, note the overlap and identify the primary source.

---

## Source Classification Table

| Classification | Code | Description |
|---------------|------|-------------|
| Lecture slides | LS | Official slides from the lecturer |
| Lecture notes | LN | Typed notes from lectures |
| Tutorial document | TD | Tutorial questions and answers |
| Assessment document | AD | Assignment or exam instructions |
| Prescribed reading | PR | Textbook chapters or required readings |
| Case document | CD | Law cases — full text or extracts |
| Statutory extract | SE | Legislation or constitutional provisions |
| Past paper | PP | Previous exam papers |
| Marking guidance | MG | Marking rubrics or examiner comments |
| AI-generated output | AI | Any output from ChatGPT, Claude, NotebookLM, etc. |
| Personal notes | PN | Student's own handwritten or typed notes |
| Unknown | UK | Source cannot be classified |

---

## Reliability Tiers

| Tier | Label | Description |
|------|-------|-------------|
| 1 | Primary | Official university or publisher source. Use as ground truth. |
| 2 | Supplementary | Credible secondary source. Use to support Tier 1. |
| 3 | Reference only | AI-generated, personal notes, or unverified. Never use as sole source. |
| X | Unusable | Unreadable, corrupted, or irrelevant. Exclude from build. |

---

## Processed File Naming Convention

```
[MODULE_CODE]_[Classification_Code]_[Short_Description].[ext]
```
Examples:
```
FOL178_LS_Topic1_IntroToLaw.pdf
FOL178_CD_CapitalBank_v_Carter_2019.pdf
FOL178_TD_Tutorial3_ContractFormation.docx
SDS188_LS_Topic4_Regression.pdf
SDS188_PP_2024_Exam.pdf
```

---

## Source Audit Report Format

```markdown
# Source Audit Report

## Module: [MODULE_CODE] [Full Name]
## Semester: [Semester and Year]
## Audit Date: [Date]
## Auditor: [Claude / Manual]

---

## Source Summary

| # | Processed Name | Classification | Tier | Topics Covered | Notes |
|---|---------------|----------------|------|----------------|-------|
| | | | | | |

---

## Coverage Analysis

### Topics with Strong Source Coverage (Tier 1 or 2 present)
- [List topics]

### Topics with Weak Coverage (Tier 3 only or partial)
- [List topics with recommended action]

### Topics with No Source Coverage
- [List topics — flag for build planning]

---

## Risks and Flags
- [Any sources that are AI-generated and need extra QA]
- [Any gaps in coverage]
- [Any conflicting information across sources]
- [Any unreadable or unusable files]

---

## Recommendation
[Proceed to Build Planning / Resolve gaps first / Do not proceed until X is resolved]
```

---

## Quality Checks

- [ ] Every raw source has a corresponding processed copy
- [ ] Every source classified and tiered
- [ ] No AI-generated source classified above Tier 3
- [ ] Coverage gap analysis completed
- [ ] No unusable sources included in build-ready list
- [ ] Processed filenames follow naming convention
- [ ] Audit report signed off before Module 03 begins

---

## Reusable Prompt — Source Audit

```
You are running Module 02 Source Audit for the Nix Study Hub Production System.

MODULE: [MODULE_CODE] — [Full Name], [Semester]
MODULE TYPE: [Law / Quantitative / Mixed]

SOURCES TO AUDIT:
[List each source with filename, format, and brief description of what it contains]

TASK:
1. Classify each source using the Source Classification Table (LS, LN, TD, AD, PR, CD, SE, PP, MG, AI, PN, UK).
2. Assign a Reliability Tier to each source (1 = Primary, 2 = Supplementary, 3 = Reference only, X = Unusable).
3. Identify which topics each source covers.
4. Produce a Coverage Analysis: strong coverage, weak coverage, no coverage.
5. List all risks and flags.
6. Recommend whether to proceed to Build Planning or resolve gaps first.
7. Do not begin building the study hub.
8. Do not invent content to fill coverage gaps.

OUTPUT: Complete source-audit.md.
```

---

## Common Failure Points

- Treating NotebookLM outputs or ChatGPT summaries as Tier 1 sources
- Missing tutorial documents that contain examinable material
- Failing to detect duplicate sources (same content, different filenames)
- Moving to Build Planning before a critical source gap is resolved
- Not flagging AI-generated HTML builds from previous attempts as Tier 3

---

## Automation Opportunities

| Task | Automatable | Difficulty | Time Saved |
|------|-------------|------------|------------|
| Auto-classify by filename pattern | Partial | Medium | 10 min/module |
| Detect duplicate content across files | Yes | High | 10 min/module |
| Generate coverage matrix from module framework | Future | High | 20 min/module |
| Flag AI-generated files by metadata | Partial | Medium | 5 min/module |
