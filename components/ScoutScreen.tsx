import React, { useState, useCallback, useMemo } from 'react';
import { DDragonData, LiveGameParticipant, Champion } from '../types';
import { useProfile } from '../contexts/ProfileContext';
import { riotService, RIOT_PLATFORMS } from '../services/riotService';
import { geminiService } from '../services/geminiService';
import { Icon } from './common/Icon';
import { Spinner } from './common/Spinner';
import { ChampionIcon } from './common/ChampionIcon';
import { ErrorCard } from './common/ErrorCard';

const getChampionById = (ddragonData: DDragonData, id: number): Champion | null => {
    if (!ddragonData?.champions) return null;
    return Object.values(ddragonData.champions).find(c => Number(c.key) === id) || null;
};

const ScoutScreen: React.FC<{ ddragonData: DDragonData }> = ({ ddragonData }) => {
    const { activeProfile } = useProfile();
    const [gameName, setGameName] = useState(activeProfile?.riotData?.gameName || '');
    const [tagLine, setTagLine] = useState(activeProfile?.riotData?.tagLine || '');
    const [region, setRegion] = useState(activeProfile?.riotData?.region || 'NA1');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [blueTeam, setBlueTeam] = useState<LiveGameParticipant[]>([]);
    const [redTeam, setRedTeam] = useState<LiveGameParticipant[]>([]);

    const handleScout = useCallback(async () => {
        if (!gameName || !tagLine) {
            setError("Please enter a full Riot ID (e.g., PlayerName#TAG).");
            return;
        }

        setIsLoading(true);
        setError(null);
        setBlueTeam([]);
        setRedTeam([]);

        try {
            const account = await riotService.getAccountByRiotId(gameName, tagLine, region);
            const liveGame = await riotService.getCurrentGameByPuuid(account.puuid, region);

            const initialParticipants: LiveGameParticipant[] = liveGame.participants.map(p => ({
                puuid: p.puuid,
                champion: getChampionById(ddragonData, p.championId),
                summonerName: p.summonerName,
                teamId: p.teamId,
                isLoadingProfile: true,
            }));
            
            setBlueTeam(initialParticipants.filter(p => p.teamId === 100));
            setRedTeam(initialParticipants.filter(p => p.teamId === 200));

            // Sequentially fetch profiles to avoid hitting rate limits too quickly
            for (const participant of liveGame.participants) {
                try {
                    const matchIds = await riotService.getMatchIdsByPuuid(participant.puuid, region, 5);
                    const matchHistory = await Promise.all(matchIds.map(id => riotService.getMatchData(id, region)));
                    const profile = await geminiService.getPlayerProfile(matchHistory, participant.puuid, activeProfile!.settings);
                    
                    const teamSetter = participant.teamId === 100 ? setBlueTeam : setRedTeam;
                    teamSetter(prev => prev.map(p => p.puuid === participant.puuid ? { ...p, profile: profile ?? undefined, isLoadingProfile: false } : p));

                } catch (playerError) {
                    console.error(`Failed to analyze player ${participant.summonerName}:`, playerError);
                    const teamSetter = participant.teamId === 100 ? setBlueTeam : setRedTeam;
                    teamSetter(prev => prev.map(p => p.puuid === participant.puuid ? {
                        ...p,
                        profile: { personaTag: 'Analysis Failed', insight: 'Could not retrieve this player\'s data.', error: (playerError as Error).message },
                        isLoadingProfile: false,
                    } : p));
                }
            }

        } catch (e: any) {
            setError(e.message || "Could not find a live game for this player.");
        } finally {
            setIsLoading(false);
        }
    }, [gameName, tagLine, region, ddragonData, activeProfile]);
    
    const hasGameData = blueTeam.length > 0 || redTeam.length > 0;

    if (!riotService.isConfigured()) {
        return (
            <div className="max-w-3xl mx-auto text-center py-10">
                <Icon name="warning" className="w-12 h-12 mx-auto text-amber-500" />
                <h2 className="mt-4 text-3xl font-display text-slate-800 dark:text-slate-200">Scouting Feature Disabled</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">
                    This feature requires a Riot API key. The `RIOT_API_KEY` environment variable is not set.
                    Please configure it in the app's settings to enable live game scouting.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-6xl font-display font-bold text-gradient-primary">Live Game Scout</h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 mt-2">Enter a summoner's Riot ID to generate an AI-powered scouting report on their current match.</p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-800/80 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 mb-8 max-w-2xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                     <div className="flex-grow flex gap-2">
                        <input type="text" value={gameName} onChange={e => setGameName(e.target.value)} placeholder="Game Name" className="flex-grow p-3 rounded-md bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"/>
                        <span className="self-center text-slate-400 font-bold text-xl">#</span>
                        <input type="text" value={tagLine} onChange={e => setTagLine(e.target.value)} placeholder="TAG" className="w-24 p-3 rounded-md bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"/>
                    </div>
                    <select value={region} onChange={e => setRegion(e.target.value)} className="p-3 rounded-md bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none">
                        {Object.entries(RIOT_PLATFORMS).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                    </select>
                    <button onClick={handleScout} disabled={isLoading} className="p-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                        {isLoading ? <Spinner size="h-5 w-5" /> : <Icon name="binoculars" className="w-5 h-5"/>}
                        {isLoading ? 'Scouting...' : 'Scout Game'}
                    </button>
                </div>
            </div>

            {error && <div className="max-w-2xl mx-auto"><ErrorCard title="Scouting Failed" message={error} /></div>}
            
            {hasGameData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TeamColumn team={blueTeam} title="Blue Team" ddragonData={ddragonData}/>
                    <TeamColumn team={redTeam} title="Red Team" ddragonData={ddragonData}/>
                </div>
            )}
        </div>
    );
};

const TeamColumn: React.FC<{
    team: LiveGameParticipant[];
    title: string;
    ddragonData: DDragonData;
}> = ({ team, title, ddragonData }) => {
    const color = title.toLowerCase().includes('blue') ? 'blue' : 'red';
    return (
        <div className="space-y-4">
            <h2 className={`text-3xl font-display text-center text-${color}-500`}>{title}</h2>
            {team.map((player) => (
                <PlayerCard key={player.puuid} player={player} ddragonData={ddragonData} color={color} />
            ))}
        </div>
    )
};

const PlayerCard: React.FC<{
    player: LiveGameParticipant;
    ddragonData: DDragonData;
    color: 'blue' | 'red';
}> = ({ player, ddragonData, color }) => {
    return (
        <div className={`p-4 bg-white dark:bg-slate-800/60 rounded-lg border-l-4 border-${color}-500 shadow-md`}>
            <div className="flex items-start gap-4">
                <ChampionIcon champion={player.champion} version={ddragonData.version} isClickable={false} className="w-16 h-16 flex-shrink-0" />
                <div className="flex-grow">
                    <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200">{player.summonerName}</h4>
                    {player.isLoadingProfile ? (
                        <div className="flex items-center gap-2 mt-2">
                            <Spinner size="h-4 w-4" />
                            <p className="text-sm text-slate-500">Analyzing player...</p>
                        </div>
                    ) : player.profile ? (
                        <div className="mt-1 space-y-1">
                            <p className={`font-semibold text-sm text-${color}-600 dark:text-${color}-400`}>
                                {player.profile.personaTag}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {player.profile.insight}
                                {player.profile.error && <span className="text-rose-500 italic"> ({player.profile.error})</span>}
                            </p>
                        </div>
                    ) : (
                         <p className="text-sm text-slate-500">No profile data available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScoutScreen;
