/**
 * initialState — Factory for a fresh GameState.
 *
 * Returns the default state for a brand-new run (no save data).
 * Static template data is NOT stored here — it is referenced by ID only.
 */

import type { GameState } from '@idle-hero-rpg/shared';
import { PLACEHOLDER_STARTING_GOLD } from '../data/balance';

export function createInitialGameState(): GameState {
  return {
    version: 1,
    time: {
      ticksElapsed: 0,
      currentDay: 0,
      currentSeason: 'Spring',
      currentYear: 0,
    },
    hero: {
      id: 'hero-001',
      name: 'Aldric',
      heroClass: 'Warblade',
      actionPoints: 3,
    },
    guild: {
      name: 'The Iron Hearth',
      type: 'Combat',
      gold: PLACEHOLDER_STARTING_GOLD, // placeholder — tune during balance pass
      reputation: 0,
    },
    adventurers: {
      adv_starter_1: {
        id: 'adv_starter_1',
        name: 'Kira',
        tier: 'F',
        archetype: 'Fighter',
        xp: 0,
        milestones: [],
        skillBorrowUsed: false,
        recruitedYear: 0,
        retiredYear: null,
      },
      adv_starter_2: {
        id: 'adv_starter_2',
        name: 'Tomas',
        tier: 'F',
        archetype: 'Mage',
        xp: 0,
        milestones: [],
        skillBorrowUsed: false,
        recruitedYear: 0,
        retiredYear: null,
      },
    },
    transientVisitors: {},
    cities: {
      cty_heartlands: {
        id: 'cty_heartlands',
        name: 'Millhaven',
        region: 'Heartlands',
        isUnlocked: true,
      },
    },
    buildings: {
      bld_guildhall: {
        id: 'bld_guildhall',
        templateId: 'guild-hall',
        level: 1,
        cityId: 'cty_heartlands',
        upgradeTicksRemaining: 0,
      },
    },
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
