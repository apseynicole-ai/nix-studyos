# Prompt Router

**Version:** 1.0  
**Purpose:** Zero-friction workflow navigation. For any task, find the right prompt, the right tool, and the right next step in under 30 seconds.

**How to use:** Find your current task in the left column. Follow the row.

---

## Master Routing Table

| I want to… | Trigger condition | Agent | Tool | Prompt location | Expected output | Next step |
|------------|------------------|-------|------|----------------|----------------|-----------|
| Start a new module | New module added to load | Study Hub Architect + Source Auditor | Claude | modules/01 + modules/02 | module-register.md + source-audit.md | → Build Planning |
| Register sources only | Sources arrived, register not updated | Source Auditor | Claude | modules/02 prompt | Updated source-audit.md | → Check coverage gaps |
| Audit sources | Sources registered, need classification | Source Auditor | Claude | modules/02 prompt | source-audit.md | → Build Planning |
| Create build plan | Source audit complete | Build Planner | Claude | modules/03 prompt | build-brief.md | → HTML Production |
| Build first HTML | Build brief approved | HTML Builder | Claude Code | modules/04 prompt | v0_8 HTML | → QA Audit |
| Patch existing HTML | QA or Print audit found issues | HTML Patch Engineer | Claude Code | modules/05 prompt | New version HTML + patch log | → Re-run QA |
| Run QA audit | After any build or patch | QA Auditor | Claude | modules/06 prompt | AuditReport.md + patch instructions | → Patch (if issues) or Print Audit |
| Run print audit | QA passed, ready to print | Print QA Inspector | Claude Code + Nicole | modules/07 prompt | Print Audit Report + print manifest | → Print |
| Generate cover sheets | Module has approved v1.0 | Cover Sheet Generator | Claude Code | modules/08 prompt | TopicCoverSheets_Print.html | → Print cover sheets |
| Generate case sheets | Law module, v1.0 approved | Case Sheet Generator | Claude Code | modules/09 prompt | CaseSheets_Print.html | → Print case sheets |
| Build revision pack | Master hub at v1.0, exams approaching | Revision Pack Builder | Claude | modules/10 prompt | RevisionPack.html | → Build Exam Pack |
| Build exam pack | Revision pack complete, exam confirmed | Exam Pack Builder | Claude | modules/11 prompt | ExamPack.html | → Print exam pack |
| Archive semester | Exam complete | Archive Manager | Claude Code | modules/12 prompt | ARCHIVE_*.md | → Done |
| Roll over module | New semester, previous hub exists | Build Planner + HTML Patch Engineer | Claude | modules/13 prompt | Change analysis + updated hub | → QA Audit |
| Add new lecture content | New slides received mid-semester | Source Auditor → QA Auditor → HTML Patch Engineer | Claude → Claude Code | modules/02 → 05 → 06 | Updated hub + patch log | → Re-run QA |
| Cross-check content vs sources | QA auditor needs verification | Source Verifier | NotebookLM | agents/agent-registry.md AGENT-17 | Cross-check responses | → QA Auditor reviews |
| Fix a duplicate ID | Audit found duplicate IDs | HTML Patch Engineer | Claude Code | error-library/error-library.md ERR-001 | Patched HTML with unique IDs | → Re-validate |
| Fix broken navigation | Sidebar links not resolving | HTML Patch Engineer | Claude Code | error-library/error-library.md ERR-002 | Patched HTML | → Re-validate |
| Fix print CSS | Print audit found layout issues | HTML Patch Engineer | Claude Code | specs/print-spec.md | Patched HTML | → Re-run print audit |
| Create module config | Starting a new module | Nicole / Study Hub Architect | — | config/module-template.yaml | module.yaml in 00_intake/ | → Module Intake |

---

## Workflow Decision Trees

### Decision Tree 1 — Starting a Build

```
Do I have a completed source audit? 
├── No → Run modules/02 (Source Auditor / Claude)
└── Yes → Do I have an approved build brief?
           ├── No → Run modules/03 (Build Planner / Claude)
           └── Yes → Does 02_builds/ already have a v0.8 or later file?
                      ├── No → Run modules/04 (HTML Builder / Claude Code)
                      └── Yes → Go to Patching Decision Tree
```

