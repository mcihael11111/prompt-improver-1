import React, { useState, useEffect, useRef, useCallback } from "react";
import PromptGPTModal from "./PromptGPTModal";
import ErrorDisplay from "./ErrorDisplay";
import Loading from "./Loading";
import { getCurrentSiteAdapter, getPromptText, hasPromptText as checkHasPromptText } from "./siteAdapters";
declare global {
	interface Window {
		chrome: any;
	}
}

function App() {
	// Check if we're in manual mode immediately (no site adapter available)
	const [isManualMode] = useState(() => !getCurrentSiteAdapter());
	const [screen, setScreen] = useState("welcome");
	const [screenHistory, setScreenHistory] = useState(["welcome"]);
	const [originalPrompt, setOriginalPrompt] = useState("");
	const [manualPrompt, setManualPrompt] = useState("");
	const [questionData, setQuestionData] = useState(null);
	const [improvedPrompt, setImprovedPrompt] = useState(null);
	const [suggestions, setSuggestions] = useState<any[]>([]);
	const [dynamics, setDynamics] = useState<any>(null);
	const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
	const [conversationId, setConversationId] = useState(null);
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [remainingPrompts, setRemainingPrompts] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [isInitializingFirstQuestion, setIsInitializingFirstQuestion] = useState(false);
	const [hasRequestedGuidedRefinement, setHasRequestedGuidedRefinement] = useState(false);
	const hasRequestedGuidedRefinementRef = useRef(hasRequestedGuidedRefinement);
	const [hasRequestedImprovedPrompt, setHasRequestedImprovedPrompt] = useState(false);
	const hasRequestedImprovedPromptRef = useRef(hasRequestedImprovedPrompt);
	const [plan, setPlan] = useState("free");
	const [gotPlan, setGotPlan] = useState(false);
	const screenRef = useRef(screen);
	const screenHistoryRef = useRef(screenHistory);
	const appContainerRef = useRef<HTMLDivElement>(null);

	// Helper function to send messages to background script
	const sendMessageToBackground = (type: string, data: any = {}): Promise<any> => {
		return new Promise((resolve, reject) => {
			try {
				chrome.runtime.sendMessage({ type, ...data }, (response: any) => {
					if (chrome.runtime.lastError) {
						reject(new Error(chrome.runtime.lastError.message));
						return;
					}
					if (response && response.success) {
						resolve(response.data || response);
					} else {
						if (response.errorType && response.errorType === "limit_reached") {
							setScreenWithHistory("noPromptsRemaining");
						} else {
							setError({ type: "general", text: response?.error?.message?.toString() || response?.error?.toString() || "Unknown error occurred" });
							reject(new Error(response?.error || "Unknown error occurred"));
						}
					}
				});
			} catch (error) {
				setError({ type: "general", text: error.message?.toString() || error.toString() });
				reject(error);
			}
		});
	};

	// Focus management - capture focus when modal opens and trap it within the modal
	useEffect(() => {
		if (appContainerRef.current) {
			// Set tabindex to make the container focusable
			appContainerRef.current.setAttribute('tabindex', '-1');
			// Focus the container immediately
			appContainerRef.current.focus();
			
			// Stop keyboard events from bubbling to the page, but allow them to work within the modal
			// We only stop propagation at the boundary of our app container
			const handleKeyDown = (e: KeyboardEvent) => {
				// Only stop propagation if the event reached the container boundary
				// (i.e., it already bubbled through our components)
				if (e.currentTarget === appContainerRef.current) {
					e.stopPropagation();
				}
			};
			
			const handleKeyPress = (e: KeyboardEvent) => {
				if (e.currentTarget === appContainerRef.current) {
					e.stopPropagation();
				}
			};
			
			const handleKeyUp = (e: KeyboardEvent) => {
				if (e.currentTarget === appContainerRef.current) {
					e.stopPropagation();
				}
			};
			
			const container = appContainerRef.current;
			// Use bubble phase (false) instead of capture phase to let events work inside first
			container.addEventListener('keydown', handleKeyDown, false);
			container.addEventListener('keypress', handleKeyPress, false);
			container.addEventListener('keyup', handleKeyUp, false);
			
			return () => {
				container.removeEventListener('keydown', handleKeyDown, false);
				container.removeEventListener('keypress', handleKeyPress, false);
				container.removeEventListener('keyup', handleKeyUp, false);
			};
		}
	}, []);

	// when user returns to the app, fetch remaining prompts (in case they upgraded to the pro/starter plan)
	useEffect(() => {
		document.onvisibilitychange = async function () {
			if ((screenRef.current == "upgradePlan" || screenRef.current == "noPromptsRemaining") && document.visibilityState === "visible") {
				const data = await sendMessageToBackground("GET_PLAN");
				setPlan(data.plan);
				if (data.plan !== "free") {
					setScreenWithHistory("welcome");
				}
			}
		};
	}, []);

	useEffect(() => {
		// Also fetch remaining prompts when screen changes to 'welcome'
		if (screen === "welcome") {
			onWelcomeScreen();
		}
	}, [screen, isManualMode]);

	// keep refs updated when state changes
	useEffect(() => {
		hasRequestedGuidedRefinementRef.current = hasRequestedGuidedRefinement;
	}, [hasRequestedGuidedRefinement]);

	useEffect(() => {
		hasRequestedImprovedPromptRef.current = hasRequestedImprovedPrompt;
	}, [hasRequestedImprovedPrompt]);

	useEffect(() => {
		screenRef.current = screen;
	}, [screen]);

	useEffect(() => {
		screenHistoryRef.current = screenHistory;
	}, [screenHistory]);

	const onWelcomeScreen = async () => {
		if (!gotPlan) {
			const data = await sendMessageToBackground("GET_PLAN");
			setPlan(data.plan);
			setGotPlan(true);
			if (data.plan !== "pro") {
				fetchRemainingPrompts();
			}
		} else {
			if (plan !== "pro") {
				fetchRemainingPrompts();
			}
		}
		// Only fetch initial question automatically for supported sites (not manual mode)
		if (!isManualMode) {
			fetchInitialQuestion();
		}
	};

	const fetchRemainingPrompts = async () => {
		try {
			const response = await sendMessageToBackground("FETCH_REMAINING_PROMPTS", {});
			setRemainingPrompts(response.remainingPrompts);
		} catch (error) {
			console.error("Error fetching remaining prompts:", error);
			if (error.errorType && error.errorType === "limit_reached") {
				setScreenWithHistory("noPromptsRemaining");
			} else {
				setError({ type: "general", text: error.message?.toString() || error.toString() });
			}
		}
	};

	const startGuidedRefinement = async () => {
		setHasRequestedGuidedRefinement(true);
		if (isInitializingFirstQuestion) {
			setLoading(true);
			return;
		}

		// In manual mode, use the manual prompt
		if (isManualMode) {
			if (!manualPrompt.trim()) {
				setError({ type: "emptyText", text: "Please enter a prompt in the text area to continue." });
				setHasRequestedGuidedRefinement(false);
				return;
			}
			
			// check if prompt hasn't changed
			if (originalPrompt === manualPrompt) {
				setScreenWithHistory("question");
			} else {
				setLoading(true);
				await fetchInitialQuestion();
				setScreenWithHistory("question");
			}
			return;
		}

		// Get current site adapter
		const siteAdapter = getCurrentSiteAdapter();
		if (!siteAdapter) {
			setError({ type: "general", text: "This site is not supported yet." });
			return;
		}

		// check if prompt hasn't changed inbetween opening the app and starting guided refinement
		const currentPrompt = getPromptText();
		if (currentPrompt && originalPrompt === currentPrompt) {
			setScreenWithHistory("question");
		} else {
			setLoading(true);
			await fetchInitialQuestion();
			setScreenWithHistory("question");
		}
	};

	const fetchInitialQuestion = async () => {
		setError(null);
		setCurrentQuestion(0);
		setIsInitializingFirstQuestion(true);

		try {
			let prompt = "";
			
			// In manual mode, use the manual prompt
			if (isManualMode) {
				prompt = manualPrompt.trim();
				if (!prompt) {
					setOriginalPrompt("");
					setError({ type: "emptyText", text: "Please enter a prompt in the text area to continue." });
					return;
				}
			} else {
				// Get current site adapter
				const siteAdapter = getCurrentSiteAdapter();
				if (!siteAdapter) {
					setError({ type: "general", text: "This site is not supported yet." });
					return;
				}

				// Get prompt from the current site
				prompt = getPromptText();
				if (!prompt) {
					setOriginalPrompt("");
					setError({ type: "emptyText", text: "Please write a prompt in the input field to continue." });
					return;
				}
			}

			setOriginalPrompt(prompt);

			const data = await sendMessageToBackground("FETCH_INITIAL_QUESTION", { prompt });

			if (data.question) {
				// New unwrapped format from TextCoach backend
				setQuestionData({ question: data.question, questionType: data.questionType, options: data.options, minTitle: data.minTitle, maxTitle: data.maxTitle, minSubtitle: data.minSubtitle, maxSubtitle: data.maxSubtitle, min: data.min, max: data.max, unit: data.unit });
				setConversationId(data.conversationId);
				setCurrentQuestion(1);

				if (hasRequestedGuidedRefinementRef.current) {
					setScreenWithHistory("question");
				}
			} else if (data.type === "question") {
				// Fallback: old wrapped format
				setQuestionData(data.content);
				setConversationId(data.conversationId);
				setCurrentQuestion(1);

				if (hasRequestedGuidedRefinementRef.current) {
					setScreenWithHistory("question");
				}
			} else {
				throw new Error("Received invalid data structure from API: " + JSON.stringify(data).substring(0, 200));
			}
		} catch (e: any) {
			if (e.errorType && e.errorType === "limit_reached") {
				setScreenWithHistory("noPromptsRemaining");
			} else {
				setError({ type: "general", text: e.message?.toString() || e.toString() });
			}
		} finally {
			setIsInitializingFirstQuestion(false);
			setHasRequestedGuidedRefinement(false);
			if (!hasRequestedImprovedPromptRef.current) {
				setLoading(false);
			}
		}
	};

	const handleAnswerSubmit = async (answer: any) => {
		if (!conversationId) {
			setError({ type: "general", text: "Missing conversation ID." });
			return;
		}
		setLoading(true);
		setError(null);

		try {
			const data = await sendMessageToBackground("FETCH_ANSWER", {
				conversationId,
				answer,
				currentQuestion: currentQuestion.toString(),
			});

			if (plan !== "pro" && typeof data.remaining !== "undefined") {
				setRemainingPrompts(data.remaining);
			}

			// Handle unwrapped format from new TextCoach backend
			if (data.done === false && data.question) {
				setSuggestions([]);
				setDynamics(null);
				setQuestionData({ question: data.question, questionType: data.questionType, options: data.options, minTitle: data.minTitle, maxTitle: data.maxTitle, minSubtitle: data.minSubtitle, maxSubtitle: data.maxSubtitle, min: data.min, max: data.max, unit: data.unit });
				setCurrentQuestion((prev) => prev + 1);
			} else if (data.done === true && data.suggestions) {
				setQuestionData(null);
				setSuggestions(data.suggestions);
				setDynamics(data.dynamics || null);
				const recIdx = data.suggestions.findIndex((s: any) => s.recommended);
				setSelectedSuggestionIndex(recIdx >= 0 ? recIdx : 0);
				setImprovedPrompt(data.suggestions[recIdx >= 0 ? recIdx : 0]?.text || '');
				setScreenWithHistory("result");
			// Fallback: handle wrapped format
			} else if (data.type === "question") {
				setSuggestions([]);
				setQuestionData(data.content);
				setCurrentQuestion((prev) => prev + 1);
			} else if (data.type === "improvedPrompt") {
				setQuestionData(null);
				setImprovedPrompt(data.content.improvedPrompt);
			} else {
				throw new Error("Received invalid data structure from API: " + JSON.stringify(data).substring(0, 200));
			}
		} catch (e: any) {
			if (e.errorType && e.errorType === "limit_reached") {
				setScreenWithHistory("noPromptsRemaining");
			} else {
				setError({ type: "general", text: e.message?.toString() || e.toString() });
			}
		} finally {
			setLoading(false);
		}
	};

	const handleUndoAnswer = async () => {
		if (!conversationId) {
			setError({ type: "general", text: "Missing conversation ID." });
			return;
		}
		if (currentQuestion <= 1) {
			// Can't go back from the first question
			return;
		}
		setLoading(true);
		setError(null);

		try {
			const data = await sendMessageToBackground("UNDO_ANSWER", {
				conversationId,
			});

			if (data.type === "question") {
				setImprovedPrompt(null);
				setQuestionData(data.content);
				setCurrentQuestion((prev) => prev - 1);
			} else {
				throw new Error("Received invalid data structure from API: " + JSON.stringify(data).substring(0, 200));
			}
		} catch (e: any) {
			setError({ type: "general", text: e.message?.toString() || e.toString() });
		} finally {
			setLoading(false);
		}
	};

	const handleRetry = () => {
		setQuestionData(null);
		setConversationId(null);
		setError(null);
		setSuggestions([]);
		setDynamics(null);
		setSelectedSuggestionIndex(0);
		setLoading(false);
		setHasRequestedGuidedRefinement(false);
		setScreenWithHistory("welcome");
	};

	const upgradePlan = () => {
		setScreenWithHistory("upgradePlan");
	};

	const setScreenWithHistory = (newScreen: string) => {
		setScreenHistory((prev) => [...prev, newScreen]);
		setScreen(newScreen);
	};

	const goBack = () => {
		if (screenHistory.length > 1) {
			const newHistory = [...screenHistory];
			newHistory.pop(); // Remove current screen
			const previousScreen = newHistory[newHistory.length - 1]; // Get previous screen
			setScreenHistory(newHistory);
			setScreen(previousScreen);
		}
	};

	const handleImprovePrompt = async () => {
		try {
			setHasRequestedImprovedPrompt(true);
			setLoading(true);
			setError(null);

			let prompt = "";
			
			// In manual mode, use the manual prompt
			if (isManualMode) {
				prompt = manualPrompt.trim();
				if (!prompt) {
					setOriginalPrompt("");
					setError({ type: "emptyText", text: "Please enter a prompt in the text area to continue." });
					return;
				}
			} else {
				// Get current site adapter
				const siteAdapter = getCurrentSiteAdapter();
				if (!siteAdapter) {
					setError({ type: "general", text: "This site is not supported yet." });
					return;
				}

				// Get prompt from the current site
				prompt = getPromptText();
				if (!prompt) {
					setOriginalPrompt("");
					setError({ type: "emptyText", text: "Please write a prompt in the input field to continue." });
					return;
				}
			}

			setOriginalPrompt(prompt);

			const data = await sendMessageToBackground("FETCH_QUICK_IMPROVE", { prompt });
			if (plan !== "pro" && typeof data.remaining !== "undefined") {
				setRemainingPrompts(data.remaining);
			}

			setQuestionData(null);
			if (data.suggestions) {
				// New TextCoach format: multiple suggestions
				setSuggestions(data.suggestions);
				setDynamics(data.dynamics || null);
				const recIdx = data.suggestions.findIndex((s: any) => s.recommended);
				setSelectedSuggestionIndex(recIdx >= 0 ? recIdx : 0);
				setImprovedPrompt(data.suggestions[recIdx >= 0 ? recIdx : 0]?.text || '');
				setScreenWithHistory("result");
			} else if (data.type === "improvedPrompt") {
				// Fallback: old format
				setImprovedPrompt(data.content.improvedPrompt);
				setScreenWithHistory("result");
			} else {
				throw new Error("Received invalid data structure from API: " + JSON.stringify(data).substring(0, 200));
			}
		} catch (e: any) {
			if (e.errorType && e.errorType === "limit_reached") {
				setScreenWithHistory("noPromptsRemaining");
			} else {
				setError({ type: "general", text: e.message?.toString() || e.toString() });
			}
		} finally {
			setHasRequestedImprovedPrompt(false);
			setLoading(false);
		}
	};

	return (
		<div ref={appContainerRef} className={`app-container ${screen === "upgradePlan" ? "wide" : ""}`}>
			{
				<PromptGPTModal
					originalPrompt={originalPrompt}
					error={error}
					screen={screen}
					questionData={questionData}
					currentQuestion={currentQuestion}
					remainingPrompts={remainingPrompts}
					loading={loading}
					handleAnswerSubmit={handleAnswerSubmit}
					handleUndoAnswer={handleUndoAnswer}
					handleRetry={handleRetry}
					onGuidedRefinement={startGuidedRefinement}
					onImprovePrompt={handleImprovePrompt}
					upgradePlan={upgradePlan}
					improvedPrompt={improvedPrompt}
					suggestions={suggestions}
					dynamics={dynamics}
					selectedSuggestionIndex={selectedSuggestionIndex}
					onSelectSuggestion={(idx: number) => {
						setSelectedSuggestionIndex(idx);
						setImprovedPrompt(suggestions[idx]?.text || '');
					}}
					plan={plan}
					gotPlan={gotPlan}
					goBack={goBack}
					isManualMode={isManualMode}
					manualPrompt={manualPrompt}
					onManualPromptChange={setManualPrompt}
				/>
			}
		</div>
	);
}

export default App;
