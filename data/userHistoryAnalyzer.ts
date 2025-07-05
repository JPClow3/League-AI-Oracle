
import { DraftHistoryEntry } from '../types';
import { calculateTeamAnalytics } from './analyticsHelper';

interface LearningSuggestion {
    lessonId: string;
    reason: string;
}

export const analyzeUserHistory = (history: DraftHistoryEntry[]): LearningSuggestion | null => {
    if (history.length < 3) {
        return null; // Not enough data to analyze
    }

    const recentHistory = history.slice(0, 5); // Analyze last 5 games

    let lowCCCount = 0;
    let skewedDamageCount = 0;

    for (const entry of recentHistory) {
        const bluePicks = entry.draftState.blueTeam.picks.map(p => p.champion);
        const analytics = calculateTeamAnalytics(bluePicks);

        // Check for low CC
        if (analytics.ccScore.label === 'Low') {
            lowCCCount++;
        }
        
        // Check for skewed damage
        const { ad, ap, hybrid } = analytics.damageProfile;
        if ((ad > 0 && ap === 0 && hybrid === 0) || (ap > 0 && ad === 0 && hybrid === 0)) {
           if(bluePicks.length > 3) skewedDamageCount++;
        }
    }

    if (lowCCCount >= 3) {
        return {
            lessonId: 'strat-101',
            reason: 'You often draft teams with low crowd control. Mastering CC can help you lock down key targets and control fights.',
        };
    }
    
    if (skewedDamageCount >= 2) {
         return {
            lessonId: 'comp-201',
            reason: 'Your teams sometimes lack damage diversity. Learning about AD/AP balance can make your drafts much harder to counter.',
        };
    }

    return null;
};
