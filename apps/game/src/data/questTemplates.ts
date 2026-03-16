/**
 * questTemplates.ts — Static quest template data.
 *
 * Quest templates are static data referenced by ID. They are never stored
 * in the save file — only the template ID is saved on a Quest instance.
 */

import type { Region, AdventurerTier } from '@idle-hero-rpg/shared';
import {
  PLACEHOLDER_QUEST_DURATION_DAYS,
  PLACEHOLDER_QUEST_GOLD_REWARD,
  PLACEHOLDER_QUEST_XP_REWARD,
} from './balance';

/** Static definition of a quest type. Not stored in the save file. */
export interface QuestTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly region: Region;
  readonly minTier: AdventurerTier;
  readonly baseDurationDays: number;
  readonly baseGoldReward: number;
  readonly baseXpReward: number;
}

/** All available quest templates, keyed by ID. */
export const QUEST_TEMPLATES: Record<string, QuestTemplate> = {
  'quest-tpl-heartlands-patrol': {
    id: 'quest-tpl-heartlands-patrol',
    name: 'Patrol the Heartlands',
    description: 'Walk the trade roads and clear out bandits threatening local merchants.',
    region: 'Heartlands',
    minTier: 'F',
    baseDurationDays: PLACEHOLDER_QUEST_DURATION_DAYS,
    baseGoldReward: PLACEHOLDER_QUEST_GOLD_REWARD,
    baseXpReward: PLACEHOLDER_QUEST_XP_REWARD,
  },
  'quest-tpl-heartlands-escort': {
    id: 'quest-tpl-heartlands-escort',
    name: 'Escort Merchant Caravan',
    description: 'Guard a merchant caravan traveling through the Heartlands.',
    region: 'Heartlands',
    minTier: 'F',
    baseDurationDays: PLACEHOLDER_QUEST_DURATION_DAYS,
    baseGoldReward: PLACEHOLDER_QUEST_GOLD_REWARD,
    baseXpReward: PLACEHOLDER_QUEST_XP_REWARD,
  },
  'quest-tpl-coast-scout': {
    id: 'quest-tpl-coast-scout',
    name: 'Scout the Coast',
    description: 'Survey the coastal cliffs for signs of smuggler activity.',
    region: 'Coast',
    minTier: 'F',
    baseDurationDays: PLACEHOLDER_QUEST_DURATION_DAYS,
    baseGoldReward: PLACEHOLDER_QUEST_GOLD_REWARD,
    baseXpReward: PLACEHOLDER_QUEST_XP_REWARD,
  },
  'quest-tpl-coast-salvage': {
    id: 'quest-tpl-coast-salvage',
    name: 'Salvage Shipwreck Cargo',
    description: 'Recover valuable cargo from a wrecked merchant vessel near shore.',
    region: 'Coast',
    minTier: 'E',
    baseDurationDays: PLACEHOLDER_QUEST_DURATION_DAYS,
    baseGoldReward: PLACEHOLDER_QUEST_GOLD_REWARD,
    baseXpReward: PLACEHOLDER_QUEST_XP_REWARD,
  },
  'quest-tpl-mountains-clear': {
    id: 'quest-tpl-mountains-clear',
    name: 'Clear the Mountain Pass',
    description: 'Defeat the monsters blocking the main mountain trade route.',
    region: 'Mountains',
    minTier: 'D',
    baseDurationDays: PLACEHOLDER_QUEST_DURATION_DAYS,
    baseGoldReward: PLACEHOLDER_QUEST_GOLD_REWARD,
    baseXpReward: PLACEHOLDER_QUEST_XP_REWARD,
  },
  'quest-tpl-mountains-mine': {
    id: 'quest-tpl-mountains-mine',
    name: 'Explore Abandoned Mine',
    description: 'Investigate reports of strange noises from a disused mine shaft.',
    region: 'Mountains',
    minTier: 'D',
    baseDurationDays: PLACEHOLDER_QUEST_DURATION_DAYS,
    baseGoldReward: PLACEHOLDER_QUEST_GOLD_REWARD,
    baseXpReward: PLACEHOLDER_QUEST_XP_REWARD,
  },
  'quest-tpl-wilds-expedition': {
    id: 'quest-tpl-wilds-expedition',
    name: 'Wilds Expedition',
    description: 'Map uncharted territory deep in the Wilds beyond the frontier.',
    region: 'Wilds',
    minTier: 'C',
    baseDurationDays: PLACEHOLDER_QUEST_DURATION_DAYS,
    baseGoldReward: PLACEHOLDER_QUEST_GOLD_REWARD,
    baseXpReward: PLACEHOLDER_QUEST_XP_REWARD,
  },
  'quest-tpl-wilds-beast': {
    id: 'quest-tpl-wilds-beast',
    name: 'Hunt the Great Beast',
    description: 'Track and subdue a dangerous creature terrorizing frontier settlements.',
    region: 'Wilds',
    minTier: 'C',
    baseDurationDays: PLACEHOLDER_QUEST_DURATION_DAYS,
    baseGoldReward: PLACEHOLDER_QUEST_GOLD_REWARD,
    baseXpReward: PLACEHOLDER_QUEST_XP_REWARD,
  },
  'quest-tpl-capital-diplomacy': {
    id: 'quest-tpl-capital-diplomacy',
    name: 'Capital Diplomatic Mission',
    description: 'Represent the guild at a formal audience with the capital council.',
    region: 'CapitalRegion',
    minTier: 'B',
    baseDurationDays: PLACEHOLDER_QUEST_DURATION_DAYS,
    baseGoldReward: PLACEHOLDER_QUEST_GOLD_REWARD,
    baseXpReward: PLACEHOLDER_QUEST_XP_REWARD,
  },
  'quest-tpl-capital-tournament': {
    id: 'quest-tpl-capital-tournament',
    name: 'Capital Tournament',
    description: 'Compete in the grand tournament held in the capital arena.',
    region: 'CapitalRegion',
    minTier: 'B',
    baseDurationDays: PLACEHOLDER_QUEST_DURATION_DAYS,
    baseGoldReward: PLACEHOLDER_QUEST_GOLD_REWARD,
    baseXpReward: PLACEHOLDER_QUEST_XP_REWARD,
  },
};
