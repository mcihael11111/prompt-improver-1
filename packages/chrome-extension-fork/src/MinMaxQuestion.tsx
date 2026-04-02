import { useState, useEffect } from 'react';

const MinMaxQuestion = ({ questionData, handleAnswerSubmit }) => {
  const { min, max, unit } = questionData;
  const [minValue, setMinValue] = useState(min);
  const [maxValue, setMaxValue] = useState(max);

  const formatWithUnit = (count, unitString) => {
    if (!unitString) {
      return `${count}`;
    }
    const pluralizedUnit = count === 1 ? unitString : `${unitString}s`;
    return `${count} ${pluralizedUnit}`;
  };

  const handleMinChange = (e) => {
    const newMin = Math.min(Number(e.target.value), maxValue);
    setMinValue(newMin);
  };

  const handleMaxChange = (e) => {
    const newMax = Math.max(Number(e.target.value), minValue);
    setMaxValue(newMax);
  };

  const handleSubmit = () => {
    const answer = `Between ${minValue} and ${maxValue}`;
    handleAnswerSubmit(answer);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && minValue !== null && maxValue !== null) {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [minValue, maxValue]);
  
  const getPercentage = (value) => {
    if (max === min) return 0;
    return ((value - min) / (max - min)) * 100;
  };
  
  const minPercentage = getPercentage(minValue);
  const maxPercentage = getPercentage(maxValue);

  const thumbSize = 24; // Must match --thumb-size in CSS
  const trackWidthCalcString = `(100% - ${thumbSize}px)`;
  
  const progressLeft = `calc(${trackWidthCalcString} * ${minPercentage / 100} + ${thumbSize / 2}px)`;
  const progressWidth = `calc(${trackWidthCalcString} * ${(maxPercentage - minPercentage) / 100})`;

  return (
    <div className="min-max-container">
      <div className="min-max-value-display">
        {formatWithUnit(minValue, unit)} - {formatWithUnit(maxValue, unit)}
      </div>

      <div className="min-max-slider-wrapper">
        <div className="slider-track" />
        <div 
          className="slider-progress" 
          style={{ left: progressLeft, width: progressWidth }} 
        />
        <input
          type="range"
          min={min}
          max={max}
          value={minValue}
          onChange={handleMinChange}
          className="slider"
          aria-label="Minimum value"
          style={{ zIndex: 4 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxValue}
          onChange={handleMaxChange}
          className="slider"
          aria-label="Maximum value"
          style={{ zIndex: 5 }}
        />
      </div>

      <div className="scale-labels">
        <div className="scale-label-group">
          <span className="scale-subtitle">{formatWithUnit(min, unit)}</span>
        </div>
        <div className="scale-label-group right">
          <span className="scale-subtitle">{formatWithUnit(max, unit)}</span>
        </div>
      </div>

      <div className="bottom-button-container">
        <button 
          className="primary next-button" 
          onClick={handleSubmit}
          disabled={minValue === null || maxValue === null}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default MinMaxQuestion;