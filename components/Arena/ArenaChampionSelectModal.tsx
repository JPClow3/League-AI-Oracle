import { useState, useEffect } from 'react';
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

export const ArenaChampionSelectModal = ({
  isOpen,
  onClose,
  onSelect,
  onQuickLook,
  draftState,
  title = 'Select your Champion',
}: ArenaChampionSelectModalProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={isMobile ? 'bottom-sheet' : '4xl'}>
      <div className={isMobile ? 'h-[75vh]' : 'h-[550px]'}>
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
