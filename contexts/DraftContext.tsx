import React, { createContext, useContext, useMemo, useCallback } from 'react';
import type { DraftState } from '../types';
import { useUndoRedo } from '../hooks/useUndoRedo';

interface DraftContextType {
  draftState: DraftState;
  setDraftState: React.Dispatch<React.SetStateAction<DraftState>>;
  resetDraft: () => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
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
  const {
    currentState: draftState,
    canUndo,
    canRedo,
    undo: undoState,
    redo: redoState,
    pushState,
    setState,
  } = useUndoRedo<DraftState>(getInitialDraftState());

  const setDraftState = useCallback<React.Dispatch<React.SetStateAction<DraftState>>>(
    action => {
      const newState = typeof action === 'function' ? action(draftState) : action;
      pushState(newState);
    },
    [draftState, pushState]
  );

  const resetDraft = useCallback(() => {
    setState(getInitialDraftState(), true);
  }, [setState]);

  const undo = useCallback(() => {
    const prevState = undoState();
    if (prevState !== null) {
      // State is already updated by undoState
    }
  }, [undoState]);

  const redo = useCallback(() => {
    const nextState = redoState();
    if (nextState !== null) {
      // State is already updated by redoState
    }
  }, [redoState]);

  const value = useMemo(
    () => ({
      draftState,
      setDraftState,
      resetDraft,
      canUndo,
      canRedo,
      undo,
      redo,
    }),
    [draftState, setDraftState, resetDraft, canUndo, canRedo, undo, redo]
  );

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
};

export const useDraft = (): DraftContextType => {
  const context = useContext(DraftContext);
  if (context === undefined) {
    throw new Error('useDraft must be used within a DraftProvider');
  }
  return context;
};
