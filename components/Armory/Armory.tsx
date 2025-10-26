import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Champion, ChampionLite } from '../../types';
import { ChampionDetailModal } from './ChampionDetailModal';
import { useChampions } from '../../contexts/ChampionContext';

interface ArmoryProps {
    initialSearchTerm?: string | null;
    onSearchHandled?: () => void;
    onLoadChampionInLab: (championId: string, role?: string) => void;
}

const ChampionCard = React.memo(({ champion, onSelect }: { champion: ChampionLite; onSelect: (champion: ChampionLite) => void; }) => {
    const handleClick = useCallback(() => onSelect(champion), [onSelect, champion]);
    return (
        <button onClick={handleClick} className="group relative bg-surface border border-border rounded-lg text-left hover:border-accent/80 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden shadow-md hover:shadow-xl hover:shadow-accent/10">
            <div className="overflow-hidden">
                <img src={champion.image} alt={champion.name} loading="lazy" className="w-full h-32 object-cover object-top transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="p-3">
                <h3 className="font-bold text-text-primary group-hover:text-accent transition-colors truncate">{champion.name}</h3>
            </div>
        </button>
    );
});


export const Armory = ({ initialSearchTerm, onSearchHandled, onLoadChampionInLab }: ArmoryProps) => {
    const { champions, championsLite } = useChampions();
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');
    const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);

    useEffect(() => {
        if (initialSearchTerm) {
            setSearchTerm(initialSearchTerm);
            const foundChampion = champions.find(c => c.name.toLowerCase() === initialSearchTerm.toLowerCase());
            if (foundChampion) {
                setSelectedChampion(foundChampion);
            }
            if (onSearchHandled) {
              onSearchHandled();
            }
        }
    }, [initialSearchTerm, onSearchHandled, champions]);
    
    const filteredChampions = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        if (!lowercasedTerm) return championsLite;
        return championsLite.filter(c => c.name.toLowerCase().includes(lowercasedTerm));
    }, [searchTerm, championsLite]);

    const handleSelectChampion = useCallback((champion: ChampionLite) => {
        const fullChampionData = champions.find(c => c.id === champion.id);
        if (fullChampionData) {
            setSelectedChampion(fullChampionData);
        }
    }, [champions]);
    
    return (
        <div className="space-y-6">
            <input
                type="text"
                placeholder="Search for a champion..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredChampions.map(champ => (
                    <ChampionCard key={champ.id} champion={champ} onSelect={handleSelectChampion} />
                ))}
            </div>

            {selectedChampion && (
                <ChampionDetailModal
                    isOpen={!!selectedChampion}
                    onClose={() => setSelectedChampion(null)}
                    champion={selectedChampion}
                    onLoadInLab={onLoadChampionInLab}
                />
            )}
        </div>
    );
};