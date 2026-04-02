import { useState, useEffect, useRef } from "react";

const SingleChoiceQuestion = ({ options, handleAnswerSubmit }) => {
	const [selectedOption, setSelectedOption] = useState(null);
	const [customInput, setCustomInput] = useState("");
	const [processedOptions, setProcessedOptions] = useState(options);
	const [showNextButton, setShowNextButton] = useState(false);
	const customInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		// Replace 'Other' or 'other' with 'Other please specify'
		const updatedOptions = options.map((option) => (option.toLowerCase() === "other" ? "Other please specify" : option));
		setProcessedOptions(updatedOptions);
	}, [options]);

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Enter" && selectedOption === "Other please specify" && customInput.trim()) {
				e.preventDefault();
				e.stopPropagation();
				handleNextClick();
			}
		};

		if (selectedOption === "Other please specify") {
			window.addEventListener("keydown", handleKeyDown, true);
			return () => window.removeEventListener("keydown", handleKeyDown, true);
		}
	}, [selectedOption, customInput]);

	const handleChange = (option) => {
		setSelectedOption(option);
		if (option !== "Other please specify") {
			handleAnswerSubmit(option);
			setCustomInput("");
			setShowNextButton(false);
		} else {
			setShowNextButton(true);
			// Focus the input after it appears
			setTimeout(() => {
				if (customInputRef.current) {
					customInputRef.current.focus();
				}
			}, 100);
		}
	};

	const handleCustomInputChange = (e) => {
		const value = e.target.value;
		if (value.length <= 30) {
			setCustomInput(value);
		}
	};

	const handleNextClick = () => {
		if (customInput.trim()) {
			handleAnswerSubmit(customInput);
		} else {
			handleAnswerSubmit("Other please specify");
		}
		setShowNextButton(false);
	};

	const handleInputClick = (e) => {
		// Ensure the input gets focus even when clicked
		e.preventDefault();
		e.stopPropagation();
		if (customInputRef.current) {
			customInputRef.current.focus();
		}
	};

	return (
		<>
			<fieldset className="options-grid">
				{processedOptions.map((option) => (
					<div key={option} className="radio-option">
						<input type="radio" id={option} name="single-choice-option" value={option} checked={selectedOption === option} onChange={() => handleChange(option)} />
						<label htmlFor={option}>
							<span className="radio-custom" aria-hidden="true"></span>
							{option}
						</label>
					</div>
				))}
				{selectedOption === "Other please specify" && (
					<div className="custom-input-container" style={{display: "block", width: "100%", marginTop: "10px" }}>
						<input 
							ref={customInputRef}
							type="text" 
							value={customInput} 
							onChange={handleCustomInputChange}
							onClick={handleInputClick}
							onMouseDown={handleInputClick}
							placeholder="Please specify..." 
							className="custom-text-input" 
							maxLength={100}
							autoFocus
						/>
						{showNextButton && (
							<div className="bottom-button-container">
								<button className="primary next-button" onClick={handleNextClick} disabled={!customInput.trim()}>
									Next
								</button>
							</div>
						)}
					</div>
				)}
			</fieldset>
		</>
	);
};

export default SingleChoiceQuestion;
