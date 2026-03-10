/**
 * Guild types — shared domain types for the guild and its buildings.
 */

/** Guild specialization types. Any hero class can run any guild type. */
export type GuildType = 'Combat' | 'Merchant' | 'Knowledge' | 'Hospitality';

/** Live guild state stored in the save file. */
export interface Guild {
  name: string;
  type: GuildType;
  gold: number;
  reputation: number;
}

/** Live building state stored in the save file. */
export interface Building {
  readonly id: string;
  /** Reference to the static BuildingTemplate by ID. */
  readonly templateId: string;
  level: number;
  /** City this building belongs to. */
  readonly cityId: string;
}
