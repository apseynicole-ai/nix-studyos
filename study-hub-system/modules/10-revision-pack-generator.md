# Module 10 — Revision Pack Generator

## Purpose

Produce a purpose-built exam revision resource derived from the approved master study hub. The revision pack does not replace the study hub. It is a separate, exam-focused output that teaches you how to perform in the exam, not just what the module contains. It is generated from the approved v1.0 hub and sources.

---

## Inputs

- Approved master study hub (v1.0 or later)
- `01_sources/source-audit.md` (for source accuracy)
- Exam scope (confirmed or estimated)
- Assessment weightings
- Past papers (if available, from `01_sources/processed/`)
- Marking guidance (if available)
- Module type (Law / Quantitative / Mixed)

---

## Outputs

- `05_revision/[MODULE_CODE]_S[N]_v1_0_RevisionPack.html`

---

## Rules

1. The revision pack is derived from the master hub and sources — it does not replace them.
2. Do not add new academic content that was not in the master hub or sources.
3. Do not remove detail from the master hub — summarise and cross-reference instead.
4. The revision pack must be independently useful (readable without the master hub open).
5. Law revision packs must include case quick-reference and essay/problem-question templates.
6. Quantitative revision packs must include formula sheets and worked examples.
7. Exam patterns and past paper analysis must only be included if past papers are available in sources.
8. Do not invent examiner preferences or exam patterns without source evidence.

---

## Revision Pack Structure

### Universal Sections (all module types)

| Section | Contents |
|---------|----------|
| Exam Roadmap | Exam format, duration, structure, open/closed book, weighting |
| Topic Priority Ranking | Topics ranked High/Medium/Low by exam relevance and weighting |
| Learning Outcomes Checklist | Self-assessment checklist — can I explain, apply, and analyse each outcome? |
| One-Page Topic Summaries | One page per topic — most examinable content only |
| Common Mistakes | The errors most likely to cost marks |
| Frequently Tested Principles | Patterns identified from past papers or module emphasis |
| Memory Triggers | Mnemonics, hooks, and short-form cues |
| Night Before Review | One page maximum — absolute essentials only |
| Emergency 30-Minute Guide | If time runs out before the exam, read this |

### Law-Specific Sections

| Section | Contents |
|---------|----------|
| Case Quick Reference | Table: Case Name → Principle → Exam Use |
| Principle-to-Case Index | Table: Principle → Case(s) that establish it |
| Essay Template | Standard structure for law essay questions |
| Problem-Question Framework | IRAC/FIRAC walkthrough with worked example |
| Statutory Interpretation Rules | If applicable to exam |
| High-Yield Cases | Top 10–15 cases most likely to appear |

### Quantitative-Specific Sections

| Section | Contents |
|---------|----------|
| Formula Reference Sheet | All formulas, clearly labelled, with variable definitions |
| Calculation Framework | Step-by-step method for each calculation type |
| Worked Examples (Condensed) | One worked example per calculation type |
| Interpretation Rules | How to interpret and present each result |
| Graph/Diagram Guide | What each graph shows and how to read it |
| Common Calculation Errors | The arithmetic and conceptual errors most likely to lose marks |

---

## Case Quick Reference Table Format (Law)

```
| Case Name | Area of Law | Principle Established | Exam Use |
|-----------|-------------|----------------------|----------|
| [Name] [Year] | [Area] | [One sentence] | [How to cite in exam] |
```

---

## Formula Reference Sheet Format (Quantitative)

```
FORMULA: [Name]
Symbol:  [Ŷ = β₀ + β₁X]
Use:     [When to apply this formula]
Where:   Ŷ = [definition], β₀ = [definition], β₁ = [definition]
Example: [Single worked example]
```

---

## Quality Checks

- [ ] Exam format and duration are correctly stated (check module register)
- [ ] Topic priority ranking matches exam scope or source emphasis
- [ ] All high-priority topics have a one-page summary
- [ ] Law: case quick reference table complete and accurate
- [ ] Quantitative: formula sheet complete and accurate
- [ ] Common mistakes derived from sources (not invented)
- [ ] Night Before Review is genuinely one page
- [ ] No new academic content invented for the revision pack
- [ ] File named correctly

---

## Reusable Prompt — Revision Pack Generator

```
You are running Module 10 Revision Pack Generator for the Nix Study Hub Production System.

MODULE: [MODULE_CODE] — [Full Name], [Semester]
MODULE TYPE: [Law / Quantitative / Mixed]
OUTPUT FILE: [MODULE_CODE]_S[N]_v1_0_RevisionPack.html

MASTER HUB: [filename of approved v1.0 hub]
EXAM SCOPE: [confirmed examinable topics — or "estimated based on module emphasis"]
PAST PAPERS AVAILABLE: [Yes / No — if Yes, list files]
MARKING GUIDANCE AVAILABLE: [Yes / No]

TASK:
1. Generate a revision pack using the structure for [Law / Quantitative / Mixed] modules.
2. Derive all content from the master hub and Tier 1/2 sources.
3. Do not add new academic content not in the master hub.
4. Rank topics by exam priority.
5. Write one-page summaries for all High priority topics.
6. For law: include case quick reference table and essay/problem-question templates.
7. For quantitative: include formula reference sheet and calculation frameworks.
8. Write the Night Before Review as a single page.
9. If past papers are not available, omit past paper pattern analysis — do not guess.
10. Do not invent examiner preferences.

SAFETY:
- Do not overwrite any existing file.
- Do not stage, commit, or push.

OUTPUT: [MODULE_CODE]_S[N]_v1_0_RevisionPack.html written to 05_revision/
```

---

## Common Failure Points

- Inventing "common exam patterns" without past paper evidence
- Making the Night Before Review too long (defeats its purpose)
- Law case quick reference table missing cases that appear in tutorial documents
- Quantitative formula sheet missing edge-case formulas from later lecture slides
- Revision pack too similar to the master hub (adds no exam focus)

---

## Automation Opportunities

| Task | Automatable | Difficulty | Time Saved |
|------|-------------|------------|------------|
| Generate case quick reference from case sheets | Yes | Medium | 15 min/module |
| Generate formula sheet from build brief formula list | Yes | Medium | 10 min/module |
| Rank topics by frequency in past papers | Future | High | 20 min/module |
| Auto-generate Night Before Review from topic summaries | Future | High | 20 min/module |
