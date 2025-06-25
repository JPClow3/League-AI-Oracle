
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { DDragonChampionInfo, ChampionStaticInfo, ChampionGridProps } from '../types';
import { LOL_ROLES } from '../constants';
import { MemoizedChampionButton } from './MemoizedChampionButton'; 
import { useDebounce } from '../utils/textFormatting'; 

const ALL_ROLES_FILTER = "All";

export const ChampionGrid: React.FC<ChampionGridProps> = ({
  champions,
  ddragonVersion,
  championStaticData,
  disabledChampionIds = [],
  onDragStartChampion,
  getChampionStaticInfoById,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>(ALL_ROLES_FILTER);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});

  const debouncedSearchTerm = useDebounce(searchTerm, 300); 

  const championDetailsMap = useMemo(() => {
    const map = new Map<string, { primaryRole?: string; metaTier?: ChampionStaticInfo['metaTier'] }>();
    if (championStaticData) {
      championStaticData.forEach(staticInfo => {
        const key = staticInfo.ddragonKey || staticInfo.name;
        map.set(key, { primaryRole: staticInfo.primaryRole, metaTier: staticInfo.metaTier });
      });
    }
     champions.forEach(champ => {
        const staticInfo = getChampionStaticInfoById(champ.id);
        if (!map.has(champ.id)) {
            let inferredRole: string | undefined = staticInfo?.primaryRole;
            if (!inferredRole && champ.tags) {
                if (champ.tags.includes("Fighter") || champ.tags.includes("Tank")) inferredRole = "Top";
                else if (champ.tags.includes("Assassin")) inferredRole = "Mid";
                else if (champ.tags.includes("Marksman")) inferredRole = "ADC";
                else if (champ.tags.includes("Support")) inferredRole = "Support";
            }
            map.set(champ.id, { primaryRole: inferredRole, metaTier: staticInfo?.metaTier });
        } else {
            const existing = map.get(champ.id);
            map.set(champ.id, {
                primaryRole: existing?.primaryRole || staticInfo?.primaryRole,
                metaTier: existing?.metaTier || staticInfo?.metaTier
            });
        }
    });
    return map;
  }, [championStaticData, champions, getChampionStaticInfoById]);


  const filteredChampions = useMemo(() => {
    if (!champions) return [];
    let championsToFilter = champions;

    if (debouncedSearchTerm) { 
      championsToFilter = championsToFilter.filter(champion =>
        champion.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        champion.id.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    if (selectedRoleFilter !== ALL_ROLES_FILTER) {
      championsToFilter = championsToFilter.filter(champion => {
        const details = championDetailsMap.get(champion.id);
        return details?.primaryRole === selectedRoleFilter;
      });
    }
    return championsToFilter.sort((a, b) => a.name.localeCompare(b.name));
  }, [champions, debouncedSearchTerm, selectedRoleFilter, championDetailsMap]); 

  const handleImageLoad = useCallback((championId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [championId]: false }));
  }, []);
  const handleImageError = useCallback((championId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [championId]: false }));
  }, []);

   useEffect(() => {
    const initialLoadingState: Record<string, boolean> = {};
    filteredChampions.slice(0, 35).forEach(c => {
        if(imageLoadingStates[c.id] === undefined) {
            initialLoadingState[c.id] = true;
        }
    });
    if (Object.keys(initialLoadingState).length > 0) {
        setImageLoadingStates(prev => ({...prev, ...initialLoadingState}));
    }
  }, [filteredChampions]);


  const roleFilterButtons = [ALL_ROLES_FILTER, ...LOL_ROLES];

  return (
    <div className="p-3 sm:p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 h-full flex flex-col">
      <div className="mb-4 sticky top-0 bg-slate-800/80 backdrop-blur-sm py-2.5 z-10"> {/* Increased mb and py */}
        <input
          type="text"
          placeholder="Search champion..."
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full lol-input text-base sm:text-lg mb-4" /* Increased font size and mb */
          aria-label="Search for a champion"
        />
        <div className="flex flex-wrap gap-2 sm:gap-2.5 justify-center"> {/* Increased gap */}
          {roleFilterButtons.map(role => (
            <button
              key={role}
              onClick={() => setSelectedRoleFilter(role)}
              aria-pressed={selectedRoleFilter === role}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 text-sm sm:text-base rounded-lg font-medium transition-all duration-150 border-2
                ${selectedRoleFilter === role
                  ? 'bg-sky-600 border-sky-500 text-white shadow-sm'
                  : 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500 text-slate-300'
                }`} /* Increased padding, font size and radius */
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {!champions || champions.length === 0 ? (
        <div className="flex-grow flex items-center justify-center">
          {/* <LoadingSpinner /> Replaced by check in MemoizedChampionButton */}
        </div>
      ) : (
        <>
          {filteredChampions.length === 0 && (
            <p className="text-center text-slate-400 py-8 text-base"> {/* Increased font size */}
              No champions found for "{debouncedSearchTerm}" {/* Use debounced for display */}
              {selectedRoleFilter !== ALL_ROLES_FILTER ? ` in ${selectedRoleFilter} role.` : '.'}
            </p>
          )}
          <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-9 gap-2.5 sm:gap-3 overflow-y-auto flex-grow pr-1.5"> {/* Adjusted grid columns and gap, pr */}
            {filteredChampions.map(champion => {
              const isDisabled = disabledChampionIds.includes(champion.id);
              const details = championDetailsMap.get(champion.id);
              return (
                <MemoizedChampionButton
                  key={champion.id}
                  champion={champion}
                  ddragonVersion={ddragonVersion}
                  isDisabled={isDisabled}
                  isImageLoading={imageLoadingStates[champion.id]}
                  details={details}
                  onDragStart={onDragStartChampion}
                  onImageLoad={handleImageLoad}
                  onImageError={handleImageError}
                  className="min-h-[70px] sm:min-h-[80px]" /* Ensure min size */
                  textClassName="text-[10px] sm:text-[11px]"
                  // No onSelect prop for this grid, it's drag-only
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};