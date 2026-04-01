import React from 'react';

interface MinMaxProps {
  minValue: number;
  maxValue: number;
  onChange: (minValue: number, maxValue: number) => void;
  min: number;
  max: number;
  unit?: string;
}

const MinMax: React.FC<MinMaxProps> = ({ minValue, maxValue, onChange, min, max, unit }) => {
  const handleMinChange = (newMin: number) => {
    if (newMin <= maxValue) {
      onChange(newMin, maxValue);
    }
  };

  const handleMaxChange = (newMax: number) => {
    if (newMax >= minValue) {
      onChange(minValue, newMax);
    }
  };

  return (
    <div className="tc-min-max">
      <div className="tc-min-max__values">
        <span className="tc-min-max__value">
          Min: {minValue}{unit && ` ${unit}`}
        </span>
        <span className="tc-min-max__value">
          Max: {maxValue}{unit && ` ${unit}`}
        </span>
      </div>
      <div className="tc-min-max__sliders">
        <input
          className="tc-min-max__slider tc-min-max__slider--min"
          type="range"
          min={min}
          max={max}
          value={minValue}
          onChange={(e) => handleMinChange(Number(e.target.value))}
        />
        <input
          className="tc-min-max__slider tc-min-max__slider--max"
          type="range"
          min={min}
          max={max}
          value={maxValue}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
        />
      </div>
      <div className="tc-min-max__range-labels">
        <span>{min}{unit && ` ${unit}`}</span>
        <span>{max}{unit && ` ${unit}`}</span>
      </div>
    </div>
  );
};

export default MinMax;
