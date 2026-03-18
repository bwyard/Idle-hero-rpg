/**
 * Hero types — shared domain types for the founding hero / guild leader.
 */

/** Available hero classes. Each class has a passive and a career milestone active. */
export type HeroClass = 'Warblade' | 'Wanderer' | 'Archmage' | 'Diplomat' | 'Bard';

/** Live hero state stored in the save file. */
export interface Hero {
  readonly id: string;
  name: string;
  heroClass: HeroClass;
  actionPoints: number;
  /** Maximum AP the hero can hold (base class rate + guild size bonuses). */
  maxActionPoints: number;
  /**
   * ID of the hero's passive ability — always active, applied every tick.
   * References a HeroAbilityTemplate in the static template registry.
   */
  passiveAbilityId: string;
  /**
   * ID of the hero's career milestone active ability — unlocked mid-run.
   * References a HeroAbilityTemplate in the static template registry.
   */
  milestoneAbilityId: string;
  /** Whether the career milestone active ability has been unlocked this run. */
  milestoneUnlocked: boolean;
}
