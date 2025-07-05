import React from 'react';
import { Champion } from '../../types';
import { ChampionIcon } from './ChampionIcon';
import InteractiveText from './InteractiveText';
import { Icon } from './Icon';

interface MVPCardProps {
    champion: Champion | null;
    reasoning: string;
    version: string;
    onKeywordClick: (lessonId: string) => void;
}

export const MVPCard: React.FC<MVPCardProps> = ({ champion, reasoning, version, onKeywordClick }) => {
    if (!champion) return null;

    return (
        <div className="p-3 bg-teal-500/10 rounded-lg border border-teal-500/30 flex items-start gap-4">
            <div className="relative flex-shrink-0">
                <ChampionIcon
                    champion={champion}
                    version={version}
                    className="w-24 h-24"
                    isClickable={false}
                />
                <div className="absolute -inset-1.5 rounded-lg ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-800 animate-pulse" style={{ animationDuration: '3s' }} />
                <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-amber-400 text-slate-900 rounded-full p-1.5 shadow-lg">
                    <Icon name="profile" className="w-5 h-5" />
                </div>
            </div>
            <div className="flex-grow">
                <h5 className="font-display text-xl text-teal-600 dark:text-teal-300">Team MVP: {champion.name}</h5>
                <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    <InteractiveText onKeywordClick={onKeywordClick}>{reasoning}</InteractiveText>
                </div>
            </div>
        </div>
    );
};
