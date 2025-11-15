import React, { useState, useEffect, useRef } from 'react';
import type { Page } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import {
  GraduationCap,
  FileText,
  Target,
  X,
  Archive,
  Shield,
} from 'lucide-react';

interface MoreMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

export const MoreMenu = ({ isOpen, onClose, currentPage, setCurrentPage }: MoreMenuProps) => {
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose]);

  const secondaryFeatures = [
    { page: 'Academy' as Page, label: t('nav_academy'), icon: <GraduationCap className="h-6 w-6" /> },
    { page: 'Draft Scenarios' as Page, label: 'Draft Scenarios', icon: <FileText className="h-6 w-6" /> },
    { page: 'Daily Challenge' as Page, label: 'Daily Challenge', icon: <Target className="h-6 w-6" /> },
    { page: 'Archives' as Page, label: t('nav_archives'), icon: <Archive className="h-6 w-6" /> },
    { page: 'Oracle' as Page, label: 'Meta Oracle', icon: <Shield className="h-6 w-6" /> },
  ];

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[hsl(var(--bg-primary)_/_0.7)] backdrop-blur-sm z-50 md:hidden"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={menuRef}
        className="fixed bottom-0 left-0 right-0 bg-[hsl(var(--surface))] border-t border-[hsl(var(--border))] rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[hsl(var(--surface))] border-b border-[hsl(var(--border))] px-4 py-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-[hsl(var(--text-primary))]">More</h2>
          <button
            onClick={onClose}
            className="p-2 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="px-4 py-4">
          <div className="flex flex-col gap-2">
            {secondaryFeatures.map(feature => {
              const isActive = currentPage === feature.page;
              return (
                <button
                  key={feature.page}
                  onClick={() => handleNavClick(feature.page)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-md transition-colors min-h-[48px] ${
                    isActive
                      ? 'bg-[hsl(var(--accent)_/_0.15)] text-[hsl(var(--accent))]'
                      : 'text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-tertiary))]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {feature.icon}
                  <span className="font-medium">{feature.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
