/**
 * Legacy skill types — guild skills accumulated across prestige cycles.
 *
 * Each prestige awards 1–4 legacy skills to the guild. Skills persist in
 * DynastyState and are available to all future leaders. The exact count
 * scales with guild level and mentoring (balance decision, not yet tuned).
 *
 * Legacy skill IDs are free-form strings keyed into a static template
 * registry — consistent with the quest and building templateId pattern.
 */

/** Free-form string referencing a static LegacySkillTemplate. */
export type LegacySkillId = string;

/**
 * Static template for a legacy skill.
 * Lives in apps/game/src/data/legacySkillTemplates.ts.
 * Never stored in the save file — referenced by ID only.
 */
export interface LegacySkillTemplate {
  readonly id: LegacySkillId;
  readonly displayName: string;
  readonly description: string;
  /**
   * Whether this skill is passive (always active) or active
   * (consumes AP when triggered via USE_HERO_ABILITY).
   */
  readonly kind: 'passive' | 'active';
  /** AP cost for active skills. 0 for passives. */
  readonly apCost: number;
}

/**
 * Live legacy skill state stored in DynastyState.
 * Tracks which run the skill was earned and whether it has been used this Conclave cycle.
 */
export interface LegacySkill {
  readonly id: LegacySkillId;
  /** Index of the run (prestige cycle) in which this skill was earned. */
  readonly earnedAtRunIndex: number;
  /**
   * Whether Skill Borrow has been used for this skill this Conclave cycle.
   * Resets each Conclave. Only relevant for skills eligible for Skill Borrow.
   */
  skillBorrowUsed: boolean;
}
