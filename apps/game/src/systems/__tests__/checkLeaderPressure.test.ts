import { describe, it, expect } from 'vitest';
import { checkLeaderPressure } from '../checkLeaderPressure';
import { createTestState } from '../../__tests__/helpers/createTestState';
import { TICKS_PER_YEAR } from '../../data/balance';
import type { GameState, Adventurer } from '@idle-hero-rpg/shared';

const makeAdventurer = (tier: Adventurer['tier'], id = 'adv_rival1'): Adventurer => ({
  id,
  name: 'Rival',
  tier,
  archetype: 'Fighter',
  xp: 0,
  milestones: [],
  skillBorrowUsed: false,
  recruitedYear: 0,
  retiredYear: null,
  housingType: 'dorm',
});

const stateWith = (opts: {
  year: number;
  prestigeCount: number;
  leaderTier?: string;
  leaderStartYear?: number;
  highestAdventurerTier?: Adventurer['tier'];
}): GameState => {
  const base = createTestState();
  const adventurers: Record<string, Adventurer> = {
    ...base.adventurers,
  };
  if (opts.highestAdventurerTier) {
    adventurers['adv_high1'] = makeAdventurer(opts.highestAdventurerTier, 'adv_high1');
  }

  return {
    ...base,
    time: {
      ...base.time,
      ticksElapsed: opts.year * TICKS_PER_YEAR,
      currentYear: opts.year,
    },
    hero: {
      ...base.hero,
      leaderStartYear: opts.leaderStartYear ?? 0,
    },
    dynasty: {
      ...base.dynasty,
      prestigeCount: opts.prestigeCount,
    },
    adventurers,
  };
};

describe('checkLeaderPressure', () => {
  // Prestige 1-3: no pressure
  it('returns "none" for prestige 1-3 regardless of conditions', () => {
    const state = stateWith({
      year: 30,
      prestigeCount: 2,
      leaderStartYear: 0,
      highestAdventurerTier: 'SS',
    });
    const result = checkLeaderPressure(state);
    expect(result.flags.leaderPressureLevel).toBe('none');
  });

  // Prestige 4-6: soft pressure when higher tier exists (S and above)
  it('returns "soft" for prestige 4-6 when S+ tier adventurer exists', () => {
    const state = stateWith({
      year: 10,
      prestigeCount: 4,
      highestAdventurerTier: 'S',
    });
    const result = checkLeaderPressure(state);
    expect(result.flags.leaderPressureLevel).toBe('soft');
  });

  it('returns "none" for prestige 4-6 when no high tier adventurer exists', () => {
    const state = stateWith({
      year: 10,
      prestigeCount: 4,
    });
    const result = checkLeaderPressure(state);
    expect(result.flags.leaderPressureLevel).toBe('none');
  });

  // Prestige 7-9: moderate pressure when higher tier + 20yr tenure
  it('returns "moderate" for prestige 7-9 when higher tier exists and leader tenure >= 20yr', () => {
    const state = stateWith({
      year: 25,
      prestigeCount: 7,
      leaderStartYear: 0,
      highestAdventurerTier: 'S',
    });
    const result = checkLeaderPressure(state);
    expect(result.flags.leaderPressureLevel).toBe('moderate');
  });

  it('returns "soft" for prestige 7-9 when higher tier exists but tenure < 20yr', () => {
    const state = stateWith({
      year: 15,
      prestigeCount: 7,
      leaderStartYear: 0,
      highestAdventurerTier: 'S',
    });
    const result = checkLeaderPressure(state);
    expect(result.flags.leaderPressureLevel).toBe('soft');
  });

  // Prestige 10-12: real pressure when SS/Legendary vs B or below
  it('returns "real" for prestige 10-12 when SS adventurer exists', () => {
    const state = stateWith({
      year: 25,
      prestigeCount: 10,
      leaderStartYear: 0,
      highestAdventurerTier: 'SS',
    });
    const result = checkLeaderPressure(state);
    expect(result.flags.leaderPressureLevel).toBe('real');
  });

  // Prestige 13+: hard replacement possible
  it('returns "hard" for prestige 13+ when Legendary adventurer exists', () => {
    const state = stateWith({
      year: 25,
      prestigeCount: 13,
      leaderStartYear: 0,
      highestAdventurerTier: 'Legendary',
    });
    const result = checkLeaderPressure(state);
    expect(result.flags.leaderPressureLevel).toBe('hard');
  });

  it('returns "none" for prestige 13+ when no high tier adventurer exists', () => {
    const state = stateWith({
      year: 25,
      prestigeCount: 13,
    });
    const result = checkLeaderPressure(state);
    expect(result.flags.leaderPressureLevel).toBe('none');
  });

  // Event emission
  it('emits LEADER_PRESSURE event when pressure level changes', () => {
    const state = stateWith({
      year: 10,
      prestigeCount: 4,
      highestAdventurerTier: 'S',
    });
    const result = checkLeaderPressure(state);
    const event = result.pendingEvents.find((e) => e.type === 'LEADER_PRESSURE');
    expect(event).toBeDefined();
  });

  it('does not emit event when pressure level stays the same', () => {
    const state: GameState = {
      ...stateWith({
        year: 10,
        prestigeCount: 4,
        highestAdventurerTier: 'S',
      }),
      flags: {
        ...createTestState().flags,
        leaderPressureLevel: 'soft',
      },
    };
    const result = checkLeaderPressure(state);
    const event = result.pendingEvents.find((e) => e.type === 'LEADER_PRESSURE');
    expect(event).toBeUndefined();
  });

  // Pure function
  it('returns same reference when no changes needed', () => {
    const state = stateWith({ year: 5, prestigeCount: 0 });
    const result = checkLeaderPressure(state);
    expect(result).toBe(state);
  });

  it('does not mutate input state', () => {
    const state = stateWith({ year: 25, prestigeCount: 7, highestAdventurerTier: 'S' });
    const frozen = JSON.stringify(state);
    checkLeaderPressure(state);
    expect(JSON.stringify(state)).toBe(frozen);
  });
});
