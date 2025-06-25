
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon } from './icons/index';

export interface OnboardingStep {
  targetSelector: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
}

interface OnboardingTourProps {
  steps: OnboardingStep[];
  onComplete: () => void;
}

const HIGHLIGHT_CLASS = 'onboarding-highlighted-element';
const POPOVER_OFFSET = 12;

// Simple throttle utility function
function throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
  let inThrottle: boolean;
  let lastArgs: any[] | null = null;
  let timeoutId: number | null = null; // Changed NodeJS.Timeout to number

  const throttledFunction = (...args: any[]) => {
    lastArgs = args;
    if (!inThrottle) {
      inThrottle = true;
      func(...lastArgs);
      timeoutId = window.setTimeout(() => { // Use window.setTimeout for clarity
        inThrottle = false;
        if (lastArgs && timeoutId === null) { 
          // This part is tricky, for resize/scroll, usually just dropping intermediate calls is fine.
        }
      }, limit);
    } else {
      // Optionally, could set up a timeout to call with the latest args after throttle period ends
    }
  };
  return throttledFunction as T;
}


export const OnboardingTour: React.FC<OnboardingTourProps> = ({ steps, onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({
    opacity: 0,
    transform: 'scale(0.95)',
  });
  const [arrowPlacement, setArrowPlacement] = useState<string>('bottom');
  const highlightedElementRef = useRef<HTMLElement | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const firstFocusableInPopoverRef = useRef<HTMLButtonElement>(null);

  const cleanupHighlight = useCallback(() => {
    if (highlightedElementRef.current) {
      highlightedElementRef.current.classList.remove(HIGHLIGHT_CLASS);
      highlightedElementRef.current.style.zIndex = '';
      highlightedElementRef.current.style.position = ''; // Reset position
      highlightedElementRef.current = null;
    }
  }, []);

  const calculatePositionAndFocus = useCallback(() => {
    if (currentStepIndex >= steps.length || !popoverRef.current) return;

    const currentStep = steps[currentStepIndex];
    const targetElement = document.querySelector(currentStep.targetSelector) as HTMLElement;
    const popoverNode = popoverRef.current;

    if (targetElement && popoverNode) {
      cleanupHighlight(); 

      targetElement.classList.add(HIGHLIGHT_CLASS);
      if (getComputedStyle(targetElement).position === 'static') {
        targetElement.style.position = 'relative';
      }
      targetElement.style.zIndex = '1000';
      highlightedElementRef.current = targetElement;

      const targetRect = targetElement.getBoundingClientRect();
      
      const originalInlineTransform = popoverNode.style.transform;
      const originalInlineTransition = popoverNode.style.transition;

      popoverNode.style.transition = 'none'; 
      popoverNode.style.transform = 'scale(1)'; 
      popoverNode.offsetHeight; 

      const popoverRect = popoverNode.getBoundingClientRect(); 

      popoverNode.style.transform = originalInlineTransform || 'scale(0.95)'; 
      popoverNode.style.transition = originalInlineTransition; 
      popoverNode.offsetHeight; 


      const placement = currentStep.placement || 'bottom';
      let top = 0, left = 0;
      let currentArrowPlacement = 'bottom';

      switch (placement) {
        case 'top-start':
          top = targetRect.top - popoverRect.height - POPOVER_OFFSET;
          left = targetRect.left;
          currentArrowPlacement = 'bottom';
          break;
        case 'top':
          top = targetRect.top - popoverRect.height - POPOVER_OFFSET;
          left = targetRect.left + targetRect.width / 2 - popoverRect.width / 2;
          currentArrowPlacement = 'bottom';
          break;
        case 'top-end':
          top = targetRect.top - popoverRect.height - POPOVER_OFFSET;
          left = targetRect.right - popoverRect.width;
          currentArrowPlacement = 'bottom';
          break;
        case 'right-start':
          top = targetRect.top;
          left = targetRect.right + POPOVER_OFFSET;
          currentArrowPlacement = 'left';
          break;
        case 'right':
          top = targetRect.top + targetRect.height / 2 - popoverRect.height / 2;
          left = targetRect.right + POPOVER_OFFSET;
          currentArrowPlacement = 'left';
          break;
        case 'right-end':
          top = targetRect.bottom - popoverRect.height;
          left = targetRect.right + POPOVER_OFFSET;
          currentArrowPlacement = 'left';
          break;
        case 'bottom-start':
          top = targetRect.bottom + POPOVER_OFFSET;
          left = targetRect.left;
          currentArrowPlacement = 'top';
          break;
        case 'bottom':
          top = targetRect.bottom + POPOVER_OFFSET;
          left = targetRect.left + targetRect.width / 2 - popoverRect.width / 2;
          currentArrowPlacement = 'top';
          break;
        case 'bottom-end':
          top = targetRect.bottom + POPOVER_OFFSET;
          left = targetRect.right - popoverRect.width;
          currentArrowPlacement = 'top';
          break;
        case 'left-start':
          top = targetRect.top;
          left = targetRect.left - popoverRect.width - POPOVER_OFFSET;
          currentArrowPlacement = 'right';
          break;
        case 'left':
          top = targetRect.top + targetRect.height / 2 - popoverRect.height / 2;
          left = targetRect.left - popoverRect.width - POPOVER_OFFSET;
          currentArrowPlacement = 'right';
          break;
        case 'left-end':
          top = targetRect.bottom - popoverRect.height;
          left = targetRect.left - popoverRect.width - POPOVER_OFFSET;
          currentArrowPlacement = 'right';
          break;
        default: 
          top = targetRect.bottom + POPOVER_OFFSET;
          left = targetRect.left + targetRect.width / 2 - popoverRect.width / 2;
          currentArrowPlacement = 'top';
      }

      if (left < POPOVER_OFFSET) left = POPOVER_OFFSET;
      if (top < POPOVER_OFFSET) top = POPOVER_OFFSET;
      if (left + popoverRect.width > window.innerWidth - POPOVER_OFFSET) {
        left = window.innerWidth - popoverRect.width - POPOVER_OFFSET;
      }
      if (top + popoverRect.height > window.innerHeight - POPOVER_OFFSET) {
        top = window.innerHeight - popoverRect.height - POPOVER_OFFSET;
      }
      
      setArrowPlacement(currentArrowPlacement);
      setPopoverStyle({
        top: `${top}px`,
        left: `${left}px`,
        opacity: 1,
        transform: 'scale(1)',
      });

      requestAnimationFrame(() => {
        if (popoverRef.current && firstFocusableInPopoverRef.current) {
          firstFocusableInPopoverRef.current.focus();
        }
      });

    } else if (targetElement === null) {
      console.warn(`Onboarding target not found: ${currentStep.targetSelector}`);
      setPopoverStyle(prev => ({ ...prev, opacity: 0, transform: 'scale(0.95)'})); 
    }
  }, [currentStepIndex, steps, cleanupHighlight]); 

  useEffect(() => {
    setPopoverStyle({ opacity: 0, transform: 'scale(0.95)' });

    const setupStep = () => {
      if (currentStepIndex >= steps.length) return;
      const currentStep = steps[currentStepIndex];
      const targetElement = document.querySelector(currentStep.targetSelector) as HTMLElement;

      if (targetElement) {
        if (typeof targetElement.scrollIntoView === 'function') {
          targetElement.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' });
        }
        
        const frameId = requestAnimationFrame(() => {
          calculatePositionAndFocus();
        });
        return () => cancelAnimationFrame(frameId); 
      } else {
        setPopoverStyle(prev => ({ ...prev, opacity: 0, transform: 'scale(0.95)' }));
      }
    };

    const cleanupRaf = setupStep(); 

    const throttledRecalculate = throttle(calculatePositionAndFocus, 100);

    window.addEventListener('resize', throttledRecalculate);
    window.addEventListener('scroll', throttledRecalculate, true); 

    return () => {
      if (cleanupRaf) cleanupRaf(); 
      window.removeEventListener('resize', throttledRecalculate);
      window.removeEventListener('scroll', throttledRecalculate, true);
      cleanupHighlight(); 
    };
  }, [currentStepIndex, steps, calculatePositionAndFocus, cleanupHighlight]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    cleanupHighlight();
    onComplete();
  };

  if (currentStepIndex >= steps.length) {
    return null;
  }

  const currentStep = steps[currentStepIndex];

  return ReactDOM.createPortal(
    <>
      <div className="onboarding-overlay" onClick={handleComplete} />
      <div
        ref={popoverRef}
        className="onboarding-popover lol-panel p-0" 
        style={popoverStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-content"
        tabIndex={-1} 
      >
        <div className={`onboarding-popover-arrow onboarding-popover-arrow-${arrowPlacement}`}></div>
        <div className="p-4"> 
          <h3 id="onboarding-title" className="text-md font-semibold text-sky-300 mb-2">The Oracle Guides: Step {currentStepIndex + 1} of {steps.length}</h3>
          <p id="onboarding-content" className="text-sm text-slate-200 mb-4">
            {currentStep.content}
          </p>
          <div className="flex justify-between items-center">
            <button
              onClick={handleComplete}
              className="lol-button lol-button-secondary text-xs px-3 py-1"
              aria-label="End Guidance"
            >
              End Guidance
            </button>
            <button
              ref={firstFocusableInPopoverRef}
              onClick={handleNext}
              className="lol-button lol-button-primary text-xs px-3 py-1"
              aria-label={currentStepIndex === steps.length - 1 ? "Complete Guidance" : "Next Revelation"}
            >
              {currentStepIndex === steps.length - 1 ? 'Complete' : 'Next Revelation'}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
