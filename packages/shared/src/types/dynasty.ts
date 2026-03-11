/**
 * Dynasty types — shared domain types for meta-progression.
 */

/** World awareness tier — scales with prestige count. */
export type WorldAwarenessTier =
  | 'Hidden'      // Prestige 0–2: world doesn't know the dynasty exists
  | 'Local'
  | 'Regional'
  | 'Continental'
  | 'WorldFamous'
  | 'Mythic';     // Prestige 16+

/** Relationship tier created when a dynasty prestige-establishes a new guild. */
export type PrestigeRelationshipTier =
  | 'Affiliate'   // C prestige rank
  | 'Branch'      // B prestige rank
  | 'Chapter'     // A prestige rank
  | 'HQ'          // S prestige rank
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
}
