import React from "react";

interface ErrorDisplayProps {
	error: string | Error | null;
	onRefresh: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRefresh }) => {
	if (!error) return null;

	const errorHeader = error.type === "emptyText" ? "Oops something's missing" : "An error has occurred";
	return (
		<div className="question-content">
			<div className="error-container">
				<img src={chrome.runtime.getURL("images/delete_circle.svg")} />
				<span>{errorHeader}</span>
				<p>{error.text}</p>
			</div>
			<div className="bottom-button-container">
				<button className="primary next-button" onClick={onRefresh}>
					Refresh
				</button>
			</div>
		</div>
	);
};

export default ErrorDisplay;
