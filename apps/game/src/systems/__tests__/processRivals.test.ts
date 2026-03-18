import { describe, it, expect } from 'vitest';
import { processRivals, placeholderRivalImpl } from '../processRivals';
import { createInitialGameState } from '../../stores/initialState';
import { MAX_RIVALS, NPC_GUILD_MIN_TENURE_YEARS } from '../../data/balance';
import type { GameState, Rival, RivalProgressionImpl } from '@idle-hero-rpg/shared';

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

  describe('rival cap', () => {
    it('does not spawn a new rival when rivals are at MAX_RIVALS', () => {
      const rivals: Record<string, Rival> = {};
      for (let i = 0; i < MAX_RIVALS; i++) {
        const id = `rvl_cap_${i}`;
        // foundedYear = currentYear so tenure = 0 — below NPC_GUILD_MIN_TENURE_YEARS, no dissolution
        rivals[id] = {
          id,
          name: `Guild ${i}`,
          foundedYear: 10,
          tier: 'Minor',
          sourceAdventurerId: null,
        };
      }
      const state = makeState({ rivals, currentYear: 10 });
      // random=0 is below spawn chance but cap should block it
      const next = processRivals(state, placeholderRivalImpl, () => 0);
      expect(Object.keys(next.rivals).length).toBe(MAX_RIVALS);
    });

    it('MAX_RIVALS constant is defined', () => {
      expect(MAX_RIVALS).toBeDefined();
      expect(typeof MAX_RIVALS).toBe('number');
    });
  });

  describe('rival dissolution', () => {
    it('dissolves a tenured rival when dissolution roll triggers', () => {
      const rival: Rival = {
        id: 'rvl_old',
        name: 'Old Guild',
        foundedYear: 1,
        tier: 'Minor',
        sourceAdventurerId: null,
      };
      const state = makeState({ rivals: { [rival.id]: rival }, currentYear: 20 });

      // impl that always meets tenure; random always below dissolve chance
      const alwaysDissolveImpl: RivalProgressionImpl = {
        shouldPopulateRival: () => false,
        hasMetMinimumTenure: () => true,
      };
      const next = processRivals(state, alwaysDissolveImpl, () => 0);
      expect(next.rivals['rvl_old']).toBeUndefined();
    });

    it('emits RIVAL_DISSOLVED event on dissolution', () => {
      const rival: Rival = {
        id: 'rvl_old',
        name: 'Old Guild',
        foundedYear: 1,
        tier: 'Minor',
        sourceAdventurerId: null,
      };
      const state = makeState({ rivals: { [rival.id]: rival }, currentYear: 20 });

      const alwaysDissolveImpl: RivalProgressionImpl = {
        shouldPopulateRival: () => false,
        hasMetMinimumTenure: () => true,
      };
      const next = processRivals(state, alwaysDissolveImpl, () => 0);
      expect(next.pendingEvents.some((e) => e.type === 'RIVAL_DISSOLVED')).toBe(true);
    });

    it('does not dissolve a rival that has not met minimum tenure', () => {
      const rival: Rival = {
        id: 'rvl_young',
        name: 'Young Guild',
        foundedYear: 9,
        tier: 'Minor',
        sourceAdventurerId: null,
      };
      const state = makeState({ rivals: { [rival.id]: rival }, currentYear: 10 });
      // placeholderRivalImpl: tenure requires >= NPC_GUILD_MIN_TENURE_YEARS (5), year 10-9=1 < 5
      const next = processRivals(state, placeholderRivalImpl, () => 0);
      expect(next.rivals['rvl_young']).toBeDefined();
    });
  });

  describe('minimum tenure check', () => {
    it('NPC_GUILD_MIN_TENURE_YEARS constant is defined and is 5', () => {
      expect(NPC_GUILD_MIN_TENURE_YEARS).toBe(5);
    });
  });
});
