/**
 * currency.ts — Copper/silver/gold denomination formatting.
 *
 * Pure display-layer breakdown of Guild.gold (stored in copper, the smallest
 * unit). See docs/design/economy.md "Currency Tier Handoff".
 */

import { COPPER_PER_SILVER, COPPER_PER_GOLD } from '../data/balance';

export interface CurrencyBreakdown {
  readonly isNegative: boolean;
  readonly gold: number;
  readonly silver: number;
  readonly copper: number;
}

/**
 * Splits a total copper amount into gold/silver/copper denominations.
 *
 * gold/silver/copper are always non-negative magnitudes; isNegative carries
 * the sign separately so debt (negative Guild.gold, a documented reachable
 * state once Magic Rewind is removed) never gets silently absorbed by
 * Math.floor/% disagreeing on sign.
 */
export const formatCurrency = (totalCopper: number): CurrencyBreakdown => {
  const isNegative = totalCopper < 0;
  const magnitude = Math.abs(totalCopper);
  const gold = Math.floor(magnitude / COPPER_PER_GOLD);
  const remainderAfterGold = magnitude % COPPER_PER_GOLD;
  const silver = Math.floor(remainderAfterGold / COPPER_PER_SILVER);
  const copper = remainderAfterGold % COPPER_PER_SILVER;
  return { isNegative, gold, silver, copper };
};

/**
 * Compact display string, e.g. "2g 7s 42c", "7s 42c", "42c", or "-2g 7s 42c"
 * for debt. Drops leading zero denominations; always shows at least copper.
 */
export const formatCurrencyDisplay = (totalCopper: number): string => {
  const { isNegative, gold, silver, copper } = formatCurrency(totalCopper);
  const parts: string[] = [];
  if (gold > 0) parts.push(`${String(gold)}g`);
  if (gold > 0 || silver > 0) parts.push(`${String(silver)}s`);
  parts.push(`${String(copper)}c`);
  return (isNegative ? '-' : '') + parts.join(' ');
};
