# HTML Component Library

**Version:** 1.0  
**Purpose:** Reusable, standardised HTML components for all study hub builds. Every component is self-contained. Assemble hubs from these components instead of writing HTML from scratch.

**Usage:** Copy the HTML block into your build. Replace `[PLACEHOLDER]` text. Apply the module colour theme via CSS custom properties.

---

## CSS Custom Properties (Required in every hub)

Include this in the `<style>` block of every hub. Replace hex values with the module colour theme from style-guide.md.

```css
:root {
  --primary:    #1a2744;   /* replace with module primary */
  --accent:     #c9a227;   /* replace with module accent */
  --bg:         #faf8f3;   /* replace with module background */
  --surface:    #ffffff;
  --text:       #1a1a1a;
  --text-muted: #5a5a5a;
  --border:     #d4c9a8;   /* replace with module border */
  --danger:     #c0392b;
  --success:    #27ae60;
  --warning:    #d4a017;
}
```

---

## Component Index

| # | Component | Use in |
|---|-----------|--------|
| C-01 | Definition Box | All modules |
| C-02 | Formula Box | Quantitative |
| C-03 | Worked Example Box | Quantitative |
| C-04 | Warning / Exam Trap Box | All modules |
| C-05 | Exam Tip Box | All modules |
| C-06 | Case Card | Law |
| C-07 | Legal Test Box | Law |
| C-08 | Principle Box | Law |
| C-09 | Memory Trigger | All modules |
| C-10 | Graph Container | Quantitative / Economics |
| C-11 | Practice Question | All modules |
| C-12 | Essay Template | Law |
| C-13 | Checklist | All modules |
| C-14 | Quick Reference Table | All modules |
| C-15 | Timeline | Law / History topics |
| C-16 | Comparison Table | All modules |
| C-17 | Topic Header Band | All modules |
| C-18 | Section Divider | All modules |
| C-19 | Module Overview Card | All modules |
| C-20 | FIRAC Template | Law |

---

## C-01 — Definition Box

**Purpose:** Define a term, concept, or legal word.  
**Use in:** All modules.  
**Print behaviour:** Stays on one page; background colour prints.

```html
<div class="component definition-box" id="def-[term-slug]">
  <span class="component-label">Definition</span>
  <h4 class="component-title">[Term]</h4>
  <p class="component-body">[Definition text from source]</p>
  <p class="component-source">Source: [source code]</p>
</div>
```

```css
.definition-box {
  border-left: 4px solid var(--primary);
  background: color-mix(in srgb, var(--primary) 6%, white);
  padding: 1rem 1.25rem;
  margin: 1rem 0;
  border-radius: 0 4px 4px 0;
}
.definition-box .component-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--primary);
}
.definition-box .component-title {
  margin: 0.25rem 0 0.5rem;
  font-size: 1rem;
  font-weight: 700;
}
.definition-box .component-source {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}
```

**Accessibility:** Heading inside box for screen reader navigation.  
**Print:** `page-break-inside: avoid` in @media print.

---

## C-02 — Formula Box

**Purpose:** Display a mathematical or statistical formula with variable definitions.  
**Use in:** Quantitative modules (Statistics, Accounting, Economics).  
**Print behaviour:** Never split across pages.

```html
<div class="component formula-box" id="formula-[name-slug]">
  <span class="component-label">Formula</span>
  <h4 class="component-title">[Formula Name]</h4>
  <div class="formula-display">[Formula — e.g. Ŷ = β₀ + β₁X]</div>
  <div class="formula-variables">
    <p class="variables-label">Where:</p>
    <ul>
      <li><strong>[Symbol]</strong> = [Definition]</li>
      <li><strong>[Symbol]</strong> = [Definition]</li>
    </ul>
  </div>
  <p class="formula-use"><strong>Use when:</strong> [When to apply]</p>
  <p class="component-source">Source: [source code]</p>
</div>
```

