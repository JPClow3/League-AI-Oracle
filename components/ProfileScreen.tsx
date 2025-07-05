import React, { useMemo } from 'react';
import { useProfile } from '../contexts/ProfileContext';
import { Champion, DDragonData, Role, View } from '../types';
import { ChampionIcon } from './common/ChampionIcon';
import { Icon } from './common/Icon';

interface ProfileScreenProps {
  ddragonData: DDragonData;
  setView: (view: View) => void;
}

const ROLES: Role[] = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'SUPPORT'];

const ProfileScreen: React.FC<ProfileScreenProps> = ({ ddragonData, setView }) => {
  const { activeProfile, updateSettings } = useProfile();

  if (!activeProfile) return null;

  const { name, avatar, settings } = activeProfile;
  const { xp, preferredRoles, championPool, oraclePersonality, completedLessons, completedTrials } = settings;

  const level = Math.floor(xp / 100) + 1;
  const currentLevelXp = xp % 100;
  const xpToNextLevel = 100;
  const progress = (currentLevelXp / xpToNextLevel) * 100;

  const championPoolChampions = useMemo(() => {
    return championPool.map(id => 
        Object.values(ddragonData.champions).find(c => c.id === id)
    ).filter((c): c is Champion => c !== undefined);
  }, [championPool, ddragonData.champions]);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
        <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white dark:bg-slate-800/80 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 mb-8">
            <div className="text-8xl p-4 bg-slate-200 dark:bg-slate-700 rounded-full">
                {avatar}
            </div>
            <div className="flex-1 text-center md:text-left">
                <h1 className="text-5xl font-display font-bold text-slate-800 dark:text-slate-100">{name}</h1>
                <p className="text-lg text-indigo-600 dark:text-indigo-400 font-semibold">Commander Profile</p>
                <div className="mt-4">
                    <div className="flex justify-between items-center text-sm font-semibold mb-1">
                        <span className="text-slate-600 dark:text-slate-300">Level {level}</span>
                        <span className="text-slate-500 dark:text-slate-400">{currentLevelXp} / {xpToNextLevel} XP</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Champion Pool */}
            <div className="lg:col-span-2 space-y-8">
                <div className="p-6 bg-white dark:bg-slate-800/80 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="text-3xl font-display text-slate-800 dark:text-slate-100 mb-4">Champion Pool ({championPool.length})</h2>
                    {championPoolChampions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {championPoolChampions.map(champ => (
                                <ChampionIcon
                                    key={champ.id}
                                    champion={champ}
                                    version={ddragonData.version}
                                    className="w-16 h-16"
                                    isClickable={false}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 dark:text-slate-400">Your champion pool is empty. Right-click on champions in the Draft Lab or other areas to add them.</p>
                    )}
                </div>

                 <div className="p-6 bg-white dark:bg-slate-800/80 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="text-3xl font-display text-slate-800 dark:text-slate-100 mb-4">Progress</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                           <Icon name="lessons" className="w-8 h-8 text-indigo-500"/>
                           <div>
                             <p className="text-2xl font-bold">{completedLessons.length}</p>
                             <p className="text-sm text-slate-500 dark:text-slate-400">Lessons Read</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                           <Icon name="trials" className="w-8 h-8 text-teal-500"/>
                           <div>
                             <p className="text-2xl font-bold">{completedTrials.length}</p>
                             <p className="text-sm text-slate-500 dark:text-slate-400">Trials Mastered</p>
                           </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column - Settings */}
            <div className="p-6 bg-white dark:bg-slate-800/80 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-6">
                 <h2 className="text-3xl font-display text-slate-800 dark:text-slate-100">Settings</h2>
                 <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Preferred Roles</label>
                     <div className="flex flex-wrap gap-2">
                         {ROLES.map(role => (
                            <button
                                key={role}
                                onClick={() => updateSettings({ preferredRoles: preferredRoles.includes(role) ? preferredRoles.filter(r => r !== role) : [...preferredRoles, role] })}
                                className={`px-4 py-2 text-sm rounded-md font-semibold transition-colors ${preferredRoles.includes(role) ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                            >
                                {role}
                            </button>
                         ))}
                     </div>
                 </div>
                 <div>
                    <label htmlFor="oracle-personality" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Oracle's Personality</label>
                    <select
                        id="oracle-personality"
                        value={oraclePersonality}
                        onChange={e => updateSettings({ oraclePersonality: e.target.value as any })}
                        className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500"
                    >
                        <option>Default</option>
                        <option>Concise</option>
                        <option>For Beginners</option>
                    </select>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default ProfileScreen;