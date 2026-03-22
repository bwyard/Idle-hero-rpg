/**
 * System contract tests — validate interface-first pattern for systems with
 * pending design decisions.
 *
 * These tests assert invariants that must hold for ANY implementation of each
 * SystemImpl interface — stub or live. When a live implementation is written,
 * it must pass these same tests without modification.
 *
 * Pattern: test the contract (shape invariants, safety properties),
 * not the values (which change during balance tuning).
 */

import { describe, it, expect } from 'vitest';
import type {
  EconomyImpl,
  AdventurerProgressionImpl,
  BuildingProductionImpl,
  HeroAbilityImpl,
  QuestRewardImpl,
  RivalProgressionImpl,
} from '@idle-hero-rpg/shared';
import { HERO_ACTION_POINT_MAX } from '../data/balance';
import { processEconomy, stubEconomyImpl } from '../systems/processEconomy';
import { processAdventurers, stubAdventurerProgressionImpl } from '../systems/processAdventurers';
import { processBuildings, stubBuildingProductionImpl } from '../systems/processBuildings';
import { processHero, stubHeroAbilityImpl } from '../systems/processHero';
import { processQuests, stubQuestRewardImpl } from '../systems/processQuests';
import { processRivals, stubRivalProgressionImpl } from '../systems/processRivals';
import { createTestState } from './helpers/createTestState';

// ---------------------------------------------------------------------------
// processEconomy
// ---------------------------------------------------------------------------

describe('processEconomy — contract', () => {
  it('stub impl returns state with gold unchanged', () => {
    const state = createTestState({ gold: 100 });
    const result = processEconomy(state, stubEconomyImpl);
    expect(result.guild.gold).toBe(100);
  });

  it('gold is always a finite number after any income/upkeep', () => {
    const impl: EconomyImpl = {
      calculatePassiveIncome: () => 50,
      calculateUpkeep: () => 20,
      shouldTriggerMagicRewind: () => false,
    };
    const state = createTestState({ gold: 0 });
    const result = processEconomy(state, impl);
    expect(Number.isFinite(result.guild.gold)).toBe(true);
    expect(result.guild.gold).toBe(30);
  });

  it('magic rewind returns state unchanged', () => {
    const impl: EconomyImpl = {
      calculatePassiveIncome: () => 0,
      calculateUpkeep: () => 999,
      shouldTriggerMagicRewind: () => true,
    };
    const state = createTestState({ gold: 50 });
    const result = processEconomy(state, impl);
    expect(result.guild.gold).toBe(50); // unchanged — rewind fired
  });

  it('all other state fields are unchanged', () => {
    const state = createTestState({ gold: 10 });
    const result = processEconomy(state, stubEconomyImpl);
    expect(result.hero).toBe(state.hero);
    expect(result.adventurers).toBe(state.adventurers);
    expect(result.time).toBe(state.time);
  });
});

// ---------------------------------------------------------------------------
// processAdventurers
// ---------------------------------------------------------------------------

describe('processAdventurers — contract', () => {
  it('stub impl returns state unchanged', () => {
    const state = createTestState();
    const result = processAdventurers(state, stubAdventurerProgressionImpl);
    expect(result).toEqual(state);
  });

  it('impl that triggers tier-up advances tier and resets xp', () => {
    const impl: AdventurerProgressionImpl = {
      xpGainPerTick: () => 10,
      isReadyForTierUp: (adv) => adv.xp + 10 >= 100,
      nextTier: () => 'E',
      shouldRetire: () => false,
    };
    const state = createTestState({ adventurerXp: 95 });
    const result = processAdventurers(state, impl);
    const advs = Object.values(result.adventurers);
    expect(advs.length).toBeGreaterThan(0);
    for (const adv of advs) {
      expect(adv.tier).toBe('E');
      expect(adv.xp).toBe(0);
    }
  });

  it('impl that triggers retirement removes adventurer and sets prestigeAvailable', () => {
    const impl: AdventurerProgressionImpl = {
      xpGainPerTick: () => 0,
      isReadyForTierUp: () => false,
      nextTier: () => null,
      shouldRetire: () => true,
    };
    const state = createTestState({ adventurerTier: 'Legendary' });
    const result = processAdventurers(state, impl);
    expect(Object.keys(result.adventurers).length).toBe(0);
    expect(result.flags.prestigeAvailable).toBe(true);
  });

  it('adventurer count never increases (no recruitment in this system)', () => {
    const state = createTestState();
    const result = processAdventurers(state, stubAdventurerProgressionImpl);
    expect(Object.keys(result.adventurers).length).toBeLessThanOrEqual(
      Object.keys(state.adventurers).length,
    );
  });
});

