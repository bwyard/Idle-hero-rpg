import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { advanceTime } from '../advanceTime';
import { createInitialGameState } from '../../stores/initialState';
import { TICKS_PER_DAY, DAYS_PER_SEASON } from '../../data/balance';

/**
 * advanceTime now delegates to stage-time's calendarTick.
 *
 * Season/year boundaries use DAYS_PER_SEASON=91 (uniform, 364-day year).
 * This is a known simplification — signal sent to stage to support variable
 * per-season lengths. See DAYS_PER_SEASON comment in balance.ts.
 */

const TICKS_PER_SEASON = DAYS_PER_SEASON * TICKS_PER_DAY; // 364
const TICKS_PER_YEAR = TICKS_PER_SEASON * 4; // 1456

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
        const yearLen = DAYS_PER_SEASON * 4;
        const state = {
          ...createInitialGameState(),
          time: {
            ticksElapsed: n,
            currentDay: day,
            currentSeason: 'Spring' as const,
            currentYear: Math.floor(day / yearLen),
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
          const yearLen = DAYS_PER_SEASON * 4;
          const state = {
            ...createInitialGameState(),
            time: {
              ticksElapsed: n,
              currentDay: day,
              currentSeason: 'Spring' as const,
              currentYear: Math.floor(day / yearLen),
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

    it('transitions to Summer after DAYS_PER_SEASON days', () => {
      // Advance to just after Spring ends
      const state = {
        ...createInitialGameState(),
        time: {
          ticksElapsed: TICKS_PER_SEASON - 1,
          currentDay: DAYS_PER_SEASON - 1,
          currentSeason: 'Spring' as const,
          currentYear: 0,
        },
      };
      const next = advanceTime(state);
      expect(next.time.currentSeason).toBe('Summer');
    });

    it('transitions to Autumn, Winter, then back to Spring over a year', () => {
      const seasons = ['Spring', 'Summer', 'Autumn', 'Winter'] as const;
      for (let s = 0; s < 4; s++) {
        const startTick = s * TICKS_PER_SEASON;
        const state = {
          ...createInitialGameState(),
          time: {
            ticksElapsed: startTick,
            currentDay: s * DAYS_PER_SEASON,
            currentSeason: seasons[s]!,
            currentYear: 0,
          },
        };
        expect(state.time.currentSeason).toBe(seasons[s]);
      }
    });
  });

  describe('year calculation', () => {
    it('currentYear is 0 during the first year (days 0–363)', () => {
      // At tick just before year 1 ends (364 days × 4 ticks/day - 1)
      const lastTickYear0 = TICKS_PER_YEAR - 1;
      const state = {
        ...createInitialGameState(),
        time: {
          ticksElapsed: lastTickYear0 - 1,
          currentDay: Math.floor((lastTickYear0 - 1) / TICKS_PER_DAY),
          currentSeason: 'Winter' as const,
          currentYear: 0,
        },
      };
      const next = advanceTime(state);
      expect(next.time.currentYear).toBe(0);
    });

    it('currentYear advances to 1 at day 364 (DAYS_PER_SEASON × 4)', () => {
      const lastTickYear0 = TICKS_PER_YEAR - 1;
      const state = {
        ...createInitialGameState(),
        time: {
          ticksElapsed: lastTickYear0,
          currentDay: Math.floor(lastTickYear0 / TICKS_PER_DAY),
          currentSeason: 'Winter' as const,
          currentYear: 0,
        },
      };
      const next = advanceTime(state);
      expect(next.time.currentDay).toBe(DAYS_PER_SEASON * 4);
      expect(next.time.currentYear).toBe(1);
    });

    it('property: currentYear equals Math.floor(currentDay / (DAYS_PER_SEASON * 4))', () => {
      const yearLen = DAYS_PER_SEASON * 4;
      fc.assert(
        fc.property(fc.nat({ max: 100_000 }), (n) => {
          const day = Math.floor(n / TICKS_PER_DAY);
          const state = {
            ...createInitialGameState(),
            time: {
              ticksElapsed: n,
              currentDay: day,
              currentSeason: 'Spring' as const,
              currentYear: Math.floor(day / yearLen),
            },
          };
          const next = advanceTime(state);
          const nextDay = Math.floor(next.time.ticksElapsed / TICKS_PER_DAY);
          return next.time.currentYear === Math.floor(nextDay / yearLen);
        }),
      );
    });
  });
});
