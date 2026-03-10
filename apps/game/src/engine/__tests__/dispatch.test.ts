import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { dispatch } from '../dispatch';
import { createInitialGameState } from '../../stores/initialState';

describe('dispatch', () => {
  it('returns state unchanged for an unknown action type', () => {
    const state = createInitialGameState();
    const next = dispatch(state, { type: 'UNKNOWN_ACTION' } as never);
    expect(next).toEqual(state);
  });

  it('does not mutate the input state', () => {
    const state = createInitialGameState();
    const originalTick = state.time.ticksElapsed;
    dispatch(state, { type: 'UNKNOWN_ACTION' } as never);
    expect(state.time.ticksElapsed).toBe(originalTick);
  });

  it('property: always returns a state with the same version number', () => {
    fc.assert(
      fc.property(fc.nat({ max: 100 }), (n) => {
        const state = { ...createInitialGameState(), version: n };
        const next = dispatch(state, { type: 'UNKNOWN_ACTION' } as never);
        return next.version === n;
      }),
    );
  });
});
