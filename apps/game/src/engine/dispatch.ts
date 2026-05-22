/** dispatch — Pure function for applying player actions to GameState. */

import type { GameState, GameAction } from '@idle-hero-rpg/shared';
import { createId } from '@idle-hero-rpg/shared';
import { prngRangeInt } from '@prime/prime-random';
import {
  canAffordGold,
  spendGold,
  addGold,
  calcUpgradeCost,
  calcUpgradeDuration,
} from '@stage/stage-economy';
import {
  PLACEHOLDER_RECRUIT_COST,
  PLACEHOLDER_BUILD_COST,
  PLACEHOLDER_FEAST_COST,
  PLACEHOLDER_FEAST_XP_BONUS,
  PLACEHOLDER_HOLD_DURATION_DAYS,
  PLACEHOLDER_ENGAGE_COST,
  PLACEHOLDER_CITY_EXPANSION_BASE,
  PLACEHOLDER_CITY_EXPANSION_PER_CITY,
  PLACEHOLDER_VISITOR_SERVICE_DURATION_DAYS,
  PLACEHOLDER_STARTING_GOLD,
  PLACEHOLDER_PRESTIGE_GOLD_BONUS,
  TICKS_PER_DAY,
  OVERCAPACITY_RECRUIT_SURCHARGE,
  ADVENTURER_TIER_ORDER,
  WORLD_AWARENESS_THRESHOLDS,
  PRESTIGE_ELIGIBLE_TIERS,
} from '../data/balance';
import type { HeroClass, AdventurerArchetype, WorldAwarenessTier } from '@idle-hero-rpg/shared';
import { createInitialGameState } from '../stores/initialState';
import { BUILDING_TEMPLATES } from '../data/buildingTemplates';
import { generateQuests } from '../systems/generateQuests';
import { isAtDormCapacity } from '../utils/housing';

const ADVENTURER_ARCHETYPES = [
  'Fighter',
  'Rogue',
  'Mage',
  'Ranger',
  'Cleric',
  'Bard',
  'Paladin',
  'Warlock',
] as const;

const ADVENTURER_NAMES = [
  'Arin',
  'Brynn',
  'Cael',
  'Dara',
  'Elric',
  'Faye',
  'Gwen',
  'Holt',
  'Iris',
  'Jett',
  'Kael',
  'Luna',
  'Milo',
  'Nyx',
  'Orin',
  'Petra',
  'Quinn',
  'Rowan',
  'Sable',
  'Thane',
];

