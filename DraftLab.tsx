
import React, { useState, useMemo, useCallback } from 'react';
import { DDragonData, Champion, AIAnalysis, Aura, Role, View } from '../types';
import { geminiService } from '../services/geminiService';
import { ChampionIcon } from './common/ChampionIcon';
import { Spinner } from './common/Spinner';
import TeamAnalyticsDashboard from './TeamAnalyticsDashboard';
import { useProfile } from '../contexts/ProfileContext';
import TeamIdentityIcon from './common/TeamIdentityIcon';
import InteractiveText from './common/InteractiveText';

interface DraftLabProps {
    ddragonData: DDragonData;
    setAura: (aura: Aura) => void;
    setView: (view: View) => void;
}

const DraftLab: React.FC<DraftLabProps> = ({ ddragonData, setAura, setView }) => {
    const { activeProfile } = useProfile();
    const { settings } = activeProfile!;

    const [blueTeam, setBlueTeam] = useState<(Champion | null)[]>(Array(5).fill(null));
    const [redTeam, setRedTeam] = useState<(Champion | null)[]>(Array(5).fill(null));
    const [selectedSlot, setSelectedSlot] = useState<{ team: 'BLUE' | 'RED'; index: number } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAiLoading, setAiLoading] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);

    const champions = useMemo(() => Object.values(ddragonData.champions), [ddragonData]);

    const pickedChampionIds = useMemo(() => {
        const picked = new Set<string>();
        [...blueTeam, ...redTeam].forEach(c => {
            if (c) picked.add(c.id);
        });
        return picked;
    }, [blueTeam, redTeam]);

    const filteredChampions = useMemo(() => {
        return champions
            .filter(c => !pickedChampionIds.has(c.id))
            .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [champions, searchTerm, pickedChampionIds]);

    const handleSlotSelect = (team: 'BLUE' | 'RED', index: number) => {
        setSelectedSlot({ team, index });
        setSearchTerm('');
    };

    const handleChampionSelect = (champion: Champion) => {
        if (!selectedSlot) return;

        const clearFromOtherTeam = (teamToClear: (Champion | null)[], setTeamToClear: React.Dispatch<React.SetStateAction<(Champion | null)[]>>) => {
            const idx = teamToClear.findIndex(c => c?.id === champion.id);
            if (idx !== -1) {
                const newClearedTeam = [...teamToClear];
                newClearedTeam[idx] = null;
                setTeamToClear(newClearedTeam);
            }
        };

        const { team, index } = selectedSlot;
        if (team === 'BLUE') {
            const newTeam = [...blueTeam];
            newTeam[index] = champion;
            setBlueTeam(newTeam);
            clearFromOtherTeam(redTeam, setRedTeam);
        } else {
            const newTeam = [...redTeam];
            newTeam[index] = champion;
            setRedTeam(newTeam);
            clearFromOtherTeam(blueTeam, setBlueTeam);
        }
        setSelectedSlot(null);
    };
    
    const handleGetAnalysis = useCallback(async () => {
      const mockDraftState = {
        mode: 'COMPETITIVE' as const,
        blueTeam: { picks: blueTeam.map((c, i) => ({ champion: c, role: ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'SUPPORT'][i] as Role })), bans: [] },
        redTeam: { picks: redTeam.map((c, i) => ({ champion: c, role: ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'SUPPORT'][i] as Role })), bans: [] },
        currentTurn: 20,
        pickedChampions: pickedChampionIds,
        history: [],
      };

      setAiLoading(true);
      setAura('thinking');
      const analysis = await geminiService.getFullDraftAnalysis(mockDraftState, settings);
      setAiAnalysis(analysis);
      setAiLoading(false);
      setAura(analysis ? 'neutral' : 'negative');
    }, [blueTeam, redTeam, pickedChampionIds, settings, setAura]);

    const isDraftComplete = blueTeam.every(c => c) && redTeam.every(c => c);

    const handleKeywordClick = (lessonId: string) => {
        setView(View.LESSONS);
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="text-center">
                <h2 className="text-4xl font-display">Draft Lab</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Freely build team compositions and get an instant AI analysis. Right-click champions to manage your pool.</p>
            </div>

            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                {(['BLUE', 'RED'] as const).map(team => (
                    <div key={team} className={`flex-1 p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700`}>
                        <h3 className={`text-2xl font-display text-center text-${team.toLowerCase()}-600 dark:text-${team.toLowerCase()}-400`}>{team} TEAM</h3>
                        <div className="grid grid-cols-5 gap-2 mt-4">
                            {(team === 'BLUE' ? blueTeam : redTeam).map((champion, index) => (
                                <div 
                                    key={index}
                                    onClick={() => handleSlotSelect(team, index)}
                                    className={`aspect-square bg-slate-100 dark:bg-slate-900/50 rounded flex items-center justify-center cursor-pointer transition-all duration-200 ${selectedSlot?.team === team && selectedSlot?.index === index ? 'ring-2 ring-amber-500 dark:ring-amber-400' : 'hover:ring-2 hover:ring-indigo-500/50'}`}
                                >
                                    {champion ? (
                                        <ChampionIcon champion={champion} version={ddragonData.version} isClickable={false} className="w-full h-full" />
                                    ) : (
                                        <span className="text-3xl text-slate-400 dark:text-slate-600">+</span>
                                    )}
                                </div>
                            ))}
                        </div>
                         <div className="mt-4">
                            <TeamAnalyticsDashboard teamName={team} champions={(team === 'BLUE' ? blueTeam : redTeam)} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center">
                 <button onClick={handleGetAnalysis} disabled={!isDraftComplete || isAiLoading} className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 transition-all duration-200 disabled:bg-slate-500 dark:disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center mx-auto active:scale-95 transform shadow-lg hover:shadow-xl">
                    {isAiLoading && <Spinner size="h-5 w-5 mr-2" />} {isAiLoading ? 'Analyzing...' : 'Analyze Full Setup'}
                </button>
            </div>
            
            {aiAnalysis && (
                <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-inner border border-slate-200 dark:border-slate-700 space-y-4 animate-fade-in">
                     <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-display text-teal-600 dark:text-teal-400">In-Depth Analysis</h3>
                    </div>
                    <details className="p-3 rounded-lg bg-slate-100 dark:bg-black/20" open><summary className="cursor-pointer font-semibold text-slate-800 dark:text-slate-200">Strategy & Win Conditions</summary><div className="pt-2 text-sm text-slate-600 dark:text-slate-400"><InteractiveText onKeywordClick={handleKeywordClick}>{aiAnalysis.strategicFocus}</InteractiveText></div></details>
                    <details className="p-3 rounded-lg bg-slate-100 dark:bg-black/20" open><summary className="cursor-pointer font-semibold text-slate-800 dark:text-slate-200">Team Identities</summary><div className="pt-2 space-y-2 text-sm text-slate-600 dark:text-slate-400"><div className="flex items-center gap-2"><TeamIdentityIcon identity={aiAnalysis.teamIdentities.blue} /><strong className="text-blue-500">Blue:</strong> <InteractiveText onKeywordClick={handleKeywordClick}>{aiAnalysis.teamIdentities.blue}</InteractiveText></div><div className="flex items-center gap-2"><TeamIdentityIcon identity={aiAnalysis.teamIdentities.red} /><strong className="text-red-500">Red:</strong> <InteractiveText onKeywordClick={handleKeywordClick}>{aiAnalysis.teamIdentities.red}</InteractiveText></div></div></details>
                    <details className="p-3 rounded-lg bg-slate-100 dark:bg-black/20"><summary className="cursor-pointer font-semibold text-slate-800 dark:text-slate-200">MVP & Threats</summary><div className="pt-2 space-y-2 text-sm text-slate-600 dark:text-slate-400">{aiAnalysis.mvp && <div><strong>MVP ({aiAnalysis.mvp.championName}):</strong> <InteractiveText onKeywordClick={handleKeywordClick}>{aiAnalysis.mvp.reasoning}</InteractiveText></div>}{aiAnalysis.enemyThreats?.map(t => <div key={t.championName}><strong>Threat ({t.championName}):</strong> <InteractiveText onKeywordClick={handleKeywordClick}>{t.counterplay}</InteractiveText> {t.itemSpikeWarning && <span className="text-amber-500 font-semibold">(Spike: {t.itemSpikeWarning})</span>}</div>)}</div></details>
                    <details className="p-3 rounded-lg bg-slate-100 dark:bg-black/20"><summary className="cursor-pointer font-semibold text-slate-800 dark:text-slate-200">Bans Impact</summary><div className="pt-2 space-y-2 text-sm text-slate-600 dark:text-slate-400"><div><strong className="text-blue-500">Blue Bans:</strong> <InteractiveText onKeywordClick={handleKeywordClick}>{aiAnalysis.bansImpact.blue}</InteractiveText></div><div><strong className="text-red-500">Red Bans:</strong> <InteractiveText onKeywordClick={handleKeywordClick}>{aiAnalysis.bansImpact.red}</InteractiveText></div></div></details>
                </div>
            )}

            {selectedSlot && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setSelectedSlot(null)}>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl animate-pop-in" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-display mb-2">Select a Champion for {selectedSlot.team} Team</h3>
                        <input
                            type="text"
                            placeholder="Search for a champion..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 rounded bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            autoFocus
                        />
                        <div className="mt-4 grid grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-2 max-h-72 overflow-y-auto pr-2">
                            {filteredChampions.map(champ => (
                                <ChampionIcon
                                    key={champ.id}
                                    champion={champ}
                                    version={ddragonData.version}
                                    onClick={() => handleChampionSelect(champ)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DraftLab;
