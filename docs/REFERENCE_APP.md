# Reference behaviour (current web app)

This document captures the current **behavioural reference** for the native React Native app.

Reference implementation:
- Live site: https://multilingual-word-explorer.vercel.app/
- Repo README: describes overall features and existing API approach

## UI copy / affordances (observed on live site)
- Header shows: **English ไทย 粤語**
- Primary prompt: **Tap to speak a word**
- If no speech detected: **Didn't catch that. Please try again or type the word:**
- A sample typed word appears in the input: **Go**
- There is a **Did you mean:** suggestions section
- Results sections are present for:
  - **English**
  - **Thai**
  - **Cantonese**
- Reset action: **Listen to Another Word**
- Settings sheet:
  - Title: **Settings**
  - Setting: **For words with multiple meanings:**
    - **Prompt for clarification (Default)**
    - **Show first result**
  - Buttons: **Close**, **OK**
- Loading state: **Processing...**

## Behavioural expectations to preserve
1) Single-screen results layout for the three language sections.
2) A simple “start over” action that clears results and returns to ready state.
3) A setting that controls multiple-meaning handling:
   - Prompt: show choices to the user.
   - First result: auto-select.
4) “Did you mean” suggestions appear when the recognized word is uncertain or ambiguous.

## Behaviour changes for native app
These are intentional differences from the web app:
- Speech capture is **push-to-talk (hold/release)** instead of automatic start/stop detection.
- Native app supports **typed input** explicitly as a first-class option.

## Screens (native)
- Home / Lookup (single screen):
  - push-to-talk control
  - typed input
  - suggestions
  - results blocks (EN/TH/CA)
  - image
  - play pronunciation
  - settings access
