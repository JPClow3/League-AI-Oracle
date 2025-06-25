
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { UserIcon, UsersIcon, ArrowUturnLeftIcon as BackIcon } from './icons/index';
import { ChooseDraftModeModalProps, DraftMode, TeamSide } from '../types';

type ModalStep = 'MODE_SELECTION' | 'SIDE_SELECTION';

export const ChooseDraftModeModal: React.FC<ChooseDraftModeModalProps> = ({
  isOpen,
  onClose,
  onSelectModeAndSide,
}) => {
  const [step, setStep] = useState<ModalStep>('MODE_SELECTION');
  const [selectedModeForSideChoice, setSelectedModeForSideChoice] = useState<DraftMode | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('MODE_SELECTION');
      setSelectedModeForSideChoice(null);
    }
  }, [isOpen]);

  const handleModeCardClick = (mode: DraftMode) => {
    setSelectedModeForSideChoice(mode);
    setStep('SIDE_SELECTION');
  };

  const handleSideSelection = (side: TeamSide) => {
    if (selectedModeForSideChoice) {
      onSelectModeAndSide(selectedModeForSideChoice, side);
    }
  };

  const handleBackToModeSelection = () => {
    setStep('MODE_SELECTION');
    setSelectedModeForSideChoice(null);
  };

  const renderModeSelection = () => (
    <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <button
        onClick={() => handleModeCardClick('SOLO_QUEUE')}
        className="lol-panel p-5 sm:p-6 text-left hover:shadow-sky-400/40 transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-2xl transform hover:-translate-y-1 flex flex-col items-center space-y-3"
        aria-label="Select Ranked Draft (Solo/Duo & Flex)"
      >
        <UserIcon className="w-12 h-12 sm:w-14 sm:h-14 text-sky-400" />
        <h3 className="text-lg sm:text-xl font-semibold text-sky-300">Ranked Draft</h3>
        <p className="text-sm text-slate-400 leading-relaxed text-center">
          Standard 5-ban draft format. For Solo/Duo & Flex Queue.
        </p>
      </button>
      <button
        onClick={() => handleModeCardClick('COMPETITIVE')}
        className="lol-panel p-5 sm:p-6 text-left hover:shadow-purple-400/40 transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-2xl transform hover:-translate-y-1 flex flex-col items-center space-y-3"
        aria-label="Select Competitive Draft (Clash & Professional)"
      >
        <UsersIcon className="w-12 h-12 sm:w-14 sm:h-14 text-purple-400" />
        <h3 className="text-lg sm:text-xl font-semibold text-purple-300">Competitive Draft</h3>
        <p className="text-sm text-slate-400 leading-relaxed text-center">
          Multi-phase ban/pick format used in tournaments. For Clash & organized play.
        </p>
      </button>
    </div>
  );

  const renderSideSelection = () => {
    const modeName = selectedModeForSideChoice === 'SOLO_QUEUE' ? 'Ranked Draft' : 'Competitive Draft';
    return (
      <div className="p-4 sm:p-6 text-center space-y-4 relative">
        <button 
          onClick={handleBackToModeSelection} 
          className="lol-button lol-button-secondary text-xs absolute top-3 left-3 px-2 py-1 flex items-center sm:static sm:mb-2 sm:mx-auto"
          aria-label="Return to Game Mode Selection"
        >
          <BackIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1"/> Back
        </button>
        <h3 className="text-lg sm:text-xl font-semibold text-slate-100 mt-2 sm:mt-0 pt-8 sm:pt-0">
          Game Mode: <span className={selectedModeForSideChoice === 'SOLO_QUEUE' ? "text-sky-300" : "text-purple-300"}>{modeName}</span>
        </h3>
        <p className="text-sm sm:text-md text-slate-300">Which side will you start on?</p>
        <div className="space-y-3 max-w-xs mx-auto">
          <button
            onClick={() => handleSideSelection('BLUE')}
            className="w-full lol-button lol-button-primary py-2.5 sm:py-3 text-sm sm:text-base"
          >
            Blue Side
          </button>
          <button
            onClick={() => handleSideSelection('RED')}
            className="w-full lol-button text-sm sm:text-base py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 border-red-700 text-white"
          >
            Red Side
          </button>
        </div>
      </div>
    );
  };
  
  const modalTitle = step === 'MODE_SELECTION' ? "Select Game Mode" : "Select Starting Side";
  const modalFooter = step === 'MODE_SELECTION' ? <button onClick={onClose} className="lol-button lol-button-secondary">Cancel</button> : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="lg"
      modalId="choose-draft-mode-modal"
      titleId="choose-draft-mode-modal-title"
      footerContent={modalFooter}
    >
      {step === 'MODE_SELECTION' ? renderModeSelection() : renderSideSelection()}
    </Modal>
  );
};