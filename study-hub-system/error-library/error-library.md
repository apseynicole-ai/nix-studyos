# QA Error Library

**Version:** 1.0  
**Purpose:** Permanent catalogue of known failure modes in study hub production. Every QA audit should check against this library. Every new error type discovered in production should be added here.

**Using this library:** When auditing, scan this list first. Known errors have known fixes. Reference the error code (ERR-XXX) in audit reports.

---

## Error Index

| Code | Category | Error Name | Severity |
|------|----------|-----------|---------|
| ERR-001 | HTML Structure | Duplicate Section IDs | P3 |
| ERR-002 | HTML Structure | Broken Sidebar Navigation | P3 |
| ERR-003 | HTML Structure | Missing Section ID | P3 |
| ERR-004 | Print | Sidebar Printing with Content | P2 |
| ERR-005 | Print | Background Colours Not Printing | P2 |
| ERR-006 | Print | Content Cut at Page Edge | P3 |
| ERR-007 | Print | Orphaned Heading at Page Bottom | P3 |
| ERR-008 | Print | Missing @media print Block | P2 |
| ERR-009 | Print | Missing Version Watermark | P3 |
| ERR-010 | Print | Interactive Elements Visible in Print | P3 |
| ERR-011 | Academic — Law | Obiter Described as Ratio | P1 |
| ERR-012 | Academic — Law | Case Citation Incorrect | P1 |
| ERR-013 | Academic — Law | Legal Test Missing Elements | P1 |
| ERR-014 | Academic — Law | Case Facts Invented | P1 |
| ERR-015 | Academic — Law | Key Quote Paraphrased | P1 |
| ERR-016 | Academic — Quant | Formula Incorrect | P1 |
| ERR-017 | Academic — Quant | Variable Definition Wrong | P1 |
| ERR-018 | Academic — Quant | Worked Example Calculation Error | P1 |
| ERR-019 | Academic — All | AI Content Cited as Primary Source | P1 |
| ERR-020 | Academic — All | Invented Academic Content | P1 |
| ERR-021 | Coverage | Missing Examinable Topic | P2 |
| ERR-022 | Coverage | Missing Required Case | P2 |
| ERR-023 | Coverage | Missing Required Formula | P2 |
| ERR-024 | Coverage | Missing Practice Questions | P3 |
| ERR-025 | Versioning | Approved Version Overwritten | P1 |
| ERR-026 | Versioning | Version Number Not Updated | P3 |
| ERR-027 | Versioning | Wrong Version in Filename | P3 |
| ERR-028 | Style | Colour Theme Inconsistent | P4 |
| ERR-029 | Style | External CDN Dependency | P2 |
| ERR-030 | Style | Inline Style Attributes Used | P4 |

---

## Detailed Error Entries

---

### ERR-001 — Duplicate Section IDs

**Category:** HTML Structure  
**Severity:** P3 (Standard — fix before printing)  
**Affects:** All modules

**Description:** Two or more HTML elements share the same `id` attribute value. This causes sidebar navigation to resolve to the first matching element, breaking links to all subsequent duplicates.

**Cause:**
- Copied a section block without updating the ID
- Patch added a new section using the same ID as an existing section
- HTML Builder did not validate IDs before saving

**Detection:**
- Automated: `grep -o 'id="[^"]*"' file.html | sort | uniq -d`
- Manual: Ctrl+F for the ID value in the HTML source
- Symptom: Clicking a sidebar link jumps to the wrong section

**Fix:**
Rename the duplicate ID to a unique value. Update the corresponding sidebar `href` to match the new ID.

**Prevention:**
- HTML Builder validates all IDs before saving (automation item A3)
- Use descriptive, unique slugs rather than numeric IDs
- Run ID check as part of every QA audit

---

### ERR-002 — Broken Sidebar Navigation

**Category:** HTML Structure  
**Severity:** P3  
**Affects:** All modules

**Description:** A sidebar link (`<a href="#section-id">`) references a section ID that does not exist in the document, causing the link to do nothing or jump to the top of the page.

**Cause:**
- Section ID was renamed during a patch without updating the sidebar
- Section was removed but sidebar link was not removed
- Typo in ID during initial build

