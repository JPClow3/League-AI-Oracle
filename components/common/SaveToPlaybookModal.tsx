import React, { useState } from 'react';

interface SaveToPlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  isLoading: boolean;
}

const SaveToPlaybookModal: React.FC<SaveToPlaybookModalProps> = ({ isOpen, onClose, onSave, isLoading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), description.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="glass-effect rounded-lg shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-display mb-4 text-slate-800 dark:text-slate-200">Save to Playbook</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="playbookName" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Strategy Name</label>
            <input
              id="playbookName"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., 'Poke & Protect Comp'"
              className="w-full p-2 rounded bg-slate-100/50 dark:bg-slate-900/50 border border-slate-300/50 dark:border-slate-600/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="playbookDesc" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Description (Optional)</label>
            <textarea
              id="playbookDesc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="e.g., 'Strong against low-range teams. Protect Jinx at all costs.'"
              className="w-full p-2 rounded bg-slate-100/50 dark:bg-slate-900/50 border border-slate-300/50 dark:border-slate-600/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-md bg-slate-500 text-white hover:bg-slate-600 transition-colors duration-200">Cancel</button>
            <button onClick={handleSave} disabled={!name.trim() || isLoading} className="px-4 py-2 rounded-md bg-primary-gradient text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
                {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveToPlaybookModal;