import React, { useState, useEffect, useMemo } from 'react';
import type { ChampionLite, ChampionSuggestion } from '../../types';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useSettings } from '../../hooks/useSettings';
import { CHAMPIONS_LITE } from '../../constants';

type EnrichedChampionSuggestion = ChampionSuggestion & { champion: ChampionLite };

interface ChampionGridProps {
  champions: ChampionLite[];
  onSelect: (champion: ChampionLite) => void;
  recommendations: EnrichedChampionSuggestion[];
  isRecsLoading: boolean;
  activeRole: string | null;
}

const ChampionCard: React.FC<{
    champion: ChampionLite;
    onSelect: (champion: ChampionLite) => void;
    reasoning?: string;
    isFavorite?: boolean;
    isActiveRole?: boolean;
}> = ({ champion, onSelect, reasoning, isFavorite = false, isActiveRole = false }) => {
    const borderColor = reasoning ? 'border-yellow-500/30 hover:border-yellow-400/80' : 
                          isFavorite ? 'border-pink-500/30 hover:border-pink-400/80' : 
                          isActiveRole ? 'border-green-500/30 hover:border-green-400/80' :
                          'border-transparent';
    const textColor = reasoning ? 'text-yellow-300' : isFavorite ? 'text-pink-300' : isActiveRole ? 'text-green-300' : 'text-gray-300';
    
    return (
        <div
          className={`flex flex-col items-center text-center cursor-pointer group p-2 bg-slate-900/50 rounded-lg hover:bg-slate-700/50 transition-all duration-200 w-36 border ${borderColor}`}
          onClick={() => onSelect(champion)}
        >
          <img
            src={champion.image}
            alt={champion.name}
            loading="lazy"
            width="64"
            height="64"
            className="w-16 h-16 rounded-lg border-2 border-slate-600 group-hover:border-yellow-400 transition-all duration-200 transform group-hover:scale-110"
          />
          <span className={`font-bold text-sm ${textColor} mt-1`}>{champion.name}</span>
          {reasoning && <p className="text-xs text-gray-300 mt-1">{reasoning}</p>}
        </div>
    );
};

const ChampionIcon: React.FC<{ champion: ChampionLite; onSelect: (champion: ChampionLite) => void; isActiveRole?: boolean; }> = React.memo(({ champion, onSelect, isActiveRole }) => {
  return (
    <div
      className="flex flex-col items-center text-center cursor-pointer group"
      onClick={() => onSelect(champion)}
    >
      <img
        src={champion.image}
        alt={champion.name}
        loading="lazy"
        width="64"
        height="64"
        className={`w-16 h-16 rounded-lg border-2 ${isActiveRole ? 'border-green-400' : 'border-slate-600'} group-hover:border-yellow-400 transition-all duration-200 transform group-hover:scale-110`}
      />
      <span className={`mt-1 text-xs ${isActiveRole ? 'text-green-300' : 'text-gray-300'} group-hover:text-yellow-300`}>{champion.name}</span>
    </div>
  );
});

const Cell = ({ columnIndex, rowIndex, style, data }: {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    filteredChampions: ChampionLite[];
    onSelect: (champion: ChampionLite) => void;
    columnCount: number;
    activeRole: string | null;
  };
}) => {
  const { filteredChampions, onSelect, columnCount, activeRole } = data;
  const index = rowIndex * columnCount + columnIndex;
  if (index >= filteredChampions.length) {
    return null;
  }
  const champion = filteredChampions[index];
  const isActiveRole = activeRole ? champion.roles.includes(activeRole) : false;
  return (
    <div style={style} className="flex items-center justify-center">
      <ChampionIcon champion={champion} onSelect={onSelect} isActiveRole={isActiveRole} />
    </div>
  );
};

export const ChampionGrid: React.FC<ChampionGridProps> = ({ champions, onSelect, recommendations, isRecsLoading, activeRole }) => {
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState(settings.primaryRole || 'All');

  useEffect(() => {
    const timerId = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
        clearTimeout(timerId);
    };
  }, [searchTerm]);

  const roles = ['All', 'Top', 'Jungle', 'Mid', 'ADC', 'Support'];

  const { favoriteChampions, recommendedChampions, regularChampions } = useMemo(() => {
      const recIds = new Set(recommendations.map(r => r.champion.id));
      const favIds = new Set(settings.favoriteChampions);

      const favoriteChamps = settings.favoriteChampions
        .map(id => CHAMPIONS_LITE.find(c => c.id === id))
        .filter((c): c is ChampionLite => !!c && champions.some(ac => ac.id === c.id));
      
      const recommendedChamps = recommendations;
      
      const regularChamps = champions
        .filter(c => !recIds.has(c.id) && !favIds.has(c.id))
        .filter(c => c.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
        .filter(c => roleFilter === 'All' || c.roles.includes(roleFilter));

      return { favoriteChampions: favoriteChamps, recommendedChampions: recommendedChamps, regularChampions: regularChamps };
  }, [champions, recommendations, settings.favoriteChampions, debouncedSearchTerm, roleFilter]);


  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-lg overflow-hidden">
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-slate-800/50 z-10 border-b border-slate-700">
        <input
          type="text"
          placeholder="Search champion..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 bg-slate-900 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
         <div className="flex items-center gap-2 flex-wrap">
          {roles.map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                roleFilter === role ? 'bg-[rgb(var(--color-accent-bg))] text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-grow flex flex-col overflow-y-auto">
        {(isRecsLoading || recommendedChampions.length > 0 || favoriteChampions.length > 0) && (
            <div className="p-4 border-b border-slate-700 bg-slate-900/50 space-y-4">
                {isRecsLoading && <div className="text-sm text-gray-400 animate-pulse">Loading suggestions...</div>}
                
                {recommendedChampions.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-yellow-300 mb-2 uppercase tracking-wider">Co-Pilot Recommendations</h3>
                        <div className="flex flex-wrap gap-4">
                            {recommendedChampions.map((rec) => (
                                <ChampionCard
                                    key={rec.champion.id}
                                    champion={rec.champion}
                                    onSelect={onSelect}
                                    reasoning={rec.reasoning}
                                    isActiveRole={activeRole ? rec.champion.roles.includes(activeRole) : false}
                                />
                            ))}
                        </div>
                    </div>
                )}
                
                {favoriteChampions.length > 0 && (
                     <div>
                        <h3 className="text-sm font-semibold text-pink-300 mb-2 uppercase tracking-wider">Your Favorites</h3>
                        <div className="flex flex-wrap gap-4">
                            {favoriteChampions.map((champ) => (
                                <ChampionCard
                                    key={champ.id}
                                    champion={champ}
                                    onSelect={onSelect}
                                    isFavorite
                                    isActiveRole={activeRole ? champ.roles.includes(activeRole) : false}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}

        <div className="flex-grow p-2">
            <AutoSizer>
                {({ height, width }) => {
                    const columnWidth = 95;
                    const rowHeight = 95;
                    const columnCount = Math.max(1, Math.floor(width / columnWidth));
                    const rowCount = Math.ceil(regularChampions.length / columnCount);
                    return (
                        <Grid
                            columnCount={columnCount}
                            rowCount={rowCount}
                            columnWidth={columnWidth}
                            rowHeight={rowHeight}
                            width={width}
                            height={height}
                            itemData={{
                                filteredChampions: regularChampions,
                                onSelect,
                                columnCount,
                                activeRole
                            }}
                        >
                            {Cell}
                        </Grid>
                    );
                }}
            </AutoSizer>
        </div>
      </div>
    </div>
  );
};