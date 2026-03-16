/**
 * gameStore — Persisted game state store (Zustand + MMKV).
 *
 * This store holds the live GameState and exposes:
 * - The current state
 * - A tick function (called by the game loop)
 * - A dispatch function (called by UI for player actions)
 * - Save/load functions
 *
 * Persistence: MMKV via a custom Zustand storage adapter.
 * Three-layer loading:
 *   1. Active run — loads immediately on launch
 *   2. Dynasty layer — loads after first render (deferred)
 *   3. History layer — loads on demand only
 */

import { create } from 'zustand';
import type { GameState, GameAction } from '@idle-hero-rpg/shared';
import { tick } from '../engine/tick';
import { dispatch as engineDispatch } from '../engine/dispatch';
import { createInitialGameState } from './initialState';
import { saveActiveRun, loadActiveRun, clearActiveRun } from './storage';
import type { KVStorage } from './storage';
import { migrateState } from './migrations';

interface GameStore {
  state: GameState;
  tick: () => void;
  dispatch: (action: GameAction) => void;
  initFromStorage: (storage: KVStorage) => void;
  saveToStorage: (storage: KVStorage) => void;
  resetGame: (storage: KVStorage) => void;
  loadDynastyLayer: () => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: createInitialGameState(),

  tick: () => {
    set((store) => ({ state: tick(store.state) }));
  },

  dispatch: (action: GameAction) => {
    set((store) => ({ state: engineDispatch(store.state, action) }));
  },

  initFromStorage: (storage: KVStorage) => {
    const raw = loadActiveRun(storage);
    if (raw === undefined) return; // No save — keep initial state

    const migrated = migrateState(raw);
    if (migrated === null) return; // Migration failed — keep initial state

    set({ state: migrated });
  },

  saveToStorage: (storage: KVStorage) => {
    saveActiveRun(storage, get().state);
  },

  resetGame: (storage: KVStorage) => {
    clearActiveRun(storage);
    set({ state: createInitialGameState() });
  },

  loadDynastyLayer: async () => {
    // TODO: Deferred load of dynasty meta-progression from MMKV
  },
}));
