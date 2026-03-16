/**
 * Kingdom types — shared domain types for regions, cities, and seasons.
 */

/** The four seasons of the in-game year. */
export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

/** The five regions of the kingdom. */
export type Region = 'Heartlands' | 'Coast' | 'Mountains' | 'Wilds' | 'CapitalRegion';

/** Live city state stored in the save file. */
export interface City {
  readonly id: string;
  name: string;
  readonly region: Region;
  /** Whether the guild has established a presence in this city. */
  isUnlocked: boolean;
}
