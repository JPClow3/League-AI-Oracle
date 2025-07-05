
import React, { useState } from 'react';
import { useProfile } from '../contexts/ProfileContext';
import { Icon } from './common/Icon';

const AVATARS = ['🤖', '👽', '🎓', '👾', '🚀', '🌟', '🎯', '💡', '🏆', '🧠', '🧑‍🚀', '🕵️'];

const ProfileSelectionScreen: React.FC = () => {
  const { profiles, createProfile, setActiveProfileId, deleteProfile } = useProfile();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

  const profileList = Object.values(profiles);

  const handleCreate = () => {
    if (newName.trim()) {
      createProfile(newName.trim(), selectedAvatar);
      setNewName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-900 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-display font-bold text-white">DraftWise AI</h1>
        <p className="text-2xl text-slate-400 mt-2">Select your Commander Profile</p>
      </div>

      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {profileList.map((profile, index) => (
            <div key={profile.id} className="relative group animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <div
                    onClick={() => setActiveProfileId(profile.id)}
                    className="flex flex-col items-center justify-center p-6 bg-slate-800 rounded-lg shadow-lg border-2 border-slate-700 hover:border-indigo-500 hover:bg-slate-700/50 transition-all duration-200 cursor-pointer aspect-square transform hover:scale-105"
                >
                    <div className="text-7xl mb-4 transition-transform group-hover:scale-110">{profile.avatar}</div>
                    <h2 className="text-2xl font-semibold text-white truncate">{profile.name}</h2>
                    <p className="text-sm text-slate-400">Level {Math.floor((profile.settings.xp || 0) / 100) + 1}</p>
                </div>
                 <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteProfile(profile.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-rose-900/50 text-rose-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-rose-500 hover:text-white"
                    title={`Delete ${profile.name}`}
                    aria-label={`Delete profile ${profile.name}`}
                >
                    <Icon name="delete" className="h-4 w-4" />
                </button>
            </div>
          ))}
          <div
            onClick={() => setIsCreating(true)}
            className="flex flex-col items-center justify-center p-6 bg-slate-800/50 rounded-lg shadow-lg border-2 border-dashed border-slate-600 hover:border-indigo-500 hover:bg-slate-800 transition-all duration-200 cursor-pointer aspect-square transform hover:scale-105 animate-fade-in"
            style={{ animationDelay: `${profileList.length * 50}ms`}}
          >
            <div className="text-7xl mb-4 text-slate-500">+</div>
            <h2 className="text-2xl font-semibold text-slate-400">New Profile</h2>
          </div>
        </div>
      </div>
      
      {isCreating && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={() => setIsCreating(false)}>
            <div className="glass-effect p-8 rounded-xl shadow-2xl w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
                <h3 className="text-3xl font-display text-white mb-6">Create New Profile</h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Avatar</label>
                        <div className="flex flex-wrap gap-2">
                            {AVATARS.map(avatar => (
                                <button key={avatar} onClick={() => setSelectedAvatar(avatar)} className={`p-2 text-3xl rounded-lg transition-all duration-200 ${selectedAvatar === avatar ? 'bg-indigo-600 ring-2 ring-indigo-400 scale-110' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                    {avatar}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="profileName" className="block text-sm font-medium text-slate-300 mb-2">Profile Name</label>
                        <input
                            type="text"
                            id="profileName"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Enter Commander name..."
                            className="w-full p-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            autoFocus
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={() => setIsCreating(false)} className="px-6 py-2 rounded-md text-white bg-slate-600 hover:bg-slate-500 transition-colors duration-200">Cancel</button>
                    <button onClick={handleCreate} disabled={!newName.trim()} className="px-6 py-2 rounded-md bg-primary-gradient text-white font-semibold transition-colors duration-200 disabled:opacity-50">Create</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default ProfileSelectionScreen;