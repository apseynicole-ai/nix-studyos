# Module 03 — Build Planning

## Purpose

Design the exact structure of the study hub before any HTML is written. This module converts source material and module type into a precise build brief that Claude Code follows without ambiguity. A strong build plan eliminates rebuilds.

---

## Inputs

- `00_intake/module-register.md`
- `01_sources/source-audit.md`
- Module type (Law / Quantitative / Mixed)
- Exam scope (if known)
- Assessment weightings (if known)

---

## Outputs

- `00_intake/build-brief.md` — full build specification
- Topic list with section order and priority
- Feature list (sidebar, tabs, search, collapse, etc.)
- Colour theme selected from system-config.md or custom defined
- Print layout requirements
- Law-specific requirements (case hub, FIRAC, doctrine flow)
- Quantitative-specific requirements (formula blocks, worked examples)

---

## Rules

1. No HTML is written in this module.
2. The build brief must be specific enough that a developer reading it cold could build the correct HTML.
3. Topics must be ordered by exam priority if scope is known, otherwise by module sequence.
4. Every section in the build brief must map to at least one Tier 1 or Tier 2 source.
5. Sections with only Tier 3 source coverage must be flagged in the brief.
6. Do not add sections based on general knowledge. Only include what the sources support.

---

## Build Brief Format

```markdown
# Build Brief

## Module: [MODULE_CODE] [Full Name]
## Semester: [Semester and Year]
## Build Date: [Date]
## Module Type: [Law / Quantitative / Mixed]
## Target File: [MODULE_CODE]_S[N]_v0_8_MasterStudyHub.html

---

## Hub Purpose
[One paragraph: what this hub is for and how it will be used]

## Colour Theme
- Primary: [hex]
- Accent: [hex]
- Background: [hex]
- Typography: [font stack]

## Features Required
- [ ] Sidebar navigation
- [ ] Topic tabs or sections
- [ ] Expand/collapse sections
- [ ] In-page search
- [ ] Print CSS (A4 portrait, background graphics, page breaks)
- [ ] Mobile-friendly layout
- [ ] Version watermark in print footer
- [Add or remove as needed]

---

## Section Structure

### Section 1: Module Overview
- Source: [source codes]
- Contents: module summary, learning outcomes, assessment overview, exam scope
- Priority: High

### Section 2: [Topic Name]
- Source: [source codes]
- Contents: [what goes in this section]
- Priority: [High / Medium / Low]
- Law extras: [doctrine, legal test, key cases, FIRAC application]
- Quant extras: [formulas, worked examples, interpretation rules]
- Flags: [any coverage gaps or Tier 3 source warnings]

[Repeat for each topic]

### Final Section: Quick Revision
- Source: Derived from all above
- Contents: one-page summaries, memory triggers, exam traps
- Priority: High

---

## Law Module Extras (if applicable)
- Case Hub required: [Yes / No]
- Case list: [list all cases to include]
- FIRAC templates required: [Yes / No]
- Statutory/constitutional extracts required: [Yes / No]
- Essay template required: [Yes / No]
- Problem-question framework required: [Yes / No]
- Doctrine → test → application flow: Required throughout

## Quantitative Module Extras (if applicable)
- Formula reference sheet required: [Yes / No]
- Formula list: [list all formulas]
- Worked examples required: [Yes / No]
- Graph/diagram descriptions required: [Yes / No]
- Calculation frameworks required: [Yes / No]
- Common mistakes section required: [Yes / No]

---

## Print Requirements
- Paper size: A4
- Orientation: Portrait (landscape only for wide tables if necessary)
- Colour: Full colour with background graphics
- Double-sided: Yes
- Print break points: Between major topics
- Cover sheets: Separate file (Module 08)
- Case sheets: Separate file (Module 09, law only)

---

## QA Priorities for This Module
[List the top 5 things most likely to go wrong in this specific build]

---

## Approval
- [ ] Build brief reviewed and approved before HTML production begins
```

---

## Quality Checks

- [ ] Every section maps to at least one Tier 1 or Tier 2 source
- [ ] Tier 3 only sections flagged
- [ ] Topic order is logical (exam priority or module sequence)
- [ ] Colour theme selected
- [ ] Feature list complete
- [ ] Law extras addressed if module type is Law
- [ ] Quantitative extras addressed if module type is Quantitative
- [ ] Print requirements specified
- [ ] Target filename follows naming convention
- [ ] Build brief approved before Module 04 begins

---

## Reusable Prompt — Build Planning

```
You are running Module 03 Build Planning for the Nix Study Hub Production System.

MODULE: [MODULE_CODE] — [Full Name], [Semester]
MODULE TYPE: [Law / Quantitative / Mixed]

SOURCE AUDIT SUMMARY:
[Paste the Coverage Analysis section from source-audit.md]

EXAM SCOPE (if known):
[List confirmed examinable topics or state "Unknown"]

TASK:
1. Design the complete section structure for the study hub.
2. Order sections by exam priority (if scope known) or module sequence.
3. For each section: specify sources, contents, and priority.
4. Flag any sections with only Tier 3 source coverage.
5. Select the colour theme from system-config.md for this module type.
6. List all required features.
7. For law modules: plan case hub, FIRAC templates, doctrine flow, essay and problem-question templates.
8. For quantitative modules: plan formula blocks, worked examples, calculation frameworks.
9. Specify print requirements.
10. Do not write any HTML.
11. Do not invent content.

OUTPUT: Complete build-brief.md.
```

---

## Common Failure Points

- Starting HTML production before the build brief is approved
- Including sections not supported by any source
- Forgetting print CSS requirements at the planning stage (causes expensive patching later)
- Under-specifying law case requirements (causes incomplete case hub in v0.8)
- Over-specifying features (collapse, search, tabs) before confirming they are actually needed

---

## Automation Opportunities

| Task | Automatable | Difficulty | Time Saved |
|------|-------------|------------|------------|
| Auto-generate section list from module framework | Future | High | 20 min/module |
| Pre-fill colour theme from module type | Yes | Low | 2 min/module |
| Generate feature checklist from module type | Yes | Low | 5 min/module |
| Map sources to topics automatically | Future | High | 15 min/module |
