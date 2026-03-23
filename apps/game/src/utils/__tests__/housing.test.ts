/**
 * housing.test.ts — Unit tests for housing utility functions.
 *
 * TDD: these tests were written before the implementation.
 */

import { describe, it, expect } from 'vitest';
import { getDormCapacity, getDormOccupancy, isAtDormCapacity } from '../housing';
import { createInitialGameState } from '../../stores/initialState';
import { BASE_DORM_CAPACITY, DORM_CAPACITY_PER_LEVEL } from '../../data/balance';
import type { GameState, Building, Adventurer } from '@idle-hero-rpg/shared';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeBuilding(overrides: Partial<Building> = {}): Building {
  return {
    id: 'bld_test1',
    templateId: 'dormitory',
    level: 1,
    cityId: 'cty_test1',
    upgradeTicksRemaining: 0,
    ...overrides,
  };
}

function makeAdventurer(id: string, housingType: 'dorm' | 'owned' = 'dorm'): Adventurer {
  return {
    id,
    name: 'TestAdv',
    tier: 'F',
    archetype: 'Fighter',
    xp: 0,
    milestones: [],
    skillBorrowUsed: false,
    recruitedYear: 0,
    retiredYear: null,
    housingType,
  };
}

function stateWithBuildings(buildings: Record<string, Building>): GameState {
  return { ...createInitialGameState(), buildings };
}

function stateWithAdventurers(
  adventurers: Record<string, Adventurer>,
  buildings: Record<string, Building> = {},
): GameState {
  return { ...createInitialGameState(), adventurers, buildings };
}

// ─── getDormCapacity ─────────────────────────────────────────────────────────

describe('getDormCapacity', () => {
  it('returns BASE_DORM_CAPACITY when there are no dormitory buildings', () => {
    const state = stateWithBuildings({});
    expect(getDormCapacity(state.buildings)).toBe(BASE_DORM_CAPACITY);
  });

  it('adds DORM_CAPACITY_PER_LEVEL for a level-1 dormitory', () => {
    const state = stateWithBuildings({
      bld_1: makeBuilding({ id: 'bld_1', templateId: 'dormitory', level: 1 }),
    });
    expect(getDormCapacity(state.buildings)).toBe(BASE_DORM_CAPACITY + 1 * DORM_CAPACITY_PER_LEVEL);
  });

  it('adds capacity for a level-3 dormitory', () => {
    const state = stateWithBuildings({
      bld_1: makeBuilding({ id: 'bld_1', templateId: 'dormitory', level: 3 }),
    });
    expect(getDormCapacity(state.buildings)).toBe(BASE_DORM_CAPACITY + 3 * DORM_CAPACITY_PER_LEVEL);
  });

  it('sums capacity across multiple dormitory buildings', () => {
    const state = stateWithBuildings({
      bld_1: makeBuilding({ id: 'bld_1', templateId: 'dormitory', level: 2 }),
      bld_2: makeBuilding({ id: 'bld_2', templateId: 'dormitory', level: 1 }),
    });
    expect(getDormCapacity(state.buildings)).toBe(
      BASE_DORM_CAPACITY + (2 + 1) * DORM_CAPACITY_PER_LEVEL,
    );
  });

  it('ignores non-dormitory buildings', () => {
    const state = stateWithBuildings({
      bld_1: makeBuilding({ id: 'bld_1', templateId: 'guild-hall', level: 5 }),
      bld_2: makeBuilding({ id: 'bld_2', templateId: 'dormitory', level: 1 }),
    });
    expect(getDormCapacity(state.buildings)).toBe(BASE_DORM_CAPACITY + 1 * DORM_CAPACITY_PER_LEVEL);
  });
});

// ─── getDormOccupancy ────────────────────────────────────────────────────────

describe('getDormOccupancy', () => {
  it('returns 0 with no adventurers', () => {
    expect(getDormOccupancy({})).toBe(0);
  });

  it('counts adventurers with housingType dorm', () => {
    const advs: Record<string, Adventurer> = {
      adv_1: makeAdventurer('adv_1', 'dorm'),
      adv_2: makeAdventurer('adv_2', 'dorm'),
    };
    expect(getDormOccupancy(advs)).toBe(2);
  });

  it('does not count adventurers with housingType owned', () => {
    const advs: Record<string, Adventurer> = {
      adv_1: makeAdventurer('adv_1', 'dorm'),
      adv_2: makeAdventurer('adv_2', 'owned'),
    };
    expect(getDormOccupancy(advs)).toBe(1);
  });

  it('returns 0 when all adventurers have owned housing', () => {
    const advs: Record<string, Adventurer> = {
      adv_1: makeAdventurer('adv_1', 'owned'),
      adv_2: makeAdventurer('adv_2', 'owned'),
    };
    expect(getDormOccupancy(advs)).toBe(0);
  });
});

// ─── isAtDormCapacity ────────────────────────────────────────────────────────

describe('isAtDormCapacity', () => {
  it('returns false when occupancy is below capacity', () => {
    // BASE_DORM_CAPACITY = 4; initial state has 2 adventurers
    const state = createInitialGameState();
    expect(isAtDormCapacity(state)).toBe(false);
  });

  it('returns true when occupancy equals capacity', () => {
    // Fill exactly BASE_DORM_CAPACITY slots with dorm adventurers, no dorm buildings
    const advs: Record<string, Adventurer> = {};
    for (let i = 0; i < BASE_DORM_CAPACITY; i++) {
      advs[`adv_${String(i)}`] = makeAdventurer(`adv_${String(i)}`, 'dorm');
    }
    const state = stateWithAdventurers(advs, {});
    expect(isAtDormCapacity(state)).toBe(true);
  });

  it('returns true when occupancy exceeds capacity', () => {
    const advs: Record<string, Adventurer> = {};
    for (let i = 0; i < BASE_DORM_CAPACITY + 1; i++) {
      advs[`adv_${String(i)}`] = makeAdventurer(`adv_${String(i)}`, 'dorm');
    }
    const state = stateWithAdventurers(advs, {});
    expect(isAtDormCapacity(state)).toBe(true);
  });

  it('returns false after building a dormitory raises capacity above occupancy', () => {
    // Fill BASE_DORM_CAPACITY slots — at capacity without dorm building
    const advs: Record<string, Adventurer> = {};
    for (let i = 0; i < BASE_DORM_CAPACITY; i++) {
      advs[`adv_${String(i)}`] = makeAdventurer(`adv_${String(i)}`, 'dorm');
    }
    // Add a level-1 dorm building — now capacity is BASE + DORM_CAPACITY_PER_LEVEL
    const buildings: Record<string, Building> = {
      bld_dorm: makeBuilding({ id: 'bld_dorm', templateId: 'dormitory', level: 1 }),
    };
    const state = stateWithAdventurers(advs, buildings);
    expect(isAtDormCapacity(state)).toBe(false);
  });
});
