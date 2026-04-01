import React from 'react';

interface FreeTextProps {
  value: string;
  onChange: (value: string) => void;
}

const FreeText: React.FC<FreeTextProps> = ({ value, onChange }) => {
  return (
    <div className="tc-free-text">
      <input
        className="tc-free-text__input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer..."
      />
    </div>
  );
};

export default FreeText;
