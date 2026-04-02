import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { getCurrentSiteAdapter } from "./siteAdapters";

const loadFont = (name, file, weight, style = "normal") => {
	const font = new FontFace(name, `url(${chrome.runtime.getURL(`fonts/${file}`)}) format("woff2")`, { weight, style });

	return font.load().then((loadedFace) => {
		document.fonts.add(loadedFace);
	});
};

const fonts = [
	{ file: "Poppins-Regular.woff2", weight: "400" },
	{ file: "Poppins-Medium.woff2", weight: "500" },
	{ file: "Poppins-SemiBold.woff2", weight: "600" },
	{ file: "Poppins-Bold.woff2", weight: "700" },
];

Promise.all(fonts.map(({ file, weight }) => loadFont("Poppins", file, weight)));

// Inject fallback button for unsupported sites
function injectFallbackButton() {
	if (document.getElementById("prompt-gpt-root")) {
		return;
	}

	try {
		// Create container
		const container = document.createElement("div");
		container.id = "prompt-gpt-root";
		container.classList.add("fallback-mode");

		// Create shadow DOM
		const shadowRoot = container.attachShadow({ mode: "open" });

		// Create wrapper div inside shadow DOM
		const wrapper = document.createElement("div");
		wrapper.id = "prompt-gpt-wrapper";
		shadowRoot.appendChild(wrapper);

		// Create style element for fonts
		const style = document.createElement("style");
		style.textContent = `
			@font-face {
				font-family: 'Poppins';
				src: url('${chrome.runtime.getURL("fonts/Poppins-Regular.woff2")}') format('woff2');
				font-weight: 400;
				font-style: normal;
				font-display: swap;
			}

			@font-face {
				font-family: 'Poppins';
				src: url('${chrome.runtime.getURL("fonts/Poppins-Medium.woff2")}') format('woff2');
				font-weight: 500;
				font-style: normal;
				font-display: swap;
			}

			@font-face {
				font-family: 'Poppins';
				src: url('${chrome.runtime.getURL("fonts/Poppins-SemiBold.woff2")}') format('woff2');
				font-weight: 600;
				font-style: normal;
				font-display: swap;
			}

			@font-face {
				font-family: 'Poppins';
				src: url('${chrome.runtime.getURL("fonts/Poppins-Bold.woff2")}') format('woff2');
				font-weight: 700;
				font-style: normal;
				font-display: swap;
			}

			:host, #prompt-gpt-wrapper {
				font-family: 'Poppins', sans-serif !important;
			}
		`;

		// Load main styles
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = chrome.runtime.getURL("content.css");
		link.type = "text/css";

		shadowRoot.appendChild(style);
		shadowRoot.appendChild(link);

		// Create fallback button container
		const fallbackContainer = document.createElement("div");
		fallbackContainer.id = "prompt-gpt-fallback-container";
		
		// Create and style button
		const button = document.createElement("div");
		button.id = "prompt-gpt-button";

		// Add button to container
		fallbackContainer.appendChild(button);
		wrapper.appendChild(fallbackContainer);

		// Add to body
		document.body.appendChild(container);

		// Hide button when fullscreen is active
		const handleFullscreenChange = () => {
			if (document.fullscreenElement) {
				container.style.display = 'none';
			} else {
				container.style.display = '';
			}
		};

		document.addEventListener('fullscreenchange', handleFullscreenChange);
		document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
		document.addEventListener('mozfullscreenchange', handleFullscreenChange);
		document.addEventListener('msfullscreenchange', handleFullscreenChange);

		// Make the container draggable
		let isDragging = false;
		let hasMoved = false;
		let startY = 0;
		let startTop = 0;

		const handleMouseDown = (e: MouseEvent) => {
			isDragging = true;
			hasMoved = false;
			startY = e.clientY;
			const rect = container.getBoundingClientRect();
			startTop = rect.top;
			
			// Convert CSS top to inline style on first drag
			if (!container.style.top) {
				container.style.top = `${startTop}px`;
			}
			
			e.preventDefault();
			e.stopPropagation();
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (!isDragging) return;
			
			const deltaY = e.clientY - startY;
			
			// If moved more than 5px, consider it a drag
			if (Math.abs(deltaY) > 5) {
				hasMoved = true;
			}
			
			const newTop = startTop + deltaY;
			
			// Clamp to viewport
			const maxTop = window.innerHeight - container.offsetHeight;
			const clampedTop = Math.max(0, Math.min(newTop, maxTop));
			
			container.style.top = `${clampedTop}px`;
		};

		const handleMouseUp = () => {
			if (isDragging) {
				isDragging = false;
				container.classList.remove("dragging");
			}
		};

		const handleButtonClick = (e: MouseEvent) => {
			// Only open modal if we didn't drag
			if (!hasMoved) {
				showModal();
			}
			hasMoved = false;
			e.preventDefault();
			e.stopPropagation();
		};

		// Add listeners to both container and button for dragging
		fallbackContainer.addEventListener("mousedown", handleMouseDown);
		button.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
		button.addEventListener("click", handleButtonClick);

		// Function to show the modal
		const showModal = () => {
			if (shadowRoot.querySelector("#prompt-gpt-app")) return;

			// Create overlay inside shadow DOM instead of in body
			const overlay = document.createElement("div");
			overlay.id = "prompt-gpt-overlay-fallback";
			overlay.style.cssText = `
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background: rgba(0, 0, 0, 0.5);
				z-index: 1;
				pointer-events: auto;
			`;
			shadowRoot.appendChild(overlay);

			container.classList.add("modal-open");

			const appContainer = document.createElement("div");
			appContainer.id = "prompt-gpt-app";
			appContainer.style.zIndex = "2";
			shadowRoot.prepend(appContainer);

			createRoot(appContainer).render(<App />);
		};

		// Function to hide the modal
		const hideModal = () => {
			const appContainer = shadowRoot.querySelector("#prompt-gpt-app");
			if (appContainer) appContainer.remove();

			const overlay = shadowRoot.querySelector("#prompt-gpt-overlay-fallback");
			if (overlay) overlay.remove();

			container.classList.remove("modal-open");
		};

		// Listen for messages from the modal using window.postMessage
		const handleMessage = (event: MessageEvent) => {
			if (event.source !== window) return;
			if (event.data && event.data.type === "PROMPT_GPT_CLOSE_MODAL") {
				hideModal();
			}
		};

		window.addEventListener("message", handleMessage);

		// Listen for messages from the popup to open the modal
		const handleChromeMessage = (message: any) => {
			if (message.type === "OPEN_PROMPT_GPT") {
				showModal();
			}
		};

		chrome.runtime.onMessage.addListener(handleChromeMessage);

		return () => {
			window.removeEventListener("message", handleMessage);
			chrome.runtime.onMessage.removeListener(handleChromeMessage);
			fallbackContainer.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	} catch (error) {
		console.error("Error in injectFallbackButton:", error);
	}
}

function createFallbackOverlay() {
	const existingOverlay = document.getElementById("prompt-gpt-overlay");
	if (existingOverlay) return existingOverlay;

	const overlay = document.createElement("div");
	overlay.id = "prompt-gpt-overlay";
	Object.assign(overlay.style, {
		position: "fixed",
		top: "0",
		left: "0",
		width: "100%",
		height: "100%",
		background: "rgba(0, 0, 0, 0.5)",
		zIndex: "2147483645", // below modal and button
		pointerEvents: "auto",
	});

	document.body.appendChild(overlay);

	return overlay;
}

// Injects the button and handles rendering the React app
function injectButtonAndApp() {
	if (document.getElementById("prompt-gpt-root")) {
		return;
	}

	try {
		// Get the current site adapter
		const siteAdapter = getCurrentSiteAdapter();
		if (!siteAdapter) {
			console.log("No site adapter found for current site");
			return;
		}

		const injectionAnchor = siteAdapter.getInjectionAnchor();
		if (!injectionAnchor) {
			console.log("injectionAnchor Element not found");
			return;
		}

		// Get the parent element that needs z-index elevation
		const parentElement = siteAdapter.getModalParentElement 
			? siteAdapter.getModalParentElement(injectionAnchor)
			: injectionAnchor.parentElement;
		let originalZIndex = "";

		function elevateParent() {
			if (!parentElement) return;
			originalZIndex = parentElement.style.zIndex;
			parentElement.style.zIndex = "9999";
			parentElement.style.position = "relative"; // Ensure z-index applies
		}

		function restoreParent() {
			if (!parentElement) return;
			parentElement.style.zIndex = originalZIndex;
		}

		// Create container
		const container = document.createElement("div");
		container.id = "prompt-gpt-root";

		// Create shadow DOM
		const shadowRoot = container.attachShadow({ mode: "open" });

		// Create wrapper div inside shadow DOM
		const wrapper = document.createElement("div");
		wrapper.id = "prompt-gpt-wrapper";
		shadowRoot.appendChild(wrapper);

		// Create style element for fonts
		const style = document.createElement("style");
		style.textContent = `
			@font-face {
				font-family: 'Poppins';
				src: url('${chrome.runtime.getURL("fonts/Poppins-Regular.woff2")}') format('woff2');
				font-weight: 400;
				font-style: normal;
				font-display: swap;
			}

			@font-face {
				font-family: 'Poppins';
				src: url('${chrome.runtime.getURL("fonts/Poppins-Medium.woff2")}') format('woff2');
				font-weight: 500;
				font-style: normal;
				font-display: swap;
			}

			@font-face {
				font-family: 'Poppins';
				src: url('${chrome.runtime.getURL("fonts/Poppins-SemiBold.woff2")}') format('woff2');
				font-weight: 600;
				font-style: normal;
				font-display: swap;
			}

			@font-face {
				font-family: 'Poppins';
				src: url('${chrome.runtime.getURL("fonts/Poppins-Bold.woff2")}') format('woff2');
				font-weight: 700;
				font-style: normal;
				font-display: swap;
			}

			:host, #prompt-gpt-wrapper {
				font-family: 'Poppins', sans-serif !important;
			}
		`;

		// Load main styles
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = chrome.runtime.getURL("content.css");
		link.type = "text/css";

		shadowRoot.appendChild(style);
		shadowRoot.appendChild(link);

		// Create hint div
		const hintDiv = document.createElement("div");
		hintDiv.id = "prompt-gpt-hint";
		hintDiv.textContent = "Click to coach your reply";
		hintDiv.style.display = "none"; // Hidden by default
		
		// Create and style button
		const button = document.createElement("div");
		button.id = "prompt-gpt-button";

		// Add hint and button to shadow DOM
		wrapper.appendChild(hintDiv);
		wrapper.appendChild(button);

		// Insert container before injectionAnchor
		injectionAnchor.parentNode!.insertBefore(container, injectionAnchor);

		// Function to show the modal
		const showModal = () => {
			if (shadowRoot.querySelector("#prompt-gpt-app")) return;

			const overlay = createOverlay();
			elevateParent();

			container.classList.add("modal-open");

			const appContainer = document.createElement("div");
			appContainer.id = "prompt-gpt-app";
			shadowRoot.prepend(appContainer);

			createRoot(appContainer).render(<App />);
			
			// Hide hint when modal opens
			hintDiv.style.display = "none";
		};

		// Function to hide the modal
		const hideModal = () => {
			const appContainer = shadowRoot.querySelector("#prompt-gpt-app");
			if (appContainer) appContainer.remove();

			const overlay = document.getElementById("prompt-gpt-overlay");
			if (overlay) overlay.remove();

			restoreParent();
			container.classList.remove("modal-open");
		};

		// Add click handler to show modal
		button.addEventListener("click", showModal);

		// Listen for input in the prompt textarea
		const handleTextareaInput = () => {
			if (siteAdapter.hasPromptText()) {
				hintDiv.style.display = "block";
			} else {
				hintDiv.style.display = "none";
			}
		};

		// Set up a MutationObserver to watch for changes in the textarea
		const textarea = siteAdapter.getPromptTextarea();
		if (textarea) {
			const observer = new MutationObserver(handleTextareaInput);
			observer.observe(textarea, { 
				childList: true, 
				subtree: true, 
				characterData: true 
			});
			
			// Also listen for input events
			textarea.addEventListener("input", handleTextareaInput);
		}

		// Execute site-specific injection logic if available
		if (siteAdapter.onInject) {
			siteAdapter.onInject();
		}

		// Listen for messages from the modal using window.postMessage
		const handleMessage = (event: MessageEvent) => {
			// Ensure the message is from our extension and has the expected format
			if (event.source !== window) return;
			if (event.data && event.data.type === "PROMPT_GPT_CLOSE_MODAL") {
				hideModal();
			}
		};

		// Add the message listener
		window.addEventListener("message", handleMessage);

		// Listen for messages from the popup to open the modal
		const handleChromeMessage = (message: any) => {
			if (message.type === "OPEN_PROMPT_GPT") {
				showModal();
			}
		};

		chrome.runtime.onMessage.addListener(handleChromeMessage);

		// Clean up the message listener when the component unmounts
		const cleanup = () => {
			window.removeEventListener("message", handleMessage);
			chrome.runtime.onMessage.removeListener(handleChromeMessage);
		};

		// Return cleanup function
		return cleanup;
	} catch (error) {
		console.error("Error in injectButtonAndApp:", error);
	}
}

function createOverlay() {
	const existingOverlay = document.getElementById("prompt-gpt-overlay");
	if (existingOverlay) return existingOverlay;

	const siteAdapter = getCurrentSiteAdapter();
	if (!siteAdapter) return null;

	const overlay = document.createElement("div");
	overlay.id = "prompt-gpt-overlay";
	Object.assign(overlay.style, {
		position: "fixed",
		top: "0",
		left: "0",
		width: "100%",
		height: "100%",
		background: "rgba(0, 0, 0, 0.5)",
		zIndex: "9998", // just below #prompt-gpt-app
		pointerEvents: "auto",
	});

	// Find a suitable parent for the overlay
	const injectionAnchor = siteAdapter.getInjectionAnchor();
	if (injectionAnchor?.parentNode) {
		injectionAnchor.parentNode.insertBefore(overlay, injectionAnchor);
	} else {
		document.body.appendChild(overlay);
	}

	return overlay;
}

// Check if we should use integrated or fallback button
const siteAdapter = getCurrentSiteAdapter();

if (siteAdapter) {
	// Supported site - use integrated button
	setInterval(injectButtonAndApp, 1000);
} else {
	// Unsupported site - use fallback button
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", injectFallbackButton);
	} else {
		injectFallbackButton();
	}
}
