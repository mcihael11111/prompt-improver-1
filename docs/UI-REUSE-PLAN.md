# UI Reuse Plan: Keep Prompt GPT UI, Change Backend to TextCoach

## Overview

The old Prompt GPT Chrome extension has a polished, production-ready UI built in React 19 with Shadow DOM isolation. Rather than rebuilding the UI from scratch, we will **reuse the exact same UI** and only change:

1. The backend API endpoints it calls
2. The system prompts on the server
3. Minor copy/label changes
4. How results are displayed (multiple suggestions instead of one prompt)

---

## Current Prompt GPT UI — Complete Screen-by-Screen Breakdown

### Screen 1: Floating Button
- **Location:** Positioned near the chat input on supported sites, or as a draggable tab on the right edge for unsupported sites
- **Size:** 32x32px (supported sites), 56x46px (fallback tab)
- **Icon:** `Icon.svg` with hover (`Icon-hover.svg`) and active (`Icon-active.svg`) states
- **Behaviour:** Click opens the modal
- **CSS classes:** `#prompt-gpt-button`, `#prompt-gpt-fallback-container`
- **CHANGE:** None. Keep exactly as-is. Just rename IDs from `prompt-gpt-*` to `textcoach-*`.

### Screen 2: Modal Container
- **Size:** 500px wide (700px for upgrade screen)
- **Style:** White bg, 20px border radius, purple border, drop shadow
- **Header:** Logo ("Prompt GPT" text) + kebab menu + close button (X)
- **Footer:** "X prompts remaining" + "Unlock Unlimited With Pro" button
- **CSS classes:** `.app-container`, `.modal-container`, `.modal-header`, `.modal-footer`
- **CHANGES:**
  - Header logo text: "Prompt GPT" → "TextCoach"
  - Footer text: "X prompts remaining" → "X suggestions remaining"
  - Footer button: "Unlock Unlimited With Pro" → keep same or "Unlock more"

### Screen 3: Welcome Screen
- **Layout:** Purple card with padding, rounded corners
- **Title:** "Improve your prompt" (implied from welcome-title class)
- **Textarea:** 100% width, 146px height, placeholder "Enter your prompt here..."
- **Buttons row:** Two buttons side by side
  - "Improve Prompt" (primary, with lightning icon) → calls `/quickImprove`
  - "Guided Refinement" (secondary, with wand icon) → calls `/guidedRefinement`
- **Help section:** "Need help?" collapsible accordion with usage instructions
- **CSS classes:** `.welcome-container`, `.welcome-title`, `.manual-prompt-textarea`, `.welcome-buttons`, `.welcome-button`, `.need-help-container`
- **CHANGES:**
  - Title: "Improve your prompt" → "What did they say?"
  - Textarea placeholder: "Enter your prompt here..." → "Paste the conversation or their last message..."
  - Button 1: "Improve Prompt" → "Quick Suggest"
  - Button 2: "Guided Refinement" → "Coach Me"
  - Help section: Update copy to explain text coaching instead of prompt improvement
  - Textarea height: Keep 146px — works for pasting short conversations

### Screen 4: Question Screen (Guided Refinement → Coach Mode)
- **Layout:** Purple card with question text, options grid, back/next buttons
- **Progress:** "QUESTION X" in purple text (12px)
- **Question text:** 16px, 500 weight
- **Question types (9 total):**
  - `singleChoice` — radio pill buttons
  - `multipleChoice` — checkbox pill buttons
  - `yesNo` — radio pills with Yes/No
  - `freeText` — text input field
  - `rating` — 1-10 numbered circles with min/max labels
  - `scale` — slider with floating value display
  - `minMax` — dual slider range
  - `toneAndVoice` — pill options (same UI as singleChoice)
  - `structureAndFormatting` — pill options (same UI as singleChoice)
- **Buttons:** Back (secondary) + Next (primary)
- **CSS classes:** `.question-content`, `.question-header`, `.question-progress`, `.question-text`, `.options-grid`, `.radio-option`, `.rating-scale-container`, `.scale-container`, `.bottom-button-container`, `.next-button`
- **CHANGES:**
  - Keep ALL question type UIs exactly the same
  - The questions themselves change (set by the system prompt, not the UI)
  - Old questions: "What is the primary purpose?", "What output format?"
  - New questions: "What's the situation?", "What do you want this reply to do?", "How do you want to come across?"
  - Progress text: Keep "QUESTION X" format