```css
.formula-box {
  border-left: 4px solid var(--accent);
  background: color-mix(in srgb, var(--accent) 8%, white);
  padding: 1rem 1.25rem;
  margin: 1rem 0;
  border-radius: 0 4px 4px 0;
}
.formula-display {
  font-family: 'Courier New', monospace;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
  padding: 0.75rem 1rem;
  background: rgba(255,255,255,0.7);
  border-radius: 4px;
  margin: 0.75rem 0;
  letter-spacing: 0.02em;
}
.variables-label { font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem; }
.formula-variables ul { margin: 0; padding-left: 1.5rem; font-size: 0.9rem; }
```

---

## C-03 — Worked Example Box

**Purpose:** Walk through a complete calculation or application with numbered steps.  
**Use in:** Quantitative modules.  
**Print behaviour:** Avoid splitting between pages; if long, allow graceful split.

```html
<div class="component example-box" id="example-[slug]">
  <span class="component-label">Worked Example</span>
  <h4 class="component-title">[Example title or scenario]</h4>
  <div class="example-scenario">
    <p><strong>Given:</strong> [Data / scenario]</p>
    <p><strong>Find:</strong> [What to calculate]</p>
  </div>
  <ol class="example-steps">
    <li><strong>Step 1:</strong> [Action and calculation]</li>
    <li><strong>Step 2:</strong> [Action and calculation]</li>
  </ol>
  <div class="example-answer">
    <p><strong>Answer:</strong> [Final result with units]</p>
    <p><strong>Interpretation:</strong> [What the result means]</p>
  </div>
  <p class="component-source">Source: [source code]</p>
</div>
```

```css
.example-box {
  border-left: 4px solid var(--success);
  background: #f4faf6;
  padding: 1rem 1.25rem;
  margin: 1rem 0;
  border-radius: 0 4px 4px 0;
}
.example-steps { padding-left: 1.5rem; }
.example-steps li { margin-bottom: 0.5rem; font-size: 0.9rem; }
.example-answer {
  background: rgba(39, 174, 96, 0.08);
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin-top: 0.75rem;
}
```

---

## C-04 — Warning / Exam Trap Box

**Purpose:** Highlight a common mistake, misconception, or exam trap.  
**Use in:** All modules.  
**Print behaviour:** Never split; background red tint prints.

```html
<div class="component warning-box" id="warn-[slug]">
  <span class="component-label">⚠ Exam Trap</span>
  <h4 class="component-title">[Trap name or title]</h4>
  <p class="component-body">[Description of the mistake and why it costs marks]</p>
  <p class="correct-approach"><strong>Correct approach:</strong> [What to do instead]</p>
</div>
```

```css
.warning-box {
  border-left: 4px solid var(--danger);
  background: #fdf2f2;
  padding: 1rem 1.25rem;
  margin: 1rem 0;
  border-radius: 0 4px 4px 0;
}
.warning-box .component-label { color: var(--danger); }
.correct-approach {
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255,255,255,0.7);
  border-radius: 4px;
  font-size: 0.9rem;
}
```

---

## C-05 — Exam Tip Box

**Purpose:** Practical exam strategy advice — how to approach a question or present an answer.  
**Use in:** All modules.  
**Print behaviour:** Keep together.

```html
<div class="component tip-box" id="tip-[slug]">
  <span class="component-label">Exam Tip</span>
  <p class="component-body">[Practical exam advice]</p>
</div>
```

```css
.tip-box {
  border-left: 4px solid var(--warning);
  background: color-mix(in srgb, var(--warning) 8%, white);
  padding: 0.875rem 1.25rem;
  margin: 0.75rem 0;
  border-radius: 0 4px 4px 0;
}
.tip-box .component-label { color: var(--warning); }
```

---

## C-06 — Case Card

**Purpose:** Summarise a law case for revision — compact format for the main hub.  
**Use in:** Law modules only.  
**Note:** Full case sheets are in Module 09. This is the condensed hub version.

