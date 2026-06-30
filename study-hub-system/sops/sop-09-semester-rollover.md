# SOP-09 — Semester Rollover

**Trigger:** A new semester begins and a previous hub exists for the same or a related module.

**Time required:** 1–3 hours depending on the volume of changes

---

## Steps

**1. Confirm the archive is complete**
- Previous semester Module 12 Archive must be complete
- Archive index must be present in `08_archive/`
- All source files must be present in the previous semester folder

**2. Create new semester module folder**
Follow the standard structure in system-config.md.
Name it with the new semester and year:
`[MODULE_CODE] [Full Name] [New Semester] [New Year]/`

**3. Copy the rollover file**
Copy the previous semester's v1.0 hub to:
`[new folder]/02_builds/[MODULE_CODE]_S[N]_v0_7_RolledOver.html`

Do not rename or modify the original. This is a working copy only.

**4. Collect new semester sources**
- Download new lecture slides, notes, tutorials
- Download updated prescribed readings
- Note any new cases, legislation changes, or assessment changes

**5. Run Module 01 Intake for new semester**
- Create new `00_intake/module-register.md`
- Record new semester assessment structure

**6. Run Module 02 Source Audit for new semester**
- Classify and tier all new sources
- Note what is identical to previous semester
- Note what has changed

**7. Run Module 13 Rollover Change Analysis**
Use the prompt in `modules/13-module-rollover.md`.
Output: Change analysis report.

**8. Decide: patch or rebuild**
- < 40% changed → Module 05 Patching on rollover file
- 40–60% changed → Rebuild changed sections via Module 04 on rollover file
- > 60% changed → Full Module 04 rebuild from fresh brief

**9. Run QA Audit and Print Audit**
Standard Modules 06 and 07.

**10. Archive at end of new semester**
Run Module 12 Archive again for the new semester.

---

## Completion Check

- [ ] Previous semester archive untouched
- [ ] New semester folder created with standard structure
- [ ] Rollover copy in new semester builds folder
- [ ] Change analysis complete
- [ ] Appropriate update method chosen (patch / partial rebuild / full rebuild)
- [ ] QA and Print Audits complete
- [ ] Module register for new semester complete

---

## Key Principle

You are never starting from zero. The rollover file is a head start, not a constraint. Only change what has actually changed. Preserve everything that is still accurate and useful.
