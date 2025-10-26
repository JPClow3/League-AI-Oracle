import type { DraftState, Champion } from '../types';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates a draft state
 *
 * @param draft - The draft state to validate
 * @returns Validation result with errors if any
 */
export function validateDraft(draft: DraftState): ValidationResult {
  const errors: string[] = [];

  // Check blue team picks
  const bluePicks = draft.blue.picks.filter(p => p.champion !== null);
  if (bluePicks.length < 5) {
    errors.push(`Blue team has only ${bluePicks.length} picks (need 5)`);
  }

  // Check red team picks
  const redPicks = draft.red.picks.filter(p => p.champion !== null);
  if (redPicks.length < 5) {
    errors.push(`Red team has only ${redPicks.length} picks (need 5)`);
  }

  // Check for duplicate picks
  const allChampions = [
    ...bluePicks.map(p => p.champion?.id),
    ...redPicks.map(p => p.champion?.id)
  ].filter(Boolean);

  const duplicates = allChampions.filter((id, index) =>
    allChampions.indexOf(id) !== index
  );

  if (duplicates.length > 0) {
    errors.push(`Duplicate champions found: ${duplicates.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates a champion selection
 */
export function validateChampionSelection(
  champion: Champion,
  existingPicks: Champion[]
): ValidationResult {
  const errors: string[] = [];

  // Check if champion is already picked
  if (existingPicks.some(c => c.id === champion.id)) {
    errors.push(`${champion.name} is already picked`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates team composition
 */
export function validateTeamComposition(
  picks: Array<{ champion: Champion | null }>
): ValidationResult {
  const errors: string[] = [];
  const champions = picks.map(p => p.champion).filter(Boolean) as Champion[];

  if (champions.length < 5) {
    errors.push('Team needs 5 champions');
    return { isValid: false, errors };
  }

  // Check role coverage (optional - just a warning)
  const roles = champions.map(c => c.roles?.[0]).filter(Boolean);
  const uniqueRoles = new Set(roles);

  if (uniqueRoles.size < 3) {
    errors.push('Warning: Team lacks role diversity');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

