
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { DDragonChampionInfo, ChampionStaticInfo, ChampionGridModalProps } from '../types';
import { Modal } from './Modal';
import { LOL_ROLES } from '../constants';
import { MemoizedChampionButton } from './MemoizedChampionButton'; 
import { useDebounce } from '../utils/textFormatting'; 

const ALL_ROLES_FILTER = "All";

export const ChampionGridModal: React.FC<ChampionGridModalProps> = ({
  isOpen,
  onClose,
  champions,
  ddragonVersion,
  onChampionSelect,
  disabledChampionIds: propDisabledChampionIds = [],
  modalTitle = "Select Champion",
  championStaticData,
  explorerMode = false,
  explorerSelectedChampionIds = [],
  filterAvailableChampions, 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>(ALL_ROLES_FILTER);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300); 

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedRoleFilter(ALL_ROLES_FILTER);
      setImageLoadingStates({}); 
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const championDetailsMap = useMemo(() => {
    const map = new Map<string, { primaryRole?: string; metaTier?: ChampionStaticInfo['metaTier'] }>();
    if (championStaticData) {
      championStaticData.forEach(staticInfo => {
        const key = staticInfo.ddragonKey || staticInfo.name;
        map.set(key, { primaryRole: staticInfo.primaryRole, metaTier: staticInfo.metaTier });
      });
    }
    champions.forEach(champ => {
        if (!map.has(champ.id)) {
            let inferredRole: string | undefined = undefined;
            if (champ.tags) {
                if (champ.tags.includes("Fighter") || champ.tags.includes("Tank")) inferredRole = "Top";
                else if (champ.tags.includes("Assassin")) inferredRole = "Mid";
                else if (champ.tags.includes("Marksman")) inferredRole = "ADC";
                else if (champ.tags.includes("Support")) inferredRole = "Support";
            }
            map.set(champ.id, { primaryRole: inferredRole, metaTier: undefined });
        } else if (!map.get(champ.id)?.primaryRole && champ.tags) {
            let inferredRole: string | undefined = undefined;
            if (champ.tags.includes("Fighter") || champ.tags.includes("Tank")) inferredRole = "Top";
            else if (champ.tags.includes("Assassin")) inferredRole = "Mid";
            else if (champ.tags.includes("Marksman")) inferredRole = "ADC";
            else if (champ.tags.includes("Support")) inferredRole = "Support";
            map.set(champ.id, { ...map.get(champ.id), primaryRole: inferredRole });
        }
    });
    return map;
  }, [championStaticData, champions]);

  const finalDisabledChampionIds = useMemo(() => {
    return explorerMode ? explorerSelectedChampionIds : propDisabledChampionIds;
  }, [explorerMode, explorerSelectedChampionIds, propDisabledChampionIds]);

  const filteredChampions = useMemo(() => {
    if (!champions) return [];
    let championsToFilter = champions;

    if (filterAvailableChampions && filterAvailableChampions.length > 0) {
      const availableSet = new Set(filterAvailableChampions.map(nameOrId => nameOrId.toLowerCase()));
      championsToFilter = championsToFilter.filter(champion => 
        availableSet.has(champion.name.toLowerCase()) || availableSet.has(champion.id.toLowerCase())
      );
    }

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
  }, [champions, debouncedSearchTerm, selectedRoleFilter, championDetailsMap, filterAvailableChampions]); 

  const handleImageLoad = useCallback((championId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [championId]: false }));
  }, []);
  const handleImageError = useCallback((championId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [championId]: false }));
  }, []);

  useEffect(() => {
    const initialLoadingState: Record<string, boolean> = {};
    filteredChampions.slice(0, 28).forEach(c => { 
        if(imageLoadingStates[c.id] === undefined) {
            initialLoadingState[c.id] = true;
        }
    });
    if (Object.keys(initialLoadingState).length > 0) {
        setImageLoadingStates(prev => ({...prev, ...initialLoadingState}));
    }
  }, [filteredChampions]);


  if (!isOpen) return null;

  const roleFilterButtons = [ALL_ROLES_FILTER, ...LOL_ROLES];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="xl"
      modalId="champion-grid-modal"
      titleId="champion-grid-modal-title"
    >
      <div className="p-3 sm:p-4">
        <div className="mb-4"> {/* Increased mb */}
          <input
            ref={searchInputRef}
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
                  }`} /* Increased padding, font size, and radius */
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {!champions || champions.length === 0 ? (
            <div className="flex items-center justify-center py-6">
            </div>
        ) : (
        <>
          {filteredChampions.length === 0 && (
            <p className="text-center text-slate-400 py-8 text-base"> {/* Increased font size */}
              No champions found for "{debouncedSearchTerm}" {/* Use debounced for display */}
              {selectedRoleFilter !== ALL_ROLES_FILTER ? ` in ${selectedRoleFilter} role.` : '.'}
              {filterAvailableChampions ? ' within the available trial selection.' : ''}
            </p>
          )}
          <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2.5 sm:gap-3.5"> {/* Adjusted grid columns and gap */}
            {filteredChampions.map(champion => {
              const isDisabled = finalDisabledChampionIds.includes(champion.id);
              const details = championDetailsMap.get(champion.id);
              return (
                <MemoizedChampionButton
                  key={champion.id}
                  champion={champion}
                  ddragonVersion={ddragonVersion}
                  isDisabled={isDisabled}
                  isImageLoading={imageLoadingStates[champion.id]}
                  details={details}
                  onSelect={onChampionSelect}
                  onImageLoad={handleImageLoad}
                  onImageError={handleImageError}
                  className="min-h-[80px] sm:min-h-[90px]" /* Ensure minimum size for buttons */
                  imageClassName="rounded-lg" /* Apply rounding to image if needed */
                  textClassName="text-[10px] sm:text-[11px]" /* Consistent with other MemoizedChampionButton usage */
                />
              );
            })}
          </div>
        </>
        )}
      </div>
    </Modal>
  );
};