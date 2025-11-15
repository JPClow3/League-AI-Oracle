import React from 'react';

export type SkeletonVariant = 'text' | 'card' | 'grid' | 'list' | 'circle';

interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
  width?: string | number;
  height?: string | number;
  count?: number;
  rounded?: boolean;
}

/**
 * Base Skeleton Component
 * Animated loading placeholder with shimmer effect
 */
export const Skeleton = ({
  variant = 'text',
  className = '',
  width,
  height,
  count = 1,
  rounded = false,
}: SkeletonProps) => {
  const baseClasses = 'animate-pulse bg-[hsl(var(--surface-secondary))]';

  const variantClasses = {
    text: 'rounded',
    card: 'rounded-md',
    grid: 'rounded',
    list: 'rounded',
    circle: 'rounded-full',
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'circle' ? height || '40px' : undefined),
    height: height || (variant === 'text' ? '1em' : variant === 'circle' ? width || '40px' : '80px'),
  };

  if (count === 1) {
    return (
      <div
        className={`${baseClasses} ${variantClasses[variant]} ${rounded ? 'rounded-full' : ''} ${className}`}
        style={style}
        role="status"
        aria-label="Loading..."
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${baseClasses} ${variantClasses[variant]} ${rounded ? 'rounded-full' : ''} ${className}`}
          style={style}
          role="status"
          aria-label="Loading..."
        >
          <span className="sr-only">Loading...</span>
        </div>
      ))}
    </>
  );
};

/**
 * Skeleton Text - For text lines
 */
export const SkeletonText = ({
  lines = 3,
  className = '',
  width = '100%',
}: {
  lines?: number;
  className?: string;
  width?: string | number;
}) => (
  <div className={`space-y-2 ${className}`} role="status" aria-label="Loading text...">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} variant="text" width={i === lines - 1 ? '75%' : width} height="1em" className="h-4" />
    ))}
  </div>
);

/**
 * Skeleton Card - For card/panel placeholders
 */
export const SkeletonCard = ({ className = '' }: { className?: string }) => (
  <div
    className={`p-4 border border-[hsl(var(--border))] rounded-md space-y-3 bg-[hsl(var(--bg-secondary))] ${className}`}
    role="status"
    aria-label="Loading card..."
  >
    <Skeleton variant="text" width="50%" height="1.5em" className="h-6" />
    <SkeletonText lines={3} />
    <div className="flex gap-2 pt-2">
      <Skeleton variant="card" width="96px" height="36px" className="h-9 w-24" />
      <Skeleton variant="card" width="96px" height="36px" className="h-9 w-24" />
    </div>
  </div>
);

/**
 * Skeleton Grid - For grid layouts (champion grid, etc.)
 */
export const SkeletonGrid = ({
  count = 12,
  cols = 6,
  className = '',
}: {
  count?: number;
  cols?: number;
  className?: string;
}) => (
  <div
    className={`grid gap-4 ${className}`}
    style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    role="status"
    aria-label="Loading grid..."
  >
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex flex-col gap-2">
        <Skeleton variant="circle" width="80px" height="80px" className="w-20 h-20 mx-auto" />
        <Skeleton variant="text" width="100%" height="1em" className="h-4" />
      </div>
    ))}
  </div>
);

/**
 * Skeleton List - For list of items
 */
export const SkeletonList = ({ items = 5, className = '' }: { items?: number; className?: string }) => (
  <div className={`space-y-3 ${className}`} role="status" aria-label="Loading list...">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 border border-[hsl(var(--border))] rounded-md">
        <Skeleton variant="circle" width="48px" height="48px" className="w-12 h-12 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="75%" height="1em" className="h-4" />
          <Skeleton variant="text" width="50%" height="0.75em" className="h-3" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Skeleton Circle - For avatars, icons
 */
export const SkeletonCircle = ({ size = 40, className = '' }: { size?: number; className?: string }) => (
  <Skeleton variant="circle" width={size} height={size} className={className} />
);
