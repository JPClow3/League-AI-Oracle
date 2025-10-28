import React from 'react';
import type { MetaSource } from '../../types';

interface SourceListProps {
    sources: MetaSource[];
    className?: string;
}

export const SourceList: React.FC<SourceListProps> = ({ sources, className = '' }) => {
    if (!sources || sources.length === 0) {
        return null;
    }

    return (
        <div className={`space-y-2 ${className}`}>
            <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                Sources
            </h4>
            <div className="space-y-2">
                {sources.map((source, index) => (
                    <div
                        key={index}
                        className="p-3 bg-secondary/50 border border-border rounded-lg hover:bg-secondary/70 transition-colors"
                    >
                        {source.uri && (
                            <a
                                href={source.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent hover:text-accent-hover font-medium text-sm flex items-center gap-2"
                            >
                                <span>{source.title || 'Source'}</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

