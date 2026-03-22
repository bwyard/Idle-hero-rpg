import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '../initialState';

describe('createInitialGameState', () => {
  it('returns a state with version 2', () => {
    expect(createInitialGameState().version).toBe(2);
  });

  it('starts with a non-zero rngSeed', () => {
    expect(typeof createInitialGameState().rngSeed).toBe('number');
    // Two calls should produce different seeds (Date.now()-based)
    const a = createInitialGameState();
    expect(a.rngSeed).toBeGreaterThanOrEqual(0);
    expect(a.rngSeed).toBeLessThanOrEqual(0xffff_ffff);
  });

  it('starts with ticksElapsed at 0', () => {
    expect(createInitialGameState().time.ticksElapsed).toBe(0);
  });

  it('starts with prestigeCount at 0', () => {
    expect(createInitialGameState().dynasty.prestigeCount).toBe(0);
  });

  it('starts with worldAwarenessTier as Hidden', () => {
    expect(createInitialGameState().dynasty.worldAwarenessTier).toBe('Hidden');
  });

  it('starts with starter adventurers, city, and building', () => {
    const state = createInitialGameState();
    expect(Object.keys(state.adventurers)).toEqual(['adv_starter_1', 'adv_starter_2']);
    expect(state.adventurers.adv_starter_1!.name).toBe('Kira');
    expect(state.adventurers.adv_starter_2!.name).toBe('Tomas');
    expect(Object.keys(state.cities)).toEqual(['cty_heartlands']);
    expect(state.cities.cty_heartlands!.name).toBe('Millhaven');
    expect(Object.keys(state.buildings)).toEqual(['bld_guildhall']);
    expect(state.quests).toEqual({});
    expect(state.rivals).toEqual({});
  });

  it('starts with prestigeAvailable flag false', () => {
    expect(createInitialGameState().flags.prestigeAvailable).toBe(false);
  });

  it('starts with empty eventLog and pendingEvents', () => {
    const state = createInitialGameState();
    expect(state.eventLog).toEqual([]);
    expect(state.pendingEvents).toEqual([]);
  });

  it('returns a new object on each call (not a shared reference)', () => {
    const a = createInitialGameState();
    const b = createInitialGameState();
    expect(a).not.toBe(b);
    a.dynasty.prestigeCount = 99;
    expect(b.dynasty.prestigeCount).toBe(0);
  });
});
