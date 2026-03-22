/**
 * migrations.ts — State version migration runner.
 *
 * Runs sequential migrations on a loaded GameState to bring it
 * up to the current schema version. Each migration transforms
 * state from version N to version N+1.
 *
 * Pure function — no side effects.
 */

import type { GameState } from '@idle-hero-rpg/shared';

/** The current schema version. Increment when adding a new migration. */
export const CURRENT_VERSION = 2;

/** A migration function transforms state from version N to N+1. */
export type Migration = (state: unknown) => unknown;

/**
 * Registry of migrations, keyed by the version they migrate FROM.
 * Migration at key N transforms state from version N to version N+1.
 *
 * Example: migrations[1] upgrades v1 → v2.
 */
const migrations: Record<number, Migration> = {
  /**
   * v1 → v2: Add rngSeed field.
   * Old saves have no rngSeed — seed 0 starts them at a deterministic position.
   */
  1: (state: unknown) => {
    const s = state as Record<string, unknown>;
    return { ...s, rngSeed: 0 };
  },
};

/**
 * Run all necessary migrations on loaded state.
 *
 * @param state - The raw state loaded from storage (may be outdated)
 * @returns The migrated state at CURRENT_VERSION, or null if migration failed
 */
export const migrateState = (state: unknown): GameState | null => {
  if (typeof state !== 'object' || state === null) return null;

  const record = state as Record<string, unknown>;
  const version = typeof record['version'] === 'number' ? record['version'] : 0;

  if (version === CURRENT_VERSION) return state as GameState;
  if (version > CURRENT_VERSION) return null;

  // Build the list of version numbers to migrate through: [version, version+1, ..., CURRENT_VERSION-1]
  const versionRange = Array.from({ length: CURRENT_VERSION - version }, (_, i) => version + i);

  // Verify all migrations exist before running any
  if (!versionRange.every((v) => migrations[v] !== undefined)) return null;

  // Apply each migration in sequence, then stamp the final version
  const migrated = versionRange.reduce<unknown>(
    (acc, v) => (migrations[v] as Migration)(acc),
    state,
  );

  return {
    ...(migrated as Record<string, unknown>),
    version: CURRENT_VERSION,
  } as GameState;
};
