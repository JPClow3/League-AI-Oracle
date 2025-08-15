import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useSettings } from '../../hooks/useSettings';
import { ROLES, CHAMPIONS_LITE } from '../../constants';
import type { ChampionLite, Settings } from '../../types';

interface OnboardingData {
    username: string;
    primaryRole: string;
    favoriteChampions: string[];
    skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
    goals: string[];
    avatar: string;
    theme: Settings['theme'];
}

interface ProfileSetupModalProps {
    isOpen: boolean;
    onComplete: (data: OnboardingData) => void;
}

const TOTAL_STEPS = 5;
const ONBOARDING_CHAMPS: ChampionLite[] = CHAMPIONS_LITE.filter(c => ['Ahri', 'Lux', 'Ashe', 'Garen', 'Master Yi', 'Alistar', 'Malphite', 'Jinx', 'Leona', 'Yasuo', 'Zed', 'Lee Sin', 'Vi', 'Caitlyn', 'Sett'].includes(c.name));
const GOALS = ['Improve Drafting', 'Master Compositions', 'Learn Meta Strategies'];
const THEME_OPTIONS: { name: Settings['theme'], label: string; color: string }[] = [
    { name: 'cyan', label: 'Default Cyan', color: 'bg-cyan-500' },
    { name: 'crimson', label: 'Noxian Crimson', color: 'bg-pink-600' },
    { name: 'gold', label: 'Piltover Gold', color: 'bg-yellow-600' },
    { name: 'teal', label: 'Isles Teal', color: 'bg-teal-600' },
];

