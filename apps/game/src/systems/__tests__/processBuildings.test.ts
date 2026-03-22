import { describe, it, expect } from 'vitest';
import { processBuildings } from '../processBuildings';
import { createInitialGameState } from '../../stores/initialState';
import { BUILDING_TEMPLATES } from '../../data/buildingTemplates';
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
    it('uses template baseIncomePerLevel — guild-hall level 2 earns 2 × 3 = 6', () => {
      // guild-hall: baseIncomePerLevel = 3
      const state = stateWithBuildings({
        bld_1: makeBuilding({ id: 'bld_1', templateId: 'guild-hall', level: 2 }),
      });
      const startGold = state.guild.gold;
      const next = processBuildings(state);
      expect(next.guild.gold).toBe(
        startGold + 2 * BUILDING_TEMPLATES['guild-hall']!.baseIncomePerLevel,
      );
    });

    it('uses template baseIncomePerLevel — smithy level 3 earns 3 × 2 = 6, not 3 × 3', () => {
      // smithy: baseIncomePerLevel = 2 (differs from guild-hall's 3)
      const state = stateWithBuildings({
        bld_1: makeBuilding({ id: 'bld_1', templateId: 'smithy', level: 3 }),
      });
      const startGold = state.guild.gold;
      const next = processBuildings(state);
      expect(next.guild.gold).toBe(
        startGold + 3 * BUILDING_TEMPLATES['smithy']!.baseIncomePerLevel,
      );
    });

    it('sums income across buildings with different templates', () => {
      // guild-hall level 1: 1*3=3; smithy level 2: 2*2=4; total=7
      const state = stateWithBuildings({
        bld_1: makeBuilding({ id: 'bld_1', templateId: 'guild-hall', level: 1 }),
        bld_2: makeBuilding({ id: 'bld_2', templateId: 'smithy', level: 2 }),
      });
      const startGold = state.guild.gold;
      const next = processBuildings(state);
      const expected =
        1 * BUILDING_TEMPLATES['guild-hall']!.baseIncomePerLevel +
        2 * BUILDING_TEMPLATES['smithy']!.baseIncomePerLevel;
      expect(next.guild.gold).toBe(startGold + expected);
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

    it('does not level up guild-hall beyond its template maxLevel (10)', () => {
      const maxLevel = BUILDING_TEMPLATES['guild-hall']!.maxLevel;
      const state = stateWithBuildings({
        bld_1: makeBuilding({
          id: 'bld_1',
          templateId: 'guild-hall',
          level: maxLevel,
          upgradeTicksRemaining: 1,
        }),
      });
      const next = processBuildings(state);
      expect(next.buildings['bld_1']?.level).toBe(maxLevel);
      expect(next.buildings['bld_1']?.upgradeTicksRemaining).toBe(0);
    });

    it('does not level up smithy beyond its template maxLevel (6), not the global max (10)', () => {
      // smithy maxLevel = 6; global PLACEHOLDER_MAX_BUILDING_LEVEL = 10
      const smithyMaxLevel = BUILDING_TEMPLATES['smithy']!.maxLevel; // 6
      const state = stateWithBuildings({
        bld_1: makeBuilding({
          id: 'bld_1',
          templateId: 'smithy',
          level: smithyMaxLevel,
          upgradeTicksRemaining: 1,
        }),
      });
      const next = processBuildings(state);
      expect(next.buildings['bld_1']?.level).toBe(smithyMaxLevel);
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
