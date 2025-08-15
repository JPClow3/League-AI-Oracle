
import type { TeamSide } from '../../types';

export interface DraftTurn {
  team: TeamSide;
  type: 'ban' | 'pick';
  index: number;
}

// Standard competitive draft order
export const COMPETITIVE_SEQUENCE: DraftTurn[] = [
  // Ban Phase 1
  { team: 'blue', type: 'ban', index: 0 },
  { team: 'red', type: 'ban', index: 0 },
  { team: 'blue', type: 'ban', index: 1 },
  { team: 'red', type: 'ban', index: 1 },
  { team: 'blue', type: 'ban', index: 2 },
  { team: 'red', type: 'ban', index: 2 },
  
  // Pick Phase 1
  { team: 'blue', type: 'pick', index: 0 }, // Top
  { team: 'red', type: 'pick', index: 0 }, // Top
  { team: 'red', type: 'pick', index: 1 }, // Jungle
  { team: 'blue', type: 'pick', index: 1 }, // Jungle
  { team: 'blue', type: 'pick', index: 2 }, // Mid
  { team: 'red', type: 'pick', index: 2 }, // Mid

  // Ban Phase 2
  { team: 'red', type: 'ban', index: 3 },
  { team: 'blue', type: 'ban', index: 3 },
  { team: 'red', type: 'ban', index: 4 },
  { team: 'blue', type: 'ban', index: 4 },

  // Pick Phase 2
  { team: 'red', type: 'pick', index: 3 }, // ADC
  { team: 'blue', type: 'pick', index: 3 }, // ADC
  { team: 'blue', type: 'pick', index: 4 }, // Support
  { team: 'red', type: 'pick', index: 4 }, // Support
];