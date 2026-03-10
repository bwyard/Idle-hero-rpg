/**
 * Adventurer types — shared domain types for guild adventurers.
 */

/** All possible adventurer legacy tier values (ordered F-low to Legendary-high). */
export type AdventurerTier = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'Legendary';

/** Whether a tier is eligible for prestige (C and above). */
export type PrestigeEligibleTier = 'C' | 'B' | 'A' | 'S' | 'SS' | 'Legendary';

/**
 * Adventurer archetype — determines natural skill affinities.
 * Archetypes unlock at higher tiers.
 */
export type AdventurerArchetype =
  | 'Fighter'
  | 'Rogue'
  | 'Mage'
  | 'Ranger'
  | 'Cleric'
  | 'Bard'
  | 'Paladin'
  | 'Warlock';

/** Live adventurer state stored in the save file. */
export interface Adventurer {
  readonly id: string;
  readonly name: string;
  tier: AdventurerTier;
  archetype: AdventurerArchetype | null;
  xp: number;
  /** Milestone keys this adventurer has reached. */
  milestones: ReadonlyArray<string>;
  /** Whether this adventurer's Skill Borrow has been used this Conclave cycle. */
  skillBorrowUsed: boolean;
  /** In-game year this adventurer was recruited. */
  recruitedYear: number;
  /** In-game year this adventurer retired (null if still active). */
  retiredYear: number | null;
}
