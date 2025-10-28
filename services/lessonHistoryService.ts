/**
 * Lesson History Service
 * Manages lesson history with caching and localStorage persistence
 */

export interface LessonHistoryEntry {
    id: string;
    topic: string;
    content: string;
    timestamp: number;
    useSearch: boolean;
    rating?: 'up' | 'down';
    isFavorite?: boolean;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    role?: string;
    tags?: string[];
    quizCompleted?: boolean;
    quizScore?: number;
}

const CACHE_KEY = 'lessonHistory';
const MAX_CACHE_SIZE = 50;

let memoryCache: LessonHistoryEntry[] | null = null;

/**
 * Initialize and load history from localStorage
 */
export const initializeHistory = async (): Promise<void> => {
    if (memoryCache === null) {
        try {
            const stored = localStorage.getItem(CACHE_KEY);
            memoryCache = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load lesson history:', error);
            memoryCache = [];
        }
    }
};

/**
 * Get all lesson history entries
 */
export const getHistory = async (): Promise<LessonHistoryEntry[]> => {
    await initializeHistory();
    return memoryCache || [];
};

/**
 * Add a new lesson to history
 */
export const addToHistory = async (
    topic: string,
    content: string,
    useSearch: boolean = false
): Promise<void> => {
    await initializeHistory();

    const newEntry: LessonHistoryEntry = {
        id: `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        topic,
        content,
        timestamp: Date.now(),
        useSearch,
    };

    if (!memoryCache) {
        memoryCache = [];
    }

    // Add to beginning of array
    memoryCache.unshift(newEntry);

    // Keep only the most recent MAX_CACHE_SIZE entries
    if (memoryCache.length > MAX_CACHE_SIZE) {
        memoryCache = memoryCache.slice(0, MAX_CACHE_SIZE);
    }

    // Persist to localStorage
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
    } catch (error) {
        console.error('Failed to save lesson history:', error);
    }
};

/**
 * Get a specific lesson by ID
 */
export const getLessonById = async (id: string): Promise<LessonHistoryEntry | null> => {
    const history = await getHistory();
    return history.find(entry => entry.id === id) || null;
};

/**
 * Search history by topic
 */
export const searchHistory = async (query: string): Promise<LessonHistoryEntry[]> => {
    const history = await getHistory();
    const lowerQuery = query.toLowerCase();
    return history.filter(entry =>
        entry.topic.toLowerCase().includes(lowerQuery)
    );
};

/**
 * Delete a specific lesson from history
 */
export const deleteLesson = async (id: string): Promise<void> => {
    await initializeHistory();

    if (!memoryCache) return;

    memoryCache = memoryCache.filter(entry => entry.id !== id);
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
    } catch (error) {
        console.error('Failed to delete lesson:', error);
    }
};

/**
 * Clear all lesson history
 */
export const clearHistory = async (): Promise<void> => {
    memoryCache = [];
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify([]));
    } catch (error) {
        console.error('Failed to clear history:', error);
    }
};

/**
 * Get history statistics
 */
export const getHistoryStats = async () => {
    const history = await getHistory();
    return {
        totalLessons: history.length,
        withSearch: history.filter(e => e.useSearch).length,
        withoutSearch: history.filter(e => !e.useSearch).length,
        oldestTimestamp: history.length > 0 ? Math.min(...history.map(e => e.timestamp)) : null,
        newestTimestamp: history.length > 0 ? Math.max(...history.map(e => e.timestamp)) : null,
    };
};

/**
 * Check if a topic exists in recent history (for duplicate detection)
 */
export const hasRecentLesson = async (topic: string, withinMinutes: number = 5): Promise<boolean> => {
    const history = await getHistory();
    const cutoffTime = Date.now() - (withinMinutes * 60 * 1000);

    return history.some(entry =>
        entry.topic.toLowerCase() === topic.toLowerCase() &&
        entry.timestamp > cutoffTime
    );
};

/**
 * Get recent lessons (alias for getHistory for backwards compatibility)
 */
export const getRecentLessons = getHistory;

/**
 * Get a cached lesson by topic (alias for searchHistory)
 */
export const getCachedLesson = async (topic: string): Promise<LessonHistoryEntry | null> => {
    const results = await searchHistory(topic);
    return results.length > 0 ? results[0]! : null;
};

/**
 * Save a lesson (alias for addToHistory)
 */
export const saveLesson = addToHistory;

/**
 * Update rating for a lesson
 */
export const updateRating = async (id: string, rating: 'up' | 'down'): Promise<void> => {
    await initializeHistory();
    if (!memoryCache) return;

    const lesson = memoryCache.find(entry => entry.id === id);
    if (lesson) {
        lesson.rating = rating;
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
        } catch (error) {
            console.error('Failed to update lesson rating:', error);
        }
    }
};

/**
 * Toggle favorite status for a lesson
 */
export const toggleFavorite = async (id: string): Promise<boolean> => {
    await initializeHistory();
    if (!memoryCache) return false;

    const lesson = memoryCache.find(entry => entry.id === id);
    if (lesson) {
        lesson.isFavorite = !lesson.isFavorite;
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
            return lesson.isFavorite;
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    }
    return false;
};

/**
 * Get favorite lessons
 */
export const getFavorites = async (): Promise<LessonHistoryEntry[]> => {
    const history = await getHistory();
    return history.filter(entry => entry.isFavorite);
};

/**
 * Update lesson metadata (difficulty, role, tags)
 */
export const updateLessonMetadata = async (
    id: string,
    metadata: { difficulty?: string; role?: string; tags?: string[] }
): Promise<void> => {
    await initializeHistory();
    if (!memoryCache) return;

    const lesson = memoryCache.find(entry => entry.id === id);
    if (lesson) {
        if (metadata.difficulty) lesson.difficulty = metadata.difficulty as any;
        if (metadata.role) lesson.role = metadata.role;
        if (metadata.tags) lesson.tags = metadata.tags;

        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
        } catch (error) {
            console.error('Failed to update lesson metadata:', error);
        }
    }
};

/**
 * Mark quiz as completed with score
 */
export const updateQuizResults = async (id: string, score: number): Promise<void> => {
    await initializeHistory();
    if (!memoryCache) return;

    const lesson = memoryCache.find(entry => entry.id === id);
    if (lesson) {
        lesson.quizCompleted = true;
        lesson.quizScore = score;
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
        } catch (error) {
            console.error('Failed to update quiz results:', error);
        }
    }
};

/**
 * Get statistics (alias for getHistoryStats)
 */
export const getStats = getHistoryStats;

/**
 * Get lesson recommendations based on history
 */
export const getRecommendations = async (count: number = 5): Promise<string[]> => {
    await initializeHistory();

    // Analyze user's learning history
    const history = memoryCache || [];
    const recentTopics = history.slice(0, 10).map(e => e.topic.toLowerCase());

    // Build comprehensive recommendation pool
    const allRecommendations = [
        'Wave Management Fundamentals',
        'Vision Control & Map Awareness',
        'Team Fight Positioning',
        'Objective Priority & Timing',
        'Power Spikes & Item Breakpoints',
        'Lane Trading Patterns',
        'Roaming & Map Pressure',
        'Champion Matchup Analysis',
        'Macro Rotations & Tempo',
        'Communication & Shotcalling',
        'Late Game Scaling Strategies',
        'Early Game Jungle Pathing',
        'Support Warding Routes',
        'ADC Kiting Techniques',
        'Mid Lane Wave Control',
        'Top Lane Split Push Timing',
        'Counter-Jungling Strategies',
        'Dragon Soul Priority',
        'Baron Power Plays',
        'Elder Dragon Execution'
    ];

    // Filter out recently viewed topics
    const filtered = allRecommendations.filter(topic =>
        !recentTopics.some(recent => topic.toLowerCase().includes(recent) || recent.includes(topic.toLowerCase()))
    );

    // Return shuffled recommendations
    return filtered.sort(() => Math.random() - 0.5).slice(0, count);
};

/**
 * Full-text search across all lesson content
 */
export const fullTextSearch = async (query: string): Promise<LessonHistoryEntry[]> => {
    const history = await getHistory();
    const lowerQuery = query.toLowerCase();
    return history.filter(entry =>
        entry.topic.toLowerCase().includes(lowerQuery) ||
        entry.content.toLowerCase().includes(lowerQuery) ||
        entry.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
};

/**
 * Filter lessons by criteria
 */
export const filterLessons = async (filters: {
    difficulty?: string;
    role?: string;
    favorites?: boolean;
    withQuiz?: boolean;
}): Promise<LessonHistoryEntry[]> => {
    const history = await getHistory();

    return history.filter(entry => {
        if (filters.difficulty && entry.difficulty !== filters.difficulty) return false;
        if (filters.role && entry.role !== filters.role) return false;
        if (filters.favorites && !entry.isFavorite) return false;
        if (filters.withQuiz && !entry.quizCompleted) return false;
        return true;
    });
};
export const updateQuizResults = async (id: string, score: number): Promise<void> => {
    await initializeHistory();
    if (!memoryCache) return;

    const lesson = memoryCache.find(entry => entry.id === id);
    if (lesson) {
        lesson.quizCompleted = true;
        lesson.quizScore = score;
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
        } catch (error) {
            console.error('Failed to update quiz results:', error);
        }
    }
};

/**
 * Get statistics (alias for getHistoryStats)
 */
export const getStats = getHistoryStats;

/**
 * Get lesson recommendations based on history
 */
export const getRecommendations = async (count: number = 5): Promise<string[]> => {
    await initializeHistory();

    // Analyze user's learning history
    const history = memoryCache || [];
    const recentTopics = history.slice(0, 10).map(e => e.topic.toLowerCase());

    // Build comprehensive recommendation pool
    const allRecommendations = [
        'Wave Management Fundamentals',
        'Vision Control & Map Awareness',
        'Team Fight Positioning',
        'Objective Priority & Timing',
        'Power Spikes & Item Breakpoints',
        'Lane Trading Patterns',
        'Roaming & Map Pressure',
        'Champion Matchup Analysis',
        'Macro Rotations & Tempo',
        'Communication & Shotcalling',
        'Late Game Scaling Strategies',
        'Early Game Jungle Pathing',
        'Support Warding Routes',
        'ADC Kiting Techniques',
        'Mid Lane Wave Control',
        'Top Lane Split Push Timing',
        'Counter-Jungling Strategies',
        'Dragon Soul Priority',
        'Baron Power Plays',
        'Elder Dragon Execution'
    ];

    // Filter out recently viewed topics
    const filtered = allRecommendations.filter(topic =>
        !recentTopics.some(recent => topic.toLowerCase().includes(recent) || recent.includes(topic.toLowerCase()))
    );

    // Return shuffled recommendations
    return filtered.sort(() => Math.random() - 0.5).slice(0, count);
};

/**
 * Full-text search across all lesson content
 */
export const fullTextSearch = async (query: string): Promise<LessonHistoryEntry[]> => {
    const history = await getHistory();
    const lowerQuery = query.toLowerCase();
    return history.filter(entry =>
        entry.topic.toLowerCase().includes(lowerQuery) ||
        entry.content.toLowerCase().includes(lowerQuery) ||
        entry.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
};

/**
 * Filter lessons by criteria
 */
export const filterLessons = async (filters: {
    difficulty?: string;
    role?: string;
    favorites?: boolean;
    withQuiz?: boolean;
}): Promise<LessonHistoryEntry[]> => {
    const history = await getHistory();

    return history.filter(entry => {
        if (filters.difficulty && entry.difficulty !== filters.difficulty) return false;
        if (filters.role && entry.role !== filters.role) return false;
        if (filters.favorites && !entry.isFavorite) return false;
        if (filters.withQuiz && !entry.quizCompleted) return false;
        return true;
    });
};
};

