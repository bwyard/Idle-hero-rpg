import { describe, it, expect } from 'vitest';
import { migrateState, CURRENT_VERSION } from '../migrations';
import { createInitialGameState } from '../initialState';
import { HERO_ACTION_POINT_MAX } from '../../data/balance';

describe('migrateState', () => {
  it('returns state unchanged when already at CURRENT_VERSION', () => {
    const state = createInitialGameState();
    const result = migrateState(state);
    expect(result).toEqual(state);
  });

  it('returns null for null input', () => {
    expect(migrateState(null)).toBeNull();
  });

  it('returns null for non-object input', () => {
    expect(migrateState('not an object')).toBeNull();
    expect(migrateState(42)).toBeNull();
  });

  it('returns null for state with version higher than CURRENT_VERSION', () => {
    const futureState = { ...createInitialGameState(), version: CURRENT_VERSION + 1 };
    expect(migrateState(futureState)).toBeNull();
  });

  it('returns null for state with missing version field', () => {
    const noVersion = { ...createInitialGameState() } as Record<string, unknown>;
    delete noVersion['version'];
    // version defaults to 0, and there's no migration from 0 → 1 in the registry
    // so it should return null (missing migration)
    expect(migrateState(noVersion)).toBeNull();
  });

  it('stamps CURRENT_VERSION on migrated state', () => {
    const state = createInitialGameState();
    const result = migrateState(state);
    expect(result?.version).toBe(CURRENT_VERSION);
  });

  it('preserves state shape when no migration is needed', () => {
    const state = createInitialGameState();
    const result = migrateState(state);
    expect(result?.hero).toEqual(state.hero);
    expect(result?.guild).toEqual(state.guild);
    expect(result?.dynasty).toEqual(state.dynasty);
    expect(result?.time).toEqual(state.time);
  });
});

describe('v1 → v2 migration', () => {
  /** Build a minimal v1 state — missing the fields added in Layer 1. */
  function makeV1State() {
    const base = createInitialGameState() as unknown as Record<string, unknown>;
    const hero = { ...(base['hero'] as Record<string, unknown>) };
    const dynasty = { ...(base['dynasty'] as Record<string, unknown>) };

    // Strip the new Hero fields that did not exist in v1
    delete hero['maxActionPoints'];
    delete hero['passiveAbilityId'];
    delete hero['milestoneAbilityId'];
    delete hero['milestoneUnlocked'];

    // Strip the new Dynasty fields that did not exist in v1
    delete dynasty['legacySkills'];
    delete dynasty['unlockedHeroClasses'];

    return { ...base, version: 1, hero, dynasty };
  }

  it('fills in hero.maxActionPoints from HERO_ACTION_POINT_MAX', () => {
    const v1 = makeV1State();
    const result = migrateState(v1);
    expect(result?.hero.maxActionPoints).toBe(HERO_ACTION_POINT_MAX);
  });

  it('fills in hero.passiveAbilityId derived from heroClass', () => {
    const v1 = makeV1State();
    const result = migrateState(v1);
    // Default heroClass is 'Warblade', so passiveAbilityId should be 'warblade-passive'
    expect(result?.hero.passiveAbilityId).toBe('warblade-passive');
  });

  it('fills in hero.milestoneAbilityId derived from heroClass', () => {
    const v1 = makeV1State();
    const result = migrateState(v1);
    expect(result?.hero.milestoneAbilityId).toBe('warblade-milestone');
  });

  it('sets hero.milestoneUnlocked to false', () => {
    const v1 = makeV1State();
    const result = migrateState(v1);
    expect(result?.hero.milestoneUnlocked).toBe(false);
  });

  it('fills in dynasty.legacySkills as empty array', () => {
    const v1 = makeV1State();
    const result = migrateState(v1);
    expect(result?.dynasty.legacySkills).toEqual([]);
  });

  it('fills in dynasty.unlockedHeroClasses with default Warblade', () => {
    const v1 = makeV1State();
    const result = migrateState(v1);
    expect(result?.dynasty.unlockedHeroClasses).toEqual(['Warblade']);
  });

  it('bumps version to 2 after migration', () => {
    const v1 = makeV1State();
    const result = migrateState(v1);
    expect(result?.version).toBe(2);
  });

  it('preserves existing hero fields that were present in v1', () => {
    const v1 = makeV1State();
    const hero = v1['hero'] as Record<string, unknown>;
    const result = migrateState(v1);
    expect(result?.hero.id).toBe(hero['id']);
    expect(result?.hero.name).toBe(hero['name']);
    expect(result?.hero.heroClass).toBe(hero['heroClass']);
    expect(result?.hero.actionPoints).toBe(hero['actionPoints']);
  });

  it('preserves existing dynasty fields that were present in v1', () => {
    const v1 = makeV1State();
    const dynasty = v1['dynasty'] as Record<string, unknown>;
    const result = migrateState(v1);
    expect(result?.dynasty.prestigeCount).toBe(dynasty['prestigeCount']);
    expect(result?.dynasty.worldAwarenessTier).toBe(dynasty['worldAwarenessTier']);
  });

  it('does not double-migrate an already-v2 state (idempotency)', () => {
    const v2 = createInitialGameState(); // version is 2 after our bump
    const first = migrateState(v2);
    const second = migrateState(first!);
    expect(second).toEqual(first);
    expect(second?.version).toBe(2);
  });

  it('derives passiveAbilityId correctly for non-Warblade hero classes', () => {
    const v1 = makeV1State() as Record<string, unknown>;
    const hero = { ...(v1['hero'] as Record<string, unknown>), heroClass: 'Archmage' };
    const stateWithArcmage = { ...v1, hero };
    const result = migrateState(stateWithArcmage);
    expect(result?.hero.passiveAbilityId).toBe('archmage-passive');
    expect(result?.hero.milestoneAbilityId).toBe('archmage-milestone');
  });
});
