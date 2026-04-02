import { SiteAdapter } from "./types";

/**
 * ChatGPT Site Adapter
 * Supports: chatgpt.com
 */
export const chatgptAdapter: SiteAdapter = {
	id: "chatgpt",
	name: "ChatGPT",
	urlPatterns: ["https://chatgpt.com/*"],

	matches: () => {
		return window.location.href.includes("chatgpt.com");
	},

	getInjectionAnchor: () => {
		return document.querySelector("#thread-bottom form") || document.querySelector("form.group\\/composer") || null;
	},

	getPromptTextarea: () => {
		return document.querySelector("#prompt-textarea") as HTMLElement;
	},

	getPromptText: () => {
		const textarea = document.querySelector("#prompt-textarea");
		return textarea?.textContent?.trim() || "";
	},

	setPromptText: (text: string) => {
		const textarea = document.querySelector("#prompt-textarea");
		if (textarea) {
			textarea.textContent = text;
		}
	},

	hasPromptText: () => {
		const textarea = document.querySelector("#prompt-textarea");
		return !!(textarea && textarea.textContent && textarea.textContent.trim().length > 0);
	},

	getModalParentElement: (injectionAnchor: Element) => {
		return injectionAnchor.parentElement;
	},

	onInject: () => {
		// Clear z-index that might interfere with modal
		const clearZIndex = () => {
			const element = document.querySelector(".cursor-pointer.z-30");
			element?.classList.remove("z-30");
		};
		setInterval(clearZIndex, 1000);
	},
};
