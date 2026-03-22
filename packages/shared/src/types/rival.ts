/**
 * Rival types — shared domain types for NPC rival guilds.
 */

export interface Rival {
  readonly id: string;
  readonly name: string;
  readonly foundedYear: number;
  readonly tier: 'Minor' | 'Notable' | 'Major' | 'Legendary';
  /** Source: 'generated' for fresh NPCs, or adventurer ID for Hall of Heroes graduates. */
  readonly sourceAdventurerId: string | null;
}
