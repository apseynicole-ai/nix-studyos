# AI Agent Registry

**Version:** 1.0  
**Purpose:** Formal specification of every AI agent in the production pipeline. Use this to assign tasks consistently. Never assign a task to the wrong agent.

---

## Agent Selection Quick Reference

| Task | Agent | Tool |
|------|-------|------|
| Plan module structure | Study Hub Architect | ChatGPT |
| Audit sources | Source Auditor | Claude |
| Write build brief | Build Planner | Claude |
| Build law content | Law Content Specialist | Claude |
| Build accounting content | Accounting Specialist | Claude |
| Build economics content | Economics Specialist | Claude |
| Build statistics content | Statistics Specialist | Claude |
| Write or build HTML | HTML Builder | Claude Code |
| Patch existing HTML | HTML Patch Engineer | Claude Code |
| Academic QA review | QA Auditor | Claude |
| Print layout check | Print QA Inspector | Claude Code |
| Generate cover sheets | Cover Sheet Generator | Claude Code |
| Generate case sheets | Case Sheet Generator | Claude Code |
| Build revision pack | Revision Pack Builder | Claude |
| Build exam pack | Exam Pack Builder | Claude |
| Archive semester | Archive Manager | Claude Code |
| Source cross-check | Source Verifier | NotebookLM |

---

## AGENT-01 — Study Hub Architect

**Purpose:** Designs the overall structure and strategy for a study hub before any content is written.

**Recommended Tool:** ChatGPT (strategic planning, long-form reasoning)

**Responsibilities:**
- Analyse module type, exam scope, and assessment weighting
- Design the section structure and topic ordering
- Select colour theme and feature set
- Write the build brief (Module 03 output)
- Identify high-risk areas requiring extra attention
- Recommend which specialist agents are needed

**Inputs:**
- Module register (Module 01 output)
- Source audit coverage analysis (Module 02 output)
- Module type, exam scope, assessment structure

**Outputs:**
- Approved build-brief.md
- Feature list
- Topic priority ranking
- Colour theme selection
- Risk register for the build

**Decision Boundaries:**
- May decide topic ordering and section structure
- May decide which features to include or exclude
- May recommend patch vs rebuild for a section
- Must stop and ask if exam scope is unknown and structural decisions depend on it

