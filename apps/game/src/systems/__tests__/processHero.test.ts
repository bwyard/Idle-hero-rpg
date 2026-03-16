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
});
