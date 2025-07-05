
import { create } from 'zustand';
import { Champion, DraftState, Role, Team } from '../types';
import { getDraftSequence } from '../data/draftRules';

const ROLES: Role[] = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'SUPPORT'];

const createInitialState = (mode: 'SOLO_QUEUE' | 'COMPETITIVE'): DraftState => ({
  mode,
  blueTeam: { picks: ROLES.map(r => ({ champion: null, role: r })), bans: Array(5).fill(null) },
  redTeam: { picks: ROLES.map(r => ({ champion: null, role: r })), bans: Array(5).fill(null) },
  currentTurn: 0,
  pickedChampions: new Set(),
  history: [],
  analysis: undefined,
});

interface DraftStoreActions {
  setMode: (mode: 'SOLO_QUEUE' | 'COMPETITIVE') => void;
  setChampion: (champion: Champion) => void;
  setChampionInLab: (team: Team, index: number, champion: Champion) => void;
  swapChampions: (team: Team, index1: number, index2: number) => void;
  undo: () => void;
  resetDraft: () => void;
  loadDraft: (draft: DraftState) => void;
}

interface DraftStore {
  actions: DraftStoreActions;
}

export const useDraftStore = create<DraftState & DraftStore>((set, get) => ({
  ...createInitialState('COMPETITIVE'),
  actions: {
    setMode: (mode) => set(createInitialState(mode)),
    setChampion: (champion) => set(state => {
      if (state.pickedChampions.has(champion.id)) return state;

      const sequence = getDraftSequence(state.mode);
      if (state.currentTurn >= sequence.length) return state;

      const history = [...state.history, { ...state, pickedChampions: new Set(state.pickedChampions) }];
      const currentAction = sequence[state.currentTurn];

      const teamKey = currentAction.team === 'BLUE' ? 'blueTeam' : 'redTeam';
      const teamState = state[teamKey];
      let newPicks = [...teamState.picks];
      let newBans = [...teamState.bans];

      if (currentAction.type === 'BAN') {
        const banIndex = teamState.bans.findIndex(b => b === null);
        if (banIndex !== -1) newBans[banIndex] = champion;
      } else { // PICK
        const pickIndex = teamState.picks.findIndex(p => p.champion === null);
        if (pickIndex !== -1) newPicks[pickIndex] = { ...newPicks[pickIndex], champion };
      }

      return {
        ...state,
        [teamKey]: { ...teamState, picks: newPicks, bans: newBans },
        currentTurn: state.currentTurn + 1,
        pickedChampions: new Set(state.pickedChampions).add(champion.id),
        history,
        analysis: undefined,
      };
    }),
    setChampionInLab: (team, index, champion) => set(state => {
      const newState = { ...state, pickedChampions: new Set(state.pickedChampions) };

      const clearChampion = (teamKey: 'blueTeam' | 'redTeam') => {
        const teamPicks = newState[teamKey].picks;
        const champIndex = teamPicks.findIndex(p => p.champion?.id === champion.id);
        if (champIndex !== -1) {
          newState.pickedChampions.delete(teamPicks[champIndex].champion!.id);
          teamPicks[champIndex] = { ...teamPicks[champIndex], champion: null };
        }
      };
      
      clearChampion('blueTeam');
      clearChampion('redTeam');
      
      const targetTeamKey = team === 'BLUE' ? 'blueTeam' : 'redTeam';
      const oldChampion = newState[targetTeamKey].picks[index].champion;
      if (oldChampion) newState.pickedChampions.delete(oldChampion.id);

      newState[targetTeamKey].picks[index] = { ...newState[targetTeamKey].picks[index], champion };
      newState.pickedChampions.add(champion.id);

      return { ...newState, analysis: undefined };
    }),
    swapChampions: (team, index1, index2) => set(state => {
        if (index1 < 0 || index1 > 4 || index2 < 0 || index2 > 4) return state;
        const history = [...state.history, { ...state, pickedChampions: new Set(state.pickedChampions) }];
        const teamKey = team === 'BLUE' ? 'blueTeam' : 'redTeam';
        const teamState = state[teamKey];
        const newPicks = [...teamState.picks];
        
        const tempChampion = newPicks[index1].champion;
        newPicks[index1] = { ...newPicks[index1], champion: newPicks[index2].champion };
        newPicks[index2] = { ...newPicks[index2], champion: tempChampion };
        
        return {
            ...state,
            [teamKey]: { ...teamState, picks: newPicks },
            history,
            analysis: undefined,
        };
    }),
    undo: () => set(state => {
      if (state.history.length === 0) return state;
      const lastState = state.history[state.history.length - 1];
      return { ...lastState, history: lastState.history.slice(0, -1), analysis: undefined };
    }),
    resetDraft: () => set(state => createInitialState(state.mode)),
    loadDraft: (draft) => set({ ...draft, pickedChampions: new Set(draft.pickedChampions), history: [] }),
  }
}));
