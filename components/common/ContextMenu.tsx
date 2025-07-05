import React, { useEffect, useRef } from 'react';
import { ContextMenuItem, ContextMenuItemAction } from '../../types';

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { top: number; left: number };
  onClose: () => void;
  onSelect: (action: ContextMenuItemAction) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ items, position, onClose, onSelect }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleItemClick = (action: ContextMenuItemAction) => {
    onSelect(action);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-48 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-2xl animate-pop-in"
      style={{ top: position.top, left: position.left }}
    >
      {items.map((item) => (
        <button
          key={item.action}
          onClick={() => handleItemClick(item.action)}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ContextMenu;
