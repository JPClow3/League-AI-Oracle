import React from 'react';
import { WinCondition } from '../../types';
import { Icon } from './Icon';
import InteractiveText from './InteractiveText';

interface WinConditionCardProps {
  condition: WinCondition;
}

export const WinConditionCard: React.FC<WinConditionCardProps> = ({ condition }) => {
    const iconMap: Record<WinCondition['category'], React.ComponentProps<typeof Icon>['name']> = {
        Protect: 'shield',
        Siege: 'tower',
        Objective: 'dragon',
        Pick: 'target',
        Teamfight: 'sword',
        Macro: 'map'
    };
    const iconName = iconMap[condition.category] || 'brain';

    return (
        <div className="flex items-start gap-3 p-3 bg-slate-200/50 dark:bg-slate-900/40 rounded-lg border border-slate-300 dark:border-slate-700/50 h-full">
            <Icon name={iconName} className="w-6 h-6 text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-1" />
            <div>
                <h5 className="font-semibold text-slate-800 dark:text-slate-200">{condition.category}</h5>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    <InteractiveText onKeywordClick={() => {}}>{condition.text}</InteractiveText>
                </p>
            </div>
        </div>
    );
};
