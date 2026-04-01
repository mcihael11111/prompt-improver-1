import React from 'react';

interface StructureAndFormattingProps {
  options: string[];
  selected: string | null;
  onChange: (value: string) => void;
}

const StructureAndFormatting: React.FC<StructureAndFormattingProps> = ({ options, selected, onChange }) => {
  return (
    <div className="tc-structure-and-formatting">
      {options.map((option) => (
        <button
          key={option}
          className={`tc-structure-and-formatting__pill${selected === option ? ' tc-structure-and-formatting__pill--selected' : ''}`}
          onClick={() => onChange(option)}
          type="button"
        >
          <span className="tc-structure-and-formatting__radio">
            {selected === option && <span className="tc-structure-and-formatting__radio-dot" />}
          </span>
          {option}
        </button>
      ))}
    </div>
  );
};

export default StructureAndFormatting;
