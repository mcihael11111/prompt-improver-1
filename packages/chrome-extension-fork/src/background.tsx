import { API_URL, STRIPE_MANAGE_SUBSCRIPTION_LINK } from "./config";
import { getCurrentUser, ensureUserExists, signInWithGoogle, signOut } from "./user-auth";

// Check for pending OAuth on service worker startup
chrome.runtime.onStartup.addListener(async () => {
	console.log("Service worker starting...");
	await checkPendingOAuth();
});

// Also check when service worker wakes up
chrome.runtime.onInstalled.addListener(async (details) => {
	if (details.reason === "install") {
		console.log("Extension installed, initializing auth...");
		await ensureUserExists();
	} else {
		// Check for pending OAuth on update/reload
		await checkPendingOAuth();
	}
});

async function checkPendingOAuth() {
	try {
		const { pendingOAuth, oauthStartTime, oauthStripeLink } = await chrome.storage.local.get(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);

		if (pendingOAuth) {
			const timeSinceStart = Date.now() - (oauthStartTime || 0);

			// If OAuth was started less than 5 minutes ago, it might still be in progress
			if (timeSinceStart < 5 * 60 * 1000) {
				console.log("Found pending OAuth from", timeSinceStart, "ms ago");

				// Check if we actually got authenticated
				const user = await getCurrentUser();
				if (user && !user.is_anonymous) {
					console.log("OAuth completed successfully! User:", user.email);

					// Clean up and open stripe link
					await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime"]);
					await chrome.storage.local.set({
						lastAuthSuccess: Date.now(),
						userId: user.id,
					});

					if (oauthStripeLink) {
						chrome.tabs.create({ url: oauthStripeLink + "?locked_prefilled_email=" + user.email });
					}

					notifyAuthChange("SIGNED_IN", user);
				}
			} else {
				// OAuth took too long, probably failed
				console.log("OAuth timeout, cleaning up");
				await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);
			}
		}
	} catch (error) {
		console.error("Error checking pending OAuth:", error);
	}
}

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.type === "GET_USER") {
		getCurrentUser().then((user) => {
			sendResponse({ user });
		});
		return true;
	} else if (request.type === "LOGIN") {
		signInWithGoogle()
			.then(() => {
				sendResponse({ success: true });
			})
			.catch((error) => {
				sendResponse({ success: false, error: error.message });
			});
		return true;
	} else if (request.type === "UPGRADE_PLAN") {
		getCurrentUser().then((user) => {
			if (user && !user.is_anonymous) {
				chrome.tabs.create({ url: request.stripeLink + "?locked_prefilled_email=" + user.email });
				sendResponse({ success: true });
			} else {
				signInWithGoogle(request.stripeLink)
					.then(() => {
						sendResponse({ success: true });
					})
					.catch((error) => {
						sendResponse({ success: false, error: error.message });
					});
			}
		});
		return true;
	} else if (request.type === "SIGN_OUT") {
		signOut().then(() => {
			sendResponse({ success: true });
		});
		return true;
	} else if (request.type === "FETCH_INITIAL_QUESTION") {
		handleFetchInitialQuestion(sendResponse, request.prompt);
		return true;
	} else if (request.type === "FETCH_ANSWER") {
		handleFetchAnswer(request.conversationId, request.answer, request.currentQuestion, sendResponse);
		return true;
	} else if (request.type === "UNDO_ANSWER") {
		handleUndoAnswer(request.conversationId, sendResponse);
		return true;
	} else if (request.type === "FETCH_QUICK_IMPROVE") {
		handleFetchQuickImprove(sendResponse, request.prompt);
		return true;
	} else if (request.type === "FETCH_REMAINING_PROMPTS") {
		handleFetchRemainingPrompts(sendResponse);
		return true;
	} else if (request.type === "GET_PLAN") {
		handleGetPlan(sendResponse);
		return true;
	} else if (request.type === "OPEN_STRIPE_LINK") {
		handleOpenStripeLink(sendResponse);
		return true;
	}
});

