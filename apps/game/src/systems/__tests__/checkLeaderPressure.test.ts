import { describe, it, expect } from 'vitest';
import { checkLeaderPressure } from '../checkLeaderPressure';
import { createInitialGameState } from '../../stores/initialState';
import type { GameState } from '@idle-hero-rpg/shared';

describe('checkLeaderPressure', () => {
  it('returns state unchanged (stub behavior)', () => {
    const state = createInitialGameState();
    const next = checkLeaderPressure(state);
    expect(next).toEqual(state);
  });

  it('returns the same reference when no changes are made', () => {
    const state = createInitialGameState();
    const next = checkLeaderPressure(state);
    expect(next).toBe(state);
  });

  it('does not mutate input state', () => {
    const state = createInitialGameState();
    const original = JSON.parse(JSON.stringify(state)) as GameState;
    checkLeaderPressure(state);
    expect(state).toEqual(original);
  });
});
