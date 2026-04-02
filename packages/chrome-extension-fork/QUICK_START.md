# Quick Start: Adding a New Site

## Template

Copy this template to `src/siteAdapters/yoursite.ts`:

```typescript
import { SiteAdapter } from "./types";

export const yoursiteAdapter: SiteAdapter = {
	id: "yoursite",
	name: "Your Site Name",
	urlPatterns: ["https://yoursite.com/*"],

	matches: () => window.location.href.includes("yoursite.com"),

	getInjectionAnchor: () => {
		// TODO: Find the form or container element
		const selector = "YOUR_SELECTOR_HERE";
		return document.querySelector(selector) : null;
	},

	getPromptTextarea: () => {
		// TODO: Find the input element
		return document.querySelector("YOUR_SELECTOR_HERE") as HTMLElement;
	},

	getPromptText: () => {
		// TODO: Get text from input
		const elem = document.querySelector("YOUR_SELECTOR_HERE");
		// For textarea: return (elem as HTMLTextAreaElement)?.value?.trim() || "";
		// For div: return elem?.textContent?.trim() || "";
	},

	setPromptText: (text: string) => {
		// TODO: Set text in input
		const elem = document.querySelector("YOUR_SELECTOR_HERE");
		if (elem) {
			// For textarea: (elem as HTMLTextAreaElement).value = text;
			// For div: elem.textContent = text;
			elem.dispatchEvent(new Event("input", { bubbles: true }));
		}
	},

	hasPromptText: () => {
		// TODO: Check if input has text
		const elem = document.querySelector("YOUR_SELECTOR_HERE");
		// For textarea: return !!((elem as HTMLTextAreaElement)?.value?.trim());
		// For div: return !!(elem?.textContent?.trim());
	},

	getModalParentElement: (anchor) => anchor.parentElement,
};
```

## Checklist

1. ✅ Create adapter file in `src/siteAdapters/`
2. ✅ Import in `src/siteAdapters/registry.ts`
3. ✅ Add to `siteAdapters` object in registry
4. ✅ Export in `src/siteAdapters/index.ts`
5. ✅ Add URL to `manifest.json` (both places)
6. ✅ Build: `pnpm run build`
7. ✅ Test on the actual site

## Finding Selectors

Open DevTools (F12) on the target site:

1. Right-click the prompt input → Inspect
2. Note the element:
   - `<textarea>` → Use `.value`
   - `<div contenteditable="true">` → Use `.textContent`
3. Find a unique selector:
   - Best: `#unique-id`
   - Good: `textarea[placeholder="..."]`
   - OK: `.specific-class`

## Common Input Types

### Standard Textarea
```typescript
getPromptText: () => {
	const elem = document.querySelector("textarea") as HTMLTextAreaElement;
	return elem?.value?.trim() || "";
},
setPromptText: (text) => {
	const elem = document.querySelector("textarea") as HTMLTextAreaElement;
	if (elem) {
		elem.value = text;
		elem.dispatchEvent(new Event("input", { bubbles: true }));
	}
},
```

### Contenteditable Div
```typescript
getPromptText: () => {
	const elem = document.querySelector("div[contenteditable='true']");
	return elem?.textContent?.trim() || "";
},
setPromptText: (text) => {
	const elem = document.querySelector("div[contenteditable='true']");
	if (elem) {
		elem.textContent = text;
		elem.dispatchEvent(new Event("input", { bubbles: true }));
	}
},
```

## Example: Adding Bing Chat

```typescript
// src/siteAdapters/bing.ts
import { SiteAdapter } from "./types";

export const bingAdapter: SiteAdapter = {
	id: "bing",
	name: "Bing Chat",
	urlPatterns: ["https://www.bing.com/chat*"],

	matches: () => window.location.href.includes("bing.com/chat"),

	getInjectionAnchor: () => {
		return document.querySelector("textarea#searchbox") ? "textarea#searchbox" : null;
	},

	getPromptTextarea: () => {
		return document.querySelector("textarea#searchbox") as HTMLElement;
	},

	getPromptText: () => {
		const textarea = document.querySelector("textarea#searchbox") as HTMLTextAreaElement;
		return textarea?.value?.trim() || "";
	},

	setPromptText: (text: string) => {
		const textarea = document.querySelector("textarea#searchbox") as HTMLTextAreaElement;
		if (textarea) {
			textarea.value = text;
			textarea.dispatchEvent(new Event("input", { bubbles: true }));
		}
	},

	hasPromptText: () => {
		const textarea = document.querySelector("textarea#searchbox") as HTMLTextAreaElement;
		return !!(textarea && textarea.value && textarea.value.trim().length > 0);
	},

	getModalParentElement: (anchor) => anchor.parentElement,
};
```

Then register it and update manifest.json!

## Need Help?

Check the full documentation: [SITE_ADAPTERS.md](SITE_ADAPTERS.md)
