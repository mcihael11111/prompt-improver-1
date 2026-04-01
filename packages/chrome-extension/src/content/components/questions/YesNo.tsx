import React from 'react';

interface YesNoProps {
  selected: boolean | null;
  onChange: (value: boolean) => void;
}

const YesNo: React.FC<YesNoProps> = ({ selected, onChange }) => {
  return (
    <div className="tc-yes-no">
      <button
        className={`tc-yes-no__pill${selected === true ? ' tc-yes-no__pill--selected' : ''}`}
        onClick={() => onChange(true)}
        type="button"
      >
        <span className="tc-yes-no__radio">
          {selected === true && <span className="tc-yes-no__radio-dot" />}
        </span>
        Yes
      </button>
      <button
        className={`tc-yes-no__pill${selected === false ? ' tc-yes-no__pill--selected' : ''}`}
        onClick={() => onChange(false)}
        type="button"
      >
        <span className="tc-yes-no__radio">
          {selected === false && <span className="tc-yes-no__radio-dot" />}
        </span>
        No
      </button>
    </div>
  );
};

export default YesNo;