async function handleOpenStripeLink(sendResponse) {
	try {
		const { userEmail } = await chrome.storage.local.get("userEmail");
		const stripeLink = STRIPE_MANAGE_SUBSCRIPTION_LINK + encodeURIComponent(userEmail);
		chrome.tabs.create({ url: stripeLink });
		sendResponse({ success: true });
	} catch (error) {
		console.error("Error opening Stripe link:", error);
		sendResponse({ success: false, error: error.message });
	}
}

async function handleFetchInitialQuestion(sendResponse, prompt) {
	try {
		const { userId } = await chrome.storage.local.get("userId");
		if (!userId) return;
		const response = await fetch(`${API_URL}/coach`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				conversation: prompt,
				userId,
			}),
		});

		if (!response.ok) {
			const error = await response.json();
			console.error("Error response from server:", error);

			sendResponse({ success: false, error: error.error, errorType: error.errorType });
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		sendResponse({ success: true, data });
	} catch (error) {
		sendResponse({ success: false, error: error.message });
	}
}

async function handleFetchAnswer(conversationId, answer, currentQuestion, sendResponse) {
	try {
		const { userId } = await chrome.storage.local.get("userId");
		if (!userId) return;
		const response = await fetch(`${API_URL}/answer`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				conversationId,
				answer,
				userId,
			}),
		});

		if (!response.ok) {
			const error = await response.json();
			console.error("Error response from server:", error);

			sendResponse({ success: false, error: error.error, errorType: error.errorType });
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		sendResponse({ success: true, data });
	} catch (error) {
		sendResponse({ success: false, error: error.message });
	}
}

async function handleUndoAnswer(conversationId, sendResponse) {
	try {
		const { userId } = await chrome.storage.local.get("userId");
		if (!userId) return;
		const response = await fetch(`${API_URL}/undo-answer`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				conversationId,
				userId,
			}),
		});

		if (!response.ok) {
			const error = await response.json();
			console.error("Error response from server:", error);

			sendResponse({ success: false, error: error.error, errorType: error.errorType });
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		sendResponse({ success: true, data });
	} catch (error) {
		sendResponse({ success: false, error: error.message });
	}
}

async function handleFetchQuickImprove(sendResponse, prompt) {
	try {
		const { userId } = await chrome.storage.local.get("userId");
		if (!userId) return;
		const response = await fetch(`${API_URL}/quick-suggest`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				conversation: prompt,
				userId,
			}),
		});

		if (!response.ok) {
			const error = await response.json();
			console.error("Error response from server:", error);

			sendResponse({ success: false, error: error.error, errorType: error.errorType });
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		sendResponse({ success: true, data });
	} catch (error) {
		console.error("Error in quick improve:", error);
		sendResponse({ success: false, error: error.message });
	}
}

async function handleFetchRemainingPrompts(sendResponse) {
	try {
		const { userId } = await chrome.storage.local.get("userId");
		if (!userId) return;
		const response = await fetch(`${API_URL}/remaining-prompts?userId=${userId}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			const error = await response.json();
			console.error("Error response from server:", error);

			sendResponse({ success: false, error: error.error, errorType: error.errorType });
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		sendResponse({ success: true, data });
	} catch (error) {
		console.error("Error in handleFetchRemainingPrompts:", error);
		sendResponse({
			success: false,
			error: error.message || "Failed to fetch remaining prompts",
		});
	}
}

async function handleGetPlan(sendResponse) {
	try {
		const { userId } = await chrome.storage.local.get("userId");
		if (!userId) return;
		const response = await fetch(`${API_URL}/remaining-prompts/plan?userId=${userId}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			const error = await response.json();
			console.error("Error response from server:", error);

			sendResponse({ success: false, error: error.error, errorType: error.errorType || "general" });
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		sendResponse({ success: true, data });
	} catch (error) {
		console.error("Error in handleGetPlan:", error);
		sendResponse({
			success: false,
			error: error.message || "Failed to get plan",
		});
	}
}
