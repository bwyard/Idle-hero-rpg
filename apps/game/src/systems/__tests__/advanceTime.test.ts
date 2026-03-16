import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { advanceTime } from '../advanceTime';
import { createInitialGameState } from '../../stores/initialState';
import { TICKS_PER_DAY, DAYS_PER_YEAR } from '../../data/balance';
import { getSeasonAtDay } from '../../engine/calendar';

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
    expect(state.time.currentDay).toBe(0);
    expect(state.time.currentYear).toBe(0);
  });

  it('does not modify any other field', () => {
    const state = createInitialGameState();
    const next = advanceTime(state);
    expect(next.hero).toEqual(state.hero);
    expect(next.guild).toEqual(state.guild);
    expect(next.dynasty).toEqual(state.dynasty);
  });

  it('property: always increments ticksElapsed by exactly 1', () => {
    fc.assert(
      fc.property(fc.nat({ max: 100_000 }), (n) => {
        const day = Math.floor(n / TICKS_PER_DAY);
        const state = {
          ...createInitialGameState(),
          time: {
            ticksElapsed: n,
            currentDay: day,
            currentSeason: getSeasonAtDay(day).season,
            currentYear: Math.floor(day / DAYS_PER_YEAR),
          },
        };
        return advanceTime(state).time.ticksElapsed === n + 1;
      }),
    );
  });

  describe('tick-to-day conversion', () => {
    it('currentDay is 0 for ticks 1 through TICKS_PER_DAY - 1', () => {
      let state = createInitialGameState();
      for (let i = 0; i < TICKS_PER_DAY - 1; i++) {
        state = advanceTime(state);
      }
      expect(state.time.ticksElapsed).toBe(TICKS_PER_DAY - 1);
      expect(state.time.currentDay).toBe(0);
    });

    it('currentDay advances to 1 at exactly TICKS_PER_DAY ticks', () => {
      const state = {
        ...createInitialGameState(),
        time: {
          ticksElapsed: TICKS_PER_DAY - 1,
          currentDay: 0,
          currentSeason: 'Spring' as const,
          currentYear: 0,
        },
      };
      const next = advanceTime(state);
      expect(next.time.ticksElapsed).toBe(TICKS_PER_DAY);
      expect(next.time.currentDay).toBe(1);
    });

    it('property: currentDay equals Math.floor(ticksElapsed / TICKS_PER_DAY)', () => {
      fc.assert(
        fc.property(fc.nat({ max: 100_000 }), (n) => {
          const day = Math.floor(n / TICKS_PER_DAY);
          const state = {
            ...createInitialGameState(),
            time: {
              ticksElapsed: n,
              currentDay: day,
              currentSeason: getSeasonAtDay(day).season,
              currentYear: Math.floor(day / DAYS_PER_YEAR),
            },
          };
          const next = advanceTime(state);
          return next.time.currentDay === Math.floor(next.time.ticksElapsed / TICKS_PER_DAY);
        }),
      );
    });
  });

  describe('season calculation', () => {
    it('starts in Spring at day 0', () => {
      const state = createInitialGameState();
      expect(state.time.currentSeason).toBe('Spring');
    });

    it('property: season matches calendar getSeasonAtDay', () => {
      fc.assert(
        fc.property(fc.nat({ max: 100_000 }), (n) => {
          const day = Math.floor(n / TICKS_PER_DAY);
          const state = {
            ...createInitialGameState(),
            time: {
              ticksElapsed: n,
              currentDay: day,
              currentSeason: getSeasonAtDay(day).season,
              currentYear: Math.floor(day / DAYS_PER_YEAR),
            },
          };
          const next = advanceTime(state);
          const nextDay = Math.floor(next.time.ticksElapsed / TICKS_PER_DAY);
          return next.time.currentSeason === getSeasonAtDay(nextDay).season;
        }),
      );
    });
  });

  describe('year calculation', () => {
    it('currentYear is 0 during first 365 days', () => {
      // At tick just before day 365
      const tickBeforeYear1 = DAYS_PER_YEAR * TICKS_PER_DAY - 1;
      const state = {
        ...createInitialGameState(),
        time: {
          ticksElapsed: tickBeforeYear1 - 1,
          currentDay: Math.floor((tickBeforeYear1 - 1) / TICKS_PER_DAY),
          currentSeason: getSeasonAtDay(Math.floor((tickBeforeYear1 - 1) / TICKS_PER_DAY)).season,
          currentYear: 0,
        },
      };
      const next = advanceTime(state);
      expect(next.time.currentYear).toBe(0);
    });

    it('currentYear advances to 1 at day 365', () => {
      const tickAtYear1 = DAYS_PER_YEAR * TICKS_PER_DAY - 1;
      const state = {
        ...createInitialGameState(),
        time: {
          ticksElapsed: tickAtYear1,
          currentDay: Math.floor(tickAtYear1 / TICKS_PER_DAY),
          currentSeason: getSeasonAtDay(Math.floor(tickAtYear1 / TICKS_PER_DAY)).season,
          currentYear: 0,
        },
      };
      const next = advanceTime(state);
      expect(next.time.currentDay).toBe(DAYS_PER_YEAR);
      expect(next.time.currentYear).toBe(1);
    });

    it('property: currentYear equals Math.floor(currentDay / DAYS_PER_YEAR)', () => {
      fc.assert(
        fc.property(fc.nat({ max: 100_000 }), (n) => {
          const day = Math.floor(n / TICKS_PER_DAY);
          const state = {
            ...createInitialGameState(),
            time: {
              ticksElapsed: n,
              currentDay: day,
              currentSeason: getSeasonAtDay(day).season,
              currentYear: Math.floor(day / DAYS_PER_YEAR),
            },
          };
          const next = advanceTime(state);
          const nextDay = Math.floor(next.time.ticksElapsed / TICKS_PER_DAY);
          return next.time.currentYear === Math.floor(nextDay / DAYS_PER_YEAR);
        }),
      );
    });
  });
});
