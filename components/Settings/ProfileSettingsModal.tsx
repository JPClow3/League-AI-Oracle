import { Modal } from '../common/Modal';
import { useSettings } from '../../hooks/useSettings';
import { ROLES } from '../../constants';
import { Button } from '../common/Button';
import { useModals } from '../../hooks/useModals';
import { useChampions } from '../../contexts/ChampionContext';
import type { DashboardCardSetting } from '../../types';


export const ProfileSettingsModal = () => {
    const { settings, setSettings } = useSettings();
    const { modals, dispatch } = useModals();
    const { championsLite } = useChampions();

    const handleFavoriteToggle = (championId: string) => {
        const isFavorite = settings.favoriteChampions.includes(championId);
        const newFavorites = isFavorite
            ? settings.favoriteChampions.filter(id => id !== championId)
            : [...settings.favoriteChampions, championId];
        setSettings({ favoriteChampions: newFavorites });
    };

    const handleDashboardCardToggle = (cardId: DashboardCardSetting['id']) => {
        const newDashboardCards = settings.dashboardCards.map(card =>
            card.id === cardId ? { ...card, enabled: !card.enabled } : card
        );
        setSettings({ dashboardCards: newDashboardCards });
    };

    const onClose = () => dispatch({ type: 'CLOSE', payload: 'profileSettings' });

    return (
        <Modal isOpen={modals.profileSettings} onClose={onClose} title="Profile & Gameplay Preferences">
            <div className="p-4 space-y-6">
                {/* Role Preferences */}
                <div className="space-y-2">
                     <h3 className="font-semibold text-lg text-text-primary">Role Preferences</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="primary-role" className="block text-sm text-text-muted mb-1">Primary Role</label>
                            <select
                                id="primary-role"
                                value={settings.primaryRole}
                                onChange={e => setSettings({ primaryRole: e.target.value })}
                                className="w-full bg-surface-secondary p-2 rounded-md border border-border-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                                <option value="All">All</option>
                                {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                            </select>
                        </div>
                        <div>
                             <label htmlFor="secondary-role" className="block text-sm text-text-muted mb-1">Secondary Role</label>
                             <select
                                id="secondary-role"
                                value={settings.secondaryRole}
                                onChange={e => setSettings({ secondaryRole: e.target.value })}
                                className="w-full bg-surface-secondary p-2 rounded-md border border-border-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                                <option value="All">All</option>
                                {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                            </select>
                        </div>
                     </div>
                </div>

                {/* Dashboard Settings */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-text-primary">Dashboard Cards</h3>
                    <p className="text-sm text-text-muted">Choose which cards appear on your Home dashboard.</p>
                    <div className="space-y-2">
                        {settings.dashboardCards.map(card => (
                            <div key={card.id} className="flex items-center justify-between bg-surface-secondary p-3 rounded-lg">
                                <label htmlFor={`${card.id}-toggle`} className="text-sm text-text-muted capitalize">{card.id.replace('-', ' ')}</label>
                                <button onClick={() => handleDashboardCardToggle(card.id)} id={`${card.id}-toggle`} role="switch" aria-checked={card.enabled} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-secondary focus:ring-accent ${card.enabled ? 'bg-accent' : 'bg-border-secondary'}`}>
                                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${card.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Audio Settings */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-text-primary">Audio</h3>
                    <div className="flex items-center justify-between bg-surface-secondary p-3 rounded-lg">
                        <label htmlFor="enable-sound-toggle" className="text-sm text-text-muted">Enable UI Sound Effects</label>
                        <button onClick={() => setSettings({ enableSound: !settings.enableSound })} id="enable-sound-toggle" role="switch" aria-checked={settings.enableSound} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-secondary focus:ring-accent ${settings.enableSound ? 'bg-accent' : 'bg-border-secondary'}`}>
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.enableSound ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                {/* Favorite Champions */}
                 <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-text-primary">Favorite Champions</h3>
                    <p className="text-sm text-text-muted">Select your favorite champions to have them appear at the top of the Champion Grid.</p>
                    <div className="max-h-60 overflow-y-auto bg-surface-secondary p-3 rounded-lg border border-border-secondary flex flex-wrap gap-2">
                        {championsLite.map(champ => (
                            <button
                                key={champ.id}
                                onClick={() => handleFavoriteToggle(champ.id)}
                                className={`p-1 rounded-lg transition-colors ${settings.favoriteChampions.includes(champ.id) ? 'bg-surface ring-2 ring-accent' : 'bg-surface'}`}
                                title={champ.name}
                            >
                                <img src={champ.image} alt={champ.name} className="w-12 h-12 rounded-md" />
                            </button>
                        ))}
                    </div>
                 </div>

                 <div className="flex justify-end pt-4 border-t border-border-secondary">
                    <Button onClick={onClose} variant="secondary">Close</Button>
                 </div>
            </div>
        </Modal>
    );
};