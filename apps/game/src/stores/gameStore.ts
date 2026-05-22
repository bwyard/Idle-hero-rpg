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
 *
 * Toast integration:
 * The dispatch wrapper compares state before and after engineDispatch.
 * When an action is a no-op (failed due to e.g. insufficient gold),
 * it fires a toast via useUIStore so the player gets feedback.
 */

import { create } from 'zustand';
import type { GameState, GameAction } from '@idle-hero-rpg/shared';
import { offlineTicks } from '@stage/stage-loop';
import { tick } from '../engine/tick';
import { dispatch as engineDispatch } from '../engine/dispatch';
import { createInitialGameState } from './initialState';
import { saveActiveRun, loadActiveRun, clearActiveRun } from './storage';
import type { KVStorage } from './storage';
import { migrateState } from './migrations';
import { useUIStore } from './uiStore';
import { TICK_INTERVAL_MS } from '../data/balance';

interface GameStore {
  state: GameState;
  /** Wall-clock timestamp of the last save — used for offline progress. */
  lastSavedAt: number;
  tick: () => void;
  dispatch: (action: GameAction) => void;
  initFromStorage: (storage: KVStorage) => void;
  saveToStorage: (storage: KVStorage) => void;
  resetGame: (storage: KVStorage) => void;
  /**
   * Process offline ticks accumulated while the app was closed.
   * Uses stage-loop's offlineTicks to derive exact tick count from wall-clock delta.
   * Each tick is a deterministic pure function — offline progress is exact, not estimated.
   */
  processOfflineProgress: (nowMs: number) => number;
  loadDynastyLayer: () => Promise<void>;
  /**
   * Dev-only: directly replace state. Used by the Dev tab for fast-forwarding,
   * gold injection, and tier overrides. Never call in production logic.
   */
  _devSetState: (next: GameState) => void;
}

/**
 * Detects whether a dispatched action was silently ignored (returned same state)
 * and returns a toast message if so. Returns null for actions that have no
 * meaningful failure message.
 */
const getFailureToast = (action: GameAction, prev: GameState, next: GameState): string | null => {
  if (next === prev) {
    // Same reference — dispatch returned state unchanged
    switch (action.type) {
      case 'RECRUIT_ADVENTURER':
        return 'Not enough gold to recruit';
      case 'BUILD_BUILDING':
        return 'Not enough gold to build';
      default:
        return null;
    }
  }

  // For START_QUEST, check if the quest's assignedAdventurerId didn't change.
  // The same-ref case (next === prev) is already handled above.
  if (action.type === 'START_QUEST') {
    const prevAssigned = prev.quests[action.questId]?.assignedAdventurerId ?? null;
    const nextAssigned = next.quests[action.questId]?.assignedAdventurerId ?? null;
    if (prevAssigned === nextAssigned) {
      return 'Quest could not be started';
    }
  }

  return null;
};

export const useGameStore = create<GameStore>((set, get) => ({
  state: createInitialGameState(),
  lastSavedAt: Date.now(),

  tick: () => {
    set((store) => ({ state: tick(store.state) }));
  },

  dispatch: (action: GameAction) => {
    set((store) => {
      const prev = store.state;
      const next = engineDispatch(prev, action);

      const toastMessage = getFailureToast(action, prev, next);
      if (toastMessage !== null) {
        // Fire toast outside the set callback to avoid Zustand re-entrancy
        // (setTimeout 0 defers until after the current state update settles)
        setTimeout(() => {
          useUIStore.getState().addToast(toastMessage, 'warning');
        }, 0);
      }

      return { state: next };
    });
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
    set({ lastSavedAt: Date.now() });
  },

  processOfflineProgress: (nowMs: number) => {
    const elapsed = offlineTicks(get().lastSavedAt, nowMs, TICK_INTERVAL_MS);
    if (elapsed <= 0) return 0;

    // Fold ticks deterministically — same state + same count = same result
    set((store) => {
      const finalState = Array.from({ length: elapsed }).reduce<GameState>(
        (s) => tick(s),
        store.state,
      );
      return { state: finalState, lastSavedAt: nowMs };
    });
    return elapsed;
  },

  resetGame: (storage: KVStorage) => {
    clearActiveRun(storage);
    set({ state: createInitialGameState() });
  },

  loadDynastyLayer: async () => {
    // TODO: Deferred load of dynasty meta-progression from MMKV
  },

  _devSetState: (next: GameState) => {
    set({ state: next });
  },
}));
