import React, { useState, useEffect } from "react";
import { STRIPE_STARTER_MONTHLY_LINK, STRIPE_PRO_MONTHLY_LINK, STRIPE_PRO_YEARLY_LINK } from "./config";

const UpgradePlan = ({ goBack }: { goBack: () => void }) => {
	const [isProcessing, setIsProcessing] = useState(false);
	const [authError, setAuthError] = useState<string | null>(null);

	useEffect(() => {
		// Listen for auth errors from the background script
		const handleMessage = (message: any) => {
			if (message.type === "AUTH_ERROR") {
				setAuthError(message.error);
				setIsProcessing(false);
			}
		};

		chrome.runtime.onMessage.addListener(handleMessage);

		return () => {
			chrome.runtime.onMessage.removeListener(handleMessage);
		};
	}, []);

	const initUpgrade = (stripeLink: string) => {
		if (isProcessing) {
			console.log("Already processing upgrade, ignoring click");
			return;
		}
		setIsProcessing(true);
		setAuthError(null); // Clear any previous errors
		chrome.runtime.sendMessage({ type: "UPGRADE_PLAN", stripeLink }, (response) => {
			if (response && !response.success) {
				setAuthError(response.error || "Authentication failed. Please try again.");
				setIsProcessing(false);
			} else {
				// Reset after a delay to allow the OAuth flow to start
				setTimeout(() => setIsProcessing(false), 2000);
			}
		});
	};
	return (
		<div className="upgrade-plan-container">
			<p className="question-progress back-button" onClick={goBack}>
				<svg xmlns="http://www.w3.org/2000/svg" width="5" height="9" viewBox="0 0 5 9" fill="none">
					<path d="M3.83398 7.83301L0.500652 4.49967L3.83398 1.16634" stroke="#A96EE2" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
				<span>BACK</span>
			</p>
			<h2>Free</h2>
			<p style={{ color: "var(--text-dark)" }}>✓ up to 8 prompts per week</p>
			
			<div className="plans-grid">
				<div className="plan-card starter-plan">
					<h2>Starter</h2>
					<p style={{ fontWeight: "500", fontSize: "16px", lineHeight: "24px" }}>Everything in free plus:</p>
					<ul className="features-list">
						<li>
							<span>✓ Up to 100 prompts per month</span>
						</li>
						<li>
							<span>✓ Priority response speed for faster results</span>
						</li>
					</ul>
					<div className="pricing-options">
						<div className="pricing-option single">
							<div className="price-container">
								<span className="price">$2.49</span>
								<span className="period">Month</span>
							</div>
							<p className="billing-cycle">Billed Monthly</p>
							<button className="primary next-btn" onClick={() => initUpgrade(STRIPE_STARTER_MONTHLY_LINK)} disabled={isProcessing}>
								Get Started
							</button>
						</div>
					</div>
				</div>

				<div className="plan-card pro-plan">
					<h2>Pro</h2>
					<p style={{ fontWeight: "500", fontSize: "16px", lineHeight: "24px" }}>Everything in starter plus:</p>
					<ul className="features-list">
						<li>
							<span>✓ Unlimited prompts</span>
						</li>
						<li>
							<span>✓ Advanced contextual awareness</span>
						</li>
						<li>
							<span>✓ Priority refinement speed</span>
						</li>
					</ul>
					<div className="pricing-options">
						<div className="pricing-option monthly">
							<div className="price-container">
								<span className="price">$9.99</span>
								<span className="period">Month</span>
							</div>
							<p className="billing-cycle">Billed Monthly</p>
							<button className="secondary next-btn" onClick={() => initUpgrade(STRIPE_PRO_MONTHLY_LINK)} disabled={isProcessing}>
								Get Started
							</button>
						</div>
						<div className="pricing-option yearly">
							<div className="save-badge">Save 50%</div>
							<div className="price-container">
								<span className="price">$4.99</span>
								<span className="period">Month</span>
							</div>
							<p className="billing-cycle">Billed Yearly</p>
							<button className="primary next-btn" onClick={() => initUpgrade(STRIPE_PRO_YEARLY_LINK)} disabled={isProcessing}>
								Get Started
							</button>
						</div>
					</div>
				</div>
			</div>
			
			{authError && (
				<div style={{
					backgroundColor: "#fee",
					border: "1px solid #fcc",
					borderRadius: "8px",
					padding: "12px 16px",
					marginTop: "16px",
					color: "#c33",
					fontSize: "14px",
					lineHeight: "1.5"
				}}>
					<strong>Authentication Error:</strong> {authError}
				</div>
			)}
			
			<div className="stripe-footer">
				<span>Safe & secure checkout</span>
				<img src={chrome.runtime.getURL("./images/stripe.svg")} />
			</div>
		</div>
	);
};

export default UpgradePlan;
