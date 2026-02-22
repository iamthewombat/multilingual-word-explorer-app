# UI Spec – Home Screen (v1)

This document defines the visual and layout intent for the Home screen.
The goal is to visually match the Figma reference and existing web design,
while using native React Native components.

Screenshots:
- docs/images/ui-home-idle.png
- docs/images/ui-home-typed.png
- docs/images/ui-results.png
---

## 1. Overall Layout

- Single scrollable screen
- All primary elements are center-aligned horizontally
- Layout is vertically stacked and symmetrical
- Generous vertical spacing; no dense clustering

Vertical order:
1. Gradient header
2. Language chips row
3. Mic button
4. Instruction label
5. Text input + submit
6. (Later) results
7. Floating settings button (bottom-right)

---

## 2. Header

- Full-width horizontal bar at top
- Rounded bottom corners
- Background: horizontal gradient (purple → pink)
- Text: "Multilingual Word Explorer"
- Text color: white
- Text centered both horizontally and vertically

Header is decorative and branding-focused; no interaction.

---

## 3. Language Chips (Single-select)

Purpose:
- Single-select control: exactly one language is active at a time.

State rules:
- Exactly ONE chip is selected at all times.
- The other chips are inactive (not selected).
- Inactive chips are still tappable (tap switches selection), but they appear visually “disabled”.

Visual style:
Selected chip:
- Pill shape
- Gradient fill (purple → pink family, matching header/mic)
- White label text
- Slight elevation/shadow

Inactive chip:
- Pill shape
- Light neutral background (soft grey)
- Dark label text
- Minimal/no shadow

Interaction:
- Tapping an inactive chip selects it and deselects the previously-selected chip.
- Never show multiple selected chips simultaneously.

Layout:
- Horizontal row
- Centered horizontally on screen
- Positioned above the mic button
- Equal spacing between chips

Text:
- English
- ไทย
- 粵語

Constraints:
- Chips should feel grouped as a single control
- Do not left-align or stretch full width

---

## 4. Mic Button (Primary Action)

Purpose: primary interaction on the screen

Layout:
- Perfect circle
- Centered horizontally
- Largest visual element on screen

Visual style:
- Gradient fill (same palette as header)
- White microphone icon centered inside
- Soft shadow / elevation for depth

Interaction:
- Label text below: "Hold to speak a word"
- Label centered horizontally
- Label is secondary to button (lower visual weight)

The mic button must clearly dominate the screen visually.

---

## 5. Text Input + Submit

Purpose: secondary input method

Layout:
- Centered horizontally
- Positioned below mic button and label
- Input and submit form a single visual unit

Input:
- Rounded pill shape
- Placeholder: "Or type a word..."
- Text centered vertically
- Width is constrained (not edge-to-edge)

Submit button:
- Circular
- Positioned to the right of input
- Icon-based (arrow up)
- Uses same gradient as mic/header

This section must feel optional, not competing with the mic button.

---

## 6. Settings Button

Purpose: access advanced options

Layout:
- Floating button
- Bottom-right corner
- Detached from main vertical flow

Visual style:
- Circular
- Neutral background
- Gear icon

Low visual priority relative to mic button.

---

## 7. General UI Rules

- Prefer centered alignment over edge alignment
- Avoid hard-coded magic numbers; use theme tokens
- Reusable components should be extracted where obvious:
  - Header
  - LanguageChips
  - MicButton
  - TextInputWithSubmit
- No behavioral logic changes as part of UI refactor


---

## 8. Results State (Home Screen)

The Results state reuses the Home screen container and header.
No navigation occurs; this is a conditional render based on lookup completion.

---

## 8.1 Word Summary Card

Purpose:
- Show the looked-up word as a image
- Visually anchor the image
- Signal completion of input phase

Layout:
- Large rounded rectangle
- Centered horizontally
- Positioned directly below the header
- Full-width within content margins

Visual style:
- Light neutral background (slightly darker than page background)
- Subtle gradient or soft shadow
- Large, uppercase word centered vertically and horizontally

Image:
- This section will show the queried word as an image (the word cow in the png is just a placeholder)
- It will render the picture in the space provided

---

## 8.2 Translation Result Blocks

Purpose:
- Present translations for each language equally
- Allow independent audio playback

Languages:
- English
- Thai
- Cantonese

Layout:
- Vertical stack
- Full-width cards within content margins
- Equal spacing between cards
- All cards visually equal in weight

Each card contains:
- Language label (small, subdued)
- Translated word (primary text)
- Play audio button aligned to the right

Visual style:
- White background
- Rounded corners
- Subtle elevation/shadow
- Clear separation from background

Play button:
- Circular
- Gradient fill matching primary palette
- White speaker icon
- Positioned vertically centered in the card

Constraints:
- Only one audio may play at a time
- Play button is the only interactive element within the card

---

## 8.3 Primary Action: Reset

Button text:
- "Listen to Another Word"

Purpose:
- Reset the flow back to the input state

Layout:
- Centered horizontally
- Positioned below translation blocks
- Clearly separated from content above

Visual style:
- Large pill-shaped button
- Gradient background (same palette as header/mic)
- White text
- Visually dominant relative to secondary elements

This is the primary action on the Results state.

---

## 8.4 Settings Button

- Remains visible in bottom-right corner
- Same appearance and behavior as input state
- Does not shift position between states

---

## 8.5 General Results State Rules

- Input controls (mic, text input, suggestions) are hidden
- Results content scrolls if vertical space is constrained
- Layout must feel calm and readable, not dense
- Visual hierarchy:
  1. Word summary card
  2. Translation blocks
  3. Reset button