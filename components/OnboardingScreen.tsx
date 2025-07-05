import React, { useState, useMemo } from 'react';
import { Champion, DDragonData, Role } from '../types';
import { useProfile } from '../contexts/ProfileContext';
import { ChampionIcon } from './common/ChampionIcon';
import { useDebounce } from '../hooks/useDebounce';
import { Icon } from './common/Icon';

interface OnboardingScreenProps {
  ddragonData: DDragonData;
}

const ROLES: Role[] = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'SUPPORT'];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ ddragonData }) => {
  const { activeProfile, updateSettings, markOnboardingComplete } = useProfile();
  const [step, setStep] = useState(1);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [selectedChampions, setSelectedChampions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 250);

  const allChampions = useMemo(() => Object.values(ddragonData.champions).sort((a, b) => a.name.localeCompare(b.name)), [ddragonData]);

  const toggleRole = (role: Role) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const toggleChampion = (championId: string) => {
    setSelectedChampions(prev =>
      prev.includes(championId)
        ? prev.filter(id => id !== championId)
        : [...prev, championId]
    );
  };
  
  const filteredChampions = useMemo(() => allChampions.filter(c => c.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())), [allChampions, debouncedSearchTerm]);

  const handleFinish = () => {
    updateSettings({
      preferredRoles: selectedRoles,
      championPool: selectedChampions,
    });
    markOnboardingComplete();
  };
  
  const handleSkip = () => {
      markOnboardingComplete();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center animate-fade-in">
            <h2 className="text-4xl font-display text-white mb-2">What are your preferred roles?</h2>
            <p className="text-slate-400 mb-8">Select 1 or more. This helps the AI tailor suggestions for you.</p>
            <div className="flex justify-center gap-4 flex-wrap">
              {ROLES.map(role => (
                <button
                  key={role}
                  onClick={() => toggleRole(role)}
                  className={`px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 w-48
                    ${selectedRoles.includes(role)
                      ? 'bg-indigo-600 text-white ring-2 ring-offset-2 ring-offset-slate-900 ring-indigo-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  {role}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              className="mt-12 px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 transition-colors"
            >
              Next
            </button>
          </div>
        );
      case 2:
        return (
          <div className="w-full animate-fade-in">
            <h2 className="text-4xl font-display text-white mb-2 text-center">Who are your favorite champions?</h2>
            <p className="text-slate-400 mb-6 text-center">Select a few to populate your initial champion pool.</p>
            <input
                type="text"
                placeholder="Search champions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 mb-4 rounded bg-slate-900/50 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-white"
            />
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-9 gap-4 max-h-80 overflow-y-auto pr-2">
                {filteredChampions.map(champ => (
                    <div key={champ.id} className="relative aspect-square">
                        <ChampionIcon
                            champion={champ}
                            version={ddragonData.version}
                            onClick={() => toggleChampion(champ.id)}
                            className="w-full h-full transition-all duration-200"
                        />
                        {selectedChampions.includes(champ.id) && (
                            <div className="absolute inset-0 bg-indigo-600/70 ring-2 ring-indigo-400 rounded-md flex items-center justify-center text-white text-3xl pointer-events-none">
                                <Icon name="check" className="w-8 h-8"/>
                            </div>
                        )}
                    </div>
                ))}
            </div>
             <button
              onClick={handleFinish}
              className="mt-8 px-8 py-3 w-full bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-500 transition-colors"
            >
              Finish Setup & Start Drafting
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-6xl font-display font-bold text-white mb-4">
          Welcome, {activeProfile?.name}!
        </h1>
        <p className="text-2xl text-slate-300 mb-10">Let's quickly set up your profile.</p>

        <div className="glass-effect p-8 rounded-xl">
          {renderStep()}
        </div>
        <button onClick={handleSkip} className="mt-6 text-sm text-slate-500 hover:text-slate-400 hover:underline">
          {step === 1 ? "Skip for now" : "Skip and finish later"}
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen;