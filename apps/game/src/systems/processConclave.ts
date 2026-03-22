/**
 * processConclave — System 8 of 12 in the tick pipe.
 *
 * Handles Conclave cycle events (every 5 in-game years).
 * Measures dynasty growth and resets Skill Borrow for eligible adventurers.
 *
 * Pure function — no mutations, no side effects.
 */

import type { GameState } from '@idle-hero-rpg/shared';
import { CONCLAVE_INTERVAL_YEARS } from '../data/balance';

export const processConclave = (state: GameState): GameState => {
  // Conclave fires every CONCLAVE_INTERVAL_YEARS in-game years
  const yearsPassed = state.time.ticksElapsed; // TODO: convert ticks to years
  const isConclaveYear = yearsPassed > 0 && yearsPassed % CONCLAVE_INTERVAL_YEARS === 0;

  if (!isConclaveYear) {
    return state;
  }

  // TODO: Implement dynasty growth measurement across categories
  // TODO: Implement Skill Borrow reset for Legendary (2×SS) adventurers
  return state;
};
