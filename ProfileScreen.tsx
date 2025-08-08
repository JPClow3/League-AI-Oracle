
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useProfile } from '../contexts/ProfileContext';
import { Champion, DDragonData, Role, View, SummonerDTO, LeagueEntryDTO, ChampionMasteryDTO, StrategicBlindSpot, ChampionPerformance } from '../types';
import { ChampionIcon } from './common/ChampionIcon';
import { Icon } from './common/Icon';
import { riotService, RIOT_PLATFORMS } from '../services/riotService';
import { Spinner } from './common/Spinner';
import { analyzeChampionPerformance, analyzeHistoryForBlindSpots } from '../services/historyAnalyzer';

const getRankedEmblemUrl = (tier: string) => `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/ranked-emblem/emblem-${tier.toLowerCase()}.png`;

// #region Sub-components
const ProfileHeader: React.FC<{
    profile: ReturnType<typeof useProfile>['activeProfile'],
    ddragonData: DDragonData
}> = ({ profile, ddragonData }) => {
    if (!profile) return null;

    const { name, avatar, settings, riotData } = profile;
    const { xp } = settings;
    const level = Math.floor(xp / 100) + 1;
    const currentLevelXp = xp % 100;
    const progress = (currentLevelXp / 100) * 100;
    
    const summonerData = riotData?.summoner;
    const summonerIconUrl = summonerData
        ? `https://ddragon.leagueoflegends.com/cdn/${ddragonData.version}/img/profileicon/${summonerData.profileIconId}.png`
        : null;

    return (
        <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white dark:bg-slate-800/80 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 mb-8">
            <div className="relative">
                <div className="text-6xl sm:text-8xl p-4 bg-slate-200 dark:bg-slate-700 rounded-full w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
                    {avatar}
                </div>
                {summonerIconUrl &&
                    <img src={summonerIconUrl} alt="Summoner Icon" className="absolute -bottom-2 -right-2 w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-white dark:border-slate-800" decoding="async" width="64" height="64" />
                }
            </div>
            <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl sm:text-5xl font-display font-bold text-slate-800 dark:text-slate-100">{name}</h1>
                <p className="text-lg text-indigo-600 dark:text-indigo-400 font-semibold">
                    {summonerData ? `${summonerData.name} - Level ${summonerData.summonerLevel}` : 'Player Profile'}
                </p>
                <div className="mt-4">
                    <div className="flex justify-between items-center text-sm font-semibold mb-1">
                        <span className="text-slate-600 dark:text-slate-300">Strategy Level {level}</span>
                        <span className="text-slate-500 dark:text-slate-400">{currentLevelXp} / 100 XP</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LiveStatsCard: React.FC = () => {
    const { activeProfile, isSyncing, syncError, syncRiotData } = useProfile();
    const leagueData = activeProfile?.riotData?.league;

    const StatDisplay: React.FC<{ entry: LeagueEntryDTO }> = ({ entry }) => {
        const winRate = entry.wins + entry.losses > 0 ? ((entry.wins / (entry.wins + entry.losses)) * 100).toFixed(1) : 0;
        return (
            <div className="flex items-center gap-4">
                <img src={getRankedEmblemUrl(entry.tier)} alt={entry.tier} className="w-20 h-20" decoding="async" width="80" height="80" />
                <div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300">{entry.queueType === 'RANKED_SOLO_5x5' ? 'Ranked Solo/Duo' : 'Ranked Flex'}</h4>
                    <p className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{entry.tier} {entry.rank} - {entry.leaguePoints} LP</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{entry.wins}W / {entry.losses}L ({winRate}%)</p>
                </div>
            </div>
        )
    };
    
    return (
         <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-display text-slate-800 dark:text-slate-100">Live Stats</h2>
                 <button onClick={syncRiotData} disabled={isSyncing || !activeProfile?.riotData || !riotService.isConfigured()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
                    <Icon name="history" className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                </button>
            </div>
             {syncError && <p className="text-sm text-rose-500 mb-2">{syncError}</p>}
             {!riotService.isConfigured() ? (
                <p className="text-sm text-center text-slate-500 py-2">Riot API key not configured. Live stats are unavailable.</p>
             ) : isSyncing && !leagueData ? <div className="flex justify-center p-4"><Spinner /></div> :
             !activeProfile?.riotData ? <p className="text-sm text-center text-slate-500 py-2">Link your Riot account to see live stats.</p> :
             <div className="space-y-4">
                 {leagueData?.find(e => e.queueType === 'RANKED_SOLO_5x5') ? <StatDisplay entry={leagueData.find(e => e.queueType === 'RANKED_SOLO_5x5')!} /> : <p className="text-sm text-center text-slate-500 py-2">No Ranked Solo/Duo data found.</p>}
                 {leagueData?.find(e => e.queueType === 'RANKED_FLEX_SR') ? <StatDisplay entry={leagueData.find(e => e.queueType === 'RANKED_FLEX_SR')!} /> : <p className="text-sm text-center text-slate-500 py-2">No Ranked Flex data found.</p>}
             </div>}
         </div>
    );
};

const RiotAccountLinker: React.FC = () => {
    const { activeProfile, linkRiotAccount, unlinkRiotAccount, isSyncing, syncError } = useProfile();
    const [gameName, setGameName] = useState('');
    const [tagLine, setTagLine] = useState('');
    const [region, setRegion] = useState('NA1');

    const handleLink = async () => {
        if (!gameName || !tagLine) {
            alert('Please enter your full Riot ID (e.g., "PlayerName#NA1").');
            return;
        }
        try {
            await linkRiotAccount(gameName, tagLine, region);
        } catch (e) {
            // Error is handled in context and displayed via syncError
        }
    };

    if (!riotService.isConfigured()) {
        return (
            <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-center">
                <p className="text-sm text-slate-500">Riot Account linking is disabled. Please provide a `RIOT_API_KEY` in the app's environment settings to enable it.</p>
            </div>
        )
    }

    if (activeProfile?.riotData) {
        return (
            <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">Riot Account Linked</h3>
                <div className="flex items-center gap-4 mt-2">
                    <div className="flex-grow">
                        <p className="font-bold text-lg text-teal-600 dark:text-teal-400">{activeProfile.riotData.gameName}#{activeProfile.riotData.tagLine}</p>
                        <p className="text-sm text-slate-500">{RIOT_PLATFORMS[activeProfile.riotData.region as keyof typeof RIOT_PLATFORMS]}</p>
                    </div>
                    <button onClick={unlinkRiotAccount} className="px-3 py-1 bg-rose-200 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 rounded-md hover:bg-rose-300 dark:hover:bg-rose-900 text-sm font-semibold">Unlink</button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Link Your Riot Account</h3>
            <p className="text-xs text-slate-500">Sync your mastery, rank, and summoner info. Your app's environment variable for the Riot API key must be configured for this to work.</p>
            <div className="flex gap-2">
                <input type="text" value={gameName} onChange={e => setGameName(e.target.value)} placeholder="Game Name" className="flex-grow p-2 rounded bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"/>
                <span className="self-center text-slate-400 font-bold">#</span>
                <input type="text" value={tagLine} onChange={e => setTagLine(e.target.value)} placeholder="TagLine" className="w-24 p-2 rounded bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"/>
            </div>
            <select value={region} onChange={e => setRegion(e.target.value)} className="w-full p-2 rounded bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                {Object.entries(RIOT_PLATFORMS).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
            {syncError && <p className="text-xs text-rose-500">{syncError}</p>}
            <button onClick={handleLink} disabled={isSyncing} className="w-full p-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 disabled:opacity-50">
                {isSyncing ? <Spinner size="h-5 w-5 mx-auto"/> : 'Link Account'}
            </button>
        </div>
    );
};

const PerformanceTrends: React.FC<{
    profile: ReturnType<typeof useProfile>['activeProfile'],
    ddragonData: DDragonData,
    onNavigateToLesson: (lessonId: string) => void
}> = ({ profile, ddragonData, onNavigateToLesson }) => {
    
    const performanceData = useMemo(() => {
        if (!profile || !profile.draftHistory) return { blindSpot: null, champPerformance: [] };
        const gamesWithOutcome = profile.draftHistory.filter(h => h.outcome);
        if (gamesWithOutcome.length < 5) return { blindSpot: null, champPerformance: [] };

        const blindSpot = analyzeHistoryForBlindSpots(gamesWithOutcome);
        const champPerformance = analyzeChampionPerformance(gamesWithOutcome);
        return { blindSpot, champPerformance };
    }, [profile?.draftHistory]);
    
    if (performanceData.champPerformance.length === 0) {
        return (
            <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-display text-slate-800 dark:text-slate-100 mb-2">Performance Trends</h2>
                <div className="text-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                    <p className="text-sm text-slate-500">Play and save at least 5 games with outcomes to see your performance trends.</p>
                </div>
            </div>
        )
    }

    const { blindSpot, champPerformance } = performanceData;

    return (
        <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="text-2xl font-display text-slate-800 dark:text-slate-100">Performance Trends</h2>
            
            {blindSpot ? (
                 <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                     <h3 className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2"><Icon name="warning" className="w-5 h-5"/>Strategic Blind Spot Identified</h3>
                     <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{blindSpot.insight}</p>
                     <button onClick={() => onNavigateToLesson(blindSpot.suggestedLessonId)} className="mt-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                        Review Lesson: "{blindSpot.suggestedLessonTitle}"
                     </button>
                 </div>
            ) : (
                <div className="p-4 bg-teal-500/10 rounded-lg border border-teal-500/30">
                    <h3 className="font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-2"><Icon name="check" className="w-5 h-5"/>No Significant Blind Spots Found</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Your recent performance shows a balanced approach to drafting. Keep up the great work!</p>
                </div>
            )}
            
            <div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">Top Played Champions</h3>
                 <div className="space-y-2 mt-2">
                     {champPerformance.slice(0, 5).map(perf => {
                         const champion = Object.values(ddragonData.champions).find(c => c.id === perf.championId);
                         if (!champion) return null;
                         return (
                             <div key={perf.championId} className="flex items-center gap-3 p-2 bg-slate-100 dark:bg-slate-900/50 rounded-md">
                                 <ChampionIcon champion={champion} version={ddragonData.version} isClickable={false} className="w-10 h-10 flex-shrink-0" />
                                 <div className="flex-grow">
                                     <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{champion.name}</p>
                                     <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-1">
                                         <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${perf.winRate}%`}}></div>
                                     </div>
                                 </div>
                                 <div className="text-right text-xs">
                                     <p className="font-semibold" style={{ color: perf.winRate >= 50 ? '#14b8a6' : '#f43f5e'}}>{perf.winRate.toFixed(0)}% WR</p>
                                     <p className="text-slate-500">{perf.games} Games</p>
                                 </div>
                             </div>
                         );
                     })}
                 </div>
            </div>
        </div>
    )
};
// #endregion

const ProfileScreen: React.FC<{
  ddragonData: DDragonData;
  setView: (view: View) => void;
  onNavigateToLesson: (lessonId: string) => void;
}> = ({ ddragonData, setView, onNavigateToLesson }) => {
  const { activeProfile, isSyncing, syncRiotData } = useProfile();
  
  useEffect(() => {
      if (activeProfile?.riotData?.puuid && !activeProfile.riotData.mastery && riotService.isConfigured()) {
          syncRiotData();
      }
  }, [activeProfile, syncRiotData]);

  if (!activeProfile) return null;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
        <ProfileHeader profile={activeProfile} ddragonData={ddragonData} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <PerformanceTrends profile={activeProfile} ddragonData={ddragonData} onNavigateToLesson={onNavigateToLesson} />
            </div>

            <div className="space-y-6">
                <LiveStatsCard />
                <RiotAccountLinker />
            </div>
        </div>
    </div>
  );
};

export default ProfileScreen;
