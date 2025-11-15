import React, { useState, useMemo, useCallback, memo, useRef, useEffect } from 'react';
import type { Champion, ChampionLite, DraftState } from '../../types';
import { useChampions } from '../../contexts/ChampionContext';
import { useSettings } from '../../hooks/useSettings';
import { getAvailableChampions } from '../../lib/draftUtils';
import { ROLES, DAMAGE_TYPES } from '../../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock } from 'lucide-react';
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
  const { champions, championsLite } = useChampions();
  const { settings, setSettings } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [damageFilter, setDamageFilter] = useState('All');
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const championRefs = useRef<(HTMLButtonElement | null)[]>([]);

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
      if (isAFavorite && !isBFavorite) {
        return -1;
      }
      if (!isAFavorite && isBFavorite) {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [availableChampions, searchTerm, roleFilter, damageFilter, settings.favoriteChampions]);

  const handleRoleFilterClick = useCallback((role: string) => {
    setRoleFilter(role);
  }, []);

  const handleDamageFilterClick = useCallback((type: string) => {
    setDamageFilter(type);
  }, []);

  const handleChampionClick = useCallback(
    (champ: ChampionLite) => {
      // Track recent champion usage
      setSettings({
        recentChampions: [champ.id, ...settings.recentChampions.filter(id => id !== champ.id)].slice(0, 10), // Keep last 10
      });
      onSelect(champ);
    },
    [onSelect, settings.recentChampions, setSettings]
  );

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

  return (
    <div className="bg-surface p-4 flex flex-col h-full border border-border-primary">
      <div className="relative mb-2 flex-shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} aria-hidden="true" />
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

      {/* Recent Champions Panel */}
      {recentChampions.length > 0 && !searchTerm && (
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
                  className="w-12 h-12 bg-surface-inset border-2 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent hover:border-accent transition-colors"
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
                      aria-label={`Select ${champ.name}. Press Enter or Space to select, arrow keys to navigate.`}
                      tabIndex={focusedIndex === index ? 0 : -1}
                      className="w-full aspect-square bg-surface-inset border-2 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent hover:border-accent transition-colors"
                    >
                      <img
                        src={champ.image}
                        alt={champ.name}
                        className="w-full h-full object-cover rounded-md"
                        loading="lazy"
                      />
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
});

ChampionGrid.displayName = 'ChampionGrid';
