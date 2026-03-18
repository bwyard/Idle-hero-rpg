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
import { HERO_ACTION_POINT_MAX } from '../data/balance';

/** The current schema version. Increment when adding a new migration. */
export const CURRENT_VERSION = 2;

/** A migration function transforms state from version N to N+1. */
export type Migration = (state: unknown) => unknown;

/**
 * v1 → v2: Add new Hero fields (maxActionPoints, passiveAbilityId,
 * milestoneAbilityId, milestoneUnlocked) and new Dynasty fields
 * (legacySkills, unlockedHeroClasses).
 */
function migrateV1ToV2(state: unknown): unknown {
  const s = state as Record<string, unknown>;
  const hero = (s['hero'] ?? {}) as Record<string, unknown>;
  const dynasty = (s['dynasty'] ?? {}) as Record<string, unknown>;

  const heroClass = typeof hero['heroClass'] === 'string' ? hero['heroClass'] : 'Warblade';
  const heroClassLower = heroClass.toLowerCase();

  return {
    ...s,
    hero: {
      ...hero,
      maxActionPoints: HERO_ACTION_POINT_MAX,
      passiveAbilityId: `${heroClassLower}-passive`,
      milestoneAbilityId: `${heroClassLower}-milestone`,
      milestoneUnlocked: false,
    },
    dynasty: {
      ...dynasty,
      legacySkills: [],
      unlockedHeroClasses: ['Warblade'],
    },
  };
}

/**
 * Registry of migrations, keyed by the version they migrate FROM.
 * Migration at key N transforms state from version N to version N+1.
 *
 * Example: migrations[1] upgrades v1 → v2.
 */
const migrations: Record<number, Migration> = {
  1: migrateV1ToV2,
};

/**
 * Run all necessary migrations on loaded state.
 *
 * @param state - The raw state loaded from storage (may be outdated)
 * @returns The migrated state at CURRENT_VERSION, or null if migration failed
 */
export function migrateState(state: unknown): GameState | null {
  if (typeof state !== 'object' || state === null) return null;

  const record = state as Record<string, unknown>;
  let version = typeof record['version'] === 'number' ? record['version'] : 0;
  let current: unknown = state;

  // Already at current version
  if (version === CURRENT_VERSION) return current as GameState;

  // Version is newer than what we know — cannot downgrade
  if (version > CURRENT_VERSION) return null;

  // Run migrations sequentially
  while (version < CURRENT_VERSION) {
    const migrate = migrations[version];
    if (migrate === undefined) return null; // Missing migration — cannot proceed
    current = migrate(current);
    version++;
  }

  // Stamp the final version
  if (typeof current === 'object' && current !== null) {
    (current as Record<string, unknown>)['version'] = CURRENT_VERSION;
  }

  return current as GameState;
}
