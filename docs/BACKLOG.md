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
- [x] Only one audio plays at a time (implemented in Epic 5 — TTS).

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

- [x] Add mic permission handling (Info.plist keys: NSMicrophoneUsageDescription + NSSpeechRecognitionUsageDescription).
- [x] Integrate push-to-talk: `onPressIn` starts recording, `onPressOut` ends.
- [x] Wire `@react-native-voice/voice` STT; return transcript to `inputText`.
- [x] Make transcript editable before lookup (transcript lands in text input; user submits manually).
- [x] AC: user never depends on auto end-detection.
- [x] `MicState` ('idle' | 'recording' | 'transcribing') with visual label + spinner.
- [x] Short haptic on press-in via `Vibration.vibrate(30)`.
- [x] Inline error message (auto-clears after 4 s); permission errors surface an Alert.
- [x] Unit tests: `NativeVoiceRecognizer.test.ts` (7 tests), `LanguageChips.test.tsx` (7 tests), `App.test.tsx`.

---

## Epic 3 — Translation integration

### 3.1 Service layer
- [x] Define `Translator` interface + `TranslationResult` type in `src/services/translator.ts`.
- [x] Create `src/config/env.ts` (gitignored) with `GOOGLE_TRANSLATE_API_KEY` placeholder.
- [x] Implement `GoogleTranslator` in `src/services/GoogleTranslator.ts`:
  - Calls Google Cloud Translation v2 API (`translation.googleapis.com`).
  - Translates the input word to `en`, `th`, and `zh-TW` (Traditional Chinese / Cantonese proxy) in parallel.
  - Throws a descriptive error on non-OK HTTP responses.

### 3.2 HomeScreen integration
- [x] Add `'looking-up'` to `AppState` (`'idle' | 'recording' | 'transcribing' | 'looking-up' | 'results'`).
- [x] Add `translationResult` state (`TranslationResult | null`).
- [x] `handleLookup` now calls `translator.translate(word)`, transitions through `'looking-up'` → `'results'`.
- [x] Loading UI: show `WordSummaryCard` (word visible) + `ActivityIndicator` placeholder while fetching.
- [x] Replace hard-coded `PLACEHOLDER_RESULTS` with real `translationResult` values.
- [x] On translation error: show inline error, revert to `'idle'`.

### 3.3 AC
- [ ] Typing "dog" and submitting shows correct English / Thai / Cantonese translations.
- [ ] A loading indicator is visible while the API call is in flight.
- [ ] Missing or empty API key shows a clear developer error (not a silent crash).

---

## Epic 4 — Image integration

- [x] Define `ImageProvider` interface in `src/services/imageProvider.ts`.
- [x] Implement Pexels lookup for the queried word (`PexelsImageProvider`).
- [x] Render image in `WordSummaryCard` (above word text, with loading state).
- [x] Add fallback UI when no image is found (text-only layout, graceful degradation).
- [x] Wire image lookup in parallel with translation in `HomeScreen.handleLookup`.
- [x] Unit tests for `PexelsImageProvider` (7 tests).

---

## Epic 5 — Text-to-speech

- [x] Define `SpeechSynthesizer` interface in `src/services/speechSynthesizer.ts`.
- [x] Implement `NativeSpeechSynthesizer` using `react-native-tts` (EN / TH / YUE via locale mapping).
- [x] Wire play buttons in `TranslationBlock` to TTS playback via `HomeScreen.handlePlay`.
- [x] Enforce single-playback-at-a-time constraint (stop current before starting new; toggle off if same language tapped).
- [x] Visual feedback: play button shows stop icon (■) and reduced opacity while playing.
- [x] Unit tests for `NativeSpeechSynthesizer` (8 tests).

---

## ~~Epic 6 — Settings & multiple meanings~~ *(removed — prompt field makes this unnecessary)*

---

## Epic 6 — Error handling polish

- [x] Detect offline state with `@react-native-community/netinfo`; block mic/submit and show "No internet connection" message.
- [x] Handle provider errors (STT, translation, image, TTS) with user-facing messages — TTS now shows "Audio playback failed." on error.
- [x] Add retry affordance for failed lookups (Retry button appears alongside error, clears on new interaction).
- [x] Tests: HomeScreen offline detection + retry button (4 tests in `__tests__/HomeScreen.test.tsx`).

---

## Epic 7 — Testing & release hygiene

- [x] Unit tests for `AppState` transitions in `HomeScreen` (4 tests: idle→looking-up→results, results→idle, idle→recording, submit guard).
- [x] Unit tests for `LanguageChips` single-select behaviour (1 test: gradient on selected chip, inactive bg on others).
- [x] Manual acceptance pass using `docs/ACCEPTANCE_TESTS.md` — sections G/H marked N/A (features removed from scope).
- [x] Confirm no API keys or secrets are committed.
