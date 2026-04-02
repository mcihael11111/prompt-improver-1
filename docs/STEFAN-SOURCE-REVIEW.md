# Stefan's Source Code Review & Integration Plan

## What We Got

Stefan provided the original React/Vite source project at `prompt-gpt-chrome-extension-main/`. This is the pre-compiled source code for the Prompt GPT Chrome extension — proper component separation, TypeScript, build configs, everything.

---

## Source Code Structure

```
prompt-gpt-chrome-extension-main/
├── package.json                    # React 19.1, Vite 6.2, Supabase 2.75, TypeScript 5.8
├── tsconfig.json
├── manifest.json
├── popup.html
├── src/
│   ├── App.tsx                     # Main orchestrator (450 lines) — all state + flows
│   ├── PromptGPTModal.tsx          # Screen router (welcome/question/result/upgrade/error)
│   ├── Welcome.tsx                 # Landing screen: textarea + 2 buttons
│   ├── Question.tsx                # Question dispatcher → delegates to type components
│   ├── SingleChoiceQuestion.tsx    # Radio pills with "Other" support
│   ├── MultipleChoiceQuestion.tsx  # Checkbox pills
│   ├── RatingQuestion.tsx          # 1-10 circles with labels
│   ├── ScaleQuestion.tsx           # Slider with floating value
│   ├── MinMaxQuestion.tsx          # Dual slider range
│   ├── FreeTextQuestion.tsx        # Text input (100 char max)
│   ├── Result.tsx                  # Shows final result + Copy/Insert/Retry
│   ├── ModalHeader.tsx             # Logo + kebab menu + close button
│   ├── ModalFooter.tsx             # "X free prompts remaining" + unlock button
│   ├── UpgradePlan.tsx             # 3-tier pricing (Free/Starter/Pro)
│   ├── NoPromptsRemaining.tsx      # Limit reached screen
│   ├── ErrorDisplay.tsx            # Error with icon + retry
│   ├── Loading.tsx                 # Skeleton shimmer loader
│   ├── Logo.tsx                    # Purple gradient spark SVG
│   ├── contentScript.tsx           # DOM injection + button + modal (536 lines)
│   ├── background.tsx              # Service worker: API calls, auth, messaging (311 lines)
│   ├── popup.tsx                   # Extension popup menu (98 lines)
│   ├── user-auth.tsx               # Supabase Google OAuth (250+ lines)
│   ├── config.ts                   # Dev/prod API URLs + Supabase keys
│   ├── content.css                 # All Shadow DOM styles (1000+ lines)
│   └── siteAdapters/
│       ├── types.ts                # SiteAdapter interface
│       ├── registry.ts             # Adapter lookup
│       ├── index.ts                # Exports
│       ├── utils.ts                # Helpers
│       ├── chatgpt.ts              # ChatGPT selectors
│       ├── claude.ts               # Claude selectors
│       ├── gemini.ts               # Gemini selectors
│       ├── perplexity.ts           # Perplexity selectors
│       ├── copilot.ts              # Microsoft Copilot selectors
│       ├── midjourney.ts           # Midjourney selectors
│       ├── leonardo.ts             # Leonardo.ai selectors
│       ├── githubCopilot.ts        # GitHub Copilot selectors
│       ├── meta.ts                 # Meta AI selectors
│       ├── canva.ts                # Canva selectors
│       └── figma-make.ts           # Figma Make selectors
├── vite.config.ts                  # Main build (copies static files)
├── vite.background.config.ts       # Background worker build
├── vite.contentScript.config.ts    # Content script build (IIFE)
├── vite.popup.config.ts            # Popup build
└── fonts/ + images/                # Assets
```

---

## Key Findings

### 1. Clean Architecture
The code is well-structured with clear separation:
- **App.tsx** is the state machine — manages screen transitions, API calls, error handling
- **PromptGPTModal.tsx** is the screen router — renders the right component based on `screen` state
- Each question type is its own component with consistent props
- Site adapters are modular — easy to add/remove sites

### 2. API Contract (What the UI Expects)

The UI currently expects these response shapes from the backend:

**Start guided refinement:**
```json
{ "type": "question", "content": { "question": "...", "questionType": "singleChoice", "options": [...] }, "conversationId": "..." }
```

**Answer a question:**
```json
{ "type": "question", "content": { "question": "...", "questionType": "..." } }
// OR when done:
{ "type": "improvedPrompt", "content": { "improvedPrompt": "the result text" } }
```

**Quick improve:**
```json
{ "type": "improvedPrompt", "content": { "improvedPrompt": "the result text" }, "remainingPrompts": 5 }
```

### 3. Result Screen (Result.tsx)
Currently displays a single string (`improvedPrompt`) in a scrollable text area. This is where the biggest change is needed — we need to show multiple suggestion cards instead.

### 4. Site Adapters
All 11 current adapters target AI chat sites (ChatGPT, Claude, etc.). For TextCoach, these need to be replaced with messaging site adapters (WhatsApp Web, Instagram, LinkedIn, etc.). The adapter interface (`SiteAdapter`) is perfect for this — just swap the implementations.

### 5. Auth System
Uses Supabase with anonymous signup + optional Google link. This is reusable as-is for TextCoach.

---

## Three Approaches to Implement

### Approach A: Fork & Modify Stefan's Source (RECOMMENDED)

**What:** Copy Stefan's source into the textcoach monorepo. Make targeted changes to ~6 files. Rebuild with Vite.

**Changes needed:**

