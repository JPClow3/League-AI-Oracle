/**
 * Curated Learning Playlists
 * Structured learning paths for different roles and skill levels
 */

export interface LearningPlaylist {
    id: string;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    role?: string;
    estimatedTime: string; // e.g., "2 hours"
    lessons: string[]; // Topic strings for lesson generation
    icon: string; // Emoji or icon identifier
}

export const LEARNING_PLAYLISTS: LearningPlaylist[] = [
    {
        id: 'beginner-fundamentals',
        title: 'Beginner Fundamentals',
        description: 'Essential concepts every League player should master',
        difficulty: 'beginner',
        estimatedTime: '3 hours',
        icon: '🎯',
        lessons: [
            'Understanding Team Compositions',
            'Basic Wave Management',
            'Introduction to Vision Control',
            'Objective Priority for Beginners',
            'Understanding Power Spikes'
        ]
    },
    {
        id: 'jungle-mastery',
        title: 'Jungle Mastery Path',
        description: 'Complete guide to dominating the jungle role',
        difficulty: 'intermediate',
        role: 'Jungle',
        estimatedTime: '4 hours',
        icon: '🌲',
        lessons: [
            'Optimal Jungle Pathing',
            'Gank Timing & Lane States',
            'Counter-Jungling Strategies',
            'Tracking the Enemy Jungler',
            'Jungle-Mid Synergy',
            'Securing Objectives as Jungler'
        ]
    },
    {
        id: 'support-excellence',
        title: 'Support Excellence',
        description: 'Master the art of supporting your team',
        difficulty: 'intermediate',
        role: 'Support',
        estimatedTime: '3.5 hours',
        icon: '🛡️',
        lessons: [
            'Support Warding Routes',
            'Roaming Timing for Supports',
            'Peel vs Engage Decision Making',
            'Vision Denial Techniques',
            'Supporting Different ADC Playstyles',
            'Late Game Support Positioning'
        ]
    },
    {
        id: 'adc-positioning',
        title: 'ADC Positioning & Mechanics',
        description: 'Learn to survive and carry as ADC',
        difficulty: 'intermediate',
        role: 'ADC',
        estimatedTime: '3 hours',
        icon: '🎯',
        lessons: [
            'ADC Kiting Fundamentals',
            'Team Fight Positioning for ADC',
            'Trading in Bot Lane',
            'Wave Management as ADC',
            'Target Selection in Fights',
            'Playing from Behind as ADC'
        ]
    },
    {
        id: 'mid-lane-domination',
        title: 'Mid Lane Domination',
        description: 'Control the map from the middle',
        difficulty: 'intermediate',
        role: 'Mid',
        estimatedTime: '4 hours',
        icon: '⚡',
        lessons: [
            'Mid Lane Wave Management',
            'Roaming Timing & Efficiency',
            'Trading Stance in Mid Lane',
            'Jungle-Mid Coordination',
            'Assassin vs Control Mage Matchups',
            'Mid Game Shotcalling'
        ]
    },
    {
        id: 'top-lane-fundamentals',
        title: 'Top Lane Fundamentals',
        description: 'Master the island and impact the map',
        difficulty: 'intermediate',
        role: 'Top',
        estimatedTime: '3.5 hours',
        icon: '⚔️',
        lessons: [
            'Top Lane Wave Management',
            'Split Push Timing & Safety',
            'Teleport Play Decisions',
            'Playing Tanks vs Carries',
            'Top Lane 1v1 Trading',
            'Joining Team Fights from Top'
        ]
    },
    {
        id: 'advanced-macro',
        title: 'Advanced Macro Strategy',
        description: 'High-level strategic concepts for competitive play',
        difficulty: 'advanced',
        estimatedTime: '5 hours',
        icon: '🧠',
        lessons: [
            'Wave Manipulation & Tempo Control',
            'Baron & Elder Setups',
            'Side Lane Pressure Coordination',
            'Vision Line Theory',
            'Draft-to-Game Execution',
            'Late Game Win Conditions',
            'Comeback Mechanics & Gold Swings'
        ]
    },
    {
        id: 'team-fighting',
        title: 'Team Fighting Mastery',
        description: 'Win critical 5v5 engagements',
        difficulty: 'advanced',
        estimatedTime: '2.5 hours',
        icon: '⚔️',
        lessons: [
            'Team Fight Positioning by Role',
            'Target Selection & Focus Fire',
            'Ability Timing & Cooldown Tracking',
            'Peeling vs Diving Priority',
            'Team Fight Win Conditions'
        ]
    },
    {
        id: 'drafting-expert',
        title: 'Draft Phase Expert',
        description: 'Win games before they start',
        difficulty: 'advanced',
        estimatedTime: '4 hours',
        icon: '📋',
        lessons: [
            'Team Composition Archetypes',
            'Counter-Picking Strategies',
            'Flex Picks & Draft Flexibility',
            'Power Pick Priority in Meta',
            'Blind Pick Safety',
            'Reading Enemy Draft Intent',
            'Red Side vs Blue Side Strategies'
        ]
    },
    {
        id: 'climbing-solo-queue',
        title: 'Solo Queue Climbing',
        description: 'Practical strategies for consistent LP gains',
        difficulty: 'intermediate',
        estimatedTime: '3 hours',
        icon: '📈',
        lessons: [
            'Champion Pool Optimization',
            'Mental Game & Tilt Management',
            'When to Dodge Games',
            'Identifying Winnable Games',
            'Shotcalling in Solo Queue',
            'Playing Through Your Win Condition'
        ]
    }
];

/**
 * Get playlist by ID
 */
export const getPlaylistById = (id: string): LearningPlaylist | undefined => {
    return LEARNING_PLAYLISTS.find(p => p.id === id);
};

/**
 * Get playlists filtered by criteria
 */
export const getFilteredPlaylists = (filters: {
    difficulty?: string;
    role?: string;
}): LearningPlaylist[] => {
    return LEARNING_PLAYLISTS.filter(playlist => {
        if (filters.difficulty && playlist.difficulty !== filters.difficulty) return false;
        if (filters.role && playlist.role !== filters.role) return false;
        return true;
    });
};

