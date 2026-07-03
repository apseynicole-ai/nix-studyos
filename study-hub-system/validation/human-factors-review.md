# Human Factors Review — SHOS v1.0

**Purpose:** Evaluate SHOS v1.0 from the perspective of the person who will use it: Nicole, a university student under time pressure, often working alone, sometimes weeks apart between sessions.  
**Method:** Cognitive walkthrough of each major entry point. Assessment of cognitive load, error prevention, and recovery.

---

## User Profile

**Name:** Nicole  
**Context:** University student, not a software engineer  
**Working pattern:** Irregular sessions — might use the system once and not return for 3 weeks  
**Pressure conditions:** Highest usage occurs in the 2–4 weeks before exams  
**AI experience:** Comfortable with ChatGPT, Claude, Claude Code, NotebookLM  
**File system habits:** Owns a Mac, stores files locally but inconsistently; LMS is the canonical source  
**Non-negotiables (self-stated):** Never overwrite approved work. Never invent content. Speed is secondary to accuracy.

---

## HF-01 — Returning to a Module After a Long Break

**Scenario:** Nicole last worked on FOL178 five weeks ago. She needs to add new lecture content. She opens her module folder and sees 11 files. She cannot remember what gate she's at.

**SHOS provision:**  
`module.yaml` has a `build_status` section with a field for each gate. If maintained, this tells her exactly where she is. The prompt router has a "where do I start?" decision tree.

**Usability assessment:**  
The provision exists but requires that `build_status` was updated at the end of the last session. If Nicole closed her session without updating module.yaml, the status dashboard is stale. There is no mechanism to recover the current state except manually inspecting file timestamps.

**Cognitive load:** High for the first return after a break. She must:
1. Remember to check module.yaml
2. Trust that module.yaml is current
3. Navigate to the prompt router if unsure

**Risk:** Nicole opens the wrong file and starts patching a draft version. (Addressed by ST-07, but human factors amplify the risk after long breaks.)

**Recommendation:**  
Add a "Session Resume Procedure" to SOP-01 or as a standalone SOP. Content:
1. Open module.yaml — check `build_status`
2. If `build_status` is unclear, check folder timestamps
3. Identify the most recent approved file by version number
4. Open prompt-router.md and confirm your entry point

**Severity:** Medium. This will happen repeatedly throughout a semester.

---

## HF-02 — Choosing the Right AI Agent

**Scenario:** Nicole needs to run the QA Audit. She opens `agents/agent-registry.md` and sees 17 agents. She looks for the right one.

**SHOS provision:**  
Agent Quick Reference table at the top of agent-registry.md. The table has: Agent Name, Tool, Primary Function, When to use.

**Usability assessment:**  
The table is functional but assumes Nicole knows which task she is doing. For the QA Audit, she must:
1. Know the task is "QA Audit" (not "HTML review" or "content check")
2. Find that task in the quick reference
3. Read that QA Auditor (AGENT-10) uses Claude, with optional NotebookLM for source verification

This is manageable if she always enters through the prompt router, which explicitly names the correct agent. If she enters through a module directly, she must find the agent herself.

**Risk:** Nicole uses ChatGPT (AGENT-01/02) for a task that needs Claude's long-context capability, resulting in a session that hits token limits unexpectedly.

**Recommendation:**  
Every module file should have a one-line agent declaration at the top:
```
**Agent:** QA Auditor — Claude (AGENT-10)
**Do not use:** ChatGPT (no long-context support for HTML files)
```
This is already present in some modules but inconsistently applied.

**Severity:** Low. The router addresses this; individual module headers would reinforce it.

---

## HF-03 — Understanding the Two-Document Problem

**Scenario:** Nicole is starting Module 01 (intake). She sees that she needs to produce both `module-register.md` and `module.yaml`. She cannot tell from the module file which to create first.

**SHOS provision:**  
Gap G1-01 in the production validation report identified this exactly. No document currently specifies creation order or relationship.

**Usability assessment:**  
A first-time user will likely:
- Create `module-register.md` first (it is mentioned first in Module 01)
- Then create `module.yaml` from the template and fill in the same information again
- Wonder if this is duplication

The documents are not duplicates — `module-register.md` is human-readable context, `module.yaml` is machine-readable configuration — but this is not explained anywhere at the point of use.

**Risk:** Nicole skips one of the two documents, causing either a configuration gap (if module.yaml is skipped) or a readability gap (if module-register.md is skipped).

