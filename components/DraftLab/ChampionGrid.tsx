

import React, { useState, useEffect, useMemo } from 'react';
import type { ChampionLite, ChampionSuggestion, DraftState } from '../../types';
// FIX: The `FixedSizeGrid` member could not be found in the `react-window` module.
// This is often due to a module resolution issue. Using a namespace import is a common workaround.
import * as ReactWindow from 'react-window';
const Grid = (ReactWindow as any).FixedSizeGrid;
import AutoSizer from 'react-virtualized-auto-sizer';
import { useSettings } from '../../hooks/useSettings';
import { ROLES, DAMAGE_TYPES } from '../../constants';
import { getAvailableChampions } from '../../lib/draftUtils';
import { Tooltip } from '../common/Tooltip';
import { Star } from 'lucide-react';
import { useChampions } from '../../contexts/ChampionContext';

type EnrichedChampionSuggestion = ChampionSuggestion & { champion: ChampionLite };
type IntelData = { sTier: string[], buffs: string[], nerfs: string[] } | null;

interface ChampionGridProps {
  draftState: DraftState;
  onSelect: (champion: ChampionLite) => void;
  onQuickLook: (champion: ChampionLite) => void;
  onDragStart: (e: React.DragEvent, championId: string) => void;
  recommendations: EnrichedChampionSuggestion[];
  isRecsLoading: boolean;
  activeRole: string | null;
  intelData: IntelData;
}

const IntelIcons = ({ championName, intelData }: { championName: string, intelData: IntelData }) => {
    if (!intelData) return null;

    const isSTier = intelData.sTier.includes(championName);
    const isBuffed = intelData.buffs.includes(championName);
    const isNerfed = intelData.nerfs.includes(championName);

    if (!isSTier && !isBuffed && !isNerfed) return null;

    return (
        <div className="absolute top-0 right-0 -mt-1 -mr-1 flex flex-col gap-1 z-10">
            {isSTier && <Tooltip content="S-Tier Champion"><div className="w-4 h-4 bg-yellow-400 text-black text-xs font-bold flex items-center justify-center">S</div></Tooltip>}
            {isBuffed && <Tooltip content="Recently Buffed"><div className="w-4 h-4 bg-green-500 text-white text-xs font-bold flex items-center justify-center">↑</div></Tooltip>}
            {isNerfed && <Tooltip content="Recently Nerfed"><div className="w-4 h-4 bg-red-500 text-white text-xs font-bold flex items-center justify-center">↓</div></Tooltip>}
        </div>
    );
};

const ChampionCard = React.memo(({ champion, onSelect, onContextMenu, onDragStart, intelData, reasoning, isFavorite = false, isActiveRole = false }: {
    champion: ChampionLite;
    onSelect: (champion: ChampionLite) => void;
    onContextMenu: (e: React.MouseEvent, champion: ChampionLite) => void;
    onDragStart: (e: React.DragEvent, championId: string) => void;
    intelData: IntelData;
    reasoning?: string;
    isFavorite?: boolean;
    isActiveRole?: boolean;
}) => {
    const glowClass = reasoning ? 'shadow-glow-accent' : 
                      isFavorite ? 'shadow-glow-info' : 
                      '';
    const borderColor = reasoning ? 'border-gold/80 hover:border-gold' : 
                          isFavorite ? 'border-info/80 hover:border-info' : 
                          isActiveRole ? 'border-success/80 hover:border-success' :
                          'border-border-primary hover:border-accent';
    const textColor = 'text-text-secondary';
    
    const cardContent = (
        <button
          type="button"
          aria-label={champion.name}
          className={`flex flex-col items-center text-center cursor-pointer group p-2 bg-surface-secondary transition-all duration-200 w-24 border ${borderColor} transform hover:-translate-y-1 ${glowClass}`}
          onClick={() => onSelect(champion)}
          onContextMenu={(e) => onContextMenu(e, champion)}
          draggable="true"
          onDragStart={(e) => onDragStart(e, champion.id)}
        >
          <div className="relative">
             <IntelIcons championName={champion.name} intelData={intelData} />
             {isFavorite && (
                <div className="absolute -top-1 -left-1 text-info z-10">
                    <Star className="h-4 w-4" fill="currentColor" />
                </div>
             )}
             <img
                src={champion.image}
                alt={champion.name}
                loading="lazy"
                width="64"
                height="64"
                className="w-16 h-16 border-2 border-border-primary group-hover:border-accent transition-all duration-200 transform group-hover:scale-110"
             />
          </div>
          <span className={`font-semibold text-xs ${textColor} mt-1 truncate w-full group-hover:text-accent`}>{champion.name}</span>
        </button>
    );

    if (reasoning) {
        return <Tooltip content={reasoning}>{cardContent}</Tooltip>;
    }

    return cardContent;
});


const Cell = ({ columnIndex, rowIndex, style, data }: {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    filteredChampions: ChampionLite[];
    onSelect: (champion: ChampionLite) => void;
    onContextMenu: (e: React.MouseEvent, champion: ChampionLite) => void;
    onDragStart: (e: React.DragEvent, championId: string) => void;
    columnCount: number;
    activeRole: string | null;
    intelData: IntelData;
    favoriteIds: Set<string>;
  };
}) => {
  const { filteredChampions, onSelect, onContextMenu, onDragStart, columnCount, activeRole, intelData, favoriteIds } = data;
  const index = rowIndex * columnCount + columnIndex;
  if (index >= filteredChampions.length) {
    return null;
  }
  const champion = filteredChampions[index];
  const isActiveRole = activeRole ? champion.roles.includes(activeRole) : false;
  const isFavorite = favoriteIds.has(champion.id);

  return (
    <div style={style} className="flex items-center justify-center">
      <ChampionCard 
        champion={champion} 
        onSelect={onSelect} 
        onContextMenu={onContextMenu} 
        onDragStart={onDragStart}
        isActiveRole={isActiveRole}
        isFavorite={isFavorite}
        intelData={intelData} 
      />
    </div>
  );
};

