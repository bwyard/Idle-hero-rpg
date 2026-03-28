/**
 * checkLeaderPressure — System 11 of 13 in the tick pipe.
 *
 * Checks whether higher-tier adventurers create pressure on the current
 * leader. Pressure level scales with prestige count and leader tenure.
 *
 * See docs/design/prestige.md § Involuntary Leader Replacement.
 * Balance constants in balance.ts: LEADER_PRESSURE_*_MAX, LEADER_TENURE_PRESSURE_THRESHOLD_YEARS.
 *
 * Pure function — no mutations, no side effects.
 */

import type { GameState } from '@idle-hero-rpg/shared';
import { createId } from '@idle-hero-rpg/shared';
import {
  LEADER_PRESSURE_NONE_MAX,
  LEADER_PRESSURE_SOFT_MAX,
  LEADER_PRESSURE_MODERATE_MAX,
  LEADER_PRESSURE_REAL_MAX,
  LEADER_TENURE_PRESSURE_THRESHOLD_YEARS,
  ADVENTURER_TIER_ORDER,
} from '../data/balance';

type PressureLevel = GameState['flags']['leaderPressureLevel'];

/** Tiers considered "high" for pressure calculations (S and above). */
const HIGH_TIERS = new Set(['S', 'SS', 'Legendary']);

/** Tiers considered "very high" for real/hard pressure (SS and above). */
const VERY_HIGH_TIERS = new Set(['SS', 'Legendary']);

const getHighestAdventurerTierRank = (state: GameState): number => {
  const adventurers = Object.values(state.adventurers);
  if (adventurers.length === 0) return -1;

  return adventurers.reduce((maxRank, adv) => {
    if (adv.retiredYear !== null) return maxRank; // skip retired
    const rank = ADVENTURER_TIER_ORDER.indexOf(adv.tier as (typeof ADVENTURER_TIER_ORDER)[number]);
    return rank > maxRank ? rank : maxRank;
  }, -1);
};

const hasActiveAdventurerInTiers = (state: GameState, tiers: Set<string>): boolean =>
  Object.values(state.adventurers).some(
    (adv) => adv.retiredYear === null && tiers.has(adv.tier),
  );

const calculatePressureLevel = (state: GameState): PressureLevel => {
  const { prestigeCount } = state.dynasty;
  const leaderTenure = state.time.currentYear - state.hero.leaderStartYear;

  // Prestige 1-3: no involuntary replacement
  if (prestigeCount <= LEADER_PRESSURE_NONE_MAX) {
    return 'none';
  }

  const hasHighTier = hasActiveAdventurerInTiers(state, HIGH_TIERS);
  const hasVeryHighTier = hasActiveAdventurerInTiers(state, VERY_HIGH_TIERS);
  const hasLegendary = hasActiveAdventurerInTiers(state, new Set(['Legendary']));

  // No high-tier adventurer exists — no pressure regardless of prestige
  if (!hasHighTier) {
    return 'none';
  }

  // Prestige 13+: hard replacement possible if Legendary exists
  if (prestigeCount > LEADER_PRESSURE_REAL_MAX) {
    if (hasLegendary) return 'hard';
    if (hasVeryHighTier) return 'real';
    return 'soft';
  }

  // Prestige 10-12: real pressure if SS/Legendary exists
  if (prestigeCount > LEADER_PRESSURE_MODERATE_MAX) {
    if (hasVeryHighTier) return 'real';
    return 'soft';
  }

  // Prestige 7-9: moderate pressure if higher tier + long tenure
  if (prestigeCount > LEADER_PRESSURE_SOFT_MAX) {
    if (hasHighTier && leaderTenure >= LEADER_TENURE_PRESSURE_THRESHOLD_YEARS) {
      return 'moderate';
    }
    return 'soft';
  }

  // Prestige 4-6: soft pressure only
  return 'soft';
};

export const checkLeaderPressure = (state: GameState): GameState => {
  const newLevel = calculatePressureLevel(state);
  const currentLevel = state.flags.leaderPressureLevel;

  // No change
  if (newLevel === currentLevel) {
    return state;
  }

  const event = {
    id: createId('evt'),
    tick: state.time.ticksElapsed,
    type: 'LEADER_PRESSURE',
    message: newLevel === 'none'
      ? 'Leadership pressure has eased.'
      : `Leadership pressure: ${newLevel}. A stronger adventurer challenges the guild's direction.`,
    achievementKey: null,
    causeId: null,
  } as const;

  return {
    ...state,
    flags: {
      ...state.flags,
      leaderPressureLevel: newLevel,
    },
    pendingEvents: [...state.pendingEvents, event],
  };
};
