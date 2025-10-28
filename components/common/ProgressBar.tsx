/**
 * Progress Bar Component
 * For showing progress during long operations
 */

import React from 'react';

interface ProgressBarProps {
    value: number;
    max?: number;
    label?: string;
    showPercentage?: boolean;
    variant?: 'default' | 'success' | 'warning' | 'error';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * Progress bar for long-running operations
 *
 * @example
 * <ProgressBar
 *   value={progress}
 *   max={100}
 *   label="Generating..."
 *   showPercentage
 * />
 */
export const ProgressBar = ({
    value,
    max = 100,
    label,
    showPercentage = true,
    variant = 'default',
    size = 'md',
    className = ''
}: ProgressBarProps) => {
    const percentage = Math.min(Math.round((value / max) * 100), 100);

    const sizeClasses = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3'
    };

    const variantClasses = {
        default: 'bg-accent',
        success: 'bg-success',
        warning: 'bg-warning',
        error: 'bg-error'
    };

    return (
        <div className={`w-full ${className}`}>
            {(label || showPercentage) && (
                <div className="flex justify-between items-center mb-2">
                    {label && (
                        <span className="text-sm text-text-secondary">{label}</span>
                    )}
                    {showPercentage && (
                        <span className="text-sm font-semibold text-text-primary">
                            {percentage}%
                        </span>
                    )}
                </div>
            )}
            <div
                className={`w-full bg-surface-secondary rounded-full overflow-hidden ${sizeClasses[size]}`}
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-label={label || 'Progress'}
            >
                <div
                    className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full transition-all duration-300 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

/**
 * Indeterminate progress bar (for unknown duration)
 */
export const ProgressBarIndeterminate = ({
    label,
    size = 'md',
    className = ''
}: {
    label?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}) => {
    const sizeClasses = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3'
    };

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <div className="mb-2">
                    <span className="text-sm text-text-secondary">{label}</span>
                </div>
            )}
            <div
                className={`w-full bg-surface-secondary rounded-full overflow-hidden ${sizeClasses[size]}`}
                role="progressbar"
                aria-label={label || 'Loading'}
            >
                <div
                    className={`${sizeClasses[size]} bg-accent rounded-full animate-pulse`}
                    style={{
                        width: '30%',
                        animation: 'progress-indeterminate 1.5s ease-in-out infinite'
                    }}
                />
            </div>
            <style>{`
                @keyframes progress-indeterminate {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(400%); }
                }
            `}</style>
        </div>
    );
};

/**
 * Circular progress indicator
 */
export const ProgressCircle = ({
    value,
    max = 100,
    size = 64,
    strokeWidth = 4,
    label,
    showPercentage = true,
    variant = 'default',
    className = ''
}: {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    label?: string;
    showPercentage?: boolean;
    variant?: 'default' | 'success' | 'warning' | 'error';
    className?: string;
}) => {
    const percentage = Math.min(Math.round((value / max) * 100), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    const variantColors = {
        default: 'hsl(var(--accent))',
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        error: 'hsl(var(--error))'
    };

    return (
        <div className={`inline-flex flex-col items-center ${className}`}>
            <div className="relative" style={{ width: size, height: size }}>
                <svg className="transform -rotate-90" width={size} height={size}>
                    {/* Background circle */}
                    <circle
                        className="text-surface-secondary"
                        strokeWidth={strokeWidth}
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx={size / 2}
                        cy={size / 2}
                    />
                    {/* Progress circle */}
                    <circle
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke={variantColors[variant]}
                        fill="transparent"
                        r={radius}
                        cx={size / 2}
                        cy={size / 2}
                        style={{
                            transition: 'stroke-dashoffset 0.3s ease'
                        }}
                    />
                </svg>
                {showPercentage && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-semibold text-text-primary">
                            {percentage}%
                        </span>
                    </div>
                )}
            </div>
            {label && (
                <span className="mt-2 text-sm text-text-secondary">{label}</span>
            )}
        </div>
    );
};

