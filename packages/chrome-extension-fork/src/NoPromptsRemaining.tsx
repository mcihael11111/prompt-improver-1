import React from "react";

const NoPromptsRemaining = ({ upgradePlan }: { upgradePlan: () => void }) => (
	<div className="question-content no-prompts-remaining">
		<h2>No suggestions remaining</h2>
		<p>You’ve used all your free suggestions for this week. Upgrade your plan to keep going without limits.</p>
		<div className="bottom-button-container">
			<button className="secondary next-button" onClick={upgradePlan}>
				View Plans
			</button>
			<button className="primary next-button" onClick={upgradePlan}>
				Upgrade Your Plan
			</button>
		</div>
	</div>
);

export default NoPromptsRemaining;
