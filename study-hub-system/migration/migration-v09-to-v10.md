# Migration Guide — v0.9 to v1.0

**Purpose:** Instructions for transitioning any existing module built under the v0.9 system to full v1.0 compliance.  
**Backward compatibility:** All v0.9 files are valid v1.0 files. No destructive changes required.

---

## What Changed in v1.0

### New capabilities (additive — no changes to existing files required)
| Capability | Location | Impact |
|-----------|---------|--------|
| AI Agent Registry | agents/agent-registry.md | Use agents for future builds |
| Prompt Router | router/prompt-router.md | Navigation — no file changes |
| Component Library | components/component-library.md | New builds use components; existing builds unchanged |
| module.yaml | config/module-template.yaml | Optional for existing modules; required for new ones |
| Source Manifest | manifests/source-manifest-template.md | Replaces informal source listing |
| Build Manifest | manifests/build-manifest-template.md | New — documents build history |
| Archive Manifest | manifests/archive-manifest-template.md | Replaces ARCHIVE_*.md for new archives |
| Error Library | error-library/error-library.md | Used in QA audits going forward |
| Knowledge Bases | knowledge-bases/ | Reference for agents; no module changes required |
| Quality Gate Framework | quality-gates/quality-gates.md | Enforced going forward; retroactively assessed |
| Data Model | data-model/data-model.md | Governs future builds; existing HTML is compatible |
| Architecture Review | ARCHITECTURE-REVIEW.md | Reference document |

---

## Migration Steps by Scenario

---

### Scenario A — Existing module, not yet started (no v0.9 files)

**Action:** Use v1.0 from the beginning. Follow the full v1.0 workflow.

1. Create `00_intake/module.yaml` from `config/module-template.yaml`
2. Run all gates in order
3. Use component library (components/) for HTML production
4. Create source manifest alongside source audit
5. Create build manifest from first build

**Effort:** None — no migration needed.

---

### Scenario B — Existing module, in progress (v0.8 or v0.9 exists)

**Action:** Complete the current module using v0.9 workflow. Adopt v1.0 enhancements progressively. Full v1.0 compliance at archive time.

**Steps:**
1. Add `00_intake/module.yaml` — copy template, fill in what is known
2. Update gate status dashboard in module.yaml to reflect current progress
3. Create `01_sources/source-manifest.md` by extracting data from existing source-audit.md
4. Create `06_audit/build-manifest.md` with retrospective build entries for builds already done
5. Next QA Audit: reference error-library.md for known errors
6. Next HTML patch: use component library CSS classes where replacing blocks
7. At archive: use archive-manifest-template.md instead of or alongside the ARCHIVE_*.md format

**Effort:** Low — 30–60 minutes to add manifests and module.yaml.

---

### Scenario C — Existing module, fully archived (v0.9 archive complete)

**Action:** Archive is complete and locked. Leave as-is. v1.0 applies to the rollover semester.

**Steps:**
1. When beginning the new semester rollover: create new semester module.yaml
2. Use the rollover change analysis (Module 13) as normal
3. New semester builds use v1.0 workflow and component library
4. New semester archive uses archive-manifest-template.md

**Effort:** None to the archive. v1.0 starts fresh with the next semester.

---

## File-Level Migration Notes

### module-register.md → module.yaml
The module-register.md format remains valid for reference. module.yaml is the machine-readable configuration.
- Do NOT delete module-register.md
- module.yaml supplements it with structured data

### source-audit.md → source-manifest.md
- source-audit.md remains the analytical report (coverage gaps, tier reasoning)
- source-manifest.md is the structured ledger (every source, current status, version)
- Both files coexist — they serve different purposes

### ARCHIVE_*.md → archive-manifest.md
- The ARCHIVE_*.md format from v0.9 remains valid
- archive-manifest.md adds: file inventory table, build summary, reuse notes, complete gate record
- For new archives, use archive-manifest.md and optionally keep ARCHIVE_*.md as well

---

## HTML File Compatibility

Existing HTML files built under v0.9 are **fully compatible** with v1.0. No changes are required to existing approved files.

When patching existing files with new content blocks, use component library CSS classes going forward. Do not retrofit old blocks — only new additions need to use component syntax.

---

## Prompt Compatibility

All v0.9 module prompts remain valid. v1.0 adds:
- A standard session opener (see router/prompt-router.md)
- Agent-specific context for each prompt
- Error library reference in QA prompts

If reusing a v0.9 prompt, prepend the standard session opener and add the agent context block.

---

## Quality Gate Retroactive Assessment

For modules currently in progress, assess gate status as follows:

| Gate | Retroactive pass criteria |
|------|--------------------------|
| 1 | module-register.md exists and is complete |
| 2 | source-audit.md exists and has coverage analysis |
| 3 | build-brief.md exists and has been reviewed |
| 4 | v0.8 HTML file exists |
| 5 | At least one QA audit report exists with no unresolved P1/P2 issues |
| 6 | v1.0 HTML file exists and PDF saved |
| 7 | RevisionPack.html exists |
| 8 | ExamPack.html exists |
| 9 | ARCHIVE_*.md or archive-manifest.md exists |
| 10 | New semester module.yaml created |

---

## v1.0 Compliance Checklist

Use this to confirm a module is fully v1.0 compliant:

- [ ] `00_intake/module.yaml` exists and is complete
- [ ] `01_sources/source-manifest.md` exists
- [ ] `06_audit/build-manifest.md` exists
- [ ] At least one QA audit references the error library
- [ ] Component library CSS classes used in any new content blocks
- [ ] Gate status dashboard populated in module.yaml
- [ ] Archive uses archive-manifest-template.md (if archived)
