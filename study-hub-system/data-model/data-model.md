# StudyOS Data Model

**Version:** 1.0  
**Purpose:** Structured data layer that sits beneath the HTML output layer. When StudyOS is built, this model becomes the database schema. Today it governs how content is structured in the production process, enabling future multi-format export.

**Principle:** HTML is one output format. It is not the data. The data must be extractable for flashcards, PDFs, Notion, mobile apps, and any future format without requiring a rebuild.

---

## Hierarchy

```
Module
└── Topic
    └── Subtopic
        └── Content Nodes (any of the following):
            ├── LearningOutcome
            ├── Definition
            ├── Principle (Law) / Concept (Quant)
            ├── LegalTest (Law only)
            ├── Formula (Quant only)
            ├── Case (Law only)
            ├── WorkedExample (Quant only)
            ├── Graph
            ├── PracticeQuestion
            ├── ExamTip
            ├── MemoryTrigger
            └── RevisionCard
```

---

## Core Entities

---

### Module

```yaml
id: "mod-fol178-s1-2026"
code: "FOL178"
name: "Foundations of Law"
semester: 1
year: 2026
type: "law"                # law | quantitative | mixed
university: ""
status: "active"           # active | archived | rollover
config_path: "00_intake/module.yaml"
gate_status:
  gate_1: "complete"
  gate_2: "complete"
  gate_3: "pending"
  # ...
created_at: "2026-02-01"
archived_at: null
successor_id: null         # ID of next semester's module
```

---

### Topic

```yaml
id: "topic-fol178-001"
module_id: "mod-fol178-s1-2026"
number: 1
name: "Introduction to Law"
slug: "introduction-to-law"
exam_priority: "medium"    # high | medium | low
binder_order: 1
sources:
  - "src-fol178-001"       # SRC IDs from source manifest
  - "src-fol178-002"
subtopics:
  - id: "sub-fol178-001-01"
    name: "Sources of Law"
    order: 1
```

---

### Definition

```yaml
id: "def-fol178-001"
module_id: "mod-fol178-s1-2026"
topic_id: "topic-fol178-001"
subtopic_id: "sub-fol178-001-01"
term: "Common law"
definition: "Law developed by courts through judicial decisions, as distinguished from legislation enacted by Parliament."
source_id: "src-fol178-001"
source_location: "Slide 4"
component: "C-01"          # Maps to component library
verified: true
notes: ""
```

---

### Principle (Law) / Concept (Quant)

```yaml
id: "prin-fol178-001"
module_id: "mod-fol178-s1-2026"
topic_id: "topic-fol178-002"
type: "principle"          # principle | concept
name: "Doctrine of Consideration"
statement: "A contract is only enforceable if supported by consideration — something of value exchanged between the parties."
authority: "Currie v Misa (1875) LR 10 Ex 153"
source_id: "src-fol178-003"
component: "C-08"
exam_relevance: "high"
```

---

### LegalTest (Law only)

```yaml
id: "test-fol178-001"
module_id: "mod-fol178-s1-2026"
topic_id: "topic-fol178-002"
name: "Elements of a Valid Offer"
authority: "Harvey v Facey [1893] AC 552"
elements:
  - number: 1
    text: "A definite proposal"
  - number: 2
    text: "Communicated to the offeree"
  - number: 3
    text: "With the intention to be bound"
source_id: "src-fol178-003"
memory_trigger: "DCB — Definite, Communicated, Bound"
component: "C-07"
```

---

### Formula (Quantitative only)

```yaml
id: "formula-sds188-001"
module_id: "mod-sds188-s1-2026"
topic_id: "topic-sds188-004"
name: "Simple Linear Regression"
symbol: "Ŷ = β₀ + β₁X"
latex: "\\hat{Y} = \\beta_0 + \\beta_1 X"
variables:
  - symbol: "Ŷ"
    definition: "Predicted (fitted) value of Y"
  - symbol: "β₀"
    definition: "Y-intercept — predicted Y when X = 0"
  - symbol: "β₁"
    definition: "Slope — change in Y for one-unit increase in X"
  - symbol: "X"
    definition: "The predictor (independent) variable"
use_when: "Predicting a continuous outcome from one continuous predictor"
assumptions:
  - "Linearity"
  - "Independence of errors"
  - "Normality of residuals"
  - "Equal variance (homoscedasticity)"
source_id: "src-sds188-007"
component: "C-02"
exam_relevance: "high"
```

---

### Case (Law only)

