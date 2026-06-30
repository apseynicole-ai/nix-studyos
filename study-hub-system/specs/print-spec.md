# Print Specification

**Applies to:** All study hub HTML files, cover sheets, and case sheets.

---

## Required Print CSS Block

Every HTML file must include a complete `@media print` block. This is not optional.

```css
@media print {
  /* === PAGE SETUP === */
  @page {
    size: A4;
    margin: 15mm 20mm 15mm 25mm; /* top right bottom left — extra left for hole punch */
  }

  /* === HIDE SCREEN-ONLY ELEMENTS === */
  #sidebar,
  nav,
  .no-print,
  .expand-toggle,
  .search-bar,
  button,
  .interactive-only {
    display: none !important;
  }

  /* === MAIN CONTENT === */
  body {
    display: block;
    margin: 0;
    padding: 0;
    font-size: 10pt;
    color: #000;
    background: #fff;
  }

  #main-content {
    max-width: 100%;
    padding: 0;
    margin: 0;
  }

  /* === PAGE BREAKS === */
  .topic-section {
    page-break-before: always;
  }

  .topic-section:first-of-type {
    page-break-before: avoid; /* don't force break before first topic */
  }

  h2, h3 {
    page-break-after: avoid; /* never orphan a heading */
  }

  .case-block,
  .formula-block {
    page-break-inside: avoid;
  }

  /* === BACKGROUND COLOURS === */
  /* Chrome requires -webkit-print-color-adjust for background colours */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* === TYPOGRAPHY === */
  a {
    color: inherit;
    text-decoration: none;
  }

  /* Print internal href as visible URL only for external links */
  a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-size: 8pt;
    color: #666;
  }

  /* === FOOTER / WATERMARK === */
  #page-footer {
    display: block;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    font-size: 7pt;
    color: #666;
    border-top: 0.5pt solid #ccc;
    padding-top: 3mm;
    text-align: center;
  }

  /* === TABLES === */
  table {
    border-collapse: collapse;
    width: 100%;
    page-break-inside: auto;
  }

  tr {
    page-break-inside: avoid;
  }

  th, td {
    border: 0.5pt solid #999;
    padding: 3pt 5pt;
    font-size: 9pt;
  }

  thead {
    display: table-header-group; /* repeat header row on each page */
  }
}
```

---

## A4 Dimensions Reference

| Measurement | Value |
|-------------|-------|
| Width | 210mm |
| Height | 297mm |
| Standard margin (20mm all) | Safe content: 170mm × 257mm |
| Hole-punch margin (left 25mm) | Safe content: 165mm × 257mm |

---

## Chrome Print Settings (User Instructions)

When printing from Chrome:
1. File → Print (or Ctrl+P / Cmd+P)
2. Destination: your printer
3. Paper size: A4
4. Orientation: Portrait
5. Margins: Default
6. Scale: Default (100%)
7. Options: ✓ Background graphics
8. Headers and footers: Off (the HTML has its own footer)
9. Double-sided: Short edge (for portrait A4)

---

## Cover Sheet Print Settings

Cover sheets (`03_cover_sheets/`) use `@page { size: A4; margin: 0; }` — zero margins because the design goes edge-to-edge. Print single-sided, full colour.

---

## Case Sheet Print Settings

Case sheets (`04_case_sheets/`) use `@page { size: A4; margin: 15mm 20mm; }`. Print single-sided (each case on its own page) or double-sided if preferred.

---

## PDF Save Requirement

Before sending to the printer, always save a PDF first:
- Chrome → Print → Save as PDF
- Review all pages in the PDF before printing
- Save PDF to `07_print/`

---

## Disallowed Print Patterns

- Sidebar appearing in print output
- Interactive elements (buttons, toggles) visible in print
- Background colours not printing (must use `-webkit-print-color-adjust: exact`)
- Headings orphaned at bottom of page
- Tables cut without header repetition
- Case summaries split mid-case in a distracting way
- Content cut off at right margin (table too wide)
- No footer/watermark on printed pages
