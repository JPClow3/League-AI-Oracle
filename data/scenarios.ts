import type { DraftScenario } from '../types';
import { getInitialDraftState } from '../contexts/DraftContext';
import { toSavedDraft } from '../lib/draftUtils';

// Helper to create a base draft state
const createDraftWithPicks = (bluePicks: (string | null)[], redPicks: (string | null)[]) => {
    const draft = getInitialDraftState();
    bluePicks.forEach((id, i) => { if (id) draft.blue.picks[i].champion = { id } as any; });
    redPicks.forEach((id, i) => { if (id) draft.red.picks[i].champion = { id } as any; });
    return toSavedDraft(draft);
};

export const SCENARIOS: DraftScenario[] = [
    {
        id: 'scenario-01',
        title: 'Anti-Dive Support',
        description: "It's your last pick as Support (Blue side). The enemy team has multiple, high-threat divers aiming for your immobile ADC. What's the best pick to ensure your carry survives?",
        draft: createDraftWithPicks(
            ['Sivir', 'XinZhao', 'Viktor', 'Gnar', null],
            ['Akali', 'Nocturne', 'Kaisa', 'Malphite', 'Pyke']
        ),
        userContext: { side: 'blue', type: 'pick', index: 4 },
        options: [
            { championId: 'Janna', isCorrect: true, explanation: "Janna's tornadoes and ultimate are premier disengage tools, perfectly suited to peel multiple divers off Sivir." },
            { championId: 'Brand', isCorrect: false, explanation: "Brand provides damage but lacks the instant peel needed to save Sivir from a coordinated dive." },
            { championId: 'Leona', isCorrect: false, explanation: "Leona is an engage support. While she has crowd control, she wants to go in, which is the opposite of what's needed here." },
        ],
        correctChoiceExplanation: "Janna is the optimal choice. Her kit is designed to counter 'all-in' and dive compositions. Her ultimate, Monsoon, can single-handedly reset a fight by pushing away champions like Nocturne and Akali, while her tornadoes disrupt their approach. This provides the critical space and time an immobile ADC like Sivir needs to deal damage safely."
    },
    {
        id: 'scenario-02',
        title: 'Balanced Damage Profile',
        description: "Your team (Red side) has accidentally drafted four physical damage champions. You are the last pick for the Mid lane. What do you pick to balance the team's damage profile and prevent the enemy from easily stacking armor?",
        draft: createDraftWithPicks(
            ['Ornn', 'Sejuani', 'Caitlyn', 'Braum', 'Azir'],
            ['Darius', 'LeeSin', null, 'Jhin', 'Nautilus']
        ),
        userContext: { side: 'red', type: 'pick', index: 2 },
        options: [
            { championId: 'Zed', isCorrect: false, explanation: "Zed is a strong assassin but would make the team's damage profile almost entirely physical." },
            { championId: 'Viktor', isCorrect: true, explanation: "Viktor brings immense area-of-effect magic damage, forcing the enemy to build both armor and magic resist." },
            { championId: 'Yasuo', isCorrect: false, explanation: "Yasuo deals physical damage and would further skew the team's damage profile, making them easy to itemize against." },
        ],
        correctChoiceExplanation: "Viktor is the correct choice. When a team is composed almost entirely of one damage type (in this case, AD), the enemy can efficiently counter the entire team by building a single defensive stat (armor). By picking a strong magic damage threat like Viktor, you force the enemy to build both armor and magic resist, making your entire team more effective."
    },
    {
        id: 'scenario-03',
        title: 'Top Lane Counter-Pick',
        description: "You are Blue side's Top laner. The enemy has first-picked Darius, a lane bully who excels in extended trades. What is a strong counter-pick to mitigate his strengths and punish his immobility?",
        draft: createDraftWithPicks(
            [null, null, null, null, null],
            ['Darius', null, null, null, null]
        ),
        userContext: { side: 'blue', type: 'pick', index: 0 },
        options: [
            { championId: 'Garen', isCorrect: false, explanation: "Garen vs. Darius is a classic skill matchup, but Garen has to get into Darius's effective range to trade, which is risky." },
            { championId: 'Vayne', isCorrect: true, explanation: "Vayne's range, mobility, and self-peel make it extremely difficult for Darius to land his abilities or stack his passive." },
            { championId: 'Sett', isCorrect: false, explanation: "Sett is a strong duelist but prefers the kind of extended, close-range brawls where Darius excels." },
        ],
        correctChoiceExplanation: "Vayne is a classic and effective counter to Darius. Her ranged auto-attacks allow her to harass him from a safe distance. Her Tumble (Q) can dodge his Apprehend (E), and her Condemn (E) can interrupt his ultimate or push him away if he gets too close. This prevents him from stacking his passive, which is the core of his laning power."
    }
];
