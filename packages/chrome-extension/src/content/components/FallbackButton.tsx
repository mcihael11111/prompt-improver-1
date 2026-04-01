import React, { useRef, useState, useCallback } from 'react';

interface FallbackButtonProps {
  onClick: () => void;
}

const FallbackButton: React.FC<FallbackButtonProps> = ({ onClick }) => {
  const [position, setPosition] = useState({ top: 25 });
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartTop = useRef(0);
  const hasMoved = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    hasMoved.current = false;
    dragStartY.current = e.clientY;
    dragStartTop.current = position.top;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return;
      const deltaY = moveEvent.clientY - dragStartY.current;
      if (Math.abs(deltaY) > 3) {
        hasMoved.current = true;
      }
      const newTopPx = (dragStartTop.current / 100) * window.innerHeight + deltaY;
      const newTopVh = Math.max(5, Math.min(90, (newTopPx / window.innerHeight) * 100));
      setPosition({ top: newTopVh });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [position.top]);

  const handleClick = useCallback(() => {
    if (!hasMoved.current) {
      onClick();
    }
  }, [onClick]);

  return (
    <button
      className="tc-fallback-button"
      style={{
        position: 'fixed',
        top: `${position.top}vh`,
        right: 0,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      aria-label="Open TextCoach"
      type="button"
    >
      <svg
        className="tc-fallback-button__icon"
        width="24"
        height="24"
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
      <span className="tc-fallback-button__label">TC</span>
    </button>
  );
};

export default FallbackButton;
