import { SiteAdapter } from "./types";

/**
 * Canva Site Adapter
 * Supports: canva.com (AI tools)
 */
export const canvaAdapter: SiteAdapter = {
	id: "canva",
	name: "Canva",
	urlPatterns: ["https://www.canva.com/ai*"],

	matches: () => {
		return window.location.href.includes("canva.com");
	},

	getInjectionAnchor: () => {
			return document.querySelector('textarea[placeholder*="Describe"]').parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement || document.querySelector('div[contenteditable="true"][data-placeholder]') || null;
	
	},

	getPromptTextarea: () => {
		return (document.querySelector('textarea[placeholder*="Describe"]') ||
		        document.querySelector('div[contenteditable="true"][data-placeholder]')) as HTMLElement;
	},

	getPromptText: () => {
		const textarea = document.querySelector('textarea[placeholder*="Describe"]') as HTMLTextAreaElement;
		if (textarea) {
			return textarea.value?.trim() || "";
		}
		const div = document.querySelector('div[contenteditable="true"][data-placeholder]');
		return div?.textContent?.trim() || "";
	},

	setPromptText: (text: string) => {
		const textarea = document.querySelector('textarea[placeholder*="Describe"]') as HTMLTextAreaElement;
		if (textarea) {
			textarea.value = text;
			textarea.dispatchEvent(new Event("input", { bubbles: true }));
			return;
		}
		const div = document.querySelector('div[contenteditable="true"][data-placeholder]');
		if (div) {
			div.textContent = text;
			div.dispatchEvent(new Event("input", { bubbles: true }));
		}
	},

	hasPromptText: () => {
		const textarea = document.querySelector('textarea[placeholder*="Describe"]') as HTMLTextAreaElement;
		if (textarea && textarea.value && textarea.value.trim().length > 0) {
			return true;
		}
		const div = document.querySelector('div[contenteditable="true"][data-placeholder]');
		return !!(div && div.textContent && div.textContent.trim().length > 0);
	},

	getModalParentElement: (injectionAnchor: Element) => {
		return injectionAnchor.closest("div[role='dialog']") as HTMLElement || injectionAnchor.parentElement;
	},
    onInject: () => {
        // override z-index 
        const formElement = document.querySelector('form[action="search"]');
        if (formElement) {
            const form3rdParent = formElement.parentElement?.parentElement?.parentElement;
            if (form3rdParent) {
                form3rdParent.style.zIndex = "99999";
            }
        }
    }
};
