import React, { useMemo } from 'react';
import { usePlaybook } from '../../hooks/usePlaybook';
import { Loader } from '../common/Loader';
import { useChampions } from '../../contexts/ChampionContext';
import { BookOpen } from 'lucide-react';

export const PlaybookAnalysisPanel = () => {
    const { entries, isLoading } = usePlaybook();
    const { championsLite } = useChampions();

    const stats = useMemo(() => {
        if (entries.length < 3) {return null;}

        const identityCounts: Record<string, number> = {};
        const winRatesByIdentity: Record<string, { wins: number, total: number }> = {};
        
        for (const entry of entries) {
            if (entry.analysis?.teamAnalysis[entry.userSide]?.teamIdentity) {
                const identity = entry.analysis.teamAnalysis[entry.userSide].teamIdentity;
                identityCounts[identity] = (identityCounts[identity] || 0) + 1;

                if (entry.result) {
                    if (!winRatesByIdentity[identity]) {
                        winRatesByIdentity[identity] = { wins: 0, total: 0 };
                    }
                    winRatesByIdentity[identity].total++;
                    if (entry.result === 'win') {
                        winRatesByIdentity[identity].wins++;
                    }
                }
            }
        }
        
        const sortedIdentities = Object.entries(identityCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);
            
        return {
            topIdentities: sortedIdentities.map(([name, count]) => ({
                name,
                count,
                winRate: winRatesByIdentity[name] ? (winRatesByIdentity[name].wins / winRatesByIdentity[name].total) * 100 : null,
            }))
        };
    }, [entries]);

    return (
        <div className="bg-surface-primary p-6 rounded-xl shadow-lg border border-border-primary">
            <h2 className="text-xl font-bold text-text-primary mb-4">Playbook Analysis</h2>
            {isLoading && <div className="h-24"><Loader /></div>}

            {!isLoading && !stats && (
                 <div className="text-center py-8 bg-surface-secondary/50 rounded-lg border border-border-secondary">
                    <BookOpen className="mx-auto h-12 w-12 text-border-secondary" strokeWidth={1.5} />
                    <h3 className="mt-2 text-md font-semibold text-text-primary">More Data Needed</h3>
                    <p className="mt-1 text-sm text-text-secondary max-w-sm mx-auto">
                       Save at least 3 drafts with analysis to your Archives to unlock strategic insights about your drafting style.
                    </p>
                </div>
            )}
            
            {!isLoading && stats && (
                <div className="space-y-3">
                    <h3 className="font-semibold text-text-secondary">Your Most Drafted Compositions</h3>
                    {stats.topIdentities.map(identity => (
                        <div key={identity.name} className="bg-surface-secondary p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-text-primary">{identity.name}</span>
                                <span className="text-sm text-text-secondary">{identity.count} drafts</span>
                            </div>
                            {identity.winRate !== null && (
                                <div className="text-xs font-semibold mt-1">
                                    Win Rate: <span className={identity.winRate >= 50 ? "text-success" : "text-error"}>{identity.winRate.toFixed(0)}%</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
