import React from 'react';

interface ModalFooterProps {
  remaining: number;
  onUpgradeClick: () => void;
}

const ModalFooter: React.FC<ModalFooterProps> = ({ remaining, onUpgradeClick }) => {
  return (
    <div className="tc-modal-footer">
      <span className="tc-modal-footer__remaining">
        {remaining} suggestion{remaining !== 1 ? 's' : ''} remaining
      </span>
      <button
        className="tc-modal-footer__upgrade-btn"
        onClick={onUpgradeClick}
        type="button"
      >
        Unlock more
      </button>
    </div>
  );
};

export default ModalFooter;
