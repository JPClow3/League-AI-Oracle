import React from 'react';
import { Modal } from './Modal';
import { HelpCircle } from 'lucide-react';
import { getHelpContent } from '../../lib/helpContent';
import type { Page } from '../../types';

interface ContextualHelpProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: Page;
}

/**
 * Contextual Help Component
 * Shows page-specific help tips and guidance
 */
export const ContextualHelp = ({ isOpen, onClose, currentPage }: ContextualHelpProps) => {
  const tips = getHelpContent(currentPage);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Help & Tips" size="md">
      <div className="space-y-4 p-2">
        {tips.length === 0 ? (
          <div className="text-center py-8 text-[hsl(var(--text-secondary))]">
            <HelpCircle className="h-12 w-12 mx-auto mb-3 text-[hsl(var(--text-muted))]" />
            <p>No help content available for this page.</p>
          </div>
        ) : (
          tips.map((tip, index) => (
            <div
              key={index}
              className="p-4 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg"
            >
              <h3 className="font-semibold text-[hsl(var(--text-primary))] mb-2 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-[hsl(var(--accent))]" />
                {tip.title}
              </h3>
              <p className="text-sm text-[hsl(var(--text-secondary))]">{tip.content}</p>
            </div>
          ))
        )}
        <div className="pt-4 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--text-muted))] text-center">
          Tip: Press{' '}
          <kbd className="px-1.5 py-0.5 bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded">
            Ctrl+K
          </kbd>{' '}
          for keyboard shortcuts
        </div>
      </div>
    </Modal>
  );
};
