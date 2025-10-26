import React, { useMemo } from 'react';
import { CSSTransition } from 'react-transition-group';
import type { ChampionLite, Champion, Ability } from '../../types';
import { X } from 'lucide-react';
import { useChampions } from '../../contexts/ChampionContext';
import { Button } from '../common/Button';

interface QuickLookPanelProps {
    champion: ChampionLite | null;
    onClose: () => void;
    onDraft?: (champion: ChampionLite) => void;
    canDraft?: boolean;
}

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div>
        <h3 className="text-sm font-bold text-accent mb-1 uppercase tracking-wider">{title}</h3>
        {children}
    </div>
);

const AbilityDisplay = ({ ability }: { ability: Ability }) => (
     <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-surface-inset rounded-md flex items-center justify-center font-bold text-accent flex-shrink-0 border border-border text-xs">
            {ability.key[0]}
        </div>
        <div>
            <h4 className="font-semibold text-text-primary text-sm">{ability.name}</h4>
        </div>
    </div>
);

export const QuickLookPanel = ({ champion: championLite, onClose, onDraft, canDraft }: QuickLookPanelProps) => {
    const { champions } = useChampions();
    const panelRef = React.useRef(null);
    const backdropRef = React.useRef(null);
    
    const champion = useMemo(() => {
        if (!championLite) {return null;}
        return champions.find(c => c.id === championLite.id) || null;
    }, [championLite, champions]);

    return (
        <>
            {/* Backdrop for mobile */}
            <CSSTransition
                in={!!champion}
                timeout={300}
                classNames="modal" // Re-use simple fade transition
                unmountOnExit
                nodeRef={backdropRef}
            >
                <div
                    ref={backdropRef}
                    className="fixed inset-0 bg-black/60 z-40 md:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            </CSSTransition>

            {/* Panel */}
            <CSSTransition
                in={!!champion}
                timeout={300}
                classNames={{
                    enter: 'translate-y-full md:translate-y-0 md:translate-x-full',
                    enterActive: 'translate-y-0 md:translate-x-0',
                    exit: 'translate-y-0 md:translate-x-0',
                    exitActive: 'translate-y-full md:translate-y-0 md:translate-x-full',
                }}
                unmountOnExit
                nodeRef={panelRef}
            >
                <aside
                    ref={panelRef}
                    className="fixed bottom-0 left-0 right-0 h-[70vh] bg-surface shadow-2xl z-50 p-4 flex flex-col border-t-2 border-accent
                               md:bottom-auto md:left-auto md:top-0 md:h-screen md:w-[380px] md:border-t-0 md:border-l-2 md:border-accent
                               transition-transform duration-300 ease-in-out"
                    aria-label={`Quick look for ${champion?.name}`}
                    role="dialog"
                    aria-modal="true"
                >
                    {champion && championLite && <PanelContent champion={champion} championLite={championLite} onClose={onClose} onDraft={onDraft} canDraft={canDraft} />}
                </aside>
            </CSSTransition>
        </>
    );
};


const PanelContent = ({ champion, championLite, onClose, onDraft, canDraft }: { champion: Champion, championLite: ChampionLite, onClose: () => void, onDraft?: (champion: ChampionLite) => void, canDraft?: boolean }) => (
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
                        <React.Fragment key={ability.key}>
                            <AbilityDisplay ability={ability} />
                        </React.Fragment>
                    ))}
                </div>
            </Section>
        </div>
        
        <div className="flex-shrink-0 mt-4 pt-4 border-t border-border">
            {onDraft && canDraft && championLite && (
                <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                        onDraft(championLite);
                        onClose();
                    }}
                >
                    Draft {champion.name}
                </Button>
            )}
        </div>
    </div>
);