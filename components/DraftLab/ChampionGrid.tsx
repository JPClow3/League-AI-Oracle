import React, { useState, useMemo } from 'react';
import type { Champion, ChampionLite, DraftState } from '../../types';
import { useChampions } from '../../contexts/ChampionContext';
import { useSettings } from '../../hooks/useSettings';
import { getAvailableChampions } from '../../lib/draftUtils';
import { ROLES, DAMAGE_TYPES } from '../../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

interface ChampionGridProps {
    onSelect: (champion: ChampionLite) => void;
    onQuickLook: (champion: ChampionLite) => void;
    onWhyThisPick: (champion: ChampionLite) => void;
    recommendations: { championName: string; reasoning: string }[];
    isRecsLoading: boolean;
    activeRole: string | null;
    draftState: DraftState;
    onDragStart: (event: React.DragEvent, champion: Champion) => void;
}

const FilterButton = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        aria-pressed={active}
        aria-label={`Filter by ${label}`}
        className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
            active ? 'bg-accent text-on-accent' : 'bg-surface-secondary text-text-secondary hover:bg-border'
        }`}
    >
        {label}
    </button>
);

export const ChampionGrid = ({ onSelect, onQuickLook, draftState, onDragStart }: ChampionGridProps) => {
    const { champions, championsLite } = useChampions();
    const { settings } = useSettings();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [damageFilter, setDamageFilter] = useState('All');
    
    const availableChampions = useMemo(() => getAvailableChampions(draftState, championsLite), [draftState, championsLite]);

    const filteredAndSortedChampions = useMemo(() => {
        let filtered = availableChampions;

        if (searchTerm) {
            filtered = filtered.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (roleFilter !== 'All') {
            filtered = filtered.filter(c => c.roles.includes(roleFilter));
        }
        if (damageFilter !== 'All') {
            filtered = filtered.filter(c => c.damageType === damageFilter);
        }

        // Sort by favorite, then by name
        return filtered.sort((a, b) => {
            const isAFavorite = settings.favoriteChampions.includes(a.id);
            const isBFavorite = settings.favoriteChampions.includes(b.id);
            if (isAFavorite && !isBFavorite) return -1;
            if (!isAFavorite && isBFavorite) return 1;
            return a.name.localeCompare(b.name);
        });
    }, [availableChampions, searchTerm, roleFilter, damageFilter, settings.favoriteChampions]);

    return (
        <div className="bg-surface p-4 flex flex-col h-full border border-border-primary">
            <div className="relative mb-2 flex-shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} aria-hidden="true"/>
                <input
                    type="text"
                    placeholder="Search champions..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    aria-label="Search champions"
                    className="w-full bg-surface-inset border border-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                />
            </div>
            <div className="flex flex-wrap gap-2 mb-2 flex-shrink-0">
                {['All', ...ROLES].map(role => (
                    <React.Fragment key={role}>
                        <FilterButton label={role} active={roleFilter === role} onClick={() => setRoleFilter(role)} />
                    </React.Fragment>
                ))}
            </div>
            <div className="flex flex-wrap gap-2 mb-3 flex-shrink-0 border-t border-border pt-2">
                 {DAMAGE_TYPES.map(type => (
                    <React.Fragment key={type}>
                        <FilterButton label={type} active={damageFilter === type} onClick={() => setDamageFilter(type)} />
                    </React.Fragment>
                ))}
            </div>
            
            <div className="flex-grow overflow-y-auto pr-2">
                {filteredAndSortedChampions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <p className="text-text-secondary text-lg mb-2">No champions available</p>
                        <p className="text-text-muted text-sm">
                            {availableChampions.length === 0
                                ? "All champions have been selected or banned"
                                : "Try adjusting your search or filters"
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-2">
                        <AnimatePresence>
                            {filteredAndSortedChampions.map(champ => (
                            <motion.div
                                key={champ.id}
                                {...{
                                    layout: true,
                                    initial: { opacity: 0, scale: 0.8 },
                                    animate: { opacity: 1, scale: 1 },
                                    exit: { opacity: 0, scale: 0.8 },
                                    transition: { duration: 0.2 },
                                }}
                            >
                                <Tooltip content={champ.name}>
                                    <button
                                        onClick={() => onSelect(champ)}
                                        onContextMenu={(e) => { e.preventDefault(); onQuickLook(champ); }}
                                        draggable="true"
                                        onDragStart={(e) => {
                                            const fullChamp = champions.find(c => c.id === champ.id);
                                            if (fullChamp) {
                                                onDragStart(e, fullChamp);
                                            } else {
                                                e.preventDefault();
                                            }
                                        }}
                                        aria-label={`Select ${champ.name}`}
                                        className="w-full aspect-square bg-surface-inset border-2 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent hover:border-accent transition-colors"
                                    >
                                        <img src={champ.image} alt={champ.name} className="w-full h-full object-cover rounded-md" loading="lazy" />
                                    </button>
                                </Tooltip>
                            </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};