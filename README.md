# Nix StudyOS — Stellenbosch Personal Academic Command Centre

## ECO114 A3 — Recommended study files (open in browser, no server needed)

| # | File | Purpose |
|---|------|---------|
| 1 | `exports/html/eco114_a3_FINAL_80PLUS_MASTER_HUB.html` | **Recommended daily study file** — all units, War Room, progress tracking, full practice bank |
| 2 | `exports/html/eco114_a3_index.html` | Start Here / backup control centre |
| 3 | `exports/html/eco114_a3_exam_warroom.html` | Standalone War Room backup |
| 4 | `exports/html/eco114_a3_markets_units_6_7_8_10_v2_unit_tabs.html` | Standalone Markets backup (SVG graphs + extra practice) |
| 5 | `exports/html/eco114_a3_foundations_units_1_to_5_v2_unit_tabs.html` | Standalone Foundations backup (SVG graphs + extra practice) |

Legacy files (`eco114_a3_markets_units_6_7_8_10.html`, `eco114_a3_foundations_units_1_to_5.html`) are reference only — do not use for daily study.

### Final Master Hub — current version: v1.4 (post-audit patch)
- Received post-audit reliability and content patch (2026-06-14).
- Unit 10 positive externality worked example corrected (Q*=50 > Qm=40, subsidy=R20).
- Full practice bank added: 70 real questions across all 9 units (U8×12, U7×10, U10×10, U3×8, U6×6, U4×6, U5×6, U2×6, U1×6).
- 80% vs 100% guidance added to all 9 premium Section C answers.
- localStorage wrapped in try/catch safe wrappers (works in private browsing).
- Desktop double-offset layout bug fixed.
- Active recall delegated listener (no handler leakage).
- Dark mode premium card contrast fixed.
- Mistake log aria-labels added.
- All graphs are **text-only redraw cards** in the master hub. For SVG graph aids open Markets v2 or Foundations v2.
- **Only tick progress checkboxes after closed-book recall or completed written practice. Ticking is not studying.**

---

A React + Vite + Firebase study system customised for a Stellenbosch University BAccLLB student.

## What this version includes

- Local-first / guest-first app shell with optional Firebase Auth
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
- PWA install support with a basic offline app shell
- Timer to Mistake Bank quick capture
- Module confidence overrides
- Dashboard study streak / weekly momentum tracker

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
npm test
```

The module-specific marks engine has automated reliability tests in `src/lib/marksEngine.test.ts`. These tests protect the current planning formulas, A3/subminimum edge cases, and verification-sensitive shared models.

Marks outputs remain unofficial planning estimates. Always verify marks, assessment weights, A3 rules, and pass/subminimum requirements against the official module frameworks before relying on them for final academic decisions.

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
