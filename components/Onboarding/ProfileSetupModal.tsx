import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useSettings } from '../../hooks/useSettings';
import { ROLES } from '../../constants';
import type { ChampionLite, Settings } from '../../types';
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
            initial={{ width: 0 }}
            animate={{ width: `${((step - 1) / total) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
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
            resetState();
        }
    }, [isOpen, resetState]);

    useEffect(() => {
        // Clear favorite champions when role changes to avoid irrelevant selections.
        setFavoriteChampions([]);
    }, [primaryRole]);

    const paginate = (newDirection: number) => {
        setDirection(newDirection);
        setStep(step + newDirection);
    };

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
        });
    };

    const handleSkip = () => {
        onComplete({
            username: 'Rookie',
            primaryRole: 'All',
            favoriteChampions: [],
            skillLevel: 'Beginner',
            goals: [],
            avatar: 'Garen',
        });
    };
    
    const isNextDisabled = step === 1 && !username.trim();
    
    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 100 : -100,
            opacity: 0,
        }),
    };
    
    const filteredChampions = useMemo(() => {
        let champs = primaryRole === 'All' ? championsLite : championsLite.filter(c => c.roles.includes(primaryRole));
        if (champSearch) {
            champs = champs.filter(c => c.name.toLowerCase().includes(champSearch.toLowerCase()));
        }
        return champs;
    }, [primaryRole, championsLite, champSearch]);

    return (
        <Modal isOpen={isOpen} onClose={handleSkip} title="Strategist Profile Setup">
            <div className="p-4 sm:p-6 bg-secondary relative overflow-hidden">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(0, 194, 255, 0.05), transparent 30%), radial-gradient(circle at 75% 75%, rgba(200, 155, 60, 0.05), transparent 30%)' }}></div>
                <div className="relative z-10 space-y-6">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div
                            {...{
                                key: step,
                                custom: direction,
                                variants: variants,
                                initial: "enter",
                                animate: "center",
                                exit: "exit",
                                transition: {
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 }
                                },
                            }}
                            className="min-h-[350px] flex flex-col justify-center"
                        >
                            {step === 1 && (
                                <div className="text-center">
                                    <h3 className="text-2xl font-semibold text-text-primary mb-2">Welcome to DraftWise AI!</h3>
                                    <p className="text-sm text-text-muted mb-6">Let's set up your profile. What should we call you?</p>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        className="w-full max-w-sm mx-auto px-4 py-3 bg-surface-inset border border-border-primary focus:outline-none focus:ring-2 focus:ring-gold"
                                        maxLength={16}
                                    />
                                </div>
                            )}
                            {step === 2 && (
                                <div>
                                    <h3 className="text-2xl font-semibold text-text-primary mb-2 text-center">What's your primary role?</h3>
                                    <p className="text-sm text-text-muted mb-6 text-center">This helps us tailor suggestions for you.</p>
                                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                                        {['All', ...ROLES].map(role => (
                                            <button
                                                key={role}
                                                onClick={() => setPrimaryRole(role)}
                                                className={`flex flex-col items-center justify-center gap-2 p-3 border-2 transition-all aspect-square ${primaryRole === role ? 'bg-secondary border-gold shadow-md shadow-gold/30 text-gold' : 'bg-surface border-border-primary hover:border-gold/70 text-text-secondary'}`}
                                            >
                                                {ROLE_ICONS[role]}
                                                <span className="font-semibold text-lg text-text-primary">{role}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {step === 3 && (
                                 <div>
                                    <h3 className="text-2xl font-semibold text-text-primary mb-2 text-center">Choose up to 3 favorite champions.</h3>
                                    <p className="text-sm text-text-muted mb-4 text-center">This grants you starter Draft Mastery points for them.</p>
                                    <input
                                        type="text"
                                        value={champSearch}
                                        onChange={(e) => setChampSearch(e.target.value)}
                                        placeholder="Search champions..."
                                        className="w-full px-3 py-2 bg-surface-inset border border-border-primary focus:outline-none focus:ring-2 focus:ring-gold mb-2"
                                    />
                                    <div className="flex justify-center flex-wrap gap-3 max-h-[250px] overflow-y-auto p-2 bg-surface-inset">
                                        {filteredChampions.length > 0 ? filteredChampions.map(champ => (
                                            <button
                                                key={champ.id}
                                                onClick={() => handleFavoriteToggle(champ.id)}
                                                className={`p-1 transition-all rounded-md ${favoriteChampions.includes(champ.id) ? 'ring-2 ring-gold shadow-md shadow-gold/30' : ''}`}
                                            >
                                                <img src={champ.image} alt={champ.name} className="w-16 h-16 rounded-md" />
                                            </button>
                                        )) : (
                                            <p className="text-text-muted p-8">No champions found.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                            {step === 4 && (
                                <div>
                                    <h3 className="text-2xl font-semibold text-text-primary mb-2 text-center">What are your goals?</h3>
                                    <p className="text-sm text-text-muted mb-6 text-center">Select your skill level and what you want to improve.</p>
                                    <div className="space-y-3 max-w-md mx-auto">
                                        {(['Beginner', 'Intermediate', 'Advanced'] as const).map(level => (
                                            <button key={level} onClick={() => setSkillLevel(level)} className={`w-full text-left p-4 border-2 transition-all ${skillLevel === level ? 'bg-secondary border-gold shadow-md shadow-gold/30' : 'bg-surface border-border-primary hover:border-gold/70'}`}>
                                                <p className="font-bold text-text-primary">{level}</p>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex justify-center flex-wrap gap-2 mt-4">
                                        {GOALS.map(goal => (
                                            <button key={goal} onClick={() => handleGoalToggle(goal)} className={`px-3 py-1.5 text-sm font-semibold transition-colors ${goals.includes(goal) ? 'bg-gold-bright text-on-gold' : 'bg-secondary text-text-secondary hover:bg-surface-tertiary'}`}>
                                                {goal}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {step === 5 && (
                                <div>
                                    <h3 className="text-2xl font-semibold text-text-primary mb-3 text-center">Customize your look</h3>
                                    <p className="text-sm text-text-muted mb-4 text-center">Choose a profile avatar.</p>
                                     <input
                                        type="text"
                                        value={champSearch}
                                        onChange={(e) => setChampSearch(e.target.value)}
                                        placeholder="Search champions..."
                                        className="w-full px-3 py-2 bg-surface-inset border border-border-primary focus:outline-none focus:ring-2 focus:ring-gold mb-2"
                                    />
                                     <div className="flex justify-center flex-wrap gap-3 mb-6 max-h-[200px] overflow-y-auto p-2 bg-surface-inset">
                                        {filteredChampions.map(champ => (
                                            <button key={champ.id} onClick={() => setAvatar(champ.id)} className={`p-1 rounded-full transition-all ${avatar === champ.id ? 'ring-2 ring-gold shadow-md shadow-gold/30' : ''}`}>
                                                <img src={champ.image} alt={champ.name} className="w-16 h-16 rounded-full" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {step === 6 && (
                                <div className="text-center">
                                     <h3 className="text-2xl font-bold text-text-primary mb-3">Welcome, {username || 'Rookie'}!</h3>
                                     <p className="text-text-primary">Your profile is set up and you've been awarded your first <strong className="text-gold-bright">{250} SP</strong> and the <strong className="text-turquoise">Rookie Strategist</strong> badge!</p>
                                     <p className="mt-4 text-text-muted">You're ready to master the draft. We'll start with a quick tour of the Strategy Forge.</p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <div className="space-y-4">
                        <ProgressBar step={step} total={TOTAL_STEPS + 1} />
                        <div className="flex justify-between items-center">
                            <div>
                                {step > 1 && step < TOTAL_STEPS + 1 && <Button variant="secondary" onClick={() => paginate(-1)}>Back</Button>}
                            </div>
                            <div className="flex items-center gap-2">
                                {step < TOTAL_STEPS + 1 ? (
                                    <>
                                        <Button variant="secondary" onClick={handleSkip}>Skip for Now</Button>
                                        <Button variant="primary" onClick={() => paginate(1)} disabled={isNextDisabled}>
                                            {step === TOTAL_STEPS ? 'Finish' : 'Next'}
                                        </Button>
                                    </>
                                ) : (
                                    <Button variant="primary" className="px-6 py-3" onClick={handleComplete}>Start Your Journey</Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};