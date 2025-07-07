import { useState, useLayoutEffect, useRef, useCallback } from 'react';

interface Position {
    top: number;
    left: number;
}

export const useFloatingElementPosition = (triggerRef: React.RefObject<HTMLElement | null>, floatingRef: React.RefObject<HTMLElement | null>) => {
    const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<number | null>(null);

    const calculatePosition = useCallback(() => {
        if (!triggerRef.current || !floatingRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const floatingRect = floatingRef.current.getBoundingClientRect();
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight,
        };

        let pos: Position = {
            top: triggerRect.bottom + window.scrollY,
            left: triggerRect.left + window.scrollX,
        };

        // Adjust horizontal position
        if (pos.left + floatingRect.width > viewport.width) {
            pos.left = viewport.width - floatingRect.width - 10;
        }
        if (pos.left < 10) {
            pos.left = 10;
        }

        // Adjust vertical position (flip if it goes off-screen)
        if (pos.top + floatingRect.height > viewport.height + window.scrollY) {
            pos.top = triggerRect.top + window.scrollY - floatingRect.height - 8;
        } else {
            pos.top += 8;
        }


        setPosition(pos);
    }, [triggerRef, floatingRef]);
    
    const show = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => {
            setIsVisible(true);
        }, 300); // Small delay before showing
    }, []);

    const hide = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(false);
    }, []);
    
    useLayoutEffect(() => {
        if (isVisible) {
            calculatePosition();
            const handleScroll = () => calculatePosition();
            window.addEventListener('scroll', handleScroll, true);
            return () => window.removeEventListener('scroll', handleScroll, true);
        }
    }, [isVisible, calculatePosition]);

    return { position, isVisible, show, hide };
};
