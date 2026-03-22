/**
 * calendar.ts — Deterministic in-game calendar with variable season lengths.
 *
 * Seasons follow a fixed cycle: Spring → Summer → Autumn → Winter → Spring...
 * Each season's length varies ±10 days from its base, seeded by season index
 * for determinism. Seasons can cross calendar year boundaries.
 *
 * Pure functions — no mutations, no side effects.
 */

import type { Season } from '@idle-hero-rpg/shared';
import { BASE_SEASON_LENGTHS, SEASON_ORDER } from '../data/balance';

/** Result of looking up the season at a given absolute day. */
export interface SeasonInfo {
  readonly season: Season;
  readonly dayInSeason: number;
  readonly seasonLength: number;
  readonly seasonIndex: number;
}

/**
 * Simple deterministic hash for a season index.
 * Returns a value in [0, 1) used to vary the season length.
 */
function seasonHash(seasonIndex: number): number {
  const h0 = (seasonIndex * 2654435761) >>> 0; // Knuth multiplicative hash
  const h1 = ((h0 >>> 16) ^ h0) >>> 0;
  return (h1 % 10000) / 10000;
}

/** Maximum days a season can vary from its base length. */
const MAX_VARIATION = 10;

/**
 * Get the length of the Nth season (0-indexed from game start).
 * Season 0 = first Spring, season 1 = first Summer, etc.
 * Deterministic — same seasonIndex always returns the same length.
 */
function getSeasonLength(seasonIndex: number): number {
  const baseIndex = seasonIndex % 4;
  const baseLength = BASE_SEASON_LENGTHS[baseIndex] ?? 91;
  const hash = seasonHash(seasonIndex);
  const variation = Math.floor(hash * (MAX_VARIATION * 2 + 1)) - MAX_VARIATION;
  return baseLength + variation;
}

/**
 * Cache of cumulative season boundaries.
 * seasonEnds[i] = the absolute day at which season i ends (exclusive).
 * Season i spans [seasonEnds[i-1], seasonEnds[i]).
 */
const seasonEnds: number[] = [];

/** Ensure we have computed season boundaries up to at least the given absolute day. */
function ensureBoundaries(upToDay: number): void {
  if (seasonEnds.length === 0) {
    seasonEnds.push(getSeasonLength(0));
  }
  while ((seasonEnds[seasonEnds.length - 1] ?? 0) <= upToDay) {
    const nextIndex = seasonEnds.length;
    const prevEnd = seasonEnds[nextIndex - 1] ?? 0;
    seasonEnds.push(prevEnd + getSeasonLength(nextIndex));
  }
}

/**
 * Get the season info for an absolute day (0-indexed from game start).
 *
 * @param absoluteDay - The total number of days elapsed since game start.
 * @returns Season name, day within the season, season length, and season index.
 */
/** Pure binary search — returns index of season containing absoluteDay. */
function findSeasonIndex(day: number, lo: number, hi: number): number {
  if (lo >= hi) return lo;
  const mid = (lo + hi) >>> 1;
  return (seasonEnds[mid] ?? 0) <= day
    ? findSeasonIndex(day, mid + 1, hi)
    : findSeasonIndex(day, lo, mid);
}

export function getSeasonAtDay(absoluteDay: number): SeasonInfo {
  ensureBoundaries(absoluteDay);

  const seasonIndex = findSeasonIndex(absoluteDay, 0, seasonEnds.length - 1);
  const seasonStart = seasonIndex === 0 ? 0 : (seasonEnds[seasonIndex - 1] ?? 0);
  const seasonEnd = seasonEnds[seasonIndex] ?? 0;

  return {
    season: (SEASON_ORDER[seasonIndex % 4] ?? 'Spring') as Season,
    dayInSeason: absoluteDay - seasonStart,
    seasonLength: seasonEnd - seasonStart,
    seasonIndex,
  };
}
