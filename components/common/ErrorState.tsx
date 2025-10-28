/**
 * Error Display Components
 * Standardized error messaging for better UX
 */

import { AlertTriangle, XCircle, AlertCircle, Info } from 'lucide-react';
import { Button } from './Button';

interface ErrorMessageProps {
  id?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  className?: string;
}

/**
 * Inline error message component
 * Use for form validation and field-level errors
 */
export const ErrorMessage = ({ id, message, type = 'error', className = '' }: ErrorMessageProps) => {
  const icons = {
    error: <XCircle size={16} className="flex-shrink-0" />,
    warning: <AlertTriangle size={16} className="flex-shrink-0" />,
    info: <Info size={16} className="flex-shrink-0" />,
  };

  const colors = {
    error: 'text-error bg-error/10 border-error/30',
    warning: 'text-warning bg-warning/10 border-warning/30',
    info: 'text-info bg-info/10 border-info/30',
  };

  return (
    <div
      id={id}
      role="alert"
      className={`flex items-start gap-2 p-3 text-sm border rounded ${colors[type]} ${className}`}
    >
      {icons[type]}
      <span className="flex-1">{message}</span>
    </div>
  );
};

/**
 * Field error message (for form inputs)
 */
export const FieldError = ({ id, message }: { id?: string; message?: string }) => {
  if (!message) {
    return null;
  }

  return (
    <p id={id} role="alert" className="mt-1 text-sm text-error flex items-center gap-1">
      <XCircle size={14} />
      {message}
    </p>
  );
};

/**
 * Error state component (for full sections)
 */
export const ErrorState = ({
  title = 'Something went wrong',
  message,
  onRetry,
  onDismiss,
  className = '',
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
        <AlertCircle size={32} className="text-error" />
      </div>

      <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>

      <p className="text-text-secondary max-w-md mb-6">{message}</p>

      <div className="flex gap-3">
        {onRetry && (
          <Button variant="primary" onClick={onRetry}>
            Try Again
          </Button>
        )}
        {onDismiss && (
          <Button variant="secondary" onClick={onDismiss}>
            Dismiss
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * Network error component
 */
export const NetworkError = ({ onRetry }: { onRetry: () => void }) => (
  <ErrorState
    title="Connection Error"
    message="Unable to connect to the server. Please check your internet connection and try again."
    onRetry={onRetry}
  />
);

/**
 * API error component
 */
export const APIError = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <ErrorState title="Request Failed" message={message} onRetry={onRetry} />
);

/**
 * Not found component
 */
export const NotFound = ({ resource = 'page', onGoBack }: { resource?: string; onGoBack: () => void }) => (
  <ErrorState
    title="Not Found"
    message={`The ${resource} you're looking for doesn't exist or has been removed.`}
    onRetry={onGoBack}
  />
);

/**
 * Permission denied component
 */
export const PermissionDenied = ({ onGoBack }: { onGoBack: () => void }) => (
  <ErrorState title="Access Denied" message="You don't have permission to access this resource." onDismiss={onGoBack} />
);
/**
 * Skeleton Loading Components
 * Use these to show content placeholders during loading states
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
}

/**
 * Base skeleton component - animated pulsing gray box
 */
export const Skeleton = ({ className = '' }: SkeletonProps) => (
  <div className={`animate-pulse bg-surface-secondary rounded ${className}`} role="status" aria-label="Loading..." />
);

/**
 * Skeleton for text lines
 */
export const SkeletonText = ({ lines = 3, className = '' }: { lines?: number; className?: string }) => (
  <div className={`space-y-2 ${className}`} role="status" aria-label="Loading text...">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
    ))}
  </div>
);

/**
 * Skeleton for a card/panel
 */
export const SkeletonCard = ({ className = '' }: SkeletonProps) => (
  <div
    className={`p-4 border border-border-primary rounded-md space-y-3 ${className}`}
    role="status"
    aria-label="Loading card..."
  >
    <Skeleton className="h-6 w-1/2" />
    <SkeletonText lines={3} />
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-9 w-24" />
      <Skeleton className="h-9 w-24" />
    </div>
  </div>
);

/**
 * Skeleton for a list of items
 */
export const SkeletonList = ({ items = 5, className = '' }: { items?: number; className?: string }) => (
  <div className={`space-y-3 ${className}`} role="status" aria-label="Loading list...">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 border border-border-primary rounded">
        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Skeleton for champion grid
 */
export const SkeletonChampionGrid = ({ count = 12, className = '' }: { count?: number; className?: string }) => (
  <div
    className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 ${className}`}
    role="status"
    aria-label="Loading champions..."
  >
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="aspect-square">
        <Skeleton className="w-full h-full" />
      </div>
    ))}
  </div>
);

/**
 * Skeleton for draft slots
 */
export const SkeletonDraftSlot = ({ className = '' }: SkeletonProps) => (
  <Skeleton className={`w-full h-16 ${className}`} />
);

/**
 * Skeleton for team panel (5 champion slots)
 */
export const SkeletonTeamPanel = ({ className = '' }: SkeletonProps) => (
  <div className={`space-y-2 ${className}`} role="status" aria-label="Loading team...">
    <Skeleton className="h-6 w-32 mb-4" />
    {Array.from({ length: 5 }).map((_, i) => (
      <SkeletonDraftSlot key={i} />
    ))}
  </div>
);

/**
 * Skeleton for analysis panel
 */
export const SkeletonAnalysisPanel = ({ className = '' }: SkeletonProps) => (
  <div
    className={`p-6 border border-border-primary rounded-md space-y-4 ${className}`}
    role="status"
    aria-label="Loading analysis..."
  >
    <Skeleton className="h-8 w-1/3 mb-6" />
    <div className="space-y-3">
      <Skeleton className="h-5 w-1/4" />
      <SkeletonText lines={4} />
    </div>
    <div className="space-y-3">
      <Skeleton className="h-5 w-1/4" />
      <SkeletonText lines={3} />
    </div>
    <div className="space-y-3">
      <Skeleton className="h-5 w-1/4" />
      <SkeletonText lines={5} />
    </div>
  </div>
);

/**
 * Skeleton for avatar with text
 */
export const SkeletonAvatar = ({
  size = 'md',
  withText = true,
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
  className?: string;
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`} role="status" aria-label="Loading profile...">
      <Skeleton className={`${sizeClasses[size]} rounded-full flex-shrink-0`} />
      {withText && (
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      )}
    </div>
  );
};

/**
 * Skeleton for a table
 */
export const SkeletonTable = ({
  rows = 5,
  cols = 4,
  className = '',
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) => (
  <div
    className={`border border-border-primary rounded-md overflow-hidden ${className}`}
    role="status"
    aria-label="Loading table..."
  >
    {/* Header */}
    <div className="bg-surface-secondary p-3 border-b border-border-primary">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="p-3 border-b border-border-primary last:border-b-0">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

/**
 * Full page skeleton (for initial page loads)
 */
export const SkeletonPage = ({ className = '' }: SkeletonProps) => (
  <div className={`space-y-6 ${className}`} role="status" aria-label="Loading page...">
    {/* Header */}
    <Skeleton className="h-16 w-full mb-8" />

    {/* Hero section */}
    <div className="space-y-3">
      <Skeleton className="h-12 w-2/3 mx-auto" />
      <Skeleton className="h-6 w-1/2 mx-auto" />
    </div>

    {/* Cards grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </div>
);
