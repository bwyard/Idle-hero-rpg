/**
 * processBuildings — System 5 of 13 in the tick pipe.
 *
 * Each tick:
 * 1. Collect passive income from all buildings (level × incomePerLevel)
 * 2. Advance upgrade progress for buildings being upgraded
 * 3. Level up buildings whose upgrade completes this tick
 *
 * Pure function — no mutations, no side effects.
 */

import type { GameState, BuildingProductionImpl, Building } from '@idle-hero-rpg/shared';
import { createId } from '@idle-hero-rpg/shared';
import {
  PLACEHOLDER_BUILDING_INCOME_PER_LEVEL,
  PLACEHOLDER_MAX_BUILDING_LEVEL,
} from '../data/balance';

export const stubBuildingProductionImpl: BuildingProductionImpl = {
  incomePerTick: () => 0,
  upgradeCompletesThisTick: () => false,
};

/** placeholder — tune during balance pass */
export const placeholderBuildingProductionImpl: BuildingProductionImpl = {
  incomePerTick: (building) => building.level * PLACEHOLDER_BUILDING_INCOME_PER_LEVEL,
  upgradeCompletesThisTick: (building) =>
    building.upgradeTicksRemaining === 1 && building.level < PLACEHOLDER_MAX_BUILDING_LEVEL,
};

export function processBuildings(
  state: GameState,
  impl: BuildingProductionImpl = placeholderBuildingProductionImpl,
): GameState {
  const entries = Object.entries(state.buildings);
  if (entries.length === 0) return state;

  let totalIncome = 0;
  let updatedBuildings: Record<string, Building> | null = null;
  const pendingEvents = [...state.pendingEvents];

  for (const [id, building] of entries) {
    totalIncome += impl.incomePerTick(building, state);

    if (building.upgradeTicksRemaining > 0) {
      if (updatedBuildings === null) {
        updatedBuildings = { ...state.buildings };
      }

      if (impl.upgradeCompletesThisTick(building, state)) {
        // Level up
        updatedBuildings[id] = {
          ...building,
          level: building.level + 1,
          upgradeTicksRemaining: 0,
        };
        pendingEvents.push({
          id: createId('evt'),
          tick: state.time.ticksElapsed,
          type: 'BUILDING_UPGRADE',
          message: `${building.templateId} upgraded to level ${String(building.level + 1)}!`,
          achievementKey: null,
        });
      } else if (
        building.upgradeTicksRemaining === 1 &&
        building.level >= PLACEHOLDER_MAX_BUILDING_LEVEL
      ) {
        // At max level — just clear the upgrade
        updatedBuildings[id] = { ...building, upgradeTicksRemaining: 0 };
      } else {
        // Tick down
        updatedBuildings[id] = {
          ...building,
          upgradeTicksRemaining: building.upgradeTicksRemaining - 1,
        };
      }
    }
  }

  const hasChanges =
    totalIncome !== 0 ||
    updatedBuildings !== null ||
    pendingEvents.length > state.pendingEvents.length;
  if (!hasChanges) return state;

  return {
    ...state,
    guild: {
      ...state.guild,
      gold: state.guild.gold + totalIncome,
    },
    buildings: updatedBuildings ?? state.buildings,
    pendingEvents,
  };
}
