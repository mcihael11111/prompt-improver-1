# Debug Report: Extension Still Generating AI Prompts Instead of Text Messages

**Date:** 2026-04-02
**Status:** Root cause identified

---

## The Problem

After all code changes, the extension still outputs AI prompts like:

> "You are a dating advisor tasked with helping someone plan a first date at a bar by the water..."

Instead of ready-to-send text messages like:

> "hey that sounds fun! friday works for me, what time were you thinking?"

---

## Root Cause

**The user is running the OLD "Prompt GPT" Chrome extension (v1.0.1), not the new "TextCoach" extension (v2.0.0).**

Two separate extensions exist:

| | Old Extension | New Extension |
|---|---|---|
| **Name** | Prompt GPT | TextCoach |
| **Version** | 1.0.1 | 2.0.0 |
| **Location** | `Chrome-extention/` | `textcoach/packages/chrome-extension/dist/` |
| **API URL** | `prompt-improver-eu1y.onrender.com` | `prompt-improver-1.onrender.com` |
| **Endpoints** | `/quickImprove`, `/guidedRefinement` | `/quick-suggest`, `/coach` |
| **System Prompt** | Generates AI prompts ("You are a...") | Generates text messages ("hey want to...") |
| **Output** | Single polished prompt | 2-4 text message options with reasoning |

The old extension calls `/guidedRefinement` which uses `SYSTEM_PROMPT_BASE` — this is the prompt engineering system that produces "You are a dating advisor..." outputs. It was designed to help users write better AI prompts, not text messages.

The new extension calls `/coach` which uses `SYSTEM_PROMPT_COACH` — this explicitly instructs the AI: "You are writing ACTUAL TEXT MESSAGES... NOT prompts. NOT templates. NOT formal writing."

---

## Verification

The new backend IS deployed and working correctly:

```
curl https://prompt-improver-1.onrender.com/health
→ {"status":"ok","version":"2.0.0"}
```

The new backend does NOT have the old endpoints (`/quickImprove`, `/guidedRefinement`). They are completely removed.

---

## Fix

### Step 1: Remove the old extension
1. Go to `chrome://extensions/`
2. Find **"Prompt GPT"** (v1.0.1) — click **Remove**
3. Confirm removal

### Step 2: Load the new extension
1. In `chrome://extensions/`, enable **Developer mode** (top right toggle)
2. Click **"Load unpacked"**
3. Navigate to: `PROMPT GPT/textcoach/packages/chrome-extension/dist/`
4. Click **Select Folder**
5. You should see **"TextCoach"** (v2.0.0) appear

### Step 3: Test
1. Go to any website (WhatsApp Web, Instagram, or any site)
2. Click the **TextCoach floating button** (purple "TC" circle)
3. Sign in with Google
4. Paste a conversation like:
   ```
   Them: hey what are you up to this weekend?
   You: not sure yet why?
   Them: was thinking we could grab wine at opra bar friday
   ```
5. Click **Quick Suggest**
6. You should see 2-4 text message options like:
   - "that sounds great! what time works for you?"
   - "I'm down, haven't been to opra in ages. 7ish?"
   - "yes! love that spot. friday works perfectly"
7. Each option should have a **"Why this works"** reasoning block

### Step 4: Test Coach Mode
1. Click **Coach Me** instead of Quick Suggest
2. It should ask 1-3 questions (not 5+):
   - "What's the situation?" (dating, friends, etc.)
   - "What do you want this reply to do?"
   - Maybe one more about tone
3. Then generate the same text message options with reasoning

---

## What Changed Between Old and New

### System Prompts

**Old (`SYSTEM_PROMPT_BASE`):**
```
You are an expert prompt engineer with 10 years of experience.
Your task is to expand the short prompt into a detailed, structured prompt...
The final improvedPrompt MUST contain at least 10 complete sentences.
Cover: AI role/persona, context, goals, tone, output format...
```

**New (`SYSTEM_PROMPT_COACH`):**
```
You are an expert communication coach.
You are writing ACTUAL TEXT MESSAGES that the user will copy-paste and send.
NOT prompts. NOT templates. NOT formal writing.
Keep it short and natural. Real people don't write paragraphs in texts.
Use contractions (I'm, don't, won't).
```

### Response Format

**Old:** Single `{ improvedPrompt: "You are a dating advisor..." }`

**New:**
```json
{
  "dynamics": {
    "interestLevel": "They're interested — they suggested a specific place",
    "tone": "Casual and warm",
    "patterns": "They're leading the planning, good sign",
    "subtext": "Suggesting a wine bar = they want something intimate"
  },
  "suggestions": [
    {
      "text": "that sounds great! what time were you thinking?",
      "toneLabel": "Direct & Warm",
      "reasoning": "Short and enthusiastic. Confirms interest without over-investing. Asking about time moves it forward.",
      "recommended": true
    },
    {
      "text": "I'm down, haven't been there in ages. friday works",
      "toneLabel": "Casual & Chill",
      "reasoning": "Adds a personal detail (been before) which builds familiarity. Casual tone matches their energy.",
      "recommended": false
    }
  ]
}
```

---

## Prevention

To avoid this confusion in the future:
1. The old `Chrome-extention/` folder should be archived or deleted
2. Only the `textcoach/packages/chrome-extension/dist/` folder should be loaded
3. The extension name is "TextCoach" not "Prompt GPT" — verify in chrome://extensions
