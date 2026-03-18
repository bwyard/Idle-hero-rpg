import { describe, it, expect } from 'vitest';
import { processAdventurers } from '../processAdventurers';
import { createInitialGameState } from '../../stores/initialState';
import {
  PLACEHOLDER_AMBIENT_XP_PER_TICK,
  PLACEHOLDER_TIER_XP_THRESHOLDS,
} from '../../data/balance';
import type { GameState, Adventurer } from '@idle-hero-rpg/shared';

/** Helper to create an adventurer with sensible defaults. */
function makeAdventurer(overrides: Partial<Adventurer> = {}): Adventurer {
  return {
    id: 'adv_test1',
    name: 'TestAdv',
    tier: 'F',
    archetype: 'Fighter',
    xp: 0,
    milestones: [],
    skillBorrowUsed: false,
    recruitedYear: 0,
    retiredYear: null,
    ...overrides,
  };
}

describe('processAdventurers', () => {
  describe('activity-based XP', () => {
    it('idle adventurer gains ambient XP based on tier', () => {
      const state: GameState = {
        ...createInitialGameState(),
        adventurers: {
          adv_1: makeAdventurer({ id: 'adv_1', tier: 'F', xp: 0 }),
        },
      };
      const next = processAdventurers(state);
      const expectedXp = PLACEHOLDER_AMBIENT_XP_PER_TICK['F'] ?? 0;
      expect(next.adventurers['adv_1']?.xp).toBe(expectedXp);
    });

    it('adventurer on an active quest gains 0 passive XP', () => {
      const state: GameState = {
        ...createInitialGameState(),
        adventurers: {
          adv_1: makeAdventurer({ id: 'adv_1', tier: 'F', xp: 0 }),
        },
        quests: {
          qst_1: {
            id: 'qst_1',
            templateId: 'quest-tpl-heartlands-patrol',
            assignedAdventurerId: 'adv_1',
            ticksRemaining: 20,
            isComplete: false,
            completedAtTick: null,
          },
        },
      };
      const next = processAdventurers(state);
      expect(next.adventurers['adv_1']?.xp).toBe(0);
    });

    it('adventurer with completed quest gains ambient XP (no longer busy)', () => {
      const state: GameState = {
        ...createInitialGameState(),
        adventurers: {
          adv_1: makeAdventurer({ id: 'adv_1', tier: 'F', xp: 0 }),
        },
        quests: {
          qst_1: {
            id: 'qst_1',
            templateId: 'quest-tpl-heartlands-patrol',
            assignedAdventurerId: null,
            ticksRemaining: 0,
            isComplete: true,
            completedAtTick: null,
          },
        },
      };
      const next = processAdventurers(state);
      const expectedXp = PLACEHOLDER_AMBIENT_XP_PER_TICK['F'] ?? 0;
      expect(next.adventurers['adv_1']?.xp).toBe(expectedXp);
    });

    it('lower tiers gain more ambient XP than higher tiers', () => {
      const state: GameState = {
        ...createInitialGameState(),
        adventurers: {
          adv_f: makeAdventurer({ id: 'adv_f', tier: 'F', xp: 0 }),
          adv_a: makeAdventurer({ id: 'adv_a', tier: 'A', xp: 0 }),
        },
      };
      const next = processAdventurers(state);
      const fXp = next.adventurers['adv_f']?.xp ?? 0;
      const aXp = next.adventurers['adv_a']?.xp ?? 0;
      expect(fXp).toBeGreaterThan(aXp);
    });

    it('Legendary adventurers gain 0 ambient XP', () => {
      const state: GameState = {
        ...createInitialGameState(),
        adventurers: {
          adv_1: makeAdventurer({ id: 'adv_1', tier: 'Legendary', xp: 0 }),
        },
      };
      const next = processAdventurers(state);
      expect(next.adventurers['adv_1']?.xp).toBe(0);
    });
  });

  describe('tier advancement', () => {
    it('promotes adventurer when XP reaches threshold', () => {
      const threshold = PLACEHOLDER_TIER_XP_THRESHOLDS['F'] ?? 10;
      const state: GameState = {
        ...createInitialGameState(),
        adventurers: {
          adv_1: makeAdventurer({ id: 'adv_1', tier: 'F', xp: threshold }),
        },
      };
      const next = processAdventurers(state);
      expect(next.adventurers['adv_1']?.tier).toBe('E');
      expect(next.adventurers['adv_1']?.xp).toBe(0); // XP resets on tier-up
    });

    it('emits TIER_UP event on promotion', () => {
      const threshold = PLACEHOLDER_TIER_XP_THRESHOLDS['F'] ?? 10;
      const state: GameState = {
        ...createInitialGameState(),
        adventurers: {
          adv_1: makeAdventurer({ id: 'adv_1', tier: 'F', xp: threshold }),
        },
      };
      const next = processAdventurers(state);
      const tierEvents = next.pendingEvents.filter((e) => e.type === 'TIER_UP');
      expect(tierEvents).toHaveLength(1);
    });
  });

  it('does not mutate the input state', () => {
    const state: GameState = {
      ...createInitialGameState(),
      adventurers: {
        adv_1: makeAdventurer({ id: 'adv_1', tier: 'F', xp: 5 }),
      },
    };
    const originalXp = state.adventurers['adv_1']?.xp;
    processAdventurers(state);
    expect(state.adventurers['adv_1']?.xp).toBe(originalXp);
  });
});
