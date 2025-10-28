import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useSettings } from '../../hooks/useSettings';
import { ROLES } from '../../constants';
import { AnimatePresence, motion } from 'framer-motion';
import { useChampions } from '../../contexts/ChampionContext';
import { Users, Shield, Sprout, Zap, Crosshair, Heart } from 'lucide-react';

interface OnboardingData {
    username: string;
    primaryRole: string;
    favoriteChampions: string[];
    skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
    goals: string[];
    avatar: string;
}

interface ProfileSetupModalProps {
    isOpen: boolean;
    onComplete: (data: OnboardingData) => void;
}

const TOTAL_STEPS = 5;
const GOALS = ['Improve Drafting', 'Master Compositions', 'Learn Meta Strategies'];

const ROLE_ICONS: { [key: string]: React.ReactNode } = {
    All: <Users size={32} />,
    Top: <Shield size={32} />,
    Jungle: <Sprout size={32} />,
    Mid: <Zap size={32} />,
    ADC: <Crosshair size={32} />,
    Support: <Heart size={32} />,
};

const ProgressBar = ({ step, total }: { step: number; total: number }) => (
    <div className="w-full bg-surface-inset h-2.5">
        <motion.div
            className="bg-gradient-to-r from-gold to-gold-bright h-2.5"
            {...{
                initial: { width: 0 },
                animate: { width: `${((step - 1) / total) * 100}%` },
                transition: { duration: 0.5, ease: "easeInOut" },
            }}
        />
    </div>
);

