import React from 'react';
import { Icon } from './Icon';

export interface Alert {
    type: 'synergy' | 'clash';
    title: string;
    message: string;
}

interface CompositionAlertProps extends Alert {
    onDismiss: () => void;
}

const CompositionAlert: React.FC<CompositionAlertProps> = ({ type, title, message, onDismiss }) => {
    const isSynergy = type === 'synergy';
    const baseClasses = 'p-3 rounded-lg flex items-start gap-3 border animate-fade-in';
    const colorClasses = isSynergy
        ? 'bg-teal-500/10 border-teal-500/30 text-teal-700 dark:text-teal-300'
        : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400';
    const iconName = isSynergy ? 'check' : 'warning';
    const iconClasses = isSynergy ? 'text-teal-500' : 'text-amber-500';

    return (
        <div className={`${baseClasses} ${colorClasses}`}>
            <div className={`mt-1 flex-shrink-0 ${iconClasses}`}>
                <Icon name={iconName} className="w-5 h-5" />
            </div>
            <div className="flex-grow">
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs">{message}</p>
            </div>
            <button onClick={onDismiss} className="flex-shrink-0 p-1 -m-1 rounded-full hover:bg-black/10">
                <Icon name="x" className="w-4 h-4" />
            </button>
        </div>
    );
};

export default CompositionAlert;
