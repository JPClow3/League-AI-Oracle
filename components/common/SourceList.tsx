import React from 'react';
import type { MetaSource } from '../../types';

interface SourceListProps {
    sources: MetaSource[];
}

export const SourceList = ({ sources }: SourceListProps) => (
    <div>
        <h3 className="font-bold text-lg text-gold mt-6">Sources:</h3>
        <ul className="list-disc pl-5 text-sm space-y-1 mt-2">
            {sources.map((source, index) => (
                <li key={index}>
                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                        {source.title}
                    </a>
                </li>
            ))}
        </ul>
    </div>
);
