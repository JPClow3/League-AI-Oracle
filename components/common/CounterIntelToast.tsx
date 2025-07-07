import React, { useEffect } from 'react';
import { CounterIntelligence } from '../../types';
import { Icon } from './Icon';

interface CounterIntelToastProps {
    championName: string;
    intel: CounterIntelligence;
    onClose: () => void;
}

export const CounterIntelToast: React.FC<CounterIntelToastProps> = ({ championName, intel, onClose }) => {
    return (
        <div className="w-80 bg-slate-800/80 dark:bg-slate-900/80 border border-amber-500/50 rounded-lg shadow-2xl p-4 animate-slide-fade-in glass-effect">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-slate-400">Enemy Picked</p>
                    <h3 className="text-xl font-bold font-display text-amber-400">{championName}</h3>
                </div>
                <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700">
                    <Icon name="x" className="w-5 h-5"/>
                </button>
            </div>
            <div className="mt-3 space-y-2">
                <div>
                    <h4 className="font-semibold text-xs text-slate-300">Vulnerable To:</h4>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {intel.vulnerabilities.map(vuln => (
                            <span key={vuln} className="px-2 py-0.5 text-xs bg-rose-900/80 text-rose-300 rounded-full">{vuln}</span>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-xs text-slate-300">Quick Tip:</h4>
                    <p className="text-sm text-slate-300">{intel.quickTip}</p>
                </div>
            </div>
        </div>
    );
};