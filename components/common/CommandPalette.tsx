import React, { useState, useEffect, useRef, useMemo } from 'react';
import FocusTrap from 'focus-trap-react';

export interface Command {
    id: string;
    title: string;
    section: string;
    action: () => void;
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    commands: Command[];
}

export const CommandPalette = ({ isOpen, onClose, commands }: CommandPaletteProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLUListElement>(null);
    const activeItemRef = useRef<HTMLLIElement>(null);
    const paletteRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            setActiveIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const filteredCommands = useMemo(() => searchTerm
        ? commands.filter(cmd => cmd.title.toLowerCase().includes(searchTerm.toLowerCase()))
        : commands, [commands, searchTerm]);

    const groupedCommands = useMemo(() => filteredCommands.reduce<Record<string, Command[]>>((acc, cmd) => {
        (acc[cmd.section] = acc[cmd.section] || []).push(cmd);
        return acc;
    }, {} as Record<string, Command[]>), [filteredCommands]);
    
    const flatCommands = useMemo(() => Object.values(groupedCommands).flat(), [groupedCommands]);

    useEffect(() => {
      // Reset index when search term changes
      setActiveIndex(0);
    }, [searchTerm]);

    useEffect(() => {
      // Scroll to active item
      if (activeItemRef.current) {
        activeItemRef.current.scrollIntoView({ block: 'nearest' });
      }
    }, [activeIndex]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev + 1) % (flatCommands.length || 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev - 1 + (flatCommands.length || 1)) % (flatCommands.length || 1));
        } else if (e.key === 'Enter' && flatCommands.length > 0) {
            e.preventDefault();
            const command = flatCommands[activeIndex];
            command.action();
            onClose();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div 
            className={`fixed inset-0 z-50 transition-opacity duration-300 cursor-pointer ${isOpen ? 'bg-[hsl(var(--bg-primary)_/_0.9)] hover:bg-[hsl(var(--bg-primary)_/_0.95)]' : 'pointer-events-none opacity-0'}`}
            onClick={onClose}
            aria-hidden={!isOpen}
        >
            <FocusTrap
                active={isOpen}
                focusTrapOptions={{
                    initialFocus: () => inputRef.current,
                    fallbackFocus: () => paletteRef.current || document.body,
                    allowOutsideClick: true,
                    onDeactivate: onClose
                }}
            >
                <div 
                    ref={paletteRef}
                    tabIndex={-1}
                    className={`bg-surface rounded-lg shadow-2xl border border-border w-full max-w-2xl mx-auto mt-[15vh] transition-all duration-300 focus:outline-none ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                    onClick={e => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Command Palette"
                    onKeyDown={handleKeyDown}
                >
                    <div className="p-2 border-b border-border">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Type a command or search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent text-text-primary placeholder-text-secondary focus:outline-none px-2 py-2"
                            aria-controls="command-list"
                            aria-expanded="true"
                        />
                    </div>
                    <ul ref={resultsRef} id="command-list" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
                        {Object.entries(groupedCommands).map(([section, cmds]) => (
                            <li key={section} role="presentation">
                                <div className="px-2 pt-2 pb-1 text-xs font-semibold text-text-secondary uppercase">{section}</div>
                                <ul role="presentation">
                                    {(cmds as Command[]).map((cmd) => {
                                        const commandIndex = flatCommands.findIndex(c => c.id === cmd.id);
                                        const isSelected = commandIndex === activeIndex;
                                        return (
                                            <li
                                                key={cmd.id}
                                                id={`command-${cmd.id}`}
                                                ref={isSelected ? activeItemRef : null}
                                                onClick={() => { cmd.action(); onClose(); }}
                                                onMouseMove={() => setActiveIndex(commandIndex)}
                                                className={`p-2 rounded-md cursor-pointer text-text-primary ${isSelected ? 'bg-accent text-on-accent' : 'hover:bg-surface-secondary'}`}
                                                role="option"
                                                aria-selected={isSelected}
                                            >
                                                {cmd.title}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </li>
                        ))}
                         {flatCommands.length === 0 && (
                            <li className="p-4 text-center text-text-secondary">No results found.</li>
                        )}
                    </ul>
                </div>
            </FocusTrap>
        </div>
    );
};