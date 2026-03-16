import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { processEventLog } from '../processEventLog';
import { createInitialGameState } from '../../stores/initialState';
import { EVENT_LOG_MAX_LENGTH } from '../../data/balance';
import type { GameEvent } from '@idle-hero-rpg/shared';

/** Helper to create a minimal GameEvent. */
function makeEvent(id: string, tick: number): GameEvent {
  return {
    id,
    tick,
    type: 'test',
    message: `Event ${id}`,
    achievementKey: null,
  };
}

describe('processEventLog', () => {
  it('returns state unchanged when pendingEvents is empty', () => {
    const state = createInitialGameState();
    const next = processEventLog(state);
    expect(next).toBe(state); // reference equality — no unnecessary copy
  });

  it('appends pending events to the event log', () => {
    const state = {
      ...createInitialGameState(),
      pendingEvents: [makeEvent('e1', 1), makeEvent('e2', 1)],
    };
    const next = processEventLog(state);
    expect(next.eventLog).toHaveLength(2);
    expect(next.eventLog[0].id).toBe('e1');
    expect(next.eventLog[1].id).toBe('e2');
  });

  it('clears pendingEvents after processing', () => {
    const state = {
      ...createInitialGameState(),
      pendingEvents: [makeEvent('e1', 1)],
    };
    const next = processEventLog(state);
    expect(next.pendingEvents).toEqual([]);
  });

  it('preserves existing eventLog entries', () => {
    const existing = [makeEvent('old1', 0), makeEvent('old2', 0)];
    const state = {
      ...createInitialGameState(),
      eventLog: existing,
      pendingEvents: [makeEvent('new1', 1)],
    };
    const next = processEventLog(state);
    expect(next.eventLog).toHaveLength(3);
    expect(next.eventLog[0].id).toBe('old1');
    expect(next.eventLog[1].id).toBe('old2');
    expect(next.eventLog[2].id).toBe('new1');
  });

  it('trims eventLog to EVENT_LOG_MAX_LENGTH, keeping newest events', () => {
    const existing = Array.from({ length: EVENT_LOG_MAX_LENGTH }, (_, i) =>
      makeEvent(`old-${String(i)}`, i),
    );
    const pending = [makeEvent('overflow-1', EVENT_LOG_MAX_LENGTH), makeEvent('overflow-2', EVENT_LOG_MAX_LENGTH)];
    const state = {
      ...createInitialGameState(),
      eventLog: existing,
      pendingEvents: pending,
    };
    const next = processEventLog(state);
    expect(next.eventLog).toHaveLength(EVENT_LOG_MAX_LENGTH);
    // Oldest events should be trimmed, newest kept
    expect(next.eventLog[next.eventLog.length - 1].id).toBe('overflow-2');
    expect(next.eventLog[next.eventLog.length - 2].id).toBe('overflow-1');
    // First two old events should be gone
    expect(next.eventLog[0].id).toBe('old-2');
  });

  it('does not mutate the input state', () => {
    const state = {
      ...createInitialGameState(),
      pendingEvents: [makeEvent('e1', 1)],
    };
    const originalPendingLength = state.pendingEvents.length;
    const originalLogLength = state.eventLog.length;
    processEventLog(state);
    expect(state.pendingEvents).toHaveLength(originalPendingLength);
    expect(state.eventLog).toHaveLength(originalLogLength);
  });

  it('does not modify unrelated fields', () => {
    const state = {
      ...createInitialGameState(),
      pendingEvents: [makeEvent('e1', 1)],
    };
    const next = processEventLog(state);
    expect(next.hero).toEqual(state.hero);
    expect(next.guild).toEqual(state.guild);
    expect(next.dynasty).toEqual(state.dynasty);
    expect(next.time).toEqual(state.time);
  });

  it('property: output eventLog length is at most EVENT_LOG_MAX_LENGTH', () => {
    const eventArb = fc.record({
      id: fc.uuid(),
      tick: fc.nat({ max: 100_000 }),
      type: fc.constant('test'),
      message: fc.string(),
      achievementKey: fc.constant(null),
    }) as fc.Arbitrary<GameEvent>;

    fc.assert(
      fc.property(
        fc.array(eventArb, { maxLength: EVENT_LOG_MAX_LENGTH + 100 }),
        fc.array(eventArb, { maxLength: 50 }),
        (existingLog, pending) => {
          const state = {
            ...createInitialGameState(),
            eventLog: existingLog,
            pendingEvents: pending,
          };
          const next = processEventLog(state);
          return next.eventLog.length <= EVENT_LOG_MAX_LENGTH;
        },
      ),
    );
  });

  it('property: all pending events appear in the output log when under max length', () => {
    const eventArb = fc.record({
      id: fc.uuid(),
      tick: fc.nat({ max: 100_000 }),
      type: fc.constant('test'),
      message: fc.string(),
      achievementKey: fc.constant(null),
    }) as fc.Arbitrary<GameEvent>;

    fc.assert(
      fc.property(
        fc.array(eventArb, { maxLength: 10 }),
        fc.array(eventArb, { minLength: 1, maxLength: 10 }),
        (existingLog, pending) => {
          const state = {
            ...createInitialGameState(),
            eventLog: existingLog,
            pendingEvents: pending,
          };
          const next = processEventLog(state);
          // All pending event IDs should be in the output log
          const outputIds = new Set(next.eventLog.map((e) => e.id));
          return pending.every((e) => outputIds.has(e.id));
        },
      ),
    );
  });
});
