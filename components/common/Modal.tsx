import React, { useRef } from 'react';
import FocusTrap from 'focus-trap-react';
import { CSSTransition } from 'react-transition-group';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const backdropRef = useRef(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
        className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
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
            className="bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col m-4 focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <FocusTrap
              active={isOpen}
              focusTrapOptions={{
                fallbackFocus: () => contentRef.current || document.body,
              }}
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
                  <h2 className="text-xl font-bold text-white">{title}</h2>
                  <button onClick={onClose} className="text-gray-400 hover:text-white transition" aria-label="Close modal">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-2 md:p-4 overflow-y-auto flex-grow">
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
