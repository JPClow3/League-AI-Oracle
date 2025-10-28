import React, { useState, useEffect, useRef } from 'react';
import type { DraftState, Champion, TeamSide, AIAdvice } from '../../types';
import { getDraftAdvice } from '../../services/geminiService';
import { TeamPanel } from '../DraftLab/TeamPanel';
import { AdvicePanel } from '../DraftLab/AdvicePanel';
import { Button } from '../common/Button';
import { useChampions } from '../../contexts/ChampionContext';
import { updateSlotInDraft } from '../../lib/draftUtils';
import { useSettings } from '../../hooks/useSettings';
import { useUserProfile } from '../../hooks/useUserProfile';
import toast from 'react-hot-toast';
import { ArenaChampionSelectModal } from '../Arena/ArenaChampionSelectModal'; // Re-using for champ select
import { Signal, AlertTriangle } from 'lucide-react';
import { TurnIndicator } from '../Arena/TurnIndicator';
import { COMPETITIVE_SEQUENCE, DraftTurn } from '../Arena/arenaConstants';

interface LiveDraftProps {
  draftState: DraftState;
  setDraftState: React.Dispatch<React.SetStateAction<DraftState>>;
  onReset: () => void;
}

export const LiveDraft = ({ draftState, setDraftState, onReset }: LiveDraftProps) => {
    const { champions } = useChampions();
    const { settings } = useSettings();
    const { profile } = useUserProfile();

    const [activeSlot, setActiveSlot] = useState<{ team: TeamSide; type: 'pick' | 'ban'; index: number } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [advice, setAdvice] = useState<AIAdvice | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);
    const isMountedRef = useRef(true);

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            abortControllerRef.current?.abort();
        };
    }, []);

    const isStale = advice ? (JSON.stringify(draftState) !== advice.draftId) : false;

    const handleSlotClick = (team: TeamSide, type: 'pick' | 'ban', index: number) => {
        setActiveSlot({ team, type, index });
        setIsModalOpen(true);
    };

    const handleChampionSelect = (champion: Champion) => {
        if (!activeSlot) {return;}
        setDraftState(prev => updateSlotInDraft(prev, activeSlot.team, activeSlot.type, activeSlot.index, champion));
        setActiveSlot(null);
        setIsModalOpen(false);
    };
    
    // Automatically trigger analysis on every draft change
    useEffect(() => {
        const hasPicks = draftState.blue.picks.some(p => p.champion) || draftState.red.picks.some(p => p.champion);
        if (!hasPicks) {
            setAdvice(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const analysisTimeout = setTimeout(async () => {
            try {
                const result = await getDraftAdvice(draftState, 'blue', settings.primaryRole, profile.skillLevel, 'gemini-2.5-flash', controller.signal);
                if (controller.signal.aborted || !isMountedRef.current) {return;}
                setAdvice({ ...result, draftId: JSON.stringify(draftState) });
            } catch (err) {
                if (err instanceof DOMException && err.name === 'AbortError') {return;}
                if (!isMountedRef.current) {return;}

                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                if (!controller.signal.aborted && isMountedRef.current) {
                    setIsLoading(false);
                }
            }
        }, 500); // Debounce analysis

        return () => {
            clearTimeout(analysisTimeout);
            controller.abort();
        };

    }, [draftState, settings.primaryRole, profile.skillLevel]);

    const findCurrentTurn = (): DraftTurn | null => {
        for (const turn of COMPETITIVE_SEQUENCE) {
            const { team, type, index } = turn;
            const slot = draftState[team][type === 'pick' ? 'picks' : 'bans'][index];
            if (slot && !slot.champion) {
                return turn;
            }
        }
        return null; // Draft is complete
    };
    
    const currentTurn = findCurrentTurn();

    return (
        <div className="space-y-6">
            <ArenaChampionSelectModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={(champLite) => {
                    const champ = champions.find(c => c.id === champLite.id);
                    if(champ) {handleChampionSelect(champ);}
                }}
                onQuickLook={() => {}}
                draftState={draftState}
                title="Select Champion"
            />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold text-text-primary tracking-wide flex items-center gap-2">
                        <Signal className="text-accent animate-gentle-pulse" /> Live Co-Pilot
                    </h1>
                    <p className="text-sm text-text-secondary">Input picks and bans as they happen to get real-time AI guidance.</p>
                </div>
                <Button variant="danger" onClick={onReset}>Reset</Button>
            </div>
            
            {currentTurn && <TurnIndicator turn={currentTurn} isBotThinking={false} userSide={'blue'} context="live" />}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <TeamPanel side="blue" state={draftState.blue} onSlotClick={handleSlotClick} />
                    <TeamPanel side="red" state={draftState.red} onSlotClick={handleSlotClick} />
                </div>
                <div>
                    {isStale && (
                         <div className="bg-warning/10 text-warning p-3 rounded-md flex items-center gap-3 border-2 border-warning/20 mb-4">
                            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                            <p className="text-sm">Analysis is out of date. New advice is being generated...</p>
                        </div>
                    )}
                    <AdvicePanel
                        advice={advice}
                        isLoading={isLoading}
                        error={error}
                        navigateToAcademy={() => {}} // Not used in live mode
                        analysisCompleted={!isLoading && !!advice}
                        onAnimationEnd={() => {}}
                        isStale={isStale}
                    />
                </div>
            </div>
        </div>
    );
};
