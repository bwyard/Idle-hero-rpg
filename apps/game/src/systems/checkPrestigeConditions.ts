/**
 * checkPrestigeConditions — System 10 of 13 in the tick pipe.
 *
 * Checks whether prestige conditions have been met:
 * - Before prestige 10: one Legendary adventurer has retired
 * - Prestige 10+: multiple high-tier (S/SS/Legendary) adventurers must have retired
 *
 * Sets flags.prestigeAvailable and emits a PRESTIGE_AVAILABLE event
 * when the condition is newly met. Clears the flag when conditions
 * are no longer satisfied.
 *
 * Pure function — no mutations, no side effects.
 */

import type { GameState } from '@idle-hero-rpg/shared';
import { createId } from '@idle-hero-rpg/shared';
import { PRESTIGE_ESCALATION_THRESHOLD } from '../data/balance';

/** Tiers that count toward escalated prestige requirements (S and above). */
const HIGH_TIERS = new Set(['S', 'SS', 'Legendary']);

/** Minimum retired high-tier adventurers required at prestige 10+. */
const ESCALATED_REQUIRED_COUNT = 2;

export function checkPrestigeConditions(state: GameState): GameState {
  const { prestigeCount } = state.dynasty;
  const adventurers = Object.values(state.adventurers);
  const isEscalated = prestigeCount >= PRESTIGE_ESCALATION_THRESHOLD;

  // Prestige 10+: need multiple retired high-tier adventurers
  // Pre-escalation: need one retired Legendary adventurer
  const conditionMet = isEscalated
    ? adventurers.filter((a) => HIGH_TIERS.has(a.tier) && a.retiredYear !== null).length >=
      ESCALATED_REQUIRED_COUNT
    : adventurers.some((a) => a.tier === 'Legendary' && a.retiredYear !== null);

  const wasAvailable = state.flags.prestigeAvailable;

  // No change needed
  if (conditionMet === wasAvailable) {
    return state;
  }

  // Condition newly met — emit event
  const pendingEvents = conditionMet
    ? [
        ...state.pendingEvents,
        {
          id: createId('evt'),
          tick: state.time.ticksElapsed,
          type: 'PRESTIGE_AVAILABLE',
          message: 'A legendary adventurer has retired — prestige is available!',
          achievementKey: null,
        },
      ]
    : state.pendingEvents;

  return {
    ...state,
    flags: {
      ...state.flags,
      prestigeAvailable: conditionMet,
    },
    pendingEvents,
  };
}
