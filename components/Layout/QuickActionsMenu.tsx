import React, { useState, useRef, useEffect } from 'react';
import type { Page } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { Tooltip } from '../common/Tooltip';
import { Zap, Clock, FlaskConical } from 'lucide-react';

interface QuickActionsMenuProps {
  setCurrentPage: (page: Page) => void;
}

export const QuickActionsMenu = ({ setCurrentPage }: QuickActionsMenuProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const quickActions = [
    {
      label: 'Start Draft',
      icon: <FlaskConical className="h-4 w-4" />,
      action: () => {
        setCurrentPage('Strategy Forge');
        setIsOpen(false);
      },
    },
    {
      label: 'Daily Challenge',
      icon: <Zap className="h-4 w-4" />,
      action: () => {
        setCurrentPage('Daily Challenge');
        setIsOpen(false);
      },
    },
    {
      label: 'Recent Drafts',
      icon: <Clock className="h-4 w-4" />,
      action: () => {
        setCurrentPage('Archives');
        setIsOpen(false);
      },
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <Tooltip content="Quick Actions">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 min-w-[44px] min-h-[44px] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface))] hover:text-[hsl(var(--text-primary))] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
          aria-label="Quick Actions"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <Zap className="h-6 w-6" strokeWidth={1.5} />
        </button>
      </Tooltip>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-56 bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-md shadow-lg z-50 py-2"
          role="menu"
        >
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-tertiary))] transition-colors"
              role="menuitem"
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
