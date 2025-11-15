import React, { useState, useRef, useEffect } from 'react';
import type { ChampionLite } from '../../types';
import { Search, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchAutocompleteProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  champions: ChampionLite[];
  searchHistory: string[];
  onSelectFromHistory: (term: string) => void;
  onClearHistory?: () => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

/**
 * Search input with autocomplete suggestions and search history
 */
export const SearchAutocomplete = ({
  searchTerm,
  onSearchChange,
  champions,
  searchHistory,
  onSelectFromHistory,
  onClearHistory,
  placeholder = 'Search champions...',
  onKeyDown,
  inputRef: externalRef,
}: SearchAutocompleteProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = externalRef || internalRef;
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter champions based on search term
  const suggestions = React.useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }
    const term = searchTerm.toLowerCase();
    return champions.filter(c => c.name.toLowerCase().includes(term)).slice(0, 5);
  }, [searchTerm, champions]);

  // Show history when input is focused and empty
  useEffect(() => {
    const checkFocus = () => {
      const currentInput = inputRef.current;
      if (searchTerm.length === 0 && document.activeElement === currentInput) {
        setShowHistory(true);
        setShowSuggestions(false);
      } else if (searchTerm.length > 0) {
        setShowHistory(false);
        setShowSuggestions(suggestions.length > 0);
      } else {
        setShowHistory(false);
        setShowSuggestions(false);
      }
    };

    // Use requestAnimationFrame to defer state updates and avoid cascading renders
    const rafId = requestAnimationFrame(checkFocus);
    return () => cancelAnimationFrame(rafId);
  }, [searchTerm, suggestions.length, inputRef]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (champion?: ChampionLite, historyTerm?: string) => {
    if (champion) {
      onSearchChange(champion.name);
    } else if (historyTerm) {
      onSelectFromHistory(historyTerm);
    }
    setShowSuggestions(false);
    setShowHistory(false);
    inputRef.current?.blur();
  };

  const handleFocus = () => {
    if (searchTerm.length === 0 && searchHistory.length > 0) {
      setShowHistory(true);
    } else if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              setShowSuggestions(false);
              setShowHistory(false);
              inputRef.current?.blur();
            } else if (onKeyDown) {
              onKeyDown(e);
            }
          }}
          aria-label="Search champions"
          className="w-full bg-surface-inset border border-border rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
        />
        {searchTerm && (
          <button
            onClick={() => {
              onSearchChange('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-1"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-50 max-h-[300px] overflow-y-auto"
          >
            {suggestions.map(champ => (
              <button
                key={champ.id}
                onClick={() => handleSelect(champ)}
                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-surface-secondary transition-colors"
                aria-label={`Select ${champ.name}`}
              >
                <img src={champ.image} alt={champ.name} className="w-8 h-8 rounded" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text-primary truncate">{champ.name}</div>
                  <div className="text-xs text-text-secondary">{champ.roles.join(', ')}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search History */}
      <AnimatePresence>
        {showHistory && searchHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-50 max-h-[300px] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Clock className="h-4 w-4" />
                <span>Recent Searches</span>
              </div>
              {onClearHistory && (
                <button
                  onClick={() => {
                    onClearHistory();
                    setShowHistory(false);
                  }}
                  className="text-xs text-text-secondary hover:text-text-primary transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            {searchHistory.map((term, index) => (
              <button
                key={`${term}-${index}`}
                onClick={() => handleSelect(undefined, term)}
                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-surface-secondary transition-colors"
                aria-label={`Search for ${term}`}
              >
                <Clock className="h-4 w-4 text-text-muted flex-shrink-0" />
                <span className="text-sm text-text-primary truncate">{term}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
