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
  /** Gold income earned per tick per building level. */
  readonly baseIncomePerLevel: number;
  /**
   * Base gold cost coefficient for upgrades. Total cost = upgradeCostBase × targetLevel².
   * Higher values make this building expensive to invest in.
   */
  readonly upgradeCostBase: number;
  /**
   * Base tick duration coefficient for upgrades. Total duration = upgradeDurationBaseTicks × targetLevel.
   * Higher values mean longer construction time at each level.
   */
  readonly upgradeDurationBaseTicks: number;
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
    upgradeCostBase: 150,
    upgradeDurationBaseTicks: 80,
  },
  'training-grounds': {
    id: 'training-grounds',
    name: 'Training Grounds',
    description: 'Where adventurers hone their skills. Enables training services for visitors.',
    maxLevel: 8,
    enablesService: 'Training',
    serviceMinLevel: 1,
    baseIncomePerLevel: 1,
    upgradeCostBase: 100,
    upgradeDurationBaseTicks: 60,
  },
  tavern: {
    id: 'tavern',
    name: 'Tavern',
    description: 'A place of rest and stories. Provides lodging for visitors at level 2+.',
    maxLevel: 8,
    enablesService: 'Lodging',
    serviceMinLevel: 2,
    baseIncomePerLevel: 2,
    upgradeCostBase: 120,
    upgradeDurationBaseTicks: 70,
  },
  smithy: {
    id: 'smithy',
    name: 'Smithy',
    description: 'Forges and repairs equipment. Enables repair services for visitors.',
    maxLevel: 6,
    enablesService: 'Repair',
    serviceMinLevel: 1,
    baseIncomePerLevel: 2,
    upgradeCostBase: 90,
    upgradeDurationBaseTicks: 50,
  },
  infirmary: {
    id: 'infirmary',
    name: 'Infirmary',
    description: 'Heals the wounded and sick. Enables health services for visitors.',
    maxLevel: 6,
    enablesService: 'Health',
    serviceMinLevel: 1,
    baseIncomePerLevel: 1,
    upgradeCostBase: 80,
    upgradeDurationBaseTicks: 50,
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
    upgradeCostBase: 60,
    upgradeDurationBaseTicks: 30,
  },
  dormitory: {
    id: 'dormitory',
    name: 'Dormitory',
    description:
      'Shared sleeping quarters for guild members. Each level increases dorm capacity by 2.',
    maxLevel: 8,
    enablesService: null,
    serviceMinLevel: 0,
    baseIncomePerLevel: 0,
    upgradeCostBase: 80,
    upgradeDurationBaseTicks: 40,
  },
};
