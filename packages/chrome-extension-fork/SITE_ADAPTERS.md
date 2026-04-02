# Site Adapters - Adding Support for New Websites

The extension uses a **Site Adapter** system to support multiple AI chat websites. This makes it easy to add support for new sites without modifying the core extension logic.

## Currently Supported Sites

- **ChatGPT** (OpenAI) - chatgpt.com
- **Google Gemini** - gemini.google.com
- **Canva** - canva.com
- **Claude** (Anthropic) - claude.ai
- **Perplexity AI** - perplexity.ai
- **Microsoft Copilot** - copilot.microsoft.com
- **Midjourney** - midjourney.com & Discord
- **Leonardo.ai** - leonardo.ai
- **GitHub Copilot** - github.com/copilot
- **Meta AI** - meta.ai
- **Figma** (including Figma Make) - figma.com

## Architecture Overview

The site adapter system consists of:

1. **SiteAdapter Interface** (`src/siteAdapters/types.ts`) - Defines the contract each adapter must implement
2. **Site-specific Adapters** (e.g., `src/siteAdapters/chatgpt.ts`) - Implement the interface for each site
3. **Registry** (`src/siteAdapters/registry.ts`) - Central registry of all adapters
4. **Utilities** (`src/siteAdapters/utils.ts`) - Helper functions for working with adapters

## Adding a New Site Adapter

Follow these steps to add support for a new AI chat website:

### Step 1: Create a New Adapter File

Create a new file in `src/siteAdapters/` named after your site (e.g., `mysite.ts`):

```typescript
import { SiteAdapter } from "./types";

export const mysiteAdapter: SiteAdapter = {
	id: "mysite",
	name: "My Site",
	urlPatterns: ["https://mysite.com/*"],

	matches: () => {
		return window.location.href.includes("mysite.com");
	},

	getInjectionAnchor: () => {
		// Return CSS selector for where to inject the button
		// This should target the form or container near the prompt input
		const selector = "form#chat-form";
		return document.querySelector(selector) ? selector : null;
	},

	getPromptTextarea: () => {
		// Return the HTML element used for prompt input
		return document.querySelector("#prompt-input") as HTMLElement;
	},

	getPromptText: () => {
		// Return the text content from the prompt input
		const textarea = document.querySelector("#prompt-input");
		// For contenteditable divs:
		return textarea?.textContent?.trim() || "";
		// For textarea elements:
		// return (textarea as HTMLTextAreaElement)?.value?.trim() || "";
	},

	setPromptText: (text: string) => {
		// Set the text in the prompt input
		const textarea = document.querySelector("#prompt-input");
		if (textarea) {
			// For contenteditable divs:
			textarea.textContent = text;
			// For textarea elements:
			// (textarea as HTMLTextAreaElement).value = text;
			
			// Trigger input event to notify the site's JavaScript
			const event = new Event("input", { bubbles: true });
			textarea.dispatchEvent(event);
		}
	},

	hasPromptText: () => {
		// Check if there's text in the prompt input
		const textarea = document.querySelector("#prompt-input");
		// For contenteditable divs:
		return !!(textarea && textarea.textContent && textarea.textContent.trim().length > 0);
		// For textarea elements:
		// return !!(textarea && (textarea as HTMLTextAreaElement).value.trim().length > 0);
	},

	getModalParentElement: (injectionAnchor: Element) => {
		// Optional: Return parent element that needs z-index elevation
		return injectionAnchor.parentElement;
	},

	onInject: () => {
		// Optional: Add any site-specific initialization code
		console.log("My Site adapter initialized");
	},

	onCleanup: () => {
		// Optional: Add cleanup logic
	},

	customStyles: `
		/* Optional: Add site-specific CSS */
	`,
};
```

### Step 2: Register the Adapter

Add your adapter to `src/siteAdapters/registry.ts`:

```typescript
import { mysiteAdapter } from "./mysite";

export const siteAdapters: SiteAdapterRegistry = {
	chatgpt: chatgptAdapter,
	gemini: geminiAdapter,
	canva: canvaAdapter,
	claude: claudeAdapter,
	perplexity: perplexityAdapter,
	copilot: copilotAdapter,
	midjourney: midjourneyAdapter,
	leonardo: leonardoAdapter,
	"github-copilot": githubCopilotAdapter,
	meta: metaAdapter,
	figma: figmaAdapter,
	mysite: mysiteAdapter, // Add your adapter here
};
```

### Step 3: Export the Adapter

Add your adapter to `src/siteAdapters/index.ts`:

```typescript
export { mysiteAdapter } from "./mysite";
```

### Step 4: Update manifest.json

Add the URL pattern to both `host_permissions` and `content_scripts.matches`:

```json
{
	"host_permissions": [
		"https://chatgpt.com/*",
		"https://claude.ai/*",
		"https://www.perplexity.ai/*",
		"https://gemini.google.com/*",
		"https://mysite.com/*"
	],
	"content_scripts": [
		{
			"matches": [
				"https://chatgpt.com/*",
				"https://claude.ai/*",
				"https://www.perplexity.ai/*",
				"https://gemini.google.com/*",
				"https://mysite.com/*"
			],
			"js": ["contentScript.js"],
			"run_at": "document_end"
		}
	]
}
```

