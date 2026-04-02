import { SiteAdapter } from "./types";

/**
 * Google Gemini Site Adapter
 * Supports: gemini.google.com
 */
export const geminiAdapter: SiteAdapter = {
	id: "gemini",
	name: "Google Gemini",
	urlPatterns: ["https://gemini.google.com/*"],

	matches: () => {
		return window.location.href.includes("gemini.google.com");
	},

	getInjectionAnchor: () => {
		return document.querySelector('div[xapfileselectordropzone]') || null;
	},

	getPromptTextarea: () => {
		return document.querySelector('div[contenteditable="true"].ql-editor') as HTMLElement;
	},

	getPromptText: () => {
		const textarea = document.querySelector('div[contenteditable="true"].ql-editor');
		return textarea?.textContent?.trim() || "";
	},

	setPromptText: (text: string) => {
		const textarea = document.querySelector('div[contenteditable="true"].ql-editor');
		if (textarea) {
			textarea.textContent = text;
			// Trigger input event
			const event = new Event("input", { bubbles: true });
			textarea.dispatchEvent(event);
		}
	},

	hasPromptText: () => {
		const textarea = document.querySelector('div[contenteditable="true"].ql-editor');
		return !!(textarea && textarea.textContent && textarea.textContent.trim().length > 0);
	},

	getModalParentElement: (injectionAnchor: Element) => {
		return injectionAnchor.closest("form") as HTMLElement || injectionAnchor.parentElement;
	},
};
