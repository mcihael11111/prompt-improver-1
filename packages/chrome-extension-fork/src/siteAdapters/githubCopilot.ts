import { SiteAdapter } from "./types";

/**
 * GitHub Copilot Site Adapter
 * Supports: github.com/copilot
 */
export const githubCopilotAdapter: SiteAdapter = {
	id: "github-copilot",
	name: "GitHub Copilot",
	urlPatterns: ["https://github.com/copilot*", "https://copilot.github.com/*"],

	matches: () => {
		return window.location.href.includes("github.com/copilot") || window.location.href.includes("copilot.github.com");
	},

	getInjectionAnchor: () => {
		return (document.querySelector('textarea[placeholder*="Ask"]') || document.querySelector('div[contenteditable="true"][role="textbox"]')).parentElement?.parentElement || null;
	},

	getPromptTextarea: () => {
		return (document.querySelector('textarea[placeholder*="Ask"]') || document.querySelector('div[contenteditable="true"][role="textbox"]')) as HTMLElement;
	},

	getPromptText: () => {
		const textarea = document.querySelector('textarea[placeholder*="Ask"]') as HTMLTextAreaElement;
		if (textarea) {
			return textarea.value?.trim() || "";
		}
		const div = document.querySelector('div[contenteditable="true"][role="textbox"]');
		return div?.textContent?.trim() || "";
	},

	setPromptText: (text: string) => {
		const textarea = document.querySelector('textarea[placeholder*="Ask"]') as HTMLTextAreaElement;
		if (textarea) {
			textarea.value = text;
			textarea.dispatchEvent(new Event("input", { bubbles: true }));
			return;
		}
		const div = document.querySelector('div[contenteditable="true"][role="textbox"]');
		if (div) {
			div.textContent = text;
			div.dispatchEvent(new Event("input", { bubbles: true }));
		}
	},

	hasPromptText: () => {
		const textarea = document.querySelector('textarea[placeholder*="Ask"]') as HTMLTextAreaElement;
		if (textarea && textarea.value && textarea.value.trim().length > 0) {
			return true;
		}
		const div = document.querySelector('div[contenteditable="true"][role="textbox"]');
		return !!(div && div.textContent && div.textContent.trim().length > 0);
	},

	getModalParentElement: (injectionAnchor: Element) => {
		return (injectionAnchor.closest("form") as HTMLElement) || injectionAnchor.parentElement;
	},

	onInject: () => {
		// Make form element's overflow visible when injected so our button is visible
		const formElement = document.querySelector('form[class^="ChatInput"]') as HTMLFormElement;
		if (formElement) {
			formElement.style.overflow = "visible";
		}
	},
};
