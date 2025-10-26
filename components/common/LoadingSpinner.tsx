import React from 'react';

export type LoadingSize = 'sm' | 'md' | 'lg';
export type LoadingVariant = 'spinner' | 'dots' | 'pulse';

interface LoadingSpinnerProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

const Spinner = ({ size = 'md' }: { size: LoadingSize }) => (
  <div
    className={`${sizeClasses[size]} border-2 border-current border-t-transparent rounded-full animate-spin`}
    role="status"
    aria-label="Loading"
  />
);

const Dots = ({ size = 'md' }: { size: LoadingSize }) => {
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3';

  return (
    <div className="flex items-center gap-1" role="status" aria-label="Loading">
      <div className={`${dotSize} bg-current rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
      <div className={`${dotSize} bg-current rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
      <div className={`${dotSize} bg-current rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
    </div>
  );
};

const Pulse = ({ size = 'md' }: { size: LoadingSize }) => (
  <div
    className={`${sizeClasses[size]} bg-current rounded-full animate-pulse`}
    role="status"
    aria-label="Loading"
  />
);

/**
 * Standardized loading spinner component
 * Use this for consistent loading states across the application
 *
 * @example
 * // Inline spinner
 * <LoadingSpinner size="sm" />
 *
 * @example
 * // With text
 * <LoadingSpinner size="md" text="Loading..." />
 *
 * @example
 * // Different variants
 * <LoadingSpinner variant="dots" />
 * <LoadingSpinner variant="pulse" />
 */
export const LoadingSpinner = ({
  size = 'md',
  variant = 'spinner',
  className = '',
  text
}: LoadingSpinnerProps) => {
  const Component = variant === 'dots' ? Dots : variant === 'pulse' ? Pulse : Spinner;

  if (text) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Component size={size} />
        <span className="text-sm">{text}</span>
      </div>
    );
  }

  return <Component size={size} />;
};

/**
 * Full-page loading overlay
 * Use for page-level loading states
 */
export const LoadingOverlay = ({ text = 'Loading...' }: { text?: string }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(var(--bg-primary)_/_0.8)] backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-lg font-medium text-[hsl(var(--text-secondary))]">{text}</p>
    </div>
  </div>
);

/**
 * Inline loading state
 * Use within components/cards
 */
export const LoadingInline = ({ text = 'Loading...' }: { text?: string }) => (
  <div className="flex items-center justify-center p-8">
    <LoadingSpinner size="md" text={text} />
  </div>
);

