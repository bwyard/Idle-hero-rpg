/**
 * Guild types — shared domain types for the guild and its buildings.
 */

/** Guild specialization types. Any hero class can run any guild type. */
export type GuildType = 'Combat' | 'Merchant' | 'Knowledge' | 'Hospitality';

/** Live guild state stored in the save file. */
export interface Guild {
  readonly name: string;
  readonly type: GuildType;
  readonly gold: number;
  readonly reputation: number;
}

/** Live building state stored in the save file. */
export interface Building {
  readonly id: string;
  /** Reference to the static BuildingTemplate by ID. */
  readonly templateId: string;
  readonly level: number;
  /** City this building belongs to. */
  readonly cityId: string;
  /** Ticks remaining until current upgrade completes. 0 = not upgrading. */
  readonly upgradeTicksRemaining: number;
}
