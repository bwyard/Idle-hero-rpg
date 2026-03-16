import { describe, it, expect } from 'vitest';
import { processEconomy } from '../processEconomy';
import { createInitialGameState } from '../../stores/initialState';
import {
  PLACEHOLDER_BASE_INCOME_PER_TICK,
  PLACEHOLDER_INCOME_PER_BUILDING_LEVEL_PER_TICK,
  PLACEHOLDER_UPKEEP_PER_ADVENTURER_PER_TICK,
  MAGIC_REWIND_SAFETY_MAX_PRESTIGE,
} from '../../data/balance';
import type { GameState } from '@idle-hero-rpg/shared';

/** Helper to create a state with specific gold, buildings, adventurers, and prestige. */
function makeState(
  overrides: {
    gold?: number;
    buildingLevels?: number[];
    adventurerCount?: number;
    prestigeCount?: number;
  } = {},
): GameState {
  const base = createInitialGameState();
  const gold = overrides.gold ?? 100;
  const buildingLevels = overrides.buildingLevels ?? [1];
  const adventurerCount = overrides.adventurerCount ?? 2;
  const prestigeCount = overrides.prestigeCount ?? 0;

  const buildings: Record<string, GameState['buildings'][string]> = {};
  buildingLevels.forEach((level, i) => {
    buildings[`bld_test_${i}`] = {
      id: `bld_test_${i}`,
      templateId: 'guild-hall',
      level,
      cityId: 'cty_heartlands',
      upgradeTicksRemaining: 0,
    };
  });

  const adventurers: Record<string, GameState['adventurers'][string]> = {};
  for (let i = 0; i < adventurerCount; i++) {
    adventurers[`adv_test_${i}`] = {
      id: `adv_test_${i}`,
      name: `Adventurer ${i}`,
      tier: 'F' as const,
      archetype: 'Fighter' as const,
      xp: 0,
      milestones: [],
      skillBorrowUsed: false,
      recruitedYear: 0,
      retiredYear: null,
    };
  }

  return {
    ...base,
    guild: { ...base.guild, gold },
    buildings,
    adventurers,
    dynasty: { ...base.dynasty, prestigeCount },
  };
}

describe('processEconomy', () => {
  describe('income calculation', () => {
    it('adds base income per tick', () => {
      const state = makeState({ gold: 100, buildingLevels: [], adventurerCount: 0 });
      const next = processEconomy(state);
      expect(next.guild.gold).toBe(100 + PLACEHOLDER_BASE_INCOME_PER_TICK);
    });

    it('adds income per building level', () => {
      const state = makeState({ gold: 100, buildingLevels: [3], adventurerCount: 0 });
      const next = processEconomy(state);
      const expected =
        100 + PLACEHOLDER_BASE_INCOME_PER_TICK + 3 * PLACEHOLDER_INCOME_PER_BUILDING_LEVEL_PER_TICK;
      expect(next.guild.gold).toBe(expected);
    });

    it('sums income across multiple buildings', () => {
      const state = makeState({ gold: 0, buildingLevels: [2, 3], adventurerCount: 0 });
      const next = processEconomy(state);
      const totalBuildingLevels = 2 + 3;
      const expected =
        PLACEHOLDER_BASE_INCOME_PER_TICK +
        totalBuildingLevels * PLACEHOLDER_INCOME_PER_BUILDING_LEVEL_PER_TICK;
      expect(next.guild.gold).toBe(expected);
    });
  });

  describe('upkeep calculation', () => {
    it('deducts upkeep per adventurer per tick', () => {
      const state = makeState({ gold: 1000, buildingLevels: [], adventurerCount: 5 });
      const next = processEconomy(state);
      const expected =
        1000 + PLACEHOLDER_BASE_INCOME_PER_TICK - 5 * PLACEHOLDER_UPKEEP_PER_ADVENTURER_PER_TICK;
      expect(next.guild.gold).toBe(expected);
    });
  });

  describe('negative gold at high prestige', () => {
    it('allows gold to go negative when prestige >= MAGIC_REWIND_SAFETY_MAX_PRESTIGE', () => {
      // Large upkeep, small income, high prestige => negative gold allowed
      const state = makeState({
        gold: 0,
        buildingLevels: [],
        adventurerCount: 100,
        prestigeCount: MAGIC_REWIND_SAFETY_MAX_PRESTIGE,
      });
      const next = processEconomy(state);
      expect(next.guild.gold).toBeLessThan(0);
    });
  });

  describe('Magic Rewind', () => {
    it('triggers when projected gold < 0 and prestige < threshold', () => {
      const state = makeState({
        gold: 0,
        buildingLevels: [],
        adventurerCount: 100,
        prestigeCount: 0,
      });
      const next = processEconomy(state);
      // When Magic Rewind triggers, gold is unchanged (rewind preserves state)
      expect(next.guild.gold).toBe(0);
    });

    it('does not trigger when prestige >= threshold even with negative gold', () => {
      const state = makeState({
        gold: 0,
        buildingLevels: [],
        adventurerCount: 100,
        prestigeCount: MAGIC_REWIND_SAFETY_MAX_PRESTIGE,
      });
      const next = processEconomy(state);
      expect(next.guild.gold).toBeLessThan(0);
      expect(next).not.toBe(state);
    });

    it('emits a MAGIC_REWIND event when rewind triggers', () => {
      const state = makeState({
        gold: 0,
        buildingLevels: [],
        adventurerCount: 100,
        prestigeCount: 0,
      });
      const next = processEconomy(state);
      const rewindEvents = next.pendingEvents.filter((e) => e.type === 'MAGIC_REWIND');
      expect(rewindEvents).toHaveLength(1);
      expect(rewindEvents[0]?.message).toContain('Magic Rewind');
    });

    it('does not trigger when projected gold is positive', () => {
      const state = makeState({
        gold: 1000,
        buildingLevels: [1],
        adventurerCount: 1,
        prestigeCount: 0,
      });
      const next = processEconomy(state);
      expect(next.guild.gold).toBeGreaterThan(0);
    });
  });

  describe('purity', () => {
    it('does not mutate the input state', () => {
      const state = makeState({ gold: 100 });
      const original = JSON.parse(JSON.stringify(state)) as GameState;
      processEconomy(state);
      expect(state).toEqual(original);
    });
  });
});
