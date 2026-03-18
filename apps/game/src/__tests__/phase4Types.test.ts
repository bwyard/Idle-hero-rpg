/**
 * Phase 4 shared type contract tests.
 *
 * These tests verify that the new Phase 4 types are correctly shaped
 * and that existing infrastructure accepts the new fields without error.
 * They serve as a compile-time + runtime guard: if types change
 * incompatibly, these tests break immediately.
 */

import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '../stores/initialState';
import type {
  Hero,
  HeroClass,
  HeroClassTemplate,
  HeroAbilityTemplate,
  LegacySkill,
  LegacySkillTemplate,
  LegacySkillId,
  DynastyState,
  GameAction,
  TriggerPrestigeAction,
  UseHeroAbilityAction,
  BorrowSkillAction,
} from '@idle-hero-rpg/shared';

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

describe('Hero type', () => {
  it('initial state hero has all Phase 4 fields', () => {
    const state = createInitialGameState();
    const hero = state.hero;

    expect(hero.maxActionPoints).toBeGreaterThan(0);
    expect(typeof hero.passiveAbilityId).toBe('string');
    expect(hero.passiveAbilityId.length).toBeGreaterThan(0);
    expect(typeof hero.milestoneAbilityId).toBe('string');
    expect(hero.milestoneAbilityId.length).toBeGreaterThan(0);
    expect(hero.milestoneUnlocked).toBe(false);
  });

  it('Hero type accepts all valid HeroClass values', () => {
    const heroClasses: HeroClass[] = ['Warblade', 'Wanderer', 'Archmage', 'Diplomat', 'Bard'];
    for (const heroClass of heroClasses) {
      const hero: Hero = {
        id: `hero-${heroClass}`,
        name: 'Test Hero',
        heroClass,
        actionPoints: 5,
        maxActionPoints: 10,
        passiveAbilityId: `${heroClass.toLowerCase()}-passive`,
        milestoneAbilityId: `${heroClass.toLowerCase()}-milestone`,
        milestoneUnlocked: false,
      };
      expect(hero.heroClass).toBe(heroClass);
    }
  });

  it('actionPoints does not exceed maxActionPoints constraint (runtime check)', () => {
    const state = createInitialGameState();
    expect(state.hero.actionPoints).toBeLessThanOrEqual(state.hero.maxActionPoints);
  });
});

// ---------------------------------------------------------------------------
// HeroClassTemplate
// ---------------------------------------------------------------------------

describe('HeroClassTemplate type', () => {
  it('accepts a valid HeroClassTemplate shape', () => {
    const template: HeroClassTemplate = {
      heroClass: 'Warblade',
      displayName: 'Warblade',
      description: 'A combat-focused hero class.',
      passiveAbilityId: 'warblade-passive',
      milestoneAbilityId: 'warblade-milestone',
      baseApRegenPerDay: 1,
    };
    expect(template.heroClass).toBe('Warblade');
    expect(template.baseApRegenPerDay).toBeGreaterThan(0);
  });

  it('HeroAbilityTemplate accepts passive and active kinds', () => {
    const passive: HeroAbilityTemplate = {
      id: 'warblade-passive',
      displayName: 'Battle Aura',
      description: 'Passive combat bonus.',
      kind: 'passive',
      apCost: 0,
    };
    const active: HeroAbilityTemplate = {
      id: 'warblade-milestone',
      displayName: 'War Cry',
      description: 'Active milestone ability.',
      kind: 'active',
      apCost: 2,
    };
    expect(passive.kind).toBe('passive');
    expect(passive.apCost).toBe(0);
    expect(active.kind).toBe('active');
    expect(active.apCost).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// LegacySkill
// ---------------------------------------------------------------------------

describe('LegacySkill types', () => {
  it('accepts a valid LegacySkillTemplate shape', () => {
    const template: LegacySkillTemplate = {
      id: 'veterans-eye',
      displayName: "Veteran's Eye",
      description: 'Increases XP gain for F-tier adventurers.',
      kind: 'passive',
      apCost: 0,
    };
    expect(template.id).toBe('veterans-eye');
  });

  it('LegacySkillId is a string', () => {
    const skillId: LegacySkillId = 'veterans-eye';
    expect(typeof skillId).toBe('string');
  });

  it('accepts a valid LegacySkill shape', () => {
    const skill: LegacySkill = {
      id: 'veterans-eye',
      earnedAtRunIndex: 0,
      skillBorrowUsed: false,
    };
    expect(skill.skillBorrowUsed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// DynastyState
// ---------------------------------------------------------------------------

describe('DynastyState', () => {
  it('initial state dynasty has legacySkills and unlockedHeroClasses', () => {
    const state = createInitialGameState();
    expect(Array.isArray(state.dynasty.legacySkills)).toBe(true);
    expect(state.dynasty.legacySkills).toHaveLength(0);
    expect(Array.isArray(state.dynasty.unlockedHeroClasses)).toBe(true);
    expect(state.dynasty.unlockedHeroClasses).toContain('Warblade');
  });

  it('DynastyState type is assignable from Dynasty (same shape)', () => {
    const state = createInitialGameState();
    const dynastyState: DynastyState = state.dynasty;
    expect(dynastyState.prestigeCount).toBe(0);
    expect(dynastyState.worldAwarenessTier).toBe('Hidden');
  });
});

// ---------------------------------------------------------------------------
// New Actions
// ---------------------------------------------------------------------------

describe('Phase 4 GameAction union', () => {
  it('TriggerPrestigeAction has correct type literal', () => {
    const action: TriggerPrestigeAction = { type: 'TRIGGER_PRESTIGE' };
    expect(action.type).toBe('TRIGGER_PRESTIGE');
  });

  it('UseHeroAbilityAction has correct shape', () => {
    const action: UseHeroAbilityAction = {
      type: 'USE_HERO_ABILITY',
      abilityId: 'warblade-milestone',
    };
    expect(action.type).toBe('USE_HERO_ABILITY');
    expect(action.abilityId).toBe('warblade-milestone');
  });

  it('BorrowSkillAction has correct shape', () => {
    const action: BorrowSkillAction = { type: 'BORROW_SKILL', skillId: 'veterans-eye' };
    expect(action.type).toBe('BORROW_SKILL');
    expect(action.skillId).toBe('veterans-eye');
  });

  it('all three new actions are valid GameAction values', () => {
    const actions: GameAction[] = [
      { type: 'TRIGGER_PRESTIGE' },
      { type: 'USE_HERO_ABILITY', abilityId: 'warblade-milestone' },
      { type: 'BORROW_SKILL', skillId: 'veterans-eye' },
    ];
    expect(actions).toHaveLength(3);
    expect(actions.map((a) => a.type)).toEqual([
      'TRIGGER_PRESTIGE',
      'USE_HERO_ABILITY',
      'BORROW_SKILL',
    ]);
  });
});
