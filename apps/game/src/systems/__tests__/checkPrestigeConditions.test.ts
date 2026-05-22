import { describe, it, expect } from 'vitest';
import { checkPrestigeConditions } from '../checkPrestigeConditions';
import { createInitialGameState } from '../../stores/initialState';
import type { GameState, Adventurer } from '@idle-hero-rpg/shared';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeAdventurer(overrides: Partial<Adventurer> = {}): Adventurer {
  return {
    id: 'adv_test1',
    name: 'TestAdv',
    tier: 'F',
    archetype: 'Fighter',
    xp: 0,
    milestones: [],
    skillBorrowUsed: false,
    recruitedYear: 0,
    retiredYear: null,
    housingType: 'dorm',
    ...overrides,
  };
}

function stateWith(adventurers: Record<string, Adventurer>, prestigeCount = 0): GameState {
  return {
    ...createInitialGameState(),
    adventurers,
    dynasty: { ...createInitialGameState().dynasty, prestigeCount },
  };
}

// ─── Early prestige (0–3): one living C+ ─────────────────────────────────────

describe('checkPrestigeConditions — early prestige (0–3)', () => {
  it('does not set prestigeAvailable with no C+ adventurers', () => {
    const state = stateWith({
      a1: makeAdventurer({ id: 'a1', tier: 'D' }),
      a2: makeAdventurer({ id: 'a2', tier: 'E' }),
    });
    expect(checkPrestigeConditions(state).flags.prestigeAvailable).toBe(false);
  });

  it('sets prestigeAvailable when one living C-tier adventurer exists', () => {
    const state = stateWith({ a1: makeAdventurer({ id: 'a1', tier: 'C' }) });
    expect(checkPrestigeConditions(state).flags.prestigeAvailable).toBe(true);
  });

  it('sets prestigeAvailable for B, A, S, SS, Legendary tiers', () => {
    for (const tier of ['B', 'A', 'S', 'SS', 'Legendary'] as const) {
      const state = stateWith({ a1: makeAdventurer({ id: 'a1', tier }) });
      expect(checkPrestigeConditions(state).flags.prestigeAvailable).toBe(true);
    }
  });

  it('does not count retired adventurers', () => {
    const state = stateWith({
      a1: makeAdventurer({ id: 'a1', tier: 'Legendary', retiredYear: 5 }),
    });
    expect(checkPrestigeConditions(state).flags.prestigeAvailable).toBe(false);
  });
});

// ─── Prestige 4–6: 1 B+ OR 2 C+ ─────────────────────────────────────────────

describe('checkPrestigeConditions — prestige 4–6', () => {
  it('passes with one B+ adventurer', () => {
    const state = stateWith({ a1: makeAdventurer({ id: 'a1', tier: 'B' }) }, 4);
    expect(checkPrestigeConditions(state).flags.prestigeAvailable).toBe(true);
  });

  it('passes with two C adventurers', () => {
    const state = stateWith(
      {
        a1: makeAdventurer({ id: 'a1', tier: 'C' }),
        a2: makeAdventurer({ id: 'a2', tier: 'C' }),
      },
      5,
    );
    expect(checkPrestigeConditions(state).flags.prestigeAvailable).toBe(true);
  });

  it('fails with one C and no B+', () => {
    const state = stateWith({ a1: makeAdventurer({ id: 'a1', tier: 'C' }) }, 4);
    expect(checkPrestigeConditions(state).flags.prestigeAvailable).toBe(false);
  });
});

// ─── Prestige 7–9: 1 A+ OR 2 B+ ─────────────────────────────────────────────

describe('checkPrestigeConditions — prestige 7–9', () => {
  it('passes with one A+ adventurer', () => {
    const state = stateWith({ a1: makeAdventurer({ id: 'a1', tier: 'A' }) }, 7);
    expect(checkPrestigeConditions(state).flags.prestigeAvailable).toBe(true);
  });

  it('passes with two B adventurers', () => {
    const state = stateWith(
      {
        a1: makeAdventurer({ id: 'a1', tier: 'B' }),
        a2: makeAdventurer({ id: 'a2', tier: 'B' }),
      },
      9,
    );
    expect(checkPrestigeConditions(state).flags.prestigeAvailable).toBe(true);
  });

  it('fails with one B and no A+', () => {
    const state = stateWith({ a1: makeAdventurer({ id: 'a1', tier: 'B' }) }, 8);
    expect(checkPrestigeConditions(state).flags.prestigeAvailable).toBe(false);
  });
});

// ─── Prestige 10–12: 1 S+ OR 2 A+ OR 3 B+ ───────────────────────────────────