**Detection:**
- Open file in Chrome; click every sidebar link
- Automated: Extract all `href="#..."` values and compare against all `id="..."` values

**Fix:**
Find the broken `href` and either: (a) update it to match the current section ID, or (b) remove the sidebar link if the section was intentionally deleted.

**Prevention:**
- Always update the sidebar when renaming or removing a section
- Run link validation after every patch

---

### ERR-004 — Sidebar Printing with Content

**Category:** Print  
**Severity:** P2 (Major — fix before printing)  
**Affects:** All modules

**Description:** The sidebar navigation column prints alongside the content, consuming ~240px of every printed page and causing content to overflow or appear truncated.

**Cause:**
- Missing `@media print { #sidebar { display: none !important; } }` rule
- Print CSS targets wrong selector (e.g. `nav` instead of `#sidebar`)

**Detection:**
- Chrome → File → Print → Print Preview: sidebar visible alongside content

**Fix:**
Add or correct the print CSS rule:
```css
@media print {
  #sidebar { display: none !important; }
  nav { display: none !important; }
}
```

**Prevention:**
- Print CSS block is included from the first build (Module 04 requirement)
- Print audit always checks sidebar hidden rule

---

### ERR-005 — Background Colours Not Printing

**Category:** Print  
**Severity:** P2  
**Affects:** All modules

**Description:** Coloured section headers, topic bands, and block backgrounds print as white, making the visual structure invisible in the physical binder.

**Cause:**
- Missing `-webkit-print-color-adjust: exact` and `print-color-adjust: exact` rules
- Chrome print settings: "Background graphics" not enabled by user

**Detection:**
- Chrome → Print → Print Preview: coloured blocks appear white

**Fix (CSS side):**
```css
@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
```

**Fix (User action):** Enable "Background graphics" in Chrome print dialog.

**Prevention:**
- This CSS rule is in the print-spec.md template — always include it
- Print checklist Step 3 includes background colour check

---

### ERR-008 — Missing @media print Block

**Category:** Print  
**Severity:** P2  
**Affects:** All modules

**Description:** The HTML file has no `@media print` CSS block at all. The file will print in screen layout, which is unusable.

**Cause:**
- HTML Builder omitted the print block
- Print CSS was intended to be added later and was not

**Detection:**
- `grep -c "@media print"` returns 0

**Fix:**
Add the complete print CSS block from specs/print-spec.md.

**Prevention:**
- Module 04 requires print CSS from the first build — it is never "added later"
- QA Audit Domain D checks for this as a mandatory item

---

### ERR-011 — Obiter Described as Ratio

**Category:** Academic — Law  
**Severity:** P1 (Critical — must fix before printing)  
**Affects:** Law modules

**Description:** A statement from a judge's obiter dicta (remarks made in passing, not binding) is presented as the ratio decidendi (the binding legal rule) of the case. This is a fundamental legal error that will mislead in exams.

**Cause:**
- Reliance on secondary summaries rather than case documents
- AI-generated case summaries frequently confuse obiter and ratio
- Insufficient source review during QA

**Detection:**
- Compare stated ratio against the case document or authoritative lecture slide
- Ask: "Is this the rule the case was actually decided on, or was it a comment about a hypothetical?"

**Fix:**
Correct the ratio using the primary case document or lecturer's authoritative statement of the ratio. If uncertain, flag with `<!-- NEEDS REVIEW: ratio vs obiter uncertain -->`.

**Prevention:**
- Law Content Specialist (Agent-04) reviews every ratio before build
- QA Auditor cross-checks all ratios against Tier 1 sources
- Source Verifier (NotebookLM) used to confirm case summaries

---

### ERR-012 — Case Citation Incorrect

**Category:** Academic — Law  
**Severity:** P1  
**Affects:** Law modules

**Description:** A case citation contains an error in the year, court abbreviation, reporter, or page number.

**Cause:**
- Citation copied from an AI summary (frequently inaccurate)
- Typo during transcription
- Confusion between multiple decisions in the same case (e.g. trial vs appeal)

**Detection:**
- Cross-check every citation against the case document or a legal database (AustLII, etc.)
- Format check: Australian citations follow `[Year] Court Reporter Page`

