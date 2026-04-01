import React from 'react';

interface ToneAndVoiceProps {
  options: string[];
  selected: string | null;
  onChange: (value: string) => void;
}

const ToneAndVoice: React.FC<ToneAndVoiceProps> = ({ options, selected, onChange }) => {
  return (
    <div className="tc-tone-and-voice">
      {options.map((option) => (
        <button
          key={option}
          className={`tc-tone-and-voice__pill${selected === option ? ' tc-tone-and-voice__pill--selected' : ''}`}
          onClick={() => onChange(option)}
          type="button"
        >
          <span className="tc-tone-and-voice__radio">
            {selected === option && <span className="tc-tone-and-voice__radio-dot" />}
          </span>
          {option}
        </button>
      ))}
    </div>
  );
};

export default ToneAndVoice;