### Screen 5: Loading Screen
- **Layout:** Skeleton shimmer loader
- **Style:** Purple gradient background, shimmer animation (1.5s infinite)
- **Elements:** Skeleton lines (18px tall bars) + skeleton block (110px)
- **CSS classes:** `.skeleton-container`, `.skeleton-line`, `.skeleton-block`, `.loading-container`
- **CHANGE:** None. Keep exactly as-is.

### Screen 6: Result Screen ⚠️ KEY CHANGE
- **Current layout:**
  - Single text area showing the improved prompt
  - Scrollable, max-height 328px, purple bg, purple scrollbar
  - Three buttons: Copy (secondary) + Insert (primary) + Retry (secondary, right-aligned)
- **CSS classes:** `.result-container`, `.prompt-text-area`, `.result-buttons`
- **CHANGES — This is the main UI change:**
  - **Current:** Shows ONE improved prompt in a single text area
  - **New:** Shows 2-4 suggestion cards, each with:
    - A tone badge (e.g. "Playful", "Direct & Warm")
    - The text message itself (in a purple bg box — reuse `.prompt-text-area` styling)
    - A "Why this works" reasoning section (collapsible)
    - A "Recommended" badge on the best option
    - A radio selector to pick which one to use
  - **New section above suggestions:** "Conversation Dynamics" card showing interest level, tone, patterns, subtext
  - Buttons change from: Copy + Insert + Retry → Copy Selected + Insert Selected + Try Again
  - **Approach:** Reuse the existing `.prompt-text-area` styling for each suggestion's text display. Add new `.suggestion-card` wrapper and `.dynamics-card`. The visual language (purple bg, rounded corners, scrollbar) stays identical.

### Screen 7: Error Screen
- **Layout:** Red border, red text, inline-block
- **Content:** Error icon + error message + details paragraph
- **CSS classes:** `.error-container`
- **CHANGE:** None. Keep exactly as-is.

### Screen 8: No Prompts Remaining
- **Layout:** Centered text
- **Title:** "No prompts remaining" (16px, 500 weight)
- **Description:** Usage limit explanation (14px, 400 weight)
- **CSS classes:** `.no-prompts-remaining`
- **CHANGES:**
  - Title: "No prompts remaining" → "No suggestions remaining"
  - Description: Update to reference suggestions, not prompts

### Screen 9: Upgrade Plan Screen
- **Layout:** 700px wide modal, two-column grid of plan cards
- **Back button** at top
- **Title:** "Upgrade Your Plan" (24px)
- **Plan cards:** Purple bg, feature lists with checkmarks, pricing options
  - Starter: "✓ up to 8 prompts per week" etc.
  - Pro: "Everything in starter plus:", "✓ Up to 100 prompts per month"
- **Pricing:** Price ($X.XX/mo), billing cycle, select button
- **Save badge:** Teal pill on yearly option ("Save 50%")
- **Stripe footer:** "Safe & secure checkout" + Stripe logo
- **CSS classes:** `.upgrade-plan-container`, `.plans-grid`, `.plan-card`, `.features-list`, `.pricing-option`, `.save-badge`, `.price`, `.period`, `.billing-cycle`, `.stripe-footer`
- **CHANGES:**
  - Feature text: "prompts per week" → "suggestions per week"
  - Feature text: "prompts per month" → "suggestions per month"
  - Keep all pricing, layout, and Stripe integration identical

### Screen 10: Popup (Extension popup when clicking toolbar icon)
- **Layout:** Simple menu with logo header
- **Header:** Logo icon + "Prompt GPT" text
- **Menu items:** Purple text, pill-shaped hover states
- **Content:** Account info, sign in/out, settings
- **CHANGES:**
  - Header text: "Prompt GPT" → "TextCoach"

---

## Complete Change Map

### Copy Changes Only (no UI/layout changes)

