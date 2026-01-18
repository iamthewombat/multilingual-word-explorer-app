# Acceptance tests (manual) — Native React Native app

Use this checklist for iPhone testing (Xcode-run builds). Keep it fast and practical.

## A. Install & permissions
- [ ] App builds and launches on device.
- [ ] On first mic use, iOS permission prompt appears.
- [ ] If mic permission is denied, app shows a clear message and a path to Settings.

## B. Push-to-talk recording
- [ ] Press-and-hold begins recording immediately (visible indicator + optional haptic).
- [ ] Release ends recording immediately.
- [ ] If the user taps (press too short) or stays silent, app shows “didn't catch that” and stays usable.
- [ ] Press-hold while already processing is blocked or cancels (decide behaviour; ensure no crash).

## C. Transcription & editing
- [ ] After recording, the recognized word is shown.
- [ ] User can tap and edit the recognized word.
- [ ] Submitting edited text triggers lookup without requiring recording.

## D. Results rendering (3 languages)
- [ ] English / Thai / Cantonese sections are visible on a single screen.
- [ ] Long words or phrases wrap without breaking layout.
- [ ] Each section has a one-tap “play” control.

## E. Image
- [ ] Exactly one image is shown for a successful lookup.
- [ ] If image fetch fails, the rest of the results still show.

## F. Audio pronunciation
- [ ] Tapping a language plays audio in that language.
- [ ] Starting a different language stops the previous one.
- [ ] Re-tapping stops playback (or restarts) consistently.

## G. Suggestions ("Did you mean")
- [ ] When transcription is low confidence or ambiguous, suggestions appear.
- [ ] Tapping a suggestion runs lookup for that word.

## H. Multiple meanings setting
- [ ] Settings contains: “For words with multiple meanings: Prompt for clarification (Default) / Show first result”.
- [ ] Default is Prompt for clarification.
- [ ] Switching setting changes behaviour on next lookup.

## I. Start over / reset
- [ ] Start over clears transcript, suggestions, results, and image.
- [ ] App returns to ready-to-record state.

## J. Error handling
- [ ] Network offline produces a friendly error + retry.
- [ ] Provider error does not crash; app remains usable.

## K. Performance smoke check
- [ ] Typical lookup feels responsive on home Wi‑Fi.
- [ ] No obvious UI freezes during recording or processing.
