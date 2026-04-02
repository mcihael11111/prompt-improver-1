import { SiteAdapter, SiteAdapterRegistry } from "./types";
import { chatgptAdapter } from "./chatgpt";
import { geminiAdapter } from "./gemini";
import { canvaAdapter } from "./canva";
import { claudeAdapter } from "./claude";
import { perplexityAdapter } from "./perplexity";
import { copilotAdapter } from "./copilot";
import { midjourneyAdapter } from "./midjourney";
import { leonardoAdapter } from "./leonardo";
import { githubCopilotAdapter } from "./githubCopilot";
import { metaAdapter } from "./meta";
import { figmaMakeAdapter } from "./figma-make";

/**
 * Registry of all supported site adapters
 * 
 * To add a new site:
 * 1. Create a new adapter file (e.g., mysite.ts) implementing SiteAdapter
 * 2. Import it here
 * 3. Add it to the registry below
 * 4. Update manifest.json with the new URL patterns
 */
export const siteAdapters: SiteAdapterRegistry = {
	chatgpt: chatgptAdapter,
	gemini: geminiAdapter,
	canva: canvaAdapter,
	claude: claudeAdapter,
	perplexity: perplexityAdapter,
	copilot: copilotAdapter,
	midjourney: midjourneyAdapter,
	leonardo: leonardoAdapter,
	"github-copilot": githubCopilotAdapter,
	meta: metaAdapter,
	"figma-make": figmaMakeAdapter,
};

/**
 * Get all registered site adapters as an array
 */
export function getAllAdapters(): SiteAdapter[] {
	return Object.values(siteAdapters);
}

/**
 * Get a specific adapter by ID
 */
export function getAdapterById(id: string): SiteAdapter | null {
	return siteAdapters[id] || null;
}

/**
 * Get the adapter for the current site
 * Returns null if no matching adapter is found
 */
export function getCurrentSiteAdapter(): SiteAdapter | null {
	for (const adapter of getAllAdapters()) {
		if (adapter.matches()) {
			return adapter;
		}
	}
	return null;
}

/**
 * Check if the current site is supported
 */
export function isCurrentSiteSupported(): boolean {
	return getCurrentSiteAdapter() !== null;
}

/**
 * Get all URL patterns from all adapters (useful for manifest.json generation)
 */
export function getAllUrlPatterns(): string[] {
	const patterns: string[] = [];
	for (const adapter of getAllAdapters()) {
		patterns.push(...adapter.urlPatterns);
	}
	return patterns;
}
