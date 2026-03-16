/**
 * dispatch — Pure function for applying player actions to GameState.
 *
 * ARCHITECTURE RULES (non-negotiable):
 * - This is a pure function. No mutations, no side effects.
 * - Takes a GameState and an Action, returns a new GameState.
 * - UI calls dispatch; dispatch never calls into React.
 */

import type { GameState, GameAction } from '@idle-hero-rpg/shared';
import { createId } from '@idle-hero-rpg/shared';
import {
  PLACEHOLDER_RECRUIT_COST,
  PLACEHOLDER_BUILD_COST,
  PLACEHOLDER_QUEST_DURATION_TICKS,
  PLACEHOLDER_FEAST_COST,
  PLACEHOLDER_FEAST_XP_BONUS,
  PLACEHOLDER_HOLD_DURATION_TICKS,
  PLACEHOLDER_ENGAGE_COST,
} from '../data/balance';

/** Small pool of fantasy names for recruited adventurers (display data). */
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

/**
 * Apply a player action to the current game state.
 *
 * @param state - The current GameState (immutable input)
 * @param action - The action to apply
 * @returns A new GameState after applying the action
 */
export function dispatch(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'RECRUIT_ADVENTURER': {
      if (state.guild.gold < PLACEHOLDER_RECRUIT_COST) return state;

      const advId = createId('adv');
      const name =
        ADVENTURER_NAMES[Math.floor(Math.random() * ADVENTURER_NAMES.length)] ?? 'Unknown';

      const event = {
        id: createId('evt'),
        tick: state.time.ticksElapsed,
        type: 'RECRUIT',
        message: `${name} joined the guild!`,
        achievementKey: null,
      } as const;

      return {
        ...state,
        guild: {
          ...state.guild,
          gold: state.guild.gold - PLACEHOLDER_RECRUIT_COST,
        },
        adventurers: {
          ...state.adventurers,
          [advId]: {
            id: advId,
            name,
            tier: 'F' as const,
            archetype: 'Fighter' as const,
            xp: 0,
            milestones: [],
            skillBorrowUsed: false,
            recruitedYear: state.time.currentYear,
            retiredYear: null,
          },
        },
        pendingEvents: [...state.pendingEvents, event],
      };
    }

    case 'BUILD_BUILDING': {
      if (state.guild.gold < PLACEHOLDER_BUILD_COST) return state;

      const bldId = createId('bld');

      const event = {
        id: createId('evt'),
        tick: state.time.ticksElapsed,
        type: 'BUILD',
        message: `A new ${action.buildingTemplateId} was constructed!`,
        achievementKey: null,
      } as const;

      return {
        ...state,
        guild: {
          ...state.guild,
          gold: state.guild.gold - PLACEHOLDER_BUILD_COST,
        },
        buildings: {
          ...state.buildings,
          [bldId]: {
            id: bldId,
            templateId: action.buildingTemplateId,
            level: 1,
            cityId: action.cityId,
          },
        },
        pendingEvents: [...state.pendingEvents, event],
      };
    }

    case 'START_QUEST': {
      const qstId = createId('qst');

      const event = {
        id: createId('evt'),
        tick: state.time.ticksElapsed,
        type: 'QUEST_START',
        message: `${action.adventurerId} embarked on quest ${action.questTemplateId}!`,
        achievementKey: null,
      } as const;

      return {
        ...state,
        quests: {
          ...state.quests,
          [qstId]: {
            id: qstId,
            templateId: action.questTemplateId,
            assignedAdventurerId: action.adventurerId,
            ticksRemaining: PLACEHOLDER_QUEST_DURATION_TICKS,
            isComplete: false,
          },
        },
        pendingEvents: [...state.pendingEvents, event],
      };
    }

    case 'HOLD_FEAST': {
      if (state.guild.gold < PLACEHOLDER_FEAST_COST) return state;

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
      } as const;

      return {
        ...state,
        guild: {
          ...state.guild,
          gold: state.guild.gold - PLACEHOLDER_FEAST_COST,
        },
        adventurers: boostedAdventurers,
        pendingEvents: [...state.pendingEvents, event],
      };
    }

    case 'HOLD_VISITOR': {
      const visitor = state.transientVisitors[action.visitorId];
      if (!visitor) return state;

      const newHoldCount = visitor.holdCount + 1;
      const holdDuration = Math.floor(PLACEHOLDER_HOLD_DURATION_TICKS / newHoldCount);

      const event = {
        id: createId('evt'),
        tick: state.time.ticksElapsed,
        type: 'VISITOR_HOLD',
        message: `${visitor.name} has been asked to wait.`,
        achievementKey: null,
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
      if (state.guild.gold < PLACEHOLDER_ENGAGE_COST) return state;

      const advId = createId('adv');
      const { [action.visitorId]: _removed, ...remainingVisitors } = state.transientVisitors;

      const event = {
        id: createId('evt'),
        tick: state.time.ticksElapsed,
        type: 'VISITOR_ENGAGE',
        message: `${visitor.name} has joined the guild!`,
        achievementKey: null,
      } as const;

      return {
        ...state,
        guild: {
          ...state.guild,
          gold: state.guild.gold - PLACEHOLDER_ENGAGE_COST,
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
          },
        },
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
      } as const;

      return {
        ...state,
        transientVisitors: remainingVisitors,
        pendingEvents: [...state.pendingEvents, event],
      };
    }

    default:
      return state;
  }
}
