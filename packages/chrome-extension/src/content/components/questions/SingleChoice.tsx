import React from 'react';

interface SingleChoiceProps {
  options: string[];
  selected: string | null;
  onChange: (value: string) => void;
}

const SingleChoice: React.FC<SingleChoiceProps> = ({ options, selected, onChange }) => {
  return (
    <div className="tc-single-choice">
      {options.map((option) => (
        <button
          key={option}
          className={`tc-single-choice__pill${selected === option ? ' tc-single-choice__pill--selected' : ''}`}
          onClick={() => onChange(option)}
          type="button"
        >
          <span className="tc-single-choice__radio">
            {selected === option && <span className="tc-single-choice__radio-dot" />}
          </span>
          {option}
        </button>
      ))}
    </div>
  );
};

export default SingleChoice;
