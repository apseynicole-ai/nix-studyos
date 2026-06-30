# SOP-05 — Run a QA Audit

**Trigger:** After every build (Module 04) or significant patch (Module 05). Also triggered if Nicole suspects a content problem.

**Time required:** 30–60 minutes for a full audit.

---

## Steps

**1. Confirm the correct file**
Identify the exact filename of the HTML to audit. Confirm it is the most recent version.

**2. Open the QA Audit prompt**
Location: `modules/06-qa-audit.md` — "Reusable Prompt — QA Audit"

**3. Prepare the context**
Gather:
- Source audit coverage analysis (paste from `01_sources/source-audit.md`)
- Section list from build brief (paste from `00_intake/build-brief.md`)
- Module type (Law / Quantitative / Mixed)
- Error library (reference `error-library/error-library.md`)

**4. Run the audit with QA Auditor agent (Claude)**
Paste the prompt with context into Claude.
Give Claude access to the HTML file.

**5. Cross-check with Source Verifier (optional but recommended)**
Upload Tier 1 sources to NotebookLM.
Ask targeted questions about any findings that rely on source accuracy:
- "Does [case name] establish [principle]?"
- "Is [formula] stated correctly in the lecture slides?"
NotebookLM output is Tier 3 — it supports findings, never creates them.

**6. Review the audit report**
Read the AuditReport.md produced by QA Auditor.
For each finding:
- Confirm the source reference is valid
- Agree or dispute the priority level
- Confirm the patch instruction is correct

**7. Save the audit report**
Save to: `06_audit/[MODULE_CODE]_S[N]_[version]_AuditReport.md`

**8. Proceed based on verdict**

| Verdict | Next action |
|---------|-------------|
| DO NOT PRINT | Patch P1 and P2 issues (Module 05), then re-run audit |
| PATCH REQUIRED | Patch P3 issues (Module 05), then run Print Audit |
| PRINT CANDIDATE | Run Print Audit (Module 07) |
| APPROVED | Rename to v1.0, run Print Audit |

**9. If issues found — write patch instructions**
Use the patch instructions from the audit report directly in Module 05.
Do not modify patch instructions without understanding why.

**10. Update build manifest**
Add a new audit entry to `06_audit/build-manifest.md`.

---

## Completion Check

- [ ] Audit report saved to `06_audit/`
- [ ] Verdict clearly stated
- [ ] All P1 and P2 issues have patch instructions
- [ ] Build manifest updated
- [ ] Next action clear

---

## Audit Frequency

| Situation | Audit required? |
|-----------|----------------|
| After initial v0.8 build | Always |
| After any patch with > 3 changes | Always |
| After minor patch (1–2 cosmetic changes) | Targeted check of changed sections only |
| Before print | Always (full audit) |
| After semester rollover patch | Always |

---

## Do Not

- Skip the source coverage check (Domain B)
- Base findings only on AI knowledge without source support
- Proceed to printing without running a full audit
