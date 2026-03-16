import { describe, it, expect } from 'vitest';
import { migrateState, CURRENT_VERSION } from '../migrations';
import { createInitialGameState } from '../initialState';

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
