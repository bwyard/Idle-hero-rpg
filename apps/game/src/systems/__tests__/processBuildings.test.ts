import { describe, it, expect } from 'vitest';
import { processBuildings } from '../processBuildings';
import { createInitialGameState } from '../../stores/initialState';
import {
  PLACEHOLDER_BUILDING_INCOME_PER_LEVEL,
  PLACEHOLDER_MAX_BUILDING_LEVEL,
} from '../../data/balance';
import type { GameState, Building } from '@idle-hero-rpg/shared';

function makeBuilding(overrides: Partial<Building> = {}): Building {
  return {
    id: 'bld_test1',
    templateId: 'guild-hall',
    level: 1,
    cityId: 'cty_test1',
    upgradeTicksRemaining: 0,
    ...overrides,
  };
}

function stateWithBuildings(buildings: Record<string, Building>): GameState {
  return { ...createInitialGameState(), buildings };
}

describe('processBuildings', () => {
  describe('income', () => {
    it('adds income based on building level', () => {
      const state = stateWithBuildings({
        bld_1: makeBuilding({ id: 'bld_1', level: 2 }),
      });
      const startGold = state.guild.gold;
      const next = processBuildings(state);
      expect(next.guild.gold).toBe(startGold + 2 * PLACEHOLDER_BUILDING_INCOME_PER_LEVEL);
    });

    it('sums income from multiple buildings', () => {
      const state = stateWithBuildings({
        bld_1: makeBuilding({ id: 'bld_1', level: 1 }),
        bld_2: makeBuilding({ id: 'bld_2', level: 3 }),
      });
      const startGold = state.guild.gold;
      const next = processBuildings(state);
      expect(next.guild.gold).toBe(startGold + 4 * PLACEHOLDER_BUILDING_INCOME_PER_LEVEL);
    });

    it('returns state unchanged with no buildings', () => {
      const state = stateWithBuildings({});
      const next = processBuildings(state);
      expect(next).toBe(state);
    });
  });

  describe('upgrade progress', () => {
    it('decrements upgradeTicksRemaining when upgrading', () => {
      const state = stateWithBuildings({
        bld_1: makeBuilding({ id: 'bld_1', level: 1, upgradeTicksRemaining: 10 }),
      });
      const next = processBuildings(state);
      expect(next.buildings['bld_1']?.upgradeTicksRemaining).toBe(9);
    });

    it('levels up building when upgradeTicksRemaining reaches 0', () => {
      const state = stateWithBuildings({
        bld_1: makeBuilding({ id: 'bld_1', level: 1, upgradeTicksRemaining: 1 }),
      });
      const next = processBuildings(state);
      expect(next.buildings['bld_1']?.level).toBe(2);
      expect(next.buildings['bld_1']?.upgradeTicksRemaining).toBe(0);
    });

    it('emits BUILDING_UPGRADE event on level up', () => {
      const state = stateWithBuildings({
        bld_1: makeBuilding({ id: 'bld_1', level: 1, upgradeTicksRemaining: 1 }),
      });
      const next = processBuildings(state);
      const events = next.pendingEvents.filter((e) => e.type === 'BUILDING_UPGRADE');
      expect(events).toHaveLength(1);
    });

    it('does not level up beyond max level', () => {
      const state = stateWithBuildings({
        bld_1: makeBuilding({
          id: 'bld_1',
          level: PLACEHOLDER_MAX_BUILDING_LEVEL,
          upgradeTicksRemaining: 1,
        }),
      });
      const next = processBuildings(state);
      expect(next.buildings['bld_1']?.level).toBe(PLACEHOLDER_MAX_BUILDING_LEVEL);
      expect(next.buildings['bld_1']?.upgradeTicksRemaining).toBe(0);
    });

    it('does not decrement when not upgrading (upgradeTicksRemaining === 0)', () => {
      const state = stateWithBuildings({
        bld_1: makeBuilding({ id: 'bld_1', level: 1, upgradeTicksRemaining: 0 }),
      });
      const next = processBuildings(state);
      expect(next.buildings['bld_1']?.upgradeTicksRemaining).toBe(0);
    });
  });

  it('does not mutate the input state', () => {
    const state = stateWithBuildings({
      bld_1: makeBuilding({ id: 'bld_1', level: 1, upgradeTicksRemaining: 5 }),
    });
    const origTicks = state.buildings['bld_1']?.upgradeTicksRemaining;
    processBuildings(state);
    expect(state.buildings['bld_1']?.upgradeTicksRemaining).toBe(origTicks);
  });
});
