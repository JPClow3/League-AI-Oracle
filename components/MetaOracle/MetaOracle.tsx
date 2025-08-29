import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { MetaSource } from '../../types';
import { getGroundedAnswer } from '../../services/geminiService';
import { Button } from '../common/Button';
import { Loader } from '../common/Loader';
import { SourceList } from '../common/SourceList';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { TextArea } from '../common/TextArea';
import { Eye } from 'lucide-react';
import { useGeminiData } from '../../hooks/useGemini';

const EXAMPLE_PROMPTS = [
    "What's the best build for Yasuo in the current patch?",
    "Summarize the most recent patch notes.",
    "Who are the S-Tier junglers right now?",
    "How do I play against a Zed in the mid lane?",
];

export const MetaOracle = () => {
    const [query, setQuery] = useState('');
    
    // The fetcher now accepts the query as an argument to avoid race conditions.
    const fetcher = useCallback((signal: AbortSignal, currentQuery: string) => {
        if (!currentQuery) {
            return Promise.resolve({ text: '', sources: [] });
        }
        return getGroundedAnswer(currentQuery, signal);
    }, []);

    const { data: response, isLoading, error, execute: fetchResponse } = useGeminiData(fetcher, true);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            fetchResponse(query);
        }
    };

    const handleExampleClick = (prompt: string) => {
        setQuery(prompt);
        // Directly call fetchResponse with the new prompt, avoiding state-related race conditions.
        fetchResponse(prompt);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 bg-surface border border-border p-4 shadow-lg">
                <div className="bg-secondary text-primary w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <Eye size={32} strokeWidth={1.5} />
                </div>
                <div>
                    <h1 className="font-display text-3xl font-bold text-text-primary">The Oracle</h1>
                    <p className="text-sm text-text-secondary">Consult the All-Seeing Eye. Ask any question about the meta and receive an answer grounded in the latest data.</p>
                </div>
            </div>

            <div className="bg-surface p-6 shadow-lg border border-border space-y-4">
                <form onSubmit={handleFormSubmit} className="space-y-3">
                    <TextArea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., What are the best support items against assassins?"
                        rows={3}
                        disabled={isLoading}
                    />
                    <Button type="submit" variant="primary" disabled={isLoading || !query.trim()}>
                        {isLoading ? 'Consulting...' : 'Ask the Oracle'}
                    </Button>
                </form>
            </div>

            <div className="bg-surface p-6 shadow-lg border border-border min-h-[300px]">
                {isLoading && <Loader messages={["Consulting the latest sources...", "Synthesizing strategic intel..."]} />}
                
                {error && !isLoading && (
                    <div aria-live="polite" className="text-center p-8">
                        <p className="text-error mb-4">{error}</p>
                        <Button onClick={() => fetchResponse(query)}>Retry</Button>
                    </div>
                )}
                
                {!isLoading && !error && !response?.text && (
                    <div className="text-center p-8 text-text-secondary">
                        <h3 className="text-lg font-semibold text-text-primary mb-4">Try asking about...</h3>
                        <div className="flex flex-wrap justify-center gap-3">
                            {EXAMPLE_PROMPTS.map(prompt => (
                                <button
                                    key={prompt}
                                    onClick={() => handleExampleClick(prompt)}
                                    className="px-3 py-2 bg-secondary text-sm hover:bg-border transition-colors"
                                >
                                    "{prompt}"
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {response && response.text && !isLoading && (
                    <div aria-live="polite" className="space-y-6">
                        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:text-text-primary prose-a:text-primary prose-strong:text-text-primary">
                           <MarkdownRenderer text={response.text} />
                        </div>
                        {response.sources.length > 0 && <SourceList sources={response.sources} />}
                    </div>
                )}
            </div>
        </div>
    );
};