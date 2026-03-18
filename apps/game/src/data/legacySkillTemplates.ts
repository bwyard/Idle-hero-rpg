/**
 * legacySkillTemplates — Static legacy skill template registry.
 *
 * Legacy skills are awarded during prestige cycles and persist across runs
 * via DynastyState.legacySkills. Skills are referenced by ID only in the save file.
 *
 * This file contains 7 placeholder skills covering passive and active varieties
 * across different guild archetypes. Descriptions are thematic stubs.
 *
 * Full effect implementations are future engine work (Conclave system).
 */

import type { LegacySkillTemplate } from '@idle-hero-rpg/shared';

/**
 * Static registry of all legacy skill templates.
 * Keyed by LegacySkillId (free-form string).
 */
export const LEGACY_SKILL_TEMPLATES: Record<string, LegacySkillTemplate> = {
  'legacy-iron-discipline': {
    id: 'legacy-iron-discipline',
    displayName: 'Iron Discipline',
    description:
      'The guild operates with military precision. Adventurers lose less XP from failed quests.',
    kind: 'passive',
    apCost: 0,
  },

  'legacy-silver-network': {
    id: 'legacy-silver-network',
    displayName: 'Silver Network',
    description:
      'Contacts from a dynasty of diplomats. Once per Conclave, broker a trade deal that boosts gold income for a season.',
    kind: 'active',
    apCost: 1,
  },

  'legacy-ancient-lore': {
    id: 'legacy-ancient-lore',
    displayName: 'Ancient Lore',
    description:
      'Generations of accumulated arcane wisdom. Mage-archetype adventurers begin each run with a small head start on XP.',
    kind: 'passive',
    apCost: 0,
  },

  'legacy-cartographers-eye': {
    id: 'legacy-cartographers-eye',
    displayName: "Cartographer's Eye",
    description:
      'The dynasty mapped roads others feared. Exploration quests complete one day faster across all future runs.',
    kind: 'passive',
    apCost: 0,
  },

  'legacy-battle-anthem': {
    id: 'legacy-battle-anthem',
    displayName: 'Battle Anthem',
    description:
      'A rousing song passed down through leaders. Once per Conclave, play the anthem to grant all adventurers a temporary XP surge.',
    kind: 'active',
    apCost: 2,
  },

  'legacy-guild-pride': {
    id: 'legacy-guild-pride',
    displayName: 'Guild Pride',
    description:
      "The dynasty's long history inspires loyalty. New recruits start with higher starting xp and lower attrition in the first year.",
    kind: 'passive',
    apCost: 0,
  },

  'legacy-shadow-routes': {
    id: 'legacy-shadow-routes',
    displayName: 'Shadow Routes',
    description:
      "Knowledge of every smuggler's path and secret passage. Once per Conclave, move an adventurer between cities instantly.",
    kind: 'active',
    apCost: 1,
  },
};
