import React, { useState } from 'react';

interface ReasoningBlockProps {
  reasoning: string;
  truncated?: boolean;
}

const ReasoningBlock: React.FC<ReasoningBlockProps> = ({ reasoning, truncated }) => {
  const [expanded, setExpanded] = useState(false);

  const displayText = truncated && !expanded
    ? reasoning.split('.')[0] + '.'
    : reasoning;

  return (
    <div className="tc-reasoning-block">
      <button
        className={`tc-reasoning-block__toggle${expanded ? ' tc-reasoning-block__toggle--expanded' : ''}`}
        onClick={() => setExpanded(!expanded)}
        type="button"
      >
        <svg
          className="tc-reasoning-block__chevron"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        <span className="tc-reasoning-block__label">Why this works</span>
      </button>
      {expanded && (
        <p className="tc-reasoning-block__text">{displayText}</p>
      )}
    </div>
  );
};

export default ReasoningBlock;
