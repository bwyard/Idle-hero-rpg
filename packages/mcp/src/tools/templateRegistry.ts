/**
 * template_registry — Query static data templates.
 *
 * Returns hero class definitions, building templates, quest templates,
 * and adventurer archetypes. This data is static — never stored in the save file.
 *
 * Template IDs and values are placeholders pending the dedicated design passes
 * for economy and quest systems. Do not rely on numeric values here for balance.
 */

import { z } from 'zod';

// ─── Hero Classes ─────────────────────────────────────────────────────────────

const HERO_CLASS_TEMPLATES = {
  Warblade: {
    id: 'Warblade',
    passiveAbility: 'Iron Discipline — combat adventurers in this guild gain +10% milestone XP',
    careerMilestoneActiveAbility: 'War Council — once per Conclave, double combat quest yield for 5 ticks',
    guildSynergy: 'Combat',
    notes: 'Combat focus. Natural synergy with Combat guild type.',
  },
  Wanderer: {
    id: 'Wanderer',
    passiveAbility: 'Trailblazer — exploration quests complete 15% faster',
    careerMilestoneActiveAbility: 'Pathfinder\'s Mark — unlock one additional region location per run',
    guildSynergy: 'Knowledge',
    notes: 'Exploration focus. Natural synergy with Knowledge guild type.',
  },
  Archmage: {
    id: 'Archmage',
    passiveAbility: 'Arcane Resonance — magic-archetype adventurers gain +1 tier progress per Conclave',
    careerMilestoneActiveAbility: 'Grand Ritual — once per run, instantly advance one adventurer one full tier',
    guildSynergy: 'Knowledge',
    notes: 'Magic focus. Natural synergy with Knowledge guild type.',
  },
  Diplomat: {
    id: 'Diplomat',
    passiveAbility: 'Silver Tongue — rival guild relationship decay rate halved',
    careerMilestoneActiveAbility: 'Treaty of Peers — freeze one rival guild\'s aggression for 10 ticks',
    guildSynergy: 'Hospitality',
    notes: 'Relations focus. Natural synergy with Hospitality guild type.',
  },
  Bard: {
    id: 'Bard',
    passiveAbility: 'Living Legend — world awareness tier unlocks one prestige earlier than standard',
    careerMilestoneActiveAbility: 'Epic Ballad — once per Conclave, gain a permanent reputation bonus equal to current tick count',
    guildSynergy: 'Merchant',
    notes: 'Influence focus. Natural synergy with Merchant guild type.',
  },
} as const;

// ─── Building Templates ───────────────────────────────────────────────────────

const BUILDING_TEMPLATES = {
  'guild-hall': {
    id: 'guild-hall',
    name: 'Guild Hall',
    maxLevel: 5,
    description: 'The seat of guild operations. Required in every city.',
    // TODO: Upgrade costs and yield rates pending economy design pass.
    goldYieldPerTickPerLevel: 0,
    goldUpgradeCostBase: 0,
  },
  'training-grounds': {
    id: 'training-grounds',
    name: 'Training Grounds',
    maxLevel: 5,
    description: 'Speeds adventurer tier progression within this city.',
    goldYieldPerTickPerLevel: 0,
    goldUpgradeCostBase: 0,
  },
  'market-stall': {
    id: 'market-stall',
    name: 'Market Stall',
    maxLevel: 3,
    description: 'Generates passive gold income. Synergises with Merchant guild type.',
    goldYieldPerTickPerLevel: 0,
    goldUpgradeCostBase: 0,
  },
  'tavern': {
    id: 'tavern',
    name: 'Tavern',
    maxLevel: 3,
    description: 'Increases adventurer recruitment rate and feast effectiveness.',
    goldYieldPerTickPerLevel: 0,
    goldUpgradeCostBase: 0,
  },
  'archive': {
    id: 'archive',
    name: 'Archive',
    maxLevel: 4,
    description: 'Unlocks Knowledge-class quests and increases quest discovery rate.',
    goldYieldPerTickPerLevel: 0,
    goldUpgradeCostBase: 0,
  },
} as const;

// ─── Quest Templates ──────────────────────────────────────────────────────────

