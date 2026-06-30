# Module 13 — Module Rollover

## Purpose

Update an existing study hub from a previous semester for reuse in a new semester. The goal is to never rebuild from scratch when a previous version exists. This module identifies exactly what has changed, updates only those parts, and produces a new approved version without touching the archived original.

---

## Inputs

- Archive index from previous semester (Module 12 output)
- Previous approved study hub (from archive)
- New semester source files (new lectures, updated cases, revised legislation, new assessment structure)
- Source audit from previous semester (for comparison)
- Module register from previous semester

---

## Outputs

- New module folder following standard structure (new semester)
- New `00_intake/module-register.md` for new semester
- Change analysis report: what has changed vs previous semester
- Updated HTML build (v0.8 in new semester) via Module 04 or Module 05
- New source audit for new semester

---

## Rules

1. Never modify archived files. The previous semester archive is read-only.
2. The rollover begins with a fresh module folder for the new semester.
3. The previous hub HTML is the starting point — copy it to the new builds folder as `v0_7_RolledOver.html` before any changes.
4. The change analysis must be completed before any patching begins.
5. Only changed content is updated. Unchanged content is preserved exactly.
6. The rollover does not reset the version counter — the new semester hub begins where the previous one was strongest.

---

## Change Analysis Categories

| Category | Example | Action Required |
|----------|---------|-----------------|
| New lecture content | New topic added to module | Add section via Module 04/05 |
| Updated case law | New case replaces old authority | Update case sheet and hub section |
| Repealed/amended legislation | Statutory provision changed | Update all references |
| Removed topic | Topic no longer examinable | Mark as non-current in hub (do not delete) |
| New assessment structure | Exam now 40% instead of 30% | Update module register and exam pack |
| Updated exam scope | New topics confirmed examinable | Reprioritise revision pack |
| Improved explanations | Better source available | Patch relevant section |
| Print layout improvements | Better CSS available | Apply via Module 05 |
| No change | Section identical to previous semester | Carry forward unchanged |

---

## Rollover Process

**Step 1 — Copy archive**
- Create new semester module folder
- Copy previous hub to `02_builds/[MODULE_CODE]_S[N]_v0_7_RolledOver.html`
- Copy previous source-audit.md and build-brief.md to `00_intake/` as `_prev_semester` versions

**Step 2 — New source intake**
- Run Module 01 Intake for new semester sources
- Run Module 02 Source Audit comparing new sources to previous semester sources

**Step 3 — Change analysis**
- Produce change analysis report (see format below)
- For each change: classify by category and recommended action

**Step 4 — Build planning**
- Run Module 03 Build Planning (abbreviated — focus on changes only)
- Produce a change-focused build brief that references the rollover file as the base

**Step 5 — Patch or rebuild sections**
- For changed sections: Module 05 Patching
- If changes are structural or affect more than 60% of the hub: Module 04 Rebuild
- For cover sheets: regenerate via Module 08 if topics changed
- For case sheets: update only affected cases via Module 09

**Step 6 — QA and Print Audit**
- Run Module 06 QA Audit on the new version
- Run Module 07 Print Audit before printing

---

## Change Analysis Report Format

```markdown
# Rollover Change Analysis

## Module: [MODULE_CODE] [Full Name]
## Previous Semester: [Semester Year]
## New Semester: [Semester Year]
## Analysis Date: [Date]

---

## New Sources in This Semester
| Source | Classification | What It Contains |
|--------|----------------|-----------------|
| | | |

## Sources Removed or Superseded
| Previous Source | Status | Replacement |
|----------------|--------|-------------|
| | | |

---

## Changes by Section

| Section | Change Type | Previous State | New State | Action Required |
|---------|-------------|----------------|-----------|-----------------|
| | | | | |

---

## Unchanged Sections (carry forward as-is)
- [List sections requiring no changes]

---

## Recommended Approach
- [ ] Patch (< 40% of content changed) → Use Module 05
- [ ] Partial rebuild (40–60% changed) → Rebuild changed topics via Module 04
- [ ] Full rebuild (> 60% changed) → Full Module 04 rebuild from new brief

---

## Estimated Build Time
[Based on change volume]
```

---

## Quality Checks

- [ ] Previous semester archive is read-only and untouched
- [ ] Rollover copy correctly named in new semester builds folder
- [ ] Change analysis completed before any patching
- [ ] Only changed sections updated (unchanged sections preserved)
- [ ] New semester module register created
- [ ] New source audit completed
- [ ] QA Audit run on updated hub
- [ ] Print Audit run before printing

---

## Reusable Prompt — Rollover Change Analysis

```
You are running Module 13 Module Rollover for the Nix Study Hub Production System.

MODULE: [MODULE_CODE] — [Full Name]
PREVIOUS SEMESTER: [Semester Year]
NEW SEMESTER: [Semester Year]

PREVIOUS SOURCE AUDIT (summary):
[Paste Coverage Analysis from previous semester source-audit.md]

NEW SOURCES AVAILABLE:
[List new source files and their contents]

PREVIOUS HUB STRUCTURE:
[Paste section list from previous semester build-brief.md]

TASK:
1. Compare new sources against previous semester sources.
2. Identify: new content, updated content, removed content, unchanged content.
3. Classify each change by category (new lecture / updated case / amended legislation / etc.).
4. Recommend action for each changed section (patch / rebuild / carry forward).
5. Estimate whether the overall change volume requires patching or full rebuild.
6. Do not modify any archived files.
7. Do not begin patching — analysis only.

OUTPUT: Complete change analysis report.
```

---

## Common Failure Points

- Treating the rollover as a rebuild (wastes all previous work)
- Modifying the archived version instead of working from a copy
- Not detecting removed or superseded sources (leaves outdated content in hub)
- Skipping the change analysis and going straight to patching (causes missed changes)
- Updating case sheets for cases that were not actually changed

---

## Automation Opportunities

| Task | Automatable | Difficulty | Time Saved |
|------|-------------|------------|------------|
| Diff new sources against previous semester sources | Future | High | 30 min/module |
| Identify changed lecture slides by content | Future | High | 20 min/module |
| Auto-detect amended legislation references | Future | High | 15 min/module |
| Generate change analysis skeleton from folder diff | Yes | Medium | 15 min/module |
