/**
 * processRivals — System 7 of 12 in the tick pipe.
 *
 * Simulates NPC rival guild activity: spawns new rivals with a small
 * per-tick chance and enforces minimum guild tenure before dissolution.
 *
 * Design decisions pending: S/SS graduate population rates, NPC minimum
 * tenure numbers. placeholderRivalImpl satisfies the contract and keeps
 * CI green. Swap in a live impl when those values are tuned —
 * this function does not change.
 *
 * Pure function — no mutations, no side effects.
 */

import type { GameState, RivalProgressionImpl, Rival } from '@idle-hero-rpg/shared';
import { createId } from '@idle-hero-rpg/shared';
import {
  MAX_RIVALS,
  NPC_GUILD_MIN_TENURE_YEARS,
  PLACEHOLDER_RIVAL_DISSOLVE_CHANCE,
  PLACEHOLDER_RIVAL_SPAWN_CHANCE,
} from '../data/balance';

/** Small pool of NPC guild names for spawned rivals. */
const RIVAL_NAMES = [
  'The Silver Crest',
  'Iron Wolves',
  'Dawn Sentinels',
  'Shadow Pact',
  'Crimson Order',
  'The Jade Compact',
  'Stormguard',
  'The Ashen Circle',
  'Thornwatch',
  'The Gilded Shield',
];

export const stubRivalProgressionImpl: RivalProgressionImpl = {
  shouldPopulateRival: () => false,
  hasMetMinimumTenure: () => false,
};

export const placeholderRivalImpl: RivalProgressionImpl = {
  shouldPopulateRival: () => true,
  hasMetMinimumTenure: (rivalId, state) => {
    const rival = state.rivals[rivalId];
    if (!rival) return false;
    return state.time.currentYear - rival.foundedYear >= NPC_GUILD_MIN_TENURE_YEARS;
  },
};

export function processRivals(
  state: GameState,
  impl: RivalProgressionImpl = stubRivalProgressionImpl,
  random: () => number = Math.random,
): GameState {
  let next = state;

  // Dissolve tenured rivals with a small per-tick probability
  for (const [id, rival] of Object.entries(next.rivals)) {
    if (impl.hasMetMinimumTenure(id, next) && random() < PLACEHOLDER_RIVAL_DISSOLVE_CHANCE) {
      const { [id]: _dissolved, ...remaining } = next.rivals;
      const dissolveEvent = {
        id: createId('evt'),
        tick: state.time.ticksElapsed,
        type: 'RIVAL_DISSOLVED',
        message: `${rival.name} has dissolved after years of activity.`,
        achievementKey: null,
      } as const;
      next = { ...next, rivals: remaining, pendingEvents: [...next.pendingEvents, dissolveEvent] };
    }
  }

  // Attempt to spawn a new rival — capped at MAX_RIVALS
  if (
    Object.keys(next.rivals).length < MAX_RIVALS &&
    random() < PLACEHOLDER_RIVAL_SPAWN_CHANCE &&
    impl.shouldPopulateRival(next)
  ) {
    const rivalId = createId('rvl');
    const name = RIVAL_NAMES[Math.floor(random() * RIVAL_NAMES.length)] ?? 'Unknown Guild';

    const rival: Rival = {
      id: rivalId,
      name,
      foundedYear: state.time.currentYear,
      tier: 'Minor',
      sourceAdventurerId: null,
    };

    const event = {
      id: createId('evt'),
      tick: state.time.ticksElapsed,
      type: 'RIVAL_APPEARED',
      message: `A new rival guild has appeared: ${name}!`,
      achievementKey: null,
    } as const;

    next = {
      ...next,
      rivals: { ...next.rivals, [rivalId]: rival },
      pendingEvents: [...next.pendingEvents, event],
    };
  }

  return next;
}
