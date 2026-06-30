# SOP-04 — Patch an Existing HTML

**Trigger:** QA Audit (Module 06) or Print Audit (Module 07) finds issues, or a specific correction is needed.

**Time required:** 15–45 minutes depending on patch volume

---

## Steps

**1. Identify the source file**
- Confirm the exact filename and version of the file to patch
- Confirm it is not already an archived/approved file
- If it is v1.0 or later: the patch produces v1.1 (not a replacement of v1.0)

**2. Determine the target filename**
- Increment the version number
- Example: `FOL178_S1_v0_9_MasterStudyHub.html` → `FOL178_S1_v1_0_MasterStudyHub.html`
- Never overwrite the source file

**3. Write numbered patch instructions**
Use the Patch Instruction Format from Module 05:
```
PATCH 01 — [What is being fixed]
Location: [Section name and ID]
Action: [Insert / Replace / Delete / Fix]
Content: [New content or change]
Source: [Which source supports this change]
```

**4. Run Module 05 HTML Patching prompt**
Give Claude Code:
- Source file path
- Target file path (new name)
- Numbered patch instructions
- Safety rules (do not overwrite, do not delete, do not push)

**5. Verify the patch**
- Open the new file in Chrome
- Confirm each patch was applied
- Check sidebar still works
- Check no duplicate IDs were introduced
- Check print preview still valid

**6. Complete the patch log**
Record every change in `06_audit/[MODULE_CODE]_S[N]_[version]_PatchLog.md`

**7. Update the module register**
Record the new version in the build status table

---

## Completion Check

- [ ] Source file untouched
- [ ] New file correctly named and in `02_builds/`
- [ ] All patches verified
- [ ] Patch log completed
- [ ] Module register updated

---

## Do Not Proceed With Patching If

- More than 60% of the content needs to change (trigger Module 04 Rebuild instead)
- The patch instructions are ambiguous (clarify before patching)
- The source file is an approved archived version from a previous semester
