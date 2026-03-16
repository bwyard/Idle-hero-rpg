import { nanoid } from 'nanoid';

/**
 * Valid ID prefixes for live game objects.
 * Each prefix maps to a domain entity type.
 */
export type IdPrefix =
  | 'adv'  // adventurer
  | 'vis'  // transient visitor
  | 'qst'  // quest
  | 'bld'  // building
  | 'rvl'  // rival guild
  | 'evt'  // game event
  | 'cty'; // city

/**
 * Creates a prefixed unique ID for a live game object.
 *
 * Format: `<prefix>_<nanoid>` (e.g. `adv_V1StGXR8_Z5jdHi6B`)
 *
 * @param prefix - Entity type prefix (see {@link IdPrefix})
 * @returns A unique, human-readable, collision-resistant ID
 */
export function createId(prefix: IdPrefix): string {
  return `${prefix}_${nanoid()}`;
}
