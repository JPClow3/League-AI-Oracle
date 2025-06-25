
import { Team, TeamSide, DraftStep } from './types';

/**
 * Creates the draft flow for a standard Ranked game based on the user's side.
 * Uses more descriptive phase names.
 * @param userSide The side the user is playing on ('BLUE' or 'RED').
 * @returns The generated array of DraftSteps.
 */
export const createSoloQueueFlow = (userSide: TeamSide): DraftStep[] => {
  const yourTeam = userSide === 'BLUE' ? Team.YourTeam : Team.EnemyTeam;
  const enemyTeam = userSide === 'BLUE' ? Team.EnemyTeam : Team.YourTeam;

  // Universal pick & ban order for Solo Queue
  // B B B B B (YourTeam if Blue, EnemyTeam if Red for first slot)
  // R R R R R
  // B P1
  // R P1, P2
  // B P2, P3
  // R P3, P4
  // B P4, P5
  // R P5

  const banSteps: DraftStep[] = [];
  const pickSteps: DraftStep[] = [];

  // Ban Phase (10 bans total, alternating)
  // Correctly alternates based on actual Blue/Red, then maps to YourTeam/EnemyTeam
  const actualBlue = Team.YourTeam; // Abstract Blue
  const actualRed = Team.EnemyTeam;   // Abstract Red

  for (let i = 0; i < 5; i++) {
    banSteps.push({ type: 'BAN', team: (userSide === 'BLUE' ? actualBlue : actualRed), phase: 'Ban Phase' });
    banSteps.push({ type: 'BAN', team: (userSide === 'BLUE' ? actualRed : actualBlue), phase: 'Ban Phase' });
  }
  
  // Pick Phase
  pickSteps.push({ type: 'PICK', team: (userSide === 'BLUE' ? actualBlue : actualRed), phase: 'Pick Phase' }); // B1

  pickSteps.push({ type: 'PICK', team: (userSide === 'BLUE' ? actualRed : actualBlue), phase: 'Pick Phase' }); // R1
  pickSteps.push({ type: 'PICK', team: (userSide === 'BLUE' ? actualRed : actualBlue), phase: 'Pick Phase' }); // R2

  pickSteps.push({ type: 'PICK', team: (userSide === 'BLUE' ? actualBlue : actualRed), phase: 'Pick Phase' }); // B2
  pickSteps.push({ type: 'PICK', team: (userSide === 'BLUE' ? actualBlue : actualRed), phase: 'Pick Phase' }); // B3

  pickSteps.push({ type: 'PICK', team: (userSide === 'BLUE' ? actualRed : actualBlue), phase: 'Pick Phase' }); // R3
  pickSteps.push({ type: 'PICK', team: (userSide === 'BLUE' ? actualRed : actualBlue), phase: 'Pick Phase' }); // R4

  pickSteps.push({ type: 'PICK', team: (userSide === 'BLUE' ? actualBlue : actualRed), phase: 'Pick Phase' }); // B4
  pickSteps.push({ type: 'PICK', team: (userSide === 'BLUE' ? actualBlue : actualRed), phase: 'Pick Phase' }); // B5
  
  pickSteps.push({ type: 'PICK', team: (userSide === 'BLUE' ? actualRed : actualBlue), phase: 'Pick Phase' }); // R5

  return [...banSteps, ...pickSteps];
};


/**
 * Creates the draft flow for a competitive game based on the user's side.
 * @param userSide The side the user is playing on ('BLUE' or 'RED').
 * @returns The generated array of DraftSteps.
 */
export const createProfessionalFlow = (userSide: TeamSide): DraftStep[] => {
  const yourTeam = userSide === 'BLUE' ? Team.YourTeam : Team.EnemyTeam;
  const enemyTeam = userSide === 'BLUE' ? Team.EnemyTeam : Team.YourTeam;
  
  const actualBlue = Team.YourTeam; // Abstract Blue
  const actualRed = Team.EnemyTeam;   // Abstract Red


  const steps: DraftStep[] = [
    // Ban Phase 1 (B1, R1, B2, R2, B3, R3)
    { type: 'BAN', team: (userSide === 'BLUE' ? actualBlue : actualRed), phase: 'Ban Phase 1' },
    { type: 'BAN', team: (userSide === 'BLUE' ? actualRed : actualBlue), phase: 'Ban Phase 1' },
    { type: 'BAN', team: (userSide === 'BLUE' ? actualBlue : actualRed), phase: 'Ban Phase 1' },
    { type: 'BAN', team: (userSide === 'BLUE' ? actualRed : actualBlue), phase: 'Ban Phase 1' },
    { type: 'BAN', team: (userSide === 'BLUE' ? actualBlue : actualRed), phase: 'Ban Phase 1' },
    { type: 'BAN', team: (userSide === 'BLUE' ? actualRed : actualBlue), phase: 'Ban Phase 1' },

    // Pick Phase 1 (B1, R1, R2, B2, B3, R3)
    { type: 'PICK', team: (userSide === 'BLUE' ? actualBlue : actualRed), phase: 'Pick Phase 1' }, // B1
    { type: 'PICK', team: (userSide === 'BLUE' ? actualRed : actualBlue), phase: 'Pick Phase 1' }, // R1
    { type: 'PICK', team: (userSide === 'BLUE' ? actualRed : actualBlue), phase: 'Pick Phase 1' }, // R2
    { type: 'PICK', team: (userSide === 'BLUE' ? actualBlue : actualRed), phase: 'Pick Phase 1' }, // B2
    { type: 'PICK', team: (userSide === 'BLUE' ? actualBlue : actualRed), phase: 'Pick Phase 1' }, // B3
    { type: 'PICK', team: (userSide === 'BLUE' ? actualRed : actualBlue), phase: 'Pick Phase 1' }, // R3

    // Ban Phase 2 (R4, B4, R5, B5 -- note: Red bans first in this phase)
    { type: 'BAN', team: (userSide === 'BLUE' ? actualRed : actualBlue), phase: 'Ban Phase 2' }, // R Ban
    { type: 'BAN', team: (userSide === 'BLUE' ? actualBlue : actualRed), phase: 'Ban Phase 2' }, // B Ban
    { type: 'BAN', team: (userSide === 'BLUE' ? actualRed : actualBlue), phase: 'Ban Phase 2' }, // R Ban
    { type: 'BAN', team: (userSide === 'BLUE' ? actualBlue : actualRed), phase: 'Ban Phase 2' }, // B Ban
    
    // Pick Phase 2 (R4, B4, B5, R5)
    { type: 'PICK', team: (userSide === 'BLUE' ? actualRed : actualBlue), phase: 'Pick Phase 2' }, // R4
    { type: 'PICK', team: (userSide === 'BLUE' ? actualBlue : actualRed), phase: 'Pick Phase 2' }, // B4
    { type: 'PICK', team: (userSide === 'BLUE' ? actualBlue : actualRed), phase: 'Pick Phase 2' }, // B5
    { type: 'PICK', team: (userSide === 'BLUE' ? actualRed : actualBlue), phase: 'Pick Phase 2' }  // R5
  ];

  return steps;
};
