/**
 * processAdventurers — System 3 of 12 in the tick pipe.
 *
 * Advances adventurer XP, handles tier-ups, and triggers retirement for
 * Legendary adventurers (which sets the prestige condition).
 *
 * Design decisions pending: XP rates per tier, tier advancement thresholds,
 * retirement criteria. stubAdventurerProgressionImpl satisfies the contract
 * and keeps CI green. Swap in a live impl when those values are tuned —
 * this function does not change.
 *
 * Pure function — no mutations, no side effects.
 */

import type { GameState, AdventurerProgressionImpl } from '@idle-hero-rpg/shared';
import { createId } from '@idle-hero-rpg/shared';
import {
  ADVENTURER_TIERS,
  PLACEHOLDER_XP_PER_TICK,
  PLACEHOLDER_TIER_XP_THRESHOLDS,
  PLACEHOLDER_LEGENDARY_RETIRE_DAYS,
  TICKS_PER_DAY,
} from '../data/balance';

export const stubAdventurerProgressionImpl: AdventurerProgressionImpl = {
  xpGainPerTick: () => 0,
  isReadyForTierUp: () => false,
  nextTier: () => null,
  shouldRetire: () => false,
};

/** placeholder — tune during balance pass */
export const placeholderAdventurerProgressionImpl: AdventurerProgressionImpl = {
  xpGainPerTick: () => PLACEHOLDER_XP_PER_TICK, // placeholder — tune during balance pass
  isReadyForTierUp: (adventurer) => {
    const threshold = PLACEHOLDER_TIER_XP_THRESHOLDS[adventurer.tier];
    if (threshold === undefined) return false; // Legendary has no tier-up
    return adventurer.xp >= threshold; // placeholder — tune during balance pass
  },
  nextTier: (current) => {
    const idx = ADVENTURER_TIERS.indexOf(current);
    if (idx < 0 || idx >= ADVENTURER_TIERS.length - 1) return null;
    return ADVENTURER_TIERS[idx + 1] ?? null; // placeholder — tune during balance pass
  },
  shouldRetire: (adventurer, state) => {
    if (adventurer.tier !== 'Legendary') return false;
    const ticksInGuild = state.time.ticksElapsed - adventurer.recruitedYear;
    return ticksInGuild >= PLACEHOLDER_LEGENDARY_RETIRE_DAYS * TICKS_PER_DAY; // placeholder — tune during balance pass
  },
};

export function processAdventurers(
  state: GameState,
  impl: AdventurerProgressionImpl = placeholderAdventurerProgressionImpl,
): GameState {
  let next = state;

  for (const [id, adventurer] of Object.entries(state.adventurers)) {
    const xpGain = impl.xpGainPerTick(adventurer, state);
    const updated = { ...adventurer, xp: adventurer.xp + xpGain };

    if (impl.isReadyForTierUp(updated)) {
      const nextTier = impl.nextTier(updated.tier);
      if (nextTier !== null) {
        const tierUpEvent = {
          id: createId('evt'),
          tick: state.time.ticksElapsed,
          type: 'TIER_UP',
          message: `${updated.name} advanced to tier ${nextTier}!`,
          achievementKey: null,
        } as const;
        next = {
          ...next,
          adventurers: {
            ...next.adventurers,
            [id]: { ...updated, tier: nextTier, xp: 0 },
          },
          pendingEvents: [...next.pendingEvents, tierUpEvent],
        };
        continue;
      }
    }

    if (impl.shouldRetire(updated, state)) {
      // Remove from roster — checkPrestigeConditions reads flags after this
      const { [id]: _retired, ...remaining } = next.adventurers;
      // TODO: add retired adventurer to dynasty Hall of Heroes
      next = {
        ...next,
        adventurers: remaining,
        flags: { ...next.flags, prestigeAvailable: true },
      };
      continue;
    }

    next = {
      ...next,
      adventurers: { ...next.adventurers, [id]: updated },
    };
  }

  return next;
}
