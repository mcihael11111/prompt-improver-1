import React from 'react';

const PrivacyBadge: React.FC = () => {
  return (
    <div className="tc-privacy-badge">
      <svg
        className="tc-privacy-badge__icon"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
        <path
          d="M7 11V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7V11"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className="tc-privacy-badge__text">Your conversations are never stored</span>
    </div>
  );
};

export default PrivacyBadge;
