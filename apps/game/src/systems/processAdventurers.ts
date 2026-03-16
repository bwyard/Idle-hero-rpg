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

export const stubAdventurerProgressionImpl: AdventurerProgressionImpl = {
  xpGainPerTick: () => 0,
  isReadyForTierUp: () => false,
  nextTier: () => null,
  shouldRetire: () => false,
};

export function processAdventurers(
  state: GameState,
  impl: AdventurerProgressionImpl = stubAdventurerProgressionImpl,
): GameState {
  let next = state;

  for (const [id, adventurer] of Object.entries(state.adventurers)) {
    const xpGain = impl.xpGainPerTick(adventurer, state);
    const updated = { ...adventurer, xp: adventurer.xp + xpGain };

    if (impl.isReadyForTierUp(updated)) {
      const nextTier = impl.nextTier(updated.tier);
      if (nextTier !== null) {
        // TODO: emit tier-up event to pendingEvents
        next = {
          ...next,
          adventurers: {
            ...next.adventurers,
            [id]: { ...updated, tier: nextTier, xp: 0 },
          },
        };
        continue;
      }
    }

    if (impl.shouldRetire(updated, state)) {
      // Remove from roster — checkPrestigeConditions reads flags after this
      const { [id]: _retired, ...remaining } = next.adventurers;
      // TODO: emit retirement event to pendingEvents
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
