
import React, { useState, useEffect } from 'react';
import { LOL_ROLES } from '../constants';
import { UserPreferencesPayload } from '../types';
import { Cog6ToothIcon, ConfirmIcon } from './icons/index';
import { Modal } from './Modal';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreferences: UserPreferencesPayload;
  onSavePreferences: (newPreferences: UserPreferencesPayload) => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
  currentPreferences,
  onSavePreferences,
}) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [championPoolInputs, setChampionPoolInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setSelectedRoles(currentPreferences.preferredRoles || []);
      const initialPoolInputs: Record<string, string> = {};
      LOL_ROLES.forEach(role => {
        initialPoolInputs[role] = (currentPreferences.championPool?.[role] || []).join(', ');
      });
      setChampionPoolInputs(initialPoolInputs);
    }
  }, [isOpen, currentPreferences]);

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleChampionPoolInputChange = (role: string, value: string) => {
    setChampionPoolInputs(prev => ({ ...prev, [role]: value }));
  };

  const handleSave = () => {
    const newChampionPool: { [role: string]: string[] } = {};
    LOL_ROLES.forEach(role => {
      newChampionPool[role] = championPoolInputs[role]
        ? championPoolInputs[role].split(',').map(p => p.trim()).filter(p => p.length > 0)
        : [];
    });

    onSavePreferences({
      preferredRoles: selectedRoles,
      championPool: newChampionPool,
    });
    onClose();
  };

  if (!isOpen) return null;

  const footer = (
    <>
      <button
        onClick={onClose}
        className="lol-button lol-button-secondary px-5 py-2 text-sm"
      >
        Cancel
      </button>
      <button
        onClick={handleSave}
        className="lol-button lol-button-primary px-5 py-2 text-sm flex items-center"
      >
        <ConfirmIcon className="w-4 h-4 mr-1.5" />
        Save Preferences
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Draft Preferences"
      titleIcon={<Cog6ToothIcon className="w-6 h-6 text-sky-400" />}
      size="lg"
      footerContent={footer}
      modalId="preferences-modal"
      titleId="preferences-modal-title"
    >
      <div className="p-4 sm:p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            My Preferred Roles:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LOL_ROLES.map(role => (
              <button
                key={role}
                onClick={() => handleRoleToggle(role)}
                className={`p-2.5 rounded-xl text-sm font-medium transition-all duration-150 border-2
                  ${selectedRoles.includes(role)
                    ? 'bg-sky-600 border-sky-500 text-white shadow-md'
                    : 'bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-300'
                  }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-300 mb-1">
            My Champion Pool (Comfort Picks by Role, comma-separated):
          </h3>
          {LOL_ROLES.map(role => (
            <div key={role}>
              <label htmlFor={`championPool-${role}`} className="block text-xs font-medium text-sky-400 mb-1">
                {role}:
              </label>
              <textarea
                id={`championPool-${role}`}
                value={championPoolInputs[role] || ''}
                onChange={e => handleChampionPoolInputChange(role, e.target.value)}
                placeholder={`e.g., Champion1, Champion2`}
                className="w-full lol-input h-16 resize-y text-sm"
                rows={2}
              />
            </div>
          ))}
           <p className="text-xs text-slate-500 mt-1">
              The AI will heavily consider champions from your pool for the respective roles if they are strategically sound.
            </p>
        </div>
      </div>
    </Modal>
  );
};