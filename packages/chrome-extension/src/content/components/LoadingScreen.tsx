import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="tc-loading-screen">
      <div className="tc-loading-screen__dynamics tc-shimmer" />
      <div className="tc-loading-screen__suggestions">
        {[1, 2, 3].map((i) => (
          <div key={i} className="tc-loading-screen__suggestion-card">
            <div className="tc-loading-screen__badge tc-shimmer" />
            <div className="tc-loading-screen__text-line tc-loading-screen__text-line--long tc-shimmer" />
            <div className="tc-loading-screen__text-line tc-loading-screen__text-line--medium tc-shimmer" />
            <div className="tc-loading-screen__text-line tc-loading-screen__text-line--short tc-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;
