/**
 * initialState — Factory for a fresh GameState.
 *
 * Returns the default state for a brand-new run (no save data).
 * Static template data is NOT stored here — it is referenced by ID only.
 */

import type { GameState } from '@idle-hero-rpg/shared';

export function createInitialGameState(): GameState {
  return {
    version: 1,
    time: {
      ticksElapsed: 0,
    },
    hero: {
      id: 'hero-001',
      name: '',
      heroClass: 'Warblade',
      actionPoints: 3,
    },
    guild: {
      name: '',
      type: 'Combat',
      gold: 0,
      reputation: 0,
    },
    adventurers: {},
    cities: {},
    buildings: {},
    quests: {},
    dynasty: {
      prestigeCount: 0,
      worldAwarenessTier: 'Hidden',
      permanentBonuses: {},
      hallOfHeroes: [],
    },
    rivals: {},
    eventLog: [],
    pendingEvents: [],
    flags: {
      prestigeAvailable: false,
    },
  };
}
