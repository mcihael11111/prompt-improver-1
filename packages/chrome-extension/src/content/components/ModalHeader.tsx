import React from 'react';

interface ModalHeaderProps {
  onMenuClick: () => void;
  onClose: () => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ onMenuClick, onClose }) => {
  return (
    <div className="tc-modal-header">
      <span className="tc-modal-header__logo">TextCoach</span>
      <div className="tc-modal-header__actions">
        <button
          className="tc-modal-header__menu-btn"
          onClick={onMenuClick}
          aria-label="Menu"
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
        <button
          className="tc-modal-header__close-btn"
          onClick={onClose}
          aria-label="Close"
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ModalHeader;
