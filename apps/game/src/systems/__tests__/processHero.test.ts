import { describe, it, expect } from 'vitest';
import { processHero, stubHeroAbilityImpl, placeholderHeroAbilityImpl } from '../processHero';
import { createInitialGameState } from '../../stores/initialState';
import {
  HERO_ACTION_POINT_MAX,
  PLACEHOLDER_AP_REGEN_INTERVAL_DAYS,
  TICKS_PER_DAY,
} from '../../data/balance';
import type { GameState } from '@idle-hero-rpg/shared';

describe('processHero', () => {
  it('returns state unchanged when hero has max AP (stub impl)', () => {
    const state: GameState = {
      ...createInitialGameState(),
      hero: { ...createInitialGameState().hero, actionPoints: HERO_ACTION_POINT_MAX },
    };

    const next = processHero(state, stubHeroAbilityImpl);
    expect(next.hero.actionPoints).toBe(HERO_ACTION_POINT_MAX);
  });

  it('returns state unchanged when hero has max AP (placeholder impl, non-regen tick)', () => {
    const state: GameState = {
      ...createInitialGameState(),
      hero: { ...createInitialGameState().hero, actionPoints: HERO_ACTION_POINT_MAX },
      time: { ...createInitialGameState().time, ticksElapsed: 1 },
    };

    const next = processHero(state, placeholderHeroAbilityImpl);
    expect(next.hero.actionPoints).toBe(HERO_ACTION_POINT_MAX);
  });

  it('regenerates AP at the correct interval (placeholder impl)', () => {
    const regenTick = PLACEHOLDER_AP_REGEN_INTERVAL_DAYS * TICKS_PER_DAY;
    const state: GameState = {
      ...createInitialGameState(),
      hero: { ...createInitialGameState().hero, actionPoints: 3 },
      time: { ...createInitialGameState().time, ticksElapsed: regenTick },
    };

    const next = processHero(state, placeholderHeroAbilityImpl);
    expect(next.hero.actionPoints).toBe(4);
  });

  it('does not exceed HERO_ACTION_POINT_MAX', () => {
    const regenTick = PLACEHOLDER_AP_REGEN_INTERVAL_DAYS * TICKS_PER_DAY;
    const state: GameState = {
      ...createInitialGameState(),
      hero: { ...createInitialGameState().hero, actionPoints: HERO_ACTION_POINT_MAX },
      time: { ...createInitialGameState().time, ticksElapsed: regenTick },
    };

    const next = processHero(state, placeholderHeroAbilityImpl);
    expect(next.hero.actionPoints).toBe(HERO_ACTION_POINT_MAX);
  });

  it('does not mutate input state', () => {
    const regenTick = PLACEHOLDER_AP_REGEN_INTERVAL_DAYS * TICKS_PER_DAY;
    const state: GameState = {
      ...createInitialGameState(),
      hero: { ...createInitialGameState().hero, actionPoints: 3 },
      time: { ...createInitialGameState().time, ticksElapsed: regenTick },
    };
    const originalAP = state.hero.actionPoints;

    processHero(state, placeholderHeroAbilityImpl);
    expect(state.hero.actionPoints).toBe(originalAP);
  });

  describe('AP cap uses hero.maxActionPoints (not hardcoded constant)', () => {
    it('caps AP at hero.maxActionPoints when it is lower than HERO_ACTION_POINT_MAX', () => {
      const customMax = 5;
      const regenTick = PLACEHOLDER_AP_REGEN_INTERVAL_DAYS * TICKS_PER_DAY;
      const state: GameState = {
        ...createInitialGameState(),
        hero: {
          ...createInitialGameState().hero,
          actionPoints: customMax,
          maxActionPoints: customMax,
        },
        time: { ...createInitialGameState().time, ticksElapsed: regenTick },
      };

      const next = processHero(state, placeholderHeroAbilityImpl);
      expect(next.hero.actionPoints).toBe(customMax);
    });

    it('allows AP cap higher than the default HERO_ACTION_POINT_MAX when maxActionPoints is higher', () => {
      const customMax = HERO_ACTION_POINT_MAX + 5;
      const regenTick = PLACEHOLDER_AP_REGEN_INTERVAL_DAYS * TICKS_PER_DAY;
      const state: GameState = {
        ...createInitialGameState(),
        hero: {
          ...createInitialGameState().hero,
          actionPoints: HERO_ACTION_POINT_MAX, // just below custom max
          maxActionPoints: customMax,
        },
        time: { ...createInitialGameState().time, ticksElapsed: regenTick },
      };

      const next = processHero(state, placeholderHeroAbilityImpl);
      // Should be HERO_ACTION_POINT_MAX + 1 (regen adds 1)
      expect(next.hero.actionPoints).toBe(HERO_ACTION_POINT_MAX + 1);
    });
  });

  describe('isMilestoneUnlocked reads from hero state (placeholder impl)', () => {
    it('returns false when hero.milestoneUnlocked is false', () => {
      const state: GameState = {
        ...createInitialGameState(),
        hero: { ...createInitialGameState().hero, milestoneUnlocked: false },
      };

      expect(placeholderHeroAbilityImpl.isMilestoneUnlocked(state)).toBe(false);
    });

    it('returns true when hero.milestoneUnlocked is true', () => {
      const state: GameState = {
        ...createInitialGameState(),
        hero: { ...createInitialGameState().hero, milestoneUnlocked: true },
      };

      expect(placeholderHeroAbilityImpl.isMilestoneUnlocked(state)).toBe(true);
    });
  });
});