export const ChampionGrid = ({ draftState, onSelect, onQuickLook, onDragStart, recommendations, isRecsLoading, activeRole, intelData }: ChampionGridProps) => {
  const { settings } = useSettings();
  const { championsLite } = useChampions();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState(settings.primaryRole || 'All');
  const [damageTypeFilter, setDamageTypeFilter] = useState('All');

  const availableChampions = useMemo(() => getAvailableChampions(draftState, championsLite), [draftState, championsLite]);
  const availableChampionIds = useMemo(() => new Set(availableChampions.map(c => c.id)), [availableChampions]);

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
  const favoriteIds = useMemo(() => new Set(settings.favoriteChampions), [settings.favoriteChampions]);
  
  const favoriteChampions = useMemo(() => {
      return availableChampions.filter(c => favoriteIds.has(c.id));
  }, [favoriteIds, availableChampions]);

  const regularChampions = useMemo(() => {
      const recIds = new Set(recommendedChampions.map(r => r.champion.id));
      
      return championsLite
        .filter(c => availableChampionIds.has(c.id))
        .filter(c => !recIds.has(c.id) && !favoriteIds.has(c.id))
        .filter(c => c.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
        .filter(c => roleFilter === 'All' || c.roles.includes(roleFilter))
        .filter(c => damageTypeFilter === 'All' || c.damageType === damageTypeFilter)
        .sort((a, b) => {
            if (activeRole) {
                const aHasRole = a.roles.includes(activeRole);
                const bHasRole = b.roles.includes(activeRole);
                if (aHasRole && !bHasRole) return -1;
                if (!aHasRole && bHasRole) return 1;
            }
            return a.name.localeCompare(b.name);
        });
  }, [championsLite, availableChampionIds, recommendedChampions, favoriteIds, debouncedSearchTerm, roleFilter, damageTypeFilter, activeRole]);

  return (
    <div className="flex flex-col h-full bg-surface-primary overflow-hidden">
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-surface-primary/50 z-10 border-b border-border-primary">
        <input
          type="text"
          placeholder="Search champion... (Right-click for quick look)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 bg-surface-inset border border-border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-opacity-75"
        />
         <div className="flex-grow flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap items-center gap-1 bg-surface-tertiary p-1">
              <span className="text-xs font-semibold text-text-muted px-2 hidden sm:inline">Role</span>
              {['All', ...ROLES].map(role => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-3 py-1 text-sm font-semibold transition-colors duration-200 ${
                    roleFilter === role ? 'bg-accent text-on-accent' : 'bg-transparent text-text-secondary hover:bg-surface-secondary'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1 bg-surface-tertiary p-1">
                <span className="text-xs font-semibold text-text-muted px-2 hidden sm:inline">Damage</span>
                {DAMAGE_TYPES.map(damageType => (
                    <button
                        key={damageType}
                        onClick={() => setDamageTypeFilter(damageType)}
                        className={`px-3 py-1 text-sm font-semibold transition-colors duration-200 ${
                            damageTypeFilter === damageType ? 'bg-accent text-on-accent' : 'bg-transparent text-text-secondary hover:bg-surface-secondary'
                        }`}
                    >
                        {damageType}
                    </button>
                ))}
            </div>
        </div>
      </div>
      
      <div className="flex-grow flex flex-col overflow-y-auto">
        {(isRecsLoading || recommendedChampions.length > 0 || favoriteChampions.length > 0) && (
            <div className="p-4 border-b border-border-primary bg-surface-secondary space-y-4">
                {isRecsLoading && <div className="text-sm text-text-secondary animate-pulse">Loading suggestions...</div>}
                
                {recommendedChampions.length > 0 && (
                    <div className="p-4 bg-accent/5 border border-accent/10">
                        <h3 className="text-sm font-semibold text-gold mb-2 uppercase tracking-wider">Co-Pilot Recommendations</h3>
                        <div className="flex flex-wrap gap-2">
                            {recommendedChampions.map((rec) => (
                                <ChampionCard
                                    key={rec.champion.id}
                                    champion={rec.champion}
                                    onSelect={onSelect}
                                    onContextMenu={handleContextMenu}
                                    onDragStart={onDragStart}
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
                        <h3 className="text-sm font-semibold text-info mb-2 uppercase tracking-wider">Your Favorites</h3>
                        <div className="flex flex-wrap gap-2">
                            {favoriteChampions.map((champ) => (
                                <ChampionCard
                                    key={champ.id}
                                    champion={champ}
                                    onSelect={onSelect}
                                    onContextMenu={handleContextMenu}
                                    onDragStart={onDragStart}
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
                        const columnWidth = 105;
                        const rowHeight = 115;
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
                                    onDragStart,
                                    columnCount,
                                    activeRole,
                                    intelData,
                                    favoriteIds,
                                }}
                            >
                                {Cell}
                            </Grid>
                        );
                    }}
                </AutoSizer>
            ) : (
                <div className="flex items-center justify-center h-full text-text-secondary">
                    <p>No available champions match your search.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};