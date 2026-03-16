import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { dispatch } from '../dispatch';
import { createInitialGameState } from '../../stores/initialState';
import { PLACEHOLDER_MAX_QUEST_BOARD_SIZE } from '../../data/balance';
import type { GameState } from '@idle-hero-rpg/shared';

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
});