**Recommendation:**  
Add to Module 01, after the two-document mention:
> *Create these in order: (1) `module-register.md` first — this is your working document and thinking space. (2) `module.yaml` second — this is the machine-readable configuration, populated directly from what you confirmed in module-register.md. They are not duplicates. Both are required.*

**Severity:** Medium. This gap will cause confusion on every first-time module intake.

---

## HF-04 — Knowing When to Stop and Ask vs. Proceed

**Scenario:** During Gate 5 (QA Audit), the AI produces an AuditReport with a P2 finding: "The legal test for negligence in Section 4 appears to omit the 'proximity' element." Nicole is not sure if this is a real error or an AI mistake.

**SHOS provision:**  
Module 06 says: "For each P1/P2 finding, verify against Tier 1 sources before accepting." The agent decision boundary says agents must escalate disputed findings to Nicole.

**Usability assessment:**  
This is well-handled conceptually but creates a practical problem: Nicole now needs to open the original lecture PDF, find the negligence test, and compare it to what the hub says. This is the verification step that the system relies on her to do correctly — at the moment she is most time-pressured (close to exams).

The system is sound but places the final verification burden correctly on Nicole. There is no shortcut that bypasses this without risking academic error.

**Risk:** Under exam pressure, Nicole accepts the P2 finding without verifying it, adds a patch based on the AI's suggestion, and introduces an error.

**Recommendation:**  
This is not a system flaw — the system correctly requires human verification. However, Module 06 could include a concrete verification template:
```
To verify a P2 finding:
1. Open source-audit.md — find which Tier 1 source covers this topic
2. Open that source — navigate to the relevant section
3. Compare: does the hub match the source?
4. If yes: reject finding, note "Source verified — no error"
5. If no: accept finding, use patch instruction as written
```

**Severity:** Low as a system flaw. Medium as a user experience friction point.

---

## HF-05 — Cognitive Load of File Naming

**Scenario:** Nicole is looking at `02_builds/` and sees:
- `FOL178_S1_v0_8_MasterStudyHub.html`
- `FOL178_S1_v0_9_MasterStudyHub.html`
- `FOL178_S1_v1_0_MasterStudyHub.html`
- `FOL178_S1_v1_0_MasterStudyHub_APPROVED.html`

She is not sure which is the correct file to work with.

**SHOS provision:**  
system-config.md defines the naming convention. v1.0 = approved designation. `_APPROVED` suffix is not in the naming convention — it should not exist. The naming convention is clear but does not prevent non-convention files from appearing.

**Usability assessment:**  
The naming convention is well-designed and unambiguous when followed. The problem is that Nicole might add her own suffixes (`_APPROVED`, `_final`, `_PRINT`) out of habit from pre-SHOS workflows.

**Risk:** Two files claim to be the approved version, or the actual approved file has an unexpected suffix that breaks agent filename checks.

**Recommendation:**  
Add to Module 01 SOP or the system safety rules: "Do not add suffixes to SHOS-managed files. The version number in the filename is the only status indicator you need. `v1.0` = approved. There are no other status suffixes."

**Severity:** Low. Naming convention is documented. This is a habit-change issue.

---

## HF-06 — Recovering From an Agent Producing Wrong Output

**Scenario:** The Build Planner (Gate 3) produces a build brief that is missing three topics from the module. Nicole didn't notice during approval. Gate 4 (HTML Production) runs and produces a hub missing those topics.

**Test question:** At what point does SHOS detect that the hub is missing topics? And what is the recovery path?

**SHOS provision:**  
Gate 5 (QA Audit) should detect missing sections by cross-referencing the build brief section list against the HTML. If the build brief itself is missing the topics, Gate 5 will not catch this — it validates against the build brief, not against the source material directly.

The source audit (Gate 2) produces a coverage map. Gate 5 checks HTML against build brief, not HTML against source coverage map.

**Gap:**  
There is no gate that checks build brief completeness against source coverage. The source-audit.md coverage analysis is produced at Gate 2 but is not formally re-checked at Gate 5 to confirm the HTML covers all audited topics.

**Recovery path:**  
If Nicole notices the missing topics after Gate 5: rebuild the build brief (Module 03 re-run), add missing sections via Module 05 (patch), re-run Gate 5. This works but requires re-entering the pipeline at Gate 3.