```html
<div class="component case-card" id="case-[name-slug]">
  <div class="case-card-header">
    <h4 class="case-name">[Case Name] <span class="case-year">[[Year]]</span></h4>
    <span class="case-court">[Court]</span>
  </div>
  <div class="case-card-body">
    <p class="case-area"><strong>Area:</strong> [Area of law]</p>
    <p><strong>Facts:</strong> [2–3 sentence summary]</p>
    <p><strong>Issue:</strong> [Legal question decided]</p>
    <p><strong>Ratio:</strong> [The legal rule established]</p>
    <p class="case-principle"><strong>Principle:</strong> [Exam-ready one-sentence statement]</p>
    <p class="case-exam-use"><strong>Exam use:</strong> [How to cite in exam]</p>
  </div>
  <p class="component-source">Source: [source code]</p>
</div>
```

```css
.case-card {
  border: 1px solid var(--border);
  border-top: 4px solid var(--accent);
  background: var(--surface);
  border-radius: 4px;
  padding: 1rem 1.25rem;
  margin: 1rem 0;
}
.case-card-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.5rem;
  margin-bottom: 0.75rem;
}
.case-name { font-size: 1rem; font-weight: 700; margin: 0; }
.case-year { font-weight: 400; font-size: 0.875rem; color: var(--text-muted); }
.case-court { font-size: 0.8rem; color: var(--text-muted); }
.case-principle {
  background: color-mix(in srgb, var(--accent) 10%, white);
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}
.case-exam-use { font-size: 0.875rem; font-style: italic; color: var(--text-muted); }
```

---

## C-07 — Legal Test Box

**Purpose:** State the elements of a legal test as a numbered or bulleted list.  
**Use in:** Law modules only.

```html
<div class="component legal-test-box" id="test-[slug]">
  <span class="component-label">Legal Test</span>
  <h4 class="component-title">[Test name — e.g. "Elements of a Valid Offer"]</h4>
  <p class="test-source-rule">[The rule as stated in the source]</p>
  <ol class="test-elements">
    <li>[Element 1]</li>
    <li>[Element 2]</li>
    <li>[Element 3]</li>
  </ol>
  <p class="test-memory"><strong>Memory:</strong> [Mnemonic if applicable]</p>
  <p class="component-source">Source: [source code]</p>
</div>
```

```css
.legal-test-box {
  border-left: 4px solid var(--accent);
  background: color-mix(in srgb, var(--accent) 8%, white);
  padding: 1rem 1.25rem;
  margin: 1rem 0;
  border-radius: 0 4px 4px 0;
}
.test-elements { padding-left: 1.5rem; }
.test-elements li { margin-bottom: 0.4rem; font-size: 0.95rem; }
.test-memory { font-size: 0.875rem; font-style: italic; margin-top: 0.5rem; }
```

---

## C-08 — Principle Box

**Purpose:** State a key legal or academic principle clearly, with source attribution.  
**Use in:** Law modules primarily; may adapt for other disciplines.

```html
<div class="component principle-box" id="principle-[slug]">
  <span class="component-label">Principle</span>
  <p class="principle-statement">[The principle — one or two sentences, as stated in source]</p>
  <p class="component-source">Source: [source code]</p>
</div>
```

```css
.principle-box {
  border-left: 4px solid var(--primary);
  background: color-mix(in srgb, var(--primary) 5%, white);
  padding: 1rem 1.25rem;
  margin: 1rem 0;
  border-radius: 0 4px 4px 0;
}
.principle-statement {
  font-size: 1rem;
  font-style: italic;
  font-weight: 500;
  color: var(--primary);
  margin: 0;
}
```

---

## C-09 — Memory Trigger

**Purpose:** A short, memorable hook that encodes a case, principle, or formula for recall.  
**Use in:** All modules.

```html
<div class="component memory-trigger" id="memory-[slug]">
  <span class="component-label">Memory Trigger</span>
  <p class="trigger-hook">[The memory hook — phrase, acronym, or short cue]</p>
  <p class="trigger-meaning">[What it encodes]</p>
</div>
```

