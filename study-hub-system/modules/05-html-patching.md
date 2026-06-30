# Module 05 — HTML Patching

## Purpose

Apply targeted changes to an existing HTML build without rebuilding from scratch. Patching is the standard update method. Rebuilding is the exception. This module is used after every QA Audit or Print Audit that finds problems.

---

## Inputs

- Existing HTML file path (the file to patch)
- Patch instruction list (from Module 06 QA Audit or Module 07 Print Audit or manual instruction)
- Target output filename (always a new version — never overwrite the source file)
- Module register and build brief for context

---

## Outputs

- New HTML file with incremented version number in `02_builds/`
- `06_audit/[MODULE_CODE]_S[N]_[version]_PatchLog.md` — record of what was changed

---

## Rules

1. Never overwrite the source file. Always write to a new filename with an incremented version.
2. Apply only the changes specified in the patch instruction. Do not "improve" unrequested sections.
3. Do not restructure sections that were not flagged for change.
4. Do not delete content unless the patch instruction explicitly says to remove it.
5. Do not rename, move, or reorganise IDs unless the patch instruction requires it.
6. If a patch instruction is ambiguous, stop and ask for clarification before proceeding.
7. After patching, verify that the patch was applied correctly before closing.
8. Record every change in the patch log.

---

## When to Patch vs When to Rebuild

### Patch when:
- Specific content is missing or inaccurate
- Print CSS needs adjustment
- Sidebar links are broken
- Duplicate IDs exist
- A section needs expansion or correction
- A case summary needs updating
- A formula needs correcting
- Layout improvements are needed
- QA or Print Audit found specific issues

### Rebuild (Module 04) when:
- The entire structure is wrong
- More than 60% of sections need rework
- The HTML template or colour scheme is being replaced entirely
- A major new source changes the fundamental scope of the module
- The file is corrupted beyond repair

---

## Patch Instruction Format

Each patch should be written as a discrete, numbered instruction:

```markdown
## Patch Instructions — [MODULE_CODE] [Version] → [New Version]

### Source File: [path/filename]
### Target File: [path/new_filename]

---

PATCH 01 — Add missing case [Case Name]
Location: Section "Contract Formation" (id="contract-formation")
Action: Insert after the existing case list.
Content: [Full case summary to insert]
Source: [source file reference]

PATCH 02 — Fix formula in Section 4.2
Location: Section "Regression Analysis" (id="regression-analysis"), formula block id="formula-regression-01"
Action: Replace formula text.
Old: Y = a + bX
New: Ŷ = β₀ + β₁X
Source: SDS188_LS_Topic4_Regression.pdf, slide 12

PATCH 03 — Fix print CSS: page break before Topic 3
Location: <style> block, @media print section
Action: Add page-break-before: always to #topic-3
Source: Print audit

[Continue for each patch]
```

---

## Patch Log Format

```markdown
# Patch Log

## Module: [MODULE_CODE]
## Source Version: [vX.X]
## Target Version: [vX.X]
## Patch Date: [Date]
## Patches Applied: [N]

| # | Location | Action | Source | Status |
|---|----------|--------|--------|--------|
| 01 | | | | Applied |
| 02 | | | | Applied |

## Notes
[Any issues encountered during patching]

## Verification
- [ ] All patches applied as instructed
- [ ] No unintended changes made
- [ ] New file opens without errors in Chrome
- [ ] Sidebar navigation still works
- [ ] No new duplicate IDs introduced
- [ ] Print CSS still valid
- [ ] Version number updated in file title and footer watermark
```

---

## Quality Checks

- [ ] Source file untouched
- [ ] New file has correct incremented version number in filename
- [ ] Version watermark in HTML footer updated
- [ ] All patch instructions applied
- [ ] No unintended changes made outside patch scope
- [ ] No duplicate IDs introduced
- [ ] Sidebar links still resolve
- [ ] Print CSS still valid
- [ ] Patch log completed

---

## Reusable Prompt — HTML Patching

```
You are running Module 05 HTML Patching for the Nix Study Hub Production System.

MODULE: [MODULE_CODE] — [Full Name], [Semester]
SOURCE FILE: [path/existing_filename] (do not modify this file)
TARGET FILE: [path/new_filename] (write output here)

PATCH INSTRUCTIONS:
[Paste numbered patch instructions]

TASK:
1. Apply each patch exactly as instructed.
2. Do not change anything outside the specified patch locations.
3. Do not delete, restructure, or rename sections not mentioned in the patch instructions.
4. If a patch instruction is ambiguous, stop and ask before proceeding.
5. After applying all patches, verify each was applied correctly.
6. Update the version number in the HTML title and footer watermark.
7. Produce a completed patch log.

SAFETY:
- Do not modify the source file.
- Do not overwrite any existing file.
- Do not delete, rename, or move any file.
- Do not stage, commit, or push changes.

OUTPUT:
1. [path/new_filename] — patched HTML
2. [MODULE_CODE]_S[N]_[version]_PatchLog.md — patch record
```

---

## Common Failure Points

- Accidentally modifying the source file instead of writing to a new file
- Making "improvements" outside the patch scope that introduce new problems
- Changing section IDs during a patch (breaks existing sidebar links)
- Version number not updated in the HTML title or footer watermark
- Patch applied to wrong section (duplicate section names causing confusion)
- Patch log not completed

---

## Automation Opportunities

| Task | Automatable | Difficulty | Time Saved |
|------|-------------|------------|------------|
| Generate patch instructions from audit report | Future | High | 15 min/patch |
| Auto-verify patch was applied | Yes | Medium | 5 min/patch |
| Check for duplicate IDs post-patch | Yes | Low | 3 min/patch |
| Auto-increment version in filename and watermark | Yes | Low | 2 min/patch |
| Diff source vs target and generate patch log | Yes | Medium | 10 min/patch |
