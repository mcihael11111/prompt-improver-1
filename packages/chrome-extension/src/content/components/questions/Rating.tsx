import React from 'react';

interface RatingProps {
  value: number | null;
  onChange: (value: number) => void;
  minTitle: string;
  maxTitle: string;
  minSubtitle?: string;
  maxSubtitle?: string;
}

const Rating: React.FC<RatingProps> = ({
  value,
  onChange,
  minTitle,
  maxTitle,
  minSubtitle,
  maxSubtitle,
}) => {
  const numbers = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="tc-rating">
      <div className="tc-rating__circles">
        {numbers.map((num) => (
          <button
            key={num}
            className={`tc-rating__circle${value === num ? ' tc-rating__circle--selected' : ''}`}
            onClick={() => onChange(num)}
            type="button"
          >
            {num}
          </button>
        ))}
      </div>
      <div className="tc-rating__labels">
        <div className="tc-rating__label tc-rating__label--min">
          <span className="tc-rating__label-title">{minTitle}</span>
          {minSubtitle && <span className="tc-rating__label-subtitle">{minSubtitle}</span>}
        </div>
        <div className="tc-rating__label tc-rating__label--max">
          <span className="tc-rating__label-title">{maxTitle}</span>
          {maxSubtitle && <span className="tc-rating__label-subtitle">{maxSubtitle}</span>}
        </div>
      </div>
    </div>
  );
};

export default Rating;
