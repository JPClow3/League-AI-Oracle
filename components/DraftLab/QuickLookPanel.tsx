import React, { useMemo, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import type { ChampionLite, Champion, Ability } from '../../types';
import { X } from 'lucide-react';
import { useChampions } from '../../contexts/ChampionContext';

interface QuickLookPanelProps {
    champion: ChampionLite | null;
    onClose: () => void;
}

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div>
        <h3 className="text-sm font-bold text-yellow-300 mb-1 uppercase tracking-wider">{title}</h3>
        {children}
    </div>
);

const AbilityDisplay = ({ ability }: { ability: Ability }) => (
     <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center font-bold text-accent flex-shrink-0 border border-slate-700 text-xs">
            {ability.key[0]}
        </div>
        <div>
            <h4 className="font-semibold text-white text-sm">{ability.name}</h4>
        </div>
    </div>
);

export const QuickLookPanel = ({ champion: championLite, onClose }: QuickLookPanelProps) => {
    const { champions } = useChampions();
    const panelRef = React.useRef(null);
    const champion = useMemo(() => {
        if (!championLite) return null;
        return champions.find(c => c.id === championLite.id) || null;
    }, [championLite, champions]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Also check if the click is on any champion grid item to prevent closing when right-clicking another champion
            if (panelRef.current && !(panelRef.current as any).contains(target) && !target.closest('.cursor-pointer')) {
                onClose();
            }
        };

        if (champion) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [champion, onClose]);

    return (
        <CSSTransition
            in={!!champion}
            timeout={300}
            classNames={{
                enter: 'translate-x-full',
                enterActive: 'translate-x-0 transition-transform duration-300 ease-out',
                exit: 'translate-x-0',
                exitActive: 'translate-x-full transition-transform duration-300 ease-in'
            }}
            unmountOnExit
            nodeRef={panelRef}
        >
            <aside 
                ref={panelRef}
                className="fixed top-16 right-0 h-[calc(100vh-8rem)] w-80 bg-surface shadow-2xl z-40 rounded-l-xl p-4 flex flex-col border-l-2 border-accent"
                aria-label={`Quick look for ${champion?.name}`}
            >
                {champion && (
                    <div className="flex flex-col h-full">
                        <div className="flex-shrink-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-text-primary">{champion.name}</h2>
                                    <p className="text-sm text-text-secondary italic -mt-1">{champion.title}</p>
                                </div>
                                <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition" aria-label="Close quick look">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <img src={champion.image} alt={champion.name} className="w-full my-3 rounded-lg border-2 border-border" />
                             <div className="space-y-2 bg-secondary p-3 rounded-md text-sm text-text-secondary">
                                <p><strong>Roles:</strong> {champion.roles.join(', ')}</p>
                                <p><strong>Damage:</strong> {champion.damageType}</p>
                                <p><strong>Class:</strong> {champion.class.join(', ')}</p>
                            </div>
                        </div>
                        
                        <div className="flex-grow mt-4 overflow-y-auto pr-2">
                             <Section title="Key Abilities">
                                <div className="space-y-3">
                                    {champion.abilities.filter(a => ['Q','W','E','R'].includes(a.key)).map(ability => (
                                        <AbilityDisplay key={ability.key} ability={ability} />
                                    ))}
                                </div>
                            </Section>
                        </div>
                    </div>
                )}
            </aside>
        </CSSTransition>
    );
};
