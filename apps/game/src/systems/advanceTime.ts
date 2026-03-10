/**
 * advanceTime — System 1 of 12 in the tick pipe.
 *
 * Increments the in-game clock by one tick interval.
 * All other systems read the updated time from state.
 *
 * Pure function — no mutations, no side effects.
 */

import type { GameState } from '@idle-hero-rpg/shared';

export function advanceTime(state: GameState): GameState {
  return {
    ...state,
    time: {
      ...state.time,
      ticksElapsed: state.time.ticksElapsed + 1,
    },
  };
}
