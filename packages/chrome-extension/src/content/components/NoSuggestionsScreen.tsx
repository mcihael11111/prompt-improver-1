import React from 'react';

interface NoSuggestionsScreenProps {
  onUpgrade: () => void;
}

const NoSuggestionsScreen: React.FC<NoSuggestionsScreenProps> = ({ onUpgrade }) => {
  return (
    <div className="tc-no-suggestions-screen">
      <div className="tc-no-suggestions-screen__icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
            fill="currentColor"
          />
          <path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="tc-no-suggestions-screen__title">No suggestions remaining</h3>
      <p className="tc-no-suggestions-screen__text">
        You've used all your free suggestions. Upgrade to keep the conversation going.
      </p>
      <button
        className="tc-no-suggestions-screen__upgrade-btn"
        onClick={onUpgrade}
        type="button"
      >
        Upgrade Plan
      </button>
    </div>
  );
};

export default NoSuggestionsScreen;
