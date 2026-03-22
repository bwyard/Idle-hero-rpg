/**
 * createTestState — minimal GameState factory for unit and contract tests.
 *
 * Returns a valid GameState with sensible defaults. Pass overrides to set
 * specific fields needed by the test. Only supply what the test cares about.
 */

import type { GameState, Adventurer, Quest } from '@idle-hero-rpg/shared';

interface TestStateOverrides {
  gold?: number;
  heroAP?: number;
  adventurerXp?: number;
  adventurerTier?: Adventurer['tier'];
  buildingCount?: number;
  activeQuestTicks?: number;
}

export function createTestState(overrides: TestStateOverrides = {}): GameState {
  const {
    gold = 0,
    heroAP = 0,
    adventurerXp = 0,
    adventurerTier = 'F',
    buildingCount = 0,
    activeQuestTicks,
  } = overrides;

  const adventurers: Record<string, Adventurer> = {
    adv_test1: {
      id: 'adv_test1',
      name: 'Test Adventurer',
      tier: adventurerTier,
      archetype: null,
      xp: adventurerXp,
      milestones: [],
      skillBorrowUsed: false,
      recruitedYear: 1,
      retiredYear: null,
    },
  };

  const buildings: Record<string, import('@idle-hero-rpg/shared').Building> = {};
  for (let i = 0; i < buildingCount; i++) {
    const id = `bld_test${String(i + 1)}`;
    buildings[id] = {
      id,
      templateId: 'guild-hall',
      level: 1,
      cityId: 'city_test1',
      upgradeTicksRemaining: 0,
    };
  }

  const quests: Record<string, Quest> = {};
  if (activeQuestTicks !== undefined) {
    quests.qst_test1 = {
      id: 'qst_test1',
      templateId: 'patrol',
      assignedAdventurerId: 'adv_test1',
      ticksRemaining: activeQuestTicks,
      isComplete: false,
      completedAtTick: null,
    };
  }

  return {
    version: 2,
    rngSeed: 42,
    time: { ticksElapsed: 0, currentDay: 0, currentSeason: 'Spring', currentYear: 0 },
    hero: {
      id: 'hero_test1',
      name: 'Test Hero',
      heroClass: 'Warblade',
      actionPoints: heroAP,
    },
    guild: {
      name: 'Test Guild',
      type: 'Combat',
      gold,
      reputation: 0,
    },
    adventurers,
    transientVisitors: {},
    cities: {},
    buildings,
    quests,
    dynasty: {
      prestigeCount: 0,
      worldAwarenessTier: 'Hidden',
      permanentBonuses: {},
      hallOfHeroes: [],
    },
    rivals: {},
    eventLog: [],
    pendingEvents: [],
    flags: {
      prestigeAvailable: false,
    },
  };
}
