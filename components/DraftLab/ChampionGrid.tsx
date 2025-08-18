
import React, { useState, useEffect, useMemo } from 'react';
import type { ChampionLite, ChampionSuggestion, DraftState } from '../../types';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useSettings } from '../../hooks/useSettings';
import { CHAMPIONS_LITE, ROLES } from '../../constants';
import { getAvailableChampions } from '../../lib/draftUtils';
import { Tooltip } from '../common/Tooltip';

type EnrichedChampionSuggestion = ChampionSuggestion & { champion: ChampionLite };
type IntelData = { sTier: string[], buffs: string[], nerfs: string[] } | null;

interface ChampionGridProps {
  draftState: DraftState;
  onSelect: (champion: ChampionLite) => void;
  onQuickLook: (champion: ChampionLite) => void;
  recommendations: EnrichedChampionSuggestion[];
  isRecsLoading: boolean;
  activeRole: string | null;
  intelData: IntelData;
}

const IntelIcons: React.FC<{ championName: string, intelData: IntelData }> = ({ championName, intelData }) => {
    if (!intelData) return null;

    const isSTier = intelData.sTier.includes(championName);
    const isBuffed = intelData.buffs.includes(championName);
    const isNerfed = intelData.nerfs.includes(championName);

    if (!isSTier && !isBuffed && !isNerfed) return null;

    return (
        <div className="absolute top-0 right-0 -mt-1 -mr-1 flex flex-col gap-1 z-10">
            {isSTier && <Tooltip content="S-Tier Champion"><div className="w-4 h-4 bg-yellow-400 text-black text-xs font-bold rounded-full flex items-center justify-center">S</div></Tooltip>}
            {isBuffed && <Tooltip content="Recently Buffed"><div className="w-4 h-4 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">↑</div></Tooltip>}
            {isNerfed && <Tooltip content="Recently Nerfed"><div className="w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">↓</div></Tooltip>}
        </div>
    );
};

const ChampionCard: React.FC<{
    champion: ChampionLite;
    onSelect: (champion: ChampionLite) => void;
    onContextMenu: (e: React.MouseEvent, champion: ChampionLite) => void;
    intelData: IntelData;
    reasoning?: string;
    isFavorite?: boolean;
    isActiveRole?: boolean;
}> = ({ champion, onSelect, onContextMenu, intelData, reasoning, isFavorite = false, isActiveRole = false }) => {
    const borderColor = reasoning ? 'border-yellow-500/30 hover:border-yellow-400/80' : 
                          isFavorite ? 'border-pink-500/30 hover:border-pink-400/80' : 
                          isActiveRole ? 'border-green-500/30 hover:border-green-400/80' :
                          'border-transparent';
    const textColor = reasoning ? 'text-yellow-300' : isFavorite ? 'text-pink-300' : isActiveRole ? 'text-green-300' : 'text-gray-300';
    
    return (
        <div
          className={`flex flex-col items-center text-center cursor-pointer group p-2 bg-slate-900/50 rounded-lg hover:bg-slate-700/50 transition-all duration-200 w-36 border ${borderColor}`}
          onClick={() => onSelect(champion)}
          onContextMenu={(e) => onContextMenu(e, champion)}
        >
          <div className="relative">
             <IntelIcons championName={champion.name} intelData={intelData} />
             <img
                src={champion.image}
                alt={champion.name}
                loading="lazy"
                width="64"
                height="64"
                className="w-16 h-16 rounded-lg border-2 border-slate-600 group-hover:border-yellow-400 transition-all duration-200 transform group-hover:scale-110"
             />
          </div>
          <span className={`font-bold text-sm ${textColor} mt-1`}>{champion.name}</span>
          {reasoning && <p className="text-xs text-gray-300 mt-1">{reasoning}</p>}
        </div>
    );
};

