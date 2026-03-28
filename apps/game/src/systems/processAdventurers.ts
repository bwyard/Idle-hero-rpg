/**
 * processAdventurers — System 3 of 13 in the tick pipe.
 *
 * Advances adventurer XP, handles tier-ups, and triggers retirement for
 * Legendary adventurers (which sets the prestige condition).
 *
 * XP model:
 * - Idle adventurers earn ambient XP per tick (lower tiers gain more)
 * - Adventurers on quests earn 0 passive XP (they get bulk XP on quest completion)
 * - Training, feasts, and mentoring provide additional XP through other systems
 *
 * Pure function — no mutations, no side effects.
 */

import type { GameState, AdventurerProgressionImpl } from '@idle-hero-rpg/shared';
import { createId } from '@idle-hero-rpg/shared';
import {
  ADVENTURER_TIERS,
  PLACEHOLDER_AMBIENT_XP_PER_TICK,
  PLACEHOLDER_TIER_XP_THRESHOLDS,
  PLACEHOLDER_LEGENDARY_RETIRE_DAYS,
  TICKS_PER_DAY,
} from '../data/balance';

/** Check if an adventurer is currently assigned to an active quest. */
const isOnQuest = (adventurerId: string, state: GameState): boolean => {
  return Object.values(state.quests).some(
    (q) => q.assignedAdventurerId === adventurerId && !q.isComplete,
  );
};

export const stubAdventurerProgressionImpl: AdventurerProgressionImpl = {
  xpGainPerTick: () => 0,
  isReadyForTierUp: () => false,
  nextTier: () => null,
  shouldRetire: () => false,
};

/** placeholder — tune during balance pass */
export const placeholderAdventurerProgressionImpl: AdventurerProgressionImpl = {
  xpGainPerTick: (adventurer, state) => {
    // Adventurers on quests earn XP on completion, not per tick
    if (isOnQuest(adventurer.id, state)) return 0;

    // Idle adventurers earn ambient XP (lower tiers learn more from observation)
    return PLACEHOLDER_AMBIENT_XP_PER_TICK[adventurer.tier] ?? 0;
  },
  isReadyForTierUp: (adventurer) => {
    const threshold = PLACEHOLDER_TIER_XP_THRESHOLDS[adventurer.tier];
    if (threshold === undefined) return false;
    return adventurer.xp >= threshold;
  },
  nextTier: (current) => {
    const idx = ADVENTURER_TIERS.indexOf(current);
    if (idx < 0 || idx >= ADVENTURER_TIERS.length - 1) return null;
    return ADVENTURER_TIERS[idx + 1] ?? null;
  },
  shouldRetire: (adventurer, state) => {
    if (adventurer.tier !== 'Legendary') return false;
    const ticksInGuild = state.time.ticksElapsed - adventurer.recruitedYear;
    return ticksInGuild >= PLACEHOLDER_LEGENDARY_RETIRE_DAYS * TICKS_PER_DAY;
  },
};

export const processAdventurers = (
  state: GameState,
  impl: AdventurerProgressionImpl = placeholderAdventurerProgressionImpl,
): GameState => {
  return Object.entries(state.adventurers).reduce((next, [id, adventurer]) => {
    const xpGain = impl.xpGainPerTick(adventurer, state);
    const updated = { ...adventurer, xp: adventurer.xp + xpGain };

    if (impl.isReadyForTierUp(updated)) {
      const tierUpNext = impl.nextTier(updated.tier);
      if (tierUpNext !== null) {
        return {
          ...next,
          adventurers: { ...next.adventurers, [id]: { ...updated, tier: tierUpNext, xp: 0 } },
          pendingEvents: [
            ...next.pendingEvents,
            {
              id: createId('evt'),
              tick: state.time.ticksElapsed,
              type: 'TIER_UP',
              message: `${updated.name} advanced to tier ${tierUpNext}!`,
              achievementKey: null,
              causeId: null,
            } as const,
          ],
        };
      }
    }

    if (impl.shouldRetire(updated, state)) {
      const { [id]: _retired, ...remaining } = next.adventurers;
      return {
        ...next,
        adventurers: remaining,
        flags: { ...next.flags, prestigeAvailable: true },
      };
    }

    return {
      ...next,
      adventurers: { ...next.adventurers, [id]: updated },
    };
  }, state);
};
