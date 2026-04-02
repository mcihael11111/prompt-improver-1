import React from "react";
import ModalHeader from "./ModalHeader";
import Question from "./Question";
import ModalFooter from "./ModalFooter";
import Loading from "./Loading";
import Result from "./Result";
import Welcome from "./Welcome";
import ErrorDisplay from "./ErrorDisplay";
import NoPromptsRemaining from "./NoPromptsRemaining";
import UpgradePlan from "./UpgradePlan";

interface PromptGPTModalProps {
	error: Error | null;
	screen: string;
	questionData: any;
	currentQuestion: number;
	remainingPrompts: number;
	loading: boolean;
	handleAnswerSubmit: (answer: string) => void;
	handleUndoAnswer: () => void;
	handleRetry: () => void;
	improvedPrompt: string;
	upgradePlan: () => void;
	onGuidedRefinement: () => void;
	onImprovePrompt: () => void;
	plan?: string;
	goBack: () => void;
	gotPlan?: boolean;
	isManualMode?: boolean;
	manualPrompt?: string;
	onManualPromptChange?: (prompt: string) => void;
	suggestions?: any[];
	dynamics?: any;
	selectedSuggestionIndex?: number;
	onSelectSuggestion?: (idx: number) => void;
}

const PromptGPTModal: React.FC<PromptGPTModalProps> = ({ error, screen, questionData, currentQuestion, remainingPrompts, loading, handleAnswerSubmit, handleUndoAnswer, handleRetry, improvedPrompt, upgradePlan, onGuidedRefinement, onImprovePrompt, plan = "free", goBack, gotPlan = false, isManualMode = false, manualPrompt = "", onManualPromptChange = null, suggestions = [], dynamics = null, selectedSuggestionIndex = 0, onSelectSuggestion = null }) => {
	return (
		<div className="modal-container" role="dialog" aria-labelledby="modal-title">
			<ModalHeader plan={plan} />
			<div className="modal-content-wrapper">
				{screen === "upgradePlan" ? (
					<UpgradePlan goBack={goBack} />
				) : screen === "noPromptsRemaining" ? (
					<NoPromptsRemaining upgradePlan={upgradePlan} />
				) : error ? (
					<ErrorDisplay error={error} onRefresh={handleRetry} />
				) : loading ? (
					<Loading />
				) : screen === "welcome" ? (
					<Welcome onGuidedRefinement={onGuidedRefinement} onImprovePrompt={onImprovePrompt} isManualMode={isManualMode} manualPrompt={manualPrompt} onManualPromptChange={onManualPromptChange} />
				) : questionData ? (
					<Question questionData={questionData} currentQuestion={currentQuestion} handleAnswerSubmit={handleAnswerSubmit} handleUndoAnswer={handleUndoAnswer} handleRetry={handleRetry} />
				) : (
					<Result promptText={improvedPrompt} onRetry={handleRetry} isManualMode={isManualMode} suggestions={suggestions} dynamics={dynamics} selectedSuggestionIndex={selectedSuggestionIndex} onSelectSuggestion={onSelectSuggestion} />
				)}
				{gotPlan && plan !== "pro" && (remainingPrompts >= 0) && screen !== "upgradePlan" && screen !== "noPromptsRemaining" && <ModalFooter remainingPrompts={remainingPrompts} showLine={!!improvedPrompt} upgradePlan={upgradePlan} screen={screen} currentQuestion={currentQuestion} />}
			</div>
		</div>
	);
};

export default PromptGPTModal;
