# QA Checklist — Master

Use this checklist before approving any HTML build as a print candidate.
All P1 and P2 items must pass before printing. P3+ should be resolved but do not block printing.

---

## Domain A — Academic Accuracy

### Law Modules
- [ ] P1 All case names are correctly stated
- [ ] P1 All case citations are correct (court, year)
- [ ] P1 Ratio decidendi accurately reflects the judgment (not obiter)
- [ ] P1 Legal tests state all elements correctly
- [ ] P1 No legal principle stated without source support
- [ ] P1 No invented facts in case summaries
- [ ] P1 Key quotes are verbatim (not paraphrased)
- [ ] P2 All prescribed cases from the source list are present
- [ ] P2 Doctrine → test → application flow is clear for each topic
- [ ] P2 Statutory provisions quoted accurately
- [ ] P3 FIRAC/IRAC templates are structurally sound

### Quantitative Modules
- [ ] P1 All formulas are mathematically correct
- [ ] P1 Variable definitions are accurate
- [ ] P1 Worked example calculations are verified
- [ ] P1 Interpretation rules match source material
- [ ] P2 All examinable formulas from source list are present
- [ ] P2 Step-by-step methods are complete (no missing steps)
- [ ] P3 Graphs and diagrams accurately described

### All Modules
- [ ] P1 No AI-generated content presented as primary source
- [ ] P1 No invented academic content
- [ ] P2 No oversimplifications that could mislead in exam

---

## Domain B — Coverage Completeness

- [ ] P2 All topics in build brief are present
- [ ] P2 All High-priority (examinable) topics are present and complete
- [ ] P2 Practice questions section present
- [ ] P2 Exam tips section present
- [ ] P3 Medium-priority topics present
- [ ] P4 Low-priority topics present or intentionally excluded with note

---

## Domain C — Structure and Navigation

- [ ] P3 All sidebar links resolve without error
- [ ] P3 No duplicate section IDs
- [ ] P3 Section headings match build brief naming
- [ ] P3 Sections in correct order
- [ ] P3 No broken internal anchors (`href="#id"` that doesn't exist)
- [ ] P4 Expand/collapse working (if present)
- [ ] P4 In-page search working (if present)

---

## Domain D — Print Readiness

- [ ] P2 `@media print` CSS block present
- [ ] P2 `@page { size: A4; }` specified
- [ ] P2 Page breaks before major topic sections
- [ ] P2 Background colours printing (`-webkit-print-color-adjust: exact`)
- [ ] P2 Sidebar hidden in print
- [ ] P2 Interactive elements hidden in print
- [ ] P2 Version watermark present in footer
- [ ] P3 No headings orphaned at bottom of page
- [ ] P3 Tables have print-visible borders
- [ ] P3 No content cut at page edges
- [ ] P3 Hole-punch margin adequate (left margin 25mm minimum)

---

## Domain E — Usability

- [ ] P3 File opens in Chrome without console errors
- [ ] P3 Colour theme consistent throughout
- [ ] P3 Text legible at 100% screen zoom
- [ ] P4 Colour contrast accessible (dark text on light background)
- [ ] P4 Law: clear visual distinction between doctrine, test, and case blocks
- [ ] P4 Quant: formula blocks visually distinct from body text

---

## Sign-Off

| Item | Status |
|------|--------|
| Domain A passed | ○ / ✓ |
| Domain B passed | ○ / ✓ |
| Domain C passed | ○ / ✓ |
| Domain D passed | ○ / ✓ |
| Domain E passed | ○ / ✓ |
| **Overall verdict** | DO NOT PRINT / PATCH REQUIRED / PRINT CANDIDATE |

Audited by: [Claude / Manual]
Date: [Date]
Version audited: [vX.X]
