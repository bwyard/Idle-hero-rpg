/**
 * progressiveDisclosure.ts — Utility for collapsing low-tier adventurers
 * to aggregate counts on overview screens (kingdom view, guild summary).
 *
 * Per ADR-009: F, E, D tiers show as aggregate counts.
 * C and above show individual detail.
 */

import type { Adventurer, AdventurerTier } from '@idle-hero-rpg/shared';
import { KINGDOM_VIEW_COLLAPSED_TIERS } from '../data/balance';

const collapsedSet = new Set<string>(KINGDOM_VIEW_COLLAPSED_TIERS);

/** Aggregate count for collapsed tiers. */
export interface TierAggregate {
  readonly tier: AdventurerTier;
  readonly count: number;
}

/** Result of splitting adventurers into detailed vs aggregated groups. */
export interface DisclosureResult {
  /** Adventurers shown with full detail (C and above). */
  readonly detailed: readonly Adventurer[];
  /** Tier counts for collapsed tiers (F, E, D). */
  readonly aggregated: readonly TierAggregate[];
  /** Total count of collapsed adventurers. */
  readonly collapsedCount: number;
}

/**
 * Split adventurers into detailed (C+) and aggregated (F/E/D) groups.
 *
 * @param adventurers - All adventurers to classify
 * @returns Detailed list + aggregate counts
 */
export function splitByDisclosure(adventurers: readonly Adventurer[]): DisclosureResult {
  const detailed: Adventurer[] = [];
  const tierCounts = new Map<AdventurerTier, number>();

  for (const adv of adventurers) {
    if (collapsedSet.has(adv.tier)) {
      tierCounts.set(adv.tier, (tierCounts.get(adv.tier) ?? 0) + 1);
    } else {
      detailed.push(adv);
    }
  }

  const aggregated: TierAggregate[] = [];
  for (const [tier, count] of tierCounts) {
    aggregated.push({ tier, count });
  }

  // Sort aggregated by tier order (F first)
  const tierOrder: AdventurerTier[] = ['F', 'E', 'D'];
  aggregated.sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier));

  const collapsedCount = aggregated.reduce((sum, a) => sum + a.count, 0);

  return { detailed, aggregated, collapsedCount };
}
