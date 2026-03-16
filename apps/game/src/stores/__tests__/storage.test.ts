import { describe, it, expect } from 'vitest';
import { saveActiveRun, loadActiveRun, clearActiveRun } from '../storage';
import type { KVStorage } from '../storage';
import { createInitialGameState } from '../initialState';

/** In-memory mock of KVStorage for testing. */
function createMockStorage(): KVStorage {
  const store = new Map<string, string>();
  return {
    getString: (key) => store.get(key),
    set: (key, value) => {
      store.set(key, value);
    },
    delete: (key) => {
      store.delete(key);
    },
  };
}

describe('storage', () => {
  describe('saveActiveRun', () => {
    it('saves state as JSON string', () => {
      const storage = createMockStorage();
      const state = createInitialGameState();
      saveActiveRun(storage, state);

      const raw = storage.getString('idle-hero:active-run');
      expect(raw).toBeDefined();
      expect(JSON.parse(raw!)).toEqual(state);
    });
  });

  describe('loadActiveRun', () => {
    it('returns undefined when no save exists', () => {
      const storage = createMockStorage();
      expect(loadActiveRun(storage)).toBeUndefined();
    });

    it('returns parsed state when save exists', () => {
      const storage = createMockStorage();
      const state = createInitialGameState();
      saveActiveRun(storage, state);

      const loaded = loadActiveRun(storage);
      expect(loaded).toEqual(state);
    });

    it('returns undefined for corrupted JSON', () => {
      const storage = createMockStorage();
      storage.set('idle-hero:active-run', '{not valid json!!!');

      const loaded = loadActiveRun(storage);
      expect(loaded).toBeUndefined();
    });
  });

  describe('clearActiveRun', () => {
    it('removes the save from storage', () => {
      const storage = createMockStorage();
      const state = createInitialGameState();
      saveActiveRun(storage, state);
      clearActiveRun(storage);

      expect(loadActiveRun(storage)).toBeUndefined();
    });
  });

  describe('round-trip', () => {
    it('preserves all GameState fields through save/load cycle', () => {
      const storage = createMockStorage();
      const state = createInitialGameState();

      // Modify state to have non-default values
      const modified = {
        ...state,
        time: {
          ...state.time,
          ticksElapsed: 42,
          currentDay: 10,
          currentSeason: 'Summer' as const,
          currentYear: 0,
        },
        guild: { ...state.guild, gold: 999, reputation: 50 },
      };

      saveActiveRun(storage, modified);
      const loaded = loadActiveRun(storage);

      expect(loaded).toEqual(modified);
      expect(loaded?.time.ticksElapsed).toBe(42);
      expect(loaded?.guild.gold).toBe(999);
    });
  });
});
