import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../gameStore';
import { createInitialGameState } from '../initialState';
import type { KVStorage } from '../storage';

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

describe('gameStore', () => {
  beforeEach(() => {
    // Reset store to initial state between tests
    useGameStore.setState({ state: createInitialGameState() });
  });

  it('starts with initial game state', () => {
    const { state } = useGameStore.getState();
    expect(state.version).toBe(2);
    expect(state.time.ticksElapsed).toBe(0);
  });

  it('tick advances the game state', () => {
    useGameStore.getState().tick();
    const { state } = useGameStore.getState();
    expect(state.time.ticksElapsed).toBe(1);
  });

  it('dispatch processes a game action', () => {
    useGameStore.getState().dispatch({ type: 'HOLD_FEAST' });
    const { state } = useGameStore.getState();
    // Feast costs gold, so gold should be less than starting
    expect(state.guild.gold).toBeLessThan(createInitialGameState().guild.gold);
  });

  describe('persistence', () => {
    it('saveToStorage + initFromStorage round-trips state', () => {
      const storage = createMockStorage();

      // Advance state
      useGameStore.getState().tick();
      useGameStore.getState().tick();
      useGameStore.getState().saveToStorage(storage);

      // Reset store
      useGameStore.setState({ state: createInitialGameState() });
      expect(useGameStore.getState().state.time.ticksElapsed).toBe(0);

      // Load from storage
      useGameStore.getState().initFromStorage(storage);
      expect(useGameStore.getState().state.time.ticksElapsed).toBe(2);
    });

    it('initFromStorage keeps initial state when no save exists', () => {
      const storage = createMockStorage();
      const before = useGameStore.getState().state;
      useGameStore.getState().initFromStorage(storage);
      // No save → state reference unchanged (not replaced)
      expect(useGameStore.getState().state).toBe(before);
    });

    it('initFromStorage keeps initial state for corrupted save', () => {
      const storage = createMockStorage();
      storage.set('idle-hero:active-run', '{corrupted!!!');
      const before = useGameStore.getState().state;
      useGameStore.getState().initFromStorage(storage);
      // Corrupted → migration returns null → state reference unchanged
      expect(useGameStore.getState().state).toBe(before);
    });

    it('resetGame clears storage and resets to initial state', () => {
      const storage = createMockStorage();

      // Advance and save
      useGameStore.getState().tick();
      useGameStore.getState().saveToStorage(storage);

      // Reset
      useGameStore.getState().resetGame(storage);
      expect(useGameStore.getState().state.time.ticksElapsed).toBe(0);

      // Storage should be empty
      expect(storage.getString('idle-hero:active-run')).toBeUndefined();
    });
  });
});