| File | Change | Effort |
|------|--------|--------|
| `config.ts` | API URL → `prompt-improver-1.onrender.com` | 1 min |
| `manifest.json` | Name, description, host_permissions | 1 min |
| `background.tsx` | Endpoint paths: `/quickImprove` → `/quick-suggest`, `/guidedRefinement` → `/coach` | 5 min |
| `App.tsx` | Handle new response shape: `suggestions[]` instead of `improvedPrompt` | 30 min |
| `Result.tsx` | Replace single text area with suggestion cards + dynamics card | 2 hours |
| `Welcome.tsx` | Copy changes: title, placeholder, button labels | 10 min |
| `ModalFooter.tsx` | "prompts" → "suggestions" | 2 min |
| `NoPromptsRemaining.tsx` | "prompts" → "suggestions" | 2 min |
| `ModalHeader.tsx` | "Prompt GPT" → "TextCoach" | 2 min |
| `popup.tsx` | "Prompt GPT" → "TextCoach" | 2 min |
| `content.css` | Add styles for suggestion cards + dynamics card | 30 min |
| `siteAdapters/*` | Replace AI site adapters with messaging site adapters | 1 hour |

**Total effort:** ~4-5 hours

**Pros:**
- Preserves the EXACT UI that's already working and polished
- Smallest possible diff — only change what's needed
- All edge cases, keyboard handling, focus management already working
- Vite build system ready to go
- Auth system works out of the box

**Cons:**
- Still uses the old file naming conventions (PromptGPTModal, etc.)
- Duplicates some code that exists in the textcoach monorepo

---

### Approach B: Merge Into Textcoach Monorepo

**What:** Take Stefan's source, move it into `textcoach/packages/chrome-extension/src/`, rename files to match TextCoach naming, and integrate with the shared package.

**Changes needed:**
- Everything from Approach A, plus:
- Rename all files (PromptGPTModal → TextCoachModal, etc.)
- Update all imports
- Replace `config.ts` with the monorepo's shared config
- Import types from `@textcoach/shared`
- Update Vite configs to work within monorepo

**Total effort:** 1-2 days

**Pros:**
- Clean monorepo structure
- Shared types between backend and extension
- Professional codebase for long-term maintenance

**Cons:**
- More work upfront
- Risk of introducing bugs during the rename/restructure
- The rebuilt extension in the monorepo already exists (150+ files) — creates duplication

---

### Approach C: Hybrid — Stefan's Source + TextCoach Overlay

**What:** Use Stefan's source as-is for the base UI. Only replace `Result.tsx` and `background.tsx` with new TextCoach versions. Add new components (DynamicsCard, SuggestionCard) alongside existing ones.

**Changes needed:**
- Copy Stefan's source to `textcoach/packages/chrome-extension-fork/`
- Replace `background.tsx` with version that calls new endpoints
- Replace `Result.tsx` with new multi-suggestion version
- Add `DynamicsCard.tsx`, `SuggestionCard.tsx`, `ReasoningBlock.tsx`
- Minimal copy changes in existing components
- Keep everything else identical

**Total effort:** ~6-8 hours

**Pros:**
- Cleanest separation: old UI untouched, new functionality added
- Easy to compare old vs new
- Can fall back to old behaviour if needed

**Cons:**
- Two codebases to maintain (Stefan's + overlay)
- Import paths might be awkward

---

## Recommendation: Approach A (Fork & Modify)

This is the fastest path to a working product:

1. Copy Stefan's source into the monorepo
2. Change 10 files (mostly copy changes, 2 real code changes)
3. Build with existing Vite config
4. Load in Chrome and test

The two real code changes are:
- **`App.tsx`** — handle `suggestions[]` response instead of `improvedPrompt`
- **`Result.tsx`** — show multiple suggestion cards instead of single text area

Everything else is copy/label find-and-replace.

---

## What Stays Exactly the Same

- Floating button (position, size, icon, hover/active states)
- Modal container (500px, rounded corners, shadow, border)
- Modal header (logo layout, menu, close button)
- Welcome screen layout (purple card, textarea, 2 buttons)
- ALL 9 question type UIs (pills, ratings, sliders, text input)
- Loading skeleton (shimmer animation)
- Error display (red border, icon, retry)
- Upgrade plan screen (3-tier pricing, Stripe integration)
- No prompts remaining screen
- Shadow DOM isolation
- Keyboard handling (Enter to submit, focus trapping)
- Auth flow (Supabase Google OAuth)
- CSS design system (all colours, fonts, spacing, components)

---

## What Changes

| Area | Old (Prompt GPT) | New (TextCoach) |
|------|-------------------|-----------------|
| **Product name** | "Prompt GPT" | "TextCoach" |
| **Welcome title** | "How would you like to refine this prompt?" | "What did they say?" |
| **Textarea placeholder** | "Enter your prompt here..." | "Paste the conversation or their last message..." |
| **Button 1** | "Improve Prompt" (lightning icon) | "Quick Suggest" |
| **Button 2** | "Guided Refinement" (sliders icon) | "Coach Me" |
| **Manual mode title** | "WRITE YOUR FIRST DRAFT" | "PASTE THE CONVERSATION" |
| **Manual mode subtitle** | "Start with your rough idea..." | "Paste the messages you want to reply to..." |
| **Footer** | "X free prompts remaining" | "X suggestions remaining" |
| **Upgrade features** | "8 prompts per week" | "5 suggestions per week" |
| **Result screen** | Single improved prompt | Multiple suggestion cards with reasoning |
| **API endpoints** | /quickImprove, /guidedRefinement | /quick-suggest, /coach |
| **Site adapters** | AI chat sites (ChatGPT, Claude...) | Messaging sites (WhatsApp, Instagram...) |
| **Questions asked** | About prompt structure/format | About relationship, goal, tone |
| **Output** | "You are a dating advisor..." | "hey that sounds great! what time?" |
