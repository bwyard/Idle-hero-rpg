/**
 * housing.ts — Dorm capacity and occupancy utilities.
 *
 * Pure functions — no mutations, no side effects.
 */

import type { GameState } from '@idle-hero-rpg/shared';
import { BASE_DORM_CAPACITY, DORM_CAPACITY_PER_LEVEL } from '../data/balance';

/**
 * Returns the total dorm capacity for the guild based on buildings.
 *
 * Capacity = BASE_DORM_CAPACITY + sum(dormBuilding.level × DORM_CAPACITY_PER_LEVEL)
 * for all Dormitory buildings.
 */
export const getDormCapacity = (buildings: GameState['buildings']): number =>
  Object.values(buildings).reduce(
    (total, building) =>
      building.templateId === 'dormitory'
        ? total + building.level * DORM_CAPACITY_PER_LEVEL
        : total,
    BASE_DORM_CAPACITY,
  );

/**
 * Returns the number of adventurers currently occupying dorm beds.
 *
 * Only adventurers with housingType 'dorm' count against capacity.
 */
export const getDormOccupancy = (adventurers: GameState['adventurers']): number =>
  Object.values(adventurers).filter((adv) => adv.housingType === 'dorm').length;

/**
 * Returns true if dorm occupancy has reached or exceeded dorm capacity.
 */
export const isAtDormCapacity = (state: GameState): boolean =>
  getDormOccupancy(state.adventurers) >= getDormCapacity(state.buildings);
