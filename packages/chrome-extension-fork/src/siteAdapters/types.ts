/**
 * Site Adapter Interface
 * 
 * This interface defines the contract for integrating with different AI chat websites.
 * Each supported site should implement this interface to provide site-specific functionality.
 */
export interface SiteAdapter {
	/**
	 * The unique identifier for this site (e.g., 'chatgpt', 'claude', 'perplexity')
	 */
	id: string;

	/**
	 * The display name of the site
	 */
	name: string;

	/**
	 * URL patterns that match this site (for manifest.json configuration)
	 */
	urlPatterns: string[];

	/**
	 * Check if the current page is this site
	 */
	matches: () => boolean;

	/**
	 * Get the selector for the form/container where the button should be injected
	 * Returns null if the injection point is not found
	 */
	getInjectionAnchor: () => string | null;

	/**
	 * Get the prompt textarea element
	 * Returns null if not found
	 */
	getPromptTextarea: () => HTMLElement | null;

	/**
	 * Get the text content from the prompt textarea
	 */
	getPromptText: () => string;

	/**
	 * Set the text content in the prompt textarea
	 */
	setPromptText: (text: string) => void;

	/**
	 * Check if the textarea has content (used to show/hide hint)
	 */
	hasPromptText: () => boolean;

	/**
	 * Optional: Get the parent element that needs z-index elevation for modal
	 */
	getModalParentElement?: (injectionAnchor: Element) => HTMLElement | null;

	/**
	 * Optional: Additional cleanup/setup logic specific to this site
	 */
	onInject?: () => void;

	/**
	 * Optional: Cleanup function when the extension is unloaded
	 */
	onCleanup?: () => void;

	/**
	 * Optional: Custom styles specific to this site (CSS string)
	 */
	customStyles?: string;
}

/**
 * Registry of all supported sites
 */
export type SiteAdapterRegistry = {
	[key: string]: SiteAdapter;
};
