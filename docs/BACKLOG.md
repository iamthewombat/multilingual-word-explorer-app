# Backlog — Native React Native app

This is a starter backlog derived from `docs/PRD.md`.

## Epic 0 — Repo & scaffolding
1. Create `ios-app/` React Native TypeScript project (see `docs/TECH_SPEC.md`).
   - AC: project builds in Xcode on physical device.
   - AC: `ios-app/` kept isolated from web app.

## Epic 1 — Core screen scaffolding
1. Create a single-screen layout matching reference blocks:
   - header language chips (English ไทย 粤語)
   - speak control, typed input
   - suggestions section
   - results blocks for English/Thai/Cantonese
   - image block
   - settings modal
   - start over
   - AC: layout works on iPhone (small + large)

## Epic 2 — Push-to-talk STT
1. Mic permission handling.
2. Press-and-hold starts recording; release ends.
3. STT integration returns transcript.
4. Transcript is editable.
   - AC: user never depends on auto end-detection.

## Epic 3 — Translation integration
1. Implement `Translator` interface and wire to existing backend endpoint (server-side keys).
2. Map response to EN/TH/YUE.
   - AC: translations render under each language header.

## Epic 4 — Image integration
1. Implement `ImageProvider` using Pexels.
2. Display exactly one image.
3. Fallback state if none.

## Epic 5 — Text-to-speech
1. Implement `SpeechSynthesizer`.
2. Tap-to-play per language.
3. Only one playback at a time.

## Epic 6 — Settings & multiple meanings
1. Settings modal with toggle:
   - Prompt for clarification (default)
   - Show first result
2. Persist setting locally.
3. Apply to lookup flow.

## Epic 7 — Error handling polish
1. Offline & provider errors.
2. Retry actions.

## Epic 8 — Testing & release hygiene
1. Unit tests for state machine.
2. Manual acceptance pass using `docs/ACCEPTANCE_TESTS.md`.
