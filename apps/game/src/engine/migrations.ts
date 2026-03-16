/**
 * migrations — State migration runner for save file upgrades.
 *
 * When the GameState schema changes, a new Migration is added to the
 * `migrations` array. On load, `runMigrations` applies any migrations
 * newer than the saved state's version, in order, producing a
 * current-version GameState.
 *
 * Architecture rules:
 * - Each migration is a pure function — no mutations, no side effects
 * - Migrations are applied in ascending version order
 * - The runner is the only place where state.version is updated
 */

import type { GameState } from '@idle-hero-rpg/shared';

/** The current schema version. Bump this when adding a new migration. */
export const CURRENT_STATE_VERSION = 1;

/** A single state migration step. */
export interface Migration {
  /** The version this migration upgrades TO. */
  readonly version: number;
  /** Pure function that transforms the old state shape into the new one. */
  readonly migrate: (state: Record<string, unknown>) => Record<string, unknown>;
}

/**
 * Registry of all migrations, in any order.
 * The runner sorts by version before applying.
 */
export const migrations: readonly Migration[] = [];

/**
 * Apply pending migrations to a saved state.
 *
 * Pure function: takes a saved state and a migrations list, returns a new
 * GameState at the target version. Does not mutate the input.
 *
 * @param savedState      - The raw state object loaded from storage
 * @param currentVersion  - The target version (normally CURRENT_STATE_VERSION)
 * @param migrationsList  - The migrations to consider (defaults to the module registry)
 * @returns A fully-migrated GameState at `currentVersion`
 */
export function runMigrations(
  savedState: Record<string, unknown>,
  currentVersion: number = CURRENT_STATE_VERSION,
  migrationsList: readonly Migration[] = migrations,
): GameState {
  const stateVersion =
    typeof savedState.version === 'number' ? savedState.version : 0;

  const pendingMigrations = migrationsList
    .filter((m) => m.version > stateVersion)
    .slice()
    .sort((a, b) => a.version - b.version);

  const migratedState = pendingMigrations.reduce<Record<string, unknown>>(
    (state, migration) => migration.migrate(state),
    savedState,
  );

  return { ...migratedState, version: currentVersion } as GameState;
}
