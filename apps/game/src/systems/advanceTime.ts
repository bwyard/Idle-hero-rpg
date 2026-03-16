/**
 * advanceTime — System 1 of 12 in the tick pipe.
 *
 * Increments the in-game clock by one tick interval.
 * All other systems read the updated time from state.
 *
 * Pure function — no mutations, no side effects.
 */

import type { GameState } from '@idle-hero-rpg/shared';
import { TICKS_PER_YEAR } from '../data/balance';

export function advanceTime(state: GameState): GameState {
  const ticksElapsed = state.time.ticksElapsed + 1;
  const currentYear = Math.floor(ticksElapsed / TICKS_PER_YEAR);

  return {
    ...state,
    time: {
      ...state.time,
      ticksElapsed,
      currentYear,
    },
  };
}