const QUEST_TEMPLATES = {
  'slay-bandit-camp': {
    id: 'slay-bandit-camp',
    name: 'Clear the Bandit Camp',
    type: 'Combat',
    minAdventurerTier: 'F',
    description: 'Drive out a nearby bandit encampment. Basic combat income.',
    // TODO: Gold reward and duration pending economy design pass.
    goldReward: 0,
    durationTicks: 10,
    xpReward: 'low',
  },
  'scout-ruins': {
    id: 'scout-ruins',
    name: 'Scout Ancient Ruins',
    type: 'Exploration',
    minAdventurerTier: 'E',
    description: 'Survey a ruin site. May reveal a new location.',
    goldReward: 0,
    durationTicks: 20,
    xpReward: 'medium',
  },
  'diplomatic-escort': {
    id: 'diplomatic-escort',
    name: 'Diplomatic Escort',
    type: 'Relations',
    minAdventurerTier: 'D',
    description: 'Escort a city dignitary to the capital. Improves rival guild relations.',
    goldReward: 0,
    durationTicks: 30,
    xpReward: 'low',
  },
  'retrieve-artefact': {
    id: 'retrieve-artefact',
    name: 'Retrieve the Artefact',
    type: 'Knowledge',
    minAdventurerTier: 'C',
    description: 'Recover a lost magical artefact. High XP, modest gold.',
    goldReward: 0,
    durationTicks: 40,
    xpReward: 'high',
  },
} as const;

// ─── Adventurer Archetypes ────────────────────────────────────────────────────

const ADVENTURER_ARCHETYPE_TEMPLATES = {
  Fighter: {
    id: 'Fighter',
    description: 'Specialises in direct combat quests. Gains bonus tier XP from slay-type quests.',
    preferredQuestTypes: ['Combat'],
    heroClassAffinities: ['Warblade'],
  },
  Scout: {
    id: 'Scout',
    description: 'Excels at exploration. Faster quest completion on scouting missions.',
    preferredQuestTypes: ['Exploration'],
    heroClassAffinities: ['Wanderer'],
  },
  Mage: {
    id: 'Mage',
    description: 'High XP gain on Knowledge quests. Slower progression on Combat quests.',
    preferredQuestTypes: ['Knowledge'],
    heroClassAffinities: ['Archmage'],
  },
  Envoy: {
    id: 'Envoy',
    description: 'Gains bonus reputation from Relations quests.',
    preferredQuestTypes: ['Relations'],
    heroClassAffinities: ['Diplomat', 'Bard'],
  },
  Generalist: {
    id: 'Generalist',
    description: 'No strong affinities. Steady progression across all quest types.',
    preferredQuestTypes: ['Combat', 'Exploration', 'Knowledge', 'Relations'],
    heroClassAffinities: [],
  },
} as const;

// ─── Registry map ─────────────────────────────────────────────────────────────

type TemplateType = 'heroClass' | 'building' | 'quest' | 'adventurerArchetype';

const REGISTRY: Record<TemplateType, Record<string, unknown>> = {
  heroClass: HERO_CLASS_TEMPLATES,
  building: BUILDING_TEMPLATES,
  quest: QUEST_TEMPLATES,
  adventurerArchetype: ADVENTURER_ARCHETYPE_TEMPLATES,
};

const inputSchema = z.object({
  type: z
    .enum(['heroClass', 'building', 'quest', 'adventurerArchetype'])
    .describe('The type of template to query'),
  id: z
    .string()
    .optional()
    .describe('Specific template ID to fetch (omit to list all of the given type)'),
});

export const templateRegistry = {
  name: 'template_registry',
  description:
    'Query static data templates for hero classes, buildings, quests, and adventurer archetypes.',
  inputSchema: { type: inputSchema.shape.type, id: inputSchema.shape.id },
  handler: async (args: z.infer<typeof inputSchema>) => {
    const collection = REGISTRY[args.type];

    if (args.id) {
      const template = collection[args.id] ?? null;
      if (template === null) {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                { error: `Template not found`, type: args.type, id: args.id },
                null,
                2,
              ),
            },
          ],
        };
      }
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(template, null, 2),
          },
        ],
      };
    }

    // Return all templates of the requested type
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            { type: args.type, count: Object.keys(collection).length, templates: collection },
            null,
            2,
          ),
        },
      ],
    };
  },
};

// Export templates for use in tests
export { HERO_CLASS_TEMPLATES, BUILDING_TEMPLATES, QUEST_TEMPLATES, ADVENTURER_ARCHETYPE_TEMPLATES };
