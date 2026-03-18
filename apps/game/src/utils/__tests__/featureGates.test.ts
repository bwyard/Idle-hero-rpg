import { describe, it, expect } from 'vitest';
import {
  hasMagicRewindSafety,
  isMasterMentorUnlocked,
  isSkillBorrowAvailable,
} from '../featureGates';
import { createInitialGameState } from '../../stores/initialState';
import {
  MAGIC_REWIND_SAFETY_MAX_PRESTIGE,
  MASTER_MENTOR_UNLOCK_PRESTIGE,
  MASTER_MENTOR_ACTION_POINT_COST,
} from '../../data/balance';
import type { GameState, DynastyState } from '@idle-hero-rpg/shared';

/** Helper: build a state with a specific prestige count embedded in state.dynasty. */
function stateWithPrestige(prestigeCount: number): GameState {
  return {
    ...createInitialGameState(),
    dynasty: {
      ...createInitialGameState().dynasty,
      prestigeCount,
    },
  };
}

/** Helper: build a dynasty object with a specific prestige count. */
function dynastyWithPrestige(prestigeCount: number): DynastyState {
  return {
    prestigeCount,
    worldAwarenessTier: 'Hidden',
    permanentBonuses: {},
    hallOfHeroes: [],
    legacySkills: [],
    unlockedHeroClasses: ['Warblade'],
  };
}

describe('hasMagicRewindSafety', () => {
  it('returns true when prestigeCount is 0', () => {
    const state = stateWithPrestige(0);
    expect(hasMagicRewindSafety(state)).toBe(true);
  });

  it('returns true when prestigeCount equals MAGIC_REWIND_SAFETY_MAX_PRESTIGE', () => {
    const state = stateWithPrestige(MAGIC_REWIND_SAFETY_MAX_PRESTIGE);
    expect(hasMagicRewindSafety(state)).toBe(true);
  });

  it('returns false when prestigeCount exceeds MAGIC_REWIND_SAFETY_MAX_PRESTIGE', () => {
    const state = stateWithPrestige(MAGIC_REWIND_SAFETY_MAX_PRESTIGE + 1);
    expect(hasMagicRewindSafety(state)).toBe(false);
  });

  it('returns false well above the threshold', () => {
    const state = stateWithPrestige(20);
    expect(hasMagicRewindSafety(state)).toBe(false);
  });
});

describe('isMasterMentorUnlocked', () => {
  it('returns false when dynasty is null', () => {
    const state = createInitialGameState();
    expect(isMasterMentorUnlocked(state, null)).toBe(false);
  });

  it('returns false when dynasty prestigeCount is below threshold', () => {
    const state = createInitialGameState();
    const dynasty = dynastyWithPrestige(MASTER_MENTOR_UNLOCK_PRESTIGE - 1);
    expect(isMasterMentorUnlocked(state, dynasty)).toBe(false);
  });

  it('returns true when dynasty prestigeCount equals threshold', () => {
    const state = createInitialGameState();
    const dynasty = dynastyWithPrestige(MASTER_MENTOR_UNLOCK_PRESTIGE);
    expect(isMasterMentorUnlocked(state, dynasty)).toBe(true);
  });

  it('returns true when dynasty prestigeCount exceeds threshold', () => {
    const state = createInitialGameState();
    const dynasty = dynastyWithPrestige(MASTER_MENTOR_UNLOCK_PRESTIGE + 5);
    expect(isMasterMentorUnlocked(state, dynasty)).toBe(true);
  });
});

describe('isSkillBorrowAvailable', () => {
  it('returns false when dynasty is null', () => {
    const state: GameState = {
      ...createInitialGameState(),
      hero: { ...createInitialGameState().hero, actionPoints: MASTER_MENTOR_ACTION_POINT_COST },
    };
    expect(isSkillBorrowAvailable(state, null)).toBe(false);
  });

  it('returns false when Master Mentor is not unlocked (prestige too low)', () => {
    const state: GameState = {
      ...createInitialGameState(),
      hero: { ...createInitialGameState().hero, actionPoints: MASTER_MENTOR_ACTION_POINT_COST },
    };
    const dynasty = dynastyWithPrestige(MASTER_MENTOR_UNLOCK_PRESTIGE - 1);
    expect(isSkillBorrowAvailable(state, dynasty)).toBe(false);
  });

  it('returns false when Master Mentor is unlocked but hero has insufficient AP', () => {
    const state: GameState = {
      ...createInitialGameState(),
      hero: {
        ...createInitialGameState().hero,
        actionPoints: MASTER_MENTOR_ACTION_POINT_COST - 1,
      },
    };
    const dynasty = dynastyWithPrestige(MASTER_MENTOR_UNLOCK_PRESTIGE);
    expect(isSkillBorrowAvailable(state, dynasty)).toBe(false);
  });

  it('returns true when Master Mentor is unlocked and hero has exactly enough AP', () => {
    const state: GameState = {
      ...createInitialGameState(),
      hero: { ...createInitialGameState().hero, actionPoints: MASTER_MENTOR_ACTION_POINT_COST },
    };
    const dynasty = dynastyWithPrestige(MASTER_MENTOR_UNLOCK_PRESTIGE);
    expect(isSkillBorrowAvailable(state, dynasty)).toBe(true);
  });

  it('returns true when Master Mentor is unlocked and hero has more than enough AP', () => {
    const state: GameState = {
      ...createInitialGameState(),
      hero: {
        ...createInitialGameState().hero,
        actionPoints: MASTER_MENTOR_ACTION_POINT_COST + 5,
      },
    };
    const dynasty = dynastyWithPrestige(MASTER_MENTOR_UNLOCK_PRESTIGE + 3);
    expect(isSkillBorrowAvailable(state, dynasty)).toBe(true);
  });
});
