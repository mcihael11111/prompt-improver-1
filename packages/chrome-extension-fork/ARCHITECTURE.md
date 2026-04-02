# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Chrome Extension                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────┐         ┌──────────────────┐            │
│  │ contentScript  │────────▶│   App.tsx        │            │
│  │                │         │   (React)        │            │
│  │ - Inject UI    │         │   - Main Logic   │            │
│  │ - Monitor DOM  │         │   - API Calls    │            │
│  └────────┬───────┘         └────────┬─────────┘            │
│           │                          │                       │
│           │                          │                       │
│           └──────────┬───────────────┘                       │
│                      │                                       │
│           ┌──────────▼─────────────┐                         │
│           │   Site Adapter System  │                         │
│           └────────────────────────┘                         │
│                      │                                       │
│      ┌───────────────┼───────────────┐                       │
│      │               │               │                       │
│  ┌───▼───┐      ┌───▼───┐      ┌───▼───┐                    │
│  │Registry│      │Utils  │      │Types  │                    │
│  │       │      │       │      │       │                    │
│  └───┬───┘      └───────┘      └───────┘                    │
│      │                                                       │
│      │ Manages                                               │
│      │                                                       │
│  ┌───▼────────────────────────────────────────────┐          │
│  │           Site Adapters (11)                   │          │
│  ├────────────────────────────────────────────────┤          │
│  │  • chatgpt.ts     • copilot.ts   • meta.ts    │          │
│  │  • gemini.ts      • midjourney   • figma.ts   │          │
│  │  • canva.ts       • leonardo.ts                │          │
│  │  • claude.ts      • github-copilot.ts          │          │
│  │  • perplexity.ts                               │          │
│  └────────────────────────────────────────────────┘          │
│           │                                                  │
│           │ Adapters provide site-specific:                 │
│           │ - DOM selectors                                 │
│           │ - Text get/set methods                          │
│           │ - Injection points                              │
│           │                                                  │
└───────────┼──────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────┐
│                    Target Websites                            │
├───────────────────────────────────────────────────────────────┤
│  ChatGPT  │  Gemini  │  Canva  │  Claude  │  Perplexity ...  │
└───────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Extension Injection
```
contentScript.tsx
    │
    ├─▶ getCurrentSiteAdapter()
    │       │
    │       └─▶ registry.ts → Finds matching adapter
    │
    ├─▶ adapter.getInjectionAnchor()
    │       │
    │       └─▶ Returns DOM selector for button placement
    │
    └─▶ Inject button & setup listeners
```

### 2. Getting Prompt Text
```
User types in prompt
    │
    ├─▶ App.tsx: getPromptText()
    │       │
    │       └─▶ utils.ts: getCurrentSiteAdapter()
    │               │
    │               └─▶ adapter.getPromptText()
    │                       │
    │                       └─▶ Site-specific selector & method
    │
    └─▶ Returns text to App
```

### 3. Setting Improved Prompt
```
API returns improved prompt
    │
    ├─▶ Result.tsx: setSitePromptText(text)
    │       │
    │       └─▶ utils.ts: getCurrentSiteAdapter()
    │               │
    │               └─▶ adapter.setPromptText(text)
    │                       │
    │                       └─▶ Site-specific insertion & event dispatch
    │
    └─▶ Text appears in site's input
```

## Site Adapter Interface

```typescript
interface SiteAdapter {
  // Identification
  id: string
  name: string
  urlPatterns: string[]
  
  // Detection
  matches: () => boolean
  
  // DOM Integration
  getInjectionAnchor: () => string | null
  getPromptTextarea: () => HTMLElement | null
  
  // Text Operations
  getPromptText: () => string
  setPromptText: (text: string) => void
  hasPromptText: () => boolean
  
  // Optional
  getModalParentElement?: (anchor: Element) => HTMLElement | null
  onInject?: () => void
  onCleanup?: () => void
  customStyles?: string
}
```

## File Structure

```
src/
├── siteAdapters/
│   ├── index.ts              # Main export
│   ├── types.ts              # SiteAdapter interface
│   ├── registry.ts           # Central registry
│   ├── utils.ts              # Helper functions
│   │
│   ├── chatgpt.ts           # Platform adapters
│   ├── gemini.ts
│   ├── canva.ts
│   ├── claude.ts
│   ├── perplexity.ts
│   ├── copilot.ts
│   ├── midjourney.ts
│   ├── leonardo.ts
│   ├── githubCopilot.ts
│   ├── meta.ts
│   └── figma.ts
│
├── App.tsx                   # Main React app
├── contentScript.tsx         # Extension injection
├── Result.tsx               # Result display
└── ... (other components)
```

## Adding a New Site (Flow)

```
1. Create adapter file
   src/siteAdapters/newsite.ts
        │
        └─▶ Implement SiteAdapter interface
             │
             ├─▶ Find DOM selectors on target site
             ├─▶ Determine input type (textarea vs div)
             └─▶ Write get/set text methods
                  │
                  ▼
2. Register adapter
   registry.ts
        │
        └─▶ Import and add to siteAdapters object
             │
             ▼
3. Update manifest
   manifest.json
        │
        ├─▶ Add URL to host_permissions
        └─▶ Add URL to content_scripts.matches
             │
             ▼
4. Build & Test
   pnpm run build
        │
        └─▶ Load extension in Chrome
             │
             └─▶ Test on target site
```

## Key Benefits

### 🎯 Isolation
Each adapter is independent. Changes to one don't affect others.

### 🔧 Flexibility
Optional methods allow site-specific customization without breaking the interface.

### 📦 Scalability
Adding new sites is a simple, repeatable process:
- 1 new file
- 2 registry updates
- 1 manifest update

### 🛡️ Type Safety
TypeScript ensures all adapters implement required methods.

### 🧪 Testability
Each adapter can be tested in isolation.

## Common Patterns

### Pattern 1: Textarea Input
```typescript
// Used by: Perplexity, Leonardo.ai, Meta AI
getPromptText: () => {
  const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
  return textarea?.value?.trim() || "";
}
```

### Pattern 2: Contenteditable Div
```typescript
// Used by: ChatGPT, Claude
getPromptText: () => {
  const div = document.querySelector("div[contenteditable='true']");
  return div?.textContent?.trim() || "";
}
```

### Pattern 3: Hybrid Detection
```typescript
// Used by: Microsoft Copilot, Canva, Figma, Midjourney
getPromptText: () => {
  // Try textarea first
  const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
  if (textarea) return textarea.value?.trim() || "";
  
  // Fallback to contenteditable
  const div = document.querySelector("div[contenteditable='true']");
  return div?.textContent?.trim() || "";
}
```