// ---------------------------------------------------------------------------
// processBuildings
// ---------------------------------------------------------------------------

describe('processBuildings — contract', () => {
  it('stub impl returns state unchanged', () => {
    const state = createTestState({ gold: 50 });
    const result = processBuildings(state, stubBuildingProductionImpl);
    expect(result).toBe(state); // exact reference — no copy made when nothing changes
  });

  it('income is additive and finite', () => {
    const impl: BuildingProductionImpl = {
      incomePerTick: () => 10,
      upgradeCompletesThisTick: () => false,
    };
    const state = createTestState({ gold: 0, buildingCount: 3 });
    const result = processBuildings(state, impl);
    expect(Number.isFinite(result.guild.gold)).toBe(true);
    expect(result.guild.gold).toBe(30); // 3 buildings × 10
  });

  it('all non-guild state fields are unchanged', () => {
    const impl: BuildingProductionImpl = {
      incomePerTick: () => 5,
      upgradeCompletesThisTick: () => false,
    };
    const state = createTestState({ gold: 0, buildingCount: 1 });
    const result = processBuildings(state, impl);
    expect(result.hero).toBe(state.hero);
    expect(result.adventurers).toBe(state.adventurers);
  });
});

// ---------------------------------------------------------------------------
// processHero
// ---------------------------------------------------------------------------

describe('processHero — contract', () => {
  it('stub impl returns state with AP unchanged', () => {
    const state = createTestState({ heroAP: 3 });
    const result = processHero(state, stubHeroAbilityImpl);
    expect(result.hero.actionPoints).toBe(3);
  });

  it('action points never exceed HERO_ACTION_POINT_MAX', () => {
    const impl: HeroAbilityImpl = {
      actionPointRegen: () => 9999,
      applyPassiveAbility: () => ({}),
      isMilestoneUnlocked: () => false,
    };
    const state = createTestState({ heroAP: 0 });
    const result = processHero(state, impl);
    expect(result.hero.actionPoints).toBeLessThanOrEqual(HERO_ACTION_POINT_MAX);
  });

  it('action points are always non-negative', () => {
    const impl: HeroAbilityImpl = {
      actionPointRegen: () => -1,
      applyPassiveAbility: () => ({}),
      isMilestoneUnlocked: () => false,
    };
    const state = createTestState({ heroAP: 0 });
    const result = processHero(state, impl);
    expect(result.hero.actionPoints).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// processQuests
// ---------------------------------------------------------------------------

describe('processQuests — contract', () => {
  it('stub impl with no assigned quests returns state unchanged', () => {
    const state = createTestState();
    const result = processQuests(state, stubQuestRewardImpl);
    expect(result).toEqual(state);
  });

  it('active quest with ticks remaining decrements by 1', () => {
    const state = createTestState({ activeQuestTicks: 5 });
    const result = processQuests(state, stubQuestRewardImpl);
    const quests = Object.values(result.quests);
    expect(quests.length).toBe(1);
    expect(quests[0]!.ticksRemaining).toBe(4);
  });

  it('quest completes when ticksRemaining reaches 0 and is marked complete', () => {
    const state = createTestState({ activeQuestTicks: 1 });
    const result = processQuests(state, stubQuestRewardImpl);
    const quests = Object.values(result.quests);
    expect(quests[0]!.isComplete).toBe(true);
    expect(quests[0]!.assignedAdventurerId).toBeNull();
  });

  it('gold reward is applied on completion', () => {
    const impl: QuestRewardImpl = {
      goldReward: () => 100,
      adventurerXpReward: () => 0,
    };
    const state = createTestState({ activeQuestTicks: 1, gold: 0 });
    const result = processQuests(state, impl);
    expect(result.guild.gold).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// processRivals
// ---------------------------------------------------------------------------

describe('processRivals — contract', () => {
  it('stub impl adds no rivals', () => {
    const state = createTestState();
    const result = processRivals(state, stubRivalProgressionImpl);
    expect(Object.keys(result.rivals)).toHaveLength(0);
  });

  it('impl that does not populate adds no rivals', () => {
    const impl: RivalProgressionImpl = {
      shouldPopulateRival: () => false,
      hasMetMinimumTenure: () => false,
    };
    const state = createTestState();
    const result = processRivals(state, impl);
    expect(Object.keys(result.rivals)).toHaveLength(0);
  });
});