```css
.memory-trigger {
  border: 1px dashed var(--primary);
  background: color-mix(in srgb, var(--primary) 3%, white);
  padding: 0.75rem 1.25rem;
  margin: 0.75rem 0;
  border-radius: 4px;
}
.trigger-hook {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 0.25rem;
}
.trigger-meaning { font-size: 0.875rem; color: var(--text-muted); margin: 0; }
```

---

## C-10 — Graph Container

**Purpose:** Display a graph description or SVG diagram with axis labels and interpretation.  
**Use in:** Quantitative modules, Economics.  
**Note:** Use SVG for simple graphs; use a text description for complex graphs. Never embed images with external URLs.

```html
<div class="component graph-container" id="graph-[slug]">
  <span class="component-label">Graph</span>
  <h4 class="component-title">[Graph name — e.g. "Supply and Demand Equilibrium"]</h4>
  <div class="graph-visual">
    <!-- Option A: SVG for simple graphs -->
    <svg viewBox="0 0 300 250" width="300" height="250" aria-label="[Description for screen readers]">
      <!-- SVG content -->
    </svg>
    <!-- Option B: Text description for complex graphs -->
    <div class="graph-text-description">
      <p>[Written description of what the graph shows, including axes, curves, and key points]</p>
    </div>
  </div>
  <div class="graph-interpretation">
    <p><strong>X-axis:</strong> [Label and meaning]</p>
    <p><strong>Y-axis:</strong> [Label and meaning]</p>
    <p><strong>What this shows:</strong> [Key insight]</p>
    <p><strong>Shift trigger:</strong> [What causes the curve to shift, if applicable]</p>
  </div>
  <p class="component-source">Source: [source code]</p>
</div>
```

```css
.graph-container { border: 1px solid var(--border); border-radius: 4px; padding: 1rem 1.25rem; margin: 1rem 0; }
.graph-visual { text-align: center; margin: 1rem 0; background: var(--bg); padding: 1rem; border-radius: 4px; }
.graph-interpretation { font-size: 0.9rem; }
.graph-interpretation p { margin-bottom: 0.4rem; }
```

---

## C-11 — Practice Question

**Purpose:** Present a practice or exam-style question with space for a working response.  
**Use in:** All modules.

```html
<div class="component practice-question" id="pq-[slug]">
  <div class="pq-header">
    <span class="component-label">Practice Question</span>
    <span class="pq-difficulty">[Easy / Medium / Hard]</span>
    <span class="pq-type">[Short answer / Essay / Calculation / Problem question]</span>
  </div>
  <div class="pq-stem">
    <p>[Question text]</p>
  </div>
  <details class="pq-answer">
    <summary>Show suggested answer</summary>
    <div class="pq-answer-content">
      <p>[Suggested answer or marking points]</p>
    </div>
  </details>
  <p class="component-source">Source: [source code / past paper year]</p>
</div>
```

```css
.practice-question { border: 1px solid var(--border); border-radius: 4px; padding: 1rem 1.25rem; margin: 1rem 0; }
.pq-header { display: flex; gap: 1rem; align-items: center; margin-bottom: 0.75rem; }
.pq-difficulty, .pq-type { font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 3px; background: var(--bg); }
.pq-stem { font-size: 0.95rem; margin-bottom: 0.75rem; }
.pq-answer { cursor: pointer; }
.pq-answer-content { padding: 0.75rem; background: var(--bg); border-radius: 4px; margin-top: 0.5rem; font-size: 0.9rem; }
/* Print: show answer content, hide toggle */
@media print { .pq-answer > summary { display: none; } .pq-answer-content { display: block !important; } }
```

---

## C-12 — Essay Template

**Purpose:** Provide a structural scaffold for writing a law essay.  
**Use in:** Law modules only.

