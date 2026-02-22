# Backlog — Native React Native app

Work items are ordered top-to-bottom. Check off items as they are completed.

---

## Epic 0 — Repo & scaffolding

- [x] Create `WordExplorer/` React Native TypeScript project.
- [x] Verify project builds in Xcode on physical device.
- [x] Confirm `WordExplorer/` is isolated from web app.

---

## Epic 1 — Core screen scaffolding & UI

### 1.1 Project structure
- [x] Create `src/screens/HomeScreen.tsx` with single-screen layout.
- [x] Create `src/theme/colors.ts` with gradient tokens and palette.
- [x] Install `react-native-linear-gradient` (npm + pod install).

### 1.2 Header component
- [x] `src/components/Header.tsx` — full-width gradient bar (purple → pink), rounded bottom corners, "Multilingual Word Explorer" title centered in white.

### 1.3 Language chips
- [x] `src/components/LanguageChips.tsx` — single-select row (English / ไทย / 粵語).
- [x] Selected chip: gradient fill, white text, pill shape.
- [x] Inactive chip: light grey background, dark text, pill shape.
- [x] Tapping a chip switches selection; exactly one is active at all times.

### 1.4 Mic button
- [x] `src/components/MicButton.tsx` — large gradient circle, centered, dominant visual.
- [x] White microphone icon drawn with View components (no icon library dependency).
- [x] Subtle halo / shadow ring behind circle.
- [x] "Hold to speak a word" label below button.
- [x] `onPressIn` / `onPressOut` props connected to `HomeScreen` state.

### 1.5 Text input + submit
- [x] `src/components/TextInputWithSubmit.tsx` — pill-shaped input + circular gradient submit button.
- [x] Placeholder: "Or type a word...".
- [x] Submit button: gradient fill, white ↑ icon, circular.
- [x] Submitting non-empty input transitions to results state.

### 1.6 Settings button
- [x] `src/components/SettingsButton.tsx` — floating circular button, bottom-right, gear icon (⚙), neutral background.
- [x] Tapping opens settings modal.

### 1.7 Results state — Word summary card
- [x] `src/components/WordSummaryCard.tsx` — large rounded rect, light grey background, word in large uppercase text.
- [x] Positioned directly below header; full-width within content margins.

### 1.8 Results state — Translation blocks
- [x] `src/components/TranslationBlock.tsx` — white card, language label, translated word, circular gradient play button.
- [x] Three instances rendered: English, Thai, Cantonese.
- [x] Play button: gradient fill, white speaker icon drawn with Views.
- [ ] Only one audio plays at a time (requires Epic 5 — TTS).

### 1.9 Results state — Reset
- [x] "Listen to Another Word" gradient pill button below translation blocks.
- [x] Tapping resets `appState` to `idle` and clears input text.

### 1.10 Layout & state switching
- [x] Input controls (mic, text input, chips) hidden in results state.
- [x] Results content hidden in idle / recording state.
- [x] Settings button remains visible in both states (floating, fixed position).
- [x] Screen background: light lavender (`#F5F3FD`).
- [ ] Verify layout works on iPhone small (SE) and large (Pro Max) — needs Xcode build.

---

## Epic 2 — Push-to-talk STT

- [ ] Add mic permission handling (Info.plist key + runtime request).
- [ ] Integrate push-to-talk: `onPressIn` starts recording, `onPressOut` ends.
- [ ] Wire STT library; return transcript to `inputText`.
- [ ] Make transcript editable before lookup.
- [ ] AC: user never depends on auto end-detection.

---

## Epic 3 — Translation integration

- [ ] Define `Translator` interface in `src/services/translator.ts`.
- [ ] Implement backend call (server-side keys; no secrets in client).
- [ ] Map API response to `{english, thai, cantonese}` shape.
- [ ] Render real translations in the three `TranslationBlock` components.
- [ ] AC: translations render under each language header.

---

## Epic 4 — Image integration

- [ ] Define `ImageProvider` interface in `src/services/imageProvider.ts`.
- [ ] Implement Pexels lookup for the queried word.
- [ ] Render image in `WordSummaryCard` (replace placeholder text).
- [ ] Add fallback UI when no image is found.

---

## Epic 5 — Text-to-speech

- [ ] Define `SpeechSynthesizer` interface in `src/services/speech.ts`.
- [ ] Implement TTS per language (EN / TH / YUE).
- [ ] Wire play buttons in `TranslationBlock` to TTS playback.
- [ ] Enforce single-playback-at-a-time constraint.

---

## Epic 6 — Settings & multiple meanings

- [ ] Persist settings toggle (`disambiguate`) with AsyncStorage (or MMKV).
- [ ] Apply setting to lookup flow: prompt clarification vs. first result.
- [ ] Build disambiguation UI (show word-sense options before lookup).

---

## Epic 7 — Error handling polish

- [ ] Detect offline state; show appropriate message.
- [ ] Handle provider errors (STT, translation, image, TTS) with user-facing messages.
- [ ] Add retry affordance for failed lookups.

---

## Epic 8 — Testing & release hygiene

- [ ] Unit tests for `AppState` transitions in `HomeScreen`.
- [ ] Unit tests for `LanguageChips` single-select behaviour.
- [ ] Manual acceptance pass using `docs/ACCEPTANCE_TESTS.md`.
- [ ] Confirm no API keys or secrets are committed.
