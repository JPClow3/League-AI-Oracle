import React, { useMemo } from 'react';
import type { UserProfile } from '../../types';
import { ProgressBar } from '../common/ProgressBar';
import { Tooltip } from '../common/Tooltip';
import { CHAMPION_THEME_COLORS } from '../../data/championThemeColors';
import { Flame, Sparkles } from 'lucide-react';
import { useChampions } from '../../contexts/ChampionContext';

interface StrategistJourneyPanelProps {
    profile: UserProfile;
    spForNextLevel: number;
}

const getRankTheme = (rank: string): { borderClass: string; textClass: string; } => {
    const rankName = rank.toLowerCase().split(' ')[0];
    switch(rankName) {
        case 'iron': return { borderClass: 'border-text-muted', textClass: 'text-text-muted' };
        case 'bronze': return { borderClass: 'border-amber-700', textClass: 'text-amber-700' };
        case 'silver': return { borderClass: 'border-gray-400', textClass: 'text-gray-400' };
        case 'gold': return { borderClass: 'border-gold', textClass: 'text-gold' };
        case 'platinum': return { borderClass: 'border-info', textClass: 'text-info' };
        case 'diamond': return { borderClass: 'border-accent', textClass: 'text-accent' };
        default: return { borderClass: 'border-border-primary', textClass: 'text-text-primary' };
    }
}

const InfoCard = ({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) => (
    <div className="bg-surface-secondary/50 p-3 flex items-center gap-3 border border-border-primary">
        <div className="text-gold">{icon}</div>
        <div>
            <div className="text-xs text-text-secondary">{label}</div>
            <div className="font-bold text-text-primary text-lg">{value}</div>
        </div>
    </div>
);

export const StrategistJourneyPanel = ({ profile, spForNextLevel }: StrategistJourneyPanelProps) => {
    const { championsLite } = useChampions();
    const rankTheme = getRankTheme(profile.rank);
    const avatarChampion = championsLite.find(c => c.id === profile.avatar);
    
    const avatarThemeStyle = useMemo(() => {
        const color = CHAMPION_THEME_COLORS[profile.avatar];
        if (color) {
            return {
                borderColor: color,
                boxShadow: `0 0 15px 0px ${color}55`, // Add a subtle glow
            };
        }
        return { borderColor: 'hsl(var(--border))' };
    }, [profile.avatar]);

    return (
        <div className={`bg-surface p-6 shadow-lg border ${rankTheme.borderClass} transition-colors duration-500`}>
            <div className="flex flex-col items-center text-center mb-4">
                 {avatarChampion && (
                    <img
                        src={avatarChampion.image}
                        alt="User Avatar"
                        className="w-24 h-24 rounded-full border-4 mb-3 transition-all duration-300"
                        style={avatarThemeStyle}
                    />
                )}
                <div className="flex justify-center items-center gap-2">
                    <h2 className="text-2xl font-bold text-text-primary">{profile.username}</h2>
                    {profile.badges.includes('Rookie Strategist') && (
                        <Tooltip content="Rookie Strategist: Completed initial profile setup.">
                            <span className="bg-surface-secondary text-gold px-2 py-0.5 text-xs font-bold">{profile.badges[0].split(' ')[0].toUpperCase()}</span>
                        </Tooltip>
                    )}
                </div>
                <p className={`font-semibold ${rankTheme.textClass} transition-colors duration-500`}>{profile.rank} - Level {profile.level}</p>
            </div>


            <div className="mb-6">
                <ProgressBar value={profile.sp} max={spForNextLevel} label="SP to Next Level" colorClass="bg-gold" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <InfoCard
                    label="Daily Streak"
                    value={`${profile.streak} Days`}
                    icon={<Flame className="h-6 w-6" strokeWidth={1.5} />}
                />
                 <InfoCard
                    label="Total SP"
                    value={profile.sp.toLocaleString()}
                    icon={<Sparkles className="h-6 w-6" strokeWidth={1.5} />}
                />
            </div>
        </div>
    );
};