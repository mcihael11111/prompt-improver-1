import React, { useEffect, useRef } from 'react';

interface MenuItem {
  label: string;
  onClick: () => void;
}

interface MenuDropdownProps {
  isOpen: boolean;
  items: MenuItem[];
  onClose: () => void;
}

const MenuDropdown: React.FC<MenuDropdownProps> = ({ isOpen, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="tc-menu-dropdown" ref={menuRef}>
      <ul className="tc-menu-dropdown__list">
        {items.map((item, index) => (
          <li key={index} className="tc-menu-dropdown__item">
            <button
              className="tc-menu-dropdown__button"
              onClick={() => {
                item.onClick();
                onClose();
              }}
              type="button"
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MenuDropdown;
