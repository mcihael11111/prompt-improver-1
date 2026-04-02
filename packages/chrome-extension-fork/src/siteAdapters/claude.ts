import { SiteAdapter } from "./types";

/**
 * Claude (Anthropic) Site Adapter
 * Supports: claude.ai
 */
export const claudeAdapter: SiteAdapter = {
	id: "claude",
	name: "Claude",
	urlPatterns: ["https://claude.ai/*"],

	matches: () => {
		return window.location.href.includes("claude.ai");
	},

	getInjectionAnchor: () => {
		return document.querySelector('div[contenteditable="true"]').parentElement?.parentElement || null;
	},

	getPromptTextarea: () => {
		return document.querySelector('div[contenteditable="true"]') as HTMLElement;
	},

	getPromptText: () => {
		const textarea = document.querySelector('div[contenteditable="true"]');
		return textarea?.textContent?.trim() || "";
	},

	setPromptText: (text: string) => {
		const textarea = document.querySelector('div[contenteditable="true"]');
		if (textarea) {
			textarea.textContent = text;
			// Trigger input event to notify Claude's React components
			const event = new Event("input", { bubbles: true });
			textarea.dispatchEvent(event);
		}
	},

	hasPromptText: () => {
		const textarea = document.querySelector('div[contenteditable="true"]');
		return !!(textarea && textarea.textContent && textarea.textContent.trim().length > 0);
	},

	getModalParentElement: (injectionAnchor: Element) => {
		return injectionAnchor.closest("div[class*='relative']") as HTMLElement;
	},
};
