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
}

export const ArenaChampionSelectModal = ({ isOpen, onClose, onSelect, onQuickLook, draftState }: ArenaChampionSelectModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Select your Champion">
            <div className="h-[550px]">
                <ChampionGrid 
                    onSelect={onSelect} 
                    onQuickLook={onQuickLook} 
                    recommendations={[]} 
                    isRecsLoading={false} 
                    activeRole={null} 
                    draftState={draftState} 
                    intelData={null}
                    onDragStart={() => {}}
                />
            </div>
        </Modal>
    );
};
