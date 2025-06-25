
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Modal } from './Modal';
import { Command, CommandPaletteProps, DDragonChampionInfo, DDragonItemInfo, Concept, AppView } from '../types';
import { getChampionImageURL, getItemImageURL } from '../services/ddragonService';
import { MagnifyingGlassIcon } from './icons/index';

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  commands,
  champions,
  items,
  concepts,
  ddragonVersion,
  navigateTo,
}) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      // Delay focus to allow modal to fully render and transition
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150); // Adjust delay as needed
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const filteredCommands = useMemo(() => {
    const baseCommands = commands.filter(c => c.type === 'navigation' || c.type === 'action' || c.type.endsWith('_link'));
    if (!query.trim()) return baseCommands;
    
    const lowerQuery = query.toLowerCase();
    const navAndActionCommands = baseCommands.filter(cmd => 
        (cmd.label.toLowerCase().includes(lowerQuery) || (cmd.keywords && cmd.keywords.some(kw => kw.toLowerCase().includes(lowerQuery))))
    );

    const championResults: Command[] = champions
        .filter(c => c.name.toLowerCase().includes(lowerQuery) || c.id.toLowerCase().includes(lowerQuery))
        .slice(0, 5)
        .map(c => ({
            id: `search_champ_${c.id}`,
            type: 'search_result_champion',
            label: c.name,
            action: () => { navigateTo('EXPLORER', { championId: c.id }); onClose(); },
            data: c,
            icon: () => <img src={getChampionImageURL(ddragonVersion, c.id)} alt={c.name} className="w-6 h-6 rounded-sm mr-2.5" /> /* Increased size */
        }));

    const itemResults: Command[] = items
        .filter(i => i.name.toLowerCase().includes(lowerQuery))
        .slice(0, 5)
        .map(i => ({
            id: `search_item_${i.id || i.name.replace(/\s+/g, '')}`,
            type: 'search_result_item',
            label: i.name,
            action: () => { navigateTo('ARMORY', { itemId: i.id || i.name }); onClose(); },
            data: i,
            icon: () => <img src={getItemImageURL(ddragonVersion, i.image.full)} alt={i.name} className="w-6 h-6 rounded-sm mr-2.5 border border-slate-600" /> /* Increased size */
        }));
    
    const conceptResults: Command[] = concepts
        .filter(c => c.title.toLowerCase().includes(lowerQuery) || c.description.toLowerCase().includes(lowerQuery))
        .slice(0, 3)
        .map(c => ({
            id: `search_concept_${c.id}`,
            type: 'search_result_concept',
            label: c.title,
            action: () => { 
                if(c.onClick) c.onClick(); // Assumes concept.onClick navigates or initiates lesson
                else navigateTo('HOME'); // Fallback, ideally scroll to concepts on Home
                onClose();
            },
            data: c,
            icon: c.icon ? () => <c.icon className="w-6 h-6 mr-2.5" /> : undefined /* Increased size */
        }));

    // Prioritize direct command matches, then search results
    const exactCommandMatch = navAndActionCommands.find(cmd => cmd.label.toLowerCase() === lowerQuery);
    if (exactCommandMatch) {
      return [exactCommandMatch, ...navAndActionCommands.filter(cmd => cmd.id !== exactCommandMatch.id), ...championResults, ...itemResults, ...conceptResults];
    }
    
    return [...navAndActionCommands, ...championResults, ...itemResults, ...conceptResults];
  }, [query, commands, champions, items, concepts, ddragonVersion, navigateTo, onClose]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, 0));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (filteredCommands[activeIndex]) {
          filteredCommands[activeIndex].action();
          // Action should handle onClose if it navigates
        }
      }
    };
    // Use event capturing on the document to ensure palette shortcuts work globally
    // while preventing page scroll or other default actions.
    document.addEventListener('keydown', handleKeyDown, true); 
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, activeIndex, filteredCommands, onClose]);
  
  useEffect(() => {
    resultsRef.current?.children[activeIndex]?.scrollIntoView({
        block: 'nearest',
    });
  }, [activeIndex]);


  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      panelClassName="!bg-slate-800/95 command-palette-panel shadow-2xl border-slate-700" // Ensure high z-index behavior via Modal itself
      modalId="command-palette"
      titleId="command-palette-title" // Add titleId for accessibility
    >
      <div className="p-0">
        <div className="flex items-center border-b border-slate-700 p-3.5 sticky top-0 bg-slate-800/90 backdrop-blur-sm z-10"> {/* Increased padding */}
          <MagnifyingGlassIcon className="h-6 w-6 text-slate-400 mr-2.5 flex-shrink-0" /> {/* Increased size */}
          <input
            id="command-palette-title" // Use for aria-labelledby
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-base" /* Increased font size */
            aria-label="Command palette input"
            autoComplete="off"
          />
        </div>
        {filteredCommands.length > 0 ? (
          <ul ref={resultsRef} className="max-h-[calc(60vh-50px)] overflow-y-auto command-palette-results py-2.5" role="listbox" aria-activedescendant={filteredCommands[activeIndex]?.id}> {/* Increased py */}
            {filteredCommands.map((cmd, index) => (
              <li key={cmd.id} id={cmd.id} role="option" aria-selected={index === activeIndex}>
                <button
                  onClick={cmd.action}
                  className={`w-full text-left px-3.5 py-3 text-base flex items-center transition-colors duration-100 ease-in-out rounded-md mx-1.5
                    ${index === activeIndex ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-700/70'}`} /* Increased padding, font size, and mx */
                >
                  {cmd.icon && <cmd.icon className={`w-6 h-6 mr-3 flex-shrink-0 ${index === activeIndex ? 'text-white' : 'text-slate-400'}`} />} {/* Increased icon size and mr */}
                  <span className="truncate">{cmd.label}</span>
                  {cmd.type.startsWith('search_result_') && (
                     <span className={`ml-auto text-sm px-2 py-1 rounded 
                        ${index === activeIndex ? 'bg-sky-700 text-sky-100' : 'bg-slate-600 text-slate-400'}`}> {/* Increased font size and padding */}
                        {cmd.type.replace('search_result_', '').replace('_', ' ')}
                     </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-5 text-center text-slate-400 text-base">No results found.</p> /* Increased padding and font size */
        )}
      </div>
    </Modal>
  );
};