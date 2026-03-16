/**
 * processBuildings — System 5 of 12 in the tick pipe.
 *
 * Applies passive income from each building this tick.
 *
 * Design decisions pending: income per building level, active vs passive split,
 * upgrade cost schedule. stubBuildingProductionImpl satisfies the contract and
 * keeps CI green. Swap in a live impl when those values are tuned —
 * this function does not change.
 *
 * Note: building upgrade progress tracking requires a field addition to the
 * Building type — deferred to Phase 3 when the upgrade system is implemented.
 * BuildingProductionImpl.upgradeCompletesThisTick is defined on the interface
 * now so the seam exists; it will always return false until the type catches up.
 *
 * Pure function — no mutations, no side effects.
 */

import type { GameState, BuildingProductionImpl } from '@idle-hero-rpg/shared';

export const stubBuildingProductionImpl: BuildingProductionImpl = {
  incomePerTick: () => 0,
  upgradeCompletesThisTick: () => false,
};

export function processBuildings(
  state: GameState,
  impl: BuildingProductionImpl = stubBuildingProductionImpl,
): GameState {
  let totalIncome = 0;

  for (const building of Object.values(state.buildings)) {
    totalIncome += impl.incomePerTick(building, state);
    // TODO: handle impl.upgradeCompletesThisTick once Building type has
    //       upgradeProgressTicks field (Phase 3)
  }

  if (totalIncome === 0) return state;

  return {
    ...state,
    guild: {
      ...state.guild,
      gold: state.guild.gold + totalIncome,
    },
  };
}