const ChampionIcon: React.FC<{ champion: ChampionLite; onSelect: (champion: ChampionLite) => void; onContextMenu: (e: React.MouseEvent, champion: ChampionLite) => void; intelData: IntelData; isActiveRole?: boolean; }> = React.memo(({ champion, onSelect, onContextMenu, intelData, isActiveRole }) => {
  return (
    <div
      className="flex flex-col items-center text-center cursor-pointer group"
      onClick={() => onSelect(champion)}
      onContextMenu={(e) => onContextMenu(e, champion)}
    >
      <div className="relative">
        <IntelIcons championName={champion.name} intelData={intelData} />
        <img
            src={champion.image}
            alt={champion.name}
            loading="lazy"
            width="64"
            height="64"
            className={`w-16 h-16 rounded-lg border-2 ${isActiveRole ? 'border-green-400' : 'border-slate-600'} group-hover:border-yellow-400 transition-all duration-200 transform group-hover:scale-110`}
        />
      </div>
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
    onContextMenu: (e: React.MouseEvent, champion: ChampionLite) => void;
    columnCount: number;
    activeRole: string | null;
    intelData: IntelData;
  };
}) => {
  const { filteredChampions, onSelect, onContextMenu, columnCount, activeRole, intelData } = data;
  const index = rowIndex * columnCount + columnIndex;
  if (index >= filteredChampions.length) {
    return null;
  }
  const champion = filteredChampions[index];
  const isActiveRole = activeRole ? champion.roles.includes(activeRole) : false;
  return (
    <div style={style} className="flex items-center justify-center">
      <ChampionIcon champion={champion} onSelect={onSelect} onContextMenu={onContextMenu} isActiveRole={isActiveRole} intelData={intelData} />
    </div>
  );
};

export const ChampionGrid: React.FC<ChampionGridProps> = ({ draftState, onSelect, onQuickLook, recommendations, isRecsLoading, activeRole, intelData }) => {
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState(settings.primaryRole || 'All');

  const availableChampions = useMemo(() => getAvailableChampions(draftState), [draftState]);

  useEffect(() => {
    const timerId = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
        clearTimeout(timerId);
    };
  }, [searchTerm]);

  const handleContextMenu = (e: React.MouseEvent, champion: ChampionLite) => {
    e.preventDefault();
    onQuickLook(champion);
  };

  const recommendedChampions = useMemo(() => recommendations, [recommendations]);
  
  const favoriteChampions = useMemo(() => {
      const favIds = new Set(settings.favoriteChampions);
      return availableChampions.filter(c => favIds.has(c.id));
  }, [settings.favoriteChampions, availableChampions]);

  const regularChampions = useMemo(() => {
      const recIds = new Set(recommendedChampions.map(r => r.champion.id));
      const favIds = new Set(settings.favoriteChampions);

      return availableChampions
        .filter(c => !recIds.has(c.id) && !favIds.has(c.id))
        .filter(c => c.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
        .filter(c => roleFilter === 'All' || c.roles.includes(roleFilter))
        .sort((a, b) => {
            if (activeRole) {
                const aHasRole = a.roles.includes(activeRole);
                const bHasRole = b.roles.includes(activeRole);
                if (aHasRole && !bHasRole) return -1;
                if (!aHasRole && bHasRole) return 1;
            }
            return a.name.localeCompare(b.name);
        });
  }, [availableChampions, recommendedChampions, settings.favoriteChampions, debouncedSearchTerm, roleFilter, activeRole]);

  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-lg overflow-hidden">
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-slate-800/50 z-10 border-b border-slate-700">
        <input
          type="text"
          placeholder="Search champion... (Right-click for quick look)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 bg-slate-900 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        />
         <div className="flex flex-wrap items-center gap-2">
          {['All', ...ROLES].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200 ${
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
                {isRecsLoading && <div className="text-sm text-gray-300 animate-pulse">Loading suggestions...</div>}
                
                {recommendedChampions.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-yellow-300 mb-2 uppercase tracking-wider">Co-Pilot Recommendations</h3>
                        <div className="flex flex-wrap gap-4">
                            {recommendedChampions.map((rec) => (
                                <ChampionCard
                                    key={rec.champion.id}
                                    champion={rec.champion}
                                    onSelect={onSelect}
                                    onContextMenu={handleContextMenu}
                                    reasoning={rec.reasoning}
                                    isActiveRole={activeRole ? rec.champion.roles.includes(activeRole) : false}
                                    intelData={intelData}
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
                                    onContextMenu={handleContextMenu}
                                    isFavorite
                                    isActiveRole={activeRole ? champ.roles.includes(activeRole) : false}
                                    intelData={intelData}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}

        <div className="flex-grow p-2">
            {regularChampions.length > 0 ? (
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
                                    onContextMenu: handleContextMenu,
                                    columnCount,
                                    activeRole,
                                    intelData
                                }}
                            >
                                {Cell}
                            </Grid>
                        );
                    }}
                </AutoSizer>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                    <p>No available champions match your search.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