describe('checkPrestigeConditions — prestige 10–12', () => {
  it('passes with one S+ adventurer', () => {
    const state = stateWith({ a1: makeAdventurer({ id: 'a1', tier: 'S' }) }, 10);
    expect(checkPrestigeConditions(state).flags.prestigeAvailable).toBe(true);
  });

  it('passes with two A adventurers', () => {
    const state = stateWith(
      {
        a1: makeAdventurer({ id: 'a1', tier: 'A' }),
        a2: makeAdventurer({ id: 'a2', tier: 'A' }),
      },
      11,
    );
    expect(checkPrestigeConditions(state).flags.prestigeAvailable).toBe(true);
  });

  it('passes with three B adventurers', () => {
    const state = stateWith(
      {
        a1: makeAdventurer({ id: 'a1', tier: 'B' }),
        a2: makeAdventurer({ id: 'a2', tier: 'B' }),
        a3: makeAdventurer({ id: 'a3', tier: 'B' }),
      },
      12,
    );
    expect(checkPrestigeConditions(state).flags.prestigeAvailable).toBe(true);
  });

  it('fails with one A and one B (2 B+, below all thresholds)', () => {
    const state = stateWith(
      {
        a1: makeAdventurer({ id: 'a1', tier: 'A' }),
        a2: makeAdventurer({ id: 'a2', tier: 'B' }),
      },
      10,
    );
    // countAtOrAbove('S')=0 (need 1), countAtOrAbove('A')=1 (need 2), countAtOrAbove('B')=2 (need 3)
    expect(checkPrestigeConditions(state).flags.prestigeAvailable).toBe(false);
  });

  it('passes with one A and two B — A counts toward B+ giving 3 total', () => {
    const state = stateWith(
      {
        a1: makeAdventurer({ id: 'a1', tier: 'A' }),
        a2: makeAdventurer({ id: 'a2', tier: 'B' }),
        a3: makeAdventurer({ id: 'a3', tier: 'B' }),
      },
      10,
    );
    // countAtOrAbove('B') = 3 (A ranks above B) — passes the "3 B+" condition
    expect(checkPrestigeConditions(state).flags.prestigeAvailable).toBe(true);
  });
});

// ─── Event emission ───────────────────────────────────────────────────────────

describe('checkPrestigeConditions — events', () => {
  it('emits PRESTIGE_AVAILABLE when condition is newly met', () => {
    const state = stateWith({ a1: makeAdventurer({ id: 'a1', tier: 'C' }) });
    const next = checkPrestigeConditions(state);
    expect(next.pendingEvents.some((e) => e.type === 'PRESTIGE_AVAILABLE')).toBe(true);
  });

  it('does not emit event if flag was already true', () => {
    const state: GameState = {
      ...stateWith({ a1: makeAdventurer({ id: 'a1', tier: 'C' }) }),
      flags: {
        prestigeAvailable: true,
        forcedPrestigeTriggered: false,
        leaderPressureLevel: 'none',
      },
    };
    const next = checkPrestigeConditions(state);
    expect(next.pendingEvents.filter((e) => e.type === 'PRESTIGE_AVAILABLE')).toHaveLength(0);
  });

  it('clears prestigeAvailable when condition is no longer met', () => {
    const state: GameState = {
      ...stateWith({ a1: makeAdventurer({ id: 'a1', tier: 'D' }) }),
      flags: {
        prestigeAvailable: true,
        forcedPrestigeTriggered: false,
        leaderPressureLevel: 'none',
      },
    };
    expect(checkPrestigeConditions(state).flags.prestigeAvailable).toBe(false);
  });
});

// ─── Purity ───────────────────────────────────────────────────────────────────

describe('checkPrestigeConditions — purity', () => {
  it('does not mutate input state', () => {
    const state = stateWith({ a1: makeAdventurer({ id: 'a1', tier: 'C' }) });
    const before = state.flags.prestigeAvailable;
    checkPrestigeConditions(state);
    expect(state.flags.prestigeAvailable).toBe(before);
  });

  it('does not modify unrelated fields', () => {
    const state = stateWith({ a1: makeAdventurer({ id: 'a1', tier: 'C' }) });
    const next = checkPrestigeConditions(state);
    expect(next.hero).toEqual(state.hero);
    expect(next.guild).toEqual(state.guild);
    expect(next.time).toEqual(state.time);
  });

  it('returns same reference when nothing changes', () => {
    const state = stateWith({ a1: makeAdventurer({ id: 'a1', tier: 'D' }) });
    expect(checkPrestigeConditions(state)).toBe(state);
  });
});
