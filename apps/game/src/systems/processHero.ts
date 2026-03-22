/**
 * processHero — System 6 of 12 in the tick pipe.
 *
 * Regenerates action points and applies the hero's passive class ability.
 * Tracks career milestone progress toward the active ability unlock.
 *
 * Design decisions pending:
 * - Action point regen rate and cap (balance.ts stubs)
 * - Passive ability effects per hero class (HeroAbilityImpl)
 * - Option 3: shared vs per-leader ability system — NOT implemented here.
 *   Do not add shared vs per-leader divergence until Option 3 is closed.
 *
 * stubHeroAbilityImpl satisfies the contract and keeps CI green. Swap in a
 * live impl per hero class when Option 3 is resolved — this function does not
 * change.
 *
 * Pure function — no mutations, no side effects.
 */

import type { GameState, HeroAbilityImpl } from '@idle-hero-rpg/shared';
import {
  HERO_ACTION_POINT_MAX,
  PLACEHOLDER_AP_REGEN_INTERVAL_DAYS,
  TICKS_PER_DAY,
} from '../data/balance';

export const stubHeroAbilityImpl: HeroAbilityImpl = {
  actionPointRegen: () => 0,
  applyPassiveAbility: () => ({}),
  isMilestoneUnlocked: () => false,
};

/** placeholder — tune during balance pass */
export const placeholderHeroAbilityImpl: HeroAbilityImpl = {
  actionPointRegen: (state) =>
    state.time.ticksElapsed % (PLACEHOLDER_AP_REGEN_INTERVAL_DAYS * TICKS_PER_DAY) === 0 ? 1 : 0, // placeholder — tune during balance pass
  applyPassiveAbility: () => ({}), // placeholder — no passive effect yet
  isMilestoneUnlocked: () => false, // placeholder — kept disabled for now
};

export const processHero = (
  state: GameState,
  impl: HeroAbilityImpl = placeholderHeroAbilityImpl,
): GameState => {
  const regen = impl.actionPointRegen(state);
  const newAP = Math.min(Math.max(0, state.hero.actionPoints + regen), HERO_ACTION_POINT_MAX);

  const passivePatch = impl.applyPassiveAbility(state);

  return {
    ...state,
    ...passivePatch,
    hero: {
      ...state.hero,
      ...(passivePatch.hero ?? {}),
      actionPoints: newAP,
    },
  };
};
