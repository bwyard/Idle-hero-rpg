import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '../initialState';

describe('createInitialGameState', () => {
  it('returns a state with version 1', () => {
    expect(createInitialGameState().version).toBe(1);
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

  it('starts with empty collections', () => {
    const state = createInitialGameState();
    expect(state.adventurers).toEqual({});
    expect(state.cities).toEqual({});
    expect(state.buildings).toEqual({});
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
