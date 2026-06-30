# Module 11 — Exam Pack Generator

## Purpose

Produce the final exam-night resource. The exam pack is the most distilled output in the system — built in the final days before the exam, derived entirely from the revision pack and master hub. It contains only what is essential to perform well on exam day. It is not a teaching resource. It is a performance resource.

---

## Inputs

- Approved revision pack (Module 10 output)
- Approved master study hub (v1.0 or later)
- Confirmed exam scope (if available)
- Confirmed exam format (open/closed book, duration, question types)
- Any last-minute updates from the lecturer

---

## Outputs

- `05_revision/[MODULE_CODE]_S[N]_v1_0_ExamPack.html`

---

## Rules

1. The exam pack is derived from the revision pack and master hub only.
2. No new learning should happen in the exam pack. If something is not already in the hub or revision pack, it should not appear here.
3. Maximum length: 8–10 printed A4 pages for most modules. Law modules may extend to 15 pages if case reference demands it.
4. Every word must earn its place. If it is not likely to matter in the exam, remove it.
5. Do not invent examiner predictions.
6. The Night Before Review and 30-Minute Emergency Guide are mandatory sections.
7. Law exam packs must include a final case list table (name → principle → exam use).
8. Quantitative exam packs must include the full formula sheet on one page.

---

## Exam Pack Structure

```
Page 1: Exam Day Logistics
  - Exam date, time, location
  - Duration
  - Format (open/closed book, calculator allowed, etc.)
  - Materials permitted
  - What to bring

Page 2: Topic Priority Map
  - All topics ranked High / Medium / Low
  - Likely marks weighting per topic (if known)
  - What to read first if time is short

Pages 3–N: High-Priority Content
  Law:
    - Key doctrine + test for each High topic (one block per topic)
    - Top case list (case name → principle → application in one line)
    - Essay template (one page)
    - Problem-question IRAC/FIRAC framework (one page)

  Quantitative:
    - Formula sheet (all formulas, one page)
    - Method summary (step-by-step for each calculation type)
    - Interpretation rules (one entry per formula type)

Page N-1: Night Before Review
  - Maximum one page
  - Absolute essentials only
  - Can read in 10 minutes

Page N: 30-Minute Emergency Guide
  - If you have 30 minutes before the exam and nothing else, read this
  - The most-likely-to-appear content in the most concise form possible
```

---

## Law Exam Pack: Final Case Table Format

```
| Topic | Case | Year | Principle (one sentence) | Use in exam |
|-------|------|------|--------------------------|-------------|
| Contract — Offer | Carlill v Carbolic Smoke Ball Co | 1893 | Advertisements can be offers if sufficiently specific | Argue offer when advertisement has clear terms |
```

---

## Quantitative Exam Pack: Formula Page Format

All formulas on one page in clearly labelled blocks. No worked examples (those are in the revision pack). Variable definitions listed. The goal is recognition under exam pressure, not teaching.

---

## Quality Checks

- [ ] Exam date, time, format, and permitted materials are correct
- [ ] Total print length within limits (10 pages general / 15 pages law)
- [ ] Night Before Review is genuinely one page and readable in under 10 minutes
- [ ] 30-Minute Emergency Guide is as short as possible
- [ ] Law: all High-priority cases in final case table
- [ ] Quantitative: all examinable formulas on formula sheet
- [ ] No new academic content not already in the hub or revision pack
- [ ] No invented exam predictions
- [ ] File named correctly

---

## Reusable Prompt — Exam Pack Generator

```
You are running Module 11 Exam Pack Generator for the Nix Study Hub Production System.

MODULE: [MODULE_CODE] — [Full Name], [Semester]
MODULE TYPE: [Law / Quantitative / Mixed]
OUTPUT FILE: [MODULE_CODE]_S[N]_v1_0_ExamPack.html

EXAM DETAILS:
- Date: [date]
- Time: [time]
- Duration: [hours]
- Format: [open/closed book]
- Calculator: [permitted / not permitted]
- Materials permitted: [list]

HIGH-PRIORITY TOPICS (confirmed examinable):
[List topics]

SOURCES:
- Revision pack: [filename]
- Master hub: [filename]

TASK:
1. Build the exam pack using only content from the revision pack and master hub.
2. Prioritise ruthlessly: only include what is likely to matter in this exam.
3. Maximum 10 pages general / 15 pages law.
4. Include exam day logistics on page 1.
5. Include topic priority map on page 2.
6. For law: include final case table and essay/problem-question template.
7. For quantitative: include formula sheet (one page) and method summary.
8. Night Before Review: one page, 10-minute read.
9. 30-Minute Emergency Guide: maximum half page.
10. Do not add content not already in the hub or revision pack.
11. Do not invent examiner predictions.

SAFETY:
- Do not overwrite any existing file.
- Do not stage, commit, or push.

OUTPUT: [MODULE_CODE]_S[N]_v1_0_ExamPack.html written to 05_revision/
```

---

## Common Failure Points

- Exam pack too long (defeats the purpose — must be a distillation, not a summary)
- Missing exam logistics (date, time, format) — this is the most exam-day-relevant page
- Night Before Review not actually one page
- Quantitative formula sheet spread across multiple pages instead of one
- Law case table missing cases that appeared only in tutorials

---

## Automation Opportunities

| Task | Automatable | Difficulty | Time Saved |
|------|-------------|------------|------------|
| Auto-extract top cases from revision pack | Yes | Medium | 10 min/module |
| Auto-extract formula sheet from revision pack | Yes | Medium | 5 min/module |
| Pull exam logistics from module register | Yes | Low | 5 min/module |
| Auto-rank topics by frequency in past papers | Future | High | 15 min/module |
