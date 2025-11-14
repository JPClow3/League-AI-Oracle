import React from 'react';
import { Modal } from './Modal';
import { ArrowUp, ArrowDown, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ['Ctrl', 'K'], description: 'Open Command Palette', category: 'Navigation' },
  { keys: ['Esc'], description: 'Close Modal/Palette', category: 'Navigation' },
  { keys: ['Tab'], description: 'Navigate forward', category: 'Navigation' },
  { keys: ['Shift', 'Tab'], description: 'Navigate backward', category: 'Navigation' },

  // Command Palette
  { keys: ['↑'], description: 'Previous command', category: 'Command Palette' },
  { keys: ['↓'], description: 'Next command', category: 'Command Palette' },
  { keys: ['Enter'], description: 'Execute command', category: 'Command Palette' },

  // Strategy Forge
  { keys: ['Enter'], description: 'Select champion slot', category: 'Strategy Forge' },
  { keys: ['Space'], description: 'Select champion slot', category: 'Strategy Forge' },
  { keys: ['Drag'], description: 'Reorder champions', category: 'Strategy Forge' },

  // General
  { keys: ['?'], description: 'Show keyboard shortcuts', category: 'General' },
];

const KeyBadge = ({ keyLabel }: { keyLabel: string }) => {
  const isSpecial = ['Ctrl', 'Shift', 'Alt', 'Cmd', 'Enter', 'Space', 'Tab', 'Esc'].includes(keyLabel);

  return (
    <kbd
      className={`inline-flex items-center justify-center min-w-[2rem] h-7 px-2 text-xs font-semibold rounded border shadow-sm ${
        isSpecial
          ? 'bg-[hsl(var(--accent)_/_0.1)] border-[hsl(var(--accent))] text-[hsl(var(--accent))]'
          : 'bg-[hsl(var(--surface-secondary))] border-[hsl(var(--border))] text-[hsl(var(--text-primary))]'
      }`}
    >
      {keyLabel === '↑' ? (
        <ArrowUp size={14} />
      ) : keyLabel === '↓' ? (
        <ArrowDown size={14} />
      ) : keyLabel === 'Drag' ? (
        '🖱️'
      ) : (
        keyLabel
      )}
    </kbd>
  );
};

export const KeyboardShortcutsModal = ({ isOpen, onClose }: KeyboardShortcutsModalProps) => {
  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" size="2xl">
      <div className="p-6">
        <div className="mb-6 p-4 bg-[hsl(var(--surface-secondary))] border border-[hsl(var(--border))] rounded-lg">
          <div className="flex items-center gap-2 text-[hsl(var(--text-secondary))]">
            <Keyboard size={20} />
            <p className="text-sm">Use these keyboard shortcuts to navigate faster and boost your productivity!</p>
          </div>
        </div>

        <div className="space-y-6">
          {categories.map(category => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))] mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-[hsl(var(--accent))] rounded-full" />
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts
                  .filter(s => s.category === category)
                  .map((shortcut, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-[hsl(var(--surface))] hover:bg-[hsl(var(--surface-secondary))] border border-[hsl(var(--border))] rounded-md transition-colors"
                    >
                      <span className="text-[hsl(var(--text-secondary))] text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIdx) => (
                          <React.Fragment key={keyIdx}>
                            <KeyBadge keyLabel={key} />
                            {keyIdx < shortcut.keys.length - 1 && (
                              <span className="text-[hsl(var(--text-muted))] text-xs mx-1">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-[hsl(var(--border))]">
          <p className="text-xs text-[hsl(var(--text-muted))] text-center">
            Press <KeyBadge keyLabel="Esc" /> or click outside to close this dialog
          </p>
        </div>
      </div>
    </Modal>
  );
};
