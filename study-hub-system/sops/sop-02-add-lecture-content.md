# SOP-02 — Add New Lecture Content

**Trigger:** New lecture slides, notes, or tutorial documents arrive after the hub has already been built.

**Time required:** 20–45 minutes depending on how much new content exists and whether it changes existing sections.

---

## Steps

**1. Register the new source**
- Copy the new file to `01_sources/raw/` without renaming
- Add it to the source manifest (`01_sources/source-manifest.md`) as a new SRC entry
- Add it to the source-audit.md source register with classification and tier

**2. Analyse what the new source adds or changes**
Run the Source Auditor with a targeted prompt:
```
New source received: [filename]
Existing hub version: [filename]
Existing build brief: [filename]

Is this new source:
(a) Additional content for a topic already in the hub?
(b) A new topic not yet in the hub?
(c) A correction to an existing section?
(d) New cases, formulas, or examples to add?

Produce a change summary and recommend patch instructions.
```

**3. Classify the change**

| Change type | Action |
|-------------|--------|
| Additional examples / depth for existing topic | Patch via Module 05 |
| New topic not in the hub | Add section via Module 05 (or Module 04 if extensive) |
| Correction to existing content | Patch via Module 05 (P1 if academic accuracy issue) |
| New cases | Patch hub + regenerate relevant case sheets (Module 09) |
| New formulas | Patch hub + update formula reference if present |

**4. Write patch instructions**
Follow the Patch Instruction Format in Module 05.
Each new content element should be a separate numbered patch.

**5. Run Module 05 Patching**
Give HTML Patch Engineer:
- Source file (current approved version)
- Target filename (incremented version)
- Numbered patch instructions
- New source file to reference

**6. Run Module 06 QA Audit on the new version**
Focus QA on the patched sections.
Check that new content follows component library standards.

**7. Update manifests**
- Update source-manifest.md: set new source to `Active`
- Update build-manifest.md: add a new BUILD entry

**8. Update module.yaml gate status if needed**
If gate status changed (e.g., moving from v0.9 to v1.0 after adding critical content):
Update `build_status` in module.yaml.

---

## Completion Check

- [ ] New source registered in source manifest
- [ ] Patch instructions written and specific
- [ ] New version produced (correct filename, incremented version)
- [ ] QA audit run on patched version
- [ ] Manifests updated
- [ ] Module register updated

---

## Do Not

- Add AI-generated summaries of the new lecture as if they were the source
- Assume the new lecture repeats existing content — always check for new cases, formulas, or principles
- Rebuild the entire hub unless more than 60% of the content changes
