import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import Logo from "./Logo";
import { WEBSITE_URL, FAQ_URL } from "./config";

const Popup = () => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	// Check if user is logged in on mount
	useEffect(() => {
		chrome.storage.local.get(["userEmail"], (result) => {
			setIsLoggedIn(!!result.userEmail);
		});

		// Listen for auth state changes
		const handleAuthChange = (message: any) => {
			if (message.type === "AUTH_STATE_CHANGED") {
				if (message.event === "SIGNED_IN" && message.user?.email) {
					setIsLoggedIn(true);
				} else if (message.event === "SIGNED_OUT") {
					setIsLoggedIn(false);
				}
			}
		};

		chrome.runtime.onMessage.addListener(handleAuthChange);

		return () => {
			chrome.runtime.onMessage.removeListener(handleAuthChange);
		};
	}, []);

	const handleOpenPromptGPT = () => {
		// Send message to active tab to open the modal
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (tabs[0]?.id) {
				chrome.tabs.sendMessage(tabs[0].id, { type: "OPEN_PROMPT_GPT" }, () => {
					window.close(); // Close the popup
				});
			}
		});
	};

	const openWebsite = () => {
		window.open(WEBSITE_URL, "_blank");
		window.close();
	};

	const openFAQ = () => {
		window.open(FAQ_URL, "_blank");
		window.close();
	};

	const openManageSubscription = () => {
		chrome.runtime.sendMessage({ type: "OPEN_STRIPE_LINK" });
		window.close();
	};

	const handleLogin = () => {
		chrome.runtime.sendMessage({ type: "LOGIN" });
		window.close();
	};

	return (
		<div>
			<div className="menu-header">
				<Logo />
				<span>TextCoach</span>
			</div>
			<button className="menu-item" onClick={handleOpenPromptGPT}>
				Open TextCoach
			</button>
			{!isLoggedIn && (
				<button className="menu-item" onClick={handleLogin}>
					Login
				</button>
			)}
			<button className="menu-item" onClick={openWebsite}>
				Website
			</button>
			<button className="menu-item" onClick={openFAQ}>
				FAQ
			</button>
			{isLoggedIn && (
				<button className="menu-item" onClick={openManageSubscription}>
					Manage Subscription
				</button>
			)}
		</div>
	);
};

// Initialize the popup
const root = document.getElementById("popup-root");
if (root) {
	createRoot(root).render(<Popup />);
}
