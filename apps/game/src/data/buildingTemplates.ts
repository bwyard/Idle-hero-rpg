/**
 * buildingTemplates.ts — Static building template data.
 *
 * Building templates are static data referenced by ID. They are never stored
 * in the save file — only the template ID is saved on a Building instance.
 */

import type { VisitorServiceRequest } from '@idle-hero-rpg/shared';

/** Static definition of a building type. Not stored in the save file. */
export interface BuildingTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** Maximum level this building can reach. */
  readonly maxLevel: number;
  /** Visitor service this building enables (null if not service-related). */
  readonly enablesService: VisitorServiceRequest | null;
  /** Minimum building level required to enable the service. */
  readonly serviceMinLevel: number;
  /** Base gold income per tick per level. */
  readonly baseIncomePerLevel: number;
}

/** All available building templates, keyed by ID. */
export const BUILDING_TEMPLATES: Record<string, BuildingTemplate> = {
  'guild-hall': {
    id: 'guild-hall',
    name: 'Guild Hall',
    description:
      'The heart of the guild. Higher levels increase base income and adventurer capacity.',
    maxLevel: 10,
    enablesService: null,
    serviceMinLevel: 0,
    baseIncomePerLevel: 3,
  },
  'training-grounds': {
    id: 'training-grounds',
    name: 'Training Grounds',
    description: 'Where adventurers hone their skills. Enables training services for visitors.',
    maxLevel: 8,
    enablesService: 'Training',
    serviceMinLevel: 1,
    baseIncomePerLevel: 1,
  },
  tavern: {
    id: 'tavern',
    name: 'Tavern',
    description: 'A place of rest and stories. Provides lodging for visitors at level 2+.',
    maxLevel: 8,
    enablesService: 'Lodging',
    serviceMinLevel: 2,
    baseIncomePerLevel: 2,
  },
  smithy: {
    id: 'smithy',
    name: 'Smithy',
    description: 'Forges and repairs equipment. Enables repair services for visitors.',
    maxLevel: 6,
    enablesService: 'Repair',
    serviceMinLevel: 1,
    baseIncomePerLevel: 2,
  },
  infirmary: {
    id: 'infirmary',
    name: 'Infirmary',
    description: 'Heals the wounded and sick. Enables health services for visitors.',
    maxLevel: 6,
    enablesService: 'Health',
    serviceMinLevel: 1,
    baseIncomePerLevel: 1,
  },
  'quest-board': {
    id: 'quest-board',
    name: 'Quest Board',
    description:
      'Posts available quests for adventurers and visitors. Higher levels increase board capacity.',
    maxLevel: 5,
    enablesService: 'Quest',
    serviceMinLevel: 1,
    baseIncomePerLevel: 0,
  },
};
