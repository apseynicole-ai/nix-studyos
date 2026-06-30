# SOP-07 — Prepare for Printing

**Trigger:** The study hub has passed QA Audit with no P1 or P2 issues and is being prepared for the physical binder.

**Time required:** 30–60 minutes

---

## Steps

**1. Confirm QA Audit is passed**
- No P1 (Critical) issues outstanding
- No P2 (Major) issues outstanding
- QA Audit report present in `06_audit/`

**2. Rename the file to v1.0 (if not already)**
- Example: `FOL178_S1_v0_9_MasterStudyHub.html` → `FOL178_S1_v1_0_MasterStudyHub.html`
- Update version watermark inside the HTML to match
- Update watermark text from "DRAFT" to "APPROVED PRINT CANDIDATE"
- Keep v0.9 file — do not delete

**3. Run Module 07 Print Audit**
- Open HTML in Google Chrome
- Go to File → Print → Save as PDF
- Save PDF to `07_print/[MODULE_CODE]_S1_v1_0_PrintCandidate.pdf`
- Review PDF for all print audit checklist items

**4. Fix any print issues found**
- Return to Module 05 Patching for print CSS fixes
- Re-run print preview after each fix
- Do not print until print audit passes

**5. Generate cover sheets (if not already done)**
- Run Module 08 Cover Sheet Generator
- Save to `03_cover_sheets/`
- Print preview in Chrome

**6. Generate case sheets (law only, if not already done)**
- Run Module 09 Case Sheet Generator
- Save to `04_case_sheets/`
- Print preview in Chrome

**7. Complete the print manifest**
Using the template in `checklists/print-manifest-template.md`:
- Record page counts for main hub, cover sheets, and case sheets
- Record print settings
- Map sections to page numbers
- Set binder assembly order

**8. Print in order**
Print in this order for easy binder assembly:
1. Cover sheets (Module 08) — colour, single-sided
2. Main study hub (v1.0) — colour, double-sided
3. Case sheets (Module 09, law only) — colour, single-sided or double-sided

**9. Assemble binder**
Follow binder assembly order from print manifest:
1. Module cover page
2. Module overview pages
3. Topic divider → Topic pages → Repeat for each topic
4. Case hub (law)
5. Formula reference (quantitative)
6. Practice questions / past papers
7. Blank notes pages (optional)

---

## Completion Check

- [ ] Print audit passed
- [ ] PDF saved to `07_print/`
- [ ] Print manifest completed
- [ ] Cover sheets printed
- [ ] Case sheets printed (law)
- [ ] Main hub printed
- [ ] Binder assembled in correct order
- [ ] Module register updated with print completion

---

## Printing Rules (Non-Negotiable)

- Always print from Google Chrome
- Always enable background graphics
- Always save PDF before printing
- Never print from Safari, Firefox, or Edge
- Never print before Print Audit is passed
