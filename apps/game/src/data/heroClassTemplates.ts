/**
 * heroClassTemplates — Static hero class template registry.
 *
 * All 5 hero classes and their 10 associated abilities (5 passives + 5 milestone actives).
 * Templates are never stored in the save file — they are referenced by ID only.
 *
 * Numeric constants (AP regen rates, AP costs) live in balance.ts per architecture rules.
 * Ability effects are stubs — full implementations land when passive/active system is wired.
 */

import type { HeroClass, HeroClassTemplate, HeroAbilityTemplate } from '@idle-hero-rpg/shared';
import {
  PLACEHOLDER_WARBLADE_AP_REGEN_PER_DAY,
  PLACEHOLDER_WANDERER_AP_REGEN_PER_DAY,
  PLACEHOLDER_ARCHMAGE_AP_REGEN_PER_DAY,
  PLACEHOLDER_DIPLOMAT_AP_REGEN_PER_DAY,
  PLACEHOLDER_BARD_AP_REGEN_PER_DAY,
  MASTER_MENTOR_ACTION_POINT_COST,
} from './balance';

// ─── Hero Ability Templates ──────────────────────────────────────────────────

/**
 * All 10 hero ability templates — 5 passives and 5 milestone actives.
 * Descriptions are placeholder flavour; effects are engine stubs pending
 * full passive/active system design.
 */
export const HERO_ABILITY_TEMPLATES: Record<string, HeroAbilityTemplate> = {
  // ── Warblade ──────────────────────────────────────────────────────────────
  'warblade-passive': {
    id: 'warblade-passive',
    displayName: 'Battle Hardened',
    description:
      'Years of combat sharpen your instincts. Adventurers under your watch gain a small bonus to XP from dangerous quests.',
    kind: 'passive',
    apCost: 0,
  },
  'warblade-milestone': {
    id: 'warblade-milestone',
    displayName: 'War Cry',
    description:
      'Rally your guild with a legendary battle cry. For a short time, all adventurers deal increased damage and resist setbacks.',
    kind: 'active',
    apCost: 2,
  },

  // ── Wanderer ──────────────────────────────────────────────────────────────
  'wanderer-passive': {
    id: 'wanderer-passive',
    displayName: 'Eyes of the Road',
    description:
      'You have travelled every road in the kingdom. Adventurers on exploration quests complete them faster.',
    kind: 'passive',
    apCost: 0,
  },
  'wanderer-milestone': {
    id: 'wanderer-milestone',
    displayName: 'Trail Blazer',
    description:
      'Open a hidden route to a region no other guild has mapped, temporarily unlocking a rare quest board.',
    kind: 'active',
    apCost: 2,
  },

  // ── Archmage ──────────────────────────────────────────────────────────────
  'archmage-passive': {
    id: 'archmage-passive',
    displayName: 'Arcane Resonance',
    description:
      'Your presence charges the guild with magical potential. Mage-archetype adventurers gain bonus ambient XP.',
    kind: 'passive',
    apCost: 0,
  },
  'archmage-milestone': {
    id: 'archmage-milestone',
    displayName: 'Ley Line Surge',
    description:
      'Channel a ley line directly through the guild hall. All buildings produce bonus income for the next in-game season.',
    kind: 'active',
    apCost: 2,
  },

  // ── Diplomat ──────────────────────────────────────────────────────────────
  'diplomat-passive': {
    id: 'diplomat-passive',
    displayName: 'Silver Tongue',
    description:
      'Your reputation precedes you. Transient visitors arrive more frequently and stay longer before departing.',
    kind: 'passive',
    apCost: 0,
  },
  'diplomat-milestone': {
    id: 'diplomat-milestone',
    displayName: 'Treaty of Alliance',
    description:
      'Negotiate a formal alliance with a rival guild, reducing their aggression and gaining a temporary reputation boost.',
    kind: 'active',
    apCost: 2,
  },

  // ── Bard ──────────────────────────────────────────────────────────────────
  'bard-passive': {
    id: 'bard-passive',
    displayName: 'Tales of Glory',
    description:
      "Your songs spread the guild's legend. Guild reputation grows slightly each tick from word-of-mouth alone.",
    kind: 'passive',
    apCost: 0,
  },
  'bard-milestone': {
    id: 'bard-milestone',
    displayName: 'Master Mentor',
    description:
      'Guide a promising adventurer with legendary insight, accelerating their path to the next tier milestone.',
    kind: 'active',
    apCost: MASTER_MENTOR_ACTION_POINT_COST,
  },
};

// ─── Hero Class Templates ────────────────────────────────────────────────────

/**
 * Static registry of all 5 hero class templates.
 * Keyed by HeroClass for compile-time exhaustiveness.
 */
export const HERO_CLASS_TEMPLATES: Record<HeroClass, HeroClassTemplate> = {
  Warblade: {
    heroClass: 'Warblade',
    displayName: 'Warblade',
    description:
      'A veteran fighter who spent a lifetime on the front lines. Leads through strength and inspires adventurers to push beyond their limits.',
    passiveAbilityId: 'warblade-passive',
    milestoneAbilityId: 'warblade-milestone',
    baseApRegenPerDay: PLACEHOLDER_WARBLADE_AP_REGEN_PER_DAY,
  },

  Wanderer: {
    heroClass: 'Wanderer',
    displayName: 'Wanderer',
    description:
      'A seasoned explorer who has mapped every corner of the known world. Knowledge of hidden paths gives their guild a constant edge.',
    passiveAbilityId: 'wanderer-passive',
    milestoneAbilityId: 'wanderer-milestone',
    baseApRegenPerDay: PLACEHOLDER_WANDERER_AP_REGEN_PER_DAY,
  },

  Archmage: {
    heroClass: 'Archmage',
    displayName: 'Archmage',
    description:
      'A towering intellect who once shook the capital with arcane experiments. Now channels that power into building the most magically potent guild in history.',
    passiveAbilityId: 'archmage-passive',
    milestoneAbilityId: 'archmage-milestone',
    baseApRegenPerDay: PLACEHOLDER_ARCHMAGE_AP_REGEN_PER_DAY,
  },

  Diplomat: {
    heroClass: 'Diplomat',
    displayName: 'Diplomat',
    description:
      'A master of courts and back-channels who turned wars into treaties. Uses influence and relationship-building to grow the guild through alliances.',
    passiveAbilityId: 'diplomat-passive',
    milestoneAbilityId: 'diplomat-milestone',
    baseApRegenPerDay: PLACEHOLDER_DIPLOMAT_AP_REGEN_PER_DAY,
  },

  Bard: {
    heroClass: 'Bard',
    displayName: 'Bard',
    description:
      'A legendary performer whose stories shaped history. Weaves influence through song and story, making the guild famous across the kingdom.',
    passiveAbilityId: 'bard-passive',
    milestoneAbilityId: 'bard-milestone',
    baseApRegenPerDay: PLACEHOLDER_BARD_AP_REGEN_PER_DAY,
  },
};
