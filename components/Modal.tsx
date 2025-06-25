
import React, { useEffect, useRef } from 'react';
import { XMarkIcon } from './icons/index';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  titleIcon?: React.ReactNode;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  panelClassName?: string;
  modalId: string;
  titleId?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  titleIcon,
  children,
  footerContent,
  size = 'md',
  panelClassName = '',
  modalId,
  titleId,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<Element | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);


  useEffect(() => {
    const appRoot = document.getElementById('root');

    if (isOpen) {
      triggerElementRef.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      if (appRoot) {
        appRoot.setAttribute('aria-hidden', 'true');
      }
      // Move focus to the modal; targeting the close button as a focusable element
      closeButtonRef.current?.focus();

    } else {
      document.body.style.overflow = 'auto';
      if (appRoot) {
        appRoot.removeAttribute('aria-hidden');
      }
      // Restore focus to the element that opened the modal
      if (triggerElementRef.current instanceof HTMLElement) {
        triggerElementRef.current.focus();
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.body.style.overflow = 'auto';
      if (appRoot) {
        appRoot.removeAttribute('aria-hidden');
      }
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses: Record<string, string> = {
    sm: 'max-w-lg', /* Increased from md */
    md: 'max-w-2xl', /* Increased from xl */
    lg: 'max-w-4xl', /* Increased from 3xl */
    xl: 'max-w-6xl', /* Increased from 5xl */
    custom: '', 
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950 bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId || (title ? `${modalId}-title` : undefined)}
      id={modalId}
      ref={modalRef}
    >
      <div
        className={`lol-panel w-full ${sizeClasses[size]} max-h-[95vh] sm:max-h-[90vh] flex flex-col p-0 transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modal-appear rounded-2xl ${panelClassName}`} // Ensure rounded-2xl is present if lol-panel is overridden by panelClassName
        onClick={e => e.stopPropagation()}
        style={{ animationFillMode: 'forwards' }}
        role="document" // Adding role document for better semantics within dialog
      >
        {(title || titleIcon) && (
          <header className="p-4 sm:p-5 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-900 bg-opacity-80 backdrop-blur-sm z-10 rounded-t-2xl"> {/* Increased padding, Matches lol-panel radius */}
            <div className="flex items-center min-w-0">
              {titleIcon && <span className="mr-2.5 flex-shrink-0">{titleIcon}</span>} {/* Increased mr */}
              <h2 id={titleId || (title ? `${modalId}-title` : undefined)} className="text-xl sm:text-2xl font-semibold text-sky-400 truncate"> {/* Increased font size */}
                {title}
              </h2>
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors flex-shrink-0 ml-2.5" /* Increased padding and ml */
              aria-label="Close modal"
            >
              <XMarkIcon className="w-6 h-6 sm:w-7 sm:h-7" /> {/* Increased icon size */}
            </button>
          </header>
        )}
        
        <div className="overflow-y-auto flex-grow">
          {children}
        </div>

        {footerContent && (
          <footer className="p-4 sm:p-5 border-t border-slate-700 flex justify-end space-x-3.5 rounded-b-2xl sticky bottom-0 bg-slate-900 bg-opacity-80 backdrop-blur-sm z-10"> {/* Increased padding and space, Matches lol-panel radius */}
            {footerContent}
          </footer>
        )}
      </div>
    </div>
  );
};