import React from 'react';
import { Icon } from './Icon';

interface FeatureDisabledScreenProps {
    featureName: string;
    reason?: string;
}

export const FeatureDisabledScreen: React.FC<FeatureDisabledScreenProps> = ({ featureName, reason }) => {
    return (
        <div className="max-w-3xl mx-auto text-center py-20">
            <Icon name="warning" className="w-16 h-16 mx-auto text-amber-500" />
            <h2 className="mt-4 text-4xl font-display text-slate-800 dark:text-slate-200">{featureName} Disabled</h2>
            <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">
                {reason || `This feature requires an API key which has not been configured. Please check the application's environment settings.`}
            </p>
        </div>
    );
};