### Decision Tree 2 — Patching vs Rebuilding

```
How much of the hub needs to change?
├── < 40% → Patch: modules/05 (HTML Patch Engineer / Claude Code)
├── 40–60% → Partial rebuild: modules/04 for changed topics only
└── > 60% → Full rebuild: modules/04 with updated build brief
```

### Decision Tree 3 — QA Verdict

```
Run modules/06 QA Audit
├── P1 or P2 issues found → Patch (modules/05) → Re-audit
├── P3/P4 issues only → Patch if time allows, then Print Audit
└── No issues → Print Audit (modules/07)
                 ├── Print CSS issues found → Patch → Re-run print audit
                 └── Print audit passed → Rename to v1.0 → Print
```

### Decision Tree 4 — Exam Preparation

```
How close is the exam?
├── > 4 weeks → Focus on master hub completeness
├── 2–4 weeks → Generate Revision Pack (modules/10)
├── < 2 weeks → Generate Exam Pack (modules/11)
└── Night before → Print Exam Pack; review Night Before Review section
```

### Decision Tree 5 — New Semester

```
Does a previous hub exist for this module?
├── No → Start from scratch: modules/01 → 02 → 03 → 04
└── Yes → Run modules/13 Rollover Change Analysis
           ├── < 40% changed → Patch rollover copy (modules/05)
           ├── 40–60% changed → Partial rebuild (modules/04 for changed topics)
           └── > 60% changed → Full rebuild (modules/04 with new brief)
```

---

## Quick Reference — Which AI Tool?

| Task Type | Best Tool | Why |
|-----------|-----------|-----|
| Planning and strategy | ChatGPT | Strongest at high-level architecture and structured planning |
| Long-context document review | Claude | Best at reading many large source files at once |
| Academic content generation | Claude | Strongest at accurate, structured academic writing |
| HTML writing and patching | Claude Code | Direct file access; no copy-paste needed |
| Source cross-check QA | NotebookLM | Grounded in uploaded source files |
| Complex reasoning tasks | Claude | Best multi-step academic reasoning |
| Automation scripts | Claude Code | Direct execution environment |

---

## Prompt Location Index

All prompts are embedded in the module files. This index allows direct navigation.

| Prompt | File | Section |
|--------|------|---------|
| Module Intake | modules/01-module-intake.md | "Reusable Prompt — Module Intake" |
| Source Audit | modules/02-source-audit.md | "Reusable Prompt — Source Audit" |
| Build Planning | modules/03-build-planning.md | "Reusable Prompt — Build Planning" |
| HTML Production | modules/04-html-production.md | "Reusable Prompt — HTML Production" |
| HTML Patching | modules/05-html-patching.md | "Reusable Prompt — HTML Patching" |
| QA Audit | modules/06-qa-audit.md | "Reusable Prompt — QA Audit" |
| Print Audit | modules/07-print-audit.md | "Reusable Prompt — Print Audit" |
| Cover Sheets | modules/08-cover-sheet-generator.md | "Reusable Prompt — Cover Sheet Generator" |
| Case Sheets | modules/09-case-sheet-generator.md | "Reusable Prompt — Case Sheet Generator" |
| Revision Pack | modules/10-revision-pack-generator.md | "Reusable Prompt — Revision Pack Generator" |
| Exam Pack | modules/11-exam-pack-generator.md | "Reusable Prompt — Exam Pack Generator" |
| Archive | modules/12-semester-archive.md | "Reusable Prompt — Semester Archive" |
| Rollover | modules/13-module-rollover.md | "Reusable Prompt — Rollover Change Analysis" |

---

## Standalone Prompt Starters

For quick use — copy the opening of any session:

### Opening any session with context
```
You are working within the Nix Study Hub Operating System v1.0.

System rules are in: study-hub-system/config/system-config.md
Safety rules: Never overwrite, delete, rename, move, or push without explicit instruction.
Module config: study-hub-system/00_intake/module.yaml (if available)

Current task: [describe task]
Module: [MODULE_CODE] — [Full Name], [Semester]
```

### Handing off between agents
```
Previous agent: [Agent name]
Previous output: [file produced or summary]
Your task: [next task]
Constraints: Follow all rules in system-config.md. Use component library in components/component-library.md.
```
