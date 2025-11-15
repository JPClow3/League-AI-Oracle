import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdviceSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  collapsible?: boolean;
  className?: string;
}

/**
 * Advice Section Component
 * Structured section for advice content with optional collapsible functionality
 */
export const AdviceSection = ({
  title,
  icon,
  children,
  defaultExpanded = true,
  collapsible = true,
  className = '',
}: AdviceSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`border border-[hsl(var(--border))] rounded-lg overflow-hidden ${className}`}>
      <button
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-4 bg-[hsl(var(--surface))] hover:bg-[hsl(var(--surface-secondary))] transition-colors ${
          collapsible ? 'cursor-pointer' : 'cursor-default'
        } focus:outline-none focus:ring-2 focus:ring-accent`}
        aria-expanded={isExpanded}
        aria-label={collapsible ? `${title} section (click to ${isExpanded ? 'collapse' : 'expand'})` : title}
      >
        <div className="flex items-center gap-2">
          {icon && <div className="text-[hsl(var(--accent))]">{icon}</div>}
          <h3 className="font-semibold text-[hsl(var(--text-primary))]">{title}</h3>
        </div>
        {collapsible && (
          <div className="text-[hsl(var(--text-secondary))]">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" strokeWidth={2} />
            ) : (
              <ChevronDown className="h-5 w-5" strokeWidth={2} />
            )}
          </div>
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-[hsl(var(--bg-secondary))]">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