**Recommendation:**  
Add to Gate 5 criteria: "Confirm that the section list in AuditReport.md cross-references not only build-brief.md but also source-audit.md coverage map. Flag any source-audited topic that has no corresponding section in the hub."

**Severity:** Medium. This scenario is realistic. A student in a hurry may not audit their own build brief carefully enough.

---

## HF-07 — Time Pressure and Gate Bypass Temptation

**Scenario:** It is 3 days before the FOL178 exam. Gate 5 (QA Audit) has found three P3 issues. Nicole wants to skip patching and proceed directly to the revision pack. She knows a bypass exists in the gate document.

**SHOS provision:**  
`quality-gates.md` documents bypass conditions: "Gate bypass allowed only with Nicole's explicit decision, documented in module.yaml as `bypass_reason`." P3 issues can be bypassed with documented justification. P1/P2 issues cannot be bypassed.

**Usability assessment:**  
The bypass mechanism is correct and well-designed. P3 = cosmetic/minor = bypassable. P1/P2 = academic accuracy = never bypassable. The gate document is explicit about this distinction.

**Risk:** If the QA audit (under G5-01 conditions) fails to find a P2 error and rates it P3, the bypass rule is satisfied and Nicole proceeds with an unfixed academic error. This is the compound risk: G5-01 (incomplete audit) + gate bypass = silent error propagation.

**Recommendation:**  
Add to Gate 5 bypass guidance: "P3 bypass is only valid if the audit was a full three-pass audit (structural + academic + source verification). A single-pass audit cannot be bypassed — the audit itself is incomplete."

**Severity:** Medium. The compound risk of incomplete audit + bypass is the highest human factors risk in the system.

---

## HF-08 — Working With Multiple AI Tools in a Single Session

**Scenario:** Nicole is running Gate 5 QA. She has three windows open: Claude (for QA audit), NotebookLM (for source verification), and Chrome (for the HTML file). She needs to coordinate findings across all three.

**SHOS provision:**  
Agent registry describes each agent's role. The handoff template in the router describes how to pass context between agents. SOP-05 Step 5 covers NotebookLM cross-check.

**Usability assessment:**  
The multi-tool coordination is documented at the principle level but not at the operational level. A user following SOP-05 knows to "upload sources to NotebookLM" but:
- When exactly during the audit does she query NotebookLM?
- How does she format the query so the result is useful?
- What does she do if NotebookLM and Claude disagree on a finding?

**Gap (W-06 partial):**  
The agent handoff template in the router is a starting point but does not address the specific case of parallel use (Claude + NotebookLM simultaneously, not sequentially).

**Recommendation:**  
Add to Module 06 a "QA Multi-Agent Coordination" section:
1. Run Claude structural audit first (Domains C, D, E) — close other tabs
2. Review Claude's findings, mark each for verification
3. Open NotebookLM with Tier 1 sources uploaded
4. For each P1/P2 finding: paste the specific claim into NotebookLM and ask for source confirmation
5. If NotebookLM contradicts Claude: defer to source; the finding becomes a "disputed finding" for Nicole to review

**Severity:** Medium. This friction will be felt on every law module QA audit.

---

## Overall Human Factors Assessment

| Factor | Rating | Notes |
|--------|--------|-------|
| Navigation — knowing where to start | Good | Router + checklists solve this |
| Navigation — returning after a break | Moderate | Requires module.yaml to be current |
| Agent selection | Good | Quick reference table; inconsistent module headers |
| Document relationship clarity | Weak | Two-document problem (HF-03) not addressed |
| Verification burden | Appropriate | Correctly placed on Nicole for P1/P2 |
| File naming | Good | Convention is clear; habit-change required |
| Gate bypass safety | Moderate | Bypass is safe for P3 if G5-01 is resolved |
| Multi-tool coordination | Weak | Documented at principle level; operational gaps remain |
| Error recovery | Good | Mostly well-documented via patching pipeline |
| Time pressure behaviour | Moderate | Bypass rule is correct; compound risk with G5-01 |

**Overall:** SHOS v1.0 is designed with human factors in mind at the architectural level. The main friction points are in the operational details of multi-tool coordination and the two-document problem at intake. These are fixable with targeted additions to Module 01, Module 06, and the SOP layer.

The highest human factors risk is the compound failure: G5-01 (incomplete audit) + gate bypass = undetected P2 error in revision and exam packs. This risk is manageable only if G5-01 is resolved.
