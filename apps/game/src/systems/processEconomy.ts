/**
 * processEconomy — System 2 of 12 in the tick pipe.
 *
 * Calculates gold income from all sources and applies expenses.
 *
 * TODO: Economy values are stubs pending the dedicated design pass.
 *       See balance.ts for TODO-marked constants.
 *
 * Pure function — no mutations, no side effects.
 */

import type { GameState } from '@idle-hero-rpg/shared';

export function processEconomy(state: GameState): GameState {
  // TODO: Implement gold income from buildings (per level, active vs passive)
  // TODO: Implement gold expenses (recruitment, feasts, building upgrades)
  // TODO: Implement Magic Rewind safety mechanic for early prestiges
  // TODO: Implement negative gold consequences for late prestiges
  return state;
}
