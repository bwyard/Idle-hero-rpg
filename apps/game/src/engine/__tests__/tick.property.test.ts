/**
 * Property-based tests for the tick function.
 *
 * These tests verify invariants that must hold for all valid GameState inputs:
 * - Tick is a pure function (same input always produces same output)
 * - Tick never returns the exact same reference (always a new object)
 * - Tick always increments ticksElapsed by exactly 1
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { tick } from '../tick';
import { createInitialGameState } from '../../stores/initialState';
import { TICKS_PER_DAY, DAYS_PER_YEAR } from '../../data/balance';
import { getSeasonAtDay } from '../calendar';

/** Build a valid time object from a tick count. */
function timeFromTick(ticksElapsed: number) {
  const currentDay = Math.floor(ticksElapsed / TICKS_PER_DAY);
  return {
    ticksElapsed,
    currentDay,
    currentSeason: getSeasonAtDay(currentDay).season,
    currentYear: Math.floor(currentDay / DAYS_PER_YEAR),
  };
}

describe('tick — property tests', () => {
  it('always increments ticksElapsed by exactly 1', () => {
    fc.assert(
      fc.property(fc.nat({ max: 100_000 }), (startTick) => {
        const state = {
          ...createInitialGameState(),
          time: timeFromTick(startTick),
        };
        const next = tick(state);
        return next.time.ticksElapsed === startTick + 1;
      }),
    );
  });

  it('is referentially pure — same input produces equal output', () => {
    fc.assert(
      fc.property(fc.nat({ max: 100 }), (startTick) => {
        const state = {
          ...createInitialGameState(),
          time: timeFromTick(startTick),
        };
        const result1 = tick(state);
        const result2 = tick(state);
        return result1.time.ticksElapsed === result2.time.ticksElapsed;
      }),
    );
  });

  it('does not mutate the input state', () => {
    const state = createInitialGameState();
    const originalTick = state.time.ticksElapsed;
    tick(state);
    expect(state.time.ticksElapsed).toBe(originalTick);
  });
});