**Fix:**
Correct the citation using the primary case document.

**Prevention:**
- All citations must come from Tier 1 sources — never from AI output
- QA Auditor checks all citations as a mandatory Domain A item

---

### ERR-016 — Formula Incorrect

**Category:** Academic — Quantitative  
**Severity:** P1  
**Affects:** Quantitative modules

**Description:** A mathematical or statistical formula contains an error — wrong operator, wrong variable, wrong relationship.

**Cause:**
- Formula transcribed from AI summary rather than source
- Typo in formula notation
- Formula correct but expressed in different notation than the lecturer uses (can cause confusion even if mathematically equivalent)

**Detection:**
- Compare every formula against the source lecture slide
- Verify by substituting known values and checking against worked example

**Fix:**
Replace the formula with the exact notation used in the source. If the lecturer uses different notation from the textbook, use the lecturer's notation.

**Prevention:**
- Statistics Specialist / Accounting Specialist reviews all formulas against Tier 1 sources
- Formula box component (C-02) requires source attribution — traceable to specific slide

---

### ERR-019 — AI Content Cited as Primary Source

**Category:** Academic — All  
**Severity:** P1  
**Affects:** All modules

**Description:** Content generated by an AI tool (ChatGPT, Claude, NotebookLM, etc.) is presented in the hub as if it were primary source material, without being identified as AI-generated or cross-checked.

**Cause:**
- AI output used during build not flagged as Tier 3
- Source audit not completed before build
- Build used AI-generated study notes from a previous session as source material

**Detection:**
- Check source manifest: does every content block trace to a SRC-ID?
- Is the SRC-ID classified as Tier 3 (AI)? If so, was it cross-checked against a Tier 1 source?

**Fix:**
Identify the Tier 1 source for the content. If no Tier 1 source exists for the claim, either remove it or mark it explicitly as a topic gap.

**Prevention:**
- All AI-generated content is classified Tier 3 in the source audit — automatic downgrade
- QA Auditor checks source attribution on every content block
- Build brief requires Tier 1/2 source mapping for every section

---

### ERR-025 — Approved Version Overwritten

**Category:** Versioning  
**Severity:** P1 (Critical)  
**Affects:** All modules

**Description:** An approved and printed version of the HTML file has been overwritten by a patch or rebuild, making it impossible to reprint or audit the original.

**Cause:**
- HTML Patch Engineer wrote to the source file instead of a new filename
- Accidental overwrite during file management

**Detection:**
- Compare current v1.0 file with any printed PDF in 07_print/ — if they differ, overwrite may have occurred
- Check git history if available

**Fix:**
If a printed PDF exists in 07_print/, the PDF is the ground truth record. Rename the current file to a new version number. If no PDF exists, the loss may be unrecoverable.

**Prevention:**
- Module 05 Patching explicitly requires a new filename — the source file is read-only
- All safety rules reinforced in every prompt
- Future automation: file write protection on v1.0 files

---

### ERR-029 — External CDN Dependency

**Category:** Style  
**Severity:** P2  
**Affects:** All modules

**Description:** The HTML file includes a `<link>` or `<script src="...">` tag pointing to an external URL (e.g. Google Fonts CDN, Bootstrap CDN). The file will not render correctly without an internet connection.

**Cause:**
- HTML Builder used a template that included CDN links
- AI tool added CDN dependencies without being instructed to

**Detection:**
- `grep -i "href=\"https" file.html` or `grep -i "src=\"https" file.html`

**Fix:**
Remove the CDN link. Replace with inline CSS using system font stacks. If a JS library is needed, either inline the minified source or remove the dependency.

**Prevention:**
- HTML spec (specs/html-spec.md) explicitly disallows external CDN links
- All fonts use system font stacks from specs/html-spec.md

---

## Adding New Errors

When a new error is discovered in production:

1. Assign the next available ERR code
2. Complete all fields: Category, Severity, Affects, Description, Cause, Detection, Fix, Prevention
3. Add to the Error Index at the top of this file
4. Update the QA audit checklist if the error should be a standard check

New errors should be added after every module build cycle where a previously unknown issue was encountered.
