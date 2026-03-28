import { describe, it, expect } from 'vitest';
import { checkForcedPrestige } from '../checkForcedPrestige';
import { createTestState } from '../../__tests__/helpers/createTestState';
import { TICKS_PER_YEAR } from '../../data/balance';
import type { GameState } from '@idle-hero-rpg/shared';

const stateAtYear = (year: number, prestigeCount: number): GameState => ({
  ...createTestState(),
  time: {
    ...createTestState().time,
    ticksElapsed: year * TICKS_PER_YEAR,
    currentYear: year,
  },
  dynasty: {
    ...createTestState().dynasty,
    prestigeCount,
  },
});

describe('checkForcedPrestige', () => {
  it('returns state unchanged before forced window (prestige 1, year 20)', () => {
    const state = stateAtYear(20, 0);
    const result = checkForcedPrestige(state);
    expect(result.flags.forcedPrestigeTriggered).toBe(false);
  });

  it('triggers forced prestige at year 25 for prestige 1', () => {
    const state = stateAtYear(25, 0);
    const result = checkForcedPrestige(state);
    expect(result.flags.forcedPrestigeTriggered).toBe(true);
  });

  it('triggers forced prestige at year 30 for prestige 2', () => {
    const state = stateAtYear(30, 1);
    const result = checkForcedPrestige(state);
    expect(result.flags.forcedPrestigeTriggered).toBe(true);
  });

  it('triggers forced prestige at year 35 for prestige 3', () => {
    const state = stateAtYear(35, 2);
    const result = checkForcedPrestige(state);
    expect(result.flags.forcedPrestigeTriggered).toBe(true);
  });

  it('triggers forced prestige at year 40 for prestige 4', () => {
    const state = stateAtYear(40, 3);
    const result = checkForcedPrestige(state);
    expect(result.flags.forcedPrestigeTriggered).toBe(true);
  });

  it('triggers forced prestige at year 45 for prestige 5', () => {
    const state = stateAtYear(45, 4);
    const result = checkForcedPrestige(state);
    expect(result.flags.forcedPrestigeTriggered).toBe(true);
  });

  it('triggers forced prestige at year 45 for prestige 6', () => {
    const state = stateAtYear(45, 5);
    const result = checkForcedPrestige(state);
    expect(result.flags.forcedPrestigeTriggered).toBe(true);
  });

  it('does NOT trigger forced prestige at prestige 7+ (free control)', () => {
    const state = stateAtYear(45, 6);
    const result = checkForcedPrestige(state);
    expect(result.flags.forcedPrestigeTriggered).toBe(false);
  });

  it('does NOT trigger forced prestige at prestige 10+ regardless of year', () => {
    const state = stateAtYear(50, 9);
    const result = checkForcedPrestige(state);
    expect(result.flags.forcedPrestigeTriggered).toBe(false);
  });

  it('emits FORCED_PRESTIGE event when newly triggered', () => {
    const state = stateAtYear(25, 0);
    const result = checkForcedPrestige(state);
    const event = result.pendingEvents.find((e) => e.type === 'FORCED_PRESTIGE');
    expect(event).toBeDefined();
    expect(event?.causeId).toBeNull();
  });

  it('does not emit event when not triggered', () => {
    const state = stateAtYear(20, 0);
    const result = checkForcedPrestige(state);
    const event = result.pendingEvents.find((e) => e.type === 'FORCED_PRESTIGE');
    expect(event).toBeUndefined();
  });

  it('does not emit duplicate event if already triggered', () => {
    const state: GameState = {
      ...stateAtYear(25, 0),
      flags: {
        ...stateAtYear(25, 0).flags,
        forcedPrestigeTriggered: true,
      },
    };
    const result = checkForcedPrestige(state);
    const events = result.pendingEvents.filter((e) => e.type === 'FORCED_PRESTIGE');
    expect(events).toHaveLength(0);
  });

  it('returns same reference when no changes are made', () => {
    const state = stateAtYear(10, 0);
    const result = checkForcedPrestige(state);
    expect(result).toBe(state);
  });

  it('does not mutate input state', () => {
    const state = stateAtYear(25, 0);
    const frozen = JSON.stringify(state);
    checkForcedPrestige(state);
    expect(JSON.stringify(state)).toBe(frozen);
  });
});
