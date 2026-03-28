/**
 * checkForcedPrestige — System 12 of 13 in the tick pipe.
 *
 * Triggers forced prestige when the current run reaches the forced window
 * deadline for early prestiges. By prestige 7 the player has full control.
 *
 * See docs/design/prestige.md § Forced Prestige Windows.
 * Balance constants in balance.ts: FORCED_PRESTIGE_YEAR, FORCED_PRESTIGE_FREE_AT.
 *
 * Pure function — no mutations, no side effects.
 */

import type { GameState } from '@idle-hero-rpg/shared';
import { createId } from '@idle-hero-rpg/shared';
import { FORCED_PRESTIGE_YEAR, FORCED_PRESTIGE_FREE_AT } from '../data/balance';

export const checkForcedPrestige = (state: GameState): GameState => {
  const { prestigeCount } = state.dynasty;
  const nextPrestigeNumber = prestigeCount + 1;

  // Prestige 7+: no forced transition
  if (nextPrestigeNumber >= FORCED_PRESTIGE_FREE_AT) {
    return state;
  }

  const forcedYear = FORCED_PRESTIGE_YEAR[nextPrestigeNumber];
  if (forcedYear === undefined) {
    return state;
  }

  const shouldTrigger = state.time.currentYear >= forcedYear;
  const alreadyTriggered = state.flags.forcedPrestigeTriggered;

  // No change needed
  if (!shouldTrigger || alreadyTriggered) {
    return state;
  }

  const event = {
    id: createId('evt'),
    tick: state.time.ticksElapsed,
    type: 'FORCED_PRESTIGE',
    message: `Year ${String(state.time.currentYear)} — the guild must transition to new leadership!`,
    achievementKey: null,
    causeId: null,
  } as const;

  return {
    ...state,
    flags: {
      ...state.flags,
      forcedPrestigeTriggered: true,
    },
    pendingEvents: [...state.pendingEvents, event],
  };
};
