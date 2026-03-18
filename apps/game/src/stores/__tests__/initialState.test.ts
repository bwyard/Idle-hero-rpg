import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '../initialState';

describe('createInitialGameState', () => {
  it('returns a state at the current schema version', () => {
    expect(createInitialGameState().version).toBe(2);
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
