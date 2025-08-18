import React, { useMemo } from 'react';
import type { UserProfile } from '../../types';
import { ProgressBar } from '../common/ProgressBar';
import { Tooltip } from '../common/Tooltip';
import { CHAMPIONS_LITE } from '../../constants';
import { CHAMPION_THEME_COLORS } from '../../data/championThemeColors';

interface StrategistJourneyPanelProps {
    profile: UserProfile;
    spForNextLevel: number;
}

const getRankTheme = (rank: string): { borderClass: string; textClass: string; } => {
    const rankName = rank.toLowerCase().split(' ')[0];
    switch(rankName) {
        case 'iron': return { borderClass: 'border-slate-500', textClass: 'text-slate-300' };
        case 'bronze': return { borderClass: 'border-yellow-700', textClass: 'text-yellow-500' };
        case 'silver': return { borderClass: 'border-gray-400', textClass: 'text-gray-200' };
        case 'gold': return { borderClass: 'border-yellow-500', textClass: 'text-yellow-300' };
        case 'platinum': return { borderClass: 'border-teal-500', textClass: 'text-teal-300' };
        case 'diamond': return { borderClass: 'border-blue-400', textClass: 'text-blue-300' };
        default: return { borderClass: 'border-slate-700/50', textClass: 'text-white' };
    }
}

const InfoCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="bg-slate-900/50 p-3 rounded-lg flex items-center gap-3">
        <div className="text-[rgb(var(--color-accent-text))]">{icon}</div>
        <div>
            <div className="text-xs text-gray-400">{label}</div>
            <div className="font-bold text-white text-lg">{value}</div>
        </div>
    </div>
);

export const StrategistJourneyPanel: React.FC<StrategistJourneyPanelProps> = ({ profile, spForNextLevel }) => {
    const rankTheme = getRankTheme(profile.rank);
    const avatarChampion = CHAMPIONS_LITE.find(c => c.id === profile.avatar);
    
    const avatarThemeStyle = useMemo(() => {
        const color = CHAMPION_THEME_COLORS[profile.avatar];
        if (color) {
            return {
                borderColor: color,
                boxShadow: `0 0 15px 0px ${color}55`, // Add a subtle glow
            };
        }
        return { borderColor: '#334155' }; // default slate-700
    }, [profile.avatar]);

    return (
        <div className={`bg-slate-800 p-6 rounded-xl shadow-lg border ${rankTheme.borderClass} transition-colors duration-500`}>
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
                    <h2 className="text-2xl font-bold text-white">{profile.username}</h2>
                    {profile.badges.includes('Rookie Strategist') && (
                        <Tooltip content="Rookie Strategist: Completed initial profile setup.">
                            <span className="bg-slate-700 text-cyan-300 px-2 py-0.5 rounded-full text-xs font-bold">ROOKIE</span>
                        </Tooltip>
                    )}
                </div>
                <p className={`font-semibold ${rankTheme.textClass} transition-colors duration-500`}>{profile.rank} - Level {profile.level}</p>
            </div>


            <div className="mb-6">
                <ProgressBar value={profile.sp} max={spForNextLevel} label="SP to Next Level" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <InfoCard
                    label="Daily Streak"
                    value={`${profile.streak} Days`}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A8 8 0 0117.657 18.657z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.5 21a1 1 0 11-2 0 1 1 0 012 0z" /></svg>}
                />
                 <InfoCard
                    label="Total SP"
                    value={profile.sp.toLocaleString()}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-12v4m-2-2h4m5 4v4m-2-2h4M17 3l4 4M3 17l4 4" /></svg>}
                />
            </div>
        </div>
    );
};