| Location | Current Text | New Text |
|----------|------------|----------|
| Modal header | "Prompt GPT" | "TextCoach" |
| Welcome title | "Improve your prompt" | "What did they say?" |
| Textarea placeholder | "Enter your prompt here..." | "Paste the conversation or their last message..." |
| Button 1 | "Improve Prompt" | "Quick Suggest" |
| Button 2 | "Guided Refinement" | "Coach Me" |
| Hint tooltip | "Click to refine your prompt" | "Click to coach your reply" |
| Footer | "X prompts remaining" | "X suggestions remaining" |
| No remaining title | "No prompts remaining" | "No suggestions remaining" |
| Upgrade features | "prompts per week/month" | "suggestions per week/month" |
| Popup header | "Prompt GPT" | "TextCoach" |
| Manifest name | "Prompt GPT" | "TextCoach" |
| Manifest description | "Improve your chat prompts" | "AI-powered conversation coaching" |
| Help section | Prompt improvement instructions | Text coaching instructions |
| Error text | "Error fetching remaining prompts" | "Error fetching remaining suggestions" |
| Unsupported site | "This site is not supported yet." | Keep same or "Open any messaging app to get started" |

### Backend Endpoint Changes

| Old Endpoint | New Endpoint | Change |
|---|---|---|
| `POST /quickImprove` | `POST /quick-suggest` | New system prompt, returns suggestions[] not improvedPrompt |
| `POST /guidedRefinement` | `POST /coach` | New system prompt, conversation-focused questions |
| `POST /answer` | `POST /answer` | Returns `{ done, suggestions[], dynamics }` not `{ improvedPrompt }` |
| `POST /undo-answer` | `POST /undo-answer` | No change |
| `GET /remaining-prompts` | `GET /remaining-prompts` | Path kept, response field renamed |

### UI Component Changes

| Component | Change Type | Details |
|---|---|---|
| Floating Button | None | Keep exactly as-is |
| Modal Container | Copy only | Logo text change |
| Modal Footer | Copy only | "prompts" → "suggestions" |
| Welcome Screen | Copy only | Title, placeholder, button labels |
| Question Screen | None | Questions change via system prompt, not UI code |
| All 9 Question Types | None | Identical UI, different questions from AI |
| Loading Screen | None | Keep exactly as-is |
| Error Screen | None | Keep exactly as-is |
| Upgrade Screen | Copy only | "prompts" → "suggestions" in features |
| Popup | Copy only | "Prompt GPT" → "TextCoach" |
| **Result Screen** | **STRUCTURAL** | **New: multiple suggestion cards with reasoning instead of single prompt textarea** |

### The One Structural UI Change: Result Screen

**Current result screen:**
```
┌──────────────────────────────────────┐
│  ┌──────────────────────────────────┐│
│  │                                  ││
│  │  You are a dating advisor        ││
│  │  tasked with helping someone     ││
│  │  plan a first date at a bar...   ││
│  │                                  ││
│  │  (single scrollable text area)   ││
│  │                                  ││
│  └──────────────────────────────────┘│
│                                      │
│  [Copy]  [Insert]           [Retry]  │
└──────────────────────────────────────┘
```

**New result screen (keep same visual style):**
```
┌──────────────────────────────────────┐
│  Conversation Dynamics               │
│  ┌──────────────────────────────────┐│
│  │ Interest: They're engaged       ││
│  │ Tone: Casual and warm           ││
│  │ Pattern: Balanced messages      ││
│  │ Subtext: Suggesting a date      ││
│  └──────────────────────────────────┘│
│                                      │
│  ● Option 1 — Playful    [★ Best]   │
│  ┌──────────────────────────────────┐│
│  │ "that sounds great! what time   ││
│  │  were you thinking?"            ││
│  └──────────────────────────────────┘│
│  ▸ Why this works                    │
│                                      │
│  ○ Option 2 — Direct & Warm         │
│  ┌──────────────────────────────────┐│
│  │ "I'm down, friday works. 7ish?" ││
│  └──────────────────────────────────┘│
│  ▸ Why this works                    │
│                                      │
│  [Copy Selected] [Insert]  [Retry]   │
└──────────────────────────────────────┘
```

**Key styling reuse:**
- Each suggestion text uses the SAME `.prompt-text-area` purple background styling
- Radio selectors use the SAME `.radio-option` pill styling from question screen
- "Why this works" uses a collapsible section (like the "Need help?" accordion)
- Dynamics card uses the SAME `.question-content` purple card styling
- Buttons keep the SAME `.result-buttons` layout

---

## Development Plan

### Phase 1: Fork the Old Extension (Don't Rebuild)

