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
  PLACEHOLDER_CITY_EXPANSION_BASE,
  PLACEHOLDER_CITY_EXPANSION_PER_CITY,
  TICKS_PER_DAY,
  BASE_DORM_CAPACITY,
  OVERCAPACITY_RECRUIT_SURCHARGE,
  PLACEHOLDER_VISITOR_SERVICE_DURATION_DAYS,
} from '../../data/balance';
import { BUILDING_TEMPLATES } from '../../data/buildingTemplates';
import type { GameState, TransientVisitor, Adventurer } from '@idle-hero-rpg/shared';

/** Helper to create a visitor with sensible defaults. */
function makeVisitor(overrides: Partial<TransientVisitor> = {}): TransientVisitor {
  return {
    id: 'vis_test1',
    name: 'TestVisitor',
    tier: 'D',
    archetype: 'Rogue',
    serviceRequest: 'Quest',
    serviceFee: 25,
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
    function stateWithUnassignedQuest(
      minTier: GameState['quests'][string]['minTier'] = 'F',
    ): GameState {
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
            completedAtTick: null,
            minTier,
            partySize: 1,
            region: 'Heartlands',
            difficulty: 'easy' as const,
          },
        },
      };
    }

    /** Build a state with the initial adventurers plus one at the given tier. */
    function stateWithAdventurerAtTier(
      tier: Adventurer['tier'],
      minTier: GameState['quests'][string]['minTier'] = 'F',
    ): GameState {
      const base = stateWithUnassignedQuest(minTier);
      return {
        ...base,
        adventurers: {
          ...base.adventurers,
          adv_tiered: {
            id: 'adv_tiered',
            name: 'TieredAdv',
            tier,
            archetype: 'Fighter',
            xp: 0,
            milestones: [],
            skillBorrowUsed: false,
            recruitedYear: 0,
            retiredYear: null,
            housingType: 'dorm' as const,
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

    describe('minTier gate', () => {
      it('allows assignment when adventurer tier exactly meets minTier', () => {
        // quest requires D, adventurer is D — should succeed
        const state = stateWithAdventurerAtTier('D', 'D');
        const next = dispatch(state, {
          type: 'START_QUEST',
          questId: 'qst_test_1',
          adventurerId: 'adv_tiered',
        });
        expect(next.quests['qst_test_1']?.assignedAdventurerId).toBe('adv_tiered');
      });

      it('allows assignment when adventurer tier exceeds minTier', () => {
        // quest requires D, adventurer is B — should succeed
        const state = stateWithAdventurerAtTier('B', 'D');
        const next = dispatch(state, {
          type: 'START_QUEST',
          questId: 'qst_test_1',
          adventurerId: 'adv_tiered',
        });
        expect(next.quests['qst_test_1']?.assignedAdventurerId).toBe('adv_tiered');
      });

      it('returns state unchanged when adventurer is below minTier (F vs D)', () => {
        // quest requires D, adventurer is F — should be blocked
        const state = stateWithAdventurerAtTier('F', 'D');
        const next = dispatch(state, {
          type: 'START_QUEST',
          questId: 'qst_test_1',
          adventurerId: 'adv_tiered',
        });
        expect(next.quests['qst_test_1']?.assignedAdventurerId).toBeNull();
      });

      it('returns state unchanged when adventurer is one tier below minTier (C vs B)', () => {
        // quest requires B, adventurer is C — should be blocked
        const state = stateWithAdventurerAtTier('C', 'B');
        const next = dispatch(state, {
          type: 'START_QUEST',
          questId: 'qst_test_1',
          adventurerId: 'adv_tiered',
        });
        expect(next.quests['qst_test_1']?.assignedAdventurerId).toBeNull();
      });

      it('emits no pending event when tier gate blocks assignment', () => {
        const state = stateWithAdventurerAtTier('F', 'D');
        const next = dispatch(state, {
          type: 'START_QUEST',
          questId: 'qst_test_1',
          adventurerId: 'adv_tiered',
        });
        expect(next.pendingEvents).toHaveLength(0);
      });

      it('property: tier gate always blocks when adventurer rank < minTier rank', () => {
        const tierOrder = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'Legendary'] as const;
        fc.assert(
          fc.property(
            fc.integer({ min: 0, max: tierOrder.length - 1 }),
            fc.integer({ min: 0, max: tierOrder.length - 1 }),
            (advIdx, minIdx) => {
              if (advIdx >= minIdx) return true; // only testing the blocked cases
              const advTier = tierOrder[advIdx]!;
              const minTier = tierOrder[minIdx]!;
              const testState = stateWithAdventurerAtTier(advTier, minTier);
              const next = dispatch(testState, {
                type: 'START_QUEST',
                questId: 'qst_test_1',
                adventurerId: 'adv_tiered',
              });
              return next.quests['qst_test_1']?.assignedAdventurerId === null;
            },
          ),
        );
      });
    });
  });

  describe('HOLD_VISITOR', () => {
    it('extends visitor stay by setting heldUntilTick', () => {
      const visitor = makeVisitor({ id: 'vis_1', holdCount: 0 });
      const state = stateWithVisitorAndGold(visitor, 500, 10);

      const next = dispatch(state, { type: 'HOLD_VISITOR', visitorId: 'vis_1' });
      const held = next.transientVisitors['vis_1']!;
      expect(held.heldUntilTick).toBe(10 + PLACEHOLDER_HOLD_DURATION_DAYS * TICKS_PER_DAY);
    });

    it('increments holdCount', () => {
      const visitor = makeVisitor({ id: 'vis_1', holdCount: 0 });
      const state = stateWithVisitorAndGold(visitor, 500, 10);

      const next = dispatch(state, { type: 'HOLD_VISITOR', visitorId: 'vis_1' });
      expect(next.transientVisitors['vis_1']!.holdCount).toBe(1);
    });

    it('diminishes hold duration with each subsequent hold', () => {
      const visitor = makeVisitor({ id: 'vis_1', holdCount: 1 });
      const state = stateWithVisitorAndGold(visitor, 500, 10);

      const next = dispatch(state, { type: 'HOLD_VISITOR', visitorId: 'vis_1' });
      const held = next.transientVisitors['vis_1']!;
      // duration = base / (holdCount + 1) = (30 * 4) / (1 + 1) = 60
      expect(held.heldUntilTick).toBe(
        10 + Math.floor((PLACEHOLDER_HOLD_DURATION_DAYS * TICKS_PER_DAY) / 2),
      );
    });

    it('emits a VISITOR_HOLD event', () => {
      const visitor = makeVisitor({ id: 'vis_1' });
      const state = stateWithVisitorAndGold(visitor, 500, 10);

      const next = dispatch(state, { type: 'HOLD_VISITOR', visitorId: 'vis_1' });
      const holdEvents = next.pendingEvents.filter((e) => e.type === 'VISITOR_HOLD');
      expect(holdEvents).toHaveLength(1);
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

    it('fails if insufficient gold (returns state unchanged)', () => {
      const visitor = makeVisitor({ id: 'vis_1' });
      const state = stateWithVisitorAndGold(visitor, PLACEHOLDER_ENGAGE_COST - 1, 10);

      const next = dispatch(state, { type: 'ENGAGE_VISITOR', visitorId: 'vis_1' });
      expect(next.transientVisitors['vis_1']).toBeDefined();
      expect(next.guild.gold).toBe(PLACEHOLDER_ENGAGE_COST - 1);
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

  describe('SERVE_VISITOR', () => {
    it('removes visitor from transientVisitors', () => {
      const visitor = makeVisitor({ id: 'vis_1', serviceFee: 50 });
      const state = stateWithVisitorAndGold(visitor, 100, 10);

      const next = dispatch(state, { type: 'SERVE_VISITOR', visitorId: 'vis_1' });
      expect(next.transientVisitors['vis_1']).toBeUndefined();
    });

    it('awards the visitor serviceFee to guild gold', () => {
      const visitor = makeVisitor({ id: 'vis_1', serviceFee: 50 });
      const state = stateWithVisitorAndGold(visitor, 100, 10);

      const next = dispatch(state, { type: 'SERVE_VISITOR', visitorId: 'vis_1' });
      expect(next.guild.gold).toBe(150);
    });

    it('emits a VISITOR_SERVED event', () => {
      const visitor = makeVisitor({ id: 'vis_1', serviceFee: 50 });
      const state = stateWithVisitorAndGold(visitor, 100, 10);

      const next = dispatch(state, { type: 'SERVE_VISITOR', visitorId: 'vis_1' });
      const servedEvents = next.pendingEvents.filter((e) => e.type === 'VISITOR_SERVED');
      expect(servedEvents).toHaveLength(1);
    });

    it('returns state unchanged if visitor does not exist', () => {
      const state = createInitialGameState();
      const next = dispatch(state, { type: 'SERVE_VISITOR', visitorId: 'vis_nonexistent' });
      expect(next).toEqual(state);
    });

    it('does not change adventurer roster', () => {
      const visitor = makeVisitor({ id: 'vis_1', serviceFee: 50 });
      const state = stateWithVisitorAndGold(visitor, 100, 10);
      const beforeCount = Object.keys(state.adventurers).length;

      const next = dispatch(state, { type: 'SERVE_VISITOR', visitorId: 'vis_1' });
      expect(Object.keys(next.adventurers)).toHaveLength(beforeCount);
    });
  });

  describe('UPGRADE_BUILDING', () => {
    const guildHall = BUILDING_TEMPLATES['guild-hall']!;
    const smithy = BUILDING_TEMPLATES['smithy']!;

    function stateWithBuilding(
      level: number,
      gold: number,
      upgrading = false,
      templateId = 'guild-hall',
    ): GameState {
      return {
        ...createInitialGameState(),
        guild: { ...createInitialGameState().guild, gold },
        buildings: {
          bld_test_1: {
            id: 'bld_test_1',
            templateId,
            level,
            cityId: 'cty_heartlands',
            upgradeTicksRemaining: upgrading ? 100 : 0,
          },
        },
      };
    }

    it('starts an upgrade using template upgradeCostBase and upgradeDurationBaseTicks', () => {
      // guild-hall: upgradeCostBase=150, upgradeDurationBaseTicks=80
      const targetLevel = 2;
      const cost = guildHall.upgradeCostBase * targetLevel * targetLevel;
      const state = stateWithBuilding(1, cost + 100);

      const next = dispatch(state, { type: 'UPGRADE_BUILDING', buildingId: 'bld_test_1' });
      expect(next.buildings['bld_test_1']!.upgradeTicksRemaining).toBe(
        guildHall.upgradeDurationBaseTicks * targetLevel,
      );
      expect(next.guild.gold).toBe(100);
    });

    it('smithy upgrade uses smithy upgradeCostBase (90), not global (100)', () => {
      const targetLevel = 2;
      const cost = smithy.upgradeCostBase * targetLevel * targetLevel; // 90 * 4 = 360
      const state = stateWithBuilding(1, cost + 50, false, 'smithy');

      const next = dispatch(state, { type: 'UPGRADE_BUILDING', buildingId: 'bld_test_1' });
      expect(next.guild.gold).toBe(50);
      expect(next.buildings['bld_test_1']!.upgradeTicksRemaining).toBe(
        smithy.upgradeDurationBaseTicks * targetLevel, // 50 * 2 = 100
      );
    });

    it('smithy at maxLevel (6) cannot upgrade, even though global max is 10', () => {
      const state = stateWithBuilding(smithy.maxLevel, 100000, false, 'smithy');
      const next = dispatch(state, { type: 'UPGRADE_BUILDING', buildingId: 'bld_test_1' });
      expect(next).toEqual(state);
    });

    it('deducts correct cost based on target level squared (guild-hall)', () => {
      const currentLevel = 3;
      const targetLevel = 4;
      const cost = guildHall.upgradeCostBase * targetLevel * targetLevel; // 150 * 16 = 2400
      const state = stateWithBuilding(currentLevel, 100000);

      const next = dispatch(state, { type: 'UPGRADE_BUILDING', buildingId: 'bld_test_1' });
      expect(next.guild.gold).toBe(100000 - cost);
    });

    it('returns state unchanged if building does not exist', () => {
      const state = stateWithBuilding(1, 10000);
      const next = dispatch(state, { type: 'UPGRADE_BUILDING', buildingId: 'bld_nonexistent' });
      expect(next).toEqual(state);
    });

    it('returns state unchanged if building is already upgrading', () => {
      const state = stateWithBuilding(1, 10000, true);
      const next = dispatch(state, { type: 'UPGRADE_BUILDING', buildingId: 'bld_test_1' });
      expect(next).toEqual(state);
    });

    it('returns state unchanged if guild-hall is at its template maxLevel (10)', () => {
      const state = stateWithBuilding(guildHall.maxLevel, 100000);
      const next = dispatch(state, { type: 'UPGRADE_BUILDING', buildingId: 'bld_test_1' });
      expect(next).toEqual(state);
    });

    it('returns state unchanged if not enough gold for guild-hall upgrade', () => {
      const targetLevel = 2;
      const cost = guildHall.upgradeCostBase * targetLevel * targetLevel; // 150 * 4 = 600
      const state = stateWithBuilding(1, cost - 1);

      const next = dispatch(state, { type: 'UPGRADE_BUILDING', buildingId: 'bld_test_1' });
      expect(next).toEqual(state);
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

    it('returns state unchanged if insufficient gold', () => {
      const state: GameState = {
        ...createInitialGameState(),
        guild: { ...createInitialGameState().guild, gold: PLACEHOLDER_RECRUIT_COST - 1 },
      };

      const next = dispatch(state, { type: 'RECRUIT_ADVENTURER' });
      expect(next).toEqual(state);
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

    it('new adventurer has housingType dorm', () => {
      const state: GameState = {
        ...createInitialGameState(),
        guild: { ...createInitialGameState().guild, gold: PLACEHOLDER_RECRUIT_COST + 100 },
      };
      const existingIds = new Set(Object.keys(state.adventurers));

      const next = dispatch(state, { type: 'RECRUIT_ADVENTURER' });
      const newId = Object.keys(next.adventurers).find((id) => !existingIds.has(id));
      expect(newId).toBeDefined();
      expect(next.adventurers[newId!]!.housingType).toBe('dorm');
    });

    describe('dorm capacity surcharge', () => {
      /** Build a state with exactly N dorm-type adventurers and no dorm buildings (capacity = BASE_DORM_CAPACITY). */
      function stateAtCapacity(dormOccupants: number, gold: number): GameState {
        const advs: Record<string, Adventurer> = {};
        for (let i = 0; i < dormOccupants; i++) {
          advs[`adv_fill_${String(i)}`] = {
            id: `adv_fill_${String(i)}`,
            name: 'Filler',
            tier: 'F',
            archetype: 'Fighter',
            xp: 0,
            milestones: [],
            skillBorrowUsed: false,
            recruitedYear: 0,
            retiredYear: null,
            housingType: 'dorm',
          };
        }
        return {
          ...createInitialGameState(),
          guild: { ...createInitialGameState().guild, gold },
          adventurers: advs,
          buildings: {},
        };
      }

      it('under capacity: deducts standard PLACEHOLDER_RECRUIT_COST', () => {
        // 1 dorm occupant vs BASE_DORM_CAPACITY — well under capacity
        const startGold = PLACEHOLDER_RECRUIT_COST + 500;
        const state = stateAtCapacity(1, startGold);

        const next = dispatch(state, { type: 'RECRUIT_ADVENTURER' });
        expect(next.guild.gold).toBe(startGold - PLACEHOLDER_RECRUIT_COST);
      });

      it('at capacity: deducts surcharge cost', () => {
        const surchargeCost = Math.ceil(PLACEHOLDER_RECRUIT_COST * OVERCAPACITY_RECRUIT_SURCHARGE);
        const startGold = surchargeCost + 500;
        const state = stateAtCapacity(BASE_DORM_CAPACITY, startGold);

        const next = dispatch(state, { type: 'RECRUIT_ADVENTURER' });
        expect(next.guild.gold).toBe(startGold - surchargeCost);
      });

      it('at capacity: recruit succeeds if player can afford surcharge', () => {
        const surchargeCost = Math.ceil(PLACEHOLDER_RECRUIT_COST * OVERCAPACITY_RECRUIT_SURCHARGE);
        const startGold = surchargeCost + 1;
        const state = stateAtCapacity(BASE_DORM_CAPACITY, startGold);
        const startCount = Object.keys(state.adventurers).length;

        const next = dispatch(state, { type: 'RECRUIT_ADVENTURER' });
        expect(Object.keys(next.adventurers).length).toBe(startCount + 1);
      });

      it('at capacity: recruit blocked if player cannot afford surcharge', () => {
        const surchargeCost = Math.ceil(PLACEHOLDER_RECRUIT_COST * OVERCAPACITY_RECRUIT_SURCHARGE);
        // Give exactly surchargeCost - 1 so player can't afford surcharge
        const state = stateAtCapacity(BASE_DORM_CAPACITY, surchargeCost - 1);

        const next = dispatch(state, { type: 'RECRUIT_ADVENTURER' });
        expect(next).toEqual(state);
      });

      it('at capacity: recruit blocked returns state reference unchanged', () => {
        const surchargeCost = Math.ceil(PLACEHOLDER_RECRUIT_COST * OVERCAPACITY_RECRUIT_SURCHARGE);
        const state = stateAtCapacity(BASE_DORM_CAPACITY, surchargeCost - 1);

        const next = dispatch(state, { type: 'RECRUIT_ADVENTURER' });
        expect(next).toBe(state);
      });
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

    it('returns state unchanged if insufficient gold', () => {
      const state: GameState = {
        ...createInitialGameState(),
        guild: { ...createInitialGameState().guild, gold: PLACEHOLDER_BUILD_COST - 1 },
      };

      const next = dispatch(state, {
        type: 'BUILD_BUILDING',
        buildingTemplateId: 'training-grounds',
        cityId: 'cty_heartlands',
      });
      expect(next).toEqual(state);
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

    it('returns state unchanged if not enough gold', () => {
      const state = createInitialGameState();
      const poorState: GameState = {
        ...state,
        guild: { ...state.guild, gold: 0 },
      };

      const next = dispatch(poorState, {
        type: 'EXPAND_CITY',
        cityId: 'cty_coast',
        cityName: 'Seaside Haven',
      });
      expect(Object.keys(next.cities).length).toBe(Object.keys(state.cities).length);
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

  describe('APPROVE_VISITOR', () => {
    it('awards serviceFee gold to the guild', () => {
      const visitor = makeVisitor({ id: 'vis_1', serviceFee: 50 });
      const state = stateWithVisitorAndGold(visitor, 100, 10);

      const next = dispatch(state, { type: 'APPROVE_VISITOR', visitorId: 'vis_1' });
      expect(next.guild.gold).toBe(150);
    });

    it('sets heldUntilTick to current tick + service duration', () => {
      const visitor = makeVisitor({ id: 'vis_1' });
      const state = stateWithVisitorAndGold(visitor, 100, 10);

      const next = dispatch(state, { type: 'APPROVE_VISITOR', visitorId: 'vis_1' });
      const approved = next.transientVisitors['vis_1']!;
      expect(approved.heldUntilTick).toBe(
        10 + PLACEHOLDER_VISITOR_SERVICE_DURATION_DAYS * TICKS_PER_DAY,
      );
    });

    it('visitor remains in transientVisitors after approval', () => {
      const visitor = makeVisitor({ id: 'vis_1' });
      const state = stateWithVisitorAndGold(visitor, 100, 10);

      const next = dispatch(state, { type: 'APPROVE_VISITOR', visitorId: 'vis_1' });
      expect(next.transientVisitors['vis_1']).toBeDefined();
    });

    it('emits a VISITOR_APPROVED event', () => {
      const visitor = makeVisitor({ id: 'vis_1', serviceFee: 50 });
      const state = stateWithVisitorAndGold(visitor, 100, 10);

      const next = dispatch(state, { type: 'APPROVE_VISITOR', visitorId: 'vis_1' });
      const approvedEvents = next.pendingEvents.filter((e) => e.type === 'VISITOR_APPROVED');
      expect(approvedEvents).toHaveLength(1);
    });

    it('returns state unchanged if visitor does not exist', () => {
      const state = createInitialGameState();
      const next = dispatch(state, { type: 'APPROVE_VISITOR', visitorId: 'vis_nonexistent' });
      expect(next).toEqual(state);
    });

    it('does not mutate input state', () => {
      const visitor = makeVisitor({ id: 'vis_1', serviceFee: 50 });
      const state = stateWithVisitorAndGold(visitor, 100, 10);
      const original = JSON.parse(JSON.stringify(state)) as GameState;

      dispatch(state, { type: 'APPROVE_VISITOR', visitorId: 'vis_1' });
      expect(state).toEqual(original);
    });
  });

  describe('DENY_VISITOR', () => {
    it('removes visitor from transientVisitors', () => {
      const visitor = makeVisitor({ id: 'vis_1' });
      const state = stateWithVisitorAndGold(visitor, 100, 10);

      const next = dispatch(state, { type: 'DENY_VISITOR', visitorId: 'vis_1' });
      expect(next.transientVisitors['vis_1']).toBeUndefined();
    });

    it('does not award any gold', () => {
      const visitor = makeVisitor({ id: 'vis_1', serviceFee: 50 });
      const state = stateWithVisitorAndGold(visitor, 100, 10);

      const next = dispatch(state, { type: 'DENY_VISITOR', visitorId: 'vis_1' });
      expect(next.guild.gold).toBe(100);
    });

    it('emits a VISITOR_DENIED event', () => {
      const visitor = makeVisitor({ id: 'vis_1' });
      const state = stateWithVisitorAndGold(visitor, 100, 10);

      const next = dispatch(state, { type: 'DENY_VISITOR', visitorId: 'vis_1' });
      const deniedEvents = next.pendingEvents.filter((e) => e.type === 'VISITOR_DENIED');
      expect(deniedEvents).toHaveLength(1);
    });

    it('returns state unchanged if visitor does not exist', () => {
      const state = createInitialGameState();
      const next = dispatch(state, { type: 'DENY_VISITOR', visitorId: 'vis_nonexistent' });
      expect(next).toEqual(state);
    });

    it('does not mutate input state', () => {
      const visitor = makeVisitor({ id: 'vis_1' });
      const state = stateWithVisitorAndGold(visitor, 100, 10);
      const original = JSON.parse(JSON.stringify(state)) as GameState;

      dispatch(state, { type: 'DENY_VISITOR', visitorId: 'vis_1' });
      expect(state).toEqual(original);
    });
  });
});
