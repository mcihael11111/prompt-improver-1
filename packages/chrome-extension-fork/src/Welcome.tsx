import { useState } from "react";

const Welcome = ({ onImprovePrompt, onGuidedRefinement, isManualMode = false, manualPrompt = "", onManualPromptChange = null }) => {
		const [isHelpOpen, setIsHelpOpen] = useState(false);
		
		const handleKeyDown = (e) => {
			// Allow Shift+Enter for new lines, but Enter alone should not trigger anything in textarea
			// Users can use the buttons to submit
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
			}
		};
		
		return (
		<div className="welcome-container">
			{isManualMode ? <p className="question-progress">PASTE THE CONVERSATION</p> : null}
			<h2 className="welcome-title">{isManualMode ? "Paste the messages you want to reply to. TextCoach will help you craft the perfect response." : "How would you like to respond?"}</h2>
			{isManualMode && <textarea className="manual-prompt-textarea" placeholder="Paste the conversation here..." value={manualPrompt} onChange={(e) => onManualPromptChange && onManualPromptChange(e.target.value)} onKeyDown={handleKeyDown} />}
			<div className="welcome-buttons">
				<button className="welcome-button secondary" onClick={onImprovePrompt}>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
						<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
					</svg>
					Quick Suggest
				</button>
				<button className="welcome-button secondary" onClick={onGuidedRefinement}>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
						<line x1="4" y1="21" x2="4" y2="14"></line>
						<line x1="4" y1="10" x2="4" y2="3"></line>
						<line x1="12" y1="21" x2="12" y2="12"></line>
						<line x1="12" y1="8" x2="12" y2="3"></line>
						<line x1="20" y1="21" x2="20" y2="16"></line>
						<line x1="20" y1="12" x2="20" y2="3"></line>
						<line x1="1" y1="14" x2="7" y2="14"></line>
						<line x1="9" y1="8" x2="15" y2="8"></line>
						<line x1="17" y1="16" x2="23" y2="16"></line>
					</svg>
					Coach Me
				</button>
			</div>
						<div className="need-help-container">
				<button className="need-help-header" onClick={() => setIsHelpOpen(!isHelpOpen)} aria-expanded={isHelpOpen} aria-controls="need-help-content">
					<span>Need help?</span>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
						<polyline points="6 9 12 15 18 9"></polyline>
					</svg>
				</button>
				{!isManualMode && isHelpOpen && (
					<div className="need-help-content" id="need-help-content">
						<h3>Quick Suggest</h3>
						<ul>
							<li>Get 2-4 ready-to-send message options instantly.</li>
						</ul>
						<h3>Coach Me</h3>
						<ul>
							<li>Answer a few quick questions for more tailored suggestions.</li>
						</ul>
					</div>
				)}
			</div>
		</div>
	);
};

export default Welcome;
