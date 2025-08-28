import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import type { DraftState } from '../types';

interface DraftContextType {
  draftState: DraftState;
  setDraftState: React.Dispatch<React.SetStateAction<DraftState>>;
  resetDraft: () => void;
}

const createInitialSlot = () => ({ champion: null, isActive: false });
const createInitialTeamState = () => ({
  picks: Array(5).fill(null).map(createInitialSlot),
  bans: Array(5).fill(null).map(createInitialSlot),
});

export const getInitialDraftState = (): DraftState => ({
  blue: createInitialTeamState(),
  red: createInitialTeamState(),
  turn: 'blue',
  phase: 'ban1',
});


export const DraftContext = createContext<DraftContextType | undefined>(undefined);

export const DraftProvider = ({ children }: { children: React.ReactNode }) => {
    const [draftState, setDraftState] = useState<DraftState>(getInitialDraftState());
    
    const resetDraft = useCallback(() => {
        setDraftState(getInitialDraftState());
    }, []);

    const value = useMemo(() => ({
        draftState,
        setDraftState,
        resetDraft
    }), [draftState, resetDraft]);

    return (
        <DraftContext.Provider value={value}>
            {children}
        </DraftContext.Provider>
    );
};


export const useDraft = (): DraftContextType => {
  const context = useContext(DraftContext);
  if (context === undefined) {
    throw new Error('useDraft must be used within a DraftProvider');
  }
  return context;
};
