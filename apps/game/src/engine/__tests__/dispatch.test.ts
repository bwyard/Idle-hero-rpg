import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { dispatch } from '../dispatch';
import { createInitialGameState } from '../../stores/initialState';
import {
  PLACEHOLDER_RECRUIT_COST,
  PLACEHOLDER_BUILD_COST,
  PLACEHOLDER_HOLD_DURATION_DAYS,
  PLACEHOLDER_ENGAGE_COST,
  PLACEHOLDER_MAX_QUEST_BOARD_SIZE,
  PLACEHOLDER_UPGRADE_COST_BASE,
  PLACEHOLDER_UPGRADE_DURATION_TICKS_PER_LEVEL,
  PLACEHOLDER_MAX_BUILDING_LEVEL,
  PLACEHOLDER_CITY_EXPANSION_BASE,
  PLACEHOLDER_CITY_EXPANSION_PER_CITY,
  TICKS_PER_DAY,
} from '../../data/balance';
import type { GameState, TransientVisitor } from '@idle-hero-rpg/shared';

/** Helper to create a visitor with sensible defaults. */
function makeVisitor(overrides: Partial<TransientVisitor> = {}): TransientVisitor {
  return {
    id: 'vis_test1',
    name: 'TestVisitor',
    tier: 'D',
    archetype: 'Rogue',
    serviceRequest: 'Quest',
    arrivedAtTick: 0,
    expiresAtTick: 100,
    heldUntilTick: null,
    holdCount: 0,
    ...overrides,
  };
}

/** Helper to create a state with a visitor and gold. */
function stateWithVisitorAndGold(
  visitor: TransientVisitor,
  gold: number,
  ticksElapsed = 10,
): GameState {
  return {
    ...createInitialGameState(),
    time: { ticksElapsed, currentDay: 0, currentSeason: 'Spring' as const, currentYear: 0 },
    guild: { ...createInitialGameState().guild, gold },
    transientVisitors: { [visitor.id]: visitor },
  };
}

