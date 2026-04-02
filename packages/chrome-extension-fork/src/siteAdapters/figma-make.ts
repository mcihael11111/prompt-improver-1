import { SiteAdapter } from "./types";

/**
 * Figma Site Adapter
 * Supports: Figma Make
 */
export const figmaMakeAdapter: SiteAdapter = {
	id: "figma-make",
	name: "Figma Make",
	urlPatterns: ["https://www.figma.com/make/*"],

	matches: () => {
		return window.location.href.includes("figma.com/make/");
	},

	getInjectionAnchor: () => {
		return document.querySelector("textarea[placeholder^='What do you']") || document.querySelector("textarea[placeholder^='Ask for']")?.parentElement?.parentElement || null;
	},

	getPromptTextarea: () => {
		return (document.querySelector("textarea[placeholder^='What do you']") || document.querySelector("textarea[placeholder^='Ask for']")) as HTMLElement;
	},

	getPromptText: () => {
		const textarea = (document.querySelector("textarea[placeholder^='What do you']") || document.querySelector("textarea[placeholder^='Ask for']")) as HTMLTextAreaElement;
		if (textarea) {
			return textarea.value?.trim() || "";
		}
	},

	setPromptText: (text: string) => {
		const textarea = (document.querySelector("textarea[placeholder^='What do you']") || document.querySelector("textarea[placeholder^='Ask for']")) as HTMLTextAreaElement;
		if (textarea) {
			textarea.value = text;
			textarea.dispatchEvent(new Event("input", { bubbles: true }));
			return;
		}
	},

	hasPromptText: () => {
		const textarea = (document.querySelector("textarea[placeholder^='What do you']") || document.querySelector("textarea[placeholder^='Ask for']")) as HTMLTextAreaElement;
		if (textarea && textarea.value && textarea.value.trim().length > 0) {
			return true;
		} else return false;
	},

	getModalParentElement: (injectionAnchor: Element) => {
		return (injectionAnchor.closest("div[role='dialog']") as HTMLElement) || injectionAnchor.parentElement;
	},
};