const ProgressBar: React.FC<{ step: number; total: number }> = ({ step, total }) => (
    <div className="progress-bar">
        <div className="progress-bar-inner" style={{ width: `${(step / total) * 100}%` }}></div>
    </div>
);

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ isOpen, onComplete }) => {
    const { settings } = useSettings();
    const [step, setStep] = useState(1);
    
    // State for all onboarding data
    const [username, setUsername] = useState('');
    const [primaryRole, setPrimaryRole] = useState(settings.primaryRole || 'All');
    const [favoriteChampions, setFavoriteChampions] = useState<string[]>([]);
    const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
    const [goals, setGoals] = useState<string[]>([]);
    const [avatar, setAvatar] = useState('garen');
    const [theme, setTheme] = useState<Settings['theme']>(settings.theme);
    
    useEffect(() => {
        // When the primary role changes, reset favorite champions
        // to avoid keeping selections that are no longer visible.
        setFavoriteChampions([]);
    }, [primaryRole]);

    const handleNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS + 1));
    const handleBack = () => setStep(s => Math.max(s - 1, 1));
    
    const handleFavoriteToggle = (id: string) => {
        setFavoriteChampions(prev => {
            if (prev.includes(id)) return prev.filter(champId => champId !== id);
            if (prev.length < 3) return [...prev, id];
            return prev;
        });
    };

    const handleGoalToggle = (goal: string) => {
        setGoals(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]);
    };

    const handleComplete = () => {
        onComplete({
            username: username.trim() || 'Rookie',
            primaryRole,
            favoriteChampions,
            skillLevel,
            goals,
            avatar,
            theme
        });
    };

    const handleSkip = () => {
        onComplete({
            username: 'Rookie',
            primaryRole: 'All',
            favoriteChampions: [],
            skillLevel: 'Beginner',
            goals: [],
            avatar: 'garen',
            theme: settings.theme,
        });
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Welcome to DraftWise AI!</h3>
                        <p className="text-sm text-gray-400 mb-4">Let's set up your Strategist Profile. First, what should we call you?</p>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent-bg))]"
                            maxLength={16}
                        />
                    </div>
                );
            case 2:
                return (
                     <div>
                        <h3 className="text-xl font-semibold text-white mb-3">What's your primary role?</h3>
                        <p className="text-sm text-gray-400 mb-4">This helps us tailor suggestions for you.</p>
                        <div className="flex justify-center flex-wrap gap-4">
                            {['All', ...ROLES].map(role => (
                                <button
                                    key={role}
                                    onClick={() => setPrimaryRole(role)}
                                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all w-28 h-28 ${primaryRole === role ? 'bg-slate-700 border-blue-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
                                >
                                    <span className="font-semibold text-lg">{role}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 3: {
                const championsForRole = useMemo(() => {
                    if (primaryRole === 'All') {
                        return ONBOARDING_CHAMPS;
                    }
                    return CHAMPIONS_LITE.filter(c => c.roles.includes(primaryRole));
                }, [primaryRole]);

                return (
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-3">Choose up to 3 favorite champions.</h3>
                        <p className="text-sm text-gray-400 mb-4">This grants you starter Draft Mastery points for them.</p>
                        <div className="flex justify-center flex-wrap gap-3 max-h-[250px] overflow-y-auto p-2 bg-slate-900/50 rounded-lg">
                            {championsForRole.length > 0 ? championsForRole.map(champ => (
                                <button
                                    key={champ.id}
                                    onClick={() => handleFavoriteToggle(champ.id)}
                                    className={`p-1 rounded-lg transition-all ${favoriteChampions.includes(champ.id) ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-blue-500' : ''}`}
                                >
                                    <img src={champ.image} alt={champ.name} className="w-16 h-16 rounded-md" />
                                </button>
                            )) : (
                                <p className="text-gray-400 p-8">No champions found for this role in the starter list.</p>
                            )}
                        </div>
                    </div>
                );
            }
            case 4:
                return (
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-3">What are your goals?</h3>
                        <p className="text-sm text-gray-400 mb-4">Select your skill level and what you want to improve.</p>
                        <div className="space-y-3">
                            {(['Beginner', 'Intermediate', 'Advanced'] as const).map(level => (
                                <button key={level} onClick={() => setSkillLevel(level)} className={`w-full text-left p-4 rounded-lg border-2 transition-all ${skillLevel === level ? 'bg-slate-700 border-blue-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}>
                                    <p className="font-bold">{level}</p>
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-center flex-wrap gap-2 mt-4">
                            {GOALS.map(goal => (
                                <button key={goal} onClick={() => handleGoalToggle(goal)} className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${goals.includes(goal) ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}>
                                    {goal}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-3">Customize your look (Optional)</h3>
                        <p className="text-sm text-gray-400 mb-4">Choose a profile avatar and UI theme.</p>
                         <div className="flex justify-center flex-wrap gap-3 mb-6">
                            {ONBOARDING_CHAMPS.slice(0, 10).map(champ => (
                                <button key={champ.id} onClick={() => setAvatar(champ.id)} className={`p-1 rounded-full transition-all ${avatar === champ.id ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-blue-500' : ''}`}>
                                    <img src={champ.image} alt={champ.name} className="w-16 h-16 rounded-full" />
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-center flex-wrap gap-3">
                            {THEME_OPTIONS.map(opt => (
                                <button key={opt.name} onClick={() => setTheme(opt.name)} className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-colors ${theme === opt.name ? `border-` + opt.color.replace('bg-','') : 'border-transparent hover:bg-slate-700'}`}>
                                    <div className={`w-5 h-5 rounded-full ${opt.color}`}></div>
                                    <span className="text-xs">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="text-center">
                         <h3 className="text-2xl font-bold text-white mb-3">Welcome, {username || 'Rookie'}!</h3>
                         <p className="text-gray-300">Your profile is set up and you've been awarded your first <strong className="text-yellow-300">250 SP</strong> and the <strong className="text-cyan-300">Rookie Strategist</strong> badge!</p>
                         <p className="mt-4 text-gray-400">You're ready to master the draft. We'll start with a quick tour of the Draft Lab.</p>
                    </div>
                );
            default: return null;
        }
    };
    
    const isNextDisabled = step === 1 && !username.trim();

    return (
        <Modal isOpen={isOpen} onClose={handleSkip} title="Welcome to DraftWise AI!">
            <div className="p-6 text-center space-y-6">
                <div className="min-h-[300px] flex items-center justify-center">
                     {renderStepContent()}
                </div>

                <div className="space-y-4">
                    <ProgressBar step={step} total={TOTAL_STEPS + 1} />
                    <div className="flex justify-between items-center">
                        <Button variant="secondary" onClick={handleBack} disabled={step <= 1}>Back</Button>
                        {step <= TOTAL_STEPS && <Button variant="primary" onClick={handleNext} disabled={isNextDisabled}>Next</Button>}
                        {step > TOTAL_STEPS && <Button variant="primary-glow" className="px-6 py-3" onClick={handleComplete}>Start Your Journey</Button>}
                    </div>
                </div>
            </div>
        </Modal>
    );
};