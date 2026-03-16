import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getSeasonAtDay } from '../calendar';
import { DAYS_PER_YEAR, SEASON_ORDER } from '../../data/balance';
import type { Season } from '@idle-hero-rpg/shared';

describe('getSeasonAtDay (absolute day)', () => {
  it('day 0 is Spring', () => {
    expect(getSeasonAtDay(0).season).toBe('Spring');
  });

  it('returns a valid season for any day', () => {
    fc.assert(
      fc.property(fc.nat({ max: 100_000 }), (absoluteDay) => {
        const result = getSeasonAtDay(absoluteDay);
        return (SEASON_ORDER as readonly string[]).includes(result.season);
      }),
    );
  });

  it('is deterministic — same day always returns same season', () => {
    for (let d = 0; d < 2000; d++) {
      const a = getSeasonAtDay(d);
      const b = getSeasonAtDay(d);
      expect(a.season).toBe(b.season);
      expect(a.dayInSeason).toBe(b.dayInSeason);
      expect(a.seasonLength).toBe(b.seasonLength);
    }
  });

  it('seasons follow the correct cycle order: Spring → Summer → Autumn → Winter → Spring', () => {
    let lastSeason: Season | null = null;
    let lastIndex = -1;
    // Walk through 3 years of days and verify order never skips
    for (let d = 0; d < DAYS_PER_YEAR * 3; d++) {
      const { season } = getSeasonAtDay(d);
      if (season !== lastSeason) {
        const idx = SEASON_ORDER.indexOf(season as (typeof SEASON_ORDER)[number]);
        if (lastSeason !== null) {
          // Must be next in cycle (wrapping from 3 → 0)
          expect(idx).toBe((lastIndex + 1) % 4);
        }
        lastSeason = season;
        lastIndex = idx;
      }
    }
  });

  it('each season lasts between 81 and 103 days (base ±10)', () => {
    // Walk a large range tracking season lengths
    let currentSeason = getSeasonAtDay(0).season;
    let seasonStart = 0;
    const lengths: number[] = [];

    for (let d = 1; d <= DAYS_PER_YEAR * 20; d++) {
      const { season } = getSeasonAtDay(d);
      if (season !== currentSeason) {
        lengths.push(d - seasonStart);
        seasonStart = d;
        currentSeason = season;
      }
    }

    for (const len of lengths) {
      expect(len).toBeGreaterThanOrEqual(80);
      expect(len).toBeLessThanOrEqual(103);
    }
  });

  it('dayInSeason starts at 0 when a new season begins', () => {
    let lastSeason: Season | null = null;
    for (let d = 0; d < DAYS_PER_YEAR * 3; d++) {
      const { season, dayInSeason } = getSeasonAtDay(d);
      if (season !== lastSeason) {
        expect(dayInSeason).toBe(0);
        lastSeason = season;
      }
    }
  });

  it('dayInSeason increments by 1 within the same season', () => {
    let lastSeason: Season | null = null;
    let lastDayInSeason = -1;
    for (let d = 0; d < DAYS_PER_YEAR * 3; d++) {
      const { season, dayInSeason } = getSeasonAtDay(d);
      if (season === lastSeason) {
        expect(dayInSeason).toBe(lastDayInSeason + 1);
      }
      lastSeason = season;
      lastDayInSeason = dayInSeason;
    }
  });

  it('seasons can cross year boundaries (Winter may extend into next calendar year)', () => {
    // Walk from day 0 and check: is there a season that spans across a DAYS_PER_YEAR boundary?
    let foundCrossing = false;
    for (let yearStart = 0; yearStart < 20; yearStart++) {
      const dayBeforeYearEnd = yearStart * DAYS_PER_YEAR + DAYS_PER_YEAR - 1;
      const dayAfterYearEnd = (yearStart + 1) * DAYS_PER_YEAR;
      const seasonBefore = getSeasonAtDay(dayBeforeYearEnd).season;
      const seasonAfter = getSeasonAtDay(dayAfterYearEnd).season;
      if (seasonBefore === seasonAfter) {
        foundCrossing = true;
        break;
      }
    }
    expect(foundCrossing).toBe(true);
  });
});
