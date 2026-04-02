import { SiteAdapter } from "./types";

/**
 * Microsoft Copilot Site Adapter
 * Supports: copilot.microsoft.com
 */
export const copilotAdapter: SiteAdapter = {
	id: "copilot",
	name: "Microsoft Copilot",
	urlPatterns: ["https://copilot.microsoft.com/*"],

	matches: () => {
		return window.location.href.includes("copilot.microsoft.com");
	},

	getInjectionAnchor: () => {
		return document.querySelector('div[data-testid="composer-content"]').parentElement || null;
	},

	getPromptTextarea: () => {
		return (document.querySelector('textarea[class*="input"]') || document.querySelector('div[contenteditable="true"]')) as HTMLElement;
	},

	getPromptText: () => {
		const textarea = document.querySelector('textarea[class*="input"]') as HTMLTextAreaElement;
		if (textarea) {
			return textarea.value?.trim() || "";
		}
		const div = document.querySelector('div[contenteditable="true"]');
		return div?.textContent?.trim() || "";
	},

	setPromptText: (text: string) => {
		const textarea = document.querySelector('textarea[class*="input"]') as HTMLTextAreaElement;
		if (textarea) {
			textarea.value = text;
			textarea.dispatchEvent(new Event("input", { bubbles: true }));
			return;
		}
		const div = document.querySelector('div[contenteditable="true"]');
		if (div) {
			div.textContent = text;
			div.dispatchEvent(new Event("input", { bubbles: true }));
		}
	},

	hasPromptText: () => {
		const textarea = document.querySelector('textarea[class*="input"]') as HTMLTextAreaElement;
		if (textarea && textarea.value && textarea.value.trim().length > 0) {
			return true;
		}
		const div = document.querySelector('div[contenteditable="true"]');
		return !!(div && div.textContent && div.textContent.trim().length > 0);
	},

	getModalParentElement: (injectionAnchor: Element) => {
		return (injectionAnchor.closest("form") as HTMLElement) || injectionAnchor.parentElement;
	},
};
