/**
 * currency.ts — Copper/silver/gold denomination formatting.
 *
 * Pure display-layer breakdown of Guild.gold (stored in copper, the smallest
 * unit). See docs/design/economy.md "Currency Tier Handoff".
 */

import { COPPER_PER_SILVER, SILVER_PER_GOLD } from '../data/balance';

export interface CurrencyBreakdown {
  readonly gold: number;
  readonly silver: number;
  readonly copper: number;
}

/** Splits a total copper amount into gold/silver/copper denominations. */
export const formatCurrency = (totalCopper: number): CurrencyBreakdown => {
  const copperPerGold = COPPER_PER_SILVER * SILVER_PER_GOLD;
  const gold = Math.floor(totalCopper / copperPerGold);
  const remainderAfterGold = totalCopper % copperPerGold;
  const silver = Math.floor(remainderAfterGold / COPPER_PER_SILVER);
  const copper = remainderAfterGold % COPPER_PER_SILVER;
  return { gold, silver, copper };
};

/**
 * Compact display string, e.g. "2g 7s 42c", "7s 42c", or "42c".
 * Drops leading zero denominations; always shows at least copper.
 */
export const formatCurrencyDisplay = (totalCopper: number): string => {
  const { gold, silver, copper } = formatCurrency(totalCopper);
  const parts: string[] = [];
  if (gold > 0) parts.push(`${String(gold)}g`);
  if (gold > 0 || silver > 0) parts.push(`${String(silver)}s`);
  parts.push(`${String(copper)}c`);
  return parts.join(' ');
};
