import React, { useState } from 'react';
import { Champion } from '../../types';
import { ChampionIcon } from './ChampionIcon';
import InteractiveText from './InteractiveText';
import { Icon } from './Icon';

type ThreatLevel = 'High' | 'Medium' | 'Low';

interface ThreatCardProps {
    champion: Champion | null;
    threatLevel: ThreatLevel;
    counterplay: string;
    itemSpikeWarning?: string;
    version: string;
    onKeywordClick: (lessonId: string) => void;
}

export const ThreatCard: React.FC<ThreatCardProps> = ({ champion, threatLevel, counterplay, itemSpikeWarning, version, onKeywordClick }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    if (!champion) return null;
    
    const threatConfig = {
        High: { color: 'rose', icon: 'warning' as const },
        Medium: { color: 'amber', icon: 'info' as const },
        Low: { color: 'slate', icon: 'info' as const },
    };

    const config = threatConfig[threatLevel];

    return (
        <div className={`p-3 bg-${config.color}-500/10 rounded-lg border border-${config.color}-500/30`}>
            <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                    <ChampionIcon champion={champion} version={version} className="w-16 h-16" isClickable={false} />
                    <div className={`absolute top-0 right-0 -mt-1 -mr-1 bg-${config.color}-500 text-white rounded-full p-1 shadow-lg`}>
                        <Icon name={config.icon} className="w-4 h-4" />
                    </div>
                </div>
                <div className="flex-grow">
                    <h5 className={`font-display text-lg text-${config.color}-600 dark:text-${config.color}-400`}>{threatLevel} Threat: {champion.name}</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                         <InteractiveText onKeywordClick={onKeywordClick}>{counterplay}</InteractiveText>
                    </p>
                </div>
                <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 text-slate-400 hover:text-indigo-400 mt-1">
                    <Icon name="chevron-down" className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            </div>
             <div className={`collapsible ${isExpanded ? 'expanded' : ''}`}>
                <div className="pt-2 mt-2 border-t border-slate-700/50">
                    <div className="text-sm text-slate-600 dark:text-slate-400 prose prose-sm dark:prose-invert max-w-none">
                        <InteractiveText onKeywordClick={onKeywordClick}>{counterplay}</InteractiveText>
                    </div>
                    {itemSpikeWarning && (
                        <p className="mt-2 text-xs text-amber-500 font-semibold p-1.5 bg-amber-500/10 rounded-md">
                            <Icon name="warning" className="w-3 h-3 inline-block mr-1" />
                            <strong>Item Spike Warning:</strong> {itemSpikeWarning}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
