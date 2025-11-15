import React, { useState, useEffect } from 'react';
import { X, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContextualHelp } from '../../hooks/useContextualHelp';
import { Button } from './Button';

interface FeatureTooltipProps {
  tooltipId: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  children: React.ReactElement;
}

/**
 * Feature Tooltip Component
 * Shows a tooltip once per feature (tracked in localStorage)
 * Can be dismissed and won't show again
 */
export const FeatureTooltip = ({
  tooltipId,
  title,
  content,
  position = 'bottom',
  delay = 1000,
  children,
}: FeatureTooltipProps) => {
  const { hasBeenShown, markAsShown } = useContextualHelp();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Only show if not previously shown and not dismissed
    if (!hasBeenShown(tooltipId) && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [tooltipId, hasBeenShown, delay, isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    markAsShown(tooltipId);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block">
      {React.cloneElement(children, {
        onMouseEnter: () => {
          if (!hasBeenShown(tooltipId) && !isDismissed) {
            setIsVisible(true);
          }
        },
        onMouseLeave: () => {
          setIsVisible(false);
        },
      })}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`absolute z-50 w-64 p-4 bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-lg shadow-lg ${positionClasses[position]}`}
          >
            <div className="flex items-start gap-2 mb-2">
              <HelpCircle className="h-5 w-5 text-[hsl(var(--accent))] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-[hsl(var(--text-primary))] mb-1">{title}</h4>
                <p className="text-sm text-[hsl(var(--text-secondary))]">{content}</p>
              </div>
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 hover:bg-[hsl(var(--surface-secondary))] rounded transition-colors"
                aria-label="Dismiss tooltip"
              >
                <X className="h-4 w-4 text-[hsl(var(--text-secondary))]" />
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <Button variant="secondary" size="sm" onClick={handleDismiss} className="flex-1 text-xs">
                Got it
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
