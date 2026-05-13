# BAccLLB Study Pro — Stellenbosch Personal Academic Command Centre

A React + Vite + Firebase study system customised for a Stellenbosch University BAccLLB student.

## What this version includes

- Personalised BAccLLB dashboard
- Module command centre
- Marks forecasting and required-next-mark calculator
- Module-specific tasks and template bank
- A2 planner and nightly reset checklist
- Final Boss exam template vault
- AI prompt packs and LexAI context injection
- Module-aware focus timer and study session logging

## Run locally

```bash
npm install
npm run dev
```

Set `GEMINI_API_KEY` in `.env.local` for AI features.

## Validate

```bash
npm run lint
npm run build
```

## Notes for Codex

The main source of personalised academic data is `src/data/baccllb.ts`. Start there when adding modules, topics, marks, assessments, task templates, AI prompt packs or exam templates.
