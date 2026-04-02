import { SiteAdapter } from "./types";

/**
 * Leonardo.ai Site Adapter
 * Supports: leonardo.ai
 */
export const leonardoAdapter: SiteAdapter = {
	id: "leonardo",
	name: "Leonardo.ai",
	urlPatterns: ["https://app.leonardo.ai/*"],

	matches: () => {
		return window.location.href.includes("leonardo.ai");
	},

	getInjectionAnchor: () => {
		return document.querySelector('div[data-slot="prompt-body"]') || null;
	},

	getPromptTextarea: () => {
		return (document.querySelector('textarea[placeholder*="prompt"]') ||
		        document.querySelector('textarea[name="prompt"]')) as HTMLElement;
	},

	getPromptText: () => {
		const textarea = (document.querySelector('textarea[placeholder*="prompt"]') ||
		                  document.querySelector('textarea[name="prompt"]')) as HTMLTextAreaElement;
		return textarea?.value?.trim() || "";
	},

	setPromptText: (text: string) => {
		const textarea = (document.querySelector('textarea[placeholder*="prompt"]') ||
		                  document.querySelector('textarea[name="prompt"]')) as HTMLTextAreaElement;
		if (textarea) {
			textarea.value = text;
			textarea.dispatchEvent(new Event("input", { bubbles: true }));
			textarea.dispatchEvent(new Event("change", { bubbles: true }));
		}
	},

	hasPromptText: () => {
		const textarea = (document.querySelector('textarea[placeholder*="prompt"]') ||
		                  document.querySelector('textarea[name="prompt"]')) as HTMLTextAreaElement;
		return !!(textarea && textarea.value && textarea.value.trim().length > 0);
	},

	getModalParentElement: (injectionAnchor: Element) => {
		return injectionAnchor.closest("div[class*='prompt']") as HTMLElement || injectionAnchor.parentElement;
	},
};
