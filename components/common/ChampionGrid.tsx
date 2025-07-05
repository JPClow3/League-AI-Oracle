import React, { useState, useMemo } from 'react';
import { Champion, Role, DDragonData } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';
import { ChampionIcon } from './ChampionIcon';
import { useProfile } from '../../contexts/ProfileContext';

interface ChampionGridProps {
    ddragonData: DDragonData;
    onChampionSelect: (champion: Champion) => void;
    onChampionHover?: (champion: Champion) => void;
    onChampionLeave?: () => void;
    pickedChampionIds: Set<string>;
    iconClassName?: string;
}

const roleOrder: Role[] = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'SUPPORT'];

export const ChampionGrid: React.FC<ChampionGridProps> = ({
    ddragonData,
    onChampionSelect,
    onChampionHover,
    onChampionLeave,
    pickedChampionIds,
    iconClassName = 'w-16 h-16'
}) => {
    const { activeProfile } = useProfile();
    const { settings } = activeProfile!;
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 250);
    const [isPoolFilterActive, setPoolFilterActive] = useState(false);
    
    const champions = useMemo(() => Object.values(ddragonData.champions), [ddragonData]);

    const filteredChampions = useMemo(() => {
        const poolChampions = isPoolFilterActive
            ? champions.filter(c => settings.championPool.includes(c.id))
            : champions;

        return poolChampions
            .filter(c => !pickedChampionIds.has(c.id))
            .filter(c => c.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [champions, debouncedSearchTerm, pickedChampionIds, isPoolFilterActive, settings.championPool]);

    const championsByRole = useMemo(() => {
        const grouped: Record<Role, Champion[]> = { TOP: [], JUNGLE: [], MIDDLE: [], BOTTOM: [], SUPPORT: [] };
        filteredChampions.forEach(champ => {
            const role = champ.primaryRole || 'SUPPORT'; // Default to support if no role is defined
            if (grouped[role]) {
                grouped[role].push(champ);
            }
        });
        return roleOrder.map(role => ({ role, champions: grouped[role] || [] })).filter(g => g.champions.length > 0);
    }, [filteredChampions]);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <input
                    type="text"
                    placeholder="Search for a champion..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow p-2 rounded bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                />
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">My Pool</span>
                    <button
                        onClick={() => setPoolFilterActive(prev => !prev)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPoolFilterActive ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                        aria-pressed={isPoolFilterActive}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPoolFilterActive ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                    </button>
                </div>
            </div>
            <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
                {championsByRole.map(({ role, champions: roleChamps }) => (
                    <div key={role}>
                        <h4 className="font-display text-lg text-slate-500 dark:text-slate-400 mb-2 capitalize">{role.toLowerCase().replace('_', ' ')}</h4>
                        <div className="grid grid-cols-7 md:grid-cols-8 lg:grid-cols-10 gap-3">
                            {roleChamps.map(champ => (
                                <div key={champ.id} className="animate-item-add" onMouseEnter={() => onChampionHover?.(champ)} onMouseLeave={onChampionLeave}>
                                    <ChampionIcon champion={champ} version={ddragonData.version} onClick={onChampionSelect} className={iconClassName} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {filteredChampions.length === 0 && (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-4">No champions match your search.</p>
                )}
            </div>
        </div>
    );
};
