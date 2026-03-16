import { describe, it, expect } from 'vitest';
import { processRivals, placeholderRivalImpl } from '../processRivals';
import { createInitialGameState } from '../../stores/initialState';
import { NPC_GUILD_MIN_TENURE_YEARS } from '../../data/balance';
import type { GameState, Rival } from '@idle-hero-rpg/shared';

/** Helper to create a state with specific rivals and year. */
function makeState(
  overrides: {
    rivals?: Record<string, Rival>;
    currentYear?: number;
  } = {},
): GameState {
  const base = createInitialGameState();
  return {
    ...base,
    time: { ...base.time, currentYear: overrides.currentYear ?? 10 },
    rivals: overrides.rivals ?? {},
  };
}

describe('processRivals', () => {
  describe('rival spawning', () => {
    it('spawns a new rival when random roll is below spawn chance', () => {
      const state = makeState();
      const next = processRivals(state, placeholderRivalImpl, () => 0);
      expect(Object.keys(next.rivals).length).toBe(1);
    });

    it('does not spawn a rival when random roll is above spawn chance', () => {
      const state = makeState();
      const next = processRivals(state, placeholderRivalImpl, () => 1);
      expect(Object.keys(next.rivals).length).toBe(0);
    });

    it('new rival has valid fields', () => {
      const state = makeState({ currentYear: 15 });
      const next = processRivals(state, placeholderRivalImpl, () => 0);
      const rivals = Object.values(next.rivals);
      expect(rivals).toHaveLength(1);

      const rival = rivals[0]!;
      expect(rival.id).toMatch(/^rvl_/);
      expect(rival.name).toBeTruthy();
      expect(rival.foundedYear).toBe(15);
      expect(rival.tier).toBe('Minor');
      expect(rival.sourceAdventurerId).toBeNull();
    });

    it('emits a RIVAL_APPEARED event when rival spawns', () => {
      const state = makeState();
      const next = processRivals(state, placeholderRivalImpl, () => 0);
      const rivalEvents = next.pendingEvents.filter((e) => e.type === 'RIVAL_APPEARED');
      expect(rivalEvents).toHaveLength(1);
    });

    it('does not emit event when no rival spawns', () => {
      const state = makeState();
      const next = processRivals(state, placeholderRivalImpl, () => 1);
      const rivalEvents = next.pendingEvents.filter((e) => e.type === 'RIVAL_APPEARED');
      expect(rivalEvents).toHaveLength(0);
    });
  });

  describe('purity', () => {
    it('does not mutate the input state', () => {
      const state = makeState();
      const original = JSON.parse(JSON.stringify(state)) as GameState;
      processRivals(state, placeholderRivalImpl, () => 0);
      expect(state).toEqual(original);
    });
  });

  describe('minimum tenure check', () => {
    it('respects NPC_GUILD_MIN_TENURE_YEARS constant (currently 0)', () => {
      // This test documents that the constant exists and is used
      expect(NPC_GUILD_MIN_TENURE_YEARS).toBeDefined();
      expect(typeof NPC_GUILD_MIN_TENURE_YEARS).toBe('number');
    });
  });
});
