/**
 * Hero types — shared domain types for the founding hero / guild leader.
 */

/** Available hero classes. Each class has a passive and a career milestone active. */
export type HeroClass = 'Warblade' | 'Wanderer' | 'Archmage' | 'Diplomat' | 'Bard';

/** Live hero state stored in the save file. */
export interface Hero {
  readonly id: string;
  readonly name: string;
  readonly heroClass: HeroClass;
  readonly actionPoints: number;
  /** The in-game year this leader took over. Used for tenure tracking. */
  readonly leaderStartYear: number;
}