```yaml
id: "case-fol178-001"
module_id: "mod-fol178-s1-2026"
topic_id: "topic-fol178-002"
name: "Carlill v Carbolic Smoke Ball Co"
citation: "[1893] 1 QB 256"
court: "Court of Appeal"
year: 1893
area_of_law: "contract-offer"
facts: "The Carbolic Smoke Ball Company advertised that it would pay £100 to anyone who used their smoke ball as directed and contracted influenza. Mrs Carlill used the ball and contracted influenza. The company refused to pay."
issue: "Whether the advertisement constituted a valid offer capable of acceptance by performance."
judgment: "Court of Appeal held in favour of Mrs Carlill. The advertisement was a unilateral offer to the world."
ratio: "A sufficiently specific advertisement directed to the public can constitute a unilateral offer, which is accepted by performance of the specified act."
key_principle: "A unilateral offer is accepted by performance, not by communication of acceptance."
obiter: null
exam_use: "Use to argue that an advertisement is an offer (not merely an invitation to treat) when it is specific, certain, and leaves nothing open for negotiation."
memory_trigger: "Smoke Ball = Smoking gun for unilateral offers"
related_cases:
  - "Partridge v Crittenden [1968] 1 WLR 1204"  # distinguishes — ad as invitation to treat
key_quote: "It was intended to be acted upon, and it was so acted upon." 
key_quote_author: "Bowen LJ"
source_id: "src-fol178-004"
verified: true
component: "C-06"
```

---

### WorkedExample (Quantitative only)

```yaml
id: "example-sds188-001"
module_id: "mod-sds188-s1-2026"
topic_id: "topic-sds188-004"
formula_id: "formula-sds188-001"
title: "Predicting Sales from Advertising Spend"
given:
  - "Advertising spend (X): $5,000"
  - "Estimated regression: Ŷ = 2,000 + 3.5X"
find: "Predicted sales (Ŷ)"
steps:
  - number: 1
    action: "Substitute X = 5,000 into the equation"
    calculation: "Ŷ = 2,000 + 3.5(5,000)"
  - number: 2
    action: "Calculate"
    calculation: "Ŷ = 2,000 + 17,500 = 19,500"
answer: "Predicted sales = $19,500"
interpretation: "For an advertising spend of $5,000, we predict sales of $19,500."
source_id: "src-sds188-007"
component: "C-03"
```

---

### PracticeQuestion

```yaml
id: "pq-fol178-001"
module_id: "mod-fol178-s1-2026"
topic_id: "topic-fol178-002"
type: "problem-question"   # short-answer | essay | problem-question | calculation | mcq
difficulty: "medium"       # easy | medium | hard
stem: "Adam advertises his car for sale on an online marketplace for $15,000. Belinda emails Adam to say she will buy the car for $14,500. Adam replies that he will accept $14,800. Belinda responds that she accepts. Has a contract been formed? Advise Adam."
suggested_answer: "This scenario involves offer and counter-offer. Adam's original advertisement is likely an invitation to treat (Fisher v Bell). Belinda's offer to pay $14,500 is the first offer. Adam's reply ($14,800) is a counter-offer that destroys Belinda's offer (Hyde v Wrench). Belinda's acceptance of the counter-offer forms the contract at $14,800. Therefore, a contract has been formed at $14,800."
marks: 8
source_id: "src-fol178-006"  # Tutorial 2
component: "C-11"
exam_style: true
```

---

### RevisionCard

```yaml
id: "rc-fol178-001"
module_id: "mod-fol178-s1-2026"
topic_id: "topic-fol178-002"
front: "What is the ratio of Carlill v Carbolic Smoke Ball Co [1893]?"
back: "A sufficiently specific advertisement directed to the public can constitute a unilateral offer, accepted by performance of the specified act."
card_type: "case-ratio"    # definition | case-ratio | formula | principle | procedure
difficulty: "medium"
tags: ["contract", "offer", "unilateral-offer"]
source_id: "src-fol178-004"
```

---

## Export Targets

The data model supports the following export formats. Each requires an adapter:

| Format | Adapter Status | Priority |
|--------|---------------|---------|
| HTML study hub | ✓ Current output | Complete |
| PDF (headless) | Planned — automation item B2 | Tier 2 |
| Anki flashcards (RevisionCards) | Planned | Tier 2 |
| Notion database | Planned | Tier 3 |
| Markdown | Planned | Tier 2 |
| StudyOS app | Planned | Tier 3 |
| DOCX | Planned | Tier 3 |
| Mobile app (future) | Not yet planned | Tier 4 |

---

## Data Storage Strategy

### Current (v1.0)
- Data lives in the HTML and markdown files
- module.yaml holds configuration
- Manifests hold provenance records
- No central database

### Phase 2 (Automation)
- YAML/JSON files per module for each entity type
- Scripts read these files to generate HTML via templates
- Enables multi-format output from same source

### Phase 3 (StudyOS)
- Relational or document database (PostgreSQL or Firestore)
- REST API as documented in studyos-future-vision.md
- Web UI for content management
- AI API integration for automated content generation

---

## Backward Compatibility

The v1.0 data model is designed to be populated from existing HTML files. When StudyOS development begins, the extraction process reads the existing HTML and populates the data model — existing hub content does not need to be manually re-entered.

Key extraction mappings:
- `#def-*` elements → Definition entities
- `#formula-*` elements → Formula entities
- `#case-*` elements → Case entities
- `#test-*` elements → LegalTest entities
- `.topic-section` elements → Topic entities
