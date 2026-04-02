import SingleChoiceQuestion from "./SingleChoiceQuestion";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import RatingQuestion from "./RatingQuestion";
import ScaleQuestion from "./ScaleQuestion";
import MinMaxQuestion from "./MinMaxQuestion";
import FreeTextQuestion from "./FreeTextQuestion";
import Result from "./Result";

const Question = ({ questionData, currentQuestion, handleAnswerSubmit, handleUndoAnswer, handleRetry }) => {
	// Add defensive check to prevent rendering with incomplete data
	if (!questionData || !questionData.questionType || !questionData.question) {
		return null; // Prevent rendering until we have complete question data
	}
	
	const { questionType } = questionData;
	const questionTypeMap = {
		singleChoice: "Single-Select",
		yesNo: "Yes/No",
		toneAndVoice: "Tone",
		structureAndFormatting: "Format",
		multipleChoice: "Multi-Select",
		rating: "Rating",
		scale: "Scale",
		minMax: "Min/Max",
		freeText: "Free Text",
	};

	const renderQuestionType = () => {
		switch (questionType) {
			case "singleChoice":
			case "yesNo":
			case "toneAndVoice":
			case "structureAndFormatting":
				return <SingleChoiceQuestion options={questionData.options} handleAnswerSubmit={handleAnswerSubmit} />;
			case "multipleChoice":
				return <MultipleChoiceQuestion options={questionData.options} handleAnswerSubmit={handleAnswerSubmit} />;
			case "rating":
				return <RatingQuestion questionData={questionData} handleAnswerSubmit={handleAnswerSubmit} />;
			case "scale":
				return <ScaleQuestion questionData={questionData} handleAnswerSubmit={handleAnswerSubmit} />;
			case "minMax":
				return <MinMaxQuestion questionData={questionData} handleAnswerSubmit={handleAnswerSubmit} />;
			case "freeText":
				return <FreeTextQuestion handleAnswerSubmit={handleAnswerSubmit} />;
			case "improvedPrompt":
				return <Result promptText={questionData.improvedPrompt} onRetry={handleRetry} />;
			default:
				return <div>Unsupported question type</div>;
		}
	};

	const isResultScreen = questionType === "improvedPrompt";
	const canGoBack = currentQuestion > 1 && !isResultScreen;

	return (
		<>
			<div className="question-content">
				{!isResultScreen && (
					<>
						<div className="question-header">
							{canGoBack && (
								<p className="question-progress back-button" onClick={handleUndoAnswer}>
									<svg xmlns="http://www.w3.org/2000/svg" width="5" height="9" viewBox="0 0 5 9" fill="none">
										<path d="M3.83398 7.83301L0.500652 4.49967L3.83398 1.16634" stroke="#A96EE2" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round" />
									</svg>
									<span>BACK</span>
								</p>
							)}
							<p className="question-progress" aria-live="polite">
								QUESTION {currentQuestion} : {questionTypeMap[questionType].toUpperCase()}
							</p>
						</div>
						<h2 className="question-text">{questionData.question}</h2>
					</>
				)}
				{renderQuestionType()}
			</div>
		</>
	);
};

export default Question;
