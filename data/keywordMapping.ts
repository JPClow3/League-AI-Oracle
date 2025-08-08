import { KNOWLEDGE_BASE } from './knowledgeBase';

interface KeywordInfo {
    lessonId: string;
    summary: string;
}

const generateKeywordMap = (): Map<string, KeywordInfo> => {
    const map = new Map<string, KeywordInfo>();
    const addKeyword = (keyword: string, lessonId: string, summary: string) => {
        map.set(keyword.toLowerCase(), { lessonId, summary });
    };
    
    addKeyword('lane bullies', 'df-102', 'Champions who are very strong in the early laning phase and aim to dominate their opponent.');
    addKeyword('snowball', 'df-102', 'The process of using an early advantage to build an even bigger, often unstoppable lead.');
    addKeyword('hyper-carry', 'df-102', 'A champion that becomes exceptionally strong and can carry a team to victory in the late-game if protected.');
    
    // From df-101
    addKeyword('team composition', 'df-101', 'The overall synergy and balance of your team.');
    addKeyword('damage types', 'df-103', 'The mix of AD and AP damage.');
    addKeyword('crowd control', 'df-101', 'Abilities that disable or hinder enemies.');
    addKeyword('cc', 'df-101', 'Abilities that disable or hinder enemies.');
    addKeyword('engage', 'df-101', 'The ability to start a fight on your terms.');
    addKeyword('disengage', 'df-101', 'Abilities or strategies used to safely retreat from a fight.');
    addKeyword('peel', 'df-101', 'Using your abilities to protect your own carries from enemy threats.');
    addKeyword('waveclear', 'df-101', 'The ability to quickly kill waves of minions, often with area-of-effect spells.');

    // From df-102
    addKeyword('win condition', 'df-102', 'Your team\'s primary path to victory.');
    addKeyword('win conditions', 'df-102', 'Your team\'s primary path to victory.');
    addKeyword('poke', 'df-101', 'Dealing damage from a safe distance to wear down enemies before a fight.');
    addKeyword('siege', 'df-101', 'Methodically attacking turrets, often with long-range poke.');
    addKeyword('dive', 'df-101', 'A composition focused on jumping on high-priority targets, often bypassing the frontline.');
    addKeyword('pick', 'df-101', 'A composition focused on catching isolated enemies out of position.');
    addKeyword('split push', 'df-101', 'Pressuring a side lane to create map advantages and draw enemy attention.');
    addKeyword('flex pick', 'df-202', 'A champion that can be played viably in multiple roles, creating draft ambiguity.');
    addKeyword('flex picks', 'df-202', 'Champions that can be played viably in multiple roles, creating draft ambiguity.');
    
    // Generic terms
    addKeyword('power spike', 'df-102', 'A point where a champion becomes significantly stronger, usually after completing a key item or reaching a specific level.');
    addKeyword('power spikes', 'df-102', 'Points where a champion becomes significantly stronger, usually after completing a key item or reaching a specific level.');
    addKeyword('macro', 'df-102', 'Large-scale strategy involving map movements, objective control, and vision.');
    addKeyword('tempo', 'df-101', 'The pace of the game and which team is controlling the flow of actions.');
    
    return map;
};

export const KEYWORD_MAP = generateKeywordMap();