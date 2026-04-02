import { useState, useEffect } from 'react';

const MultipleChoiceQuestion = ({ options, handleAnswerSubmit }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleOptionChange = (option) => {
    setSelectedOptions(prev => 
      prev.includes(option)
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  const handleSubmit = () => {
    handleAnswerSubmit(selectedOptions);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && selectedOptions.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [selectedOptions]);

  return (
    <>
      <fieldset className="options-grid">
        {options.map((option) => (
          <div key={option} className="radio-option">
            <input
              type="checkbox"
              id={option}
              name={option}
              value={option}
              checked={selectedOptions.includes(option)}
              onChange={() => handleOptionChange(option)}
            />
            <label htmlFor={option}>
              <span className="checkbox-custom" aria-hidden="true"></span>
              {option}
            </label>
          </div>
        ))}
      </fieldset>
      <div className="bottom-button-container">
        <button 
          className="primary next-button" 
          onClick={handleSubmit}
          disabled={selectedOptions.length === 0}
        >
          Next
        </button>
      </div>
    </>
  );
};

export default MultipleChoiceQuestion;