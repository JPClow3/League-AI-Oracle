import React, { useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  isLoading = false,
}) => {
  // Keyboard support: Enter to confirm, Escape to cancel
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isLoading) {
        e.preventDefault();
        onConfirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onConfirm, onClose]);

  const getVariantConfig = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle className="h-6 w-6" />,
          iconColor: 'text-[hsl(var(--error))]',
          bgColor: 'bg-[hsl(var(--error)_/_0.1)]',
          borderColor: 'border-[hsl(var(--error)_/_0.3)]',
          textColor: 'text-[hsl(var(--error))]',
        };
      case 'warning':
        return {
          icon: <AlertCircle className="h-6 w-6" />,
          iconColor: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-500',
        };
      default:
        return {
          icon: <Info className="h-6 w-6" />,
          iconColor: 'text-[hsl(var(--accent))]',
          bgColor: 'bg-[hsl(var(--accent)_/_0.1)]',
          borderColor: 'border-[hsl(var(--accent)_/_0.3)]',
          textColor: 'text-[hsl(var(--accent))]',
        };
    }
  };

  const config = getVariantConfig();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-6 p-6">
        <div className={`flex items-start gap-4 p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
          <div className={`flex-shrink-0 ${config.iconColor}`}>{config.icon}</div>
          <p className={`text-base flex-grow ${config.textColor}`}>{message}</p>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={isLoading}
            loading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
