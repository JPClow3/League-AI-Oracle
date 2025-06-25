
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { SaveToPlaybookModalProps } from '../types';
import { StrategyTomeIcon } from './icons/index';

export const SaveToPlaybookModal: React.FC<SaveToPlaybookModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentName = '',
}) => {
  const [strategyName, setStrategyName] = useState(currentName);

  useEffect(() => {
    if (isOpen) {
      setStrategyName(currentName || `My Strategy ${new Date().toLocaleDateString()}`);
    }
  }, [isOpen, currentName]);

  const handleSaveClick = () => {
    if (strategyName.trim()) {
      onSave(strategyName.trim());
      onClose();
    } else {
      // Basic validation: could add a small error message display within the modal
      alert("Please enter a name for your strategy.");
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save Strategy to Playbook"
      titleIcon={<StrategyTomeIcon className="w-5 h-5 text-sky-400" />}
      size="sm"
      modalId="save-to-playbook-modal"
      footerContent={
        <>
          <button onClick={onClose} className="lol-button lol-button-secondary text-sm">
            Cancel
          </button>
          <button onClick={handleSaveClick} className="lol-button lol-button-primary text-sm">
            Save
          </button>
        </>
      }
    >
      <div className="p-4 sm:p-6">
        <label htmlFor="strategyName" className="block text-sm font-medium text-slate-300 mb-2">
          Strategy Name:
        </label>
        <input
          type="text"
          id="strategyName"
          value={strategyName}
          onChange={(e) => setStrategyName(e.target.value)}
          className="w-full lol-input"
          placeholder="e.g., Anti-Heal Poke Comp"
          autoFocus
        />
        <p className="text-xs text-slate-500 mt-2">
          Give your strategy a memorable name to easily find it later in your Playbook.
        </p>
      </div>
    </Modal>
  );
};