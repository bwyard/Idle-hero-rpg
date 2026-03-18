/**
 * Hero template types — static data shapes for hero class definitions.
 *
 * Templates are never stored in the save file. They live in a static
 * registry (apps/game/src/data/heroClassTemplates.ts) keyed by HeroClass.
 * The Hero type references templates by ID only.
 */

import type { HeroClass } from './hero';

/**
 * A single hero ability template — describes one passive or milestone active.
 * Abilities are data-driven; new abilities are added to static data without
 * touching engine code.
 */
export interface HeroAbilityTemplate {
  readonly id: string;
  readonly displayName: string;
  readonly description: string;
  /**
   * Whether this is a passive (applied every tick by processHero)
   * or a milestone active (triggered by USE_HERO_ABILITY dispatch).
   */
  readonly kind: 'passive' | 'active';
  /** Action point cost — 0 for passives. */
  readonly apCost: number;
}

/**
 * Static template for a hero class — defines the class's abilities and display info.
 * Keyed by HeroClass in the template registry for compile-time exhaustiveness.
 */
export interface HeroClassTemplate {
  readonly heroClass: HeroClass;
  readonly displayName: string;
  readonly description: string;
  /**
   * ID of the passive ability shared by all heroes of this class.
   * References a HeroAbilityTemplate in the same registry.
   */
  readonly passiveAbilityId: string;
  /**
   * ID of the career milestone active ability.
   * References a HeroAbilityTemplate in the same registry.
   */
  readonly milestoneAbilityId: string;
  /** Base AP regenerated per in-game day (before guild size bonuses). */
  readonly baseApRegenPerDay: number;
}
