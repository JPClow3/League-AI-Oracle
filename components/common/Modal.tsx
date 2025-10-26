import React, { useRef, useEffect } from 'react';
import FocusTrap from 'focus-trap-react';
import { CSSTransition } from 'react-transition-group';
import { Button } from './Button';
import { X } from 'lucide-react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: ModalSize;
  enableBackdropBlur?: boolean; // Toggle backdrop blur for performance
}

export const Modal = ({ isOpen, onClose, title, children, size = '4xl', enableBackdropBlur = true }: ModalProps) => {
  const backdropRef = useRef(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const originalOverflowRef = useRef<string>('');

  useEffect(() => {
    if (isOpen) {
      // Store original overflow value only on first open
      if (!originalOverflowRef.current) {
        originalOverflowRef.current = document.body.style.overflow || '';
      }
      document.body.style.overflow = 'hidden';
    } else {
      // Restore original overflow value
      document.body.style.overflow = originalOverflowRef.current || '';
    }
    // Cleanup function to reset on unmount
    return () => {
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = originalOverflowRef.current || '';
      }
    };
  }, [isOpen]);

  const sizeClasses: Record<ModalSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
  };

  return (
    <CSSTransition
      in={isOpen}
      timeout={200}
      classNames="modal"
      unmountOnExit
      nodeRef={backdropRef}
    >
      <div
        ref={backdropRef}
        className={`fixed inset-0 bg-[hsl(var(--bg-primary)_/_0.7)] flex justify-center items-center z-50 p-4 ${enableBackdropBlur ? 'backdrop-blur-sm' : ''}`}
        onClick={onClose}
        aria-modal="true"
        role="dialog"
      >
        <CSSTransition
          in={isOpen}
          timeout={200}
          classNames="modal-content"
          unmountOnExit
          nodeRef={contentRef}
        >
          <FocusTrap
            active={isOpen}
            focusTrapOptions={{
              fallbackFocus: () => contentRef.current || document.body,
            }}
          >
            <div 
              ref={contentRef}
              tabIndex={-1}
              className={`bg-[hsl(var(--surface))] shadow-lg shadow-black/20 w-full max-h-[90vh] flex flex-col m-4 focus:outline-none border border-[hsl(var(--border))] ${sizeClasses[size]}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-6 border-b border-[hsl(var(--border))] flex-shrink-0">
                  <h2 className="font-display text-2xl font-semibold text-[hsl(var(--text-primary))] tracking-wider">{title}</h2>
                  <Button onClick={onClose} variant="ghost" aria-label="Close modal">
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {children}
                </div>
              </div>
            </div>
          </FocusTrap>
        </CSSTransition>
      </div>
    </CSSTransition>
  );
};