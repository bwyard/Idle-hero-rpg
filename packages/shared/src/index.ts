/**
 * @idle-hero-rpg/shared — Barrel exports by domain.
 *
 * All shared types are exported from here. Import from '@idle-hero-rpg/shared'.
 */

// Adventurer domain
export type {
  Adventurer,
  AdventurerTier,
  AdventurerArchetype,
  PrestigeEligibleTier,
  TransientVisitor,
  VisitorServiceRequest,
} from './types/adventurer';

// Hero domain
export type { Hero, HeroClass } from './types/hero';

// Guild domain
export type { Guild, Building, GuildType } from './types/guild';

// Kingdom domain
export type { City, Region } from './types/kingdom';

// Quest domain
export type { Quest } from './types/quest';

// Dynasty domain
export type {
  Dynasty,
  WorldAwarenessTier,
  PrestigeRelationshipTier,
  HallOfHeroesEntry,
} from './types/dynasty';

// Event domain
export type { GameEvent, AchievementKey } from './types/event';

// Game state
export type { GameState } from './types/gameState';

// Actions
export type {
  GameAction,
  NoOpAction,
  RecruitAdventurerAction,
  BuildBuildingAction,
  StartQuestAction,
  GenerateQuestsAction,
  HoldFeastAction,
} from './types/actions';

// ID generation
export { createId } from './utils/id';
export type { IdPrefix } from './utils/id';

// System implementation contracts (interface-first pattern for pending design decisions)
export type {
  EconomyImpl,
  AdventurerProgressionImpl,
  BuildingProductionImpl,
  HeroAbilityImpl,
  QuestRewardImpl,
  RivalProgressionImpl,
} from './types/systemImpls';
