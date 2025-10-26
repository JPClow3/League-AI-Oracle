/**
 * Skeleton Screen Components
 * Provide better perceived performance during loading
 */

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-gray-700/30';
  
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-700/30 via-gray-600/30 to-gray-700/30 bg-[length:200%_100%]',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

/**
 * Champion Card Skeleton
 */
export const ChampionCardSkeleton: React.FC = () => {
  return (
    <div className="relative p-3 rounded-lg border border-gray-700 bg-gray-800/50">
      <Skeleton variant="rounded" height={120} className="mb-2" />
      <Skeleton variant="text" width="80%" className="mb-2" />
      <Skeleton variant="text" width="60%" />
    </div>
  );
};

/**
 * Champion Grid Skeleton
 */
interface ChampionGridSkeletonProps {
  count?: number;
}

export const ChampionGridSkeleton: React.FC<ChampionGridSkeletonProps> = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <ChampionCardSkeleton key={index} />
      ))}
    </div>
  );
};

/**
 * Draft Panel Skeleton
 */
export const DraftPanelSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 p-4 bg-gray-800/30 rounded-lg">
      <Skeleton variant="text" width="40%" height={24} />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="70%" />
              <Skeleton variant="text" width="50%" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Advice Panel Skeleton
 */
export const AdvicePanelSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 p-4 bg-gray-800/30 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="text" width="40%" height={20} />
      </div>
      <Skeleton variant="rectangular" height={80} className="mb-3 rounded" />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="95%" />
      <Skeleton variant="text" width="90%" />
      <Skeleton variant="text" width="85%" />
    </div>
  );
};

/**
 * Lesson Card Skeleton
 */
export const LessonCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 border border-gray-700 rounded-lg bg-gray-800/50">
      <div className="flex items-start gap-3 mb-3">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1">
          <Skeleton variant="text" width="70%" height={20} className="mb-2" />
          <Skeleton variant="text" width="50%" />
        </div>
      </div>
      <Skeleton variant="rectangular" height={4} className="mb-3 rounded-full" />
      <div className="flex justify-between items-center">
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="rounded" width={80} height={32} />
      </div>
    </div>
  );
};

/**
 * Strategy Card Skeleton
 */
export const StrategyCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 border border-gray-700 rounded-lg bg-gray-800/50">
      <Skeleton variant="text" width="60%" height={24} className="mb-3" />
      <div className="flex gap-2 mb-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} variant="circular" width={40} height={40} />
        ))}
      </div>
      <Skeleton variant="text" width="100%" className="mb-2" />
      <Skeleton variant="text" width="90%" className="mb-2" />
      <Skeleton variant="text" width="80%" />
      <div className="flex gap-2 mt-4">
        <Skeleton variant="rounded" width={80} height={28} />
        <Skeleton variant="rounded" width={80} height={28} />
      </div>
    </div>
  );
};

/**
 * Navigation Skeleton
 */
export const NavigationSkeleton: React.FC = () => {
  return (
    <nav className="flex items-center gap-4 p-4">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex gap-4 flex-1">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} variant="text" width={80} height={20} />
        ))}
      </div>
      <Skeleton variant="circular" width={40} height={40} />
    </nav>
  );
};

/**
 * Profile Stats Skeleton
 */
export const ProfileStatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="p-4 bg-gray-800/30 rounded-lg">
          <Skeleton variant="text" width="60%" className="mb-2" />
          <Skeleton variant="text" width="80%" height={32} />
        </div>
      ))}
    </div>
  );
};

/**
 * Table Skeleton
 */
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 p-3 bg-gray-800/50 rounded-t-lg">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} variant="text" width="100%" height={20} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 p-3 bg-gray-800/30">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" width="100%" />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Modal Skeleton
 */
export const ModalSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full">
      <div className="flex justify-between items-start mb-4">
        <Skeleton variant="text" width="50%" height={28} />
        <Skeleton variant="circular" width={32} height={32} />
      </div>
      <Skeleton variant="rectangular" height={200} className="mb-4 rounded" />
      <div className="space-y-2 mb-4">
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="95%" />
        <Skeleton variant="text" width="90%" />
      </div>
      <div className="flex justify-end gap-3">
        <Skeleton variant="rounded" width={100} height={40} />
        <Skeleton variant="rounded" width={100} height={40} />
      </div>
    </div>
  );
};

/**
 * Page Skeleton
 */
export const PageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <NavigationSkeleton />
      <div className="container mx-auto px-4 py-8">
        <Skeleton variant="text" width="30%" height={36} className="mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ChampionGridSkeleton count={12} />
          </div>
          <div className="space-y-6">
            <DraftPanelSkeleton />
            <AdvicePanelSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * List Skeleton
 */
interface ListSkeletonProps {
  items?: number;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({ items = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="50%" />
          </div>
          <Skeleton variant="rounded" width={80} height={32} />
        </div>
      ))}
    </div>
  );
};
import React from 'react';


