import type { HistoryEntry } from '../../types';
import { Button } from '../common/Button';
import { Tooltip } from '../common/Tooltip';
import { AlertTriangle, Check, X, Minus } from 'lucide-react';
import { useChampions } from '../../contexts/ChampionContext';

interface PlaybookCardProps {
    entry: HistoryEntry;
    onViewDetails: (entry: HistoryEntry) => void;
    onSelectForCompare: (id: string) => void;
    isSelected: boolean;
}

const ResultIcon = ({ result }: { result: HistoryEntry['result'] }) => {
    if (!result) {return null;}
    
    const iconMap = {
        win: <Check className="h-4 w-4 text-success" />,
        loss: <X className="h-4 w-4 text-error" />,
        remake: <Minus className="h-4 w-4 text-text-muted" />,
    };
    
    return (
        <Tooltip content={`Result: ${result.charAt(0).toUpperCase() + result.slice(1)}`}>
            <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center bg-surface border border-border`}>
                {iconMap[result]}
            </div>
        </Tooltip>
    );
};

export const PlaybookCard = ({ entry, onViewDetails, onSelectForCompare, isSelected }: PlaybookCardProps) => {
    const { champions } = useChampions();
    const isPending = entry.status === 'pending';
    const isError = entry.status === 'error';

    const getChampImages = (ids: (string | null)[]) => {
        return ids.slice(0, 5).map((id, index) => {
            if (!id) {return <div key={index} style={{ zIndex: 5 - index, marginLeft: index === 0 ? '0' : '-0.75rem' }} className="w-8 h-8 bg-surface-inset border-2 border-border-primary rounded-full"></div>;}
            const champ = champions.find(c => c.id === id);
            return (
                <img 
                    key={index} 
                    src={champ?.image} 
                    alt={champ?.name} 
                    className="w-8 h-8 bg-surface-secondary border-2 border-border-primary rounded-full transition-transform duration-300 group-hover:translate-x-1"
                    style={{ zIndex: 5 - index, marginLeft: index === 0 ? '0' : '-0.75rem' }}
                    title={champ?.name}
                />
            );
        });
    };
    
    const borderClass = isSelected ? 'border-accent shadow-glow-accent' : 'border-border-primary hover:border-info';
    
    return (
        <div 
            onClick={() => onSelectForCompare(entry.id)}
            className={`group relative bg-surface-primary border ${borderClass} shadow-md p-4 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-info/10 overflow-hidden cursor-pointer`}
        >
            <ResultIcon result={entry.result} />
            <div className="absolute top-4 -left-px w-1 h-8 bg-info rounded-r-md transition-all duration-300 group-hover:h-16 group-hover:shadow-glow-info" />
            <div className="relative z-10 pl-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-display text-lg font-bold text-text-primary tracking-wide pr-4">{entry.name}</h3>
                    {isPending && (
                        <div className="flex items-center gap-1 text-xs text-gold">
                            <span>Generating...</span>
                        </div>
                    )}
                     {isError && (
                        <Tooltip content="AI dossier generation failed. You can delete this entry and save it again from the lab to retry.">
                            <div className="flex items-center gap-1 text-xs text-error cursor-help">
                                 <AlertTriangle className="h-4 w-4" />
                                <span>Error</span>
                            </div>
                        </Tooltip>
                    )}
                </div>
                <p className="text-xs text-text-secondary mb-3">Saved on {new Date(entry.createdAt).toLocaleDateString()}</p>
                <div className="space-y-2">
                    <div className="flex items-center">
                        <span className="text-sm font-semibold text-team-blue w-12">Blue:</span>
                        <div className="flex pl-3">{getChampImages(entry.draft.blue.picks)}</div>
                    </div>
                     <div className="flex items-center">
                        <span className="text-sm font-semibold text-team-red w-12">Red:</span>
                        <div className="flex pl-3">{getChampImages(entry.draft.red.picks)}</div>
                    </div>
                </div>
            </div>
            <div className="relative z-10 mt-4 pl-4 flex flex-col gap-2">
                {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {entry.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs bg-surface-tertiary px-2 py-0.5 text-text-secondary">{tag}</span>
                        ))}
                    </div>
                )}
                <div className="flex gap-2">
                    <Button variant="primary" onClick={(e) => { e.stopPropagation(); onViewDetails(entry); }} disabled={isPending}>View Details</Button>
                </div>
            </div>
            {isPending && <div className="absolute inset-0 bg-surface-primary/50 scanner-effect" />}
        </div>
    );
};