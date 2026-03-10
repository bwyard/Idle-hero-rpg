/**
 * processAdventurers — System 3 of 12 in the tick pipe.
 *
 * Advances adventurer progression, handles tier-ups, retirements,
 * and legacy events.
 *
 * Pure function — no mutations, no side effects.
 */

import type { GameState } from '@idle-hero-rpg/shared';

export function processAdventurers(state: GameState): GameState {
  // TODO: Implement adventurer XP gain per tick
  // TODO: Implement tier advancement (F → E → D → C → B → A → S → SS → Legendary)
  // TODO: Implement retirement logic for Legendary adventurers
  // TODO: Implement prestige trigger when Legendary adventurer retires
  return state;
}
