import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { advanceTime } from '../advanceTime';
import { createInitialGameState } from '../../stores/initialState';
import { TICKS_PER_YEAR } from '../../data/balance';

describe('advanceTime', () => {
  it('increments ticksElapsed by 1', () => {
    const state = createInitialGameState();
    const next = advanceTime(state);
    expect(next.time.ticksElapsed).toBe(1);
  });

  it('does not mutate the input state', () => {
    const state = createInitialGameState();
    advanceTime(state);
    expect(state.time.ticksElapsed).toBe(0);
    expect(state.time.currentYear).toBe(0);
  });

  it('does not modify any other field', () => {
    const state = createInitialGameState();
    const next = advanceTime(state);
    expect(next.hero).toEqual(state.hero);
    expect(next.guild).toEqual(state.guild);
    expect(next.dynasty).toEqual(state.dynasty);
  });

  it('property: always increments by exactly 1 regardless of starting value', () => {
    fc.assert(
      fc.property(fc.nat({ max: 1_000_000 }), (n) => {
        const state = {
          ...createInitialGameState(),
          time: { ticksElapsed: n, currentYear: Math.floor(n / TICKS_PER_YEAR) },
        };
        return advanceTime(state).time.ticksElapsed === n + 1;
      }),
    );
  });

  describe('tick-to-year conversion', () => {
    it('currentYear is 0 for ticks 1 through TICKS_PER_YEAR - 1', () => {
      let state = createInitialGameState();
      for (let i = 0; i < TICKS_PER_YEAR - 1; i++) {
        state = advanceTime(state);
      }
      // After 119 ticks (TICKS_PER_YEAR - 1), still year 0
      expect(state.time.ticksElapsed).toBe(TICKS_PER_YEAR - 1);
      expect(state.time.currentYear).toBe(0);
    });

    it('currentYear advances to 1 at exactly TICKS_PER_YEAR', () => {
      const state = {
        ...createInitialGameState(),
        time: { ticksElapsed: TICKS_PER_YEAR - 1, currentYear: 0 },
      };
      const next = advanceTime(state);
      expect(next.time.ticksElapsed).toBe(TICKS_PER_YEAR);
      expect(next.time.currentYear).toBe(1);
    });

    it('currentYear advances to 2 at exactly 2 * TICKS_PER_YEAR', () => {
      const state = {
        ...createInitialGameState(),
        time: { ticksElapsed: 2 * TICKS_PER_YEAR - 1, currentYear: 1 },
      };
      const next = advanceTime(state);
      expect(next.time.ticksElapsed).toBe(2 * TICKS_PER_YEAR);
      expect(next.time.currentYear).toBe(2);
    });

    it('currentYear stays the same between year boundaries', () => {
      const state = {
        ...createInitialGameState(),
        time: { ticksElapsed: TICKS_PER_YEAR, currentYear: 1 },
      };
      const next = advanceTime(state);
      expect(next.time.ticksElapsed).toBe(TICKS_PER_YEAR + 1);
      expect(next.time.currentYear).toBe(1);
    });

    it('property: currentYear equals Math.floor(ticksElapsed / TICKS_PER_YEAR)', () => {
      fc.assert(
        fc.property(fc.nat({ max: 1_000_000 }), (n) => {
          const state = {
            ...createInitialGameState(),
            time: { ticksElapsed: n, currentYear: Math.floor(n / TICKS_PER_YEAR) },
          };
          const next = advanceTime(state);
          return next.time.currentYear === Math.floor(next.time.ticksElapsed / TICKS_PER_YEAR);
        }),
      );
    });
  });
});
