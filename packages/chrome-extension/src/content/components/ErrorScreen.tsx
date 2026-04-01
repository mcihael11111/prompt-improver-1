import React from 'react';

interface ErrorScreenProps {
  error: string;
  onRetry: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, onRetry }) => {
  return (
    <div className="tc-error-screen">
      <div className="tc-error-screen__icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="16" r="1" fill="currentColor" />
        </svg>
      </div>
      <p className="tc-error-screen__message">{error}</p>
      <button
        className="tc-error-screen__retry-btn"
        onClick={onRetry}
        type="button"
      >
        Try Again
      </button>
    </div>
  );
};

export default ErrorScreen;
