import React from 'react';

interface ScaleProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  unit?: string;
}

const Scale: React.FC<ScaleProps> = ({ value, onChange, min, max, unit }) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="tc-scale">
      <div className="tc-scale__value-display" style={{ left: `${percentage}%` }}>
        {value}{unit && ` ${unit}`}
      </div>
      <input
        className="tc-scale__slider"
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="tc-scale__range-labels">
        <span>{min}{unit && ` ${unit}`}</span>
        <span>{max}{unit && ` ${unit}`}</span>
      </div>
    </div>
  );
};

export default Scale;
