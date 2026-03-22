/**
 * advanceTime — System 1 of 13 in the tick pipe.
 *
 * Delegates calendar arithmetic to stage-time's calendarTick.
 * Eliminates the mutable seasonEnds cache that was in engine/calendar.ts.
 *
 * Mapping CalendarState → GameState.time:
 *   cal.tick     → ticksElapsed
 *   cal.season   → currentSeason
 *   cal.year - 1 → currentYear  (stage is 1-indexed; idle-hero is 0-indexed)
 *   totalDays    → currentDay   (derived: Math.floor(cal.tick / TICKS_PER_DAY))
 *
 * Known simplification: DAYS_PER_SEASON=91 (uniform) gives a 364-day year.
 * Signal sent to stage-time to support readonly number[] per season.
 *
 * Pure function — no mutations, no side effects.
 */

import type { GameState } from '@idle-hero-rpg/shared';
import type { CalendarState } from '@stage/stage-time';
import { calendarTick } from '@stage/stage-time';
import { TICKS_PER_DAY, DAYS_PER_SEASON } from '../data/balance';

/** Build a CalendarState from idle-hero's time shape for stage-time consumption. */
const toCalendarState = (time: GameState['time']): CalendarState => {
  const daysPerYear = DAYS_PER_SEASON * 4;
  return {
    tick: time.ticksElapsed,
    year: time.currentYear + 1,
    season: time.currentSeason,
    day: (time.currentDay % daysPerYear) + 1,
    dayOfSeason: 1, // not persisted; calendarTick derives from tick
  };
};

export const advanceTime = (state: GameState): GameState => {
  const cal = calendarTick(toCalendarState(state.time), TICKS_PER_DAY, DAYS_PER_SEASON);

  return {
    ...state,
    time: {
      ...state.time,
      ticksElapsed: cal.tick,
      currentDay: Math.floor(cal.tick / TICKS_PER_DAY),
      currentSeason: cal.season,
      currentYear: cal.year - 1,
    },
  };
};
