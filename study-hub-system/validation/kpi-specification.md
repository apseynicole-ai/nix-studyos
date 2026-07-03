# KPI Specification — SHOS v1.0

**Purpose:** Define measurable success indicators for SHOS production runs. Provides objective criteria for evaluating each module production cycle and the system's health over a semester.

---

## KPI Categories

| Category | Code | Description |
|----------|------|-------------|
| Quality | Q | Accuracy and completeness of produced outputs |
| Velocity | V | Time from intake to completion |
| Safety | S | Prevention of destructive or irreversible errors |
| Process | P | Adherence to SHOS workflow |
| Coverage | C | Academic content completeness |

---

## KPI Definitions

---

### Q-01 — P1/P2 Error Rate Per Module

**Category:** Quality  
**Definition:** Number of P1 or P2 errors found in the final Gate 5 audit report before the first PRINT CANDIDATE verdict.  
**Target:** 0 P1 errors, ≤ 1 P2 error at first PRINT CANDIDATE  
**Measurement:** Count P1/P2 findings in `06_audit/AuditReport.md` (first audit that reaches PRINT CANDIDATE verdict)  
**Collection point:** Gate 5  
**Threshold:** System is underperforming if any module produces > 2 P1 errors in its first audit  

**Interpretation:** High P1 count indicates either (a) source audit missed coverage gaps, (b) build brief was inadequate, or (c) HTML Builder did not apply module type rules correctly.

---

### Q-02 — Audit Iteration Count

**Category:** Quality  
**Definition:** Number of QA audit passes required before a module reaches PRINT CANDIDATE.  
**Target:** ≤ 2 audit iterations per module  
**Measurement:** Count of AuditReport.md files in `06_audit/` for a single module version  
**Collection point:** Gate 5 completion  

**Interpretation:** 3+ audit iterations indicates either (a) P1 issues are systematically recurring, or (b) the patch instructions are not clear enough for the HTML Patcher to fix issues correctly on the first attempt.

---

### Q-03 — Case Sheet Completeness Rate (Law Modules)

**Category:** Quality  
**Definition:** Percentage of cases listed in `module.yaml law.cases_required` that have a corresponding case sheet file.  
**Target:** 100%  
**Measurement:** Count case sheet files in `09_case_sheets/` / count `law.cases_required` entries × 100  
**Collection point:** Gate 6 (Print Audit)  

**Interpretation:** Any result below 100% is a system failure (see ST-10). This KPI is currently unenforceable without automation item A9.

---

### Q-04 — Revision Pack Derivation Accuracy

**Category:** Quality  
**Definition:** Percentage of high-priority content items from the master hub present in the revision pack.  
**Target:** 100% of P1 content (formulas, case ratios, statutory elements)  
**Measurement:** Manual spot-check: 5 randomly selected high-priority items from master hub, verify presence in revision pack  
**Collection point:** Gate 7  

**Interpretation:** Any missing P1 content in the revision pack is a direct exam preparation risk.

---

### V-01 — Time from Intake to v1.0 Designation

**Category:** Velocity  
**Definition:** Calendar time from Gate 1 completion to Gate 6 completion (v1.0 file designated).  
**Target:** ≤ 3 weeks for a standard module (10–12 topics, law or quantitative)  
**Measurement:** Date of `module.yaml` creation vs. date of v1.0 file timestamp  
**Baseline:** Not yet established (first production cycle will set baseline)  

**Interpretation:** Times significantly over 3 weeks indicate either (a) too many audit iterations, (b) blocked at approval gates, or (c) source access difficulties (G2-01).

---

### V-02 — Time Per Gate (Active Work)

**Category:** Velocity  
**Definition:** Active AI agent session time to complete each gate.  
**Targets:**

| Gate | Target active time |
|------|-------------------|
| Gate 1 (Intake) | 15–20 minutes |
| Gate 2 (Source Audit) | 30–45 minutes |
| Gate 3 (Build Planning) | 20–30 minutes |
| Gate 4 (HTML Production) | 45–90 minutes |
| Gate 5 (QA Audit) | 30–60 minutes |
| Gate 6 (Print Audit) | 15–20 minutes |
| Gate 7 (Revision Pack) | 30–45 minutes |
| Gate 8 (Exam Pack) | 20–30 minutes |

**Measurement:** Session start and end timestamps (manual logging in module.yaml or build manifest)  

**Interpretation:** Gate 4 taking > 90 minutes suggests the build brief was underspecified. Gate 5 taking > 60 minutes suggests context window problems (G5-01 symptom).

---

### V-03 — Rework Percentage

**Category:** Velocity  
**Definition:** Percentage of total production time spent on patches and re-audits vs. first-pass work.  
**Target:** ≤ 20% of total time in rework  
**Measurement:** Sum of time in Module 05 sessions + re-audit sessions / total production time  

**Interpretation:** Rework > 30% indicates upstream quality problems — likely in the source audit (Gate 2) or build planning (Gate 3).

---

### S-01 — Approved Version Overwrite Events