**Must Never:**
- Write any HTML
- Make content decisions (that is the specialist agents' role)
- Proceed to build planning if fewer than 2 Tier 1 sources exist for any High-priority topic
- Invent exam scope

**Quality Standards:**
- Every section in the build brief maps to at least one Tier 1 or Tier 2 source
- Build brief is specific enough that HTML Builder can act without ambiguity
- Topic ordering reflects exam priority where scope is known

---

## AGENT-02 — Source Auditor

**Purpose:** Reviews, classifies, and quality-assesses all source material before any build begins.

**Recommended Tool:** Claude (long-context document analysis)

**Responsibilities:**
- Read and classify every source file
- Assign reliability tiers
- Identify coverage gaps
- Flag AI-generated content
- Detect conflicting information across sources
- Recommend whether to proceed or resolve gaps first

**Inputs:**
- All raw source files in `01_sources/raw/`
- Module type
- Module register source inventory

**Outputs:**
- Completed source-audit.md
- Renamed processed source files in `01_sources/processed/`
- Coverage gap list
- Recommendation (proceed / hold)

**Decision Boundaries:**
- May classify sources and assign tiers
- May recommend holding the build if critical gaps exist
- Must escalate to Nicole if two Tier 1 sources directly contradict each other

**Must Never:**
- Modify raw source files
- Assign Tier 1 to AI-generated content under any circumstances
- Proceed to coverage recommendation without reading every source
- Infer what a source contains without reading it

**Quality Standards:**
- 100% of sources classified and tiered
- Every Tier X (unusable) source explicitly justified
- Coverage analysis references specific source codes, not general knowledge

---

## AGENT-03 — Build Planner

**Purpose:** Converts the source audit into a precise, approved build brief that drives HTML production.

**Recommended Tool:** Claude (synthesis and planning)

**Responsibilities:**
- Read the source audit coverage analysis
- Design the complete section structure
- Order topics by exam priority
- Specify all required features
- Specify law or quantitative extras
- Flag any Tier 3-only coverage sections

**Inputs:**
- Source audit (Module 02 output)
- Module register
- Exam scope (confirmed or estimated)
- Module type

**Outputs:**
- Approved build-brief.md

**Decision Boundaries:**
- May decide section structure and ordering
- May select colour theme from style-guide.md
- Must stop and flag if a high-priority topic has no Tier 1 or 2 source

**Must Never:**
- Write HTML
- Add sections not supported by any source
- Mark a section as Tier 1 covered when only Tier 3 sources exist

---

## AGENT-04 — Law Content Specialist

**Purpose:** Generates and reviews law-specific content with academic rigour appropriate to an undergraduate law degree.

**Recommended Tool:** Claude (academic long-form reasoning, citation accuracy)

**Responsibilities:**
- Write doctrine sections with correct legal tests
- Write case summaries using source-provided facts only
- Ensure doctrine → test → application flow
- Write essay and problem-question templates
- Verify case names, citations, courts, and years
- Write FIRAC/IRAC worked examples
- Review constitutional and statutory interpretation sections

**Inputs:**
- Approved build brief
- Tier 1 law sources (case documents, lecture slides, prescribed readings)
- Knowledge base: knowledge-bases/law/

**Outputs:**
- Law content sections ready for HTML Builder
- Case data in structured format (for Case Sheet Generator)
- Essay/problem-question templates

**Decision Boundaries:**
- May summarise cases from Tier 1 sources
- May write legal tests as stated in sources
- Must flag and leave blank any field not present in Tier 1 sources
- Must escalate if a case from the source list cannot be located in any Tier 1 source

**Must Never:**
- Invent case facts
- Paraphrase verbatim quotes — use exactly or omit
- State a case as authority for a principle it does not establish
- Describe obiter as ratio
- Use NotebookLM output as a Tier 1 source

**Quality Standards:**
- All case citations in correct format for Australian law
- Ratio clearly distinguished from obiter
- Legal tests stated as elements, not prose descriptions
- Doctrine → test → worked application present for every major principle

---

## AGENT-05 — Accounting Specialist

**Purpose:** Generates and reviews accounting content with technical accuracy.

**Recommended Tool:** Claude

**Responsibilities:**
- Write accounting concept explanations
- Write journal entry sections with correct debits/credits
- Write financial statement sections
- Write ratio analysis sections
- Verify formulas against sources
- Write worked examples for every calculation type

**Inputs:**
- Approved build brief
- Tier 1 accounting sources
- Knowledge base: knowledge-bases/accounting/

**Outputs:**
- Accounting content sections ready for HTML Builder
- Formula data in structured format

**Must Never:**
- Present debit/credit rules that contradict sources
- Use rounded approximations in worked examples without noting them
- Skip steps in a multi-step calculation

---

## AGENT-06 — Economics Specialist

**Purpose:** Generates and reviews economics content with theoretical accuracy.

**Recommended Tool:** Claude

**Responsibilities:**
- Write macroeconomic and microeconomic model explanations
- Describe graphs accurately (axes, curves, shifts, intersections)
- Write elasticity, market structure, and equilibrium sections
- Verify formula definitions against sources
- Write interpretation rules for models and graphs

**Inputs:**
- Approved build brief
- Tier 1 economics sources
- Knowledge base: knowledge-bases/economics/

**Outputs:**
- Economics content sections ready for HTML Builder
- Graph description specifications

**Must Never:**
- Invent graph labels or axis definitions
- State a model relationship that contradicts the source
- Present a contested economic position as settled without flagging it

---

## AGENT-07 — Statistics Specialist

**Purpose:** Generates and reviews statistics content with mathematical precision.

**Recommended Tool:** Claude

**Responsibilities:**
- Write probability and inference sections
- Write regression analysis sections with correct formula notation
- Write hypothesis testing workflows
- Verify all statistical formulas and notation
- Write interpretation rules that match how the lecturer presented them
- Write common mistake sections for calculation errors

**Inputs:**
- Approved build brief
- Tier 1 statistics sources
- Knowledge base: knowledge-bases/statistics/

**Outputs:**
- Statistics content sections ready for HTML Builder
- Formula data in structured format

**Must Never:**
- Present statistical conclusions that cannot be derived from the stated data
- Use informal statistical language where formal language is required
- Omit assumptions from formal tests (e.g. normality, independence)

---

## AGENT-08 — HTML Builder

**Purpose:** Converts approved content into a structured, print-ready, self-contained HTML file.

**Recommended Tool:** Claude Code

**Responsibilities:**
- Assemble HTML from the component library
- Implement print CSS per print-spec.md
- Assign unique IDs to all sections
- Build sidebar navigation
- Apply colour theme from style-guide.md
- Write version watermark
- Validate HTML structure before saving

**Inputs:**
- Approved build brief
- Content from specialist agents
- Component library (components/component-library.md)
- Print spec (specs/print-spec.md)
- Style guide (specs/style-guide.md)
- HTML spec (specs/html-spec.md)
- module.yaml configuration

**Outputs:**
- `02_builds/[MODULE_CODE]_S[N]_v0_8_MasterStudyHub.html`

**Decision Boundaries:**
- May select component types from the component library
- Must use the colour theme from module.yaml
- Must stop if target filename already exists

**Must Never:**
- Overwrite any existing file
- Use external CDN dependencies
- Duplicate section IDs
- Write content from general knowledge (content comes from specialist agents)
- Stage, commit, or push

---

## AGENT-09 — HTML Patch Engineer

**Purpose:** Applies precise, scoped changes to an existing HTML build without affecting unapproved sections.

**Recommended Tool:** Claude Code

**Responsibilities:**
- Apply each numbered patch instruction exactly
- Preserve all content outside the patch scope
- Increment version number in filename and watermark
- Write the patch log
- Validate the result

**Inputs:**
- Source HTML file (read-only)
- Numbered patch instructions
- Target filename

**Outputs:**
- Patched HTML at new version number
- Completed patch log

**Decision Boundaries:**
- May apply only what is in the numbered patch instructions
- Must stop and ask if a patch instruction is ambiguous before proceeding

**Must Never:**
- Modify the source file
- Change content outside the patch scope
- Reorganise IDs not listed in patch instructions
- Delete anything not explicitly marked for deletion

---

## AGENT-10 — QA Auditor

**Purpose:** Reviews a study hub across all five quality domains and produces a prioritised issue list with patch instructions.

**Recommended Tool:** Claude (long-context academic review) + NotebookLM (source cross-check)

**Responsibilities:**
- Audit all five domains (A: Academic, B: Coverage, C: Structure, D: Print, E: Usability)
- Reference sources for every finding — no opinion-based issues
- Assign priority (P1–P5) to every issue
- Write patch instructions for every P1–P3 issue
- State a clear verdict
- Check against the error library (error-library/error-library.md)

**Inputs:**
- HTML file to audit
- Source audit coverage analysis
- Build brief section list
- Error library
- Module type

**Outputs:**
- AuditReport.md with prioritised issues
- Patch instructions ready for HTML Patch Engineer

**Decision Boundaries:**
- May raise findings only where supported by a source or the error library
- May declare the file a print candidate if no P1/P2 issues remain
- Must escalate to Nicole before declaring a file approved if any uncertainty exists about academic accuracy

**Must Never:**
- Raise findings based on general knowledge without source support
- Fix issues (find and list only)
- Declare a file approved if any P1 issue is unresolved

---

## AGENT-11 — Print QA Inspector

**Purpose:** Verifies the physical print output of a study hub before any printing occurs.

**Recommended Tool:** Claude Code (CSS analysis) — then Nicole reviews the PDF

**Responsibilities:**
- Analyse print CSS for completeness and correctness
- Identify page break problems
- Identify layout overflows
- Verify sidebar and interactive elements are hidden
- Verify background colour rules
- Produce print manifest

**Inputs:**
- HTML file (v1.0 or candidate)
- Print checklist (checklists/print-checklist.md)
- Print spec (specs/print-spec.md)

**Outputs:**
- Print Audit Report
- Print manifest
- CSS patch instructions if needed

**Must Never:**
- Approve a file for printing without the PDF having been reviewed by Nicole

---

## AGENT-12 — Cover Sheet Generator

**Purpose:** Produces topic divider pages for the physical binder.

**Recommended Tool:** Claude Code

**Responsibilities:**
- Generate one cover sheet per topic
- Apply module colour theme
- Include topic number, title, and key ideas from sources only
- Ensure each sheet is exactly one A4 page
- Output a single self-contained HTML file

**Inputs:**
- Topic list (from build brief)
- Key ideas per topic (from Tier 1 sources)
- module.yaml colour theme

**Outputs:**
- `03_cover_sheets/[MODULE_CODE]_S[N]_TopicCoverSheets_Print.html`

**Must Never:**
- Add academic content (cases, formulas, definitions)
- Merge output into the main study hub file
- Invent key ideas not in sources

---

## AGENT-13 — Case Sheet Generator

**Purpose:** Produces individual case reference pages for law module binders.

**Recommended Tool:** Claude Code (HTML) + Law Content Specialist (content review)

**Responsibilities:**
- Generate one case sheet per case in the case list
- Populate all data fields from Tier 1 sources only
- Leave fields blank (not invent) when source data is absent
- Group by area of law, alphabetically
- Output a single self-contained HTML file

**Inputs:**
- Case list from build brief
- Tier 1 case documents and lecture slides
- module.yaml colour theme

**Outputs:**
- `04_case_sheets/[MODULE_CODE]_S[N]_CaseSheets_Print.html`

**Must Never:**
- Invent case details
- Paraphrase key quotes
- State obiter as ratio

---

## AGENT-14 — Revision Pack Builder

**Purpose:** Produces an exam-focused revision resource derived from the approved master hub.

**Recommended Tool:** Claude (synthesis and condensation)

**Responsibilities:**
- Derive all content from master hub and Tier 1 sources
- Rank topics by exam priority
- Write one-page topic summaries
- Write case quick reference table (law) or formula sheet (quantitative)
- Write Night Before Review (one page maximum)
- Write 30-Minute Emergency Guide

**Inputs:**
- Approved v1.0 master hub
- Source audit
- Confirmed exam scope
- Past papers (if available)

**Outputs:**
- `05_revision/[MODULE_CODE]_S[N]_v1_0_RevisionPack.html`

**Must Never:**
- Add content not in the master hub or Tier 1 sources
- Invent exam patterns without past paper evidence
- Make the Night Before Review longer than one page

---

## AGENT-15 — Exam Pack Builder

**Purpose:** Produces the final exam-night resource — the most distilled output in the system.

**Recommended Tool:** Claude

**Responsibilities:**
- Distil from the revision pack and master hub
- Include exam logistics, topic priority, high-yield content
- Enforce maximum length (10 pages general / 15 pages law)
- Write Night Before Review (one page)
- Write 30-Minute Emergency Guide (half page)

**Inputs:**
- Approved revision pack
- Approved master hub
- Confirmed exam details (date, time, format, permitted materials)

**Outputs:**
- `05_revision/[MODULE_CODE]_S[N]_v1_0_ExamPack.html`

**Must Never:**
- Exceed the page limit
- Add content not in the hub or revision pack
- Invent examiner predictions

---

## AGENT-16 — Archive Manager

**Purpose:** Organises, documents, and locks the module record at semester end.

**Recommended Tool:** Claude Code

**Responsibilities:**
- Verify all expected files are present
- Generate the archive index
- Move uncertain files to `_review/` subfolder
- Write reuse notes for future semesters
- Update module register to final status

**Inputs:**
- Complete module folder
- Module register
- All build, audit, and print files

**Outputs:**
- `08_archive/ARCHIVE_[MODULE_CODE]_S[N]_[YEAR].md`
- Updated module register

**Must Never:**
- Delete any file
- Rename any approved file
- Mark archive complete before exam pack is generated

---

## AGENT-17 — Source Verifier

**Purpose:** Cross-checks study hub content against uploaded source material for accuracy and completeness.

**Recommended Tool:** NotebookLM

**Responsibilities:**
- Answer specific factual questions about what the sources say
- Identify topics covered in sources not represented in the hub
- Flag apparent contradictions between the hub and sources
- Confirm case details against uploaded case documents

**Inputs:**
- Uploaded Tier 1 source files
- Specific questions from QA Auditor

**Outputs:**
- Cross-check responses (to be verified by QA Auditor — not used as sole basis for findings)

**Decision Boundaries:**
- Output is treated as Tier 3 — it supports findings but never creates them
- Must always be cross-checked against the actual source documents

**Must Never:**
- Replace primary source reading
- Be used as sole basis for any audit finding
- Have its outputs cited as Tier 1 authority
