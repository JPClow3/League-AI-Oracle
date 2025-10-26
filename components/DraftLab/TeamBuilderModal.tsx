import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useChampions } from '../../contexts/ChampionContext';
import type { ChampionLite } from '../../types';
import { Search } from 'lucide-react';

const STRATEGIES = [
    { name: 'Poke / Siege', description: 'Wear down enemies from a distance.' },
    { name: 'Dive / Engage', description: 'All-in on a single target with multiple threats.' },
    { name: 'Protect the Carry', description: 'Funnel resources and peel for a hyper-carry.' },
    { name: 'Split Push', description: 'Apply pressure in multiple lanes at once.' },
    { name: 'Pick / Catch', description: 'Isolate and eliminate out-of-position enemies.' },
];

interface TeamBuilderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: (core: { type: 'champion' | 'strategy'; value: string }) => void;
}

export const TeamBuilderModal = ({ isOpen, onClose, onStart }: TeamBuilderModalProps) => {
    const [mode, setMode] = useState<'champion' | 'strategy'>('strategy');
    const [selectedChampion, setSelectedChampion] = useState<ChampionLite | null>(null);
    const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { championsLite } = useChampions();

    const filteredChampions = useMemo(() =>
        searchTerm
            ? championsLite.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
            : championsLite,
        [searchTerm, championsLite]
    );

    const handleStart = () => {
        if (mode === 'champion' && selectedChampion) {
            onStart({ type: 'champion', value: selectedChampion.name });
        } else if (mode === 'strategy' && selectedStrategy) {
            onStart({ type: 'strategy', value: selectedStrategy });
        }
    };
    
    const isStartDisabled = (mode === 'champion' && !selectedChampion) || (mode === 'strategy' && !selectedStrategy);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Start with Team Builder Assistant" size="4xl">
            <div className="p-6">
                <div className="flex bg-surface-inset p-1 mb-4">
                    <button onClick={() => setMode('strategy')} className={`w-1/2 p-2 font-semibold ${mode === 'strategy' ? 'bg-accent text-on-accent' : 'text-text-secondary'}`}>Build from a Strategy</button>
                    <button onClick={() => setMode('champion')} className={`w-1/2 p-2 font-semibold ${mode === 'champion' ? 'bg-accent text-on-accent' : 'text-text-secondary'}`}>Build around a Champion</button>
                </div>

                <div className="min-h-[300px]">
                    {mode === 'strategy' && (
                        <div className="space-y-3">
                            {STRATEGIES.map(strat => (
                                <button key={strat.name} onClick={() => setSelectedStrategy(strat.name)} className={`w-full text-left p-3 border rounded-lg transition-colors ${selectedStrategy === strat.name ? 'bg-accent/10 border-accent' : 'bg-surface hover:border-border'}`}>
                                    <h3 className="font-bold">{strat.name}</h3>
                                    <p className="text-sm text-text-secondary">{strat.description}</p>
                                </button>
                            ))}
                        </div>
                    )}
                    {mode === 'champion' && (
                         <div className="flex flex-col h-[400px]">
                            <div className="relative mb-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20}/>
                                <input
                                    type="text"
                                    placeholder="Search for a champion..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full bg-surface-inset border border-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                            </div>
                            <div className="flex-grow overflow-y-auto p-2 bg-surface-inset border border-border rounded-lg flex flex-wrap gap-2 justify-center">
                                {filteredChampions.map(champ => (
                                    <button key={champ.id} onClick={() => setSelectedChampion(champ)} className={`p-1 rounded-lg ${selectedChampion?.id === champ.id ? 'ring-2 ring-accent' : ''}`}>
                                        <img src={champ.image} alt={champ.name} className="w-16 h-16 rounded-md" />
                                        <p className="text-xs text-center w-16 truncate">{champ.name}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-border">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleStart} disabled={isStartDisabled}>Start Building</Button>
                </div>
            </div>
        </Modal>
    );
};