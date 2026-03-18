import { describe, it, expect, beforeEach } from 'vitest';
import { useDynastyStore } from '../dynastyStore';
import type { DynastyState } from '@idle-hero-rpg/shared';

/** A valid DynastyState fixture for use in tests. */
const sampleDynasty: DynastyState = {
  prestigeCount: 3,
  worldAwarenessTier: 'Regional',
  permanentBonuses: { goldPerTick: 5 },
  hallOfHeroes: [
    {
      adventurerId: 'adv_001',
      name: 'Lyra the Swift',
      heroClass: 'Wanderer',
      highestTierReached: 'S',
      runIndex: 1,
    },
  ],
  legacySkills: ['skill_iron_will', 'skill_keen_eye'],
  unlockedHeroClasses: ['Warblade', 'Wanderer'],
};

describe('useDynastyStore', () => {
  beforeEach(() => {
    // Reset store state between tests
    useDynastyStore.getState().resetDynasty();
  });

  it('starts with dynasty as null', () => {
    expect(useDynastyStore.getState().dynasty).toBeNull();
  });

  it('loadDynasty sets the dynasty data', () => {
    useDynastyStore.getState().loadDynasty(sampleDynasty);
    expect(useDynastyStore.getState().dynasty).toEqual(sampleDynasty);
  });

  it('resetDynasty returns dynasty to null', () => {
    useDynastyStore.getState().loadDynasty(sampleDynasty);
    useDynastyStore.getState().resetDynasty();
    expect(useDynastyStore.getState().dynasty).toBeNull();
  });

  it('loaded dynasty has correct prestigeCount', () => {
    useDynastyStore.getState().loadDynasty(sampleDynasty);
    expect(useDynastyStore.getState().dynasty?.prestigeCount).toBe(3);
  });

  it('loaded dynasty has correct worldAwarenessTier', () => {
    useDynastyStore.getState().loadDynasty(sampleDynasty);
    expect(useDynastyStore.getState().dynasty?.worldAwarenessTier).toBe('Regional');
  });

  it('loaded dynasty has correct legacySkills', () => {
    useDynastyStore.getState().loadDynasty(sampleDynasty);
    expect(useDynastyStore.getState().dynasty?.legacySkills).toEqual([
      'skill_iron_will',
      'skill_keen_eye',
    ]);
  });

  it('loaded dynasty has correct unlockedHeroClasses', () => {
    useDynastyStore.getState().loadDynasty(sampleDynasty);
    expect(useDynastyStore.getState().dynasty?.unlockedHeroClasses).toEqual([
      'Warblade',
      'Wanderer',
    ]);
  });

  it('loaded dynasty has correct hallOfHeroes shape', () => {
    useDynastyStore.getState().loadDynasty(sampleDynasty);
    const hall = useDynastyStore.getState().dynasty?.hallOfHeroes;
    expect(hall).toHaveLength(1);
    expect(hall?.[0]?.name).toBe('Lyra the Swift');
    expect(hall?.[0]?.heroClass).toBe('Wanderer');
    expect(hall?.[0]?.highestTierReached).toBe('S');
  });

  it('loadDynasty replaces any previously loaded dynasty', () => {
    const firstDynasty: DynastyState = {
      ...sampleDynasty,
      prestigeCount: 1,
      worldAwarenessTier: 'Hidden',
    };
    useDynastyStore.getState().loadDynasty(firstDynasty);
    useDynastyStore.getState().loadDynasty(sampleDynasty);
    expect(useDynastyStore.getState().dynasty?.prestigeCount).toBe(3);
    expect(useDynastyStore.getState().dynasty?.worldAwarenessTier).toBe('Regional');
  });
});