```html
<div class="component essay-template" id="essay-template-[slug]">
  <span class="component-label">Essay Template</span>
  <h4 class="component-title">[Topic or question type — e.g. "Constitutional Validity Essay"]</h4>
  <div class="essay-structure">
    <div class="essay-section">
      <h5>Introduction</h5>
      <ul>
        <li>Identify the legal issue raised by the question</li>
        <li>State the relevant area of law</li>
        <li>State your argument / thesis in one sentence</li>
        <li>Briefly outline the structure of your analysis</li>
      </ul>
    </div>
    <div class="essay-section">
      <h5>Body — [Repeat for each issue]</h5>
      <ul>
        <li>State the principle / rule</li>
        <li>Cite the authority (case or statute)</li>
        <li>Apply the rule to the facts of the question</li>
        <li>Reach a sub-conclusion</li>
      </ul>
    </div>
    <div class="essay-section">
      <h5>Conclusion</h5>
      <ul>
        <li>Summarise the analysis</li>
        <li>State your final answer to the question</li>
        <li>No new cases or arguments</li>
      </ul>
    </div>
  </div>
  <div class="essay-notes">
    <p><strong>Module-specific notes:</strong> [Any additional structure required for this module]</p>
  </div>
</div>
```

```css
.essay-template { border: 1px solid var(--primary); border-radius: 4px; padding: 1rem 1.25rem; margin: 1rem 0; }
.essay-section { margin-bottom: 0.75rem; padding-bottom: 0.75rem; border-bottom: 1px dashed var(--border); }
.essay-section h5 { color: var(--primary); font-size: 0.9rem; margin-bottom: 0.5rem; }
.essay-section ul { font-size: 0.875rem; margin: 0; padding-left: 1.25rem; }
.essay-notes { font-size: 0.85rem; font-style: italic; color: var(--text-muted); }
```

---

## C-13 — Checklist

**Purpose:** A self-assessment checklist for learning outcomes or exam readiness.  
**Use in:** All modules.

```html
<div class="component checklist" id="checklist-[slug]">
  <span class="component-label">Checklist</span>
  <h4 class="component-title">[Checklist title — e.g. "Topic 3 Readiness Check"]</h4>
  <ul class="checklist-items">
    <li class="checklist-item">
      <input type="checkbox" id="chk-[slug]-1">
      <label for="chk-[slug]-1">[I can explain…]</label>
    </li>
    <li class="checklist-item">
      <input type="checkbox" id="chk-[slug]-2">
      <label for="chk-[slug]-2">[I can apply…]</label>
    </li>
    <li class="checklist-item">
      <input type="checkbox" id="chk-[slug]-3">
      <label for="chk-[slug]-3">[I can calculate…]</label>
    </li>
  </ul>
</div>
```

```css
.checklist { border: 1px solid var(--border); border-radius: 4px; padding: 1rem 1.25rem; margin: 1rem 0; }
.checklist-items { list-style: none; padding: 0; margin: 0.5rem 0 0; }
.checklist-item { display: flex; align-items: baseline; gap: 0.5rem; margin-bottom: 0.4rem; font-size: 0.9rem; }
/* Print: show as static list */
@media print { .checklist-item input { display: inline; } }
```

---

## C-14 — Quick Reference Table

**Purpose:** A compact table summarising key information for fast revision.  
**Use in:** All modules.

```html
<div class="component quick-ref" id="qr-[slug]">
  <span class="component-label">Quick Reference</span>
  <h4 class="component-title">[Table title]</h4>
  <table class="qr-table">
    <thead>
      <tr>
        <th>[Column 1]</th>
        <th>[Column 2]</th>
        <th>[Column 3]</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>[Cell]</td>
        <td>[Cell]</td>
        <td>[Cell]</td>
      </tr>
    </tbody>
  </table>
</div>
```

```css
.quick-ref { margin: 1rem 0; }
.qr-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.qr-table th { background: var(--primary); color: #fff; padding: 0.5rem 0.75rem; text-align: left; }
.qr-table td { padding: 0.45rem 0.75rem; border-bottom: 1px solid var(--border); vertical-align: top; }
.qr-table tr:nth-child(even) td { background: color-mix(in srgb, var(--primary) 3%, white); }
```

