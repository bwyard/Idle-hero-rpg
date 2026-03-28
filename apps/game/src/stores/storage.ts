/**
 * storage.ts — MMKV persistence adapter for GameState.
 *
 * Provides save/load/clear for the active run state.
 * Uses react-native-mmkv for fast synchronous storage.
 *
 * The storage interface is injectable for testing.
 */

import type { GameState } from '@idle-hero-rpg/shared';

/** Storage key for the active run save file. */
const ACTIVE_RUN_KEY = 'idle-hero:active-run';

/** Minimal key-value storage interface (matches MMKV's API subset). */
export interface KVStorage {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
}

/** Save active run state to storage. */
export function saveActiveRun(storage: KVStorage, state: GameState): void {
  try {
    const json = JSON.stringify(state);
    storage.set(ACTIVE_RUN_KEY, json);
  } catch (error: unknown) {
    console.error('[storage] Failed to save active run:', error);
  }
}

/** Load active run state from storage. Returns undefined if no save exists. */
export function loadActiveRun(storage: KVStorage): GameState | undefined {
  const raw = storage.getString(ACTIVE_RUN_KEY);
  if (raw === undefined) return undefined;

  try {
    return JSON.parse(raw) as GameState;
  } catch (error: unknown) {
    console.error('[storage] Corrupted save data, discarding:', error);
    return undefined;
  }
}

/** Clear the active run save from storage. */
export function clearActiveRun(storage: KVStorage): void {
  storage.delete(ACTIVE_RUN_KEY);
}
