import { describe, it, expect } from 'vitest';
import { parseBalanceConstants } from '../tools/balanceConfigReader.js';

describe('parseBalanceConstants', () => {
  it('parses a numeric constant', () => {
    const source = `export const TICK_INTERVAL_MS = 1000;`;
    const result = parseBalanceConstants(source);
    expect(result).toHaveLength(1);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(result[0]!).toMatchObject({ name: 'TICK_INTERVAL_MS', rawValue: '1000' });
  });

  it('parses multiple constants', () => {
    const source = `
export const FOO = 42;
export const BAR = 100;
`;
    const result = parseBalanceConstants(source);
    expect(result).toHaveLength(2);
    expect(result.map((c) => c.name)).toEqual(['FOO', 'BAR']);
  });

  it('captures inline comment', () => {
    const source = `export const GOLD_EARN = 0; // stub`;
    const result = parseBalanceConstants(source);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(result[0]!.comment).toBe('stub');
  });

  it('captures preceding single-line comment when no inline comment', () => {
    const source = `
// Duration of one tick in ms
export const TICK_INTERVAL_MS = 1000;
`;
    const result = parseBalanceConstants(source);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(result[0]!.comment).toBe('Duration of one tick in ms');
  });

  it('parses typed constant (ReadonlyArray<string>)', () => {
    const source = `export const PRESTIGE_ELIGIBLE_TIERS: ReadonlyArray<string> = ['C', 'B', 'A'];`;
    const result = parseBalanceConstants(source);
    expect(result).toHaveLength(1);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(result[0]!.name).toBe('PRESTIGE_ELIGIBLE_TIERS');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(result[0]!.rawValue).toContain("'C'");
  });

  it('filters by keyword (case-insensitive)', () => {
    const source = `
export const GOLD_EARN = 0;
export const TICK_INTERVAL_MS = 1000;
export const GOLD_COST = 0;
`;
    const constants = parseBalanceConstants(source);
    const keyword = 'GOLD';
    const filtered = constants.filter((c) => c.name.toUpperCase().includes(keyword));
    expect(filtered).toHaveLength(2);
    expect(filtered.every((c) => c.name.includes('GOLD'))).toBe(true);
  });

  it('returns empty array for source with no exports', () => {
    const source = `// just a comment\nconst internal = 5;`;
    expect(parseBalanceConstants(source)).toHaveLength(0);
  });
});

describe('balanceConfigReader handler', () => {
  it('returns content array on success', async () => {
    // Integration: handler reads the real balance.ts file
    const { balanceConfigReader } = await import('../tools/balanceConfigReader.js');
    const result = await balanceConfigReader.handler({ filter: undefined });
    expect(result.content).toHaveLength(1);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const item = result.content[0]!;
    expect(item.type).toBe('text');
    const parsed = JSON.parse(item.text) as { count: number; constants: unknown[] };
    expect(parsed).toHaveProperty('count');
    expect(parsed).toHaveProperty('constants');
    expect(Array.isArray(parsed.constants)).toBe(true);
    expect(parsed.count).toBeGreaterThan(0);
  });

  it('filters constants by keyword', async () => {
    const { balanceConfigReader } = await import('../tools/balanceConfigReader.js');
    const result = await balanceConfigReader.handler({ filter: 'PRESTIGE' });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const parsed = JSON.parse(result.content[0]!.text) as { constants: { name: string }[] };
    expect(parsed.constants.every((c) => c.name.toUpperCase().includes('PRESTIGE'))).toBe(true);
  });
});
