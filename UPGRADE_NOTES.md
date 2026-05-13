# BAccLLB Study Pro — Personalised Upgrade Notes

This version upgrades the original generic Stellenbosch study app into a personalised BAccLLB command centre for Nix/Nicole's Year 1 study workflow.

## Added core sections

- **Dashboard**: A personalised academic command centre with A2 risk radar, deadline radar, next-best actions, weekly rhythm and nightly checklist.
- **Modules**: Full module intelligence layer for Financial Accounting 178, Economics 114, Foundations of Law 178, Constitutional Law 178, Legal Skills 114, SDS188, DLA112/122 and second-semester shells.
- **Tasks**: Module-specific task bank with priority, points, time estimates, due dates, types and Final Boss day seeding.
- **Marks**: Semester mark control room with local saved mark scenarios and required-next-mark calculations.
- **Planner**: ADHD-friendly week rhythm with morning activation, deep work blocks, light evening blocks and nightly reset system.
- **Final Boss Vault**: Reusable law, accounting, statistics and universal exam answer templates plus AI prompt packs.
- **LexAI Command Lab**: Upgraded AI assistant with module-context injection, weak-point awareness and reusable prompt packs.
- **Timer**: Study timer now logs module, session type, duration, reflection and mistake/next-step notes.

## Added data and logic files

- `src/data/baccllb.ts`: central source of truth for modules, weak points, assessment dates, prompt packs, task templates, exam templates and study routines.
- `src/lib/studyMetrics.ts`: required-mark calculator, confidence/readiness labels, risk styling and upcoming assessment helpers.

## Personalisation included

- Stellenbosch University BAccLLB Year 1 context.
- Known current modules and likely second-semester module shells.
- Known weak points such as FinAcc application, Economics Units 7–9, Foundations Roman legal history, Legal Skills footnotes, ReadTheory evidence and SDS Chapters 3–6.
- Preferred study systems: MegaNotes, exam practice, teach-aloud recall, mistake logs, timed micro-practice, weekly reset and nightly checklist.
- Marks forecasting goal: 70%+ semester average and distinction-level A2 push.

## Validation

- `npm run lint` passed.
- `npm run build` passed.
- Build warning: bundle size exceeds 500 kB. Codex can improve this by code-splitting routes with lazy imports.

## Suggested Codex final upgrade prompts

1. Convert route pages to lazy-loaded chunks to reduce the main bundle.
2. Add Firestore-backed module mastery records instead of static confidence numbers.
3. Add editable topic trackers per module with confidence, practice count, last reviewed and retest date.
4. Add calendar export or ICS generation for task due dates and assessments.
5. Add import/export JSON backup for marks, tasks, mistakes and sessions.
6. Add PWA support and offline-first caching for campus use.
7. Add charts for weekly study minutes, marks projection and weak-topic trends.
