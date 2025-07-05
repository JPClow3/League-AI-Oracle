

import { Team, DraftActionType } from '../types';

export interface DraftTurn {
  team: Team;
  type: DraftActionType;
  phase: string;
}

const SOLO_QUEUE_SEQUENCE: DraftTurn[] = [
  // Ban Phase
  { team: 'BLUE', type: 'BAN', phase: 'Ban Phase' }, { team: 'RED', type: 'BAN', phase: 'Ban Phase' },
  { team: 'BLUE', type: 'BAN', phase: 'Ban Phase' }, { team: 'RED', type: 'BAN', phase: 'Ban Phase' },
  { team: 'BLUE', type: 'BAN', phase: 'Ban Phase' }, { team: 'RED', type: 'BAN', phase: 'Ban Phase' },
  { team: 'BLUE', type: 'BAN', phase: 'Ban Phase' }, { team: 'RED', type: 'BAN', phase: 'Ban Phase' },
  { team: 'BLUE', type: 'BAN', phase: 'Ban Phase' }, { team: 'RED', type: 'BAN', phase: 'Ban Phase' },
  // Pick Phase
  { team: 'BLUE', type: 'PICK', phase: 'Pick Phase' }, { team: 'RED', type: 'PICK', phase: 'Pick Phase' },
  { team: 'RED', type: 'PICK', phase: 'Pick Phase' }, { team: 'BLUE', type: 'PICK', phase: 'Pick Phase' },
  { team: 'BLUE', type: 'PICK', phase: 'Pick Phase' }, { team: 'RED', type: 'PICK', phase: 'Pick Phase' },
  { team: 'RED', type: 'PICK', phase: 'Pick Phase' }, { team: 'BLUE', type: 'PICK', phase: 'Pick Phase' },
  { team: 'BLUE', type: 'PICK', phase: 'Pick Phase' }, { team: 'RED', type: 'PICK', phase: 'Pick Phase' },
];

const COMPETITIVE_SEQUENCE: DraftTurn[] = [
  // Ban Phase 1
  { team: 'BLUE', type: 'BAN', phase: 'Ban Phase 1' }, { team: 'RED', type: 'BAN', phase: 'Ban Phase 1' },
  { team: 'BLUE', type: 'BAN', phase: 'Ban Phase 1' }, { team: 'RED', type: 'BAN', phase: 'Ban Phase 1' },
  { team: 'BLUE', type: 'BAN', phase: 'Ban Phase 1' }, { team: 'RED', type: 'BAN', phase: 'Ban Phase 1' },
  // Pick Phase 1
  { team: 'BLUE', type: 'PICK', phase: 'Pick Phase 1' },
  { team: 'RED', type: 'PICK', phase: 'Pick Phase 1' }, { team: 'RED', type: 'PICK', phase: 'Pick Phase 1' },
  { team: 'BLUE', type: 'PICK', phase: 'Pick Phase 1' }, { team: 'BLUE', type: 'PICK', phase: 'Pick Phase 1' },
  { team: 'RED', type: 'PICK', phase: 'Pick Phase 1' },
  // Ban Phase 2
  { team: 'RED', type: 'BAN', phase: 'Ban Phase 2' }, { team: 'BLUE', type: 'BAN', phase: 'Ban Phase 2' },
  { team: 'RED', type: 'BAN', phase: 'Ban Phase 2' }, { team: 'BLUE', type: 'BAN', phase: 'Ban Phase 2' },
  // Pick Phase 2
  { team: 'RED', type: 'PICK', phase: 'Pick Phase 2' }, { team: 'BLUE', type: 'PICK', phase: 'Pick Phase 2' },
  { team: 'BLUE', type: 'PICK', phase: 'Pick Phase 2' }, { team: 'RED', type: 'PICK', phase: 'Pick Phase 2' },
];

export const getDraftSequence = (mode: 'SOLO_QUEUE' | 'COMPETITIVE'): DraftTurn[] => {
  return mode === 'SOLO_QUEUE' ? SOLO_QUEUE_SEQUENCE : COMPETITIVE_SEQUENCE;
};