# Automation Readiness Matrix — SHOS v1.0

**Purpose:** Assess which SHOS processes are candidates for automation, in what order, and at what effort level. Inputs to the Phase 1 and Phase 2 automation roadmap in `config/automation-roadmap.md`.

---

## Automation Criteria

Each process is assessed against five criteria:

| Criterion | Description |
|-----------|-------------|
| **Deterministic** | Can the process produce exactly one correct output for a given input? |
| **Input-defined** | Are all inputs structured and available programmatically? |
| **Low creative judgment** | Does the process require human creativity, or is it mechanical? |
| **High frequency** | Will this process run many times per semester? |
| **Error-prone manually** | Does manual execution frequently produce mistakes? |

Scoring: 0 (No) / 1 (Partial) / 2 (Yes) per criterion. Maximum 10 points.

---

## Matrix

| # | Process | Det. | Input | Judgment | Freq. | Error | Total | Priority | Phase |
|---|---------|------|-------|---------|-------|-------|-------|----------|-------|
| A1 | Folder structure initialisation | 2 | 2 | 2 | 2 | 1 | **9** | P1 | Phase 1 |
| A2 | File naming convention validator | 2 | 2 | 2 | 2 | 2 | **10** | P1 | Phase 1 |
| A3 | module.yaml schema validator | 2 | 2 | 2 | 2 | 1 | **9** | P1 | Phase 1 |
| A4 | Source manifest auto-generation | 2 | 1 | 2 | 2 | 2 | **9** | P1 | Phase 1 |
| A5 | Build manifest auto-update | 2 | 2 | 2 | 2 | 2 | **10** | P1 | Phase 1 |
| A6 | Gate status dashboard update | 2 | 2 | 2 | 2 | 2 | **10** | P1 | Phase 1 |
| A7 | HTML structural validation | 2 | 2 | 2 | 1 | 2 | **9** | P1 | Phase 1 |
| A8 | Version number increment | 2 | 2 | 2 | 2 | 2 | **10** | P1 | Phase 1 |
| A9 | Case sheet completeness check (law) | 2 | 2 | 2 | 1 | 2 | **9** | P1 | Phase 1 |
| B1 | Source PDF text extraction | 2 | 1 | 2 | 2 | 1 | **8** | P2 | Phase 1 |
| B2 | CSS component library validation | 2 | 2 | 1 | 1 | 2 | **8** | P2 | Phase 1 |
| B3 | Print CSS validation (headless Chrome) | 2 | 2 | 1 | 1 | 2 | **8** | P2 | Phase 1 |
| B4 | Revision pack formula completeness check | 2 | 2 | 1 | 1 | 2 | **8** | P2 | Phase 2 |
| B5 | Archive manifest auto-generation | 2 | 2 | 2 | 1 | 1 | **8** | P2 | Phase 2 |
| C1 | Source coverage gap analysis | 1 | 1 | 1 | 1 | 1 | **5** | P3 | Phase 2 |
| C2 | QA structural audit (Domains C, D, E) | 2 | 2 | 0 | 1 | 1 | **6** | P3 | Phase 2 |
| C3 | Multi-module cross-reference check | 1 | 1 | 1 | 1 | 1 | **5** | P3 | Phase 3 |
| C4 | Full academic QA (Domains A, B) | 0 | 0 | 0 | 1 | 1 | **2** | Not automatable | — |
| C5 | Source tiering and classification | 0 | 0 | 0 | 1 | 1 | **2** | Not automatable | — |
| C6 | Build brief creation and approval | 0 | 0 | 0 | 1 | 0 | **1** | Not automatable | — |

---

## Phase 1 Automation — Structural Tools

**Goal:** Eliminate mechanical errors. Automate all operations that are deterministic and currently error-prone.

### A1 — Folder Structure Initialisation

**What it does:** Given a module code and semester, creates the standard SHOS folder tree.

