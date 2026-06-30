# Build Manifest Template

**Copy to:** `[MODULE_FOLDER]/06_audit/build-manifest.md`  
**Purpose:** Complete provenance record for every build and patch. Enables full reproducibility — anyone reading this manifest can understand exactly how the hub was built.

---

# Build Manifest

## Module: [MODULE_CODE] [Full Name]
## Semester: [Semester and Year]

---

## Build History

### Build Entry Template

```
---
BUILD-[N]
Date: [YYYY-MM-DD]
Type: [initial-build | patch | rebuild | rollover]
Input file: [filename or "new build"]
Output file: [filename]
Version: v[X.X]

Agent(s) used:
  - [Agent name] ([Tool]) — [what they did]
  - [Agent name] ([Tool]) — [what they did]

Prompts used:
  - [Module file and prompt section]

Sources consulted:
  - [SRC-ID] [filename]

Changes made:
  - [Description of what was built or changed]

QA result: [Not yet run | Issues found: N | Passed]
Print status: [Not printed | Print audit pending | Print approved | Printed]

Known issues at this version:
  - [Issue description and priority]

Notes:
  [Any other relevant information]
---
```

---

## Active Version Record

| Version | File | Date | Status | Issues Outstanding |
|---------|------|------|--------|--------------------|
| v0.8 | | | Draft | |
| v0.9 | | | Post-audit | |
| v1.0 | | | Approved | None |

---

## QA Audit Log

| Audit # | Date | Version | Agent | Issues Found | P1 | P2 | P3+ | Verdict |
|---------|------|---------|-------|-------------|----|----|-----|---------|
| 1 | | v0.8 | Claude | | | | | Patch required |
| 2 | | v0.9 | Claude | | | | | Print candidate |

---

## Print Log

| Print Run | Date | File | Pages | Printer | PDF Saved | Notes |
|-----------|------|------|-------|---------|-----------|-------|
| 1 | | v1.0 | | Home | Yes | |

---

## AI Model Record

| Task | AI Tool | Model Version | Date | Notes |
|------|---------|--------------|------|-------|
| Source audit | Claude | | | |
| Build planning | Claude | | | |
| HTML production | Claude Code | | | |
| QA audit | Claude | | | |
| Cover sheets | Claude Code | | | |
| Case sheets | Claude Code | | | |

*(Record AI tool used at each stage for reproducibility and future auditing)*

---

## Reproducibility Statement

To reproduce this hub:
1. Obtain all Tier 1 sources listed in source-manifest.md
2. Follow build-brief.md in 00_intake/
3. Use the component library in components/component-library.md
4. Apply the module.yaml configuration
5. Run QA audit against qa-checklist.md
6. Apply all patches listed in patch logs in this folder
