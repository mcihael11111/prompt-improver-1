import React, { useState, useRef, useEffect } from "react";
import Logo from "./Logo";

const ModalHeader = ({ plan }: { plan: string }) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	const handleClose = () => {
		// Send message to the content script using window.postMessage
		window.postMessage({ type: "PROMPT_GPT_CLOSE_MODAL" }, "*");
	};

	const openStripe = () => {
		chrome.runtime.sendMessage({ type: "OPEN_STRIPE_LINK" });
	};

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const openWebsite = (e: React.MouseEvent) => {
		e.stopPropagation();
		window.open("https://www.promptgpt.com.au/", "_blank");
		setIsMenuOpen(false);
	};

	const openFAQ = (e: React.MouseEvent) => {
		e.stopPropagation();
		window.open("https://www.promptgpt.com.au/faq", "_blank");
		setIsMenuOpen(false);
	};

	const openManageSubscription = (e: React.MouseEvent) => {
		e.stopPropagation();
		chrome.runtime.sendMessage({ type: "OPEN_STRIPE_LINK" });
		setIsMenuOpen(false);
	};

	const handleLogin = (e: React.MouseEvent) => {
		e.stopPropagation();
		chrome.runtime.sendMessage({ type: "LOGIN" });
		setIsMenuOpen(false);
	};

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

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsMenuOpen(false);
			}
		};

		if (isMenuOpen) {
			// Use a timeout to avoid immediate closure when opening the menu
			setTimeout(() => {
				document.addEventListener("click", handleClickOutside);
			}, 0);
		}

		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, [isMenuOpen]);

	return (
		<header className="modal-header">
			<div className="logo">
				<Logo />
				<h1 id="modal-title">TextCoach</h1>
				{plan !== 'free' && (
					<button className="plan-badge" onClick={openStripe}>
						{plan.charAt(0).toUpperCase() + plan.slice(1)}
						<img src={chrome.runtime.getURL("images/chevron-right.svg")} />
					</button>
				)}
			</div>
			<div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
				<div className="menu-container" ref={menuRef}>
					<button className="menu-button" aria-label="Menu" onClick={toggleMenu}>
						<svg width="4" height="14" viewBox="0 0 4 14" fill="none" xmlns="http://www.w3.org/2000/svg">
							<circle cx="2" cy="2" r="1.5" fill="currentColor" />
							<circle cx="2" cy="7" r="1.5" fill="currentColor" />
							<circle cx="2" cy="12" r="1.5" fill="currentColor" />
						</svg>
					</button>
					{isMenuOpen && (
						<div className="menu-dropdown">
							{!isLoggedIn && (
								<div className="menu-item" onClick={handleLogin}>
									Login
								</div>
							)}
							<div className="menu-item" onClick={openWebsite}>
								Website
							</div>
							<div className="menu-item" onClick={openFAQ}>
								FAQ
							</div>
							{isLoggedIn && (
								<div className="menu-item" onClick={openManageSubscription}>
									Manage Subscription
								</div>
							)}
						</div>
					)}
				</div>
				<button className="close-button" aria-label="Close" onClick={handleClose}>
					<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M1 13L7 7M7 7L13 1M7 7L1 1M7 7L13 13" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</button>
			</div>
		</header>
	);
};

export default ModalHeader;
