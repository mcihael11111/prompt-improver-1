import { SiteAdapter } from "./types";
import { getCurrentSiteAdapter } from "./registry";

/**
 * Get the prompt text from the current site
 */
export function getPromptText(): string {
	const adapter = getCurrentSiteAdapter();
	if (!adapter) {
		return "";
	}
	return adapter.getPromptText();
}

/**
 * Set the prompt text on the current site
 */
export function setPromptText(text: string): void {
	const adapter = getCurrentSiteAdapter();
	if (!adapter) {
		return;
	}
	adapter.setPromptText(text);
}

/**
 * Check if the current site has prompt text
 */
export function hasPromptText(): boolean {
	const adapter = getCurrentSiteAdapter();
	if (!adapter) {
		return false;
	}
	return adapter.hasPromptText();
}

/**
 * Get the prompt textarea element from the current site
 */
export function getPromptTextarea(): HTMLElement | null {
	const adapter = getCurrentSiteAdapter();
	if (!adapter) {
		return null;
	}
	return adapter.getPromptTextarea();
}

/**
 * Check if current site matches a specific adapter
 */
export function isCurrentSite(adapterId: string): boolean {
	const adapter = getCurrentSiteAdapter();
	return adapter?.id === adapterId;
}

/**
 * Execute a site-specific function if available
 */
export function executeSiteFunction<K extends keyof SiteAdapter>(
	functionName: K,
	...args: any[]
): any {
	const adapter = getCurrentSiteAdapter();
	if (!adapter) {
		return null;
	}

	const func = adapter[functionName];
	if (typeof func === "function") {
		return (func as Function)(...args);
	}

	return null;
}
