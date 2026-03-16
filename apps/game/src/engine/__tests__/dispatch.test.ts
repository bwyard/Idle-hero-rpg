import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { dispatch } from '../dispatch';
import { createInitialGameState } from '../../stores/initialState';
import {
  PLACEHOLDER_HOLD_DURATION_DAYS,
  PLACEHOLDER_ENGAGE_COST,
  PLACEHOLDER_MAX_QUEST_BOARD_SIZE,
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
});
