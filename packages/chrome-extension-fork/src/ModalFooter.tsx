interface ModalFooterProps {
	remainingPrompts: number | null;
	showLine?: boolean;
	upgradePlan: () => void;
	currentQuestion: number;
	screen?: string;
}

const ModalFooter = ({ remainingPrompts, showLine, upgradePlan, currentQuestion, screen }: ModalFooterProps) => {
	return (
		<footer className="modal-footer" {...(showLine && { style: { borderTop: "1px solid var(--primary-medium)", marginTop: "16px" } })}>
			<div className="prompts-remaining">
				{remainingPrompts === null ? (
					<span>Loading...</span>
				) : remainingPrompts === 0 ? (
					<span>No suggestions remaining</span>
				) : (
					<span>
						{(screen == 'question' && currentQuestion == 1) ? remainingPrompts - 1 : remainingPrompts} suggestion{remainingPrompts !== 1 ? "s" : ""} remaining
					</span>
				)}
			</div>
			<button className="unlock-button primary" onClick={upgradePlan}>
				Unlock Unlimited With Pro
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
					<polyline points="9 18 15 12 9 6"></polyline>
				</svg>
			</button>
		</footer>
	);
};

export default ModalFooter;
