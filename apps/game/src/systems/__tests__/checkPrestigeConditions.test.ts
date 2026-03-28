import { describe, it, expect } from 'vitest';
import { checkPrestigeConditions } from '../checkPrestigeConditions';
import { createInitialGameState } from '../../stores/initialState';
import { PRESTIGE_ESCALATION_THRESHOLD } from '../../data/balance';
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
    housingType: 'dorm',
    ...overrides,
  };
}

/** Helper to create state with specific adventurers and prestige count. */
function stateWithAdventurers(
  adventurers: Record<string, Adventurer>,
  prestigeCount = 0,
): GameState {
  return {
    ...createInitialGameState(),
    adventurers,
    dynasty: {
      ...createInitialGameState().dynasty,
      prestigeCount,
    },
  };
}

describe('checkPrestigeConditions', () => {
  it('does not set prestigeAvailable when no Legendary adventurer exists', () => {
    const state = stateWithAdventurers({
      adv_1: makeAdventurer({ id: 'adv_1', tier: 'S' }),
      adv_2: makeAdventurer({ id: 'adv_2', tier: 'A' }),
    });
    const next = checkPrestigeConditions(state);
    expect(next.flags.prestigeAvailable).toBe(false);
  });

  it('does not set prestigeAvailable when Legendary adventurer has not retired', () => {
    const state = stateWithAdventurers({
      adv_1: makeAdventurer({ id: 'adv_1', tier: 'Legendary', retiredYear: null }),
    });
    const next = checkPrestigeConditions(state);
    expect(next.flags.prestigeAvailable).toBe(false);
  });

  it('sets prestigeAvailable when a Legendary adventurer has retired (pre-escalation)', () => {
    const state = stateWithAdventurers(
      {
        adv_1: makeAdventurer({ id: 'adv_1', tier: 'Legendary', retiredYear: 5 }),
      },
      3,
    );
    const next = checkPrestigeConditions(state);
    expect(next.flags.prestigeAvailable).toBe(true);
  });

  it('emits a PRESTIGE_AVAILABLE event when condition newly met', () => {
    const state = stateWithAdventurers(
      {
        adv_1: makeAdventurer({ id: 'adv_1', tier: 'Legendary', retiredYear: 5 }),
      },
      3,
    );
    const next = checkPrestigeConditions(state);
    const prestigeEvents = next.pendingEvents.filter((e) => e.type === 'PRESTIGE_AVAILABLE');
    expect(prestigeEvents).toHaveLength(1);
  });

  it('does not emit event if prestigeAvailable was already true', () => {
    const state: GameState = {
      ...stateWithAdventurers(
        {
          adv_1: makeAdventurer({ id: 'adv_1', tier: 'Legendary', retiredYear: 5 }),
        },
        3,
      ),
      flags: { prestigeAvailable: true },
    };
    const next = checkPrestigeConditions(state);
    const prestigeEvents = next.pendingEvents.filter((e) => e.type === 'PRESTIGE_AVAILABLE');
    expect(prestigeEvents).toHaveLength(0);
  });

  it('clears prestigeAvailable when condition is no longer met', () => {
    const state: GameState = {
      ...stateWithAdventurers({
        adv_1: makeAdventurer({ id: 'adv_1', tier: 'S', retiredYear: null }),
      }),
      flags: { prestigeAvailable: true },
    };
    const next = checkPrestigeConditions(state);
    expect(next.flags.prestigeAvailable).toBe(false);
  });

  describe('escalated conditions (prestige >= 10)', () => {
    it('requires multiple high-tier (S+) adventurers to be retired simultaneously', () => {
      // Only 1 Legendary retired — not enough at prestige 10+
      const state = stateWithAdventurers(
        {
          adv_1: makeAdventurer({ id: 'adv_1', tier: 'Legendary', retiredYear: 5 }),
        },
        PRESTIGE_ESCALATION_THRESHOLD,
      );
      const next = checkPrestigeConditions(state);
      expect(next.flags.prestigeAvailable).toBe(false);
    });

    it('sets prestigeAvailable when 2+ high-tier adventurers are retired at prestige 10+', () => {
      const state = stateWithAdventurers(
        {
          adv_1: makeAdventurer({ id: 'adv_1', tier: 'Legendary', retiredYear: 5 }),
          adv_2: makeAdventurer({ id: 'adv_2', tier: 'SS', retiredYear: 6 }),
        },
        PRESTIGE_ESCALATION_THRESHOLD,
      );
      const next = checkPrestigeConditions(state);
      expect(next.flags.prestigeAvailable).toBe(true);
    });

    it('does not count active (non-retired) high-tier adventurers', () => {
      const state = stateWithAdventurers(
        {
          adv_1: makeAdventurer({ id: 'adv_1', tier: 'Legendary', retiredYear: 5 }),
          adv_2: makeAdventurer({ id: 'adv_2', tier: 'SS', retiredYear: null }),
        },
        PRESTIGE_ESCALATION_THRESHOLD,
      );
      const next = checkPrestigeConditions(state);
      expect(next.flags.prestigeAvailable).toBe(false);
    });
  });

  it('does not mutate the input state', () => {
    const state = stateWithAdventurers({
      adv_1: makeAdventurer({ id: 'adv_1', tier: 'Legendary', retiredYear: 5 }),
    });
    const originalFlag = state.flags.prestigeAvailable;
    checkPrestigeConditions(state);
    expect(state.flags.prestigeAvailable).toBe(originalFlag);
  });

  it('does not modify unrelated fields', () => {
    const state = stateWithAdventurers({
      adv_1: makeAdventurer({ id: 'adv_1', tier: 'Legendary', retiredYear: 5 }),
    });
    const next = checkPrestigeConditions(state);
    expect(next.hero).toEqual(state.hero);
    expect(next.guild).toEqual(state.guild);
    expect(next.time).toEqual(state.time);
  });
});
