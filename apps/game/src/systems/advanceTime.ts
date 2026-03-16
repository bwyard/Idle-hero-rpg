/**
 * advanceTime — System 1 of 13 in the tick pipe.
 *
 * Increments the in-game clock by one tick interval.
 * Derives currentDay, currentSeason, and currentYear from ticksElapsed.
 * Season lengths vary per year via the calendar system.
 * All other systems read the updated time from state.
 *
 * Pure function — no mutations, no side effects.
 */

import type { GameState } from '@idle-hero-rpg/shared';
import { TICKS_PER_DAY, DAYS_PER_YEAR } from '../data/balance';
import { getSeasonAtDay } from '../engine/calendar';

export function advanceTime(state: GameState): GameState {
  const ticksElapsed = state.time.ticksElapsed + 1;
  const currentDay = Math.floor(ticksElapsed / TICKS_PER_DAY);
  const currentYear = Math.floor(currentDay / DAYS_PER_YEAR);
  const { season: currentSeason } = getSeasonAtDay(currentDay);

  return {
    ...state,
    time: {
      ...state.time,
      ticksElapsed,
      currentDay,
      currentSeason,
      currentYear,
    },
  };
}