Instead of using the rebuilt textcoach extension, **copy the old compiled extension and modify it in-place.** This preserves the exact UI.

1. Copy `Chrome-extention/` to `textcoach/packages/chrome-extension-v2/`
2. This gives us the working compiled UI as a starting point
3. Modify only what needs to change

### Phase 2: Backend Changes (Already Done)

The new backend at `prompt-improver-1.onrender.com` already has:
- ✅ `/quick-suggest` with text message system prompt
- ✅ `/coach` with coaching system prompt  
- ✅ `/answer` with unwrapped response format
- ✅ Conversation dynamics in response
- ✅ Multiple suggestions with reasoning

### Phase 3: Modify the Compiled Extension

Since the old extension is compiled (bundled Vite output), we can't edit React components directly. Two approaches:

**Approach A: Modify the compiled bundle (quick and dirty)**
- Use find-and-replace on the compiled JS to change:
  - API endpoint paths (`/quickImprove` → `/quick-suggest`, `/guidedRefinement` → `/coach`)
  - API URL (`prompt-improver-eu1y.onrender.com` → `prompt-improver-1.onrender.com`)
  - Copy text ("Prompt GPT" → "TextCoach", etc.)
  - Response handling (`improvedPrompt` → `suggestions`)
- **Pro:** Fastest, preserves exact UI pixel-for-pixel
- **Con:** Fragile, hard to maintain, can't add new components (dynamics card, suggestion cards)

**Approach B: Get the React source code from Stefan (BEST)**
- Ask Stefan for the original Vite source project
- Make the copy changes in proper React components
- Add the new ResultScreen with suggestion cards
- Rebuild with Vite
- **Pro:** Maintainable, can add new UI for suggestions
- **Con:** Depends on Stefan providing the source

**Approach C: Rebuild the result screen only in the new textcoach extension**
- Keep the rebuilt textcoach extension (which has the same design tokens, fonts, and styling)
- But copy the EXACT CSS from the old `content.css` (all 1237 lines) 
- Match every class name and layout exactly
- Only build the new result screen components
- **Pro:** Maintainable, matches the UI
- **Con:** More work to match pixel-perfect

### Recommended: Approach A for immediate fix, then Approach B/C for long-term

**Immediate (Approach A):**
1. Copy `Chrome-extention/` to working directory
2. Find-replace in compiled JS:
   - API URL
   - Endpoint paths
   - Copy text changes
3. Modify result display to handle suggestions array
4. Load modified extension and test

**Long-term (Approach B or C):**
1. Get source from Stefan OR use the rebuilt textcoach extension
2. Port the exact CSS from old extension
3. Build proper suggestion cards component
4. Full testing and Chrome Web Store submission

---

## Files to Modify (Approach A — Compiled Bundle)

### `manifest.json`
```diff
- "name": "Prompt GPT",
+ "name": "TextCoach",
- "description": "Improve your chat prompts",
+ "description": "AI-powered conversation coaching",
- "host_permissions": ["https://prompt-improver-eu1y.onrender.com/*"],
+ "host_permissions": ["https://prompt-improver-1.onrender.com/*"],
- "default_title": "Prompt GPT",
+ "default_title": "TextCoach",
```

### `background.js`
```diff
- API_URL: "https://prompt-improver-eu1y.onrender.com"
+ API_URL: "https://prompt-improver-1.onrender.com"
```

### `contentScript.js`
```diff
Copy changes:
- "Prompt GPT" → "TextCoach"
- "Enter your prompt here..." → "Paste the conversation or their last message..."
- "Improve Prompt" → "Quick Suggest"  
- "Guided Refinement" → "Coach Me"
- "prompts remaining" → "suggestions remaining"
- "No prompts remaining" → "No suggestions remaining"
- "prompts per week" → "suggestions per week"
- "prompts per month" → "suggestions per month"

Endpoint changes:
- "/quickImprove" → "/quick-suggest"
- "/guidedRefinement" → "/coach"

Response handling:
- Handle `suggestions[]` array instead of single `improvedPrompt` string
- Display each suggestion as a separate text block
- Show dynamics analysis above suggestions
```

### `content.css`
No changes needed — the CSS is reusable as-is.

### `popup.html`
```diff
- <title>Prompt GPT</title>
+ <title>TextCoach</title>
```

### `popup.js`
```diff
- "Prompt GPT" → "TextCoach"
```
