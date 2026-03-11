/**
 * processRivals — System 7 of 12 in the tick pipe.
 *
 * Simulates NPC rival guild activity: populates rivals from S/SS graduates
 * of prior runs and enforces minimum guild tenure before dissolution.
 *
 * Design decisions pending: S/SS graduate population rates, NPC minimum
 * tenure numbers. stubRivalProgressionImpl satisfies the contract and keeps
 * CI green. Swap in a live impl when those values are tuned —
 * this function does not change.
 *
 * Pure function — no mutations, no side effects.
 */

import type { GameState, RivalProgressionImpl } from '@idle-hero-rpg/shared';

export const stubRivalProgressionImpl: RivalProgressionImpl = {
  shouldPopulateRival: () => false,
  hasMetMinimumTenure: () => false,
};

export function processRivals(
  state: GameState,
  impl: RivalProgressionImpl = stubRivalProgressionImpl,
): GameState {
  // TODO: when shouldPopulateRival is true, pull next S/SS graduate from
  //       dynasty.hallOfHeroes and add to rivals record with createId('rival')
  // TODO: dissolve rivals that hasMetMinimumTenure and have no active quests
  //       referencing them
  if (!impl.shouldPopulateRival(state)) {
    return state;
  }

  return state;
}
