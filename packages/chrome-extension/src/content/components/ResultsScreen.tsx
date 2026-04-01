import React from 'react';
import DynamicsCard from './DynamicsCard';
import SuggestionCard from './SuggestionCard';
import type { Dynamics } from './DynamicsCard';
import type { Suggestion } from './SuggestionCard';

interface ResultsScreenProps {
  dynamics: Dynamics;
  suggestions: Suggestion[];
  onCopy: () => void;
  onInsert?: () => void;
  onRetry: () => void;
  selectedIndex: number;
  onSelect: (index: number) => void;
  dynamicsBlurred?: boolean;
  truncatedReasoning?: boolean;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({
  dynamics,
  suggestions,
  onCopy,
  onInsert,
  onRetry,
  selectedIndex,
  onSelect,
  dynamicsBlurred,
  truncatedReasoning,
}) => {
  return (
    <div className="tc-results-screen">
      <DynamicsCard dynamics={dynamics} blurred={dynamicsBlurred} />

      <div className="tc-results-screen__suggestions" role="radiogroup">
        {suggestions.map((suggestion, index) => (
          <SuggestionCard
            key={index}
            suggestion={suggestion}
            selected={selectedIndex === index}
            onSelect={() => onSelect(index)}
            index={index}
            truncatedReasoning={truncatedReasoning}
          />
        ))}
      </div>

      <div className="tc-results-screen__actions">
        <button
          className="tc-results-screen__btn tc-results-screen__btn--secondary"
          onClick={onRetry}
          type="button"
        >
          Try Again
        </button>
        <button
          className="tc-results-screen__btn tc-results-screen__btn--primary"
          onClick={onCopy}
          type="button"
        >
          Copy Selected
        </button>
        {onInsert && (
          <button
            className="tc-results-screen__btn tc-results-screen__btn--primary"
            onClick={onInsert}
            type="button"
          >
            Insert
          </button>
        )}
      </div>
    </div>
  );
};

export default ResultsScreen;
