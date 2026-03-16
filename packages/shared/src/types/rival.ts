/**
 * Rival types — shared domain types for NPC rival guilds.
 */

export interface Rival {
  readonly id: string;
  name: string;
  foundedYear: number;
  tier: 'Minor' | 'Notable' | 'Major' | 'Legendary';
  /** Source: 'generated' for fresh NPCs, or adventurer ID for Hall of Heroes graduates. */
  sourceAdventurerId: string | null;
}
