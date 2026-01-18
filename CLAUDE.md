# Claude Code project instructions (CLAUDE.md)

## Project intent
We are building a **native** React Native app (not a webwrapper) for Multilingual Word Explorer.

Authoritative docs:
- `docs/PRD.md` — what we are building
- `docs/REFERENCE_APP.md` — behavioural reference from the existing web app
- `docs/TECH_SPEC.md` — architecture + bootstrapping commands
- `docs/BACKLOG.md` — initial tasks

## Working rules (non-negotiable)
- Never add, paste, or commit secrets (API keys, tokens, service account JSON, etc.).
- Do not delete or rename files unless you ask first.
- Do not run `git push` unless explicitly requested.
- Prefer small, reviewable changes with clear commits.
- When you change behaviour, update `docs/REFERENCE_APP.md` and call it out.

## Code style
- TypeScript only in the RN app.
- Keep UI components small and testable.
- Isolate provider integrations behind interfaces.

## App constraints
- Input is **push-to-talk** (hold/release), plus typed input.
- Show EN/TH/YUE results on one screen.
- Exactly one image.

## Suggested implementation plan
- Work through `docs/BACKLOG.md` top-to-bottom.
- For each task:
  1) restate acceptance criteria
  2) implement
  3) explain how to run/verify locally

## How to run (expected)
RN app will live at `ios-app/` and be built/run via Xcode device installs.
