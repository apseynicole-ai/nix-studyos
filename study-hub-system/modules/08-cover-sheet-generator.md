# Module 08 — Cover Sheet Generator

## Purpose

Produce the topic divider pages for a module binder. Cover sheets are printed separately from the main study hub. They create a professional, navigable physical binder by marking the beginning of each topic section. They are always one full A4 page per topic.

---

## Inputs

- Module code, name, semester, year
- Module colour theme (from build brief or system-config.md)
- Topic list (from build brief, in binder order)
- Learning outcomes or key ideas per topic (from sources or main study hub)
- Module type (affects visual design — Law vs Quantitative)

---

## Outputs

- `03_cover_sheets/[MODULE_CODE]_S[N]_TopicCoverSheets_Print.html`
- Single self-contained HTML file containing all cover sheets
- Each cover sheet prints as exactly one A4 page

---

## Rules

1. Each topic gets exactly one cover sheet — one A4 page.
2. Cover sheets are in a separate HTML file from the main study hub.
3. Cover sheets must use the same colour theme as the main study hub.
4. No new academic content is added in cover sheets. Learning outcomes come from sources.
5. Cover sheets are printed in colour, single-sided.
6. The file must never be merged into the main study hub HTML.

---

## Cover Sheet Design Specification

### Required Elements (every cover sheet)
- Module name (top, smaller)
- Module code (top, smaller)
- Semester and year (top, smaller)
- Topic number (large, prominent)
- Topic title (large, prominent — most visually dominant element)
- Colour band using the module theme
- Learning outcomes or key ideas (3–6 bullet points)
- A subtle decorative element (line, geometric shape, or icon — no complex imagery)

### Optional Elements
- Brief topic overview (1–2 sentences)
- Topic exam weighting or priority (High / Medium / Low)
- Space for handwritten notes (blank area at bottom)

### What Cover Sheets Must NOT Contain
- Case summaries
- Formulas
- Definitions
- Exam questions
- Any content that belongs in the main study hub

---

## Cover Sheet HTML Architecture

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>[MODULE_CODE] Topic Cover Sheets — [Semester] [Year]</title>
  <style>
    @page { size: A4; margin: 0; }
    body { margin: 0; padding: 0; font-family: [system font stack]; }

    .cover-sheet {
      width: 210mm;
      height: 297mm;
      page-break-after: always;
      position: relative;
      overflow: hidden;
      /* colour theme applied here */
    }

    @media print {
      .cover-sheet { page-break-after: always; }
    }
  </style>
</head>
<body>
  <!-- One .cover-sheet div per topic -->
  <div class="cover-sheet" id="cover-topic-1">
    <!-- Module header -->
    <!-- Topic number + title -->
    <!-- Colour accent -->
    <!-- Learning outcomes -->
    <!-- Optional note area -->
  </div>

  <div class="cover-sheet" id="cover-topic-2">
    <!-- ... -->
  </div>
</body>
</html>
```

---

## Law Module Cover Sheet Layout

```
┌─────────────────────────────────────┐
│ FOL178 Foundations of Law           │ ← small, top left
│ Semester 1 2026                     │
├─────────────────────────────────────┤
│                                     │
│  TOPIC 3                            │ ← large number
│  Contract Formation                 │ ← large title
│                                     │
│  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬ [gold accent bar]  │
│                                     │
│  Key Ideas                          │
│  ● Offer and acceptance             │
│  ● Consideration                    │
│  ● Intention to create legal        │
│    relations                        │
│  ● Capacity                         │
│                                     │
│                                     │
│  [Notes area — blank]               │
│                                     │
└─────────────────────────────────────┘
```

---

## Quantitative Module Cover Sheet Layout

```
┌─────────────────────────────────────┐
│ SDS188 Statistics and Data Science  │ ← small, top left
│ Semester 1 2026                     │
├─────────────────────────────────────┤
│  [teal/coral accent band]           │
│                                     │
│  TOPIC 4                            │ ← large number
│  Regression Analysis                │ ← large title
│                                     │
│  Learning Outcomes                  │
│  ● Fit a simple linear regression   │
│  ● Interpret regression output      │
│  ● Identify violations              │
│  ● Apply multiple regression        │
│                                     │
│  [Notes area — blank]               │
└─────────────────────────────────────┘
```

---

## Quality Checks

- [ ] One cover sheet per topic
- [ ] Topics in correct binder order
- [ ] Module colour theme applied consistently
- [ ] Each cover sheet is exactly one A4 page in print preview
- [ ] No academic content that belongs in the main hub
- [ ] Learning outcomes are source-accurate (not invented)
- [ ] File named correctly
- [ ] Opens in Chrome without errors
- [ ] Prints cleanly in full colour

---

## Reusable Prompt — Cover Sheet Generator

```
You are running Module 08 Cover Sheet Generator for the Nix Study Hub Production System.

MODULE: [MODULE_CODE] — [Full Name], [Semester]
MODULE TYPE: [Law / Quantitative / Mixed]
OUTPUT FILE: [MODULE_CODE]_S[N]_TopicCoverSheets_Print.html

COLOUR THEME:
- Primary: [hex]
- Accent: [hex]
- Background: [hex]

TOPICS (in binder order):
1. [Topic Name] — Key ideas: [3–6 bullet points from sources]
2. [Topic Name] — Key ideas: [3–6 bullet points from sources]
[Continue for all topics]

TASK:
1. Generate a single HTML file containing one cover sheet per topic.
2. Each cover sheet must be exactly one A4 page.
3. Apply the module colour theme consistently.
4. Include module name, module code, semester, topic number, topic title, and key ideas.
5. Include a blank notes area at the bottom of each page.
6. Use @page { size: A4; margin: 0; } and page-break-after: always between sheets.
7. Do not add academic content (no cases, formulas, or definitions — those belong in the hub).
8. Do not merge this file with the main study hub.

SAFETY:
- Do not overwrite any existing file.
- Do not stage, commit, or push.

OUTPUT: [MODULE_CODE]_S[N]_TopicCoverSheets_Print.html written to 03_cover_sheets/
```

---

## Common Failure Points

- Cover sheets not page-breaking correctly (two topics on one page)
- Academic content added to cover sheets (belongs in the hub)
- Colour theme not matching the main study hub
- Learning outcomes invented rather than taken from sources
- File merged into the main hub (must remain separate)

---

## Automation Opportunities

| Task | Automatable | Difficulty | Time Saved |
|------|-------------|------------|------------|
| Generate all cover sheets from topic list | Yes | Medium | 20 min/module |
| Auto-apply colour theme from module type | Yes | Low | 5 min/module |
| Extract learning outcomes from sources | Future | High | 15 min/module |
| Validate one-page-per-topic in print CSS | Yes | Low | 3 min/module |