---

## C-15 — Timeline

**Purpose:** Show a sequence of events, cases, or legislative changes in chronological order.  
**Use in:** Law (constitutional history, case law development), History topics.

```html
<div class="component timeline" id="timeline-[slug]">
  <span class="component-label">Timeline</span>
  <h4 class="component-title">[Timeline title]</h4>
  <div class="timeline-items">
    <div class="timeline-item">
      <div class="timeline-year">[Year]</div>
      <div class="timeline-content">
        <strong>[Event / Case name]</strong>
        <p>[Brief description]</p>
      </div>
    </div>
    <!-- Repeat .timeline-item for each event -->
  </div>
</div>
```

```css
.timeline-items { position: relative; padding-left: 2rem; border-left: 2px solid var(--accent); margin-top: 1rem; }
.timeline-item { position: relative; margin-bottom: 1.25rem; }
.timeline-year {
  position: absolute; left: -3.25rem;
  background: var(--accent); color: #fff;
  font-size: 0.75rem; font-weight: 700;
  padding: 0.2rem 0.4rem; border-radius: 3px;
}
.timeline-content { padding-left: 0.5rem; font-size: 0.9rem; }
```

---

## C-16 — Comparison Table

**Purpose:** Compare two or more items, concepts, rules, or approaches side by side.  
**Use in:** All modules.

```html
<div class="component comparison-table" id="compare-[slug]">
  <span class="component-label">Comparison</span>
  <h4 class="component-title">[What is being compared]</h4>
  <table class="qr-table">
    <thead>
      <tr>
        <th>Criteria</th>
        <th>[Option A]</th>
        <th>[Option B]</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>[Criterion]</strong></td>
        <td>[A's value]</td>
        <td>[B's value]</td>
      </tr>
    </tbody>
  </table>
</div>
```

*(Uses same CSS as C-14 Quick Reference Table)*

---

## C-17 — Topic Header Band

**Purpose:** Mark the beginning of a new topic section with a full-width colour header.  
**Use in:** All modules — at the start of every topic section.

```html
<div class="topic-header" id="topic-[N]-[slug]">
  <span class="topic-number">Topic [N]</span>
  <h2>[Topic Name]</h2>
  <p class="topic-tagline">[One-sentence description of what this topic covers]</p>
</div>
```

```css
.topic-header {
  background: var(--primary);
  color: #ffffff;
  padding: 2rem 2.5rem;
  margin: 2rem -3rem 2rem -3rem;
}
.topic-number {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--accent);
  margin-bottom: 0.4rem;
}
.topic-header h2 { color: #fff; font-size: 1.75rem; margin: 0 0 0.5rem; border: none; }
.topic-tagline { color: rgba(255,255,255,0.7); font-size: 0.9rem; margin: 0; }
```

---

## C-18 — Section Divider

**Purpose:** Visually separate sub-sections within a topic without a full header band.

```html
<div class="section-divider" id="[section-slug]">
  <h3>[Section title]</h3>
</div>
```

```css
.section-divider h3 {
  border-bottom: 2px solid var(--accent);
  padding-bottom: 0.4rem;
  margin-top: 2rem;
  color: var(--primary);
}
```

---

## C-19 — Module Overview Card

**Purpose:** The opening card for the entire hub — module identity, assessment summary, exam scope.  
**Use in:** All modules, at the very top of the main content.