**Input:** `module_code`, `semester`, `module_type`  
**Output:** Standard folder structure with empty placeholder files  
**Tool:** Shell script or Python script  
**Effort:** Low (2–4 hours)  

```
shos init FOL178 S1 law
→ Creates: 00_intake/ 01_sources/ 02_builds/ 03_revision/ 04_exam/
           05_archive/ 06_audit/ 07_print/ 08_covers/ 09_case_sheets/
           module.yaml (pre-populated from template)
           module-register.md (blank template)
```

**Dependency:** module-template.yaml

---

### A2 — File Naming Convention Validator

**What it does:** Scans a module folder and reports any files that violate the SHOS naming convention.

**Input:** Module folder path  
**Output:** Report of compliant / non-compliant files  
**Tool:** Python script or shell script  
**Effort:** Low (2–4 hours)  

**Checks:**
- Version number format: `v[major]_[minor]` (not `v1.0`, not `v1-0`)
- Module code present: `FOL178_S1_`
- No disallowed suffixes: `_APPROVED`, `_final`, `_copy`, `_backup`
- No spaces in filenames

---

### A3 — module.yaml Schema Validator

**What it does:** Validates a module.yaml file against a JSON Schema. Catches missing required fields, wrong data types, and out-of-range values.

**Input:** `module.yaml` file path  
**Output:** Pass / list of schema violations  
**Tool:** Python (jsonschema library) or yamllint  
**Effort:** Medium (4–8 hours to write schema + validator)  

**Schema checks:**
- All required fields present (module_code, module_type, etc.)
- `module_type` is one of: `law`, `quantitative`, `mixed`
- `semester` matches `S[1-3]` format
- `theme.preset` is one of: `law`, `accounting`, `statistics`, `economics`
- `build_status` gate fields are one of: `not_started`, `in_progress`, `passed`, `bypassed`

---

### A4 — Source Manifest Auto-Generation

**What it does:** Generates a source-manifest.md scaffold from a folder scan of `01_sources/raw/`.

**Input:** `01_sources/raw/` folder  
**Output:** `01_sources/source-manifest.md` pre-populated with filenames and detected formats  
**Tool:** Python or shell script  
**Effort:** Low (2–4 hours)  

**Limitation:** Cannot auto-assign tiers — that requires human/AI judgment. The script produces the scaffold; the Source Auditor fills in tiers.

---

### A5 — Build Manifest Auto-Update

**What it does:** Appends a new build entry to build-manifest.md whenever an HTML file is produced or patched.

**Input:** HTML filename, build type (initial / patch / re-audit)  
**Output:** New row appended to `06_audit/build-manifest.md`  
**Tool:** Claude Code hook or shell script  
**Effort:** Low (1–2 hours)  

---

### A6 — Gate Status Dashboard Update

**What it does:** Updates the `build_status` section of module.yaml when a gate passes.

**Input:** Gate number, pass/hold/bypass  
**Output:** Updated `build_status` field in module.yaml  
**Tool:** Python script or Claude Code prompt with structured output  
**Effort:** Low (2–4 hours)  

---

### A7 — HTML Structural Validation

**What it does:** Checks that a produced HTML file contains all required structural elements defined in html-spec.md.

**Input:** HTML file  
**Output:** Pass / list of missing structural elements  
**Tool:** Python (BeautifulSoup) or htmlvalidator  
**Effort:** Medium (4–8 hours)  

**Checks:**
- Required IDs present: `#cover`, `#topic-[N]`, `#print-toc`
- Component CSS classes present for module type (e.g., `.case-card` for law)
- `@media print` block present
- No inline styles that would override print CSS

---

### A8 — Version Number Increment

**What it does:** Renames an HTML file to the next version number in the sequence.

**Input:** Current filename, increment type (minor/major)  
**Output:** Renamed file (v0.8 → v0.9 → v1.0 → v1.1)  
**Tool:** Shell script  
**Effort:** Very low (1 hour)  
**Safety check:** Refuses to increment if a higher version already exists in the folder.

---

### A9 — Case Sheet Completeness Check (Law Modules)

