import React, { useId, useState, useRef, useLayoutEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement<any>; // Enforce a single element to apply ARIA attributes
  delay?: number; // Delay in milliseconds before showing tooltip (default: 300ms)
}

export const Tooltip = ({ content, children, delay = 300 }: TooltipProps) => {
  const tooltipId = useId();
  const [isVisible, setIsVisible] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const targetRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeout = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (isVisible && targetRef.current && tooltipRef.current) {
        const calculatePosition = () => {
            if (!targetRef.current || !tooltipRef.current) {return;}

            const targetRect = targetRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const margin = 10;

            let top = targetRect.top - tooltipRect.height - margin;
            let left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;

            // Adjust for top overflow
            if (top < margin) {
                top = targetRect.bottom + margin;
            }

            // Adjust for horizontal overflow
            if (left < margin) {
                left = margin;
            } else if (left + tooltipRect.width > window.innerWidth - margin) {
                left = window.innerWidth - tooltipRect.width - margin;
            }

            setStyle({ top, left });
        };

        // Use RAF to avoid layout thrashing
        const rafId = requestAnimationFrame(calculatePosition);
        return () => cancelAnimationFrame(rafId);
    }
  }, [isVisible]);
  
  const handleMouseEnter = () => {
    showTimeout.current = window.setTimeout(() => {
        setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (showTimeout.current) {
        clearTimeout(showTimeout.current);
    }
    setIsVisible(false);
  };

  const clonedChild = React.cloneElement(children, {
    ...children.props,
    'aria-describedby': tooltipId,
    ref: targetRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: () => setIsVisible(true),
    onBlur: () => setIsVisible(false),
  });

  return (
    <>
      {clonedChild}
      <AnimatePresence>
        {isVisible && (
            <motion.div
                ref={tooltipRef}
                id={tooltipId}
                role="tooltip"
                className="fixed w-max max-w-xs text-text-secondary text-sm p-3 shadow-lg z-50 tooltip-container"
                style={style}
                {...{
                    initial: { opacity: 0, y: 5 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: 5 },
                    transition: { duration: 0.2 },
                }}
            >
                {content}
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};