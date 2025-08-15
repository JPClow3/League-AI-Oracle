import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Champion, ChampionLite } from '../../types';
import { CHAMPIONS, CHAMPIONS_LITE } from '../../constants';
import { ChampionDetailModal } from './ChampionDetailModal';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

const ChampionCard: React.FC<{ champion: ChampionLite; onClick: () => void }> = ({ champion, onClick }) => (
  <div
    onClick={onClick}
    className="bg-slate-800/70 rounded-lg overflow-hidden cursor-pointer group transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-[rgb(var(--color-accent-logo))]/20 w-full h-full flex flex-col"
  >
    <img 
        src={champion.image} 
        alt={champion.name} 
        className="w-full h-24 object-cover object-center grayscale group-hover:grayscale-0 transition-all duration-300" 
        loading="lazy"
        width="150"
        height="96"
    />
    <div className="p-2 flex-grow flex items-center justify-center">
      <h3 className="font-bold text-white text-center text-sm">{champion.name}</h3>
    </div>
  </div>
);

// Moved Cell component outside the Armory component render scope to prevent re-creation on every render.
// It now receives necessary data via the `itemData` prop from react-window.
const Cell = ({ columnIndex, rowIndex, style, data }: { 
    columnIndex: number, 
    rowIndex: number, 
    style: React.CSSProperties, 
    data: {
        champions: ChampionLite[];
        onClick: (champion: ChampionLite) => void;
        columnCount: number;
    }
}) => {
    const { champions, onClick, columnCount } = data;
    const index = rowIndex * columnCount + columnIndex;
    if (index >= champions.length) {
        return null;
    }
    const champion = champions[index];
    return (
        <div style={style} className="p-2">
            <ChampionCard champion={champion} onClick={() => onClick(champion)} />
        </div>
    );
};

interface ArmoryProps {
    initialSearchTerm?: string | null;
    onSearchHandled?: () => void;
    onLoadChampionInLab: (championId: string) => void;
}

export const Armory: React.FC<ArmoryProps> = ({ initialSearchTerm, onSearchHandled, onLoadChampionInLab }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);
  
  useEffect(() => {
    if (initialSearchTerm) {
        setSearchTerm(initialSearchTerm);
        // Automatically open the champion if it's an exact match
        const exactMatch = CHAMPIONS.find(c => c.name.toLowerCase() === initialSearchTerm.toLowerCase());
        if (exactMatch) {
            setSelectedChampion(exactMatch);
        }
        onSearchHandled?.();
    }
  }, [initialSearchTerm, onSearchHandled]);

  useEffect(() => {
    const timerId = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => {
        clearTimeout(timerId);
    };
  }, [searchTerm]);

  const roles = ['All', 'Top', 'Jungle', 'Mid', 'ADC', 'Support'];

  const filteredChampions = useMemo(() => {
    return CHAMPIONS_LITE
      .filter(c => c.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      .filter(c => roleFilter === 'All' || c.roles.includes(roleFilter));
  }, [debouncedSearchTerm, roleFilter]);

  const handleChampionClick = useCallback((championLite: ChampionLite) => {
    const fullChampion = CHAMPIONS.find(c => c.id === championLite.id);
    if (fullChampion) {
      setSelectedChampion(fullChampion);
    }
  }, []);
  
  const handleLoadInLab = (championId: string) => {
    onLoadChampionInLab(championId);
    setSelectedChampion(null); // Close modal after action
  };

  const cardWidth = 150;
  const cardHeight = 150;

  return (
    <div className="space-y-6 h-full flex flex-col min-h-[calc(100vh-200px)]">
      <div className="p-4 bg-slate-800 rounded-lg flex flex-col md:flex-row gap-4 items-center sticky top-[70px] z-40">
        <input
          type="text"
          placeholder="Search champion..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 bg-slate-900 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent-bg))]"
        />
        <div className="flex items-center gap-2 flex-wrap">
          {roles.map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                roleFilter === role ? 'bg-[rgb(var(--color-accent-bg))] text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow">
         <AutoSizer>
            {({ height, width }) => {
                const columnCount = Math.max(1, Math.floor(width / cardWidth));
                const rowCount = Math.ceil(filteredChampions.length / columnCount);
                return (
                    <Grid
                        className="w-full"
                        columnCount={columnCount}
                        rowCount={rowCount}
                        columnWidth={cardWidth}
                        rowHeight={cardHeight}
                        width={width}
                        height={height}
                        itemData={{
                            champions: filteredChampions,
                            onClick: handleChampionClick,
                            columnCount,
                        }}
                    >
                        {Cell}
                    </Grid>
                );
            }}
         </AutoSizer>
      </div>

      {selectedChampion && (
        <ChampionDetailModal
          champion={selectedChampion}
          isOpen={!!selectedChampion}
          onClose={() => setSelectedChampion(null)}
          onLoadInLab={handleLoadInLab}
        />
      )}
    </div>
  );
};
