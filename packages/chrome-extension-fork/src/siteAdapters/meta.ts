import { SiteAdapter } from "./types";

/**
 * Meta AI Site Adapter
 * Supports: meta.ai
 */
export const metaAdapter: SiteAdapter = {
	id: "meta",
	name: "Meta AI",
	urlPatterns: ["https://www.meta.ai/*"],

	matches: () => {
		return window.location.href.includes("meta.ai");
	},

	getInjectionAnchor: () => {
		return document.querySelector('div[data-pagelet="KadabraPrivateComposer"]') || null;
	},

	getPromptTextarea: () => {
		return document.querySelector('div[contenteditable="true"]') as HTMLElement;
	},

	getPromptText: () => {
		const textarea = document.querySelector('div[contenteditable="true"]') as HTMLDivElement;
		return textarea?.textContent?.trim() || "";
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
			document.execCommand('delete', false);
			
			// Insert new text
			document.execCommand('insertText', false, text);
			
			// Dispatch events
			textarea.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: 'insertText', data: text }));
			textarea.dispatchEvent(new Event("change", { bubbles: true }));
		}
	},

	hasPromptText: () => {
		const textarea = document.querySelector('div[contenteditable="true"]') as HTMLDivElement;
		return !!(textarea && textarea.textContent && textarea.textContent.trim().length > 0);
	},

	getModalParentElement: (injectionAnchor: Element) => {
		return (injectionAnchor.closest("form") as HTMLElement) || injectionAnchor.parentElement;
	},
};
