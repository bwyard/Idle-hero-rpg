/**
 * Adventurer types — shared domain types for guild adventurers and transient visitors.
 *
 * ID STRATEGY (live game objects only — not templates):
 *   Live objects (adventurers, visitors, quests, buildings, rivals) use prefixed IDs:
 *     adv_<nanoid>  vis_<nanoid>  qst_<nanoid>  bld_<nanoid>  rvl_<nanoid>
 *   Prefixes keep logs and saves human-readable at scale (thousands of adventurers,
 *   hundreds of guilds). nanoid gives collision-free generation with no counter state.
 *   Record<string, T> keying preserves O(1) lookup regardless of ID format.
 *
 *   Static templates (hero classes, buildings, quests, archetypes) use named slugs
 *   ('Warblade', 'guild-hall') — they are authored, bounded, and never generated at runtime.
 *   See TODO.md: ID Strategy Decision.
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

// ─── Transient Visitor System ─────────────────────────────────────────────────
//
// Non-guild adventurers passing through who stop at the guild house seeking
// services. The guild leader may engage them, ignore them, or put them on hold
// while assessing whether the guild can fulfil their request.
//
// Design: processTransientVisitors runs in the tick pipe (after processBuildings).
// See TODO.md: Dorm / Transient Visitor System.

/** The service a transient visitor is seeking at the guild house. */
export type VisitorServiceRequest =
  | 'Quest' // Wants to pick up or hand in a quest; requires active quest board
  | 'Training' // Wants access to training grounds; requires Training Grounds building
  | 'Repair' // Needs equipment repaired; requires a smith or equivalent (future building)
  | 'Health' // Seeking healing or rest; requires Tavern or Infirmary building
  | 'Lodging'; // Needs a place to stay; requires Tavern at level 2+

/** A non-guild adventurer currently at the guild house. */
export interface TransientVisitor {
  /** Prefixed ID: `vis_<nanoid>`. */
  readonly id: string;
  readonly name: string;
  readonly tier: AdventurerTier;
  readonly archetype: AdventurerArchetype | null;
  readonly serviceRequest: VisitorServiceRequest;
  /**
   * Gold the guild earns by serving this visitor's request (SERVE_VISITOR).
   * Scales with visitor tier and service type. Set on spawn.
   */
  readonly serviceFee: number;
  /** Tick at which this visitor arrived. */
  readonly arrivedAtTick: number;
  /**
   * Tick at which this visitor will leave if not engaged or held.
   * The system removes the visitor when ticksElapsed >= expiresAtTick and heldUntilTick is null
   * or has also elapsed.
   */
  readonly expiresAtTick: number;
  /**
   * If non-null, the player has explicitly held this visitor until this tick.
   * Overrides expiresAtTick — the system will not remove them before heldUntilTick.
   * After heldUntilTick passes, expiresAtTick takes over.
   * See TODO.md: Opportunity Hold Mechanic.
   */
  readonly heldUntilTick: number | null;
  /**
   * Number of times this visitor has been put on hold this visit.
   * Used to apply diminishing hold durations (each hold is shorter than the last).
   */
  readonly holdCount: number;
}

/** Live adventurer state stored in the save file. */
export interface Adventurer {
  readonly id: string;
  readonly name: string;
  readonly tier: AdventurerTier;
  readonly archetype: AdventurerArchetype | null;
  readonly xp: number;
  /** Milestone keys this adventurer has reached. */
  readonly milestones: readonly string[];
  /** Whether this adventurer's Skill Borrow has been used this Conclave cycle. */
  readonly skillBorrowUsed: boolean;
  /** In-game year this adventurer was recruited. */
  readonly recruitedYear: number;
  /** In-game year this adventurer retired (null if still active). */
  readonly retiredYear: number | null;
}
