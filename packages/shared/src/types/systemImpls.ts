/**
 * System implementation interfaces — contracts for systems with pending design decisions.
 *
 * Architecture pattern:
 * Each system that depends on values or rules not yet fully designed is built
 * against one of these interfaces instead of hardcoding assumptions. A stub
 * implementation satisfies the interface and keeps the tick pipe running and
 * tests passing. When the design decision is closed, a live implementation is
 * written and injected — no changes to the system function itself.
 *
 * This means:
 * - CI never blocks on a design conversation
 * - Tests written against the interface contract are valid for any implementation
 * - The seam is explicit and documented in code, not just in a doc
 *
 * Stubs live alongside their system:
 *   apps/game/src/systems/processEconomy.ts  → EconomyImpl, stubEconomyImpl
 *   apps/game/src/systems/processAdventurers.ts → AdventurerProgressionImpl, stubAdventurerProgressionImpl
 *   apps/game/src/systems/processBuildings.ts → BuildingProductionImpl, stubBuildingProductionImpl
 *   apps/game/src/systems/processHero.ts → HeroAbilityImpl, stubHeroAbilityImpl
 *   apps/game/src/systems/processQuests.ts → QuestRewardImpl, stubQuestRewardImpl
 *   apps/game/src/systems/processRivals.ts → RivalProgressionImpl, stubRivalProgressionImpl
 */

import type { GameState } from './gameState';
import type { Adventurer, AdventurerTier } from './adventurer';
import type { Building } from './guild';
import type { Quest } from './quest';

// ---------------------------------------------------------------------------
// Economy
// Pending: gold earning rates, cost schedule, Magic Rewind threshold
// ---------------------------------------------------------------------------

export interface EconomyImpl {
  /** Gold earned this tick from all passive sources (buildings, etc.). */
  calculatePassiveIncome(state: GameState): number;
  /** Gold spent this tick on upkeep and scheduled expenses. */
  calculateUpkeep(state: GameState): number;
  /**
   * Whether a Magic Rewind should trigger given the guild's projected gold
   * after this tick. Only valid in early prestiges — impl decides the threshold.
   */
  shouldTriggerMagicRewind(state: GameState, projectedGold: number): boolean;
}

// ---------------------------------------------------------------------------
// Adventurer progression
// Pending: XP rates per tier, tier advancement thresholds, retirement criteria
// ---------------------------------------------------------------------------

export interface AdventurerProgressionImpl {
  /** XP earned by this adventurer this tick. */
  xpGainPerTick(adventurer: Adventurer, state: GameState): number;
  /** Whether this adventurer has enough XP to advance to the next tier. */
  isReadyForTierUp(adventurer: Adventurer): boolean;
  /** The tier this adventurer advances to. Always one step forward. */
  nextTier(current: AdventurerTier): AdventurerTier | null;
  /**
   * Whether a Legendary adventurer should retire this tick.
   * Retirement triggers the prestige condition check.
   */
  shouldRetire(adventurer: Adventurer, state: GameState): boolean;
}

// ---------------------------------------------------------------------------
// Building production
// Pending: income per building level, active vs passive split, upgrade costs
// ---------------------------------------------------------------------------

export interface BuildingProductionImpl {
  /** Passive gold contributed by this building this tick. */
  incomePerTick(building: Building, state: GameState): number;
  /** Whether this building's in-progress upgrade completes this tick. */
  upgradeCompletesThisTick(building: Building, state: GameState): boolean;
}

// ---------------------------------------------------------------------------
// Hero abilities
// Design: CLOSED 2026-03-17 (ADR-006 Option 3)
// Decision: HYBRID — per-hero class passive + career milestone active + guild legacy skills.
// Each hero class has a passive (applied every tick) and a milestone active (AP cost, unlocked mid-run).
// ---------------------------------------------------------------------------

export interface HeroAbilityImpl {
  /** Action points regenerated this tick. */
  actionPointRegen(state: GameState): number;
  /**
   * Passive ability effect applied to state this tick.
   * Returns a partial state patch — the system merges it.
   * Shape must not add new top-level keys; only mutate existing fields.
   */
  applyPassiveAbility(state: GameState): Partial<GameState>;
  /** Whether the career milestone active ability has been unlocked. */
  isMilestoneUnlocked(state: GameState): boolean;
}

// ---------------------------------------------------------------------------
// Quest rewards
// Pending: reward distributions per quest tier, adventurer XP from quests
// ---------------------------------------------------------------------------

export interface QuestRewardImpl {
  /** Gold rewarded on quest completion. */
  goldReward(quest: Quest, state: GameState): number;
  /** XP each assigned adventurer earns on quest completion. */
  adventurerXpReward(quest: Quest, state: GameState): number;
}

// ---------------------------------------------------------------------------
// Rival progression
// Pending: NPC minimum tenure numbers, S/SS graduate population rates
// ---------------------------------------------------------------------------

export interface RivalProgressionImpl {
  /**
   * Whether a new S or SS graduate from a prior run should enter the rival
   * pool this tick.
   */
  shouldPopulateRival(state: GameState): boolean;
  /** Whether a rival guild has met its minimum tenure and can dissolve. */
  hasMetMinimumTenure(rivalId: string, state: GameState): boolean;
}
