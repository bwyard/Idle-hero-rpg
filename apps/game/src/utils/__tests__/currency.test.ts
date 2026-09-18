/**
 * currency.test.ts — Unit tests for currency denomination utilities.
 *
 * TDD: these tests were written before the implementation.
 */

import { describe, it, expect } from 'vitest';
import { formatCurrency, formatCurrencyDisplay } from '../currency';
import { COPPER_PER_SILVER, COPPER_PER_GOLD } from '../../data/balance';

/** Reconstructs totalCopper from a breakdown — the invariant formatCurrency must hold. */
function reconstruct(b: ReturnType<typeof formatCurrency>): number {
  const magnitude = b.gold * COPPER_PER_GOLD + b.silver * COPPER_PER_SILVER + b.copper;
  return b.isNegative ? -magnitude : magnitude;
}

describe('formatCurrency', () => {
  it('returns all zeroes for 0 copper', () => {
    expect(formatCurrency(0)).toEqual({ isNegative: false, gold: 0, silver: 0, copper: 0 });
  });

  it('returns copper only when below one silver', () => {
    expect(formatCurrency(500)).toEqual({ isNegative: false, gold: 0, silver: 0, copper: 500 });
    expect(formatCurrency(COPPER_PER_SILVER - 1)).toEqual({
      isNegative: false,
      gold: 0,
      silver: 0,
      copper: COPPER_PER_SILVER - 1,
    });
  });

  it('rolls over into silver at exactly COPPER_PER_SILVER', () => {
    expect(formatCurrency(COPPER_PER_SILVER)).toEqual({
      isNegative: false,
      gold: 0,
      silver: 1,
      copper: 0,
    });
  });

  it('splits silver and remaining copper', () => {
    expect(formatCurrency(COPPER_PER_SILVER * 3 + 250)).toEqual({
      isNegative: false,
      gold: 0,
      silver: 3,
      copper: 250,
    });
  });

  it('rolls over into gold at exactly COPPER_PER_SILVER * SILVER_PER_GOLD', () => {
    expect(formatCurrency(COPPER_PER_GOLD)).toEqual({
      isNegative: false,
      gold: 1,
      silver: 0,
      copper: 0,
    });
  });

  it('splits gold, silver, and remaining copper together', () => {
    const total = COPPER_PER_GOLD * 2 + COPPER_PER_SILVER * 7 + 42;
    expect(formatCurrency(total)).toEqual({ isNegative: false, gold: 2, silver: 7, copper: 42 });
  });

  it('never produces a negative field for a valid non-negative input', () => {
    const result = formatCurrency(COPPER_PER_GOLD * 5 + 1);
    expect(result.isNegative).toBe(false);
    expect(result.gold).toBeGreaterThanOrEqual(0);
    expect(result.silver).toBeGreaterThanOrEqual(0);
    expect(result.copper).toBeGreaterThanOrEqual(0);
  });

  it('reconstructs the original value for a range of non-negative inputs', () => {
    for (const total of [0, 1, 500, COPPER_PER_SILVER, COPPER_PER_GOLD, COPPER_PER_GOLD * 3 + 1]) {
      expect(reconstruct(formatCurrency(total))).toBe(total);
    }
  });

  describe('negative gold (debt, reachable once Magic Rewind is removed)', () => {
    it('sets isNegative and keeps gold/silver/copper as non-negative magnitudes', () => {
      expect(formatCurrency(-500)).toEqual({ isNegative: true, gold: 0, silver: 0, copper: 500 });
    });

    it('splits a debt spanning silver and copper', () => {
      expect(formatCurrency(-(COPPER_PER_SILVER * 3 + 250))).toEqual({
        isNegative: true,
        gold: 0,
        silver: 3,
        copper: 250,
      });
    });

    it('splits a debt spanning gold, silver, and copper', () => {
      const total = COPPER_PER_GOLD * 2 + COPPER_PER_SILVER * 7 + 42;
      expect(formatCurrency(-total)).toEqual({
        isNegative: true,
        gold: 2,
        silver: 7,
        copper: 42,
      });
    });

    it('reconstructs the original (negative) value for a range of negative inputs', () => {
      for (const total of [
        -1,
        -500,
        -COPPER_PER_SILVER,
        -COPPER_PER_GOLD,
        -(COPPER_PER_GOLD * 2 + 500000),
      ]) {
        expect(reconstruct(formatCurrency(total))).toBe(total);
      }
    });
  });
});

describe('formatCurrencyDisplay', () => {
  it('shows copper only when below one silver', () => {
    expect(formatCurrencyDisplay(500)).toBe('500c');
  });

  it('shows silver and copper once at least one silver', () => {
    expect(formatCurrencyDisplay(COPPER_PER_SILVER * 3 + 250)).toBe('3s 250c');
  });

  it('shows gold, silver, and copper once at least one gold', () => {
    const total = COPPER_PER_GOLD * 2 + COPPER_PER_SILVER * 7 + 42;
    expect(formatCurrencyDisplay(total)).toBe('2g 7s 42c');
  });

  it('shows 0s once gold rolls over even with no silver remainder', () => {
    expect(formatCurrencyDisplay(COPPER_PER_GOLD)).toBe('1g 0s 0c');
  });

  describe('negative gold (debt)', () => {
    it('prefixes a single "-" rather than hiding the deficit', () => {
      expect(formatCurrencyDisplay(-500)).toBe('-500c');
    });

    it('shows a debt of exactly one gold as "-1g 0s 0c", not "0c"', () => {
      expect(formatCurrencyDisplay(-COPPER_PER_GOLD)).toBe('-1g 0s 0c');
    });

    it('shows a debt spanning gold, silver, and copper', () => {
      const total = COPPER_PER_GOLD * 2 + COPPER_PER_SILVER * 7 + 42;
      expect(formatCurrencyDisplay(-total)).toBe('-2g 7s 42c');
    });
  });
});
