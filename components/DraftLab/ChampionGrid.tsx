import React, { useState, useMemo, useCallback, memo, useRef, useEffect } from 'react';
import type { Champion, ChampionLite, DraftState } from '../../types';
import { useChampions } from '../../contexts/ChampionContext';
import { useSettings } from '../../hooks/useSettings';
import { getAvailableChampions } from '../../lib/draftUtils';
import { ROLES, DAMAGE_TYPES } from '../../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, GripVertical, Star, Sparkles } from 'lucide-react';
import { Tooltip } from '../common/Tooltip';
import { FilterChips, type FilterChip } from './FilterChips';
import { ChampionQuickPick } from './ChampionQuickPick';
import { SearchAutocomplete } from './SearchAutocomplete';
import { useChampionHistory } from '../../hooks/useChampionHistory';
import { useSearchHistory } from '../../hooks/useSearchHistory';
import { getMetaChampions } from '../../lib/metaChampions';
import { SkeletonGrid } from '../common/Skeleton';

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

const FilterButton = memo(({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
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
));
FilterButton.displayName = 'FilterButton';

export const ChampionGrid = memo(({ onSelect, onQuickLook, draftState, onDragStart }: ChampionGridProps) => {
  const { champions, championsLite, isLoading } = useChampions();
  const { settings, setSettings } = useSettings();
  const { addToHistory } = useChampionHistory();
  const { searchHistory, addToHistory: addSearchToHistory, clearHistory: clearSearchHistory } = useSearchHistory();
  const [searchTerm, setSearchTerm] = useState('');

  // Load filter preferences from settings (lazy initialization for initial state)
  const [roleFilter, setRoleFilter] = useState(() => settings.filterPreferences?.roleFilter || 'All');
  const [damageFilter, setDamageFilter] = useState(() => settings.filterPreferences?.damageFilter || 'All');

  const [quickPickMode, setQuickPickMode] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const championRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const hasInitializedFromSettingsRef = useRef(false);
  const lastSavedPreferencesRef = useRef<string>('');

  // Sync filter preferences from settings when they load (handles async loading)
  // Only syncs once on initial load or when settings change externally (e.g., cross-tab sync)
  useEffect(() => {
    const currentPreferences = settings.filterPreferences || {};
    const currentPreferencesKey = JSON.stringify({
      roleFilter: currentPreferences.roleFilter || 'All',
      damageFilter: currentPreferences.damageFilter || 'All',
    });

    // Skip if this matches what we last saved (to avoid syncing our own changes back)
    if (currentPreferencesKey === lastSavedPreferencesRef.current) {
      return;
    }

    // Only sync on initial load or external changes (not after user changes)
    if (!hasInitializedFromSettingsRef.current) {
      hasInitializedFromSettingsRef.current = true;

      // Use requestAnimationFrame to defer state updates and avoid cascading renders
      requestAnimationFrame(() => {
        const rolePref = currentPreferences.roleFilter;
        const damagePref = currentPreferences.damageFilter;

        if (rolePref && rolePref !== roleFilter) {
          setRoleFilter(rolePref);
        }
        if (damagePref && damagePref !== damageFilter) {
          setDamageFilter(damagePref);
        }
      });
    }
  }, [settings.filterPreferences, roleFilter, damageFilter]);

  // Save filter preferences when they change (user-initiated changes)
  useEffect(() => {
    // Only save if we've initialized from settings (to avoid saving during initial sync)
    if (!hasInitializedFromSettingsRef.current) {
      return;
    }

    const newPreferences = {
      roleFilter: roleFilter !== 'All' ? roleFilter : undefined,
      damageFilter: damageFilter !== 'All' ? damageFilter : undefined,
    };

    // Track what we're saving to avoid syncing it back
    lastSavedPreferencesRef.current = JSON.stringify({
      roleFilter: roleFilter,
      damageFilter: damageFilter,
    });

    setSettings({
      filterPreferences: newPreferences,
    });
  }, [roleFilter, damageFilter, setSettings]);

  // Keyboard shortcut: Ctrl+K or Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const availableChampions = useMemo(
    () => getAvailableChampions(draftState, championsLite),
    [draftState, championsLite]
  );

  const recentChampions = useMemo(() => {
    return settings.recentChampions
      .map(id => availableChampions.find(c => c.id === id))
      .filter((c): c is ChampionLite => c !== undefined)
      .slice(0, 8); // Show up to 8 recent champions
  }, [settings.recentChampions, availableChampions]);

  const favoriteChampions = useMemo(() => {
    return settings.favoriteChampions
      .map(id => availableChampions.find(c => c.id === id))
      .filter((c): c is ChampionLite => c !== undefined);
  }, [settings.favoriteChampions, availableChampions]);

  // Smart suggestions based on team composition
  const smartSuggestions = useMemo(() => {
    const bluePicks = draftState.blue.picks
      .filter((p): p is { champion: ChampionLite } => !!p.champion)
      .map(p => p.champion);
    const redPicks = draftState.red.picks
      .filter((p): p is { champion: ChampionLite } => !!p.champion)
      .map(p => p.champion);
    const allPicked = [...bluePicks, ...redPicks];

    if (allPicked.length === 0) {
      return [];
    }

    // Analyze team composition
    const damageTypes = allPicked.map(c => c.damageType);
    const adCount = damageTypes.filter(t => t === 'AD' || t === 'Mixed').length;
    const apCount = damageTypes.filter(t => t === 'AP' || t === 'Mixed').length;

    // Suggest champions that complement or counter the composition
    return availableChampions
      .filter(champ => {
        // Suggest champions that balance damage type
        if (adCount > apCount && champ.damageType === 'AP') {
          return true;
        }
        if (apCount > adCount && champ.damageType === 'AD') {
          return true;
        }
        // Suggest meta champions
        return getMetaChampions([champ]).length > 0;
      })
      .slice(0, 6);
  }, [draftState, availableChampions]);

  // Filter chips for active filters
  const filterChips = useMemo<FilterChip[]>(() => {
    const chips: FilterChip[] = [];
    if (roleFilter !== 'All') {
      chips.push({
        label: roleFilter,
        value: roleFilter,
        onRemove: () => setRoleFilter('All'),
      });
    }
    if (damageFilter !== 'All') {
      chips.push({
        label: damageFilter,
        value: damageFilter,
        onRemove: () => setDamageFilter('All'),
      });
    }
    return chips;
  }, [roleFilter, damageFilter]);

  const filteredAndSortedChampions = useMemo(() => {
    let filtered = quickPickMode ? getMetaChampions(availableChampions) : availableChampions;

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
      if (isAFavorite && !isBFavorite) {
        return -1;
      }
      if (!isAFavorite && isBFavorite) {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [availableChampions, searchTerm, roleFilter, damageFilter, settings.favoriteChampions, quickPickMode]);

  const handleRoleFilterClick = useCallback((role: string) => {
    setRoleFilter(role);
  }, []);

  const handleDamageFilterClick = useCallback((type: string) => {
    setDamageFilter(type);
  }, []);

  const handleChampionClick = useCallback(
    (champ: ChampionLite) => {
      // Track recent champion usage
      addToHistory(champ.id);
      // Add to search history if searching
      if (searchTerm.trim()) {
        addSearchToHistory(searchTerm);
      }
      onSelect(champ);
    },
    [onSelect, addToHistory, addSearchToHistory, searchTerm]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleSelectFromHistory = useCallback((term: string) => {
    setSearchTerm(term);
    searchInputRef.current?.focus();
  }, []);

  // Keyboard shortcuts for filters
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl+1-9 for role filters
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        const roles = ['All', ...ROLES];
        if (roles[index]) {
          e.preventDefault();
          setRoleFilter(roles[index]);
        }
      }

      // Ctrl+Shift+A/D/M for damage type filters
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        if (e.key === 'A' || e.key === 'a') {
          e.preventDefault();
          setDamageFilter('All');
        } else if (e.key === 'D' || e.key === 'd') {
          e.preventDefault();
          setDamageFilter('AD');
        } else if (e.key === 'M' || e.key === 'm') {
          e.preventDefault();
          setDamageFilter('Mixed');
        } else if (e.key === 'P' || e.key === 'p') {
          e.preventDefault();
          setDamageFilter('AP');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sticky search bar detection
  useEffect(() => {
    const handleScroll = () => {
      if (searchBarRef.current) {
        const rect = searchBarRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 0);
      }
    };

    const container = searchBarRef.current?.closest('.flex-grow');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleQuickLook = useCallback(
    (champ: ChampionLite, e: React.MouseEvent) => {
      e.preventDefault();
      onQuickLook(champ);
    },
    [onQuickLook]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, champ: ChampionLite) => {
      const fullChamp = champions.find(c => c.id === champ.id);
      if (fullChamp) {
        onDragStart(e, fullChamp);
      } else {
        e.preventDefault();
      }
    },
    [champions, onDragStart]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      const cols = Math.floor((document.querySelector('.grid')?.clientWidth || 0) / 80) || 1;
      const total = filteredAndSortedChampions.length;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex(prev => (prev !== null ? Math.min(prev + 1, total - 1) : 0));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex(prev => (prev !== null ? Math.max(prev - 1, 0) : 0));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => (prev !== null ? Math.min(prev + cols, total - 1) : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => (prev !== null ? Math.max(prev - cols, 0) : 0));
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          handleChampionClick(filteredAndSortedChampions[index]);
          break;
        case 'Escape':
          setFocusedIndex(null);
          break;
      }
    },
    [filteredAndSortedChampions, handleChampionClick]
  );

  // Focus the champion when focusedIndex changes
  useEffect(() => {
    if (focusedIndex !== null && championRefs.current[focusedIndex]) {
      championRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  // Reset focus when filters change
  // Use a key-based approach to reset focus without setState in effect
  const filterKey = `${searchTerm}-${roleFilter}-${damageFilter}-${filteredAndSortedChampions.length}`;
  const prevFilterKeyRef = useRef(filterKey);

  // Reset focus state when filter key changes using a ref-based approach
  useEffect(() => {
    // Only reset if filter key actually changed
    if (prevFilterKeyRef.current !== filterKey) {
      prevFilterKeyRef.current = filterKey;
      // Use requestAnimationFrame to defer state update and avoid cascading renders
      // This is a legitimate use case: resetting UI state when filters change

      requestAnimationFrame(() => {
        setFocusedIndex(null);
      });
      championRefs.current = [];
    }
  }, [filterKey]);

  const toggleFavorite = useCallback(
    (championId: string) => {
      setSettings({
        favoriteChampions: settings.favoriteChampions.includes(championId)
          ? settings.favoriteChampions.filter(id => id !== championId)
          : [...settings.favoriteChampions, championId],
      });
    },
    [settings.favoriteChampions, setSettings]
  );

  return (
    <div className="bg-surface p-4 flex flex-col h-full border border-border-primary">
      {/* Quick Pick Mode Toggle */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={quickPickMode}
            onChange={e => setQuickPickMode(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`relative w-11 h-6 rounded-full transition-colors ${quickPickMode ? 'bg-accent' : 'bg-surface-secondary'}`}
          >
            <div
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${quickPickMode ? 'translate-x-5' : ''}`}
            />
          </div>
          <span className="text-sm font-medium text-text-primary flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            Quick Pick Mode
          </span>
        </label>
      </div>

      {/* Sticky Search Bar with Autocomplete */}
      <div
        ref={searchBarRef}
        className={`relative mb-2 flex-shrink-0 transition-all ${isSticky ? 'sticky top-0 z-10 bg-surface backdrop-blur-sm pb-2' : ''}`}
      >
        <div id="search">
          <SearchAutocomplete
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            champions={availableChampions}
            searchHistory={searchHistory}
            onSelectFromHistory={handleSelectFromHistory}
            onClearHistory={clearSearchHistory}
            placeholder="Search champions... (Ctrl+K)"
            inputRef={searchInputRef}
            onKeyDown={e => {
              if (e.key === 'Enter' && filteredAndSortedChampions.length > 0) {
                e.preventDefault();
                handleChampionClick(filteredAndSortedChampions[0]);
              }
            }}
          />
        </div>
      </div>

      {/* Filter Chips */}
      <FilterChips chips={filterChips} />

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-2 flex-shrink-0">
        {['All', ...ROLES].map(role => (
          <FilterButton
            key={role}
            label={role}
            active={roleFilter === role}
            onClick={() => handleRoleFilterClick(role)}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-3 flex-shrink-0 border-t border-border pt-2">
        {DAMAGE_TYPES.map(type => (
          <FilterButton
            key={type}
            label={type}
            active={damageFilter === type}
            onClick={() => handleDamageFilterClick(type)}
          />
        ))}
      </div>

      {/* Quick Pick Mode */}
      {!isLoading && quickPickMode && (
        <ChampionQuickPick
          champions={availableChampions}
          onSelect={handleChampionClick}
          onQuickLook={onQuickLook}
          onDragStart={handleDragStart}
        />
      )}

      {/* Smart Suggestions */}
      {!isLoading && smartSuggestions.length > 0 && !quickPickMode && !searchTerm && (
        <div className="mb-3 flex-shrink-0 border-t border-border pt-2">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-accent" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-text-primary">Suggested</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {smartSuggestions.map(champ => (
              <Tooltip key={champ.id} content={champ.name}>
                <button
                  onClick={() => handleChampionClick(champ)}
                  onContextMenu={e => handleQuickLook(champ, e)}
                  draggable="true"
                  onDragStart={e => handleDragStart(e, champ)}
                  aria-label={`Select ${champ.name} (suggested)`}
                  className="w-12 h-12 min-w-[48px] min-h-[48px] bg-surface-inset border-2 border-accent/50 rounded-md focus:outline-none focus:ring-2 focus:ring-accent hover:border-accent transition-colors"
                >
                  <img
                    src={champ.image}
                    alt={champ.name}
                    className="w-full h-full object-cover rounded-md"
                    loading="lazy"
                  />
                </button>
              </Tooltip>
            ))}
          </div>
        </div>
      )}

      {/* Favorites Row */}
      {!isLoading && favoriteChampions.length > 0 && !quickPickMode && !searchTerm && (
        <div className="mb-3 flex-shrink-0 border-t border-border pt-2">
          <div className="flex items-center gap-2 mb-2">
            <Star size={16} className="text-accent fill-accent" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-text-primary">Favorites</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {favoriteChampions.map(champ => (
              <Tooltip key={champ.id} content={champ.name}>
                <div className="relative group">
                  <button
                    onClick={() => handleChampionClick(champ)}
                    onContextMenu={e => handleQuickLook(champ, e)}
                    draggable="true"
                    onDragStart={e => handleDragStart(e, champ)}
                    aria-label={`Select ${champ.name} (favorite)`}
                    className="w-12 h-12 min-w-[48px] min-h-[48px] bg-surface-inset border-2 border-accent/50 rounded-md focus:outline-none focus:ring-2 focus:ring-accent hover:border-accent transition-colors"
                  >
                    <img
                      src={champ.image}
                      alt={champ.name}
                      className="w-full h-full object-cover rounded-md"
                      loading="lazy"
                    />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleFavorite(champ.id);
                    }}
                    className="absolute -top-1 -right-1 p-0.5 bg-surface rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Remove ${champ.name} from favorites`}
                  >
                    <Star className="h-3 w-3 text-accent fill-accent" />
                  </button>
                </div>
              </Tooltip>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex-grow overflow-y-auto pr-2">
          <SkeletonGrid count={20} cols={6} />
        </div>
      )}

      {/* Champion Grid */}
      {!isLoading && (
        <div className="flex-grow overflow-y-auto pr-2">
          {filteredAndSortedChampions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <p className="text-text-secondary text-lg mb-2">No champions available</p>
              <p className="text-text-muted text-sm">
                {availableChampions.length === 0
                  ? 'All champions have been selected or banned'
                  : 'Try adjusting your search or filters'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-2">
              <AnimatePresence>
                {filteredAndSortedChampions.map((champ, index) => (
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
                      <div className="relative group">
                        <button
                          ref={el => {
                            // Use the map index directly to avoid double findIndex
                            if (index >= 0) {
                              // Ensure array is large enough
                              if (index >= championRefs.current.length) {
                                championRefs.current.length = index + 1;
                              }
                              championRefs.current[index] = el;
                            }
                          }}
                          onClick={() => handleChampionClick(champ)}
                          onContextMenu={e => handleQuickLook(champ, e)}
                          onKeyDown={e => handleKeyDown(e, index)}
                          draggable="true"
                          onDragStart={e => handleDragStart(e, champ)}
                          aria-label={`Select ${champ.name}. Press Enter or Space to select, arrow keys to navigate. Drag to team slot.`}
                          tabIndex={focusedIndex === index ? 0 : -1}
                          className="w-full aspect-square min-h-[48px] bg-surface-inset border-2 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent hover:border-accent transition-colors relative"
                        >
                          {/* Drag Indicator */}
                          <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-50 group-focus:opacity-50 transition-opacity pointer-events-none z-10">
                            <GripVertical className="h-4 w-4 text-text-secondary" strokeWidth={2} aria-hidden="true" />
                          </div>

                          {/* Favorite Indicator */}
                          {settings.favoriteChampions.includes(champ.id) && (
                            <div className="absolute top-1 right-1 z-10">
                              <Star className="h-3 w-3 text-accent fill-accent" aria-hidden="true" />
                            </div>
                          )}

                          <img
                            src={champ.image}
                            alt={champ.name}
                            className="w-full h-full object-cover rounded-md"
                            loading="lazy"
                          />
                        </button>

                        {/* Favorite Toggle on Hover */}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleFavorite(champ.id);
                          }}
                          className="absolute top-1 right-1 p-1 bg-surface/80 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 min-h-[32px] min-w-[32px] flex items-center justify-center"
                          aria-label={
                            settings.favoriteChampions.includes(champ.id)
                              ? `Remove ${champ.name} from favorites`
                              : `Add ${champ.name} to favorites`
                          }
                        >
                          <Star
                            className={`h-3 w-3 ${settings.favoriteChampions.includes(champ.id) ? 'text-accent fill-accent' : 'text-text-secondary'}`}
                          />
                        </button>
                      </div>
                    </Tooltip>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Recent Champions Panel */}
      {!isLoading && recentChampions.length > 0 && !searchTerm && (
        <div className="mb-3 flex-shrink-0 border-t border-border pt-2">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-text-secondary" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-text-secondary">Recent</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentChampions.map(champ => (
              <Tooltip key={champ.id} content={champ.name}>
                <button
                  onClick={() => handleChampionClick(champ)}
                  onContextMenu={e => handleQuickLook(champ, e)}
                  draggable="true"
                  onDragStart={e => handleDragStart(e, champ)}
                  aria-label={`Select ${champ.name} (recent)`}
                  className="w-12 h-12 min-w-[48px] min-h-[48px] bg-surface-inset border-2 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent hover:border-accent transition-colors"
                >
                  <img
                    src={champ.image}
                    alt={champ.name}
                    className="w-full h-full object-cover rounded-md"
                    loading="lazy"
                  />
                </button>
              </Tooltip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

ChampionGrid.displayName = 'ChampionGrid';
