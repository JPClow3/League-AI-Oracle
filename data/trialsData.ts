import { Trial } from '../types';

export const TRIALS_DATA: Trial[] = [
    {
        id: 'trial-comp-201-1',
        lessonId: 'df-103', // Updated to correct lesson ID
        title: 'Balancing Damage',
        scenario: 'Your team has already picked Zed (Mid) and Jhin (Bot). Both are AD champions. It is your turn to pick a Jungler.',
        question: 'Which champion would be the best choice to balance your team\'s damage profile?',
        options: [
            { text: 'Lee Sin (AD)', isCorrect: false },
            { text: 'Elise (AP)', isCorrect: true },
            { text: 'Kha\'Zix (AD)', isCorrect: false },
        ]
    },
    {
        id: 'trial-df-101-1', // Updated ID to match lesson
        lessonId: 'df-101',
        title: 'Identifying Missing Pieces',
        scenario: 'Your team composition consists of Ezreal, Lux, Jayce, and Teemo. The enemy team has strong engage champions like Malphite and Jarvan IV.',
        question: 'Your team is lacking a critical component. What is it?',
        options: [
            { text: 'More Poke Damage', isCorrect: false },
            { text: 'A Tank and Disengage/Peel', isCorrect: true },
            { text: 'More Waveclear', isCorrect: false },
        ]
    },
     {
        id: 'trial-df-102-1',
        lessonId: 'df-102',
        title: 'Recognizing Win Conditions',
        scenario: 'Analyze the provided draft and determine the Blue Team\'s path to victory.',
        draftState: {
            blueTeam: { picks: [
                { championName: 'Ornn', role: 'TOP' },
                { championName: 'Sejuani', role: 'JUNGLE' },
                { championName: 'Orianna', role: 'MIDDLE' },
                { championName: 'Kog\'Maw', role: 'BOTTOM' },
                { championName: 'Lulu', role: 'SUPPORT' },
            ]},
            redTeam: { picks: [
                { championName: 'Renekton', role: 'TOP' },
                { championName: 'Lee Sin', role: 'JUNGLE' },
                { championName: 'Zed', role: 'MIDDLE' },
                { championName: 'Draven', role: 'BOTTOM' },
                { championName: 'Leona', role: 'SUPPORT' },
            ]},
        },
        question: 'What is the Blue Team\'s primary win condition?',
        options: [
            { text: 'Force fights early to snowball a lead with Sejuani and Ornn.', isCorrect: false },
            { text: 'Split push with Ornn while the rest of the team creates pressure elsewhere.', isCorrect: false },
            { text: 'Survive the aggressive early game and win late-game teamfights by protecting Kog\'Maw.', isCorrect: true },
        ]
    },
];