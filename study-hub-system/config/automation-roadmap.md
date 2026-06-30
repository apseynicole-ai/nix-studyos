# Automation Roadmap

**Purpose:** Prioritised plan for automating the study hub production system. Tasks are ordered by impact. Each entry includes time saved, difficulty, and dependencies.

---

## Priority Tier 1 — High Impact, Low Difficulty

These should be automated first. They are repetitive, well-defined, and low risk.

### A1 — Module Folder Creator
**What:** Script that creates the standard module folder structure in one command.
**Input:** Module code, name, semester, year, type.
**Output:** Complete folder tree matching system-config.md.
**Time saved:** 5–10 min per module.
**Difficulty:** Low.
**Tool:** Shell script or Python script.
**Dependency:** system-config.md finalised.

### A2 — Naming Convention Validator
**What:** Script that checks all filenames in a module folder against the naming convention and flags violations.
**Time saved:** 5–10 min per module.
**Difficulty:** Low.
**Tool:** Python or shell script.

### A3 — Duplicate ID Checker
**What:** Script that scans an HTML file for duplicate IDs and reports them.
**Time saved:** 5 min per audit.
**Difficulty:** Low.
**Tool:** Python (html.parser or BeautifulSoup).

### A4 — Print CSS Validator
**What:** Script that checks whether an HTML file contains the required @media print block, @page size, background colour rules, and sidebar hide rules.
**Time saved:** 3–5 min per audit.
**Difficulty:** Low.
**Tool:** Python regex or CSS parser.

### A5 — Version Watermark Inserter
**What:** Script that updates the version watermark text in an HTML file when a version number changes.
**Input:** HTML file, new version string, draft/approved status.
**Time saved:** 2–3 min per version change.
**Difficulty:** Low.
**Tool:** Python string replacement.

### A6 — Module Register Generator
**What:** Prompt that generates a pre-filled module-register.md from a short input of module details.
**Time saved:** 10–15 min per module.
**Difficulty:** Low (already done — reusable prompt in Module 01).

---

## Priority Tier 2 — High Impact, Medium Difficulty

These require more engineering but save significant time at scale.

### B1 — HTML Sidebar Link Validator
**What:** Script that checks every `href="#id"` in the sidebar against actual section IDs in the document and reports missing targets.
**Time saved:** 5–10 min per audit.
**Difficulty:** Medium.
**Tool:** Python (BeautifulSoup).

### B2 — PDF Generator (Headless Chrome)
**What:** Script that generates a PDF from an HTML file using headless Chrome (via Puppeteer or Playwright) — replicating Chrome's print output without manual steps.
**Time saved:** 5 min per print run.
**Difficulty:** Medium.
**Tool:** Puppeteer (Node.js) or Playwright (Python).
**Dependency:** Node.js or Python environment.

### B3 — Source Classification Pre-Processor
**What:** Script that reads filenames in `01_sources/raw/` and suggests classification codes (LS, TD, CD, etc.) based on filename patterns and keywords.
**Time saved:** 10–15 min per module.
**Difficulty:** Medium.
**Tool:** Python with keyword matching.

### B4 — Cover Sheet Batch Generator
**What:** Script or prompt that generates all cover sheets from a topic list JSON/YAML config file, applying the correct colour theme automatically from module type.
**Time saved:** 20–30 min per module.
**Difficulty:** Medium.
**Tool:** Python + Jinja2 template or Claude Code.

### B5 — Patch Log Auto-Generator
**What:** Script that diffs source HTML against target HTML after patching and generates the patch log automatically.
**Time saved:** 10 min per patch cycle.
**Difficulty:** Medium.
**Tool:** Python (difflib or html-diff).

### B6 — Audit Report Template Auto-Filler
**What:** After running the QA Audit prompt, a script extracts structured issue data and fills the audit report table automatically.
**Time saved:** 15 min per audit.
**Difficulty:** Medium.

---

## Priority Tier 3 — Very High Impact, High Difficulty

These are significant engineering projects. Build after Tier 1 and Tier 2 are complete.

### C1 — StudyOS Module Intake API
**What:** Web interface (part of StudyOS) where Nicole inputs module details and uploads sources. The system automatically runs Module 01 Intake and Module 02 Source Audit.
**Time saved:** 30–45 min per module.
**Difficulty:** High.
**Dependency:** StudyOS application; file storage; AI API integration.

### C2 — Automated Build Scaffold
**What:** From the approved build-brief.md, automatically generate the HTML scaffold (structure, IDs, sidebar, CSS) ready for content insertion.
**Time saved:** 30–45 min per module.
**Difficulty:** High.
**Tool:** Claude API + Python template engine.

### C3 — Change Detection Engine (Rollover)
**What:** Tool that compares new semester source files against previous semester source files and automatically generates the change analysis report for Module 13 Rollover.
**Time saved:** 30–60 min per semester rollover.
**Difficulty:** High.
**Tool:** Claude API + document comparison.

### C4 — Case Sheet Auto-Extractor
**What:** Tool that reads lecture slide PDFs and case documents and automatically extracts structured case data (name, citation, facts, ratio, principle) ready for case sheet generation.
**Time saved:** 45–90 min per law module.
**Difficulty:** High.
**Dependency:** Reliable PDF text extraction; law-specific extraction prompt.

### C5 — Formula Extractor (Quantitative)
**What:** Tool that reads lecture slides for quantitative modules and automatically extracts all formulas, variable definitions, and worked examples into structured data.
**Time saved:** 30–60 min per quantitative module.
**Difficulty:** High.
**Dependency:** PDF text extraction; formula recognition.

### C6 — Exam Pack Auto-Generator
**What:** From the approved revision pack and confirmed exam scope, automatically generate the exam pack with correct prioritisation and condensed content.
**Time saved:** 30–45 min per module.
**Difficulty:** High.
**Tool:** Claude API with revision pack as context.

---

## Priority Tier 4 — Future / StudyOS Integration

These become possible once the StudyOS application is built.

### D1 — StudyOS Module Dashboard
Input module framework → automatic folder structure, assessment tracking, deadline reminders.

### D2 — Marks Engine Integration
Assessment results automatically update study priority ranking and revision pack focus.

### D3 — NotebookLM Cross-Check Automation
After every QA Audit, automatically generate a NotebookLM query list to cross-check against uploaded sources.

### D4 — Print Pack Scheduler
Based on semester calendar, automatically suggest when to generate and print each output.

### D5 — Revision Pack Dynamic Updater
As new patches are applied to the master hub, the revision pack automatically flags sections that need updating.

---

## Automation Implementation Order

| Phase | Items | When |
|-------|-------|------|
| Phase 1 | A1–A6 | Now — before next module build |
| Phase 2 | B1–B6 | During first semester using this system |
| Phase 3 | C1–C6 | When StudyOS development begins |
| Phase 4 | D1–D5 | When StudyOS is live |
