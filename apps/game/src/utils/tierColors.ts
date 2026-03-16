/**
 * tierColors — color mapping for adventurer legacy tiers.
 *
 * Used for tier badge backgrounds, XP bar fill, and other tier-coded UI.
 */

import type { AdventurerTier } from '@idle-hero-rpg/shared';

export const TIER_COLORS: Record<AdventurerTier, string> = {
  F: '#8a8a8a',
  E: '#6a9a6a',
  D: '#5a8abf',
  C: '#9a6abf',
  B: '#bf6a6a',
  A: '#f0a040',
  S: '#f0d060',
  SS: '#f0f0f0',
  Legendary: '#ff6090',
};
