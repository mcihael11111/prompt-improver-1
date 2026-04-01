import React from 'react';
import ReasoningBlock from './ReasoningBlock';

interface Suggestion {
  tone: string;
  text: string;
  reasoning: string;
  recommended?: boolean;
}

interface SuggestionCardProps {
  suggestion: Suggestion;
  selected: boolean;
  onSelect: () => void;
  index: number;
  truncatedReasoning?: boolean;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  selected,
  onSelect,
  index,
  truncatedReasoning,
}) => {
  return (
    <div
      className={`tc-suggestion-card${selected ? ' tc-suggestion-card--selected' : ''}`}
      onClick={onSelect}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="tc-suggestion-card__header">
        <span className="tc-suggestion-card__radio">
          {selected && <span className="tc-suggestion-card__radio-dot" />}
        </span>
        <span className="tc-suggestion-card__tone-badge">{suggestion.tone}</span>
        {suggestion.recommended && (
          <span className="tc-suggestion-card__recommended">Recommended</span>
        )}
      </div>
      <p className="tc-suggestion-card__text">{suggestion.text}</p>
      <ReasoningBlock reasoning={suggestion.reasoning} truncated={truncatedReasoning} />
    </div>
  );
};

export type { Suggestion };
export default SuggestionCard;
