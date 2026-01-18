# Multilingual Word Explorer — Native Mobile PRD (React Native)

## 1) Product overview
A **native** React Native app (not a webwrapper) that helps a parent support a child’s language learning by taking a **single word** (spoken or typed) and showing:
- translations in **English / Thai / Cantonese** (all on one screen)
- **one** relevant image
- audio pronunciation for each language

The existing web app is the behavioural reference. See `docs/REFERENCE_APP.md`.

## 2) Primary user
A parent using the app with a preschool-aged child.

## 3) Core experience
### Input
- **Push-to-talk**: press-and-hold the microphone button to record; release to stop.
- **Typed input**: user can type a word instead of recording.

### Flow (happy path)
1. User press-holds **Speak** and says a word.
2. On release, the app transcribes and shows the recognized text.
3. The app fetches:
   - translations in English/Thai/Cantonese
   - one image
4. The app displays all three languages on one screen.
5. User taps speaker buttons to hear pronunciation for each language.
6. User taps **Start over** / **Listen to another word** and repeats.

### Multiple meanings
If the word has multiple meanings, behaviour is controlled by a setting:
- **Prompt for clarification (default)**: show options for the parent to choose.
- **Show first result**: pick the most common meaning automatically.

## 4) MVP scope (must-have)
- Push-to-talk recording UI with clear recording state.
- Typed input field.
- Transcription result visible/editable.
- Translation results (English/Thai/Cantonese) shown simultaneously.
- One image shown.
- Tap-to-play pronunciation per language.
- Settings: multiple-meanings handling.
- Loading + error states:
  - mic permission denied
  - no speech detected
  - network failure
  - no results
- “Start over” action that clears current results.

## 5) Non-goals (for MVP)
- Full sentence translation.
- User accounts / sync across devices.
- Gamification, lessons, spaced repetition.
- Offline-first mode (caching is optional later).

## 6) UX requirements
- The user must never wonder when recording starts/stops:
  - recording begins on press
  - recording ends on release
  - haptic + visual recording indicator
- Results page must be readable at arm’s length:
  - large type
  - large tap targets
- One-screen layout for the three language sections.
- Audio playback must be one-tap and interruptible (tapping a different language stops the current playback).

## 7) Quality targets
- Typical “press → results” should feel fast (goal: a few seconds on normal home Wi‑Fi).
- Graceful degradation:
  - if image fetch fails, still show translations and audio
  - if audio fails, still show text

## 8) Privacy & security
- Do not embed long-lived secrets in the app bundle.
- Keep API keys on a server/BFF where possible.
- Avoid storing audio recordings by default.
- Minimal logging; no analytics required for MVP.

## 9) Distribution plan
- MVP: run on device via Xcode install during development.
- Optional later: TestFlight for spouse, then App Store.

## 10) Future ideas (post-MVP)
- Recents + favourites.
- Simple caching of recent lookups.
- Pluggable providers (speech, translation, image, TTS).
- More languages and language presets.
