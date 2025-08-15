import React from 'react';
import type { RecentFeedback } from '../../types';

interface FeedbackPanelProps {
    feedback: RecentFeedback[];
}

const getIcon = (type: RecentFeedback['type']) => {
    if (type === 'adjustment') {
        return (
            <div className="bg-green-500/20 text-green-400 rounded-full p-1.5">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            </div>
        )
    }
    return (
        <div className="bg-blue-500/20 text-blue-400 rounded-full p-1.5">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L9 9.61v5.055a1 1 0 001.581.814l5-2.5a1 1 0 000-1.628V8.385l4.127-2.063a1 1 0 000-1.84l-7-3zM12 10.36l-3 1.5V9l3-1.5v2.86z" /></svg>
        </div>
    )
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ feedback }) => {
    return (
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-4">Actionable Feedback</h2>
            <ul className="space-y-3">
                {feedback.map(item => (
                    <li key={item.id} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">{getIcon(item.type)}</div>
                        <p className="text-sm text-gray-300">{item.message}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};