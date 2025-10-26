import React from 'react';
import type { ChampionLite, DraftState } from '../../types';
import { Modal } from '../common/Modal';
import { ChampionGrid } from '../DraftLab/ChampionGrid';

interface ArenaChampionSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (champion: ChampionLite) => void;
    onQuickLook: (champion: ChampionLite) => void;
    draftState: DraftState;
    title?: string;
}

export const ArenaChampionSelectModal = ({ isOpen, onClose, onSelect, onQuickLook, draftState, title = "Select your Champion" }: ArenaChampionSelectModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="h-[550px]">
                <ChampionGrid 
                    onSelect={onSelect} 
                    onQuickLook={onQuickLook} 
                    onWhyThisPick={() => {}}
                    recommendations={[]} 
                    isRecsLoading={false} 
                    activeRole={null} 
                    draftState={draftState} 
                    onDragStart={() => {}}
                />
            </div>
        </Modal>
    );
};