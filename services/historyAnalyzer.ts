import { DraftHistoryEntry, StrategicBlindSpot, ChampionPerformance } from '../types';
import { calculateTeamAnalytics } from '../data/analyticsHelper';
import { KNOWLEDGE_BASE } from '../data/knowledgeBase';
import { isChampion } from '../utils/typeGuards';

const DNA_TO_LESSON_MAP: Record<string, { lessonId: string; threshold: number; insight: string; }> = {
  'Engage/Dive': { 
    lessonId: 'df-101', 
    threshold: 1.5, // average score per champ
    insight: 'drafting clear sources of engage' 
  },
  'Peel/Protect': { 
    lessonId: 'df-101', 
    threshold: 1.5,
    insight: 'drafting enough peel for your carries'
  },
};
const MIN_TOTAL_GAMES = 10;
const MIN_CATEGORY_GAMES = 3;

export const analyzeChampionPerformance = (history: DraftHistoryEntry[]): ChampionPerformance[] => {
    const performanceMap: Record<string, { wins: number; games: number }> = {};
    
    const gamesWithOutcome = history.filter(e => e.outcome);

    for (const entry of gamesWithOutcome) {
        // Assume user is always on Blue team for performance tracking
        const blueTeamPicks = entry.draftState.blueTeam.picks.map(p => p.champion).filter(isChampion);
        
        for (const champion of blueTeamPicks) {
            if (!performanceMap[champion.id]) {
                performanceMap[champion.id] = { wins: 0, games: 0 };
            }
            performanceMap[champion.id].games++;
            if (entry.outcome === 'WIN') {
                performanceMap[champion.id].wins++;
            }
        }
    }

    return Object.entries(performanceMap).map(([championId, data]) => ({
        championId,
        games: data.games,
        wins: data.wins,
        losses: data.games - data.wins,
        winRate: (data.wins / data.games) * 100,
    })).sort((a, b) => b.games - a.games);
};

export const analyzeHistoryForBlindSpots = (history: DraftHistoryEntry[]): StrategicBlindSpot | null => {
    const gamesWithOutcome = history.filter(e => e.outcome);
    if (gamesWithOutcome.length < MIN_TOTAL_GAMES) {
        return null;
    }

    const blindSpots: (StrategicBlindSpot & { priority: number })[] = [];

    for (const [key, config] of Object.entries(DNA_TO_LESSON_MAP)) {
        const relevantGames = gamesWithOutcome.filter(entry => {
            const bluePicks = entry.draftState.blueTeam.picks.map(p => p.champion).filter(isChampion);
            if (bluePicks.length === 0) return false;
            const analytics = calculateTeamAnalytics(bluePicks);
            // using the DNA value directly, not engageScore
            const score = (analytics.teamDNA[key] || 0) / bluePicks.length;
            return score < config.threshold;
        });

        if (relevantGames.length >= MIN_CATEGORY_GAMES) {
            const wins = relevantGames.filter(g => g.outcome === 'WIN').length;
            const winRate = (wins / relevantGames.length) * 100;

            if (winRate < 45) { // Only flag if winrate is noticeably low
                const lesson = KNOWLEDGE_BASE.find(l => l.id === config.lessonId);
                if (lesson) {
                    blindSpots.push({
                        blindSpotKey: key,
                        winRate,
                        gamesAnalyzed: relevantGames.length,
                        suggestedLessonId: config.lessonId,
                        suggestedLessonTitle: lesson.title,
                        insight: `Analysis of your ${relevantGames.length} games with low "${key}" scores shows a ${winRate.toFixed(0)}% win rate. Improving your ability to draft for ${config.insight} could be beneficial.`,
                        priority: (50 - winRate) * relevantGames.length // Simple priority score
                    });
                }
            }
        }
    }

    if (blindSpots.length === 0) return null;

    // Return the blind spot with the highest priority score
    return blindSpots.sort((a, b) => b.priority - a.priority)[0];
};
