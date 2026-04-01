import React from 'react';

interface FloatingButtonProps {
  onClick: () => void;
  position: {
    top?: number | string;
    left?: number | string;
    right?: number | string;
    bottom?: number | string;
  };
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onClick, position }) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    ...(position.top !== undefined && { top: position.top }),
    ...(position.left !== undefined && { left: position.left }),
    ...(position.right !== undefined && { right: position.right }),
    ...(position.bottom !== undefined && { bottom: position.bottom }),
  };

  return (
    <button
      className="tc-floating-button"
      onClick={onClick}
      style={style}
      aria-label="Open TextCoach"
      type="button"
    >
      <svg
        className="tc-floating-button__icon"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
          fill="currentColor"
        />
        <path
          d="M9 11L12 14L15 11"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default FloatingButton;
