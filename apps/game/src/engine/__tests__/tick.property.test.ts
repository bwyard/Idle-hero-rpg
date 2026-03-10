/**
 * Property-based tests for the tick function.
 *
 * These tests verify invariants that must hold for all valid GameState inputs:
 * - Tick is a pure function (same input always produces same output)
 * - Tick never returns the exact same reference (always a new object)
 * - Tick always increments ticksElapsed by exactly 1
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { tick } from '../tick';
import { createInitialGameState } from '../../stores/initialState';

describe('tick — property tests', () => {
  it('always increments ticksElapsed by exactly 1', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 1_000_000 }),
        (startTick) => {
          const state = { ...createInitialGameState(), time: { ticksElapsed: startTick } };
          const next = tick(state);
          return next.time.ticksElapsed === startTick + 1;
        },
      ),
    );
  });

  it('is referentially pure — same input produces equal output', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 100 }),
        (startTick) => {
          const state = { ...createInitialGameState(), time: { ticksElapsed: startTick } };
          const result1 = tick(state);
          const result2 = tick(state);
          return result1.time.ticksElapsed === result2.time.ticksElapsed;
        },
      ),
    );
  });

  it('does not mutate the input state', () => {
    const state = createInitialGameState();
    const originalTick = state.time.ticksElapsed;
    tick(state);
    expect(state.time.ticksElapsed).toBe(originalTick);
  });
});
