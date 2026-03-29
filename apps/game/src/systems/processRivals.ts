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
import { prngNext, prngRangeInt } from '@prime/prime-random';
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

export const processRivals = (
  state: GameState,
  impl: RivalProgressionImpl = stubRivalProgressionImpl,
  /** Test seam: inject a controlled () => number to override seed-based randomness. */
  random?: () => number,
): GameState => {
  // Pass 1: dissolve tenured rivals — thread seed through each rival check.
  const {
    rivals: dissolvedRivals,
    pendingEvents: afterDissolveEvents,
    rngSeed: seedAfterDissolve,
  } = Object.entries(state.rivals).reduce(
    (
      acc: {
        rivals: GameState['rivals'];
        pendingEvents: GameState['pendingEvents'];
        rngSeed: number;
      },
      [id, rival],
    ) => {
      if (!impl.hasMetMinimumTenure(id, { ...state, rivals: acc.rivals })) return acc;
      const [dissolveRoll, nextSeed] = random ? [random(), acc.rngSeed] : prngNext(acc.rngSeed);
      if (dissolveRoll < PLACEHOLDER_RIVAL_DISSOLVE_CHANCE) {
        const { [id]: _dissolved, ...remaining } = acc.rivals;
        return {
          rivals: remaining,
          pendingEvents: [
            ...acc.pendingEvents,
            {
              id: createId('evt'),
              tick: state.time.ticksElapsed,
              type: 'RIVAL_DISSOLVED' as const,
              message: `${rival.name} has dissolved after years of activity.`,
              achievementKey: null,
              causeId: null,
            },
          ],
          rngSeed: nextSeed,
        };
      }
      return { ...acc, rngSeed: nextSeed };
    },
    { rivals: state.rivals, pendingEvents: state.pendingEvents, rngSeed: state.rngSeed },
  );

  // Pass 2: attempt to spawn a new rival — capped at MAX_RIVALS.
  const afterDissolveState = {
    ...state,
    rivals: dissolvedRivals,
    pendingEvents: afterDissolveEvents,
    rngSeed: seedAfterDissolve,
  };

  const [spawnRoll, s1] = random
    ? [random(), afterDissolveState.rngSeed]
    : prngNext(afterDissolveState.rngSeed);

  if (
    Object.keys(afterDissolveState.rivals).length < MAX_RIVALS &&
    spawnRoll < PLACEHOLDER_RIVAL_SPAWN_CHANCE &&
    impl.shouldPopulateRival(afterDissolveState)
  ) {
    const rivalId = createId('rvl');
    const [nameIdx, s2] = random
      ? [Math.floor(random() * RIVAL_NAMES.length), s1]
      : prngRangeInt(s1, RIVAL_NAMES.length);
    const name = RIVAL_NAMES[nameIdx] ?? 'Unknown Guild';

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
      causeId: null,
    } as const;

    return {
      ...afterDissolveState,
      rngSeed: s2,
      rivals: {
        ...afterDissolveState.rivals,
        [rivalId]: rival,
      },
      pendingEvents: [...afterDissolveState.pendingEvents, event],
    };
  }

  // Advance seed even when no spawn (random value was consumed).
  return random ? afterDissolveState : { ...afterDissolveState, rngSeed: s1 };
};
