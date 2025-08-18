import React, { useState, useRef, useCallback } from 'react';
import type { MetaSource } from '../../types';
import { getGroundedAnswer } from '../../services/geminiService';
import { Button } from '../common/Button';
import { Loader } from '../common/Loader';
import { SourceList } from '../common/SourceList';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { TextArea } from '../common/TextArea';

interface OracleResponse {
    text: string;
    sources: MetaSource[];
}

const EXAMPLE_PROMPTS = [
    "What's the best build for Yasuo in the current patch?",
    "Summarize the most recent patch notes.",
    "Who are the S-Tier junglers right now?",
    "How do I play against a Zed in the mid lane?",
];

export const MetaOracle: React.FC = () => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState<OracleResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const handleSubmit = useCallback(async (currentQuery: string) => {
        if (!currentQuery.trim()) return;

        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoading(true);
        setError(null);
        setResponse(null);

        try {
            const result = await getGroundedAnswer(currentQuery, controller.signal);
            if (!controller.signal.aborted) {
                setResponse(result);
            }
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {
              console.log("Oracle query aborted.");
              return;
            }
            if (!controller.signal.aborted) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            }
        } finally {
            if (!controller.signal.aborted) {
                setIsLoading(false);
            }
        }
    }, []);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit(query);
    };

    const handleExampleClick = (prompt: string) => {
        setQuery(prompt);
        handleSubmit(prompt);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-4 rounded-xl shadow-lg">
                <div className="bg-slate-700/50 text-cyan-300 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <h1 className="font-display text-3xl font-bold text-white">The Oracle</h1>
                    <p className="text-sm text-gray-400">Consult the All-Seeing Eye. Ask any question about the meta and receive an answer grounded in the latest data.</p>
                </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700/50 space-y-4">
                <form onSubmit={handleFormSubmit} className="space-y-3">
                    <TextArea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., What are the best support items against assassins?"
                        rows={3}
                        disabled={isLoading}
                    />
                    <Button type="submit" variant="primary-glow" disabled={isLoading || !query.trim()}>
                        {isLoading ? 'Consulting...' : 'Ask the Oracle'}
                    </Button>
                </form>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700/50 min-h-[300px]">
                {isLoading && <Loader messages={["Consulting the latest sources...", "Synthesizing strategic intel..."]} />}
                
                {error && !isLoading && (
                    <div aria-live="polite" className="text-center p-8">
                        <p className="text-red-400 mb-4">{error}</p>
                        <Button onClick={() => handleSubmit(query)}>Retry</Button>
                    </div>
                )}
                
                {!isLoading && !error && !response && (
                    <div className="text-center p-8 text-gray-400">
                        <h3 className="text-lg font-semibold text-white mb-4">Try asking about...</h3>
                        <div className="flex flex-wrap justify-center gap-3">
                            {EXAMPLE_PROMPTS.map(prompt => (
                                <button
                                    key={prompt}
                                    onClick={() => handleExampleClick(prompt)}
                                    className="px-3 py-2 bg-slate-700/50 rounded-lg text-sm hover:bg-slate-700 transition-colors"
                                >
                                    "{prompt}"
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {response && !isLoading && (
                    <div aria-live="polite" className="space-y-6">
                        <div className="prose prose-invert prose-slate max-w-none text-gray-300 prose-headings:text-white prose-a:text-blue-400 prose-strong:text-gray-200">
                           <MarkdownRenderer text={response.text} />
                        </div>
                        {response.sources.length > 0 && <SourceList sources={response.sources} />}
                    </div>
                )}
            </div>
        </div>
    );
};