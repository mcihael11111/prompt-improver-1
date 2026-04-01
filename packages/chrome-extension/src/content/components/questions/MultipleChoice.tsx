import React from 'react';

interface MultipleChoiceProps {
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = ({ options, selected, onChange }) => {
  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="tc-multiple-choice">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            className={`tc-multiple-choice__pill${isSelected ? ' tc-multiple-choice__pill--selected' : ''}`}
            onClick={() => toggleOption(option)}
            type="button"
          >
            <span className="tc-multiple-choice__checkbox">
              {isSelected && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
            {option}
          </button>
        );
      })}
    </div>
  );
};

export default MultipleChoice;
