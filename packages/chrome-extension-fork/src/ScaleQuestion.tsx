import { useState, useEffect } from 'react';

const ScaleQuestion = ({ questionData, handleAnswerSubmit }) => {
  const { min, max, minTitle, maxTitle, unit } = questionData;
  // Set initial value to be in the middle of the range as a sensible default
  const [value, setValue] = useState(min + Math.round((max - min) / 2));

  const handleValueChange = (e) => {
    setValue(Number(e.target.value));
  };

  const handleSubmit = () => {
    handleAnswerSubmit(value);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && value !== null && value !== undefined) {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [value]);

  const formatWithUnit = (count, unitString) => {
    if (!unitString) {
      return `${count}`;
    }
    const pluralizedUnit = count === 1 ? unitString : `${unitString}s`;
    return `${count} ${pluralizedUnit}`;
  };

  const getProgressPercentage = () => {
    if (max === min) return 0;
    return ((value - min) / (max - min)) * 100;
  };
  
  const percentage = getProgressPercentage();
  const thumbSize = 24; // Must match --thumb-size in CSS
  const trackWidthCalc = `calc(100% - ${thumbSize}px)`;
  
  const progressWidth = `calc(${trackWidthCalc} * ${percentage / 100})`;
  const bubbleLeft = `calc(${trackWidthCalc} * ${percentage / 100} + ${thumbSize / 2}px)`;

  return (
    <div className="scale-container">
      <div className="slider-wrapper">
        <div className="slider-value-display" style={{ left: bubbleLeft }}>
          {formatWithUnit(value, unit)}
        </div>
        <div className="slider-track"></div>
        <div className="slider-progress" style={{ width: progressWidth }}></div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleValueChange}
          className="slider"
        />
      </div>
      <div className="scale-labels">
        <div className="scale-label-group">
          <span className="scale-title">{minTitle}</span>
          {unit && formatWithUnit(min, unit) !== minTitle && (
            <span className="scale-subtitle">{formatWithUnit(min, unit)}</span>
          )}
        </div>
        <div className="scale-label-group right">
          <span className="scale-title">{maxTitle}</span>
          {unit && formatWithUnit(max, unit) !== maxTitle && (
            <span className="scale-subtitle">{formatWithUnit(max, unit)}</span>
          )}
        </div>
      </div>
      <div className="bottom-button-container">
        <button 
          className="primary next-button" 
          onClick={handleSubmit}
          disabled={value === null || value === undefined}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ScaleQuestion;