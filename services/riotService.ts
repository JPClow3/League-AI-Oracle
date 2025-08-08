import { RiotAccount, SummonerDTO, ChampionMasteryDTO, LeagueEntryDTO, MatchDTO, LiveGameDTO } from '../types';

const RIOT_API_KEY = process.env.RIOT_API_KEY;

let consecutiveFailures = 0;
let blockRequestsUntil = 0;
const MAX_FAILURES = 5;
const BLOCK_DURATION_MS = 60 * 1000; // 1 minute

export const RIOT_PLATFORMS: Record<string, string> = {
    'NA1': 'North America',
    'EUW1': 'Europe West',
    'EUN1': 'Europe Nordic & East',
    'KR': 'Korea',
    'BR1': 'Brazil',
    'JP1': 'Japan',
    'RU': 'Russia',
    'OC1': 'Oceania',
    'TR1': 'Turkey',
    'LA1': 'LAN',
    'LA2': 'LAS',
};

// Maps platform routing value (e.g. NA1) to regional routing value (e.g. americas)
const PLATFORM_TO_REGION_MAP: Record<string, string> = {
    'NA1': 'americas', 'BR1': 'americas', 'LA1': 'americas', 'LA2': 'americas',
    'EUW1': 'europe', 'EUN1': 'europe', 'TR1': 'europe', 'RU': 'europe',
    'KR': 'asia', 'JP1': 'asia',
    'OC1': 'sea', 'PH2': 'sea', 'SG2': 'sea', 'TH2': 'sea', 'TW2': 'sea', 'VN2': 'sea',
};

const getRegionalBaseUrl = (platformId: string) => `https://${PLATFORM_TO_REGION_MAP[platformId] || 'americas'}.api.riotgames.com`;
const getPlatformBaseUrl = (platformId: string) => `https://${platformId}.api.riotgames.com`;


class RiotService {
    public isConfigured(): boolean {
        return !!RIOT_API_KEY;
    }

    private async apiRequest<T>(url: string): Promise<T> {
        if (!this.isConfigured()) {
            throw new Error("Riot API functionality is disabled. Please provide a RIOT_API_KEY in the app's environment settings to enable it.");
        }
        
        if (Date.now() < blockRequestsUntil) {
            throw new Error(`Riot API requests are temporarily blocked due to too many errors. Please wait a moment.`);
        }

        try {
            const response = await fetch(url, {
                headers: { "X-Riot-Token": RIOT_API_KEY! }
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                const statusMessage = errorBody.status?.message || 'An unknown error occurred';
                if (response.status === 403) {
                    throw new Error(`Riot API Error 403: Forbidden. Your API key may have expired or is invalid.`);
                }
                if (response.status === 404) {
                    throw new Error(`Data not found. The player may not be in a live game, or the Riot ID is incorrect.`);
                }
                if (response.status === 429) {
                    consecutiveFailures = MAX_FAILURES; // Immediately trigger block on 429
                    throw new Error(`Riot API Error 429: Rate limit exceeded. Requests will be blocked for a short period.`);
                }
                throw new Error(`Riot API Error: ${response.status} - ${statusMessage}`);
            }

            consecutiveFailures = 0; // Reset on successful request
            return response.json();
        } catch (error) {
            consecutiveFailures++;
            if (consecutiveFailures >= MAX_FAILURES) {
                blockRequestsUntil = Date.now() + BLOCK_DURATION_MS;
                consecutiveFailures = 0; // Reset after setting block
                throw new Error('Too many failed requests. Access to Riot API temporarily blocked to prevent rate-limiting. Please wait a minute and try again.');
            }
            throw error; // Re-throw the original error
        }
    }
    
    public async getAccountByRiotId(gameName: string, tagLine: string, platformId: string): Promise<RiotAccount> {
        const baseUrl = getRegionalBaseUrl(platformId);
        const url = `${baseUrl}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
        return this.apiRequest<RiotAccount>(url);
    }
    
    public async getSummonerByPuuid(puuid: string, platformId: string): Promise<SummonerDTO> {
        const baseUrl = getPlatformBaseUrl(platformId);
        const url = `${baseUrl}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
        return this.apiRequest<SummonerDTO>(url);
    }
    
    public async getChampionMasteryByPuuid(puuid: string, platformId: string): Promise<ChampionMasteryDTO[]> {
        const baseUrl = getPlatformBaseUrl(platformId);
        const url = `${baseUrl}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`;
        return this.apiRequest<ChampionMasteryDTO[]>(url);
    }

    public async getLeagueEntriesBySummonerId(summonerId: string, platformId: string): Promise<LeagueEntryDTO[]> {
        const baseUrl = getPlatformBaseUrl(platformId);
        const url = `${baseUrl}/lol/league/v4/entries/by-summoner/${summonerId}`;
        return this.apiRequest<LeagueEntryDTO[]>(url);
    }

    public async getMatchIdsByPuuid(puuid: string, platformId: string, count: number = 20): Promise<string[]> {
        const baseUrl = getRegionalBaseUrl(platformId);
        const url = `${baseUrl}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;
        return this.apiRequest<string[]>(url);
    }

    public async getMatchData(matchId: string, platformId: string): Promise<MatchDTO> {
        const baseUrl = getRegionalBaseUrl(platformId);
        const url = `${baseUrl}/lol/match/v5/matches/${matchId}`;
        return this.apiRequest<MatchDTO>(url);
    }

    public async getCurrentGameByPuuid(puuid: string, platformId: string): Promise<LiveGameDTO> {
        const baseUrl = getPlatformBaseUrl(platformId);
        const url = `${baseUrl}/lol/spectator/v5/active-games/by-summoner/${puuid}`;
        return this.apiRequest<LiveGameDTO>(url);
    }
}

export const riotService = new RiotService();