export const dispatch = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'RECRUIT_ADVENTURER': {
      const atCapacity = isAtDormCapacity(state);
      const recruitCost = atCapacity
        ? Math.ceil(PLACEHOLDER_RECRUIT_COST * OVERCAPACITY_RECRUIT_SURCHARGE)
        : PLACEHOLDER_RECRUIT_COST;

      if (!canAffordGold(state.guild.gold, recruitCost)) return state;

      const advId = createId('adv');
      const [nameIdx, seed2] = prngRangeInt(state.rngSeed, ADVENTURER_NAMES.length);
      const [archetypeIdx, nextSeed] = prngRangeInt(seed2, ADVENTURER_ARCHETYPES.length);
      const name = ADVENTURER_NAMES[nameIdx] ?? 'Unknown';
      const archetype = ADVENTURER_ARCHETYPES[archetypeIdx] ?? 'Fighter';

      const event = {
        id: createId('evt'),
        tick: state.time.ticksElapsed,
        type: 'RECRUIT',
        message: `${name} joined the guild!`,
        achievementKey: null,
        causeId: null,
      } as const;

      return {
        ...state,
        rngSeed: nextSeed,
        guild: {
          ...state.guild,
          gold: spendGold(state.guild.gold, recruitCost),
        },
        adventurers: {
          ...state.adventurers,
          [advId]: {
            id: advId,
            name,
            tier: 'F' as const,
            archetype,
            xp: 0,
            milestones: [],
            skillBorrowUsed: false,
            recruitedYear: state.time.currentYear,
            retiredYear: null,
            housingType: 'dorm' as const,
          },
        },
        pendingEvents: [...state.pendingEvents, event],
      };
    }

    case 'BUILD_BUILDING': {
      if (!canAffordGold(state.guild.gold, PLACEHOLDER_BUILD_COST)) return state;

      const bldId = createId('bld');

      const event = {
        id: createId('evt'),
        tick: state.time.ticksElapsed,
        type: 'BUILD',
        message: `A new ${action.buildingTemplateId} was constructed!`,
        achievementKey: null,
        causeId: null,
      } as const;

      return {
        ...state,
        guild: {
          ...state.guild,
          gold: spendGold(state.guild.gold, PLACEHOLDER_BUILD_COST),
        },
        buildings: {
          ...state.buildings,
          [bldId]: {
            id: bldId,
            templateId: action.buildingTemplateId,
            level: 1,
            cityId: action.cityId,
            upgradeTicksRemaining: 0,
          },
        },
        pendingEvents: [...state.pendingEvents, event],
      };
    }

    case 'START_QUEST': {
      const quest = state.quests[action.questId];
      if (!quest || quest.assignedAdventurerId !== null) return state;

      const adventurer = state.adventurers[action.adventurerId];
      if (!adventurer) return state;

      // Tier gate — partySize > 1 not yet enforced (future extension).
      const advTierRank = ADVENTURER_TIER_ORDER.indexOf(adventurer.tier);
      const minTierRank = ADVENTURER_TIER_ORDER.indexOf(quest.minTier);
      if (advTierRank < minTierRank) return state;

      const event = {
        id: createId('evt'),
        tick: state.time.ticksElapsed,
        type: 'QUEST_START',
        message: `${adventurer.name} embarked on quest ${quest.templateId}!`,
        achievementKey: null,
        causeId: null,
      } as const;

      return {
        ...state,
        quests: {
          ...state.quests,
          [action.questId]: {
            ...quest,
            assignedAdventurerId: action.adventurerId,
          },
        },
        pendingEvents: [...state.pendingEvents, event],
      };
    }

    case 'GENERATE_QUESTS': {
      return generateQuests(state);
    }

    case 'HOLD_FEAST': {
      if (!canAffordGold(state.guild.gold, PLACEHOLDER_FEAST_COST)) return state;

      const boostedAdventurers: Record<string, (typeof state.adventurers)[string]> = {};
      for (const [id, adv] of Object.entries(state.adventurers)) {
        boostedAdventurers[id] = {
          ...adv,
          xp: adv.xp + PLACEHOLDER_FEAST_XP_BONUS,
        };
      }

      const event = {
        id: createId('evt'),
        tick: state.time.ticksElapsed,
        type: 'FEAST',
        message: 'A grand feast was held! All adventurers gained experience.',
        achievementKey: null,
        causeId: null,
      } as const;

      return {
        ...state,
        guild: {
          ...state.guild,
          gold: spendGold(state.guild.gold, PLACEHOLDER_FEAST_COST),
        },
        adventurers: boostedAdventurers,
        pendingEvents: [...state.pendingEvents, event],
      };
    }

    case 'HOLD_VISITOR': {
      const visitor = state.transientVisitors[action.visitorId];
      if (!visitor) return state;

      const newHoldCount = visitor.holdCount + 1;
      const holdDuration = Math.floor(
        (PLACEHOLDER_HOLD_DURATION_DAYS * TICKS_PER_DAY) / newHoldCount,
      );

      const event = {
        id: createId('evt'),
        tick: state.time.ticksElapsed,
        type: 'VISITOR_HOLD',
        message: `${visitor.name} has been asked to wait.`,
        achievementKey: null,
        causeId: null,
      } as const;

      return {
        ...state,
        transientVisitors: {
          ...state.transientVisitors,
          [action.visitorId]: {
            ...visitor,
            heldUntilTick: state.time.ticksElapsed + holdDuration,
            holdCount: newHoldCount,
          },
        },
        pendingEvents: [...state.pendingEvents, event],
      };
    }

    case 'ENGAGE_VISITOR': {
      const visitor = state.transientVisitors[action.visitorId];
      if (!visitor) return state;
      if (!canAffordGold(state.guild.gold, PLACEHOLDER_ENGAGE_COST)) return state;

      const advId = createId('adv');
      const { [action.visitorId]: _removed, ...remainingVisitors } = state.transientVisitors;

      const event = {
        id: createId('evt'),
        tick: state.time.ticksElapsed,
        type: 'VISITOR_ENGAGE',
        message: `${visitor.name} has joined the guild!`,
        achievementKey: null,
        causeId: null,
      } as const;

      return {
        ...state,
        guild: {
          ...state.guild,
          gold: spendGold(state.guild.gold, PLACEHOLDER_ENGAGE_COST),
        },
        transientVisitors: remainingVisitors,
        adventurers: {
          ...state.adventurers,
          [advId]: {
            id: advId,
            name: visitor.name,
            tier: visitor.tier,
            archetype: visitor.archetype,
            xp: 0,
            milestones: [],
            skillBorrowUsed: false,
            recruitedYear: state.time.currentYear,
            retiredYear: null,
            housingType: 'dorm' as const,
          },
        },
        pendingEvents: [...state.pendingEvents, event],
      };
    }

    case 'SERVE_VISITOR': {
      const visitor = state.transientVisitors[action.visitorId];
      if (!visitor) return state;

      const { [action.visitorId]: _removed, ...remainingVisitors } = state.transientVisitors;

      const event = {
        id: createId('evt'),
        tick: state.time.ticksElapsed,
        type: 'VISITOR_SERVED',
        message: `${visitor.name} was served (${visitor.serviceRequest}) — ${String(visitor.serviceFee)} gold earned.`,
        achievementKey: null,
        causeId: null,
      } as const;

      return {
        ...state,
        guild: { ...state.guild, gold: addGold(state.guild.gold, visitor.serviceFee) },
        transientVisitors: remainingVisitors,
        pendingEvents: [...state.pendingEvents, event],
      };
    }

    case 'DISMISS_VISITOR': {
      const visitor = state.transientVisitors[action.visitorId];
      if (!visitor) return state;

      const { [action.visitorId]: _removed, ...remainingVisitors } = state.transientVisitors;

      const event = {
        id: createId('evt'),
        tick: state.time.ticksElapsed,
        type: 'VISITOR_DISMISS',
        message: `${visitor.name} has been dismissed.`,
        achievementKey: null,
        causeId: null,
      } as const;

      return {
        ...state,
        transientVisitors: remainingVisitors,
        pendingEvents: [...state.pendingEvents, event],
      };
    }

    case 'UPGRADE_BUILDING': {
      const building = state.buildings[action.buildingId];
      if (!building) return state;
      if (building.upgradeTicksRemaining > 0) return state;

      const template = BUILDING_TEMPLATES[building.templateId];
      if (!template) return state;
      if (building.level >= template.maxLevel) return state;

      const targetLevel = building.level + 1;
      const cost = calcUpgradeCost(template.upgradeCostBase, targetLevel);
      if (!canAffordGold(state.guild.gold, cost)) return state;

      const event = {
        id: createId('evt'),
        tick: state.time.ticksElapsed,
        type: 'UPGRADE_START',
        message: `${building.templateId} upgrade to level ${targetLevel} started!`,
        achievementKey: null,
        causeId: null,
      } as const;

      return {
        ...state,
        guild: {
          ...state.guild,
          gold: spendGold(state.guild.gold, cost),
        },
        buildings: {
          ...state.buildings,
          [action.buildingId]: {
            ...building,
            upgradeTicksRemaining: calcUpgradeDuration(
              template.upgradeDurationBaseTicks,
              targetLevel,
            ),
          },
        },
        pendingEvents: [...state.pendingEvents, event],
      };
    }

    case 'EXPAND_CITY': {
      const citiesOwned = Object.keys(state.cities).length;
      const cost =
        PLACEHOLDER_CITY_EXPANSION_BASE + PLACEHOLDER_CITY_EXPANSION_PER_CITY * citiesOwned;
      if (!canAffordGold(state.guild.gold, cost)) return state;

      const cityId = createId('cty');

      const event = {
        id: createId('evt'),
        tick: state.time.ticksElapsed,
        type: 'CITY_EXPANSION',
        message: `The guild expanded to ${action.cityName}!`,
        achievementKey: null,
        causeId: null,
      } as const;

      return {
        ...state,
        guild: {
          ...state.guild,
          gold: spendGold(state.guild.gold, cost),
        },
        cities: {
          ...state.cities,
          [cityId]: {
            id: cityId,
            name: action.cityName,
            region: 'Coast' as const,
            isUnlocked: true,
          },
        },
        pendingEvents: [...state.pendingEvents, event],
      };
    }

    case 'APPROVE_VISITOR': {
      const visitor = state.transientVisitors[action.visitorId];
      if (!visitor) return state;

      const serviceDurationTicks = PLACEHOLDER_VISITOR_SERVICE_DURATION_DAYS * TICKS_PER_DAY;

      const event = {
        id: createId('evt'),
        tick: state.time.ticksElapsed,
        type: 'VISITOR_APPROVED',
        message: `${visitor.name}'s request (${visitor.serviceRequest}) was approved — ${String(visitor.serviceFee)} gold collected.`,
        achievementKey: null,
        causeId: null,
      } as const;

      return {
        ...state,
        guild: { ...state.guild, gold: addGold(state.guild.gold, visitor.serviceFee) },
        transientVisitors: {
          ...state.transientVisitors,
          [action.visitorId]: {
            ...visitor,
            heldUntilTick: state.time.ticksElapsed + serviceDurationTicks,
          },
        },
        pendingEvents: [...state.pendingEvents, event],
      };
    }

    case 'DENY_VISITOR': {
      const visitor = state.transientVisitors[action.visitorId];
      if (!visitor) return state;

      const { [action.visitorId]: _removed, ...remainingVisitors } = state.transientVisitors;

      const event = {
        id: createId('evt'),
        tick: state.time.ticksElapsed,
        type: 'VISITOR_DENIED',
        message: `${visitor.name}'s request was denied — they have departed.`,
        achievementKey: null,
        causeId: null,
      } as const;

      return {
        ...state,
        transientVisitors: remainingVisitors,
        pendingEvents: [...state.pendingEvents, event],
      };
    }

    case 'PRESTIGE': {
      const successor = state.adventurers[action.successorAdventurerId];
      if (!successor) return state;
      if (!PRESTIGE_ELIGIBLE_TIERS.includes(successor.tier)) return state;
      if (!state.flags.prestigeAvailable) return state;

      const newPrestigeCount = state.dynasty.prestigeCount + 1;
      const newWorldAwareness = deriveWorldAwareness(newPrestigeCount);
      const newHeroClass = deriveHeroClass(successor.archetype);

      const hallEntry = {
        adventurerId: state.hero.id,
        name: state.hero.name,
        heroClass: state.hero.heroClass,
        highestTierReached: successor.tier,
        runIndex: state.dynasty.prestigeCount,
      };

      const fresh = createInitialGameState();

      const prestigeEvent = {
        id: createId('evt'),
        tick: 0,
        type: 'PRESTIGE' as const,
        message: `${successor.name} has taken the torch — the dynasty continues.`,
        achievementKey: null,
        causeId: null,
      };

      return {
        ...fresh,
        rngSeed: state.rngSeed,
        adventurers: {},
        transientVisitors: {},
        buildings: {},
        quests: {},
        hero: {
          ...fresh.hero,
          id: `hero-${String(newPrestigeCount).padStart(3, '0')}`,
          name: successor.name,
          heroClass: newHeroClass,
          leaderStartYear: 0,
        },
        guild: {
          ...fresh.guild,
          name: state.guild.name,
          type: state.guild.type,
          gold: PLACEHOLDER_STARTING_GOLD + PLACEHOLDER_PRESTIGE_GOLD_BONUS * newPrestigeCount,
        },
        dynasty: {
          ...state.dynasty,
          prestigeCount: newPrestigeCount,
          worldAwarenessTier: newWorldAwareness,
          hallOfHeroes: [...state.dynasty.hallOfHeroes, hallEntry],
        },
        rivals: state.rivals,
        pendingEvents: [prestigeEvent],
      };
    }

    default:
      return state;
  }
};

// ─── Prestige helpers ─────────────────────────────────────────────────────────

/**
 * Derive world awareness tier from prestige count.
 * WORLD_AWARENESS_THRESHOLDS is sorted highest-first.
 */
const deriveWorldAwareness = (prestigeCount: number): WorldAwarenessTier => {
  const match = WORLD_AWARENESS_THRESHOLDS.find((t) => prestigeCount >= t.minPrestige);
  return (match?.tier ?? 'Hidden') as WorldAwarenessTier;
};

/**
 * Map adventurer archetype to hero class.
 * Follows docs/design/prestige.md § Adventurer Class to Hero Class Conversion.
 */
const ARCHETYPE_TO_HERO_CLASS: Readonly<Record<AdventurerArchetype, HeroClass>> = {
  Fighter: 'Warblade',
  Rogue: 'Wanderer',
  Mage: 'Archmage',
  Ranger: 'Wanderer',
  Cleric: 'Diplomat',
  Bard: 'Bard',
  Paladin: 'Warblade',
  Warlock: 'Archmage',
};

const deriveHeroClass = (archetype: AdventurerArchetype | null): HeroClass =>
  archetype !== null ? (ARCHETYPE_TO_HERO_CLASS[archetype] ?? 'Bard') : 'Bard';
