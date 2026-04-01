import React from 'react';
import ModalHeader from './ModalHeader';
import ModalFooter from './ModalFooter';

interface ModalProps {
  children: React.ReactNode;
  wide?: boolean;
  onClose: () => void;
  onMenuClick: () => void;
  remaining: number;
  onUpgradeClick: () => void;
}

const Modal: React.FC<ModalProps> = ({
  children,
  wide,
  onClose,
  onMenuClick,
  remaining,
  onUpgradeClick,
}) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="tc-modal-overlay" onClick={handleBackdropClick}>
      <div className={`tc-modal${wide ? ' tc-modal--wide' : ''}`}>
        <ModalHeader onMenuClick={onMenuClick} onClose={onClose} />
        <div className="tc-modal__body">{children}</div>
        <ModalFooter
          remaining={remaining}
          onUpgradeClick={onUpgradeClick}
        />
      </div>
    </div>
  );
};

export default Modal;
