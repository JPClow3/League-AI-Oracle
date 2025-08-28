

import React, { useRef, useEffect } from 'react';
import FocusTrap from 'focus-trap-react';
import { CSSTransition } from 'react-transition-group';
import { Button } from './Button';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  const backdropRef = useRef(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup function to reset on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
        className="fixed inset-0 bg-[hsl(var(--bg-primary)_/_0.7)] backdrop-blur-sm flex justify-center items-center z-50 p-4"
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
          <div 
            ref={contentRef}
            tabIndex={-1}
            className="bg-[hsl(var(--surface))] shadow-lg shadow-black/20 w-full max-w-4xl max-h-[90vh] flex flex-col m-4 focus:outline-none border border-[hsl(var(--border))]"
            onClick={(e) => e.stopPropagation()}
          >
            <FocusTrap
              active={isOpen}
              focusTrapOptions={{
                fallbackFocus: () => contentRef.current || document.body,
              }}
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
            </FocusTrap>
          </div>
        </CSSTransition>
      </div>
    </CSSTransition>
  );
};
