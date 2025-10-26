import React, { useMemo } from 'react';
import type { HistoryEntry } from '../../types';
import { useChampions } from '../../contexts/ChampionContext';
import { BarChart, PieChart, AlertTriangle } from 'lucide-react';
import { ROLES } from '../../constants';
import { Tooltip } from '../common/Tooltip';

interface StatisticsPanelProps {
    entries: HistoryEntry[];
}

const StatCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="bg-surface-secondary p-4 rounded-lg border border-border">
        <div className="flex items-center gap-2 mb-2">
            {icon}
            <h3 className="font-semibold text-text-primary">{title}</h3>
        </div>
        {children}
    </div>
);

const getTopN = (map: Map<string, number>, n: number) => {
    return Array.from(map.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, n);
};

export const StatisticsPanel = ({ entries }: StatisticsPanelProps) => {
    const { championsLite } = useChampions();
    const stats = useMemo(() => {
        if (entries.length === 0) return null;

        const pickCounts = new Map<string, number>();
        const roleCounts = new Map<string, number>();
        const identityCounts = new Map<string, number>();
        const weaknessCounts = new Map<string, number>();

        for (const entry of entries) {
            const userPicks = entry.draft[entry.userSide].picks;
            
            userPicks.forEach((champId, index) => {
                if (champId) {
                    pickCounts.set(champId, (pickCounts.get(champId) || 0) + 1);
                    const role = ROLES[index];
                    if (role) {
                         roleCounts.set(role, (roleCounts.get(role) || 0) + 1);
                    }
                }
            });
            
            if (entry.analysis) {
                const teamAnalysis = entry.analysis.teamAnalysis[entry.userSide];
                if (teamAnalysis.teamIdentity) {
                    identityCounts.set(teamAnalysis.teamIdentity, (identityCounts.get(teamAnalysis.teamIdentity) || 0) + 1);
                }
                teamAnalysis.weaknesses?.forEach(w => {
                    if (w.keyword) {
                         weaknessCounts.set(w.keyword, (weaknessCounts.get(w.keyword) || 0) + 1);
                    }
                });
            }
        }
        
        return {
            topPicks: getTopN(pickCounts, 5),
            topRoles: getTopN(roleCounts, 3),
            topIdentities: getTopN(identityCounts, 3),
            commonWeaknesses: getTopN(weaknessCounts, 3),
            totalDrafts: entries.length
        };
    }, [entries]);

    if (!stats) return null;

    const totalRolePicks = stats.topRoles.reduce((sum, [, count]) => sum + count, 0);

    return (
        <div className="bg-surface-primary p-4 rounded-lg border border-border mb-6">
            <h2 className="font-display text-2xl font-bold text-text-primary mb-3">Your Strategic Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Most Picked Champions" icon={<BarChart size={20} className="text-accent" />}>
                     <div className="flex flex-wrap gap-4">
                        {stats.topPicks.map(([champId, count]) => {
                            const champ = championsLite.find(c => c.id === champId);
                            if (!champ) return null;
                            return (
                                <React.Fragment key={champId}>
                                    <Tooltip content={`${count} picks`}>
                                         <div className="flex flex-col items-center">
                                            <img src={champ.image} alt={champ.name} className="w-12 h-12 rounded-full border-2 border-border"/>
                                            <span className="text-xs font-semibold">{count}</span>
                                        </div>
                                    </Tooltip>
                                </React.Fragment>
                            );
                        })}
                    </div>
                </StatCard>
                 <StatCard title="Preferred Roles" icon={<PieChart size={20} className="text-accent" />}>
                     <div className="space-y-2">
                        {stats.topRoles.map(([role, count]) => (
                             <div key={role}>
                                <div className="flex justify-between items-center text-sm font-semibold mb-1">
                                    <span>{role}</span>
                                    <span>{((count / totalRolePicks) * 100).toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-surface h-2 rounded-full"><div className="bg-accent h-2 rounded-full" style={{width: `${(count/totalRolePicks)*100}%`}}></div></div>
                             </div>
                        ))}
                     </div>
                </StatCard>
                 <StatCard title="Common Weaknesses" icon={<AlertTriangle size={20} className="text-error" />}>
                    <div className="space-y-1">
                        {stats.commonWeaknesses.length > 0 ? stats.commonWeaknesses.map(([weakness, count]) => (
                            <div key={weakness} className="text-sm bg-surface p-1 px-2 rounded-md flex justify-between">
                                <span className="font-semibold text-text-secondary">{weakness}</span>
                                <span className="text-xs text-text-muted">({count} times)</span>
                            </div>
                        )) : <p className="text-sm text-text-secondary">No recurring weaknesses identified yet. Keep drafting!</p>}
                    </div>
                 </StatCard>
            </div>
        </div>
    );
};