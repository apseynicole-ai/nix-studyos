# Architecture Review — v0.9 → v1.0

**Date:** 2026-06-30  
**Scope:** Complete audit of the Nix Study Hub Production System v0.9 before v1.0 upgrade  
**Auditor:** Systems Architect

---

## 1. Architectural Strengths

### 1.1 Strong module separation
The 13-module pipeline enforces sequential workflow with clear inputs and outputs. This is the right architecture for a production system. Every module has a clear contract.

### 1.2 Safety-first design
The non-negotiable safety rules (no overwrite, no delete, no push without permission) are embedded in every module prompt. This is architecturally sound — constraints at the prompt level, not just policy level.

### 1.3 Module type branching
Law / Quantitative / Mixed type classification is threaded through every module. The system correctly branches behaviour at every decision point based on this single classification.

### 1.4 Version numbering convention
The v0.5 → v0.8 → v0.9 → v1.0 → v1.1+ ladder is well-designed. It encodes stage-of-completion semantics, not just change history.

### 1.5 Source reliability tiering
The Tier 1 / 2 / 3 / X system cleanly enforces the academic integrity principle. Binding it to content decisions in the build and QA modules is correct.

### 1.6 Forward compatibility with StudyOS
The data model hints in studyos-future-vision.md align well with the module outputs. The JSON record sketches are clean and consistent.

---

## 2. Architectural Weaknesses and Gaps

### 2.1 No AI Agent specification
**Severity: High**  
The system assigns tasks to "Claude", "Claude Code", "ChatGPT", "NotebookLM" informally across documents. There is no formal definition of what each AI agent is responsible for, what its decision boundaries are, or when to escalate. This creates inconsistency across builds.

### 2.2 No prompt router
**Severity: High**  
There is no single place that answers the question: "I want to do X — which prompt do I use?" The user must navigate 13 module files to find the right prompt. This creates friction and errors.

### 2.3 HTML is not componentised
**Severity: High**  
Each build recreates HTML components (definition boxes, case cards, formula blocks) from scratch. There is no reusable component library with standardised HTML + CSS. This causes visual inconsistency across modules and makes patching harder.

### 2.4 No configuration file
**Severity: High**  
Module configuration (type, colour theme, features, cases required, formulas required) is scattered across module-register.md and build-brief.md as prose. A structured module.yaml would allow the system to read configuration programmatically and auto-route to the correct behaviour.

### 2.5 No manifest tracking
**Severity: Medium**  
There is no standardised record of what was built, when, with which AI model, using which prompt, and what the result was. Audit trails exist as patch logs but build provenance is undocumented. This blocks reproducibility.

### 2.6 No error library
**Severity: Medium**  
QA checks describe what to check but not a permanent catalogue of known failure modes with causes, detection methods, and fixes. Every audit reinvents the same error descriptions.

### 2.7 No knowledge bases
**Severity: Medium**  
Law principles, accounting rules, statistics definitions, and economics concepts are assumed to be known. There is no structured knowledge base that supports content generation or QA validation. Each build relies on the AI's training data rather than a curated authoritative reference.

### 2.8 No formal quality gates
**Severity: Medium**  
The sequential module dependency is documented in prose but not enforced architecturally. There is no explicit gate system that prevents proceeding from one stage to the next without a signed-off output.

### 2.9 No data model
**Severity: Medium**  
The system is document-centric (HTML, markdown). There is no structured data layer. This limits future export targets (PDF, flashcards, Notion, mobile) and makes content reuse across modules impossible.

### 2.10 SOP coverage is incomplete
**Severity: Low**  
SOPs exist for 4 of the 10 planned workflows. SOPs for adding new lecture content (SOP-02), building a revision pack (SOP-05 equivalent), and running a QA audit are missing.

### 2.11 Prompts folder is empty
**Severity: Low**  
`prompts/` was created but contains nothing. Prompts are embedded in module files. A dedicated prompt library with standalone, copy-ready prompts would reduce friction.

### 2.12 Component definitions conflict with style guide
**Severity: Low**  
Module 04 HTML Production defines some block structures, specs/html-spec.md defines others, and specs/style-guide.md defines yet more. These three documents are not fully consistent. A single component library would replace all three partial definitions.

---

## 3. Duplicated Concepts

| Concept | Current Locations | Resolution |
|---------|------------------|------------|
| Block/component HTML | modules/04, specs/html-spec.md, specs/style-guide.md | Consolidate into components/ |
| Safety rules | Every module prompt + system-config.md | Keep in system-config.md as canonical; prompts reference it |
| Colour themes | system-config.md + style-guide.md | Keep in style-guide.md as canonical; module.yaml references it |
| Source classification | modules/02 + system-config.md | Keep in modules/02; module.yaml references the codes |
| Print settings | specs/print-spec.md + modules/07 + sop-07 | Keep in print-spec.md; others reference it |

---

## 4. Missing Abstractions

| Missing | Needed For |
|---------|-----------|
| AI Agent roles | Consistent AI tool selection across all builds |
| module.yaml | Programmatic configuration; future StudyOS integration |
| Quality Gate framework | Enforced sequential workflow |
| Component library | Consistent, reusable HTML across all builds |
| Prompt router | Zero-friction workflow navigation |
| Data model | Multi-format output; StudyOS integration |
| Error library | Systematic QA; pattern recognition across audits |
| Knowledge bases | Discipline-specific content validation |

---

## 5. Future Bottlenecks

### 5.1 Monolithic module files
As the system grows, 13 module files each containing a full specification + prompt will become difficult to maintain. The v1.0 upgrade should separate the prompt from the specification.

### 5.2 Manual AI tool selection
Currently the user must decide which AI tool to use. As more tools become available, this decision becomes harder. The Prompt Router solves this for v1.0.

### 5.3 HTML rebuild vs patch decision
The "60% changed → rebuild" heuristic in Module 05 is arbitrary. The v1.0 Error Library and component system will make this decision more principled.

### 5.4 Case and formula data as prose
Cases and formulas are described in prose inside HTML. When StudyOS arrives, extracting them for structured use will require manual parsing. The v1.0 data model addresses this.

---

## 6. v1.0 Upgrade Plan

| Phase | Deliverable | Priority |
|-------|------------|---------|
| 1 | Architecture Review (this document) | Complete |
| 2 | AI Agent Layer | High |
| 3 | Prompt Router | High |
| 4 | Component Library | High |
| 5 | module.yaml Configuration | High |
| 6 | Manifests (Source, Build, Archive) | Medium |
| 7 | Error Library | Medium |
| 8 | Knowledge Bases | Medium |
| 9 | Quality Gate Framework | Medium |
| 10 | Data Model | Medium |
| 11 | Complete SOPs | Low |
| 12 | Populate prompts/ | Low |
| 13 | Migration Guide | Required |
| 14 | Self-Audit | Required |

---

## 7. Version Designation

This document constitutes the gate check for v0.9 → v1.0 upgrade.

The system **may be designated v1.0** when all Phase 2–10 deliverables are complete and the self-audit finds no critical (P1) gaps.
