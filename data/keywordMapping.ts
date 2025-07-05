
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
    
    addKeyword('lane bullies', 'strat-102', 'Champions who are very strong in the early laning phase and aim to dominate their opponent.');
    addKeyword('snowball', 'strat-102', 'The process of using an early advantage to build an even bigger, often unstoppable lead.');
    addKeyword('hyper-carry', 'strat-102', 'A champion that becomes exceptionally strong and can carry a team to victory in the late-game if protected.');
    
    // From strat-101
    addKeyword('team composition', 'strat-101', 'The overall synergy and balance of your team.');
    addKeyword('damage types', 'comp-201', 'The mix of AD and AP damage.');
    addKeyword('crowd control', 'strat-101', 'Abilities that disable or hinder enemies.');
    addKeyword('cc', 'strat-101', 'Abilities that disable or hinder enemies.');
    addKeyword('engage', 'strat-101', 'The ability to start a fight on your terms.');
    addKeyword('disengage', 'strat-101', 'Abilities or strategies used to safely retreat from a fight.');
    addKeyword('peel', 'strat-101', 'Using your abilities to protect your own carries from enemy threats.');
    addKeyword('waveclear', 'strat-101', 'The ability to quickly kill waves of minions, often with area-of-effect spells.');

    // From strat-102
    addKeyword('win condition', 'strat-102', 'Your team\'s primary path to victory.');
    addKeyword('win conditions', 'strat-102', 'Your team\'s primary path to victory.');
    addKeyword('poke', 'strat-102', 'Dealing damage from a safe distance to wear down enemies before a fight.');
    addKeyword('siege', 'strat-102', 'Methodically attacking turrets, often with long-range poke.');
    addKeyword('dive', 'strat-102', 'A composition focused on jumping on high-priority targets, often bypassing the frontline.');
    addKeyword('pick', 'strat-102', 'A composition focused on catching isolated enemies out of position.');
    addKeyword('split push', 'strat-102', 'Pressuring a side lane to create map advantages and draw enemy attention.');
    addKeyword('flex pick', 'df-202', 'A champion that can be played viably in multiple roles, creating draft ambiguity.');
    addKeyword('flex picks', 'df-202', 'Champions that can be played viably in multiple roles, creating draft ambiguity.');
    
    // Generic terms
    addKeyword('power spike', 'strat-102', 'A point where a champion becomes significantly stronger, usually after completing a key item or reaching a specific level.');
    addKeyword('power spikes', 'strat-102', 'Points where a champion becomes significantly stronger, usually after completing a key item or reaching a specific level.');
    addKeyword('macro', 'strat-102', 'Large-scale strategy involving map movements, objective control, and vision.');
    addKeyword('tempo', 'strat-101', 'The pace of the game and which team is controlling the flow of actions.');
    
    return map;
};

export const KEYWORD_MAP = generateKeywordMap();
