import { describe, it, expect } from 'vitest';
import { HERO_CLASS_TEMPLATES, HERO_ABILITY_TEMPLATES } from '../heroClassTemplates';
import type { HeroClass } from '@idle-hero-rpg/shared';

const ALL_HERO_CLASSES: HeroClass[] = ['Warblade', 'Wanderer', 'Archmage', 'Diplomat', 'Bard'];

describe('HERO_CLASS_TEMPLATES', () => {
  it('contains all 5 hero classes', () => {
    for (const heroClass of ALL_HERO_CLASSES) {
      expect(HERO_CLASS_TEMPLATES[heroClass]).toBeDefined();
    }
  });

  it('each class has a displayName and description', () => {
    for (const heroClass of ALL_HERO_CLASSES) {
      const template = HERO_CLASS_TEMPLATES[heroClass];
      expect(template.displayName.length).toBeGreaterThan(0);
      expect(template.description.length).toBeGreaterThan(0);
    }
  });

  it('each class has a passiveAbilityId and milestoneAbilityId', () => {
    for (const heroClass of ALL_HERO_CLASSES) {
      const template = HERO_CLASS_TEMPLATES[heroClass];
      expect(template.passiveAbilityId.length).toBeGreaterThan(0);
      expect(template.milestoneAbilityId.length).toBeGreaterThan(0);
    }
  });

  it('each class has a positive baseApRegenPerDay', () => {
    for (const heroClass of ALL_HERO_CLASSES) {
      const template = HERO_CLASS_TEMPLATES[heroClass];
      expect(template.baseApRegenPerDay).toBeGreaterThan(0);
    }
  });

  it('heroClass field matches registry key', () => {
    for (const heroClass of ALL_HERO_CLASSES) {
      expect(HERO_CLASS_TEMPLATES[heroClass].heroClass).toBe(heroClass);
    }
  });

  it('all passiveAbilityIds resolve in HERO_ABILITY_TEMPLATES', () => {
    for (const heroClass of ALL_HERO_CLASSES) {
      const { passiveAbilityId } = HERO_CLASS_TEMPLATES[heroClass];
      expect(
        HERO_ABILITY_TEMPLATES[passiveAbilityId],
        `Expected passiveAbilityId "${passiveAbilityId}" to exist in HERO_ABILITY_TEMPLATES`,
      ).toBeDefined();
    }
  });

  it('all milestoneAbilityIds resolve in HERO_ABILITY_TEMPLATES', () => {
    for (const heroClass of ALL_HERO_CLASSES) {
      const { milestoneAbilityId } = HERO_CLASS_TEMPLATES[heroClass];
      expect(
        HERO_ABILITY_TEMPLATES[milestoneAbilityId],
        `Expected milestoneAbilityId "${milestoneAbilityId}" to exist in HERO_ABILITY_TEMPLATES`,
      ).toBeDefined();
    }
  });
});

describe('HERO_ABILITY_TEMPLATES', () => {
  it('contains exactly 10 entries (5 passives + 5 milestone actives)', () => {
    expect(Object.keys(HERO_ABILITY_TEMPLATES)).toHaveLength(10);
  });

  it('all passive abilities have apCost 0', () => {
    const passives = Object.values(HERO_ABILITY_TEMPLATES).filter((a) => a.kind === 'passive');
    for (const passive of passives) {
      expect(passive.apCost).toBe(0);
    }
  });

  it('all active abilities have apCost > 0', () => {
    const actives = Object.values(HERO_ABILITY_TEMPLATES).filter((a) => a.kind === 'active');
    for (const active of actives) {
      expect(active.apCost).toBeGreaterThan(0);
    }
  });

  it('each ability has a non-empty displayName and description', () => {
    for (const ability of Object.values(HERO_ABILITY_TEMPLATES)) {
      expect(ability.displayName.length).toBeGreaterThan(0);
      expect(ability.description.length).toBeGreaterThan(0);
    }
  });

  it('each ability id matches its registry key', () => {
    for (const [key, ability] of Object.entries(HERO_ABILITY_TEMPLATES)) {
      expect(ability.id).toBe(key);
    }
  });

  it('contains exactly 5 passives', () => {
    const passives = Object.values(HERO_ABILITY_TEMPLATES).filter((a) => a.kind === 'passive');
    expect(passives).toHaveLength(5);
  });

  it('contains exactly 5 milestone actives', () => {
    const actives = Object.values(HERO_ABILITY_TEMPLATES).filter((a) => a.kind === 'active');
    expect(actives).toHaveLength(5);
  });
});