**What it does:** Reads `law.cases_required` from module.yaml, scans `09_case_sheets/`, and confirms a case sheet exists for every required case.

**Input:** `module.yaml`, `09_case_sheets/` folder  
**Output:** Pass / list of missing case sheets  
**Tool:** Python script  
**Effort:** Low (2 hours)  

**This directly resolves the ST-10 gap identified in the Stress Test Report.**

---

## Phase 1 Automation — Process Tools

### B1 — Source PDF Text Extraction

**What it does:** Extracts text from PDFs in `01_sources/raw/` and saves as `.txt` files in `01_sources/processed/`.

**Input:** PDF files  
**Output:** `.txt` extracts ready for Claude context pasting  
**Tool:** Python (pdfplumber or pypdf2)  
**Effort:** Low (2–4 hours)  
**Limitation:** Cannot extract content from image-based PDFs — flags these for manual OCR.

**This partially resolves G2-01 (file access protocol). Claude can read the extracted `.txt` files without context overflow risk.**

---

### B2 — CSS Component Library Validation

**What it does:** Tests every component in component-library.md by injecting CSS into a test HTML file and checking rendering in headless Chrome.

**Input:** component-library.md  
**Output:** Screenshot of each component + pass/fail for `color-mix()` support  
**Tool:** Playwright (headless Chrome)  
**Effort:** Medium (4–6 hours)  

**This directly resolves W-03 (component CSS not validated in a real browser).**

---

### B3 — Print CSS Validation (Headless Chrome)

**What it does:** Renders an HTML file in headless Chrome with print emulation and checks that all print CSS is applied correctly.

**Input:** HTML file  
**Output:** Print preview PDF + report of CSS violations  
**Tool:** Playwright or puppeteer  
**Effort:** Medium (4–6 hours)  

---

## Phase 2 Automation — Intelligence Layer

### B4 — Revision Pack Formula Completeness Check

**What it does:** Compares formula boxes (`.formula-box` elements) between the master hub and the revision pack. Flags any formula present in the hub but absent from the revision pack.

**Input:** Master hub HTML + revision pack HTML  
**Output:** List of missing formulas  
**Tool:** Python (BeautifulSoup)  
**Effort:** Low (2 hours)  

**This directly resolves G7-01.**

---

### C2 — QA Structural Audit (Domains C, D, E)

**What it does:** Automates the structural portion of the Gate 5 QA audit. Checks heading hierarchy, component usage, ID naming, version watermark, print compatibility.

**Input:** HTML file  
**Output:** Structured audit report for Domains C, D, E  
**Tool:** Python + headless Chrome  
**Effort:** High (10–20 hours)  

**Limitation:** Cannot replace the academic audit (Domains A, B). Reduces Gate 5 Claude context burden by handling structural checks before Claude loads the file.**

---

## Not Automatable — Permanently Human-Gated

| Process | Reason |
|---------|--------|
| C4 — Academic QA (Domains A, B) | Requires judgment about whether content is accurate vs. source |
| C5 — Source tiering and classification | Requires reading and evaluating source quality |
| C6 — Build brief creation and approval | Requires understanding exam priorities and learning goals |
| Case law analysis (FIRAC) | Requires legal reasoning — never automatable in this system |
| Assessment strategy | Must reflect Nicole's exam preparation judgment |

---

## Automation Roadmap Summary

| Phase | Items | Total effort estimate | Target |
|-------|-------|----------------------|--------|
| Phase 1 — Structural | A1–A9, B1–B3 | 30–50 hours | Before first live module |
| Phase 2 — Intelligence | B4, B5, C1, C2 | 30–50 hours | After first production cycle |
| Phase 3 — Integration | C3, StudyOS API | 50+ hours | StudyOS application |

**Phase 1 automation alone would eliminate the most error-prone mechanical steps (file naming, gate tracking, folder creation, manifest generation) and directly resolve three identified gaps (G2-01 partial, W-03, ST-10).**