describe('dispatch', () => {
  it('returns state unchanged for an unknown action type', () => {
    const state = createInitialGameState();
    const next = dispatch(state, { type: 'UNKNOWN_ACTION' } as never);
    expect(next).toEqual(state);
  });

  it('does not mutate the input state', () => {
    const state = createInitialGameState();
    const originalTick = state.time.ticksElapsed;
    dispatch(state, { type: 'UNKNOWN_ACTION' } as never);
    expect(state.time.ticksElapsed).toBe(originalTick);
  });

  it('property: always returns a state with the same version number', () => {
    fc.assert(
      fc.property(fc.nat({ max: 100 }), (n) => {
        const state = { ...createInitialGameState(), version: n };
        const next = dispatch(state, { type: 'UNKNOWN_ACTION' } as never);
        return next.version === n;
      }),
    );
  });

  describe('GENERATE_QUESTS', () => {
    it('generates quests on the board', () => {
      const state = createInitialGameState();
      const next = dispatch(state, { type: 'GENERATE_QUESTS' });

      const unassigned = Object.values(next.quests).filter((q) => q.assignedAdventurerId === null);
      expect(unassigned.length).toBe(PLACEHOLDER_MAX_QUEST_BOARD_SIZE);
    });

    it('does not mutate the input state', () => {
      const state = createInitialGameState();
      dispatch(state, { type: 'GENERATE_QUESTS' });
      expect(Object.keys(state.quests).length).toBe(0);
    });
  });

  describe('START_QUEST', () => {
    function stateWithUnassignedQuest(): GameState {
      const state = createInitialGameState();
      return {
        ...state,
        quests: {
          qst_test_1: {
            id: 'qst_test_1',
            templateId: 'quest-tpl-heartlands-patrol',
            assignedAdventurerId: null,
            ticksRemaining: 30,
            isComplete: false,
          },
        },
      };
    }

    it('assigns an existing unassigned quest to an adventurer', () => {
      const state = stateWithUnassignedQuest();
      const next = dispatch(state, {
        type: 'START_QUEST',
        questId: 'qst_test_1',
        adventurerId: 'adv_starter_1',
      });

      expect(next.quests['qst_test_1']?.assignedAdventurerId).toBe('adv_starter_1');
    });

    it('does not create a new quest — only assigns existing', () => {
      const state = stateWithUnassignedQuest();
      const next = dispatch(state, {
        type: 'START_QUEST',
        questId: 'qst_test_1',
        adventurerId: 'adv_starter_1',
      });

      expect(Object.keys(next.quests).length).toBe(1);
    });

    it('returns state unchanged if quest ID not found', () => {
      const state = stateWithUnassignedQuest();
      const next = dispatch(state, {
        type: 'START_QUEST',
        questId: 'qst_nonexistent',
        adventurerId: 'adv_starter_1',
      });

      expect(next.quests['qst_test_1']?.assignedAdventurerId).toBeNull();
    });

    it('returns state unchanged if quest is already assigned', () => {
      const state = stateWithUnassignedQuest();
      const assigned: GameState = {
        ...state,
        quests: {
          qst_test_1: {
            ...state.quests['qst_test_1']!,
            assignedAdventurerId: 'adv_starter_2',
          },
        },
      };
      const next = dispatch(assigned, {
        type: 'START_QUEST',
        questId: 'qst_test_1',
        adventurerId: 'adv_starter_1',
      });

      expect(next.quests['qst_test_1']?.assignedAdventurerId).toBe('adv_starter_2');
    });

    it('returns state unchanged if adventurer ID not found', () => {
      const state = stateWithUnassignedQuest();
      const next = dispatch(state, {
        type: 'START_QUEST',
        questId: 'qst_test_1',
        adventurerId: 'adv_nonexistent',
      });

      expect(next.quests['qst_test_1']?.assignedAdventurerId).toBeNull();
    });

    it('adds a pending event on successful assignment', () => {
      const state = stateWithUnassignedQuest();
      const next = dispatch(state, {
        type: 'START_QUEST',
        questId: 'qst_test_1',
        adventurerId: 'adv_starter_1',
      });

      expect(next.pendingEvents.length).toBe(1);
      expect(next.pendingEvents[0]?.type).toBe('QUEST_START');
    });

    it('does not mutate the input state', () => {
      const state = stateWithUnassignedQuest();
      dispatch(state, {
        type: 'START_QUEST',
        questId: 'qst_test_1',
        adventurerId: 'adv_starter_1',
      });
      expect(state.quests['qst_test_1']?.assignedAdventurerId).toBeNull();
    });
  });

  describe('HOLD_VISITOR', () => {
    it('extends visitor stay by setting heldUntilTick relative to expiry', () => {
      const visitor = makeVisitor({ id: 'vis_1', holdCount: 0, expiresAtTick: 100 });
      const state = stateWithVisitorAndGold(visitor, 500, 10);

      const next = dispatch(state, { type: 'HOLD_VISITOR', visitorId: 'vis_1' });
      const held = next.transientVisitors['vis_1']!;
      expect(held.heldUntilTick).toBe(100 + PLACEHOLDER_HOLD_DURATION_DAYS * TICKS_PER_DAY);
    });

    it('increments holdCount', () => {
      const visitor = makeVisitor({ id: 'vis_1', holdCount: 0 });
      const state = stateWithVisitorAndGold(visitor, 500, 10);

      const next = dispatch(state, { type: 'HOLD_VISITOR', visitorId: 'vis_1' });
      expect(next.transientVisitors['vis_1']!.holdCount).toBe(1);
    });

    it('diminishes hold duration with each subsequent hold', () => {
      const visitor = makeVisitor({ id: 'vis_1', holdCount: 1, expiresAtTick: 100 });
      const state = stateWithVisitorAndGold(visitor, 500, 10);

      const next = dispatch(state, { type: 'HOLD_VISITOR', visitorId: 'vis_1' });
      const held = next.transientVisitors['vis_1']!;
      // duration = base / (holdCount + 1) = (30 * 4) / (1 + 1) = 60
      // Added to expiry (100), not current tick (10)
      expect(held.heldUntilTick).toBe(
        100 + Math.floor((PLACEHOLDER_HOLD_DURATION_DAYS * TICKS_PER_DAY) / 2),
      );
    });

    it('emits a VISITOR_HOLD event', () => {
      const visitor = makeVisitor({ id: 'vis_1' });
      const state = stateWithVisitorAndGold(visitor, 500, 10);

      const next = dispatch(state, { type: 'HOLD_VISITOR', visitorId: 'vis_1' });
      const holdEvents = next.pendingEvents.filter((e) => e.type === 'VISITOR_HOLD');
      expect(holdEvents).toHaveLength(1);
    });

    it('adds hold duration to expiry deadline, not current tick', () => {
      // Visitor expires at tick 100, current tick is 10
      // Hold should extend from expiry (100), not from now (10)
      const visitor = makeVisitor({ id: 'vis_1', holdCount: 0, expiresAtTick: 100 });
      const state = stateWithVisitorAndGold(visitor, 500, 10);

      const next = dispatch(state, { type: 'HOLD_VISITOR', visitorId: 'vis_1' });
      const held = next.transientVisitors['vis_1']!;
      const holdDuration = PLACEHOLDER_HOLD_DURATION_DAYS * TICKS_PER_DAY;
      // Should be relative to expiry (100), not current tick (10)
      expect(held.heldUntilTick).toBe(100 + holdDuration);
    });

    it('adds hold duration to existing heldUntilTick when already held', () => {
      // Already held until tick 150, holding again should extend from 150
      const visitor = makeVisitor({
        id: 'vis_1',
        holdCount: 1,
        expiresAtTick: 100,
        heldUntilTick: 150,
      });
      const state = stateWithVisitorAndGold(visitor, 500, 10);

      const next = dispatch(state, { type: 'HOLD_VISITOR', visitorId: 'vis_1' });
      const held = next.transientVisitors['vis_1']!;
      // holdCount becomes 2, so duration = base / 2
      const holdDuration = Math.floor((PLACEHOLDER_HOLD_DURATION_DAYS * TICKS_PER_DAY) / 2);
      // Should extend from max(expiresAtTick=100, heldUntilTick=150) = 150
      expect(held.heldUntilTick).toBe(150 + holdDuration);
    });

    it('returns state unchanged if visitor does not exist', () => {
      const state = createInitialGameState();
      const next = dispatch(state, { type: 'HOLD_VISITOR', visitorId: 'vis_nonexistent' });
      expect(next).toEqual(state);
    });
  });

  describe('ENGAGE_VISITOR', () => {
    it('converts visitor to adventurer', () => {
      const visitor = makeVisitor({ id: 'vis_1', name: 'Corvus', tier: 'D', archetype: 'Rogue' });
      const state = stateWithVisitorAndGold(visitor, 500, 10);

      const next = dispatch(state, { type: 'ENGAGE_VISITOR', visitorId: 'vis_1' });

      // Visitor removed
      expect(next.transientVisitors['vis_1']).toBeUndefined();

      // Adventurer added
      const advs = Object.values(next.adventurers);
      const engaged = advs.find((a) => a.name === 'Corvus');
      expect(engaged).toBeDefined();
      expect(engaged!.tier).toBe('D');
      expect(engaged!.archetype).toBe('Rogue');
    });

    it('deducts gold', () => {
      const visitor = makeVisitor({ id: 'vis_1' });
      const state = stateWithVisitorAndGold(visitor, 500, 10);

      const next = dispatch(state, { type: 'ENGAGE_VISITOR', visitorId: 'vis_1' });
      expect(next.guild.gold).toBe(500 - PLACEHOLDER_ENGAGE_COST);
    });

    it('emits INSUFFICIENT_GOLD event and does not engage if gold is too low', () => {
      const visitor = makeVisitor({ id: 'vis_1', name: 'TestVisitor' });
      const state = stateWithVisitorAndGold(visitor, PLACEHOLDER_ENGAGE_COST - 1, 10);

      const next = dispatch(state, { type: 'ENGAGE_VISITOR', visitorId: 'vis_1' });
      // Visitor still present
      expect(next.transientVisitors['vis_1']).toBeDefined();
      // Gold unchanged
      expect(next.guild.gold).toBe(PLACEHOLDER_ENGAGE_COST - 1);
      // Feedback event emitted
      const feedbackEvents = next.pendingEvents.filter((e) => e.type === 'INSUFFICIENT_GOLD');
      expect(feedbackEvents).toHaveLength(1);
      expect(feedbackEvents[0]?.message).toContain(`${String(PLACEHOLDER_ENGAGE_COST)}g`);
    });

    it('returns state unchanged if visitor does not exist', () => {
      const state = createInitialGameState();
      const next = dispatch(state, { type: 'ENGAGE_VISITOR', visitorId: 'vis_nonexistent' });
      expect(next).toEqual(state);
    });

    it('emits a VISITOR_ENGAGE event', () => {
      const visitor = makeVisitor({ id: 'vis_1' });
      const state = stateWithVisitorAndGold(visitor, 500, 10);

      const next = dispatch(state, { type: 'ENGAGE_VISITOR', visitorId: 'vis_1' });
      const engageEvents = next.pendingEvents.filter((e) => e.type === 'VISITOR_ENGAGE');
      expect(engageEvents).toHaveLength(1);
    });
  });

  describe('DISMISS_VISITOR', () => {
    it('removes visitor from transientVisitors', () => {
      const visitor = makeVisitor({ id: 'vis_1' });
      const state = stateWithVisitorAndGold(visitor, 500, 10);

      const next = dispatch(state, { type: 'DISMISS_VISITOR', visitorId: 'vis_1' });
      expect(next.transientVisitors['vis_1']).toBeUndefined();
    });

    it('emits a VISITOR_DISMISS event', () => {
      const visitor = makeVisitor({ id: 'vis_1' });
      const state = stateWithVisitorAndGold(visitor, 500, 10);

      const next = dispatch(state, { type: 'DISMISS_VISITOR', visitorId: 'vis_1' });
      const dismissEvents = next.pendingEvents.filter((e) => e.type === 'VISITOR_DISMISS');
      expect(dismissEvents).toHaveLength(1);
    });

    it('returns state unchanged if visitor does not exist', () => {
      const state = createInitialGameState();
      const next = dispatch(state, { type: 'DISMISS_VISITOR', visitorId: 'vis_nonexistent' });
      expect(next).toEqual(state);
    });
  });

  describe('UPGRADE_BUILDING', () => {
    function stateWithBuilding(level: number, gold: number, upgrading = false): GameState {
      return {
        ...createInitialGameState(),
        guild: { ...createInitialGameState().guild, gold },
        buildings: {
          bld_test_1: {
            id: 'bld_test_1',
            templateId: 'guild-hall',
            level,
            cityId: 'cty_heartlands',
            upgradeTicksRemaining: upgrading ? 100 : 0,
          },
        },
      };
    }

    it('starts an upgrade for a valid building with enough gold', () => {
      const targetLevel = 2;
      const cost = PLACEHOLDER_UPGRADE_COST_BASE * targetLevel * targetLevel;
      const state = stateWithBuilding(1, cost + 100);

      const next = dispatch(state, { type: 'UPGRADE_BUILDING', buildingId: 'bld_test_1' });
      expect(next.buildings['bld_test_1']!.upgradeTicksRemaining).toBe(
        PLACEHOLDER_UPGRADE_DURATION_TICKS_PER_LEVEL * targetLevel,
      );
      expect(next.guild.gold).toBe(cost + 100 - cost);
    });

    it('deducts correct cost based on target level squared', () => {
      const currentLevel = 3;
      const targetLevel = 4;
      const cost = PLACEHOLDER_UPGRADE_COST_BASE * targetLevel * targetLevel;
      const state = stateWithBuilding(currentLevel, 100000);

      const next = dispatch(state, { type: 'UPGRADE_BUILDING', buildingId: 'bld_test_1' });
      expect(next.guild.gold).toBe(100000 - cost);
    });

    it('returns state unchanged if building does not exist', () => {
      const state = stateWithBuilding(1, 10000);
      const next = dispatch(state, { type: 'UPGRADE_BUILDING', buildingId: 'bld_nonexistent' });
      expect(next).toEqual(state);
    });

    it('emits CANNOT_UPGRADE event and does not upgrade if building is already upgrading', () => {
      const state = stateWithBuilding(1, 10000, true);
      const next = dispatch(state, { type: 'UPGRADE_BUILDING', buildingId: 'bld_test_1' });
      // Building unchanged
      expect(next.buildings['bld_test_1']!.level).toBe(1);
      expect(next.guild.gold).toBe(10000);
      // Feedback event emitted
      const feedbackEvents = next.pendingEvents.filter((e) => e.type === 'CANNOT_UPGRADE');
      expect(feedbackEvents).toHaveLength(1);
      expect(feedbackEvents[0]?.message).toContain('already upgrading');
    });

    it('emits CANNOT_UPGRADE event and does not upgrade if building is at max level', () => {
      const state = stateWithBuilding(PLACEHOLDER_MAX_BUILDING_LEVEL, 100000);
      const next = dispatch(state, { type: 'UPGRADE_BUILDING', buildingId: 'bld_test_1' });
      // Building unchanged
      expect(next.buildings['bld_test_1']!.level).toBe(PLACEHOLDER_MAX_BUILDING_LEVEL);
      expect(next.guild.gold).toBe(100000);
      // Feedback event emitted
      const feedbackEvents = next.pendingEvents.filter((e) => e.type === 'CANNOT_UPGRADE');
      expect(feedbackEvents).toHaveLength(1);
      expect(feedbackEvents[0]?.message).toContain('max level');
    });

    it('emits INSUFFICIENT_GOLD event and does not upgrade if gold is too low', () => {
      const targetLevel = 2;
      const cost = PLACEHOLDER_UPGRADE_COST_BASE * targetLevel * targetLevel;
      const state = stateWithBuilding(1, cost - 1);

      const next = dispatch(state, { type: 'UPGRADE_BUILDING', buildingId: 'bld_test_1' });
      // Building level unchanged
      expect(next.buildings['bld_test_1']!.level).toBe(1);
      // Gold unchanged
      expect(next.guild.gold).toBe(cost - 1);
      // Feedback event emitted
      const feedbackEvents = next.pendingEvents.filter((e) => e.type === 'INSUFFICIENT_GOLD');
      expect(feedbackEvents).toHaveLength(1);
      expect(feedbackEvents[0]?.message).toContain(`${String(cost)}g`);
    });

    it('emits an UPGRADE_START event', () => {
      const state = stateWithBuilding(1, 10000);
      const next = dispatch(state, { type: 'UPGRADE_BUILDING', buildingId: 'bld_test_1' });
      const upgradeEvents = next.pendingEvents.filter((e) => e.type === 'UPGRADE_START');
      expect(upgradeEvents).toHaveLength(1);
    });

    it('does not mutate input state', () => {
      const state = stateWithBuilding(1, 10000);
      const original = JSON.parse(JSON.stringify(state)) as GameState;
      dispatch(state, { type: 'UPGRADE_BUILDING', buildingId: 'bld_test_1' });
      expect(state).toEqual(original);
    });
  });

  describe('RECRUIT_ADVENTURER', () => {
    it('creates a new adventurer in the roster', () => {
      const state: GameState = {
        ...createInitialGameState(),
        guild: { ...createInitialGameState().guild, gold: PLACEHOLDER_RECRUIT_COST + 100 },
      };
      const startCount = Object.keys(state.adventurers).length;

      const next = dispatch(state, { type: 'RECRUIT_ADVENTURER' });
      expect(Object.keys(next.adventurers).length).toBe(startCount + 1);
    });

    it('deducts PLACEHOLDER_RECRUIT_COST gold', () => {
      const startGold = PLACEHOLDER_RECRUIT_COST + 200;
      const state: GameState = {
        ...createInitialGameState(),
        guild: { ...createInitialGameState().guild, gold: startGold },
      };

      const next = dispatch(state, { type: 'RECRUIT_ADVENTURER' });
      expect(next.guild.gold).toBe(startGold - PLACEHOLDER_RECRUIT_COST);
    });

    it('emits INSUFFICIENT_GOLD event and does not recruit if gold is too low', () => {
      const state: GameState = {
        ...createInitialGameState(),
        guild: { ...createInitialGameState().guild, gold: PLACEHOLDER_RECRUIT_COST - 1 },
      };

      const next = dispatch(state, { type: 'RECRUIT_ADVENTURER' });
      // No new adventurer added
      expect(Object.keys(next.adventurers).length).toBe(Object.keys(state.adventurers).length);
      // Gold unchanged
      expect(next.guild.gold).toBe(state.guild.gold);
      // Feedback event emitted
      const feedbackEvents = next.pendingEvents.filter((e) => e.type === 'INSUFFICIENT_GOLD');
      expect(feedbackEvents).toHaveLength(1);
      expect(feedbackEvents[0]?.message).toContain(`${String(PLACEHOLDER_RECRUIT_COST)}g`);
    });

    it('new adventurer has tier F and xp 0', () => {
      const state: GameState = {
        ...createInitialGameState(),
        guild: { ...createInitialGameState().guild, gold: PLACEHOLDER_RECRUIT_COST + 100 },
      };
      const existingIds = new Set(Object.keys(state.adventurers));

      const next = dispatch(state, { type: 'RECRUIT_ADVENTURER' });
      const newId = Object.keys(next.adventurers).find((id) => !existingIds.has(id));
      expect(newId).toBeDefined();

      const newAdv = next.adventurers[newId!];
      expect(newAdv).toBeDefined();
      expect(newAdv!.tier).toBe('F');
      expect(newAdv!.xp).toBe(0);
    });

    it('emits a RECRUIT event', () => {
      const state: GameState = {
        ...createInitialGameState(),
        guild: { ...createInitialGameState().guild, gold: PLACEHOLDER_RECRUIT_COST + 100 },
      };

      const next = dispatch(state, { type: 'RECRUIT_ADVENTURER' });
      const recruitEvents = next.pendingEvents.filter((e) => e.type === 'RECRUIT');
      expect(recruitEvents).toHaveLength(1);
    });

    it('does not mutate input state', () => {
      const state: GameState = {
        ...createInitialGameState(),
        guild: { ...createInitialGameState().guild, gold: PLACEHOLDER_RECRUIT_COST + 100 },
      };
      const original = JSON.parse(JSON.stringify(state)) as GameState;

      dispatch(state, { type: 'RECRUIT_ADVENTURER' });
      expect(state).toEqual(original);
    });
  });

  describe('BUILD_BUILDING', () => {
    it('creates a new building in the buildings record', () => {
      const state: GameState = {
        ...createInitialGameState(),
        guild: { ...createInitialGameState().guild, gold: PLACEHOLDER_BUILD_COST + 100 },
      };
      const startCount = Object.keys(state.buildings).length;

      const next = dispatch(state, {
        type: 'BUILD_BUILDING',
        buildingTemplateId: 'training-grounds',
        cityId: 'cty_heartlands',
      });
      expect(Object.keys(next.buildings).length).toBe(startCount + 1);
    });

    it('deducts PLACEHOLDER_BUILD_COST gold', () => {
      const startGold = PLACEHOLDER_BUILD_COST + 200;
      const state: GameState = {
        ...createInitialGameState(),
        guild: { ...createInitialGameState().guild, gold: startGold },
      };

      const next = dispatch(state, {
        type: 'BUILD_BUILDING',
        buildingTemplateId: 'training-grounds',
        cityId: 'cty_heartlands',
      });
      expect(next.guild.gold).toBe(startGold - PLACEHOLDER_BUILD_COST);
    });

    it('emits INSUFFICIENT_GOLD event and does not build if gold is too low', () => {
      const state: GameState = {
        ...createInitialGameState(),
        guild: { ...createInitialGameState().guild, gold: PLACEHOLDER_BUILD_COST - 1 },
      };

      const next = dispatch(state, {
        type: 'BUILD_BUILDING',
        buildingTemplateId: 'training-grounds',
        cityId: 'cty_heartlands',
      });
      // No new building added
      expect(Object.keys(next.buildings).length).toBe(Object.keys(state.buildings).length);
      // Gold unchanged
      expect(next.guild.gold).toBe(state.guild.gold);
      // Feedback event emitted
      const feedbackEvents = next.pendingEvents.filter((e) => e.type === 'INSUFFICIENT_GOLD');
      expect(feedbackEvents).toHaveLength(1);
      expect(feedbackEvents[0]?.message).toContain(`${String(PLACEHOLDER_BUILD_COST)}g`);
    });

    it('new building has level 1 and upgradeTicksRemaining 0', () => {
      const state: GameState = {
        ...createInitialGameState(),
        guild: { ...createInitialGameState().guild, gold: PLACEHOLDER_BUILD_COST + 100 },
      };
      const existingIds = new Set(Object.keys(state.buildings));

      const next = dispatch(state, {
        type: 'BUILD_BUILDING',
        buildingTemplateId: 'training-grounds',
        cityId: 'cty_heartlands',
      });
      const newId = Object.keys(next.buildings).find((id) => !existingIds.has(id));
      expect(newId).toBeDefined();

      const newBuilding = next.buildings[newId!];
      expect(newBuilding).toBeDefined();
      expect(newBuilding!.level).toBe(1);
      expect(newBuilding!.upgradeTicksRemaining).toBe(0);
    });

    it('emits a BUILD event', () => {
      const state: GameState = {
        ...createInitialGameState(),
        guild: { ...createInitialGameState().guild, gold: PLACEHOLDER_BUILD_COST + 100 },
      };

      const next = dispatch(state, {
        type: 'BUILD_BUILDING',
        buildingTemplateId: 'training-grounds',
        cityId: 'cty_heartlands',
      });
      const buildEvents = next.pendingEvents.filter((e) => e.type === 'BUILD');
      expect(buildEvents).toHaveLength(1);
    });

    it('does not mutate input state', () => {
      const state: GameState = {
        ...createInitialGameState(),
        guild: { ...createInitialGameState().guild, gold: PLACEHOLDER_BUILD_COST + 100 },
      };
      const original = JSON.parse(JSON.stringify(state)) as GameState;

      dispatch(state, {
        type: 'BUILD_BUILDING',
        buildingTemplateId: 'training-grounds',
        cityId: 'cty_heartlands',
      });
      expect(state).toEqual(original);
    });
  });

  describe('EXPAND_CITY', () => {
    it('creates a new city when player has enough gold', () => {
      const state = createInitialGameState();
      const citiesOwned = Object.keys(state.cities).length;
      const cost =
        PLACEHOLDER_CITY_EXPANSION_BASE + PLACEHOLDER_CITY_EXPANSION_PER_CITY * citiesOwned;
      const richState: GameState = {
        ...state,
        guild: { ...state.guild, gold: cost + 100 },
      };

      const next = dispatch(richState, {
        type: 'EXPAND_CITY',
        cityId: 'cty_coast',
        cityName: 'Seaside Haven',
      });

      const newCities = Object.values(next.cities).filter((c) => c.name === 'Seaside Haven');
      expect(newCities).toHaveLength(1);
      expect(newCities[0]!.isUnlocked).toBe(true);
    });

    it('deducts correct cost based on cities owned', () => {
      const state = createInitialGameState();
      const citiesOwned = Object.keys(state.cities).length; // 1
      const cost =
        PLACEHOLDER_CITY_EXPANSION_BASE + PLACEHOLDER_CITY_EXPANSION_PER_CITY * citiesOwned;
      const richState: GameState = {
        ...state,
        guild: { ...state.guild, gold: 10000 },
      };

      const next = dispatch(richState, {
        type: 'EXPAND_CITY',
        cityId: 'cty_coast',
        cityName: 'Seaside Haven',
      });
      expect(next.guild.gold).toBe(10000 - cost);
    });

    it('emits INSUFFICIENT_GOLD event and does not expand if gold is too low', () => {
      const state = createInitialGameState();
      const citiesOwned = Object.keys(state.cities).length;
      const cost =
        PLACEHOLDER_CITY_EXPANSION_BASE + PLACEHOLDER_CITY_EXPANSION_PER_CITY * citiesOwned;
      const poorState: GameState = { ...state, guild: { ...state.guild, gold: cost - 1 } };

      const next = dispatch(poorState, {
        type: 'EXPAND_CITY',
        cityId: 'cty_coast',
        cityName: 'Seaside Haven',
      });
      // No city added
      expect(Object.keys(next.cities).length).toBe(Object.keys(state.cities).length);
      // Feedback event emitted
      const feedbackEvents = next.pendingEvents.filter((e) => e.type === 'INSUFFICIENT_GOLD');
      expect(feedbackEvents).toHaveLength(1);
      expect(feedbackEvents[0]?.message).toContain(`${String(cost)}g`);
    });

    it('new city ID starts with cty_', () => {
      const state: GameState = {
        ...createInitialGameState(),
        guild: { ...createInitialGameState().guild, gold: 10000 },
      };

      const next = dispatch(state, {
        type: 'EXPAND_CITY',
        cityId: 'cty_coast',
        cityName: 'Seaside Haven',
      });

      const newCityIds = Object.keys(next.cities).filter((id) => !state.cities[id]);
      expect(newCityIds).toHaveLength(1);
      expect(newCityIds[0]).toMatch(/^cty_/);
    });

    it('emits a CITY_EXPANSION event', () => {
      const state: GameState = {
        ...createInitialGameState(),
        guild: { ...createInitialGameState().guild, gold: 10000 },
      };

      const next = dispatch(state, {
        type: 'EXPAND_CITY',
        cityId: 'cty_coast',
        cityName: 'Seaside Haven',
      });
      const expansionEvents = next.pendingEvents.filter((e) => e.type === 'CITY_EXPANSION');
      expect(expansionEvents).toHaveLength(1);
    });

    it('does not mutate input state', () => {
      const state: GameState = {
        ...createInitialGameState(),
        guild: { ...createInitialGameState().guild, gold: 10000 },
      };
      const original = JSON.parse(JSON.stringify(state)) as GameState;
      dispatch(state, { type: 'EXPAND_CITY', cityId: 'cty_coast', cityName: 'Seaside Haven' });
      expect(state).toEqual(original);
    });
  });
});
