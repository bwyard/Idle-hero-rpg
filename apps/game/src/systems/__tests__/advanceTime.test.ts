import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { advanceTime } from '../advanceTime';
import { createInitialGameState } from '../../stores/initialState';

describe('advanceTime', () => {
  it('increments ticksElapsed by 1', () => {
    const state = createInitialGameState();
    const next = advanceTime(state);
    expect(next.time.ticksElapsed).toBe(1);
  });

  it('does not mutate the input state', () => {
    const state = createInitialGameState();
    advanceTime(state);
    expect(state.time.ticksElapsed).toBe(0);
  });

  it('does not modify any other field', () => {
    const state = createInitialGameState();
    const next = advanceTime(state);
    expect(next.hero).toEqual(state.hero);
    expect(next.guild).toEqual(state.guild);
    expect(next.dynasty).toEqual(state.dynasty);
  });

  it('property: always increments by exactly 1 regardless of starting value', () => {
    fc.assert(
      fc.property(fc.nat({ max: 1_000_000 }), (n) => {
        const state = { ...createInitialGameState(), time: { ticksElapsed: n } };
        return advanceTime(state).time.ticksElapsed === n + 1;
      }),
    );
  });
});