export const ProfileSetupModal = ({ isOpen, onComplete }: ProfileSetupModalProps) => {
    const { settings } = useSettings();
    const { championsLite } = useChampions();
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(0);
    
    // State for all onboarding data
    const [username, setUsername] = useState('');
    const [primaryRole, setPrimaryRole] = useState(settings.primaryRole || 'All');
    const [favoriteChampions, setFavoriteChampions] = useState<string[]>([]);
    const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
    const [goals, setGoals] = useState<string[]>([]);
    const [avatar, setAvatar] = useState('Garen');
    const [champSearch, setChampSearch] = useState('');
    
    const resetState = useCallback(() => {
        setStep(1);
        setDirection(0);
        setUsername('');
        setPrimaryRole(settings.primaryRole || 'All');
        setFavoriteChampions([]);
        setSkillLevel('Beginner');
        setGoals([]);
        setAvatar('Garen');
        setChampSearch('');
    }, [settings.primaryRole]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => resetState(), 0);
        }
    }, [isOpen, resetState]);

    const nextStep = () => {
        setDirection(1);
        setStep(s => Math.min(s + 1, TOTAL_STEPS));
    };

    const prevStep = () => {
        setDirection(-1);
        setStep(s => Math.max(s - 1, 1));
    };
    
    const handleComplete = () => {
        onComplete({
            username,
            primaryRole,
            favoriteChampions,
            skillLevel,
            goals,
            avatar,
        });
    };

    const toggleFavorite = (id: string) => {
        setFavoriteChampions(prev =>
            prev.includes(id) ? prev.filter(champId => champId !== id) : [...prev, id]
        );
        if (favoriteChampions.length === 0) {
            setAvatar(id);
        }
    };
    
    const toggleGoal = (goal: string) => {
        setGoals(prev =>
            prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
        );
    };

    const isNextDisabled = (): boolean => {
        switch (step) {
            case 1: return !username.trim();
            case 2: return false; // Optional
            case 3: return false; // Optional
            case 4: return goals.length === 0;
            case 5: return !avatar;
            default: return true;
        }
    };

    const filteredChamps = useMemo(() =>
        championsLite.filter(c => c.name.toLowerCase().includes(champSearch.toLowerCase())),
        [championsLite, champSearch]
    );

    const variants = {
        enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (direction: number) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0 }),
    };

    return (
        <Modal isOpen={isOpen} onClose={() => {}} title="Welcome to DraftWise AI!" size="3xl">
            <div className="flex flex-col h-[70vh]">
                <ProgressBar step={step} total={TOTAL_STEPS} />
                <div className="flex-grow p-6 overflow-y-auto relative">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={step}
                            {...{
                                custom: direction,
                                variants: variants,
                                initial: "enter",
                                animate: "center",
                                exit: "exit",
                                transition: { type: "tween", ease: "easeInOut", duration: 0.3 },
                            }}
                        >
                            {step === 1 && (
                                <div>
                                    <h2 className="text-2xl font-bold text-center mb-2">Let's Get Started!</h2>
                                    <p className="text-text-secondary text-center mb-6">First, what should we call you?</p>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        placeholder="Your username"
                                        className="w-full max-w-sm mx-auto block px-4 py-3 bg-surface border border-border rounded-lg text-lg text-center focus:outline-none focus:ring-2 focus:ring-accent"
                                        autoFocus
                                    />
                                </div>
                            )}
                            {step === 2 && (
                                <div>
                                    <h2 className="text-2xl font-bold text-center mb-2">What's Your Primary Role?</h2>
                                    <p className="text-text-secondary text-center mb-6">This helps us tailor suggestions, but you can always change it later.</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {['All', ...ROLES].map(role => (
                                            <button
                                                key={role}
                                                onClick={() => setPrimaryRole(role)}
                                                className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${primaryRole === role ? 'bg-accent/10 border-accent' : 'bg-surface hover:border-border'}`}
                                            >
                                                {ROLE_ICONS[role]}
                                                <span className="font-semibold">{role}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                             {step === 3 && (
                                <div>
                                    <h2 className="text-2xl font-bold text-center mb-2">Any Favorite Champions?</h2>
                                    <p className="text-text-secondary text-center mb-4">Select a few of your favorites to get a head start on mastery. This is optional!</p>
                                    <input
                                        type="text"
                                        value={champSearch}
                                        onChange={e => setChampSearch(e.target.value)}
                                        placeholder="Search champions..."
                                        className="w-full mb-4 px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                                    />
                                    <div className="max-h-60 overflow-y-auto flex flex-wrap gap-2 p-2 bg-surface-inset border border-border">
                                        {filteredChamps.map(champ => (
                                            <button key={champ.id} onClick={() => toggleFavorite(champ.id)} className={`p-1 rounded-lg ${favoriteChampions.includes(champ.id) ? 'ring-2 ring-accent' : ''}`}>
                                                <img src={champ.image} alt={champ.name} className="w-12 h-12 rounded-md" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                             {step === 4 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-center mb-4">What's Your Skill Level?</h2>
                                        <div className="flex flex-col gap-3">
                                            {(['Beginner', 'Intermediate', 'Advanced'] as const).map(level => (
                                                <button key={level} onClick={() => setSkillLevel(level)} className={`p-3 border rounded-lg text-left ${skillLevel === level ? 'bg-accent/10 border-accent' : 'bg-surface hover:border-border'}`}>
                                                    <span className="font-semibold">{level}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-center mb-4">What Are Your Goals?</h2>
                                        <div className="flex flex-col gap-3">
                                            {GOALS.map(goal => (
                                                <button key={goal} onClick={() => toggleGoal(goal)} className={`p-3 border rounded-lg text-left flex items-center gap-3 ${goals.includes(goal) ? 'bg-accent/10 border-accent' : 'bg-surface hover:border-border'}`}>
                                                    <div className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center ${goals.includes(goal) ? 'bg-accent border-accent' : 'border-border'}`}>
                                                        {goals.includes(goal) && <motion.div {...{ initial: { scale: 0 }, animate: { scale: 1 } }} className="w-3 h-3 bg-on-accent rounded-sm" />}
                                                    </div>
                                                    <span className="font-semibold">{goal}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {step === 5 && (
                                <div>
                                    <h2 className="text-2xl font-bold text-center mb-2">Choose Your Avatar</h2>
                                    <p className="text-text-secondary text-center mb-4">This will represent you on your profile. Click to select.</p>
                                    <div className="max-h-80 overflow-y-auto flex flex-wrap gap-2 p-2 bg-surface-inset border border-border">
                                        {championsLite.map(champ => (
                                            <button key={champ.id} onClick={() => setAvatar(champ.id)} className={`p-1 rounded-lg ${avatar === champ.id ? 'ring-2 ring-accent' : ''}`}>
                                                <img src={champ.image} alt={champ.name} className="w-16 h-16 rounded-md" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
                <div className="p-4 border-t border-border flex justify-between items-center flex-shrink-0">
                    <div>
                        <span className="text-sm text-text-muted">Step {step} of {TOTAL_STEPS}</span>
                    </div>
                    <div className="flex gap-2">
                        {step > 1 && <Button variant="secondary" onClick={prevStep}>Back</Button>}
                        {step < TOTAL_STEPS && <Button variant="primary" onClick={nextStep} disabled={isNextDisabled()}>Next</Button>}
                        {step === TOTAL_STEPS && <Button variant="primary" onClick={handleComplete} disabled={isNextDisabled()}>Finish Setup</Button>}
                    </div>
                </div>
            </div>
        </Modal>
    );
};