import { useState } from 'react';

const RatingQuestion = ({ questionData, handleAnswerSubmit }) => {
  const [options, setOptions] = useState([0, 1, 2, 3, 4, 5]);
  const { minTitle, minSubtitle, maxTitle, maxSubtitle } = questionData;
  const [selectedRating, setSelectedRating] = useState(null);

  const handleChange = (option) => {
    setSelectedRating(option);
    handleAnswerSubmit(option);
  };

  return (
    <div>
      <fieldset className="rating-scale-container">
        {options.map((option) => (
          <div key={option} className="rating-option">
            <input
              type="radio"
              id={`rating-${option}`}
              name="skill-level"
              value={option}
              checked={selectedRating === option}
              onChange={() => handleChange(option)}
            />
            <label htmlFor={`rating-${option}`}>{option}</label>
          </div>
        ))}
      </fieldset>
      <div className="rating-labels">
        <div className="rating-label-group">
          <span className="rating-title">{minTitle}</span>
          <span className="rating-subtitle">{minSubtitle}</span>
        </div>
        <div className="rating-label-group right">
          <span className="rating-title">{maxTitle}</span>
          <span className="rating-subtitle">{maxSubtitle}</span>
        </div>
      </div>
    </div>
  );
};

export default RatingQuestion;