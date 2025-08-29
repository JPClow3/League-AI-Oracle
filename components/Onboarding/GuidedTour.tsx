import React, { useState, useLayoutEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../common/Button';
import FocusTrap from 'focus-trap-react';
import toast from 'react-hot-toast';

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
    const margin = 10;
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

    return { top, left };
};

export const GuidedTour = ({ isOpen, onClose, steps }: GuidedTourProps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [spotlightStyle, setSpotlightStyle] = useState({});
    const [contentStyle, setContentStyle] = useState({});
    
    const portalRoot = document.body;
    const titleId = useId();
    const contentId = useId();

    useLayoutEffect(() => {
        if (!isOpen) return;

        const updatePosition = () => {
            const step = steps[currentStep];
            const element = document.querySelector(step.selector);
            
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                const rect = element.getBoundingClientRect();
                const margin = 5;
                setSpotlightStyle({
                    width: rect.width + margin * 2,
                    height: rect.height + margin * 2,
                    top: rect.top - margin,
                    left: rect.left - margin,
                });
                setContentStyle(calculatePosition(rect));
            } else {
                console.warn(`Guided tour element not found for selector: ${step.selector}`);
                toast.error("An error occurred with the guided tour. It has been stopped.");
                onClose();
            }
        };

        // Delay slightly to allow for UI to settle after scrolling
        const timerId = setTimeout(updatePosition, 150);
        window.addEventListener('resize', updatePosition);

        return () => {
            clearTimeout(timerId);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen, currentStep, steps, onClose]);
    
    if (!isOpen) return null;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose();
        }
    };
    
    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const step = steps[currentStep];

    const TourComponent = (
        <FocusTrap active={isOpen}>
            <div className="fixed inset-0 z-[1000]">
                <div style={spotlightStyle} className="tour-spotlight"></div>
                <div 
                    style={contentStyle} 
                    className="fixed bg-surface-primary text-text-primary p-6 rounded-lg border border-border-primary shadow-2xl w-[350px] max-w-[90vw] z-[1002] transition-all duration-300"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={titleId}
                    aria-describedby={contentId}
                    tabIndex={-1}
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
            </div>
        </FocusTrap>
    );
    
    return createPortal(TourComponent, portalRoot);
};