import { SiteAdapter } from "./types";

/**
 * Perplexity Site Adapter
 * Supports: perplexity.ai
 */
export const perplexityAdapter: SiteAdapter = {
	id: "perplexity",
	name: "Perplexity",
	urlPatterns: ["https://perplexity.ai/*"],

	matches: () => {
		return window.location.href.includes("perplexity.ai");
	},

	getInjectionAnchor: () => {
		return document.querySelector('div[contenteditable="true"]').parentElement?.parentElement?.parentElement || null;
	},

	getPromptTextarea: () => {
		return document.querySelector('div[contenteditable="true"]') as HTMLElement;
	},

	getPromptText: () => {
		const textarea = document.querySelector('div[contenteditable="true"]') as HTMLDivElement;
		return textarea?.innerText?.trim() || "";
	},

	setPromptText: (text: string) => {
		const textarea = document.querySelector('div[contenteditable="true"]') as HTMLDivElement;
		if (textarea) {
			// Focus first
			textarea.focus();

			// Select all existing content
			const selection = window.getSelection();
			const range = document.createRange();
			range.selectNodeContents(textarea);
			selection?.removeAllRanges();
			selection?.addRange(range);

			// Delete existing content
			document.execCommand("delete", false);

			// Insert new text
			document.execCommand("insertText", false, text);

			// Dispatch events
			textarea.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
			textarea.dispatchEvent(new Event("change", { bubbles: true }));
		}
	},

	hasPromptText: () => {
		const textarea = document.querySelector('div[contenteditable="true"]') as HTMLDivElement;
		return !!(textarea && textarea.innerText && textarea.innerText.trim().length > 0);
	},

	getModalParentElement: (injectionAnchor: Element) => {
		return (injectionAnchor.closest("form") as HTMLElement) || injectionAnchor.parentElement;
	},
};