```html
<div class="component module-overview-card" id="module-overview">
  <div class="moc-header">
    <span class="moc-code">[MODULE_CODE]</span>
    <h1 class="moc-title">[Full Module Name]</h1>
    <p class="moc-meta">[Semester] [Year] &nbsp;·&nbsp; [Module Type] &nbsp;·&nbsp; Version [X.X]</p>
  </div>
  <div class="moc-body">
    <div class="moc-section">
      <h3>Assessment</h3>
      <table class="qr-table">
        <thead><tr><th>Assessment</th><th>Weight</th><th>Due</th></tr></thead>
        <tbody>
          <tr><td>[Name]</td><td>[%]</td><td>[Date]</td></tr>
        </tbody>
      </table>
    </div>
    <div class="moc-section">
      <h3>Exam Scope</h3>
      <p>[Confirmed scope / "TBC — estimated based on module emphasis"]</p>
    </div>
    <div class="moc-section">
      <h3>How to Use This Hub</h3>
      <p>[Brief guide — e.g. "Use the sidebar to navigate topics. Print using Chrome with background graphics enabled."]</p>
    </div>
  </div>
</div>
```

```css
.module-overview-card { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 2rem; }
.moc-header { background: var(--primary); color: #fff; padding: 1.5rem 2rem; }
.moc-code { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent); }
.moc-title { font-size: 1.75rem; margin: 0.25rem 0; color: #fff; }
.moc-meta { font-size: 0.875rem; color: rgba(255,255,255,0.7); margin: 0; }
.moc-body { padding: 1.5rem 2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; }
.moc-section h3 { font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--primary); border-bottom: 1px solid var(--border); padding-bottom: 0.35rem; }
```

---

## C-20 — FIRAC Template

**Purpose:** Walk through a FIRAC analysis for a law problem question.  
**Use in:** Law modules only.

```html
<div class="component firac-template" id="firac-[slug]">
  <span class="component-label">FIRAC Analysis</span>
  <h4 class="component-title">[Issue or scenario title]</h4>
  <div class="firac-step" id="firac-[slug]-facts">
    <h5><span class="firac-letter">F</span> Facts</h5>
    <p>[Relevant facts from the problem question]</p>
  </div>
  <div class="firac-step" id="firac-[slug]-issue">
    <h5><span class="firac-letter">I</span> Issue</h5>
    <p>[The legal question: "Whether…"]</p>
  </div>
  <div class="firac-step" id="firac-[slug]-rule">
    <h5><span class="firac-letter">R</span> Rule</h5>
    <p>[The applicable legal principle and test]</p>
    <p class="firac-authority">Authority: [Case name / Statute]</p>
  </div>
  <div class="firac-step" id="firac-[slug]-application">
    <h5><span class="firac-letter">A</span> Application</h5>
    <p>[Apply the rule to the facts — element by element]</p>
  </div>
  <div class="firac-step" id="firac-[slug]-conclusion">
    <h5><span class="firac-letter">C</span> Conclusion</h5>
    <p>[Outcome: "Therefore, [party] will/will not succeed because…"]</p>
  </div>
</div>
```

```css
.firac-template { border: 1px solid var(--primary); border-radius: 4px; overflow: hidden; margin: 1rem 0; }
.firac-step { padding: 0.75rem 1.25rem; border-bottom: 1px solid var(--border); }
.firac-step:last-child { border-bottom: none; }
.firac-step h5 { display: flex; align-items: center; gap: 0.5rem; margin: 0 0 0.4rem; font-size: 0.9rem; color: var(--primary); }
.firac-letter {
  display: inline-block;
  width: 1.5rem; height: 1.5rem;
  background: var(--primary); color: #fff;
  border-radius: 3px;
  text-align: center; line-height: 1.5rem;
  font-size: 0.8rem; font-weight: 700;
}
.firac-authority { font-size: 0.8rem; font-style: italic; color: var(--text-muted); }
```

---

## Component Usage Rules

1. Every component must have a unique `id` attribute.
2. IDs follow the format: `[component-prefix]-[descriptive-slug]`.
3. Source attribution (`component-source` class) is required on all content components (C-01 through C-09).
4. Never modify a component's structural HTML — only the content between placeholders.
5. Add `page-break-inside: avoid` to any component in the `@media print` block if it must not split across pages.
6. Do not use component classes for styling anything other than their designated component type.
