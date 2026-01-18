# Tech spec — Native app (React Native)

## 1) Goal
Build a native mobile app (starting with iOS) that matches `docs/PRD.md` and `docs/REFERENCE_APP.md`.

## 2) Stack choices
- React Native (TypeScript)
- Navigation: React Navigation
- State: local component state for MVP; upgrade to a store (Zustand/Redux) only if complexity demands
- Networking: fetch (or axios) with a thin wrapper

## 3) Project layout (within this repo)
Recommended:
```
/ios-app/                 # React Native app root (to be created)
/docs/
  PRD.md
  REFERENCE_APP.md
  ACCEPTANCE_TESTS.md
  TECH_SPEC.md
CLAUDE.md
```

## 4) Capability interfaces
Keep external providers swappable by using four simple interfaces:

- `SpeechRecognizer`: push-to-talk → text
- `Translator`: text → { en, th, yue }
- `ImageProvider`: text → image URL
- `SpeechSynthesizer`: text + locale/voice → audio playback

### Suggested implementations (MVP)
- Speech-to-text: iOS Speech framework via an RN bridge (e.g., `react-native-voice`) or a small custom native module.
- Text-to-speech: iOS AVSpeechSynthesizer via an RN library (e.g., `react-native-tts`) or a small custom native module.
- Images: Pexels REST API.
- Translation: start with existing server-side Google Translation endpoint (recommended to avoid shipping secrets); keep the client calling your own backend.

## 5) Backend strategy
Avoid embedding long-lived API keys in the app bundle.

Preferred:
- Reuse the existing server / Vercel functions in this repo for translation (and anything secret).
- The mobile app calls:
  - `/api/translate?word=...`
  - `/api/image?word=...` (if you choose to keep image server-side)
  - etc.

## 6) Key UX flows
### Push-to-talk
- On press: start recording + show recording state.
- On release: stop recording → transcribe → show transcript (editable).

### Typed input
- Allow entering a word and running lookup immediately.

### Results
- Show EN/TH/YUE sections on one screen.
- Show one image.
- Provide tap-to-speak per language.

## 7) Testing
- Unit tests for:
  - translation mapping logic
  - UI state transitions (idle → recording → processing → results → idle)
- Manual acceptance tests are in `docs/ACCEPTANCE_TESTS.md`.

## 8) Bootstrapping the RN app (commands)
Run these locally (not in Claude Code) once per machine:

1) From repo root:
```bash
npx react-native@latest init WordExplorer --template react-native-template-typescript
mv WordExplorer ios-app
cd ios-app
npm install
```

2) iOS dependencies:
```bash
cd ios
pod install
cd ..
```

3) Run on device:
```bash
npx react-native run-ios --device
```

Claude Code can then implement features inside `ios-app/`.
