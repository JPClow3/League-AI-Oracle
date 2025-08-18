import React from 'react';
import { Modal } from '../common/Modal';
import { useSettings } from '../../hooks/useSettings';
import type { Theme } from '../../types';
import { ROLES, CHAMPIONS_LITE } from '../../constants';
import { Button } from '../common/Button';

const THEME_OPTIONS: { name: Theme, label: string; color: string }[] = [
    { name: 'cyan', label: 'Default Cyan', color: 'bg-cyan-500' },
    { name: 'crimson', label: 'Noxian Crimson', color: 'bg-pink-600' },
    { name: 'gold', label: 'Piltover Gold', color: 'bg-yellow-600' },
    { name: 'teal', label: 'Isles Teal', color: 'bg-teal-600' },
];

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { settings, setSettings } = useSettings();

    const handleFavoriteToggle = (championId: string) => {
        const isFavorite = settings.favoriteChampions.includes(championId);
        const newFavorites = isFavorite
            ? settings.favoriteChampions.filter(id => id !== championId)
            : [...settings.favoriteChampions, championId];
        setSettings({ favoriteChampions: newFavorites });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="User Preferences">
            <div className="p-4 space-y-6">
                {/* Theme Selection */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-white">Theme</h3>
                    <div className="flex flex-wrap gap-4">
                        {THEME_OPTIONS.map(opt => (
                            <button
                                key={opt.name}
                                onClick={() => setSettings({ theme: opt.name })}
                                className={`flex items-center gap-3 p-2 rounded-lg border-2 transition-colors ${
                                    settings.theme === opt.name ? 'border-[rgb(var(--color-accent-bg))]' : 'border-transparent hover:bg-slate-700'
                                }`}
                            >
                                <div className={`w-6 h-6 rounded-full ${opt.color}`}></div>
                                <span>{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Role Preferences */}
                <div className="space-y-2">
                     <h3 className="font-semibold text-lg text-white">Role Preferences</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="primary-role" className="block text-sm text-gray-300 mb-1">Primary Role</label>
                            <select
                                id="primary-role"
                                value={settings.primaryRole}
                                onChange={e => setSettings({ primaryRole: e.target.value })}
                                className="w-full bg-slate-700 p-2 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-opacity-75 focus:ring-[rgb(var(--color-accent-bg))]"
                            >
                                <option value="All">All</option>
                                {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                            </select>
                        </div>
                        <div>
                             <label htmlFor="secondary-role" className="block text-sm text-gray-300 mb-1">Secondary Role</label>
                             <select
                                id="secondary-role"
                                value={settings.secondaryRole}
                                onChange={e => setSettings({ secondaryRole: e.target.value })}
                                className="w-full bg-slate-700 p-2 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-opacity-75 focus:ring-[rgb(var(--color-accent-bg))]"
                            >
                                <option value="All">All</option>
                                {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                            </select>
                        </div>
                     </div>
                </div>
                
                {/* Audio Settings */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-white">Audio</h3>
                    <div className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg">
                        <label htmlFor="enable-sound-toggle" className="text-sm text-gray-300">Enable UI Sound Effects</label>
                        <button onClick={() => setSettings({ enableSound: !settings.enableSound })} id="enable-sound-toggle" role="switch" aria-checked={settings.enableSound} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 focus:ring-opacity-75 ${settings.enableSound ? 'bg-blue-600' : 'bg-slate-600'}`}>
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.enableSound ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>


                {/* Favorite Champions */}
                 <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-white">Favorite Champions</h3>
                    <p className="text-sm text-gray-300">Select your favorite champions to have them appear at the top of the Champion Grid.</p>
                    <div className="max-h-60 overflow-y-auto bg-slate-900/50 p-3 rounded-lg border border-slate-700 flex flex-wrap gap-2">
                        {CHAMPIONS_LITE.map(champ => (
                            <button
                                key={champ.id}
                                onClick={() => handleFavoriteToggle(champ.id)}
                                className={`p-1 rounded-lg transition-colors ${settings.favoriteChampions.includes(champ.id) ? 'bg-slate-700 ring-2 ring-[rgb(var(--color-accent-bg))]' : 'bg-slate-800'}`}
                                title={champ.name}
                            >
                                <img src={champ.image} alt={champ.name} className="w-12 h-12 rounded-md" />
                            </button>
                        ))}
                    </div>
                 </div>

                 <div className="flex justify-end pt-4 border-t border-slate-700">
                    <Button onClick={onClose}>Close</Button>
                 </div>
            </div>
        </Modal>
    );
};