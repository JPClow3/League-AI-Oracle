import React from 'react';
import { SkipForward } from 'lucide-react';

/**
 * Skip Links Component
 * Provides keyboard navigation shortcuts to skip to main content areas
 * Only visible when focused via keyboard navigation
 */
export const SkipLinks = () => {
  return (
    <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-4 focus-within:left-4 focus-within:z-[100] focus-within:flex focus-within:flex-col focus-within:gap-2">
      <a
        href="#main-content"
        className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--accent))] text-[hsl(var(--on-accent))] rounded-md font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
      >
        <SkipForward className="h-4 w-4" />
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-md font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
      >
        <SkipForward className="h-4 w-4" />
        Skip to navigation
      </a>
      <a
        href="#search"
        className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-md font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
      >
        <SkipForward className="h-4 w-4" />
        Skip to search
      </a>
    </div>
  );
};
