# SOP-01 — Start a New Module

**Trigger:** A new module is added to the semester load.

**Time required:** 30–60 minutes

---

## Steps

**1. Gather module information**
- Module code, full name, semester, year
- Module type: Law / Quantitative / Mixed
- University and LMS platform
- Assessment structure (if known)
- Exam format and scope (if known)

**2. Collect all available sources**
- Download everything from the LMS
- Download prescribed readings (if accessible)
- Download past papers (if available)
- Note anything expected but not yet available

**3. Create the module folder**
Follow the standard folder structure in system-config.md exactly:
```
[MODULE_CODE] [Full Name] [Semester] [Year]/
├── 00_intake/
├── 01_sources/raw/
├── 01_sources/processed/
├── 02_builds/
├── 03_cover_sheets/
├── 04_case_sheets/      ← law only
├── 05_revision/
├── 06_audit/
├── 07_print/
└── 08_archive/
```

**4. Copy all sources to `01_sources/raw/`**
Do not rename. Do not process. Copy only.

**5. Run Module 01 Intake prompt**
Use the reusable prompt in `modules/01-module-intake.md`.
Output: `00_intake/module-register.md`

**6. Run Module 02 Source Audit**
Use the reusable prompt in `modules/02-source-audit.md`.
Output: `01_sources/source-audit.md`

**7. Confirm**
- [ ] Module register complete
- [ ] All sources registered and classified
- [ ] Coverage gaps identified
- [ ] Ready to proceed to Build Planning (Module 03)

---

## Completion Check

The module is ready to build when:
- Module register signed off
- Source audit complete
- No unresolved coverage gaps that would block the build

---

## Do Not Proceed If

- Critical sources are missing (e.g. no lecture slides at all)
- Module type is unclear
- Exam scope is needed but not yet available and it will fundamentally change the structure
