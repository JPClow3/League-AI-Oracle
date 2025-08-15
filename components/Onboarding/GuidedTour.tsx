import React, { useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../common/Button';

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

export const GuidedTour: React.FC<GuidedTourProps> = ({ isOpen, onClose, steps }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [spotlightStyle, setSpotlightStyle] = useState({});
    const [contentStyle, setContentStyle] = useState({});
    
    const portalRoot = document.body;

    useLayoutEffect(() => {
        if (!isOpen) return;

        const updatePosition = () => {
            const step = steps[currentStep];
            const element = document.querySelector(step.selector);
            
            if (element) {
                const rect = element.getBoundingClientRect();
                const margin = 5;
                setSpotlightStyle({
                    width: rect.width + margin * 2,
                    height: rect.height + margin * 2,
                    top: rect.top - margin,
                    left: rect.left - margin,
                });
                setContentStyle(calculatePosition(rect));
                 element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        return () => window.removeEventListener('resize', updatePosition);
    }, [isOpen, currentStep, steps]);
    
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
         <div className="fixed inset-0 z-[1000]">
            <div style={spotlightStyle} className="tour-spotlight"></div>
            <div style={contentStyle} className="tour-step-content">
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-300 mb-4">{step.content}</p>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{currentStep + 1} / {steps.length}</span>
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
    );
    
    return createPortal(TourComponent, portalRoot);
};
