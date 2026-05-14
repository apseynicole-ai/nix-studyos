# Nix StudyOS — Stellenbosch Personal Academic Command Centre

A React + Vite + Firebase study system customised for a Stellenbosch University BAccLLB student.

## What this version includes

- Personalised BAccLLB dashboard
- Module command centre
- Topic Mastery Tracker inside `src/pages/Modules.tsx`, saved locally on-device
- Module-specific marks engine with local-first marks storage
- Module-specific tasks and template bank
- A2 planner and nightly reset checklist
- Mistake Bank at `/mistakes`, saved locally on-device
- Final Boss exam template vault
- AI prompt packs and LexAI context injection
- Module-aware focus timer and study session logging

## Architecture status

- Local-first:
  - Marks engine in `src/lib/marksEngine.ts`
  - Module-specific marks scenarios in `src/pages/Marks.tsx`
  - Local marks state under `baccllb-mark-engine-state`
  - Local backup, import, and reset via `src/lib/localData.ts`
  - Topic Mastery Tracker inside Modules under `baccllb-topic-mastery`
  - Mistake Bank at `/mistakes` under `baccllb-mistake-bank`
  - Local profile, tasks, timer sessions, and StudyAI summaries saved on-device
- Cloud-backed:
  - Optional Firebase Auth sign-in
  - Optional future Firestore sync for tasks, timer sessions, AI summaries, and dashboard stats when a database exists
- Planned:
  - Firestore marks sync
  - PWA support

Nix StudyOS currently runs local-first without billing or Blaze. Firebase Auth and Firestore sync are optional future layers, not requirements for opening the app. Marks, tasks, timer sessions, and AI summaries can all work locally in this phase.

Topic Mastery Tracker and Mistake Bank are already implemented in this branch. Topic mastery lives inside the Modules screen, Mistake Bank lives at `/mistakes`, and both are stored locally and included in backup/export/import flows where applicable.

Marks are intentionally local-first in this phase. They do not sync to Firestore yet, and the current formulas and backup/import/reset flow should be preserved until a dedicated marks-sync phase is planned.

Firestore and any Blaze-dependent cloud sync can be revisited later once the project is ready for that phase. Until then, users should export backups regularly before clearing browser storage, changing browsers, or switching devices.

Before clearing browser storage, changing browsers, or switching devices, use backup/export so your local marks data is not lost.

## Run locally

```bash
npm install
npm run dev
```

Set `GEMINI_API_KEY` in `.env.local` for AI features.

Example:

```bash
GEMINI_API_KEY=your_key_here
```

Use `.env.local` for local development or deployment environment variables in production. Gemini keys must stay server-side and must not be exposed through Vite variables, `import.meta.env`, or client-bundled config.

## Validate

```bash
npm run lint
npm run build
```

## Firebase security

- Enable Firebase Email/Password authentication in the Firebase console only if you want optional sign-in during this local-first phase.
- Passwords are handled by Firebase Auth only, and the app does not store custom password hashes or custom password records.
- Firestore rules and cloud sync can be added later if and when a Firestore database is created.
- Marks are still local-first in this phase. The marks engine and marks state are not being moved into shared Firestore by these changes.
- Deploy updated Firestore rules with the Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

- Restrict Firebase API keys in the Google Cloud Console or Firebase console so they are limited to the intended app origins and APIs.
- If a Firebase key or other credential was ever committed publicly, rotate it in Google Cloud or Firebase and update all environments.
- Never commit `.env.local`.

## Notes for Codex

The main source of personalised academic data is `src/data/baccllb.ts`. Start there when adding modules, topics, marks, assessments, task templates, AI prompt packs or exam templates.
