

import React from 'react';
import { Spinner } from './Spinner';

interface OracleEyeButtonProps {
    onClick: () => void;
    isLoading: boolean;
    title?: string;
}

export const OracleEyeButton: React.FC<OracleEyeButtonProps> = ({ onClick, isLoading, title = "Get AI Explanation" }) => {
    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className="p-1 rounded-full hover:bg-primary-light/20 dark:hover:bg-primary-dark/30 transition-colors disabled:cursor-wait"
            title={title}
            aria-label={title}
        >
            {isLoading ? (
                <Spinner size="h-4 w-4" />
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            )}
        </button>
    );
};