**Category:** Safety  
**Definition:** Number of times an approved file (v1.0 or higher) is overwritten without explicit authorisation.  
**Target:** 0 per semester  
**Measurement:** Any file with `v1_0` or higher in the filename that has been modified (checked via git diff or file modification timestamp)  
**Collection point:** Continuous (checked at each gate)  

**Interpretation:** Any non-zero result is a system safety failure. See ERR-025 in the error library.

---

### S-02 — Unauthorised File Operations

**Category:** Safety  
**Definition:** Number of agent-initiated file deletions, renames, or moves without explicit Nicole instruction.  
**Target:** 0 per semester  
**Measurement:** Audit trail from agent session logs  

**Interpretation:** The SHOS safety rules prohibit all of these without explicit instruction. Any occurrence is a rule violation requiring investigation.

---

### S-03 — Tier 3 Content in Final Outputs

**Category:** Safety  
**Definition:** Number of instances where Tier 3 content (AI-generated, unverified) is presented as primary in a final study hub without attribution.  
**Target:** 0  
**Measurement:** QA audit Domain A check: all claims traced to Tier 1 or Tier 2 sources  

---

### P-01 — Gate Bypass Rate

**Category:** Process  
**Definition:** Percentage of quality gates bypassed per module (excluding legitimate P3 bypasses with documentation).  
**Target:** ≤ 10% of gates bypassed per module  
**Measurement:** Count of `bypass_reason` entries in module.yaml / total gates  

**Interpretation:** High bypass rate under exam pressure is expected but should not exceed 10% (1 gate in 10). If Gate 5 is bypassed, it must be documented with explicit Nicole approval.

---

### P-02 — module.yaml Completion Rate

**Category:** Process  
**Definition:** Percentage of module.yaml required fields completed by the end of Gate 1.  
**Target:** ≥ 90% of required fields populated (some fields legitimately blank at intake)  
**Measurement:** Field count in module.yaml vs. required fields per schema  

**Interpretation:** Low completion rate predicts downstream configuration problems (G4-01 symptom).

---

### P-03 — SOP Adherence

**Category:** Process  
**Definition:** Percentage of production gates where the corresponding SOP was consulted (vs. jumping directly to a module prompt).  
**Target:** 100% for Gates 1–3 (intake + early planning). Flexible for Gates 4–10 once Nicole is familiar with the workflow.  
**Measurement:** Self-reported in session notes or build manifest  

**Interpretation:** This KPI is most relevant in the first 2–3 production cycles. After that, direct module access is efficient and expected.

---

### C-01 — Topic Coverage Rate

**Category:** Coverage  
**Definition:** Percentage of topics in the module register that have a corresponding section in the master hub.  
**Target:** 100%  
**Measurement:** Count hub sections / count topics in module-register.md × 100  
**Collection point:** Gate 5 (QA Audit, Domain D)  

---

### C-02 — Source Coverage Rate

**Category:** Coverage  
**Definition:** Percentage of Tier 1 sources that have at least one corresponding content section in the hub.  
**Target:** ≥ 90% (some Tier 1 sources may be superseded by newer sources)  
**Measurement:** Source-audit.md coverage analysis cross-referenced with hub section list  
**Collection point:** Gate 5  

---

### C-03 — Law Case Coverage Rate (Law Modules)

**Category:** Coverage  
**Definition:** Percentage of prescribed cases (per module.yaml `law.cases_required`) with full FIRAC analysis in the hub.  
**Target:** 100%  
**Measurement:** Count case sections with FIRAC structure / count `law.cases_required` entries  
**Collection point:** Gate 5 (QA Audit, Domain A for law modules)  

---

## KPI Dashboard Template

To be populated in `module.yaml` at end-of-semester review:

```yaml
kpis:
  Q01_p1_p2_errors_first_audit: null
  Q02_audit_iteration_count: null
  Q03_case_sheet_completeness: null      # law modules only
  Q04_revision_pack_accuracy: null
  V01_intake_to_v10_days: null
  V03_rework_percentage: null
  S01_approved_overwrite_events: 0
  S02_unauthorised_file_ops: 0
  S03_tier3_in_outputs: 0
  P01_gate_bypass_rate: null
  P02_module_yaml_completion: null
  C01_topic_coverage_rate: null
  C02_source_coverage_rate: null
  C03_law_case_coverage_rate: null       # law modules only
```

---

## Semester-Level Reporting

At the end of each semester, aggregate KPIs across all modules produced:

| KPI | Module 1 | Module 2 | Module 3 | Semester avg |
|-----|---------|---------|---------|-------------|
| Q-01 P1/P2 errors | — | — | — | — |
| Q-02 Audit iterations | — | — | — | — |
| V-01 Days to v1.0 | — | — | — | — |
| S-01 Overwrites | — | — | — | — |
| C-01 Topic coverage | — | — | — | — |

Trends across semesters indicate whether SHOS is maturing (lower error rates, faster velocity) or degrading (increasing rework, bypass overuse).
