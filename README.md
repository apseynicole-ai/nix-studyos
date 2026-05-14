# Nix StudyOS — Stellenbosch Personal Academic Command Centre

A React + Vite + Firebase study system customised for a Stellenbosch University BAccLLB student.

## What this version includes

- Personalised BAccLLB dashboard
- Module command centre
- Module-specific marks engine with local-first marks storage
- Module-specific tasks and template bank
- A2 planner and nightly reset checklist
- Final Boss exam template vault
- AI prompt packs and LexAI context injection
- Module-aware focus timer and study session logging

## Architecture status

- Local-first:
  - Marks engine in `src/lib/marksEngine.ts`
  - Module-specific marks scenarios in `src/pages/Marks.tsx`
  - Local marks state under `baccllb-mark-engine-state`
  - Local backup, import, and reset via `src/lib/localData.ts`
- Cloud-backed:
  - Tasks
  - Timer sessions
  - AI summaries
  - Dashboard stats
- Planned:
  - Firestore marks sync
  - Topic trackers
  - Mistake log
  - PWA support

Marks are intentionally local-first in this phase. They do not sync to Firestore yet, and the current formulas and backup/import/reset flow should be preserved until a dedicated marks-sync phase is planned.

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

- Enable Firebase Email/Password authentication in the Firebase console before using the username or email sign-in flow.
- Username is the app-level identity in Nix StudyOS. Passwords are handled by Firebase Auth only, and the app does not store custom password hashes or custom password records.
- Usernames are mapped through `usernames/{usernameLowercase}` so the app can resolve username-based sign-in to the correct Firebase Auth email.
- Firestore rules protect user-owned cloud data. Each authenticated user may only read and write their own `users`, `tasks`, `sessions`, and `summaries` documents, and planned future collections follow the same owner-only pattern.
- Marks are still local-first in this phase. The marks engine and marks state are not being moved into shared Firestore by these auth changes.
- Deploy updated Firestore rules with the Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

- Restrict Firebase API keys in the Google Cloud Console or Firebase console so they are limited to the intended app origins and APIs.
- If a Firebase key or other credential was ever committed publicly, rotate it in Google Cloud or Firebase and update all environments.
- Never commit `.env.local`.

## Notes for Codex

The main source of personalised academic data is `src/data/baccllb.ts`. Start there when adding modules, topics, marks, assessments, task templates, AI prompt packs or exam templates.
