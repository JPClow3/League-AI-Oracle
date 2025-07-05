import React, { useState } from 'react';

interface AddOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (outcome: 'WIN' | 'LOSS', notes: string) => void;
}

const AddOutcomeModal: React.FC<AddOutcomeModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [outcome, setOutcome] = useState<'WIN' | 'LOSS' | null>(null);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (outcome) {
      onSubmit(outcome, notes);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="glass-effect rounded-lg shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-display mb-4 text-slate-800 dark:text-slate-200">Add Game Outcome</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Outcome</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setOutcome('WIN')}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${outcome === 'WIN' ? 'bg-teal-600 text-white ring-2 ring-offset-2 ring-offset-slate-800 ring-teal-400' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
              >
                WIN
              </button>
              <button
                onClick={() => setOutcome('LOSS')}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${outcome === 'LOSS' ? 'bg-rose-600 dark:bg-rose-500 text-white ring-2 ring-offset-2 ring-offset-slate-800 ring-rose-500' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
              >
                LOSS
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Post-Game Notes (Optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              placeholder="e.g., 'Our bot lane got camped early and we couldn't recover tempo. The enemy jungler was a huge problem.'"
              className="w-full p-2 rounded bg-slate-100/50 dark:bg-slate-900/50 border border-slate-300/50 dark:border-slate-600/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-md bg-slate-500 text-white hover:bg-slate-600 transition-colors duration-200">Cancel</button>
            <button onClick={handleSubmit} disabled={!outcome} className="px-4 py-2 rounded-md bg-primary-gradient text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOutcomeModal;