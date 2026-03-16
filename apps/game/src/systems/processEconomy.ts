/**
 * processEconomy — System 2 of 12 in the tick pipe.
 *
 * Calculates gold income from all passive sources and applies upkeep.
 * Checks Magic Rewind condition for early prestiges.
 *
 * Design decisions pending: gold earning rates, cost schedule, Magic Rewind
 * threshold. stubEconomyImpl satisfies the contract and keeps CI green.
 * Swap in a live EconomyImpl when the design pass closes those values —
 * this function does not change.
 *
 * Pure function — no mutations, no side effects.
 */

import type { GameState, EconomyImpl } from '@idle-hero-rpg/shared';

export const stubEconomyImpl: EconomyImpl = {
  calculatePassiveIncome: () => 0,
  calculateUpkeep: () => 0,
  shouldTriggerMagicRewind: () => false,
};

export function processEconomy(
  state: GameState,
  impl: EconomyImpl = stubEconomyImpl,
): GameState {
  const income = impl.calculatePassiveIncome(state);
  const upkeep = impl.calculateUpkeep(state);
  const projectedGold = state.guild.gold + income - upkeep;

  if (impl.shouldTriggerMagicRewind(state, projectedGold)) {
    // TODO: restore last decision checkpoint when Magic Rewind is implemented
    return state;
  }

  return {
    ...state,
    guild: {
      ...state.guild,
      gold: projectedGold,
    },
  };
}
