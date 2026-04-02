import { SiteAdapter } from "./types";

/**
 * Midjourney Site Adapter
 * Supports: midjourney.com, Discord bot interface
 */
export const midjourneyAdapter: SiteAdapter = {
	id: "midjourney",
	name: "Midjourney",
	urlPatterns: ["https://www.midjourney.com/*", "https://discord.com/channels/*"],

	matches: () => {
		return window.location.href.includes("midjourney.com") || (window.location.href.includes("discord.com") && document.querySelector('[data-slate-editor="true"]'));
	},

	getInjectionAnchor: () => {
		return document.querySelector('textarea[placeholder*="Imagine"]').parentElement || document.querySelector('div[data-slate-editor="true"]').parentElement || null;
	},

	getPromptTextarea: () => {
		return (document.querySelector('textarea[placeholder*="Imagine"]') || document.querySelector('div[data-slate-editor="true"]')) as HTMLElement;
	},

	getPromptText: () => {
		const textarea = document.querySelector('textarea[placeholder*="Imagine"]') as HTMLTextAreaElement;
		if (textarea) {
			return textarea.value?.trim() || "";
		}
		const div = document.querySelector('div[data-slate-editor="true"]');
		return div?.textContent?.trim() || "";
	},

	setPromptText: (text: string) => {
		const textarea = document.querySelector('textarea[placeholder*="Imagine"]') as HTMLTextAreaElement;
		if (textarea) {
			textarea.value = text;
			textarea.dispatchEvent(new Event("input", { bubbles: true }));
			return;
		}
		const div = document.querySelector('div[data-slate-editor="true"]');
		if (div) {
			div.textContent = text;
			div.dispatchEvent(new Event("input", { bubbles: true }));
		}
	},

	hasPromptText: () => {
		const textarea = document.querySelector('textarea[placeholder*="Imagine"]') as HTMLTextAreaElement;
		if (textarea && textarea.value && textarea.value.trim().length > 0) {
			return true;
		}
		const div = document.querySelector('div[data-slate-editor="true"]');
		return !!(div && div.textContent && div.textContent.trim().length > 0);
	},

	getModalParentElement: (injectionAnchor: Element) => {
		return (injectionAnchor.closest("form") as HTMLElement) || injectionAnchor.parentElement;
	},
};
