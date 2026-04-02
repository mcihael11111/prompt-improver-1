import { useState, useEffect, useRef } from "react";

const FreeTextQuestion = ({ handleAnswerSubmit }) => {
	const [textInput, setTextInput] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const handleInputChange = (e) => {
		const value = e.target.value;
		setTextInput(value);
	};

	const handleSubmit = () => {
		if (textInput.trim()) {
			handleAnswerSubmit(textInput.trim());
		}
	};

	const handleInputClick = (e) => {
		// Ensure the input gets focus even when clicked
		e.preventDefault();
		e.stopPropagation();
		if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	useEffect(() => {
		// Force focus on mount with a slight delay to ensure DOM is ready
		const timer = setTimeout(() => {
			if (inputRef.current) {
				inputRef.current.focus();
			}
		}, 100);

		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Enter" && textInput.trim()) {
				e.preventDefault();
				e.stopPropagation();
				handleSubmit();
			}
		};

		window.addEventListener("keydown", handleKeyDown, true);
		return () => window.removeEventListener("keydown", handleKeyDown, true);
	}, [textInput]);

	return (
		<>
			<div className="custom-input-container" style={{display: "block", width: "100%", marginTop: "10px" }}>
				<input 
					ref={inputRef}
					type="text" 
					value={textInput} 
					onChange={handleInputChange}
					onClick={handleInputClick}
					onMouseDown={handleInputClick}
					placeholder="Please specify..." 
					className="custom-text-input" 
					maxLength={100}
					autoFocus
				/>
				<div className="bottom-button-container">
					<button 
						className="primary next-button" 
						onClick={handleSubmit} 
						disabled={!textInput.trim()}
					>
						Next
					</button>
				</div>
			</div>
		</>
	);
};

export default FreeTextQuestion;