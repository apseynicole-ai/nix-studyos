# Print Readiness Checklist

Use this checklist before sending any file to the printer.
Must be completed after saving the PDF from Chrome print preview.

---

## Step 1 — Pre-Print Requirements

- [ ] QA Audit passed (no P1 or P2 issues outstanding)
- [ ] File is at v1.0 or later
- [ ] Version watermark updated to "APPROVED PRINT CANDIDATE"
- [ ] PDF saved from Chrome to `07_print/`

---

## Step 2 — PDF Page Review

Open the PDF and check each of the following:

- [ ] PDF opens without errors
- [ ] All pages present (count matches expected)
- [ ] No blank pages (except intentional divider pages)
- [ ] First page is module overview (not sidebar or navigation)
- [ ] Last page has footer/watermark

---

## Step 3 — Page Break Review

- [ ] Each major topic starts on a new page
- [ ] No heading sitting alone at the bottom of a page
- [ ] No paragraph cut awkwardly between pages
- [ ] Law: no case summary split in a confusing way
- [ ] Quant: no formula block split across pages
- [ ] Tables: header row repeats on continuation pages

---

## Step 4 — Layout Review

- [ ] All text within printable margins
- [ ] No content cut off at right edge
- [ ] Left margin adequate for hole-punching (min 25mm)
- [ ] Sidebar not visible in PDF
- [ ] Buttons and interactive controls not visible in PDF
- [ ] Colours printing (not white boxes where colours should be)

---

## Step 5 — Visual Review

- [ ] Heading hierarchy clear (H1, H2, H3 visually distinct)
- [ ] Text readable at standard A4 size
- [ ] Tables have visible borders
- [ ] Coloured blocks printing with their background colours
- [ ] Law: case name formatting consistent
- [ ] Quant: formula formatting clear

---

## Step 6 — Footer Review

- [ ] Version watermark present on all pages
- [ ] Module code in footer
- [ ] "APPROVED PRINT CANDIDATE" or "DRAFT" label correct
- [ ] Page numbers present (if included in HTML design)

---

## Step 7 — Chrome Print Settings Confirmation

Before sending to printer, confirm Chrome settings:

- [ ] Destination: correct printer
- [ ] Paper size: A4
- [ ] Orientation: Portrait
- [ ] Margins: Default
- [ ] Scale: 100%
- [ ] Background graphics: ENABLED ✓
- [ ] Headers and footers: Disabled
- [ ] Double-sided: Short edge

---

## Step 8 — Binder Assembly Confirmation

After printing:

- [ ] Cover sheets printed (Module 08)
- [ ] Case sheets printed (Module 09, law only)
- [ ] Main hub printed
- [ ] Binder assembled in correct order per print manifest
- [ ] Spine label applied
- [ ] Module register updated with print completion date

---

## Print Manifest Reference

Print manifest should be in `07_print/print-manifest.md`.
If it does not exist, complete it before printing.

---

## Result

- [ ] PASSED — proceed to print
- [ ] FAILED — return to Module 05 for CSS patching before printing
