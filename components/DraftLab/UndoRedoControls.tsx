import React from 'react';
import { Undo, Redo } from 'lucide-react';
import { Button } from '../common/Button';
import { Tooltip } from '../common/Tooltip';

interface UndoRedoControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  undoActionDescription?: string;
  redoActionDescription?: string;
}

/**
 * Undo/Redo Controls Component
 * Provides UI controls for undo/redo functionality with tooltips
 */
export const UndoRedoControls = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  undoActionDescription,
  redoActionDescription,
}: UndoRedoControlsProps) => {
  const handleUndo = () => {
    if (canUndo) {
      onUndo();
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      onRedo();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Tooltip content={undoActionDescription ? `Undo: ${undoActionDescription}` : 'Undo (Ctrl+Z)'}>
        <Button
          variant="secondary"
          onClick={handleUndo}
          disabled={!canUndo}
          aria-label="Undo"
          className="min-h-[44px] min-w-[44px] p-2"
        >
          <Undo className="h-5 w-5" strokeWidth={2} />
        </Button>
      </Tooltip>
      <Tooltip content={redoActionDescription ? `Redo: ${redoActionDescription}` : 'Redo (Ctrl+Shift+Z)'}>
        <Button
          variant="secondary"
          onClick={handleRedo}
          disabled={!canRedo}
          aria-label="Redo"
          className="min-h-[44px] min-w-[44px] p-2"
        >
          <Redo className="h-5 w-5" strokeWidth={2} />
        </Button>
      </Tooltip>
    </div>
  );
};
