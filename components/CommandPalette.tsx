
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Champion, Item } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { Icon } from './common/Icon';
import { useDraftStore } from '../store/draftStore';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setView: (view: View) => void;
  champions: Champion[];
  items: Item[];
  onNavigateToVault: (champion: Champion) => void;
}

interface Command {
  type: 'navigation' | 'champion' | 'item' | 'action';
  id: string;
  name: string;
  action: () => void;
  icon: React.ReactNode;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, setView, champions, items, onNavigateToVault }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 150);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = 'command-palette-list';

  const commands = useMemo<Command[]>(() => {
    const navCommands: Command[] = [
      { type: 'navigation', id: 'home', name: 'Go to Home', action: () => setView(View.HOME), icon: <Icon name="home" className="w-5 h-5"/> },
      { type: 'navigation', id: 'drafting', name: 'Go to Drafting', action: () => setView(View.DRAFTING), icon: <Icon name="draft" className="w-5 h-5"/> },
      { type: 'navigation', id: 'lab', name: 'Go to Draft Lab', action: () => setView(View.DRAFT_LAB), icon: <Icon name="lab" className="w-5 h-5"/> },
      { type: 'navigation', id: 'playbook', name: 'Go to Playbook', action: () => setView(View.PLAYBOOK), icon: <Icon name="playbook" className="w-5 h-5"/> },
      { type: 'navigation', id: 'vault', name: 'Go to Champion Vault', action: () => setView(View.VAULT), icon: <Icon name="vault" className="w-5 h-5"/> },
      { type: 'navigation', id: 'lessons', name: 'Go to Knowledge Hub', action: () => setView(View.LESSONS), icon: <Icon name="lessons" className="w-5 h-5"/> },
      { type: 'navigation', id: 'history', name: 'Go to History', action: () => setView(View.HISTORY), icon: <Icon name="history" className="w-5 h-5"/> },
    ];
    
    const actionCommands: Command[] = [
        { 
            type: 'action', 
            id: 'new-draft-lab', 
            name: 'New Draft Lab', 
            action: () => {
                useDraftStore.getState().actions.resetDraft();
                setView(View.DRAFT_LAB);
            }, 
            icon: <Icon name="plus" className="w-5 h-5"/> 
        },
    ];

    const championCommands: Command[] = champions.map(c => ({ 
        type: 'champion', 
        id: c.id, 
        name: `Analyze: ${c.name}`, 
        action: () => onNavigateToVault(c), 
        icon: <Icon name="profile" className="w-5 h-5" /> 
    }));

    // For now, let's keep items out to reduce noise, can be added later.
    // const itemCommands: Command[] = items.map(i => ({ type: 'item', id: i.name, name: `Item: ${i.name}`, action: () => { setView(View.VAULT); }, icon: <Icon name="shield" className="w-5 h-5" /> }));

    return [...actionCommands, ...navCommands, ...championCommands];
  }, [setView, champions, onNavigateToVault]);

  const filteredCommands = useMemo(() => {
    if (!debouncedSearchTerm) {
      return commands.filter(c => c.type === 'navigation' || c.type === 'action');
    }
    return commands.filter(c => c.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
  }, [debouncedSearchTerm, commands]);
  
  const getCommandId = (cmd: Command, index: number) => `cmd-item-${cmd.type}-${cmd.id.replace(/\s/g, '-')}-${index}`;


  useEffect(() => {
    if (isOpen) {
        setSearchTerm('');
    }
  }, [isOpen]);
  
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLLIElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const command = filteredCommands[selectedIndex];
      if (command) {
        command.action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;
  
  const activeDescendant = filteredCommands.length > 0 ? getCommandId(filteredCommands[selectedIndex], selectedIndex) : undefined;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-24" onClick={onClose}>
      <div
        className="w-full max-w-xl glass-effect rounded-lg shadow-2xl overflow-hidden animate-pop-in"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-palette-label"
      >
        <div className="relative">
             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Icon name="search" className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
            <input
              id="command-palette-label"
              type="text"
              placeholder="Type a command or search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full p-4 pl-11 text-lg bg-transparent focus:outline-none border-b border-slate-300/50 dark:border-slate-700/50 text-slate-800 dark:text-slate-200"
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={activeDescendant}
            />
        </div>
        <ul ref={listRef} id={listId} role="listbox" className="max-h-96 overflow-y-auto p-2">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((command, index) => (
              <li
                id={getCommandId(command, index)}
                key={getCommandId(command, index)}
                onClick={() => { command.action(); onClose(); }}
                className={`flex items-center space-x-3 p-3 rounded-md cursor-pointer text-slate-700 dark:text-slate-300 ${
                  index === selectedIndex ? 'bg-indigo-500/20' : 'hover:bg-slate-500/10'
                }`}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <span className="text-slate-500 dark:text-slate-400">{command.icon}</span>
                <span>{command.name}</span>
              </li>
            ))
          ) : (
            <li className="p-4 text-center text-slate-500">No results found.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CommandPalette;