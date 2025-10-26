import React, { useState, useLayoutEffect, useId, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../common/Button';
import FocusTrap from 'focus-trap-react';
import { AlertTriangle } from 'lucide-react';

export interface TourStep {
    selector: string;
    title: string;
    content: string;
}

interface GuidedTourProps {
    isOpen: boolean;
    onClose: () => void;
    steps: TourStep[];
}

const calculatePosition = (rect: DOMRect | null) => {
    if (!rect) return {};
    const margin = 16;
    const contentWidth = 350;
    
    let top = rect.bottom + margin;
    let left = rect.left + rect.width / 2 - contentWidth / 2;

    // Adjust if it goes off-screen
    if (left < margin) left = margin;
    if (left + contentWidth > window.innerWidth - margin) {
        left = window.innerWidth - contentWidth - margin;
    }
    if (top + 200 > window.innerHeight) { // Approximate content height
        top = rect.top - 200 - margin;
    }
    if (top < margin) {
        top = margin;
    }

    return { top, left };
};

export const GuidedTour = ({ isOpen, onClose, steps }: GuidedTourProps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [spotlightStyle, setSpotlightStyle] = useState({});
    const [contentStyle, setContentStyle] = useState({});
    const [elementNotFound, setElementNotFound] = useState(false);
    
    const portalRoot = document.body;
    const titleId = useId();
    const contentId = useId();
    const tourContentRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<MutationObserver | null>(null);

    const updatePosition = useCallback(() => {
        const step = steps[currentStep];
        if (!step) return false;
        
        const element = document.querySelector<HTMLElement>(step.selector);
        if (element) {
            const rect = element.getBoundingClientRect();
             if (rect.width > 0 && rect.height > 0) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                
                // Allow time for scrolling
                setTimeout(() => {
                    const finalRect = element.getBoundingClientRect();
                    const margin = 8;
                    setSpotlightStyle({
                        width: finalRect.width + margin * 2,
                        height: finalRect.height + margin * 2,
                        top: finalRect.top - margin,
                        left: finalRect.left - margin,
                    });
                    setContentStyle(calculatePosition(finalRect));
                    setElementNotFound(false);
                }, 350);
                return true;
             }
        }
        return false;

    }, [currentStep, steps]);

    useLayoutEffect(() => {
        if (!isOpen) return;
        
        const tryUpdate = () => {
            if (!updatePosition()) {
                setElementNotFound(true);
            }
        };

        // Attempt to find the element immediately.
        if (updatePosition()) {
            setElementNotFound(false);
        } else {
            // If not found, set up an observer to watch for it.
            observerRef.current?.disconnect();
            observerRef.current = new MutationObserver((mutations) => {
                if (updatePosition()) {
                    setElementNotFound(false);
                    observerRef.current?.disconnect();
                }
            });

            observerRef.current.observe(document.body, { childList: true, subtree: true });

            // Failsafe timeout in case the element never appears.
            const failsafe = setTimeout(() => {
                observerRef.current?.disconnect();
                if (!document.querySelector(steps[currentStep].selector)) {
                    setElementNotFound(true);
                }
            }, 3000);

            return () => {
                clearTimeout(failsafe);
                observerRef.current?.disconnect();
            };
        }

        window.addEventListener('resize', tryUpdate);
        return () => window.removeEventListener('resize', tryUpdate);
    }, [isOpen, currentStep, steps, updatePosition]);
    
    if (!isOpen) return null;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setElementNotFound(false);
            setCurrentStep(currentStep + 1);
        } else {
            onClose();
        }
    };
    
    const handlePrev = () => {
        if (currentStep > 0) {
            setElementNotFound(false);
            setCurrentStep(currentStep - 1);
        }
    };

    const step = steps[currentStep];
    
    const renderContent = () => {
        const commonProps = {
            role: "dialog",
            "aria-modal": true,
            "aria-labelledby": titleId,
            "aria-describedby": contentId,
            tabIndex: -1,
            ref: tourContentRef,
        };

        if (elementNotFound) {
            return (
                <div 
                    {...commonProps}
                    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface p-6 rounded-lg border border-border shadow-2xl w-[350px] max-w-[90vw] z-[1002]"
                    role="alertdialog"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="h-6 w-6 text-warning"/>
                        <h3 id={titleId} className="text-xl font-bold text-warning">Tour Guide Lost!</h3>
                    </div>
                    <p id={contentId} className="text-sm text-text-secondary mb-4">The next highlighted item couldn't be found. You may have navigated away. Would you like to skip this step or end the tour?</p>
                    <div className="flex justify-end gap-2">
                        <Button onClick={onClose} variant="secondary">End Tour</Button>
                        <Button onClick={handleNext} variant="primary">Skip Step</Button>
                    </div>
                </div>
            );
        }
        
        return (
             <div 
                {...commonProps}
                style={contentStyle} 
                className="fixed bg-surface text-text-primary p-6 rounded-lg border border-border shadow-2xl w-[350px] max-w-[90vw] z-[1002] transition-all duration-300"
            >
                <h3 id={titleId} className="text-xl font-bold text-text-primary mb-2">{step.title}</h3>
                <p id={contentId} className="text-sm text-text-secondary mb-4">{step.content}</p>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-text-muted">{currentStep + 1} / {steps.length}</span>
                    <div className="flex gap-2">
                         {currentStep > 0 && <Button onClick={handlePrev} variant="secondary">Back</Button>}
                        <Button onClick={onClose} variant="secondary">Skip</Button>
                        <Button onClick={handleNext} variant="primary">
                            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    return createPortal(
        <FocusTrap active={isOpen} focusTrapOptions={{ initialFocus: () => tourContentRef.current, allowOutsideClick: true }}>
            <div className="fixed inset-0 z-[1000]">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
                {/* Spotlight */}
                {!elementNotFound && <div style={spotlightStyle} className="fixed border-4 border-accent rounded-md shadow-glow-accent transition-all duration-300 pointer-events-none" />}
                {renderContent()}
            </div>
        </FocusTrap>
    , portalRoot);
};