### Step 5: Test Your Adapter

1. Build the extension: `pnpm run build`
2. Load the extension in Chrome (Developer mode → Load unpacked)
3. Navigate to your target site
4. Verify:
   - The extension button appears
   - The hint shows when you type
   - You can open the modal
   - The improved prompt can be inserted back

## Tips for Finding Selectors

### Using Browser DevTools

1. **Open DevTools** (F12 or Right-click → Inspect)
2. **Inspect the prompt input** - Click the element picker and select the prompt textarea
3. **Note the element type**:
   - `<textarea>` - Use `.value` to get/set text
   - `<div contenteditable="true">` - Use `.textContent` to get/set text
4. **Find a unique selector**:
   - Look for `id` attributes (e.g., `#prompt-textarea`)
   - Look for unique class names
   - Use attribute selectors (e.g., `textarea[placeholder="Ask anything"]`)
   - Use structural selectors as a last resort

### Common Patterns

**For textarea elements:**
```typescript
getPromptText: () => {
	const textarea = document.querySelector("textarea#prompt") as HTMLTextAreaElement;
	return textarea?.value?.trim() || "";
},

setPromptText: (text: string) => {
	const textarea = document.querySelector("textarea#prompt") as HTMLTextAreaElement;
	if (textarea) {
		textarea.value = text;
		textarea.dispatchEvent(new Event("input", { bubbles: true }));
	}
},
```

**For contenteditable divs:**
```typescript
getPromptText: () => {
	const div = document.querySelector("div[contenteditable='true']");
	return div?.textContent?.trim() || "";
},

setPromptText: (text: string) => {
	const div = document.querySelector("div[contenteditable='true']");
	if (div) {
		div.textContent = text;
		div.dispatchEvent(new Event("input", { bubbles: true }));
	}
},
```

## Interface Reference

### Required Methods

| Method | Description | Return Type |
|--------|-------------|-------------|
| `id` | Unique identifier | `string` |
| `name` | Display name | `string` |
| `urlPatterns` | URL patterns for manifest | `string[]` |
| `matches()` | Check if current page matches | `boolean` |
| `getInjectionAnchor()` | Get selector for injection point | `string \| null` |
| `getPromptTextarea()` | Get the prompt input element | `HTMLElement \| null` |
| `getPromptText()` | Get text from prompt input | `string` |
| `setPromptText(text)` | Set text in prompt input | `void` |
| `hasPromptText()` | Check if input has text | `boolean` |

### Optional Methods

| Method | Description | Return Type |
|--------|-------------|-------------|
| `getModalParentElement(anchor)` | Get parent for z-index elevation | `HTMLElement \| null` |
| `onInject()` | Called when extension is injected | `void` |
| `onCleanup()` | Called when extension is unloaded | `void` |
| `customStyles` | Site-specific CSS | `string` |

## Troubleshooting

### Button Doesn't Appear

- Check if `getInjectionAnchor()` returns a valid selector
- Use `console.log()` to debug selector matching
- Verify the element exists in the DOM when the script runs
- Try adding a delay or using a MutationObserver if the element loads dynamically

### Can't Get Prompt Text

- Verify you're using the correct method (`.value` for textarea, `.textContent` for div)
- Check if the element uses Shadow DOM (requires special handling)
- Log the element to inspect its properties

### Can't Set Prompt Text

- Make sure to dispatch an `input` event after setting text
- Some sites might use custom event handlers - check the site's JavaScript
- Try dispatching additional events: `change`, `keyup`, `blur`

### Site-Specific Issues

- Some sites use iframes - you may need additional configuration
- Some sites use Shadow DOM - requires special querySelector syntax
- Some sites heavily obfuscate their classes - use stable selectors like IDs or data attributes

## Example: Adding Hugging Face Chat

Here's a complete example for Hugging Face Chat:

```typescript
// src/siteAdapters/huggingface.ts
import { SiteAdapter } from "./types";

export const huggingfaceAdapter: SiteAdapter = {
	id: "huggingface",
	name: "Hugging Face Chat",
	urlPatterns: ["https://huggingface.co/chat/*"],

	matches: () => {
		return window.location.href.includes("huggingface.co/chat");
	},

	getInjectionAnchor: () => {
		if (document.querySelector("form.relative")) {
			return "form.relative";
		}
		return null;
	},

	getPromptTextarea: () => {
		return document.querySelector("textarea") as HTMLElement;
	},

	getPromptText: () => {
		const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
		return textarea?.value?.trim() || "";
	},

	setPromptText: (text: string) => {
		const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
		if (textarea) {
			textarea.value = text;
			textarea.dispatchEvent(new Event("input", { bubbles: true }));
		}
	},

	hasPromptText: () => {
		const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
		return !!(textarea && textarea.value && textarea.value.trim().length > 0);
	},

	getModalParentElement: (injectionAnchor: Element) => {
		return injectionAnchor.closest("div.relative") as HTMLElement;
	},
};
```

## Questions?

If you have questions or run into issues, please:
1. Check the existing adapters for reference
2. Use browser DevTools to inspect the target site
3. Test thoroughly on the actual site
4. Consider edge cases (empty state, long text, special characters)

Happy coding! 🚀
