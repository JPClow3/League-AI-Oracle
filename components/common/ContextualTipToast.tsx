import React from 'react';
import { ContextualDraftTip } from '../../types';
import { Icon } from './Icon';

interface ContextualTipToastProps {
    tip: ContextualDraftTip;
    lessonTitle: string;
    onClose: () => void;
    onLearnMore: () => void;
}

export const ContextualTipToast: React.FC<ContextualTipToastProps> = ({ tip, lessonTitle, onClose, onLearnMore }) => {
    return (
        <div className="w-full max-w-lg animate-slide-fade-in">
            <div className="bg-slate-800/80 dark:bg-slate-900/80 border border-indigo-500/50 rounded-lg shadow-2xl p-4 glass-effect">
                <div className="flex items-start gap-3">
                    <Icon name="brain" className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-grow">
                        <h3 className="font-semibold text-indigo-400">Oracle's Insight</h3>
                        <p className="text-sm text-slate-200">
                            {tip.insight}
                            <button onClick={onLearnMore} className="ml-2 font-semibold text-amber-400 hover:text-amber-300 underline">
                                [Learn about {lessonTitle}]
                            </button>
                        </p>
                    </div>
                     <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700">
                        <Icon name="x" className="w-5 h-5"/>
                    </button>
                </div>
            </div>
        </div>
    );
};
