import { describe, it, expect } from 'vitest';
import { processConclave } from '../processConclave';
import { createInitialGameState } from '../../stores/initialState';
import type { GameState } from '@idle-hero-rpg/shared';

describe('processConclave', () => {
  it('returns state unchanged when not a conclave year', () => {
    const state: GameState = {
      ...createInitialGameState(),
      time: { ...createInitialGameState().time, ticksElapsed: 1 },
    };
    const next = processConclave(state);
    expect(next).toEqual(state);
  });

  it('returns state unchanged at tick 0 (no conclave on first tick)', () => {
    const state = createInitialGameState();
    const next = processConclave(state);
    expect(next).toBe(state);
  });

  it('does not mutate input state', () => {
    const state = createInitialGameState();
    const original = JSON.parse(JSON.stringify(state)) as GameState;
    processConclave(state);
    expect(state).toEqual(original);
  });
});
