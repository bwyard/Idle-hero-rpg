/**
 * Dynasty types — shared domain types for meta-progression.
 */

/** World awareness tier — scales with prestige count. */
export type WorldAwarenessTier =
  | 'Hidden' // Prestige 0–2: world doesn't know the dynasty exists
  | 'Local'
  | 'Regional'
  | 'Continental'
  | 'WorldFamous'
  | 'Mythic'; // Prestige 16+

/** Relationship tier created when a dynasty prestige-establishes a new guild. */
export type PrestigeRelationshipTier =
  | 'Affiliate' // C prestige rank
  | 'Branch' // B prestige rank
  | 'Chapter' // A prestige rank
  | 'HQ' // S prestige rank
  | 'Independent' // SS prestige rank
  | 'WorldEvent'; // Legendary prestige rank

/** An entry in the Hall of Heroes — adventurer career summary. */
export interface HallOfHeroesEntry {
  readonly adventurerId: string;
  readonly name: string;
  readonly heroClass: string;
  readonly highestTierReached: string;
  readonly runIndex: number;
}

/** Dynasty meta-progression state — persists across runs. */
export interface Dynasty {
  prestigeCount: number;
  worldAwarenessTier: WorldAwarenessTier;
  /** Permanent bonuses accumulated across runs. */
  permanentBonuses: Record<string, number>;
  /** Adventurers enshrined in the Hall of Heroes. */
  hallOfHeroes: readonly HallOfHeroesEntry[];
  /**
   * Legacy skill IDs earned across prestige cycles.
   * Each prestige awards 1–4 skills; count scales with guild level and mentoring.
   * References LegacySkillTemplate entries in the static registry.
   */
  legacySkills: readonly string[];
  /**
   * Hero classes unlocked for future leaders.
   * Run 1 starts with the default class selection; additional classes unlock
   * via prestige milestones and are available to all future leaders.
   */
  unlockedHeroClasses: readonly string[];
}

/**
 * DynastyState — the canonical type for the deferred dynasty Zustand slice.
 *
 * Cross-run feature gates use (GameState, DynastyState | null) signatures
 * per ADR-010. When null, cross-run gates return false (features locked).
 *
 * DynastyState has the same shape as Dynasty for now — they will diverge
 * as the dynasty Zustand slice gains store-specific fields.
 */
export type DynastyState = Dynasty;
