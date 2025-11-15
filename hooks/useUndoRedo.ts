import { useState, useCallback, useRef } from 'react';

export interface UndoRedoState<T> {
  canUndo: boolean;
  canRedo: boolean;
  currentState: T;
  history: T[];
  currentIndex: number;
}

export interface UndoRedoActions<T> {
  undo: () => T | null;
  redo: () => T | null;
  pushState: (state: T) => void;
  clearHistory: () => void;
  setState: (state: T, skipHistory?: boolean) => void;
}

const MAX_HISTORY = 50;

/**
 * Generic undo/redo hook with max 50 state history
 */
export const useUndoRedo = <T>(initialState: T): UndoRedoState<T> & UndoRedoActions<T> => {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const skipNextPushRef = useRef(false);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;
  const currentState = history[currentIndex] ?? initialState;

  const undo = useCallback((): T | null => {
    if (!canUndo) {
      return null;
    }
    skipNextPushRef.current = true;
    const newIndex = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIndex);
    return history[newIndex] ?? null;
  }, [canUndo, currentIndex, history]);

  const redo = useCallback((): T | null => {
    if (!canRedo) {
      return null;
    }
    skipNextPushRef.current = true;
    const newIndex = Math.min(history.length - 1, currentIndex + 1);
    setCurrentIndex(newIndex);
    return history[newIndex] ?? null;
  }, [canRedo, currentIndex, history]);

  const pushState = useCallback(
    (state: T) => {
      if (skipNextPushRef.current) {
        skipNextPushRef.current = false;
        return;
      }

      setHistory(prev => {
        // Remove any states after current index (for new branch)
        const newHistory = prev.slice(0, currentIndex + 1);

        // Add new state
        const updated = [...newHistory, state];

        // Limit to MAX_HISTORY
        if (updated.length > MAX_HISTORY) {
          return updated.slice(-MAX_HISTORY);
        }

        return updated;
      });

      setCurrentIndex(prev => {
        const newIndex = prev + 1;
        // If we're at max history, we need to adjust index
        const newHistoryLength = Math.min(prev + 2, MAX_HISTORY);
        return newIndex >= newHistoryLength ? newHistoryLength - 1 : newIndex;
      });
    },
    [currentIndex]
  );

  const setState = useCallback(
    (state: T, skipHistory = false) => {
      if (skipHistory) {
        skipNextPushRef.current = true;
        setHistory([state]);
        setCurrentIndex(0);
      } else {
        pushState(state);
      }
    },
    [pushState]
  );

  const clearHistory = useCallback(() => {
    setHistory([currentState]);
    setCurrentIndex(0);
  }, [currentState]);

  return {
    canUndo,
    canRedo,
    currentState,
    history,
    currentIndex,
    undo,
    redo,
    pushState,
    clearHistory,
    setState,
  };
};
